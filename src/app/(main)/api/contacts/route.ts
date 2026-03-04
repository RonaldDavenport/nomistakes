import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

// GET /api/contacts?businessId=X&stage=&search=&limit=50&offset=0
export async function GET(req: NextRequest) {
  const businessId = req.nextUrl.searchParams.get("businessId");
  if (!businessId) {
    return NextResponse.json({ error: "businessId required" }, { status: 400 });
  }

  const stage = req.nextUrl.searchParams.get("stage");
  const search = req.nextUrl.searchParams.get("search");
  const limit = parseInt(req.nextUrl.searchParams.get("limit") || "50");
  const offset = parseInt(req.nextUrl.searchParams.get("offset") || "0");

  const db = createServerClient();
  let query = db
    .from("contacts")
    .select("*", { count: "exact" })
    .eq("business_id", businessId)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (stage) {
    query = query.eq("lifecycle_stage", stage);
  }
  if (search) {
    query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,company.ilike.%${search}%`);
  }

  const { data, error, count } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ contacts: data || [], total: count || 0 });
}

// POST /api/contacts — create a new contact (dedupe on email per business)
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { businessId, userId, email, name, phone, company, source, tags, lifecycle_stage } = body;

  if (!businessId || !userId || !email) {
    return NextResponse.json({ error: "businessId, userId, and email are required" }, { status: 400 });
  }

  const db = createServerClient();

  // Check for existing contact with same email in this business
  const { data: existing } = await db
    .from("contacts")
    .select("id")
    .eq("business_id", businessId)
    .eq("email", email.toLowerCase())
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ error: "A contact with this email already exists", contactId: existing.id }, { status: 409 });
  }

  const { data, error } = await db
    .from("contacts")
    .insert({
      business_id: businessId,
      user_id: userId,
      email: email.toLowerCase(),
      name: name || null,
      phone: phone || null,
      company: company || null,
      lifecycle_stage: lifecycle_stage || "subscriber",
      source: source || null,
      tags: tags || [],
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ contact: data }, { status: 201 });
}

// PATCH /api/contacts — update a contact
export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const { contactId, ...updates } = body;

  if (!contactId) {
    return NextResponse.json({ error: "contactId required" }, { status: 400 });
  }

  const allowed = ["name", "email", "phone", "company", "lifecycle_stage", "source", "tags", "notes", "metadata"];
  const patch: Record<string, unknown> = {};
  for (const key of allowed) {
    if (key in updates) patch[key] = updates[key];
  }
  if (patch.email) patch.email = (patch.email as string).toLowerCase();
  patch.updated_at = new Date().toISOString();

  const db = createServerClient();

  // Check if lifecycle stage is changing (for activity logging)
  let oldStage: string | null = null;
  if (patch.lifecycle_stage) {
    const { data: current } = await db
      .from("contacts")
      .select("lifecycle_stage, business_id")
      .eq("id", contactId)
      .single();
    if (current && current.lifecycle_stage !== patch.lifecycle_stage) {
      oldStage = current.lifecycle_stage;
    }
  }

  const { data, error } = await db
    .from("contacts")
    .update(patch)
    .eq("id", contactId)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Log stage change activity
  if (oldStage && data) {
    db.from("contact_activity").insert({
      contact_id: contactId,
      business_id: data.business_id,
      type: "stage_changed",
      title: `Stage changed to ${patch.lifecycle_stage}`,
      description: `From ${oldStage} to ${patch.lifecycle_stage}`,
      metadata: { from: oldStage, to: patch.lifecycle_stage },
    }).then(({ error: actErr }) => {
      if (actErr) console.error("[contacts] Activity log error:", actErr.message);
    });
  }

  return NextResponse.json({ contact: data });
}

// DELETE /api/contacts — delete a contact
export async function DELETE(req: NextRequest) {
  const { contactId } = await req.json();
  if (!contactId) {
    return NextResponse.json({ error: "contactId required" }, { status: 400 });
  }

  const db = createServerClient();
  const { error } = await db
    .from("contacts")
    .delete()
    .eq("id", contactId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
