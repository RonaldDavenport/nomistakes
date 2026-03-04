import { NextRequest, NextResponse } from "next/server";
import { executeAIAction, parseAIJson, InsufficientCreditsError } from "@/lib/ai-actions";

// POST /api/email/templates/generate — AI-generate an email template
export async function POST(req: NextRequest) {
  const { businessId, userId, purpose, tone } = await req.json();

  if (!businessId || !userId || !purpose) {
    return NextResponse.json({ error: "businessId, userId, and purpose are required" }, { status: 400 });
  }

  try {
    const result = await executeAIAction({
      businessId,
      userId,
      action: "email_template_generate",
      creditCost: 3,
      model: "claude-haiku-4-5-20251001",
      systemPrompt: `You are an email copywriter. Generate a professional email template.
The tone should be ${tone || "professional"}.
Return a JSON object with:
- name: Template name
- subject: Email subject line (can include {{variables}})
- body_html: HTML email body (use {{name}} and {{business_name}} as variables)
- variables: Array of variable names used

Return ONLY valid JSON, no other text.`,
      userPrompt: `Generate an email template for: ${purpose}`,
      maxTokens: 2048,
    });

    const template = parseAIJson<{
      name: string;
      subject: string;
      body_html: string;
      variables: string[];
    }>(result.content);

    return NextResponse.json({
      template,
      creditsRemaining: result.creditsRemaining,
    });
  } catch (err) {
    if (err instanceof InsufficientCreditsError) {
      return NextResponse.json({ error: "Insufficient credits", required: err.required, available: err.available }, { status: 402 });
    }
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
