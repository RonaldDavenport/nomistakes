import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

// GET /api/projects/activities?projectId=X&businessId=Y
export async function GET(req: NextRequest) {
  const projectId = req.nextUrl.searchParams.get("projectId");
  const businessId = req.nextUrl.searchParams.get("businessId");
  if (!projectId || !businessId) {
    return NextResponse.json({ error: "projectId and businessId required" }, { status: 400 });
  }

  const db = createServerClient();
  const { data: { user } } = await db.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: biz } = await db.from("businesses").select("id").eq("id", businessId).eq("user_id", user.id).maybeSingle();
  if (!biz) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { data, error } = await db
    .from("project_activities")
    .select("*")
    .eq("project_id", projectId)
    .eq("business_id", businessId)
    .order("created_at", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ activities: data || [] });
}

// POST /api/projects/activities — add a comment or note
export async function POST(req: NextRequest) {
  const db = createServerClient();
  const { data: { user } } = await db.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { projectId, businessId, body, type } = await req.json();
  if (!projectId || !businessId || !body) {
    return NextResponse.json({ error: "projectId, businessId, and body required" }, { status: 400 });
  }

  const { data: biz } = await db.from("businesses").select("id").eq("id", businessId).eq("user_id", user.id).maybeSingle();
  if (!biz) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { data, error } = await db
    .from("project_activities")
    .insert({
      project_id: projectId,
      business_id: businessId,
      user_id: user.id,
      type: type || "comment",
      body,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ activity: data }, { status: 201 });
}

// DELETE /api/projects/activities — delete a comment
export async function DELETE(req: NextRequest) {
  const db = createServerClient();
  const { data: { user } } = await db.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { activityId } = await req.json();
  if (!activityId) return NextResponse.json({ error: "activityId required" }, { status: 400 });

  const { error } = await db
    .from("project_activities")
    .delete()
    .eq("id", activityId)
    .eq("user_id", user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
