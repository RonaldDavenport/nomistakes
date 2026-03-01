import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { deploy, isConfigured } from "@/lib/vercel";
import { generateSiteFiles } from "@/lib/site-template";

export const maxDuration = 60; // Vercel hobby plan caps at 60s

// POST /api/deploy — Deploy a business site to Vercel as a separate project
export async function POST(req: Request) {
  const t0 = Date.now();
  const log = (step: string) => console.log(`[deploy] ${step} (${Date.now() - t0}ms)`);

  try {
    log("start");

    if (!isConfigured()) {
      log("FAIL: VERCEL_TOKEN not set");
      return NextResponse.json(
        { error: "Vercel deployment not configured. Set VERCEL_TOKEN env variable.", step: "config" },
        { status: 503 }
      );
    }
    log("token OK");

    const { businessId, userId } = await req.json();

    if (!businessId) {
      return NextResponse.json({ error: "businessId required", step: "input" }, { status: 400 });
    }
    log(`businessId=${businessId}`);

    const db = createServerClient();

    // Fetch business data
    const { data: business, error: dbError } = await db
      .from("businesses")
      .select("*")
      .eq("id", businessId)
      .single();

    if (dbError || !business) {
      log(`FAIL: business not found — ${dbError?.message || "null"}`);
      return NextResponse.json(
        { error: `Business not found: ${dbError?.message || "no data"}`, step: "db" },
        { status: 404 }
      );
    }
    log(`business="${business.name}" slug="${business.slug}"`);

    // Verify ownership if userId provided
    if (userId && business.user_id !== userId) {
      return NextResponse.json({ error: "Not authorized", step: "auth" }, { status: 403 });
    }

    // Determine platform app URL for admin bar links
    const appUrl = process.env.NEXT_PUBLIC_APP_URL
      || (process.env.NEXT_PUBLIC_APP_DOMAIN ? `https://${process.env.NEXT_PUBLIC_APP_DOMAIN}` : "");

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
      businessId: business.id,
      appUrl,
    });
    log(`generated ${files.length} files`);

    // Deploy to Vercel (handles project creation + env vars + deploy)
    const result = await deploy(business.slug, files, {
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || "",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
      NEXT_PUBLIC_BUSINESS_ID: business.id,
      STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY || "",
    });
    log(`deployed: ${result.url} (${result.readyState})`);

    // Update business record with deployment URL
    await db
      .from("businesses")
      .update({
        deployed_url: result.url,
        live_url: result.url,
        status: "live",
      })
      .eq("id", business.id);
    log("db updated — done");

    return NextResponse.json({
      success: true,
      projectId: result.projectId,
      deploymentId: result.deploymentId,
      url: result.url,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Deployment failed";
    console.error(`[deploy] FAIL (${Date.now() - t0}ms):`, msg);
    return NextResponse.json(
      { error: msg, step: "deploy" },
      { status: 500 }
    );
  }
}
