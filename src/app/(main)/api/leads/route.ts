import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

// GET /api/leads?businessId=X&status=&search=&limit=50&offset=0
export async function GET(req: NextRequest) {
  const businessId = req.nextUrl.searchParams.get("businessId");
  if (!businessId) {
    return NextResponse.json({ error: "businessId required" }, { status: 400 });
  }

  const status = req.nextUrl.searchParams.get("status");
  const search = req.nextUrl.searchParams.get("search");
  const limit = parseInt(req.nextUrl.searchParams.get("limit") || "50");
  const offset = parseInt(req.nextUrl.searchParams.get("offset") || "0");

  const db = createServerClient();
  let query = db
    .from("leads")
    .select("*", { count: "exact" })
    .eq("business_id", businessId)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (status) {
    query = query.eq("status", status);
  }
  if (search) {
    query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,company.ilike.%${search}%`);
  }

  const { data, error, count } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ leads: data || [], total: count || 0 });
}

// PATCH /api/leads — update a lead (status, notes, etc.)
export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const { leadId, ...updates } = body;

  if (!leadId) {
    return NextResponse.json({ error: "leadId required" }, { status: 400 });
  }

  const allowed = ["status", "name", "email", "title", "company", "linkedin_url", "reached_out_at"];
  const patch: Record<string, unknown> = {};
  for (const key of allowed) {
    if (key in updates) patch[key] = updates[key];
  }
  patch.updated_at = new Date().toISOString();

  const db = createServerClient();
  const { data, error } = await db
    .from("leads")
    .update(patch)
    .eq("id", leadId)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ lead: data });
}

// DELETE /api/leads
export async function DELETE(req: NextRequest) {
  const { leadId } = await req.json();
  if (!leadId) {
    return NextResponse.json({ error: "leadId required" }, { status: 400 });
  }

  const db = createServerClient();
  const { error } = await db.from("leads").delete().eq("id", leadId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
