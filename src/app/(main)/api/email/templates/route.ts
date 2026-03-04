import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

// GET /api/email/templates?businessId=X
export async function GET(req: NextRequest) {
  const businessId = req.nextUrl.searchParams.get("businessId");
  if (!businessId) {
    return NextResponse.json({ error: "businessId required" }, { status: 400 });
  }

  const db = createServerClient();
  const { data, error } = await db
    .from("email_templates")
    .select("*")
    .eq("business_id", businessId)
    .order("is_system", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ templates: data || [] });
}

// POST /api/email/templates — create a template
export async function POST(req: NextRequest) {
  const { businessId, userId, name, subject, bodyHtml, category, variables } = await req.json();

  if (!businessId || !userId || !name || !subject || !bodyHtml) {
    return NextResponse.json({ error: "businessId, userId, name, subject, and bodyHtml are required" }, { status: 400 });
  }

  const db = createServerClient();
  const { data, error } = await db
    .from("email_templates")
    .insert({
      business_id: businessId,
      user_id: userId,
      name,
      subject,
      body_html: bodyHtml,
      category: category || null,
      variables: variables || [],
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ template: data }, { status: 201 });
}

// PATCH /api/email/templates — update a template
export async function PATCH(req: NextRequest) {
  const { templateId, ...updates } = await req.json();
  if (!templateId) {
    return NextResponse.json({ error: "templateId required" }, { status: 400 });
  }

  const allowed = ["name", "subject", "body_html", "category", "variables"];
  const patch: Record<string, unknown> = {};
  for (const key of allowed) {
    if (key in updates) patch[key] = updates[key];
  }
  patch.updated_at = new Date().toISOString();

  const db = createServerClient();
  const { data, error } = await db
    .from("email_templates")
    .update(patch)
    .eq("id", templateId)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ template: data });
}

// DELETE /api/email/templates
export async function DELETE(req: NextRequest) {
  const { templateId } = await req.json();
  if (!templateId) {
    return NextResponse.json({ error: "templateId required" }, { status: 400 });
  }

  const db = createServerClient();
  const { error } = await db
    .from("email_templates")
    .delete()
    .eq("id", templateId)
    .eq("is_system", false); // Don't delete system templates

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
