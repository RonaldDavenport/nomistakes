import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

// GET /api/inbox?businessId=X&channel=&leadId=&limit=50&offset=0
export async function GET(req: NextRequest) {
  const businessId = req.nextUrl.searchParams.get("businessId");
  if (!businessId) {
    return NextResponse.json({ error: "businessId required" }, { status: 400 });
  }

  const channel = req.nextUrl.searchParams.get("channel");
  const leadId = req.nextUrl.searchParams.get("leadId");
  const limit = parseInt(req.nextUrl.searchParams.get("limit") || "50");
  const offset = parseInt(req.nextUrl.searchParams.get("offset") || "0");

  const db = createServerClient();
  let query = db
    .from("inbox_messages")
    .select(
      `*, lead:leads(id, name, company, linkedin_url, status), contact:contacts(id, name, email)`,
      { count: "exact" }
    )
    .eq("business_id", businessId)
    .order("sent_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (channel) query = query.eq("channel", channel);
  if (leadId) query = query.eq("lead_id", leadId);

  const { data, error, count } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ messages: data || [], total: count || 0 });
}

// PATCH /api/inbox — mark message as read
export async function PATCH(req: NextRequest) {
  const { messageId } = await req.json();
  if (!messageId) {
    return NextResponse.json({ error: "messageId required" }, { status: 400 });
  }

  const db = createServerClient();
  const { data, error } = await db
    .from("inbox_messages")
    .update({ read_at: new Date().toISOString() })
    .eq("id", messageId)
    .is("read_at", null) // only update if not already read
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ message: data });
}
