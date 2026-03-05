import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { generateWithTools } from "@/lib/claude";
import { EDITOR_TOOLS, buildEditorSystemPrompt } from "@/lib/editor-tools";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { businessId, prompt, currentContent, businessContext } = body;

  if (!businessId || !prompt || !currentContent) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  const db = createServerClient();
  const { data: business, error: bizErr } = await db
    .from("businesses")
    .select("id, site_regen_count, user_id")
    .eq("id", businessId)
    .single();

  if (bizErr || !business) {
    return NextResponse.json({ error: "Business not found" }, { status: 404 });
  }

  // Site regen gate: first AI edit is free; subsequent edits require credits or paid plan
  const regenCount = business.site_regen_count || 0;
  if (regenCount > 0 && business.user_id) {
    const { data: profile } = await db
      .from("profiles")
      .select("plan, trial_ends_at")
      .eq("id", business.user_id)
      .single();
    const isOnTrial = profile?.plan === "free" && profile?.trial_ends_at && new Date(profile.trial_ends_at) > new Date();
    const hasPaidPlan = profile?.plan === "solo" || profile?.plan === "scale";
    if (!hasPaidPlan && isOnTrial) {
      return NextResponse.json(
        { error: "site_regen_limit", message: "Trial includes 1 free AI site edit. Upgrade to Solo or buy credits for more." },
        { status: 402 }
      );
    }
  }

  // Track regen count (increment on each AI edit call)
  await db.from("businesses")
    .update({ site_regen_count: regenCount + 1 })
    .eq("id", businessId);

  const systemPrompt = buildEditorSystemPrompt({
    name: businessContext?.name || "a business",
    tagline: businessContext?.tagline,
    type: businessContext?.type,
    audience: businessContext?.audience,
    tone: (currentContent.brand as { tone?: string })?.tone,
  });

  const userPrompt = `Current website data:

SITE CONTENT:
${JSON.stringify(currentContent.site_content)}

BRAND:
${JSON.stringify(currentContent.brand)}

USER REQUEST: "${prompt}"`;

  try {
    const result = await generateWithTools(
      userPrompt,
      systemPrompt,
      EDITOR_TOOLS,
      "claude-sonnet-4-5-20250929",
      8192
    );

    // Log generation for cost tracking
    try {
      await db.from("generations").insert({
        business_id: businessId,
        type: "site_edit",
        model: result.model,
        input_tokens: result.inputTokens,
        output_tokens: result.outputTokens,
        duration_ms: 0,
      });
    } catch {
      /* ignore logging errors */
    }

    // Process tool calls into actions
    const actions: Record<string, unknown>[] = [];

    for (const call of result.toolCalls) {
      switch (call.name) {
        case "edit_content":
          actions.push({
            type: "content_edit",
            site_content: call.input.site_content,
            brand: call.input.brand || null,
            summary: call.input.summary as string,
          });
          break;

        case "generate_image":
          actions.push({
            type: "image_generating",
            slot: call.input.slot,
            imagePrompt: call.input.prompt,
            summary: call.input.summary as string,
          });
          break;

        case "generate_video":
          actions.push({
            type: "video_generating",
            style: call.input.style,
            topic: call.input.topic,
            talking_points: call.input.talking_points,
            summary: call.input.summary as string,
          });
          break;

        case "embed_video":
          actions.push({
            type: "video_embed",
            video_url: call.input.video_url,
            summary: call.input.summary as string,
          });
          break;

        case "audit_site":
          actions.push({
            type: "audit",
            findings: call.input.findings,
            overall_score: call.input.overall_score,
            summary: call.input.summary as string,
          });
          break;

        case "create_blog_post":
          actions.push({
            type: "blog_created",
            title: call.input.title,
            slug: call.input.slug,
            content: call.input.content,
            meta_description: call.input.meta_description,
            keywords: call.input.keywords,
            summary: call.input.summary as string,
          });
          break;
      }
    }

    // If no tool calls but text response, treat as conversational
    if (actions.length === 0 && result.textContent) {
      actions.push({
        type: "message",
        text: result.textContent,
        summary: "AI response",
      });
    }

    // If still nothing, return a fallback
    if (actions.length === 0) {
      actions.push({
        type: "message",
        text: "I wasn't sure what to do with that request. Try being more specific about what you'd like to change.",
        summary: "No action taken",
      });
    }

    return NextResponse.json({ actions });
  } catch (err) {
    console.error("[site-edit] AI generation failed:", err);
    return NextResponse.json(
      { error: "Failed to generate edits. Please try again." },
      { status: 500 }
    );
  }
}
