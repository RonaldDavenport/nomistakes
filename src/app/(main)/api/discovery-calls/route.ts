import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

// GET /api/discovery-calls?businessId=X&status=scheduled
export async function GET(req: NextRequest) {
  const businessId = req.nextUrl.searchParams.get("businessId");
  if (!businessId) {
    return NextResponse.json({ error: "businessId required" }, { status: 400 });
  }

  const status = req.nextUrl.searchParams.get("status");

  const db = createServerClient();
  let query = db
    .from("discovery_calls")
    .select("*")
    .eq("business_id", businessId)
    .order("scheduled_at", { ascending: true });

  if (status) {
    query = query.eq("status", status);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ calls: data || [] });
}

// POST /api/discovery-calls — book a call (public, no auth required)
export async function POST(req: NextRequest) {
  const { businessId, name, email, phone, notes, scheduledAt, durationMinutes } = await req.json();

  if (!businessId || !name || !email || !scheduledAt) {
    return NextResponse.json({ error: "businessId, name, email, and scheduledAt are required" }, { status: 400 });
  }

  const db = createServerClient();

  // Get business to find user_id
  const { data: business } = await db
    .from("businesses")
    .select("id, user_id, name, slug")
    .eq("id", businessId)
    .single();

  if (!business) {
    return NextResponse.json({ error: "Business not found" }, { status: 404 });
  }

  // Find or create contact
  let contactId: string | null = null;
  const { data: existingContact } = await db
    .from("contacts")
    .select("id")
    .eq("business_id", businessId)
    .eq("email", email.toLowerCase())
    .maybeSingle();

  if (existingContact) {
    contactId = existingContact.id;
    // Update to lead if subscriber
    await db
      .from("contacts")
      .update({ lifecycle_stage: "lead", updated_at: new Date().toISOString() })
      .eq("id", contactId)
      .eq("lifecycle_stage", "subscriber");
  } else {
    const { data: newContact } = await db
      .from("contacts")
      .insert({
        business_id: businessId,
        user_id: business.user_id,
        email: email.toLowerCase(),
        name,
        phone: phone || null,
        lifecycle_stage: "lead",
        source: "booking",
      })
      .select("id")
      .single();
    if (newContact) contactId = newContact.id;
  }

  // Check for conflicting time slot
  const scheduledDate = new Date(scheduledAt);
  const duration = durationMinutes || 30;
  const endTime = new Date(scheduledDate.getTime() + duration * 60000);

  const { data: conflicts } = await db
    .from("discovery_calls")
    .select("id")
    .eq("business_id", businessId)
    .in("status", ["scheduled", "confirmed"])
    .gte("scheduled_at", scheduledDate.toISOString())
    .lt("scheduled_at", endTime.toISOString());

  if (conflicts && conflicts.length > 0) {
    return NextResponse.json({ error: "This time slot is no longer available" }, { status: 409 });
  }

  // Create discovery call
  const { data: call, error } = await db
    .from("discovery_calls")
    .insert({
      business_id: businessId,
      user_id: business.user_id,
      contact_id: contactId,
      name,
      email: email.toLowerCase(),
      phone: phone || null,
      scheduled_at: scheduledAt,
      duration_minutes: duration,
      status: "scheduled",
      notes: notes || null,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Log activity (fire-and-forget)
  if (contactId) {
    db.from("contact_activity").insert({
      contact_id: contactId,
      business_id: businessId,
      type: "call_booked",
      title: "Discovery call booked",
      description: `Scheduled for ${new Date(scheduledAt).toLocaleString()}`,
      metadata: { call_id: call.id },
    }).then(({ error: actErr }) => {
      if (actErr) console.error("[discovery-calls] Activity log error:", actErr.message);
    });
  }

  return NextResponse.json({ call }, { status: 201 });
}

// PATCH /api/discovery-calls — update call status/notes
export async function PATCH(req: NextRequest) {
  const { callId, status, callNotes, outcome } = await req.json();

  if (!callId) {
    return NextResponse.json({ error: "callId required" }, { status: 400 });
  }

  const db = createServerClient();

  const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (status) patch.status = status;
  if (callNotes !== undefined) patch.call_notes = callNotes;
  if (outcome) patch.outcome = outcome;

  const { data, error } = await db
    .from("discovery_calls")
    .update(patch)
    .eq("id", callId)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Log activity + upgrade stage if qualified
  if (data?.contact_id) {
    const activityType = status === "completed" ? "call_completed" :
                         status === "cancelled" ? "call_cancelled" : "call_booked";
    db.from("contact_activity").insert({
      contact_id: data.contact_id,
      business_id: data.business_id,
      type: activityType,
      title: `Call ${status || "updated"}`,
      metadata: { call_id: callId, outcome },
    }).then(() => {});

    if (outcome === "qualified" && data.contact_id) {
      db.from("contacts")
        .update({ lifecycle_stage: "qualified_lead", updated_at: new Date().toISOString() })
        .eq("id", data.contact_id)
        .then(() => {});
    }
  }

  return NextResponse.json({ call: data });
}

// DELETE /api/discovery-calls — cancel a call
export async function DELETE(req: NextRequest) {
  const { callId } = await req.json();
  if (!callId) {
    return NextResponse.json({ error: "callId required" }, { status: 400 });
  }

  const db = createServerClient();

  // Mark as cancelled instead of hard delete
  const { data, error } = await db
    .from("discovery_calls")
    .update({ status: "cancelled", updated_at: new Date().toISOString() })
    .eq("id", callId)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (data?.contact_id) {
    db.from("contact_activity").insert({
      contact_id: data.contact_id,
      business_id: data.business_id,
      type: "call_cancelled",
      title: "Call cancelled",
      metadata: { call_id: callId },
    }).then(() => {});
  }

  return NextResponse.json({ success: true });
}
