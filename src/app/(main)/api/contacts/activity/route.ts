import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

// GET /api/contacts/activity?contactId=X&limit=50
export async function GET(req: NextRequest) {
  const contactId = req.nextUrl.searchParams.get("contactId");
  if (!contactId) {
    return NextResponse.json({ error: "contactId required" }, { status: 400 });
  }

  const limit = parseInt(req.nextUrl.searchParams.get("limit") || "50");

  const db = createServerClient();
  const { data, error } = await db
    .from("contact_activity")
    .select("*")
    .eq("contact_id", contactId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ activities: data || [] });
}

// POST /api/contacts/activity — log an activity
export async function POST(req: NextRequest) {
  const { contactId, businessId, type, title, description, metadata } = await req.json();

  if (!contactId || !businessId || !type || !title) {
    return NextResponse.json({ error: "contactId, businessId, type, and title are required" }, { status: 400 });
  }

  const db = createServerClient();
  const { data, error } = await db
    .from("contact_activity")
    .insert({
      contact_id: contactId,
      business_id: businessId,
      type,
      title,
      description: description || null,
      metadata: metadata || {},
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ activity: data }, { status: 201 });
}
