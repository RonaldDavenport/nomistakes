import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

// GET /api/contracts?businessId=X
export async function GET(req: NextRequest) {
  const businessId = req.nextUrl.searchParams.get("businessId");
  if (!businessId) return NextResponse.json({ error: "businessId required" }, { status: 400 });

  const db = createServerClient();
  const { data: { user } } = await db.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: biz } = await db.from("businesses").select("id").eq("id", businessId).eq("user_id", user.id).maybeSingle();
  if (!biz) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { data, error } = await db
    .from("contracts")
    .select("*, contacts(name, email)")
    .eq("business_id", businessId)
    .order("created_at", { ascending: false })
    .limit(500);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ contracts: data || [] });
}

// Business ownership helper — used by POST to verify user owns businessId
async function verifyOwnership(db: ReturnType<typeof createServerClient>, businessId: string, userId: string) {
  const { data } = await db.from("businesses").select("id").eq("id", businessId).eq("user_id", userId).maybeSingle();
  return !!data;
}

// POST /api/contracts
export async function POST(req: NextRequest) {
  const db = createServerClient();
  const { data: { user } } = await db.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { businessId, contactId, proposalId, title, body } = await req.json();
  if (!businessId || !title || !body) {
    return NextResponse.json({ error: "businessId, title, and body are required" }, { status: 400 });
  }

  const owned = await verifyOwnership(db, businessId, user.id);
  if (!owned) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { data, error } = await db
    .from("contracts")
    .insert({
      business_id: businessId,
      user_id: user.id,
      contact_id: contactId || null,
      proposal_id: proposalId || null,
      title,
      body,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ contract: data }, { status: 201 });
}

// PATCH /api/contracts
export async function PATCH(req: NextRequest) {
  const db = createServerClient();
  const { data: { user } } = await db.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { contractId, title, body } = await req.json();
  if (!contractId) {
    return NextResponse.json({ error: "contractId required" }, { status: 400 });
  }

  const patch: Record<string, unknown> = {};
  if (title !== undefined) patch.title = title;
  if (body !== undefined) patch.body = body;

  const { data, error } = await db
    .from("contracts")
    .update(patch)
    .eq("id", contractId)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ contract: data });
}

// DELETE /api/contracts
export async function DELETE(req: NextRequest) {
  const db = createServerClient();
  const { data: { user } } = await db.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { contractId } = await req.json();
  if (!contractId) {
    return NextResponse.json({ error: "contractId required" }, { status: 400 });
  }

  const { error } = await db
    .from("contracts")
    .delete()
    .eq("id", contractId)
    .eq("user_id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
