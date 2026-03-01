import { NextRequest } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { generateStream } from "@/lib/claude";

export const maxDuration = 60;
import {
  buildCoachSystemPrompt,
  type BusinessRecord,
  type ChecklistProgress,
  type TaskSummary,
} from "@/lib/business-context";
import { getChecklistForSubtype } from "@/lib/checklist-data";
import { getLimit } from "@/lib/plans";

export async function POST(req: NextRequest) {
  const { businessId, message } = await req.json();

  if (!businessId || !message) {
    return new Response("Missing businessId or message", { status: 400 });
  }

  const db = createServerClient();

  // Fetch business
  const { data: business } = await db
    .from("businesses")
    .select("*")
    .eq("id", businessId)
    .single();

  if (!business) {
    return new Response("Business not found", { status: 404 });
  }

  // Check daily message limit
  const { data: profile } = await db
    .from("profiles")
    .select("plan")
    .eq("id", business.user_id)
    .single();

  const plan = profile?.plan || "free";
  const dailyLimit = getLimit(plan, "chatMessagesPerDay");

  if (dailyLimit !== Infinity) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { count } = await db
      .from("chat_messages")
      .select("id", { count: "exact", head: true })
      .eq("business_id", businessId)
      .eq("role", "user")
      .gte("created_at", today.toISOString());

    if ((count || 0) >= dailyLimit) {
      return new Response(
        JSON.stringify({
          error: "limit_reached",
          message: `You've reached your daily limit of ${dailyLimit} messages. Upgrade for more messages per day.`,
        }),
        { status: 429, headers: { "Content-Type": "application/json" } }
      );
    }
  }

  // Save user message
  await db.from("chat_messages").insert({
    business_id: businessId,
    role: "user",
    content: message,
  });

  // Fetch recent chat history (last 20 messages for context)
  const { data: history } = await db
    .from("chat_messages")
    .select("role, content")
    .eq("business_id", businessId)
    .order("created_at", { ascending: true })
    .limit(20);

  // Build checklist progress for coach context — merge DB status with static definitions
  const { data: checklistItems } = await db
    .from("checklist_items")
    .select("task_id, status")
    .eq("business_id", businessId);

  let progress: ChecklistProgress | undefined;
  if (checklistItems && checklistItems.length > 0) {
    const statusMap = new Map(checklistItems.map((t) => [t.task_id, t.status]));
    const definitions = getChecklistForSubtype(business.subtype || "freelance");

    // Build task summaries by merging DB status with static definitions
    const tasks: TaskSummary[] = definitions
      .filter((def) => statusMap.has(def.id))
      .map((def) => ({
        title: def.title,
        status: (statusMap.get(def.id) === "completed" ? "completed" : "pending") as "completed" | "pending",
        phase: def.phase,
      }));

    const completed = tasks.filter((t) => t.status === "completed").length;
    const total = tasks.length;

    // Find the first pending task to determine current phase and next task
    const nextTask = tasks.find((t) => t.status === "pending");
    const currentPhase = nextTask?.phase || tasks[tasks.length - 1]?.phase || 1;
    const phaseTitle = definitions.find((d) => d.phase === currentPhase)?.phaseTitle || "Launch Checklist";

    // Count tasks blocked by plan tier
    const userPlan = plan;
    const planOrder = ["free", "starter", "growth", "pro"];
    const userPlanIdx = planOrder.indexOf(userPlan);
    const blockedTasks = definitions.filter(
      (d) => statusMap.has(d.id) && statusMap.get(d.id) !== "completed" && planOrder.indexOf(d.requiredPlan) > userPlanIdx
    );

    progress = {
      currentPhase,
      phaseTitle,
      completedCount: completed,
      totalCount: total,
      pctComplete: total > 0 ? Math.round((completed / total) * 100) : 0,
      nextTaskTitle: nextTask?.title || "All tasks completed!",
      blockedCount: blockedTasks.length,
      blockedPlan: blockedTasks.length > 0 ? blockedTasks[0].requiredPlan : "",
      tasks,
    };
  }

  // Build system prompt with business context
  const systemPrompt = buildCoachSystemPrompt(
    business as unknown as BusinessRecord,
    progress
  );

  // Format messages for Claude
  const claudeMessages = (history || []).map((msg) => ({
    role: msg.role as "user" | "assistant",
    content: msg.content,
  }));

  // Stream response
  const stream = await generateStream(claudeMessages, systemPrompt);

  // Create a readable stream for the response
  const encoder = new TextEncoder();
  let fullResponse = "";

  const readable = new ReadableStream({
    async start(controller) {
      try {
        for await (const event of stream) {
          if (
            event.type === "content_block_delta" &&
            event.delta.type === "text_delta"
          ) {
            const text = event.delta.text;
            fullResponse += text;
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`));
          }
        }

        // Save assistant message after streaming completes
        await db.from("chat_messages").insert({
          business_id: businessId,
          role: "assistant",
          content: fullResponse,
        });

        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        controller.close();
      } catch {
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ error: "Stream error" })}\n\n`
          )
        );
        controller.close();
      }
    },
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
