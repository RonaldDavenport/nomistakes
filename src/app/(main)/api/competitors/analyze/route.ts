import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { executeAIAction, parseAIJson, InsufficientCreditsError } from "@/lib/ai-actions";
import { CREDIT_COSTS } from "@/lib/credits";

export const maxDuration = 300;

// POST /api/competitors/analyze — add + analyze a competitor
export async function POST(req: NextRequest) {
  const { businessId, userId, competitorName, competitorUrl } = await req.json();

  if (!businessId || !userId || !competitorName || !competitorUrl) {
    return NextResponse.json(
      { error: "businessId, userId, competitorName, and competitorUrl required" },
      { status: 400 }
    );
  }

  try {
    const result = await executeAIAction({
      businessId,
      userId,
      action: "competitor_analysis",
      creditCost: CREDIT_COSTS.competitor_analysis,
      model: "claude-sonnet-4-5-20250929",
      maxTokens: 8192,
      systemPrompt: `You are a competitive intelligence analyst. When given a competitor's name and URL, you:
1. Analyze their positioning, messaging, and value proposition
2. Identify their strengths and weaknesses
3. Find opportunities the user's business can exploit
4. Compare pricing strategies
5. Suggest differentiation tactics

Be specific and actionable. Base analysis on the competitor's name, URL, and typical industry patterns.`,
      userPrompt: `Analyze this competitor:
- Name: ${competitorName}
- URL: ${competitorUrl}

Compare them against our business and identify opportunities.

Return a JSON object:
{
  "industry": "Their industry/niche",
  "positioning": "How they position themselves (1-2 sentences)",
  "strengths": ["Strength 1", "Strength 2", "Strength 3"],
  "weaknesses": ["Weakness 1", "Weakness 2", "Weakness 3"],
  "pricing_strategy": "Their pricing approach",
  "key_differentiators": ["What makes them unique 1", "What makes them unique 2"],
  "opportunities": ["How we can beat them 1", "How we can beat them 2", "How we can beat them 3"],
  "threat_level": "low" | "medium" | "high",
  "recommended_actions": ["Action 1", "Action 2", "Action 3"]
}

Return ONLY valid JSON.`,
    });

    const parsed = parseAIJson<{
      industry: string;
      positioning: string;
      strengths: string[];
      weaknesses: string[];
      pricing_strategy: string;
      key_differentiators: string[];
      opportunities: string[];
      threat_level: string;
      recommended_actions: string[];
    }>(result.content);

    // Save competitor
    const db = createServerClient();
    const { data: competitor, error: compError } = await db
      .from("competitors")
      .insert({
        business_id: businessId,
        user_id: userId,
        name: competitorName,
        url: competitorUrl,
        industry: parsed.industry,
        baseline_data: parsed,
        is_active: true,
        last_checked_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (compError) {
      console.error("[competitors/analyze] DB error:", compError);
      return NextResponse.json({ error: "Failed to save competitor" }, { status: 500 });
    }

    // Save initial snapshot
    await db.from("competitor_snapshots").insert({
      competitor_id: competitor.id,
      snapshot_type: "full_crawl",
      data: parsed,
    });

    return NextResponse.json({
      competitor,
      analysis: parsed,
      creditsRemaining: result.creditsRemaining,
    });
  } catch (err) {
    if (err instanceof InsufficientCreditsError) {
      return NextResponse.json(
        { error: "insufficient_credits", required: err.required, available: err.available },
        { status: 402 }
      );
    }
    console.error("[competitors/analyze] Error:", err);
    return NextResponse.json({ error: "Competitor analysis failed" }, { status: 500 });
  }
}
