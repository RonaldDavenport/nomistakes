import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { AFFILIATE_PARTNERS } from "@/lib/affiliates";

// GET /api/affiliate/click?partner=X&biz=Y&src=Z — Track click and redirect
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const partnerId = searchParams.get("partner");
  const businessId = searchParams.get("biz");
  const source = searchParams.get("src") || "platform_recommendation";

  if (!partnerId) {
    return NextResponse.json({ error: "partner required" }, { status: 400 });
  }

  const partner = AFFILIATE_PARTNERS.find((p) => p.id === partnerId);
  if (!partner) {
    return NextResponse.json({ error: "Partner not found" }, { status: 404 });
  }

  // Log the click for analytics
  try {
    const db = createServerClient();
    await db.from("affiliate_clicks").insert({
      partner_id: partnerId,
      business_id: businessId || null,
      source,
    });
  } catch {
    // Don't block redirect if logging fails
  }

  // Redirect to affiliate partner
  return NextResponse.redirect(partner.affiliateUrl);
}
