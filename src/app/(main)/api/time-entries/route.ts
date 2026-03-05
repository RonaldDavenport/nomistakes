import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

// GET /api/time-entries?businessId=X&projectId=Y
export async function GET(req: NextRequest) {
  const businessId = req.nextUrl.searchParams.get("businessId");
  if (!businessId) {
    return NextResponse.json({ error: "businessId required" }, { status: 400 });
  }

  const projectId = req.nextUrl.searchParams.get("projectId");
  const db = createServerClient();

  const { data: { user } } = await db.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: biz } = await db.from("businesses").select("id").eq("id", businessId).eq("user_id", user.id).maybeSingle();
  if (!biz) return NextResponse.json({ error: "Not found" }, { status: 404 });

  let query = db
    .from("time_entries")
    .select("*, projects(name), contacts(name)")
    .eq("business_id", businessId)
    .order("started_at", { ascending: false })
    .limit(200);

  if (projectId) {
    query = query.eq("project_id", projectId);
  }

  const { data, error } = await query;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ entries: data || [] });
}

// POST /api/time-entries — start or create an entry
export async function POST(req: NextRequest) {
  const db = createServerClient();
  const { data: { user } } = await db.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { businessId, projectId, contactId, description, startedAt, endedAt, minutes, hourlyRate, billable } = await req.json();
  if (!businessId || !startedAt) {
    return NextResponse.json({ error: "businessId and startedAt required" }, { status: 400 });
  }

  const { data: biz } = await db.from("businesses").select("id").eq("id", businessId).eq("user_id", user.id).maybeSingle();
  if (!biz) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Compute minutes if both times provided and minutes not supplied
  let computedMinutes = minutes;
  if (!computedMinutes && endedAt) {
    computedMinutes = Math.round((new Date(endedAt).getTime() - new Date(startedAt).getTime()) / 60000);
  }

  const { data, error } = await db
    .from("time_entries")
    .insert({
      business_id: businessId,
      user_id: user.id,
      project_id: projectId || null,
      contact_id: contactId || null,
      description: description || null,
      started_at: startedAt,
      ended_at: endedAt || null,
      minutes: computedMinutes || null,
      hourly_rate: hourlyRate || null,
      billable: billable !== false,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ entry: data }, { status: 201 });
}

// PATCH /api/time-entries — stop timer or update entry
export async function PATCH(req: NextRequest) {
  const db = createServerClient();
  const { data: { user } } = await db.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { entryId, endedAt, description, billable, hourlyRate } = await req.json();
  if (!entryId) {
    return NextResponse.json({ error: "entryId required" }, { status: 400 });
  }

  // Fetch existing to compute minutes
  const { data: existing } = await db
    .from("time_entries")
    .select("started_at")
    .eq("id", entryId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!existing) {
    return NextResponse.json({ error: "Entry not found" }, { status: 404 });
  }

  const patch: Record<string, unknown> = {};
  if (endedAt !== undefined) {
    patch.ended_at = endedAt;
    patch.minutes = Math.round((new Date(endedAt).getTime() - new Date(existing.started_at).getTime()) / 60000);
  }
  if (description !== undefined) patch.description = description;
  if (billable !== undefined) patch.billable = billable;
  if (hourlyRate !== undefined) patch.hourly_rate = hourlyRate;

  const { data, error } = await db
    .from("time_entries")
    .update(patch)
    .eq("id", entryId)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ entry: data });
}

// DELETE /api/time-entries
export async function DELETE(req: NextRequest) {
  const db = createServerClient();
  const { data: { user } } = await db.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { entryId } = await req.json();
  if (!entryId) {
    return NextResponse.json({ error: "entryId required" }, { status: 400 });
  }

  const { error } = await db
    .from("time_entries")
    .delete()
    .eq("id", entryId)
    .eq("user_id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
