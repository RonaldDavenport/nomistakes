import { NextRequest } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { supabase } from "@/lib/supabase";
import { generateStream } from "@/lib/claude";
import {
  buildCoachSystemPrompt,
  type BusinessRecord,
  type ChecklistProgress,
} from "@/lib/business-context";
import { getPlan, getLimit } from "@/lib/plans";

export async function POST(req: NextRequest) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { businessId, message } = await req.json();

  if (!businessId || !message) {
    return new Response("Missing businessId or message", { status: 400 });
  }

  const db = createServerClient();

  // Fetch business + verify ownership
  const { data: business } = await db
    .from("businesses")
    .select("*")
    .eq("id", businessId)
    .eq("user_id", user.id)
    .single();

  if (!business) {
    return new Response("Business not found", { status: 404 });
  }

  // Check daily message limit
  const { data: profile } = await db
    .from("profiles")
    .select("plan")
    .eq("id", user.id)
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
      const upgradePlan = getPlan(plan === "free" ? "starter" : "growth");
      return new Response(
        JSON.stringify({
          error: "limit_reached",
          message: `You've reached your daily limit of ${dailyLimit} messages. Upgrade to ${upgradePlan.name} for ${dailyLimit === 10 ? "50" : "200"} messages/day.`,
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

  // Build checklist progress for coach context
  const { data: checklistItems } = await db
    .from("checklist_items")
    .select("status")
    .eq("business_id", businessId);

  let progress: ChecklistProgress | undefined;
  if (checklistItems && checklistItems.length > 0) {
    const completed = checklistItems.filter((t) => t.status === "completed").length;
    const total = checklistItems.length;
    progress = {
      currentPhase: 1,
      phaseTitle: "Launch Checklist",
      completedCount: completed,
      totalCount: total,
      pctComplete: Math.round((completed / total) * 100),
      nextTaskTitle: "Continue with your checklist",
      blockedCount: 0,
      blockedPlan: "",
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
      } catch (err) {
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
