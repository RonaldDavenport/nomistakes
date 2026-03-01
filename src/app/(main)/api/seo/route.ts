import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

// GET /api/seo?businessId=X — get latest audit + keywords
export async function GET(req: NextRequest) {
  const businessId = req.nextUrl.searchParams.get("businessId");
  if (!businessId) {
    return NextResponse.json({ error: "businessId required" }, { status: 400 });
  }

  const db = createServerClient();

  const [auditsRes, keywordsRes] = await Promise.all([
    db
      .from("seo_audits")
      .select("*")
      .eq("business_id", businessId)
      .order("created_at", { ascending: false })
      .limit(5),
    db
      .from("seo_keywords")
      .select("*")
      .eq("business_id", businessId)
      .order("is_primary", { ascending: false })
      .limit(20),
  ]);

  return NextResponse.json({
    audits: auditsRes.data || [],
    keywords: keywordsRes.data || [],
  });
}
