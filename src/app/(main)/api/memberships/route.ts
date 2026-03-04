import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

// GET /api/memberships?businessId=X
export async function GET(req: NextRequest) {
  const businessId = req.nextUrl.searchParams.get("businessId");
  if (!businessId) return NextResponse.json({ error: "businessId required" }, { status: 400 });

  const db = createServerClient();
  const { data, error } = await db
    .from("memberships")
    .select("*")
    .eq("business_id", businessId)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ memberships: data || [] });
}

// POST /api/memberships
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { businessId, userId, name, description, priceCents, interval, features } = body;
  if (!businessId || !userId || !name) return NextResponse.json({ error: "businessId, userId, name required" }, { status: 400 });

  const db = createServerClient();
  const { data, error } = await db.from("memberships").insert({
    business_id: businessId,
    user_id: userId,
    name,
    description: description || null,
    price_cents: priceCents || 0,
    interval: interval || "monthly",
    features: features || [],
  }).select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ membership: data });
}

// PATCH /api/memberships
export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const { membershipId, ...updates } = body;
  if (!membershipId) return NextResponse.json({ error: "membershipId required" }, { status: 400 });

  updates.updated_at = new Date().toISOString();
  const db = createServerClient();
  const { data, error } = await db.from("memberships").update(updates).eq("id", membershipId).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ membership: data });
}

// DELETE /api/memberships
export async function DELETE(req: NextRequest) {
  const { membershipId } = await req.json();
  if (!membershipId) return NextResponse.json({ error: "membershipId required" }, { status: 400 });

  const db = createServerClient();
  const { error } = await db.from("memberships").delete().eq("id", membershipId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
