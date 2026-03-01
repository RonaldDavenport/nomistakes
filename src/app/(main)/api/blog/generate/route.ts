import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { executeAIAction, parseAIJson, InsufficientCreditsError } from "@/lib/ai-actions";
import { CREDIT_COSTS } from "@/lib/credits";

export const maxDuration = 300;

// POST /api/blog/generate — AI-generate a blog post
export async function POST(req: NextRequest) {
  const { businessId, userId, topic, keywords, tone, wordCount } = await req.json();

  if (!businessId || !userId || !topic) {
    return NextResponse.json({ error: "businessId, userId, and topic required" }, { status: 400 });
  }

  try {
    const result = await executeAIAction({
      businessId,
      userId,
      action: "blog_post",
      creditCost: CREDIT_COSTS.blog_post,
      model: "claude-sonnet-4-5-20250929",
      maxTokens: 8192,
      systemPrompt: `You are a world-class content marketer and SEO writer. Write blog posts that are:
- Well-structured with H2 and H3 headings
- SEO-optimized with natural keyword usage
- Engaging and actionable — not generic filler
- Written at an 8th grade reading level
- Formatted in clean Markdown

Always include:
1. An attention-grabbing intro (2-3 sentences)
2. Clear H2 sections with practical content
3. A strong conclusion with a CTA
4. Internal linking opportunities noted as [INTERNAL LINK: topic]

Never use: "In today's fast-paced world", "leverage", "unlock", "game-changer", "cutting-edge"`,
      userPrompt: `Write a comprehensive blog post about: "${topic}"

${keywords ? `Target keywords: ${keywords}` : ""}
${tone ? `Tone: ${tone}` : "Match the brand's voice"}
Target length: ${wordCount || 1500} words

Return a JSON object with:
- title: SEO-optimized title (under 60 chars)
- slug: URL-friendly slug (lowercase, hyphens)
- content: Full blog post in Markdown format
- meta_description: SEO meta description (under 155 chars)
- keywords: Array of 5-8 target keywords
- estimated_read_time: Estimated minutes to read

Return ONLY valid JSON, no other text.`,
    });

    const parsed = parseAIJson<{
      title: string;
      slug: string;
      content: string;
      meta_description: string;
      keywords: string[];
      estimated_read_time: number;
    }>(result.content);

    // Save to database
    const db = createServerClient();
    const wordCountActual = parsed.content.split(/\s+/).filter(Boolean).length;

    const { data: post, error: dbError } = await db
      .from("blog_posts")
      .insert({
        business_id: businessId,
        user_id: userId,
        title: parsed.title,
        slug: parsed.slug,
        content: parsed.content,
        body_markdown: parsed.content,
        meta_description: parsed.meta_description,
        keywords: parsed.keywords,
        word_count: wordCountActual,
        estimated_read_time: parsed.estimated_read_time || Math.ceil(wordCountActual / 250),
        seo_score: 75, // Default — will be refined by SEO audit
        ai_generated: true,
        generation_metadata: {
          topic,
          model: result.model,
          inputTokens: result.inputTokens,
          outputTokens: result.outputTokens,
        },
        status: "draft",
      })
      .select()
      .single();

    if (dbError) {
      console.error("[blog/generate] DB error:", dbError);
      return NextResponse.json({ error: "Failed to save blog post" }, { status: 500 });
    }

    return NextResponse.json({
      post,
      creditsRemaining: result.creditsRemaining,
      usage: { input: result.inputTokens, output: result.outputTokens, model: result.model },
    });
  } catch (err) {
    if (err instanceof InsufficientCreditsError) {
      return NextResponse.json(
        { error: "insufficient_credits", required: err.required, available: err.available },
        { status: 402 }
      );
    }
    console.error("[blog/generate] Error:", err);
    return NextResponse.json({ error: "Blog generation failed" }, { status: 500 });
  }
}
