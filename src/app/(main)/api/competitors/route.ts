import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

// GET /api/competitors?businessId=X — list competitors
export async function GET(req: NextRequest) {
  const businessId = req.nextUrl.searchParams.get("businessId");
  if (!businessId) {
    return NextResponse.json({ error: "businessId required" }, { status: 400 });
  }

  const db = createServerClient();
  const { data, error } = await db
    .from("competitors")
    .select("*")
    .eq("business_id", businessId)
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ competitors: data || [] });
}

// DELETE /api/competitors — remove a competitor
export async function DELETE(req: NextRequest) {
  const { competitorId } = await req.json();
  if (!competitorId) {
    return NextResponse.json({ error: "competitorId required" }, { status: 400 });
  }

  const db = createServerClient();
  const { error } = await db
    .from("competitors")
    .update({ is_active: false })
    .eq("id", competitorId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
