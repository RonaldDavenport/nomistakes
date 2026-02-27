import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { createProject, deploy, isConfigured } from "@/lib/vercel";
import { generateSiteFiles } from "@/lib/site-template";

// POST /api/deploy — Deploy a business site to Vercel as a separate project
export async function POST(req: Request) {
  try {
    if (!isConfigured()) {
      return NextResponse.json(
        { error: "Vercel deployment not configured. Set VERCEL_TOKEN env variable." },
        { status: 503 }
      );
    }

    const { businessId, userId } = await req.json();

    if (!businessId) {
      return NextResponse.json({ error: "businessId required" }, { status: 400 });
    }

    const db = createServerClient();

    // Fetch business data
    const { data: business, error: dbError } = await db
      .from("businesses")
      .select("*")
      .eq("id", businessId)
      .single();

    if (dbError || !business) {
      return NextResponse.json({ error: "Business not found" }, { status: 404 });
    }

    // Verify ownership if userId provided
    if (userId && business.user_id !== userId) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    // Create Vercel project
    const project = await createProject(business.name, business.slug);

    // Generate site files from template
    const files = generateSiteFiles({
      name: business.name,
      slug: business.slug,
      tagline: business.tagline,
      type: business.type,
      brand: business.brand || {},
      siteContent: business.site_content || {},
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || "",
      supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
      stripePublishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    });

    // Deploy to Vercel
    const result = await deploy(project.name, files, {
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || "",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
      NEXT_PUBLIC_BUSINESS_ID: business.id,
    });

    // Update business record with deployment URL
    await db
      .from("businesses")
      .update({
        deployed_url: result.url,
        live_url: result.url,
        status: "live",
      })
      .eq("id", business.id);

    return NextResponse.json({
      success: true,
      projectId: result.projectId,
      deploymentId: result.deploymentId,
      url: result.url,
      projectName: project.name,
    });
  } catch (err) {
    console.error("[deploy] Error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Deployment failed" },
      { status: 500 }
    );
  }
}
