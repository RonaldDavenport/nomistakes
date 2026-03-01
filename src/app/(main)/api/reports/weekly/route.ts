import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { executeAIAction, parseAIJson, InsufficientCreditsError } from "@/lib/ai-actions";
import { CREDIT_COSTS } from "@/lib/credits";

export const maxDuration = 300;

// POST /api/reports/weekly — generate a weekly AI business report
export async function POST(req: NextRequest) {
  const { businessId, userId } = await req.json();

  if (!businessId || !userId) {
    return NextResponse.json({ error: "businessId and userId required" }, { status: 400 });
  }

  const db = createServerClient();

  // Gather data for the report
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const [businessRes, postsRes, chatsRes, checklistRes] = await Promise.all([
    db.from("businesses").select("name, type, tagline, audience, status, created_at").eq("id", businessId).single(),
    db.from("blog_posts").select("id, title, status, created_at").eq("business_id", businessId).gte("created_at", weekAgo.toISOString()),
    db.from("chat_messages").select("id, created_at").eq("business_id", businessId).gte("created_at", weekAgo.toISOString()),
    db.from("checklist_items").select("id, title, completed, phase").eq("business_id", businessId),
  ]);

  const biz = businessRes.data;
  if (!biz) {
    return NextResponse.json({ error: "Business not found" }, { status: 404 });
  }

  const weekPosts = postsRes.data || [];
  const weekChats = chatsRes.data || [];
  const checklist = checklistRes.data || [];
  const completedTasks = checklist.filter((t) => t.completed).length;
  const totalTasks = checklist.length;

  try {
    const result = await executeAIAction({
      businessId,
      userId,
      action: "weekly_report",
      creditCost: CREDIT_COSTS.weekly_report,
      model: "claude-sonnet-4-5-20250929",
      maxTokens: 4096,
      systemPrompt: `You are a business advisor generating concise weekly progress reports. Be encouraging but honest. Focus on:
1. What was accomplished this week
2. Key metrics and progress
3. Top priority for next week
4. One actionable tip

Keep it brief — 3-4 short sections. No fluff.`,
      userPrompt: `Generate a weekly report for ${biz.name} (${biz.type} business).

This week's activity:
- Blog posts created: ${weekPosts.length}
- Blog posts published: ${weekPosts.filter((p) => p.status === "published").length}
- AI coach conversations: ${weekChats.length}
- Checklist progress: ${completedTasks}/${totalTasks} tasks completed
- Business created: ${new Date(biz.created_at as string).toLocaleDateString()}
- Days active: ${Math.floor((now.getTime() - new Date(biz.created_at as string).getTime()) / (1000 * 60 * 60 * 24))}

Return a JSON object:
{
  "summary": "2-3 sentence executive summary of the week",
  "highlights": ["Highlight 1", "Highlight 2"],
  "metrics": { "posts_created": number, "tasks_completed": number, "engagement_score": 0-100 },
  "next_week_priority": "The ONE thing to focus on next week",
  "tip": "One specific, actionable business tip",
  "mood": "growing" | "steady" | "needs_attention"
}

Return ONLY valid JSON.`,
    });

    const parsed = parseAIJson<{
      summary: string;
      highlights: string[];
      metrics: Record<string, number>;
      next_week_priority: string;
      tip: string;
      mood: string;
    }>(result.content);

    // Save report
    const periodStart = weekAgo.toISOString().split("T")[0];
    const periodEnd = now.toISOString().split("T")[0];

    const { data: report, error: dbError } = await db
      .from("weekly_reports")
      .insert({
        business_id: businessId,
        user_id: userId,
        period_start: periodStart,
        period_end: periodEnd,
        report: parsed,
        delivered_via: ["dashboard"],
      })
      .select()
      .single();

    if (dbError) {
      console.error("[reports/weekly] DB error:", dbError);
    }

    return NextResponse.json({
      report: report || { ...parsed, period_start: periodStart, period_end: periodEnd },
      creditsRemaining: result.creditsRemaining,
    });
  } catch (err) {
    if (err instanceof InsufficientCreditsError) {
      return NextResponse.json(
        { error: "insufficient_credits", required: err.required, available: err.available },
        { status: 402 }
      );
    }
    console.error("[reports/weekly] Error:", err);
    return NextResponse.json({ error: "Report generation failed" }, { status: 500 });
  }
}

// GET /api/reports/weekly?businessId=X — list past reports
export async function GET(req: NextRequest) {
  const businessId = req.nextUrl.searchParams.get("businessId");
  if (!businessId) {
    return NextResponse.json({ error: "businessId required" }, { status: 400 });
  }

  const db = createServerClient();
  const { data, error } = await db
    .from("weekly_reports")
    .select("*")
    .eq("business_id", businessId)
    .order("created_at", { ascending: false })
    .limit(10);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ reports: data || [] });
}
