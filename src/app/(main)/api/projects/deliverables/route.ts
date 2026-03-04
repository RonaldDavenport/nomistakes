import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

// PATCH /api/projects/deliverables — update a deliverable (complete, edit, etc.)
export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const { deliverableId, ...updates } = body;
  if (!deliverableId) return NextResponse.json({ error: "deliverableId required" }, { status: 400 });

  if (updates.status === "completed") {
    updates.completed_at = new Date().toISOString();
  }

  const db = createServerClient();
  const { data, error } = await db
    .from("deliverables")
    .update(updates)
    .eq("id", deliverableId)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ deliverable: data });
}

// POST /api/projects/deliverables — add a deliverable to a project
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { projectId, businessId, name, description, dueDate } = body;
  if (!projectId || !businessId || !name) return NextResponse.json({ error: "projectId, businessId, name required" }, { status: 400 });

  const db = createServerClient();

  // Get next sort order
  const { data: existing } = await db
    .from("deliverables")
    .select("sort_order")
    .eq("project_id", projectId)
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  const sortOrder = (existing?.sort_order ?? -1) + 1;

  const { data, error } = await db.from("deliverables").insert({
    project_id: projectId,
    business_id: businessId,
    name,
    description: description || null,
    due_date: dueDate || null,
    sort_order: sortOrder,
  }).select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ deliverable: data });
}

// DELETE /api/projects/deliverables
export async function DELETE(req: NextRequest) {
  const { deliverableId } = await req.json();
  if (!deliverableId) return NextResponse.json({ error: "deliverableId required" }, { status: 400 });

  const db = createServerClient();
  const { error } = await db.from("deliverables").delete().eq("id", deliverableId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
