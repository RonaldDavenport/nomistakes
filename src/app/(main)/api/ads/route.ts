import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

// GET /api/ads?businessId=X — list ad campaigns with variations
export async function GET(req: NextRequest) {
  const businessId = req.nextUrl.searchParams.get("businessId");
  if (!businessId) {
    return NextResponse.json({ error: "businessId required" }, { status: 400 });
  }

  const db = createServerClient();

  const { data: campaigns, error } = await db
    .from("ad_campaigns")
    .select("*")
    .eq("business_id", businessId)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Fetch variations for each campaign
  const campaignIds = (campaigns || []).map((c) => c.id);
  let variations: Record<string, unknown>[] = [];

  if (campaignIds.length > 0) {
    const { data: vars } = await db
      .from("ad_variations")
      .select("*")
      .in("campaign_id", campaignIds)
      .order("created_at", { ascending: true });
    variations = vars || [];
  }

  // Group variations by campaign
  const campaignsWithVariations = (campaigns || []).map((campaign) => ({
    ...campaign,
    variations: variations.filter((v) => v.campaign_id === campaign.id),
  }));

  return NextResponse.json({ campaigns: campaignsWithVariations });
}

// DELETE /api/ads — delete a campaign and its variations
export async function DELETE(req: NextRequest) {
  const { campaignId } = await req.json();
  if (!campaignId) {
    return NextResponse.json({ error: "campaignId required" }, { status: 400 });
  }

  const db = createServerClient();

  // Variations cascade delete via FK, but let's be explicit
  await db.from("ad_creatives").delete().eq("campaign_id", campaignId);
  await db.from("ad_variations").delete().eq("campaign_id", campaignId);
  const { error } = await db.from("ad_campaigns").delete().eq("id", campaignId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
