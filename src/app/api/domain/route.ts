import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { addDomain, getDomainConfig, isConfigured } from "@/lib/vercel";

// POST /api/domain — Add a custom domain to a business site
export async function POST(req: Request) {
  try {
    if (!isConfigured()) {
      return NextResponse.json(
        { error: "Vercel not configured" },
        { status: 503 }
      );
    }

    const { businessId, domain, userId } = await req.json();

    if (!businessId || !domain) {
      return NextResponse.json({ error: "businessId and domain required" }, { status: 400 });
    }

    const db = createServerClient();

    // Fetch business
    const { data: business } = await db
      .from("businesses")
      .select("*")
      .eq("id", businessId)
      .single();

    if (!business) {
      return NextResponse.json({ error: "Business not found" }, { status: 404 });
    }

    if (userId && business.user_id !== userId) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    const projectName = `nm-${business.slug}`;

    // Add domain to Vercel project
    const result = await addDomain(projectName, domain);

    // Get DNS config for user
    const config = await getDomainConfig(domain);

    // Store custom domain in business record
    await db
      .from("businesses")
      .update({ custom_domain: domain })
      .eq("id", business.id);

    return NextResponse.json({
      success: true,
      configured: result.configured,
      dns: config,
      instructions: result.configured
        ? "Domain is configured and live!"
        : "Add the following DNS records to your domain registrar, then check back.",
    });
  } catch (err) {
    console.error("[domain] Error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to add domain" },
      { status: 500 }
    );
  }
}

// GET /api/domain?businessId=xxx — Check domain status
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const businessId = searchParams.get("businessId");

    if (!businessId) {
      return NextResponse.json({ error: "businessId required" }, { status: 400 });
    }

    const db = createServerClient();
    const { data: business } = await db
      .from("businesses")
      .select("custom_domain, slug")
      .eq("id", businessId)
      .single();

    if (!business?.custom_domain) {
      return NextResponse.json({ configured: false, domain: null });
    }

    const config = await getDomainConfig(business.custom_domain);

    return NextResponse.json({
      domain: business.custom_domain,
      configured: config.configured,
      records: config.records,
    });
  } catch (err) {
    console.error("[domain] Error:", err);
    return NextResponse.json({ error: "Failed to check domain" }, { status: 500 });
  }
}
