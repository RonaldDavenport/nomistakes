import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

// Helper: verify user owns the project that owns a deliverable
async function verifyDeliverableOwner(db: ReturnType<typeof createServerClient>, deliverableId: string, userId: string) {
  const { data: del } = await db.from("deliverables").select("project_id").eq("id", deliverableId).maybeSingle();
  if (!del) return false;
  const { data: project } = await db.from("projects").select("business_id").eq("id", del.project_id).maybeSingle();
  if (!project) return false;
  const { data: biz } = await db.from("businesses").select("id").eq("id", project.business_id).eq("user_id", userId).maybeSingle();
  return !!biz;
}

// Helper: verify user owns the project
async function verifyProjectOwner(db: ReturnType<typeof createServerClient>, projectId: string, userId: string) {
  const { data: project } = await db.from("projects").select("business_id").eq("id", projectId).maybeSingle();
  if (!project) return false;
  const { data: biz } = await db.from("businesses").select("id").eq("id", project.business_id).eq("user_id", userId).maybeSingle();
  return !!biz;
}

// PATCH /api/projects/deliverables — update a deliverable
export async function PATCH(req: NextRequest) {
  const db = createServerClient();
  const { data: { user } } = await db.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { deliverableId, ...updates } = body;
  if (!deliverableId) return NextResponse.json({ error: "deliverableId required" }, { status: 400 });

  const owned = await verifyDeliverableOwner(db, deliverableId, user.id);
  if (!owned) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  if (updates.status === "completed") {
    updates.completed_at = new Date().toISOString();
  } else if (updates.status === "pending") {
    updates.completed_at = null;
  }

  const { data, error } = await db
    .from("deliverables")
    .update(updates)
    .eq("id", deliverableId)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ deliverable: data });
}

// POST /api/projects/deliverables — add a deliverable or subtask
export async function POST(req: NextRequest) {
  const db = createServerClient();
  const { data: { user } } = await db.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { projectId, businessId, name, description, dueDate, parentId } = body;
  if (!projectId || !businessId || !name) return NextResponse.json({ error: "projectId, businessId, name required" }, { status: 400 });

  const owned = await verifyProjectOwner(db, projectId, user.id);
  if (!owned) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  // Get next sort order (scoped to same parent level)
  let sortQuery = db.from("deliverables").select("sort_order").eq("project_id", projectId).order("sort_order", { ascending: false }).limit(1).maybeSingle();
  if (parentId) {
    sortQuery = db.from("deliverables").select("sort_order").eq("project_id", projectId).eq("parent_id", parentId).order("sort_order", { ascending: false }).limit(1).maybeSingle();
  }
  const { data: existing } = await sortQuery;
  const sortOrder = (existing?.sort_order ?? -1) + 1;

  const { data, error } = await db.from("deliverables").insert({
    project_id: projectId,
    business_id: businessId,
    name,
    description: description || null,
    due_date: dueDate || null,
    sort_order: sortOrder,
    parent_id: parentId || null,
  }).select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ deliverable: data });
}

// DELETE /api/projects/deliverables
export async function DELETE(req: NextRequest) {
  const db = createServerClient();
  const { data: { user } } = await db.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { deliverableId } = await req.json();
  if (!deliverableId) return NextResponse.json({ error: "deliverableId required" }, { status: 400 });

  const owned = await verifyDeliverableOwner(db, deliverableId, user.id);
  if (!owned) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { error } = await db.from("deliverables").delete().eq("id", deliverableId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
