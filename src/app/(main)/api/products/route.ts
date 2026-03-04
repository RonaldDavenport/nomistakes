import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

// GET /api/products?businessId=X&status=
export async function GET(req: NextRequest) {
  const businessId = req.nextUrl.searchParams.get("businessId");
  if (!businessId) return NextResponse.json({ error: "businessId required" }, { status: 400 });

  const status = req.nextUrl.searchParams.get("status");
  const db = createServerClient();
  let query = db.from("products").select("*").eq("business_id", businessId).order("created_at", { ascending: false });
  if (status) query = query.eq("status", status);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ products: data || [] });
}

// POST /api/products
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { businessId, userId, name, description, priceCents, type, fileUrl, fileName, thumbnailUrl } = body;
  if (!businessId || !userId || !name) return NextResponse.json({ error: "businessId, userId, name required" }, { status: 400 });

  const db = createServerClient();
  const { data, error } = await db.from("products").insert({
    business_id: businessId,
    user_id: userId,
    name,
    description: description || null,
    price_cents: priceCents || 0,
    type: type || "digital",
    file_url: fileUrl || null,
    file_name: fileName || null,
    thumbnail_url: thumbnailUrl || null,
  }).select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ product: data });
}

// PATCH /api/products
export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const { productId, ...updates } = body;
  if (!productId) return NextResponse.json({ error: "productId required" }, { status: 400 });

  updates.updated_at = new Date().toISOString();
  const db = createServerClient();
  const { data, error } = await db.from("products").update(updates).eq("id", productId).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ product: data });
}

// DELETE /api/products
export async function DELETE(req: NextRequest) {
  const { productId } = await req.json();
  if (!productId) return NextResponse.json({ error: "productId required" }, { status: 400 });

  const db = createServerClient();
  const { error } = await db.from("products").delete().eq("id", productId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
