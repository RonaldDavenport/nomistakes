import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { executeAIAction, parseAIJson, InsufficientCreditsError } from "@/lib/ai-actions";
import { CREDIT_COSTS } from "@/lib/credits";

export const maxDuration = 300;

// POST /api/seo/audit — run an AI-powered SEO audit on the business site
export async function POST(req: NextRequest) {
  const { businessId, userId } = await req.json();

  if (!businessId || !userId) {
    return NextResponse.json({ error: "businessId and userId required" }, { status: 400 });
  }

  const db = createServerClient();

  // Get business + site content for audit
  const { data: biz } = await db
    .from("businesses")
    .select("name, type, tagline, audience, site_content, brand, slug, deployed_url")
    .eq("id", businessId)
    .single();

  if (!biz) {
    return NextResponse.json({ error: "Business not found" }, { status: 404 });
  }

  // Get existing blog posts for content audit
  const { data: posts } = await db
    .from("blog_posts")
    .select("title, slug, meta_description, keywords, seo_score, status")
    .eq("business_id", businessId)
    .limit(20);

  try {
    const siteContent = biz.site_content as Record<string, unknown>;
    const brand = biz.brand as Record<string, unknown>;

    const result = await executeAIAction({
      businessId,
      userId,
      action: "seo_audit",
      creditCost: CREDIT_COSTS.seo_audit,
      model: "claude-sonnet-4-5-20250929",
      maxTokens: 8192,
      systemPrompt: `You are an SEO expert who conducts comprehensive site audits. Analyze the site content and provide actionable recommendations. Focus on:
1. On-page SEO (titles, descriptions, headings, keyword usage)
2. Content quality and gaps
3. Technical SEO basics
4. Keyword opportunities
5. Content strategy recommendations

Be specific with scores and recommendations. Don't use vague advice.`,
      userPrompt: `Audit this business website for SEO:

Business: ${biz.name}
Type: ${biz.type}
Audience: ${biz.audience}
Tagline: ${biz.tagline}
Site URL: ${biz.deployed_url || `/site/${biz.slug}`}

SITE CONTENT:
- Hero: ${JSON.stringify((siteContent?.hero as Record<string, unknown>) || {})}
- SEO: ${JSON.stringify((siteContent?.seo as Record<string, unknown>) || {})}
- Products: ${JSON.stringify((siteContent?.products as unknown[])?.slice(0, 3) || [])}
- FAQ count: ${(siteContent?.faq as unknown[])?.length || 0}

BLOG POSTS (${posts?.length || 0} total):
${posts?.map((p) => `- "${p.title}" (${p.status}) — keywords: ${(p.keywords as string[])?.join(", ") || "none"}`).join("\n") || "No blog posts yet."}

BRAND: Tone = ${(brand?.tone as string) || "unknown"}

Return a JSON object:
{
  "overall_score": 0-100,
  "pages_audited": number,
  "issues": [
    { "severity": "high" | "medium" | "low", "category": "on_page" | "content" | "technical" | "keywords", "title": "Issue title", "description": "What's wrong", "fix": "How to fix it" }
  ],
  "keyword_opportunities": [
    { "keyword": "keyword phrase", "search_volume": "high" | "medium" | "low", "competition": "high" | "medium" | "low", "recommendation": "How to target this keyword" }
  ],
  "content_gaps": ["Topic 1 to write about", "Topic 2"],
  "quick_wins": ["Easy fix 1", "Easy fix 2", "Easy fix 3"]
}

Return ONLY valid JSON.`,
    });

    const parsed = parseAIJson<{
      overall_score: number;
      pages_audited: number;
      issues: Array<{ severity: string; category: string; title: string; description: string; fix: string }>;
      keyword_opportunities: Array<{ keyword: string; search_volume: string; competition: string; recommendation: string }>;
      content_gaps: string[];
      quick_wins: string[];
    }>(result.content);

    // Save audit
    const { data: audit, error: auditError } = await db
      .from("seo_audits")
      .insert({
        business_id: businessId,
        user_id: userId,
        overall_score: parsed.overall_score,
        pages_audited: parsed.pages_audited,
        issues: parsed.issues,
        keyword_opportunities: parsed.keyword_opportunities,
      })
      .select()
      .single();

    if (auditError) {
      console.error("[seo/audit] DB error:", auditError);
    }

    // Save keyword opportunities
    if (parsed.keyword_opportunities && parsed.keyword_opportunities.length > 0) {
      const keywordRows = parsed.keyword_opportunities.map((k) => ({
        business_id: businessId,
        keyword: k.keyword,
        search_volume_estimate: k.search_volume,
        competition: k.competition,
        is_primary: false,
      }));

      await db.from("seo_keywords").insert(keywordRows);
    }

    return NextResponse.json({
      audit: audit || parsed,
      contentGaps: parsed.content_gaps,
      quickWins: parsed.quick_wins,
      creditsRemaining: result.creditsRemaining,
    });
  } catch (err) {
    if (err instanceof InsufficientCreditsError) {
      return NextResponse.json(
        { error: "insufficient_credits", required: err.required, available: err.available },
        { status: 402 }
      );
    }
    console.error("[seo/audit] Error:", err);
    return NextResponse.json({ error: "SEO audit failed" }, { status: 500 });
  }
}
