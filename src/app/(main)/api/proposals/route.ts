import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { randomBytes } from "crypto";

// GET /api/proposals?businessId=X&contactId=Y&status=Z
export async function GET(req: NextRequest) {
  const businessId = req.nextUrl.searchParams.get("businessId");
  if (!businessId) {
    return NextResponse.json({ error: "businessId required" }, { status: 400 });
  }

  const contactId = req.nextUrl.searchParams.get("contactId");
  const status = req.nextUrl.searchParams.get("status");

  const db = createServerClient();
  let query = db
    .from("proposals")
    .select("*, contacts(name, email)")
    .eq("business_id", businessId)
    .order("created_at", { ascending: false });

  if (contactId) query = query.eq("contact_id", contactId);
  if (status) query = query.eq("status", status);

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ proposals: data || [] });
}

// POST /api/proposals — create a proposal
export async function POST(req: NextRequest) {
  const { businessId, userId, contactId, discoveryCallId, title, scope, pricing, validUntil } = await req.json();

  if (!businessId || !userId || !contactId || !title) {
    return NextResponse.json({ error: "businessId, userId, contactId, and title are required" }, { status: 400 });
  }

  const accessToken = randomBytes(32).toString("hex");

  const db = createServerClient();
  const { data, error } = await db
    .from("proposals")
    .insert({
      business_id: businessId,
      user_id: userId,
      contact_id: contactId,
      discovery_call_id: discoveryCallId || null,
      title,
      access_token: accessToken,
      status: "draft",
      scope: scope || {},
      pricing: pricing || {},
      valid_until: validUntil || null,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ proposal: data }, { status: 201 });
}

// PATCH /api/proposals — update a proposal
export async function PATCH(req: NextRequest) {
  const { proposalId, ...updates } = await req.json();
  if (!proposalId) {
    return NextResponse.json({ error: "proposalId required" }, { status: 400 });
  }

  const allowed = ["title", "scope", "pricing", "valid_until", "status"];
  const patch: Record<string, unknown> = {};
  for (const key of allowed) {
    if (key in updates) patch[key] = updates[key];
  }
  patch.updated_at = new Date().toISOString();

  const db = createServerClient();
  const { data, error } = await db
    .from("proposals")
    .update(patch)
    .eq("id", proposalId)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ proposal: data });
}

// DELETE /api/proposals
export async function DELETE(req: NextRequest) {
  const { proposalId } = await req.json();
  if (!proposalId) {
    return NextResponse.json({ error: "proposalId required" }, { status: 400 });
  }

  const db = createServerClient();
  const { error } = await db
    .from("proposals")
    .delete()
    .eq("id", proposalId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
