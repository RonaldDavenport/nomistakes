import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { generate } from "@/lib/claude";

export const maxDuration = 30;

export async function POST(req: NextRequest) {
  const { businessId, siteContent, brand, businessContext } = await req.json();

  if (!businessId || !siteContent) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const db = createServerClient();
  const { data: business, error: bizErr } = await db
    .from("businesses")
    .select("id")
    .eq("id", businessId)
    .single();

  if (bizErr || !business) {
    return NextResponse.json({ error: "Business not found" }, { status: 404 });
  }

  try {
    const result = await generate(
      `Analyze this website for "${businessContext?.name || "a business"}" and give exactly 3 quick, high-impact recommendations to improve it.

SITE CONTENT:
${JSON.stringify(siteContent).slice(0, 4000)}

BRAND:
${JSON.stringify(brand).slice(0, 500)}

Return a JSON array of exactly 3 objects. Each object must have:
- "title": short title (5-8 words)
- "description": one sentence explaining the issue
- "action": the exact prompt to type in the AI editor to fix it (imperative form, e.g. "Make the hero headline shorter and more urgent")
- "severity": "critical" | "important" | "suggestion"
- "section": which section this applies to (hero, about, products, etc.)

Prioritize: weak headlines, missing social proof, unclear CTAs, generic copy, poor SEO.
Return ONLY valid JSON array, no other text.`,
      `You are a conversion rate optimization expert. Give specific, actionable website improvement recommendations. Be direct and brief. Focus on changes that will increase signups, sales, or engagement.`,
      "claude-haiku-4-5-20251001",
      1024
    );

    let recommendations = [];
    try {
      const parsed = JSON.parse(result.content);
      recommendations = Array.isArray(parsed) ? parsed.slice(0, 3) : [];
    } catch {
      recommendations = [];
    }

    return NextResponse.json({ recommendations });
  } catch (err) {
    console.error("[recommendations] Failed:", err);
    return NextResponse.json({ recommendations: [] });
  }
}
