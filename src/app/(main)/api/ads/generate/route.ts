import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { executeAIAction, parseAIJson, InsufficientCreditsError } from "@/lib/ai-actions";
import { CREDIT_COSTS } from "@/lib/credits";

export const maxDuration = 300;

// POST /api/ads/generate — AI-generate ad copy + campaign
export async function POST(req: NextRequest) {
  const { businessId, userId, platforms, objective, productOrService, targetAudience } = await req.json();

  if (!businessId || !userId || !platforms || !objective) {
    return NextResponse.json({ error: "businessId, userId, platforms, and objective required" }, { status: 400 });
  }

  try {
    const result = await executeAIAction({
      businessId,
      userId,
      action: "ad_copy",
      creditCost: CREDIT_COSTS.ad_copy,
      model: "claude-sonnet-4-5-20250929",
      maxTokens: 8192,
      systemPrompt: `You are a performance marketing expert who writes high-converting ad copy for Meta (Facebook/Instagram), TikTok, and Google Ads. You understand:
- Platform-specific best practices (character limits, formats, hooks)
- Direct response copywriting principles
- How to write hooks that stop the scroll
- How to write CTAs that drive action

Rules:
- TikTok: casual, trend-aware, hook in first 2 seconds of script
- Meta: benefit-driven, social proof, urgency
- Google: keyword-rich, specific, match search intent
- Never use generic phrases like "Don't miss out!" or "Limited time offer!"
- Include specific numbers and outcomes when possible`,
      userPrompt: `Create ad copy for these platforms: ${platforms.join(", ")}

Campaign objective: ${objective}
${productOrService ? `Product/Service: ${productOrService}` : ""}
${targetAudience ? `Target audience: ${targetAudience}` : ""}

For EACH platform, generate 3 ad variations. Return a JSON object with:
{
  "campaign_name": "Auto-generated campaign name",
  "variations": [
    {
      "platform": "meta" | "tiktok" | "google",
      "headline": "Headline text",
      "primary_text": "Main ad body copy",
      "description": "Link description / short text",
      "cta": "Call to action button text",
      "hashtags": ["relevant", "hashtags"],
      "format": "feed" | "story" | "reel" | "search" | "display",
      "hook": "First line / scroll-stopping hook"
    }
  ]
}

Return ONLY valid JSON, no other text.`,
    });

    const parsed = parseAIJson<{
      campaign_name: string;
      variations: Array<{
        platform: string;
        headline: string;
        primary_text: string;
        description: string;
        cta: string;
        hashtags: string[];
        format: string;
        hook?: string;
      }>;
    }>(result.content);

    // Save campaign and variations
    const db = createServerClient();

    const { data: campaign, error: campError } = await db
      .from("ad_campaigns")
      .insert({
        business_id: businessId,
        user_id: userId,
        campaign_name: parsed.campaign_name || `${objective} Campaign`,
        platforms,
        objective,
        product_or_service: productOrService || null,
        targeting: targetAudience ? { audience: targetAudience } : null,
        status: "draft",
      })
      .select()
      .single();

    if (campError) {
      console.error("[ads/generate] Campaign DB error:", campError);
      return NextResponse.json({ error: "Failed to save campaign" }, { status: 500 });
    }

    // Insert all variations
    if (parsed.variations && parsed.variations.length > 0) {
      const variationRows = parsed.variations.map((v) => ({
        campaign_id: campaign.id,
        platform: v.platform,
        headline: v.headline,
        primary_text: v.primary_text,
        description: v.description,
        cta: v.cta,
        hashtags: v.hashtags || [],
        format: v.format || "feed",
      }));

      await db.from("ad_variations").insert(variationRows);
    }

    return NextResponse.json({
      campaign,
      variations: parsed.variations,
      creditsRemaining: result.creditsRemaining,
    });
  } catch (err) {
    if (err instanceof InsufficientCreditsError) {
      return NextResponse.json(
        { error: "insufficient_credits", required: err.required, available: err.available },
        { status: 402 }
      );
    }
    console.error("[ads/generate] Error:", err);
    return NextResponse.json({ error: "Ad generation failed" }, { status: 500 });
  }
}
