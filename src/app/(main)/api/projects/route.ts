import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

// GET /api/projects?businessId=X&status=&contactId=
export async function GET(req: NextRequest) {
  const businessId = req.nextUrl.searchParams.get("businessId");
  if (!businessId) return NextResponse.json({ error: "businessId required" }, { status: 400 });

  const db = createServerClient();
  const { data: { user } } = await db.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: biz } = await db.from("businesses").select("id").eq("id", businessId).eq("user_id", user.id).maybeSingle();
  if (!biz) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const status = req.nextUrl.searchParams.get("status");
  const contactId = req.nextUrl.searchParams.get("contactId");

  let query = db
    .from("projects")
    .select("*, contacts:contact_id(name, email), deliverables(*)")
    .eq("business_id", businessId)
    .order("created_at", { ascending: false });

  if (status) query = query.eq("status", status);
  if (contactId) query = query.eq("contact_id", contactId);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ projects: data || [] });
}

// POST /api/projects
export async function POST(req: NextRequest) {
  const db = createServerClient();
  const { data: { user } } = await db.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { businessId, contactId, proposalId, invoiceId, name, description, startDate, dueDate, deliverables } = body;
  if (!businessId || !name) return NextResponse.json({ error: "businessId and name required" }, { status: 400 });

  const { data: biz } = await db.from("businesses").select("id").eq("id", businessId).eq("user_id", user.id).maybeSingle();
  if (!biz) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { data: project, error } = await db.from("projects").insert({
    business_id: businessId,
    user_id: user.id,
    contact_id: contactId || null,
    proposal_id: proposalId || null,
    invoice_id: invoiceId || null,
    name,
    description: description || null,
    start_date: startDate || null,
    due_date: dueDate || null,
  }).select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Create deliverables if provided
  if (deliverables && deliverables.length > 0 && project) {
    const rows = deliverables.map((d: { name: string; description?: string; dueDate?: string }, i: number) => ({
      project_id: project.id,
      business_id: businessId,
      name: d.name,
      description: d.description || null,
      due_date: d.dueDate || null,
      sort_order: i,
    }));
    await db.from("deliverables").insert(rows);
  }

  const { data: full } = await db
    .from("projects")
    .select("*, deliverables(*)")
    .eq("id", project.id)
    .single();

  return NextResponse.json({ project: full || project });
}

// PATCH /api/projects
export async function PATCH(req: NextRequest) {
  const db = createServerClient();
  const { data: { user } } = await db.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { projectId, ...updates } = body;
  if (!projectId) return NextResponse.json({ error: "projectId required" }, { status: 400 });

  // Verify ownership through business
  const { data: project } = await db.from("projects").select("business_id").eq("id", projectId).maybeSingle();
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const { data: biz } = await db.from("businesses").select("id").eq("id", project.business_id).eq("user_id", user.id).maybeSingle();
  if (!biz) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  if (updates.status === "completed") {
    updates.completed_at = new Date().toISOString();
  }
  updates.updated_at = new Date().toISOString();

  const { data, error } = await db.from("projects").update(updates).eq("id", projectId).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ project: data });
}

// DELETE /api/projects
export async function DELETE(req: NextRequest) {
  const db = createServerClient();
  const { data: { user } } = await db.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { projectId } = await req.json();
  if (!projectId) return NextResponse.json({ error: "projectId required" }, { status: 400 });

  const { data: project } = await db.from("projects").select("business_id").eq("id", projectId).maybeSingle();
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const { data: biz } = await db.from("businesses").select("id").eq("id", project.business_id).eq("user_id", user.id).maybeSingle();
  if (!biz) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { error } = await db.from("projects").delete().eq("id", projectId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
