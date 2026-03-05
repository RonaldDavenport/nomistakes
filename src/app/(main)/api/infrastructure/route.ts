import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { hasFeature } from "@/lib/plans";
import { provisionSubdomain, provisionWorkspaceEmail, startDomainWarming } from "@/lib/satellite";

// POST /api/infrastructure — provision satellite domain, Google Workspace, and email warming
// Steps are sequential: Cloudflare → Workspace → MailReach (each step upserts partial progress)
export async function POST(req: NextRequest) {
  const { businessId, userId, subdomain, firstName, lastName } = await req.json();

  if (!businessId || !userId || !subdomain) {
    return NextResponse.json({ error: "businessId, userId, and subdomain are required" }, { status: 400 });
  }

  const db = createServerClient();

  // Gate on satellite_infra feature
  const { data: profile } = await db
    .from("profiles")
    .select("plan")
    .eq("id", userId)
    .single();

  const planId = profile?.plan ?? "free";
  if (!hasFeature(planId, "satellite_infra")) {
    return NextResponse.json(
      { error: "Satellite Infrastructure requires Starter plan or higher" },
      { status: 403 }
    );
  }

  const results: Record<string, unknown> = {};

  // Step 1: Cloudflare subdomain
  try {
    const { zoneId, recordId } = await provisionSubdomain({
      subdomain,
      targetCname: "cname.vercel-dns.com",
    });
    results.cloudflare = { success: true, zoneId, recordId };

    await db.from("infrastructure_settings").upsert({
      business_id: businessId,
      satellite_domain: subdomain,
      cloudflare_zone_id: zoneId,
      updated_at: new Date().toISOString(),
    }, { onConflict: "business_id" });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Cloudflare provisioning failed";
    results.cloudflare = { success: false, error: msg };
    // Stop here — downstream steps depend on the domain existing
    return NextResponse.json({ ...results, status: "partial" }, { status: 207 });
  }

  // Step 2: Google Workspace email
  const workspaceEmail = `${firstName?.toLowerCase() ?? "hello"}@${subdomain}`;
  try {
    const { customerId } = await provisionWorkspaceEmail({
      domain: subdomain,
      firstName: firstName ?? "Business",
      lastName: lastName ?? "Owner",
      primaryEmail: workspaceEmail,
    });
    results.workspace = { success: true, customerId, email: workspaceEmail };

    await db.from("infrastructure_settings").update({
      workspace_email: workspaceEmail,
      google_workspace_customer_id: customerId,
      updated_at: new Date().toISOString(),
    }).eq("business_id", businessId);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Google Workspace provisioning failed";
    results.workspace = { success: false, error: msg };
    // Continue to MailReach even if Workspace failed (can retry Workspace separately)
  }

  // Step 3: MailReach email warming (only if we have a workspace email)
  if (results.workspace && (results.workspace as { success: boolean }).success) {
    try {
      const { campaignId } = await startDomainWarming({
        email: workspaceEmail,
        domain: subdomain,
      });
      results.warming = { success: true, campaignId };

      await db.from("infrastructure_settings").update({
        warming_status: "warming",
        mailreach_campaign_id: campaignId,
        updated_at: new Date().toISOString(),
      }).eq("business_id", businessId);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "MailReach warming failed";
      results.warming = { success: false, error: msg };
    }
  }

  // Return final infrastructure settings row
  const { data: infra } = await db
    .from("infrastructure_settings")
    .select("*")
    .eq("business_id", businessId)
    .single();

  return NextResponse.json({ ...results, status: "complete", infrastructure: infra });
}

// GET /api/infrastructure?businessId=X — fetch current infra settings
export async function GET(req: NextRequest) {
  const businessId = req.nextUrl.searchParams.get("businessId");
  if (!businessId) {
    return NextResponse.json({ error: "businessId required" }, { status: 400 });
  }

  const db = createServerClient();
  const { data, error } = await db
    .from("infrastructure_settings")
    .select("*")
    .eq("business_id", businessId)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ infrastructure: data });
}
