import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { executeAIAction, parseAIJson, InsufficientCreditsError } from "@/lib/ai-actions";
import { CREDIT_COSTS } from "@/lib/credits";

export const maxDuration = 300;

// POST /api/email-sequences/generate — AI-generate an email sequence
export async function POST(req: NextRequest) {
  const { businessId, userId, sequenceType, emailCount, tone, goal } = await req.json();

  if (!businessId || !userId || !sequenceType) {
    return NextResponse.json({ error: "businessId, userId, and sequenceType required" }, { status: 400 });
  }

  try {
    const result = await executeAIAction({
      businessId,
      userId,
      action: "email_sequence",
      creditCost: CREDIT_COSTS.email_sequence,
      model: "claude-sonnet-4-5-20250929",
      maxTokens: 8192,
      systemPrompt: `You are an email marketing expert specializing in lifecycle email sequences. You write emails that:
- Have compelling subject lines (under 50 chars, no spam triggers)
- Use the brand's voice consistently
- Follow a logical nurture sequence
- Include clear CTAs in every email
- Are optimized for mobile reading (short paragraphs)

Sequence types you know:
- welcome: Onboarding new subscribers/customers (3-5 emails over 7 days)
- abandoned_cart: Re-engage cart abandoners (3 emails over 3 days)
- post_purchase: Delight and upsell after purchase (4 emails over 14 days)
- winback: Re-engage inactive users (3 emails over 10 days)
- newsletter: Weekly/monthly content roundup (template for 1 email)
- custom: Any custom sequence based on the goal`,
      userPrompt: `Create a ${sequenceType} email sequence.

${goal ? `Goal: ${goal}` : ""}
Number of emails: ${emailCount || "auto (choose the right amount)"}
${tone ? `Tone: ${tone}` : "Match the brand voice"}

Return a JSON object with:
{
  "sequence_name": "Name for this sequence",
  "sequence_type": "${sequenceType}",
  "emails": [
    {
      "order": 1,
      "subject": "Subject line",
      "preview_text": "Email preview text (under 90 chars)",
      "body_html": "Email body in clean HTML (use <p>, <h2>, <a>, <strong> only — no external CSS)",
      "delay_days": 0,
      "cta_text": "Button CTA text",
      "cta_url_placeholder": "{{cta_url}}"
    }
  ]
}

Return ONLY valid JSON, no other text.`,
    });

    const parsed = parseAIJson<{
      sequence_name: string;
      sequence_type: string;
      emails: Array<{
        order: number;
        subject: string;
        preview_text: string;
        body_html: string;
        delay_days: number;
        cta_text: string;
        cta_url_placeholder: string;
      }>;
    }>(result.content);

    // Save to database
    const db = createServerClient();
    const { data: sequence, error: dbError } = await db
      .from("email_sequences")
      .insert({
        business_id: businessId,
        user_id: userId,
        sequence_name: parsed.sequence_name,
        sequence_type: parsed.sequence_type || sequenceType,
        emails: parsed.emails,
        status: "draft",
      })
      .select()
      .single();

    if (dbError) {
      console.error("[email-sequences/generate] DB error:", dbError);
      return NextResponse.json({ error: "Failed to save sequence" }, { status: 500 });
    }

    return NextResponse.json({
      sequence,
      creditsRemaining: result.creditsRemaining,
    });
  } catch (err) {
    if (err instanceof InsufficientCreditsError) {
      return NextResponse.json(
        { error: "insufficient_credits", required: err.required, available: err.available },
        { status: 402 }
      );
    }
    console.error("[email-sequences/generate] Error:", err);
    return NextResponse.json({ error: "Email sequence generation failed" }, { status: 500 });
  }
}
