import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { generateConcepts, generateBrand, generateSiteContent, generateBusinessPlan, generateNames } from "@/lib/claude";
import { generateBusinessImages } from "@/lib/images";

export const maxDuration = 60;

// POST /api/generate — handles all generation types
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action } = body;

    if (action === "concepts") {
      return handleConcepts(body);
    } else if (action === "build") {
      return handleBuild(body);
    } else if (action === "names") {
      return handleNames(body);
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err) {
    console.error("[generate] Error:", err);
    return NextResponse.json({ error: "Generation failed" }, { status: 500 });
  }
}

// Generate 3 business concepts from wizard inputs
async function handleConcepts(body: { skills: string[]; time: string; budget: string; bizType: string; subtype?: string }) {
  const { skills, time, budget, bizType, subtype } = body;

  if (!skills || !Array.isArray(skills) || skills.length === 0) {
    return NextResponse.json({ error: "At least one skill required" }, { status: 400 });
  }

  const result = await generateConcepts(skills, time, budget, bizType, subtype);

  let concepts;
  try {
    concepts = JSON.parse(result.content);
  } catch {
    // If Claude didn't return clean JSON, try extracting it
    const match = result.content.match(/\[[\s\S]*\]/);
    concepts = match ? JSON.parse(match[0]) : [];
  }

  return NextResponse.json({
    concepts,
    usage: { input: result.inputTokens, output: result.outputTokens, model: result.model },
  });
}

// Full build: brand + site content + business plan → save to Supabase
async function handleBuild(body: {
  userId: string;
  concept: {
    name: string;
    tagline: string;
    type: string;
    subtype?: string;
    desc: string;
    revenue: string;
    startup: string;
    audience: string;
  };
  skills: string[];
  time: string;
  budget: string;
  bizType: string;
  subtype?: string;
}) {
  const { userId, concept, skills, time, budget, bizType, subtype } = body;
  const resolvedSubtype = subtype || concept.subtype || "";
  const db = createServerClient();

  // Create slug
  const slug = concept.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  // 1. Generate brand + site content + business plan ALL in parallel
  // Site content only uses brand.tone which Claude infers from business context
  const [brandResult, siteResult, planResult] = await Promise.all([
    generateBrand(concept.name, concept.tagline, concept.type, concept.audience),
    generateSiteContent(
      concept.name, concept.tagline, concept.type, concept.desc, concept.audience, {}
    ),
    generateBusinessPlan(
      concept.name, concept.tagline, concept.type, concept.desc, concept.audience, concept.revenue, concept.startup
    ),
  ]);

  let brand;
  try {
    brand = JSON.parse(brandResult.content);
  } catch {
    const match = brandResult.content.match(/\{[\s\S]*\}/);
    brand = match ? JSON.parse(match[0]) : {};
  }

  let siteContent;
  try {
    siteContent = JSON.parse(siteResult.content);
  } catch {
    const match = siteResult.content.match(/\{[\s\S]*\}/);
    siteContent = match ? JSON.parse(match[0]) : {};
  }

  let businessPlan;
  try {
    businessPlan = JSON.parse(planResult.content);
  } catch {
    const match = planResult.content.match(/\{[\s\S]*\}/);
    businessPlan = match ? JSON.parse(match[0]) : {};
  }

  // 4. Save to Supabase
  const { data: business, error: dbError } = await db
    .from("businesses")
    .insert({
      user_id: userId,
      name: concept.name,
      slug,
      tagline: concept.tagline,
      type: concept.type,
      subtype: resolvedSubtype || null,
      status: "live",
      skills,
      time_commitment: time,
      budget,
      biz_type: bizType,
      brand,
      site_content: siteContent,
      business_plan: businessPlan,
      revenue_estimate: concept.revenue,
      startup_cost: concept.startup,
      audience: concept.audience,
      live_url: `/site/${slug}`,
    })
    .select()
    .single();

  if (dbError) {
    console.error("[generate] DB error:", dbError);
    return NextResponse.json({ error: "Failed to save business" }, { status: 500 });
  }

  // 5. Log generations for cost tracking (fire-and-forget)
  const generations = [
    { type: "concepts", ...brandResult },
    { type: "brand", ...brandResult },
    { type: "site_content", ...siteResult },
    { type: "business_plan", ...planResult },
  ];

  // Don't await — log in background
  Promise.all(
    generations.map((gen) =>
      db.from("generations").insert({
        business_id: business.id,
        user_id: userId,
        type: gen.type,
        model: gen.model,
        input_tokens: gen.inputTokens,
        output_tokens: gen.outputTokens,
      })
    )
  ).catch((err) => console.error("[generate] Logging error:", err));

  // 6. Generate images in background (don't block response)
  const productInfos = (siteContent.products || []).slice(0, 3).map((p: { name: string; desc: string }) => ({
    name: p.name,
    desc: p.desc,
  }));
  generateBusinessImages(
    slug,
    concept.name,
    concept.type,
    concept.tagline,
    (brand as { tone?: string }).tone || "professional",
    productInfos
  ).then((images) => {
    db.from("businesses")
      .update({ site_content: { ...siteContent, images } })
      .eq("id", business.id)
      .then(({ error }) => {
        if (error) console.error("[generate] Image DB update failed:", error);
        else console.log("[generate] Images generated and saved for", business.id);
      });
  }).catch((err) => {
    console.error("[generate] Image generation failed (non-fatal):", err);
  });

  return NextResponse.json({
    business,
    businessId: business.id,
    siteUrl: `/site/${slug}`,
  });
}

// Generate 5 alternative business names
async function handleNames(body: {
  currentName: string;
  type: string;
  audience: string;
  tagline: string;
}) {
  const { currentName, type, audience, tagline } = body;

  if (!currentName) {
    return NextResponse.json({ error: "currentName required" }, { status: 400 });
  }

  const result = await generateNames(currentName, type || "services", audience || "", tagline || "");

  let names;
  try {
    names = JSON.parse(result.content);
  } catch {
    const match = result.content.match(/\[[\s\S]*\]/);
    names = match ? JSON.parse(match[0]) : [];
  }

  return NextResponse.json({
    names,
    usage: { input: result.inputTokens, output: result.outputTokens, model: result.model },
  });
}
