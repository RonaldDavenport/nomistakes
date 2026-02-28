import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { generate } from "@/lib/claude";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { businessId, prompt, currentContent, businessContext } = body;

  if (!businessId || !prompt || !currentContent) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  // Verify business exists
  const db = createServerClient();
  const { data: business, error: bizErr } = await db
    .from("businesses")
    .select("id")
    .eq("id", businessId)
    .single();

  if (bizErr || !business) {
    return NextResponse.json({ error: "Business not found" }, { status: 404 });
  }

  const systemPrompt = `You are a website content editor for "${businessContext?.name || "a business"}".
You receive the current site_content and brand objects and a user request.
Return a JSON object with these keys:
- site_content: the COMPLETE updated site_content (preserve every field the user didn't ask to change)
- brand: the COMPLETE updated brand object (only include if the user asked to change brand/colors/fonts — otherwise omit this key)
- summary: a 1-sentence description of what you changed

RULES:
1. Return valid JSON only. No markdown fences, no explanation outside the JSON.
2. Preserve ALL fields and array items that the user didn't mention — return the full objects, not partials.
3. For text changes: write outcome-focused copy. No generic filler ("passionate", "unlock", "leverage"). Be specific.
4. For array sections (features, products, testimonials, faq): you may add, remove, or reorder items as requested.
5. Products must keep a valid slug (lowercase-hyphens).
6. Colors must be valid hex codes (e.g., "#4c6ef5").
7. Keep prices realistic for the business type (${businessContext?.type || "services"}).
8. Write at an 8th grade reading level. Short sentences. Active voice.
9. The brand tone is: ${(currentContent.brand as { tone?: string })?.tone || "professional"}.
10. Target audience: ${businessContext?.audience || "general"}.`;

  const userPrompt = `Here is the current website content:

SITE CONTENT:
${JSON.stringify(currentContent.site_content, null, 2)}

BRAND:
${JSON.stringify(currentContent.brand, null, 2)}

USER REQUEST: "${prompt}"

Return the updated JSON object with site_content, optionally brand, and summary.`;

  try {
    const result = await generate(
      userPrompt,
      systemPrompt,
      "claude-sonnet-4-5-20250929",
      8192
    );

    // Parse JSON from response
    let parsed;
    try {
      parsed = JSON.parse(result.content);
    } catch {
      // Try extracting JSON from markdown fences
      const match = result.content.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (match) {
        parsed = JSON.parse(match[1].trim());
      } else {
        // Try finding first { to last }
        const start = result.content.indexOf("{");
        const end = result.content.lastIndexOf("}");
        if (start !== -1 && end > start) {
          parsed = JSON.parse(result.content.slice(start, end + 1));
        } else {
          throw new Error("Could not parse AI response as JSON");
        }
      }
    }

    if (!parsed.site_content) {
      return NextResponse.json({ error: "AI response missing site_content" }, { status: 422 });
    }

    // Log generation for cost tracking (best-effort)
    try {
      await db.from("generations").insert({
        business_id: businessId,
        type: "site_edit",
        model: result.model,
        input_tokens: result.inputTokens,
        output_tokens: result.outputTokens,
        duration_ms: 0,
      });
    } catch { /* ignore logging errors */ }

    return NextResponse.json({
      site_content: parsed.site_content,
      brand: parsed.brand || null,
      summary: parsed.summary || "Content updated",
    });
  } catch (err) {
    console.error("[site-edit] AI generation failed:", err);
    return NextResponse.json(
      { error: "Failed to generate edits. Please try again." },
      { status: 500 }
    );
  }
}