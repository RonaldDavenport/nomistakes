import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { generateConcepts, generateBrand, generateSiteContent, generateBusinessPlan } from "@/lib/claude";

// POST /api/generate — handles all generation types
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action } = body;

    if (action === "concepts") {
      return handleConcepts(body);
    } else if (action === "build") {
      return handleBuild(body);
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err) {
    console.error("[generate] Error:", err);
    return NextResponse.json({ error: "Generation failed" }, { status: 500 });
  }
}

// Generate 3 business concepts from wizard inputs
async function handleConcepts(body: { skills: string[]; time: string; budget: string; bizType: string }) {
  const { skills, time, budget, bizType } = body;

  if (!skills || !Array.isArray(skills) || skills.length === 0) {
    return NextResponse.json({ error: "At least one skill required" }, { status: 400 });
  }

  const result = await generateConcepts(skills, time, budget, bizType);

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
    desc: string;
    revenue: string;
    startup: string;
    audience: string;
  };
  skills: string[];
  time: string;
  budget: string;
  bizType: string;
}) {
  const { userId, concept, skills, time, budget, bizType } = body;
  const db = createServerClient();

  // Create slug
  const slug = concept.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  // 1. Generate brand
  const brandResult = await generateBrand(concept.name, concept.tagline, concept.type, concept.audience);
  let brand;
  try {
    brand = JSON.parse(brandResult.content);
  } catch {
    const match = brandResult.content.match(/\{[\s\S]*\}/);
    brand = match ? JSON.parse(match[0]) : {};
  }

  // 2. Generate site content
  const siteResult = await generateSiteContent(
    concept.name, concept.tagline, concept.type, concept.desc, concept.audience, brand
  );
  let siteContent;
  try {
    siteContent = JSON.parse(siteResult.content);
  } catch {
    const match = siteResult.content.match(/\{[\s\S]*\}/);
    siteContent = match ? JSON.parse(match[0]) : {};
  }

  // 3. Generate business plan
  const planResult = await generateBusinessPlan(
    concept.name, concept.tagline, concept.type, concept.desc, concept.audience, concept.revenue, concept.startup
  );
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

  // 5. Log generations for cost tracking
  const generations = [
    { type: "concepts", ...brandResult },
    { type: "brand", ...brandResult },
    { type: "site_content", ...siteResult },
    { type: "business_plan", ...planResult },
  ];

  for (const gen of generations) {
    await db.from("generations").insert({
      business_id: business.id,
      user_id: userId,
      type: gen.type,
      model: gen.model,
      input_tokens: gen.inputTokens,
      output_tokens: gen.outputTokens,
    });
  }

  return NextResponse.json({
    business,
    businessId: business.id,
    siteUrl: `/site/${slug}`,
  });
}
