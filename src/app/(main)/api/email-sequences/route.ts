import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

// GET /api/email-sequences?businessId=X — list email sequences
export async function GET(req: NextRequest) {
  const businessId = req.nextUrl.searchParams.get("businessId");
  if (!businessId) {
    return NextResponse.json({ error: "businessId required" }, { status: 400 });
  }

  const db = createServerClient();
  const { data, error } = await db
    .from("email_sequences")
    .select("*")
    .eq("business_id", businessId)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ sequences: data || [] });
}

// PATCH /api/email-sequences — update sequence status or content
export async function PATCH(req: NextRequest) {
  const { sequenceId, ...updates } = await req.json();
  if (!sequenceId) {
    return NextResponse.json({ error: "sequenceId required" }, { status: 400 });
  }

  const allowed = ["sequence_name", "status", "emails", "esp_integration", "esp_campaign_id"];
  const patch: Record<string, unknown> = {};
  for (const key of allowed) {
    if (key in updates) patch[key] = updates[key];
  }
  patch.updated_at = new Date().toISOString();

  const db = createServerClient();
  const { data, error } = await db
    .from("email_sequences")
    .update(patch)
    .eq("id", sequenceId)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ sequence: data });
}

// DELETE /api/email-sequences — delete a sequence
export async function DELETE(req: NextRequest) {
  const { sequenceId } = await req.json();
  if (!sequenceId) {
    return NextResponse.json({ error: "sequenceId required" }, { status: 400 });
  }

  const db = createServerClient();
  const { error } = await db
    .from("email_sequences")
    .delete()
    .eq("id", sequenceId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
