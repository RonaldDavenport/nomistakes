import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

// GET /api/notifications?userId=X — get unread + recent notifications
export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get("userId");
  if (!userId) {
    return NextResponse.json({ error: "userId required" }, { status: 400 });
  }

  const db = createServerClient();
  const { data, error } = await db
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const unreadCount = (data || []).filter((n) => !n.is_read).length;

  return NextResponse.json({ notifications: data || [], unreadCount });
}

// PATCH /api/notifications — mark notifications as read
export async function PATCH(req: NextRequest) {
  const { notificationIds, markAllRead, userId } = await req.json();

  const db = createServerClient();

  if (markAllRead && userId) {
    const { error } = await db
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", userId)
      .eq("is_read", false);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  } else if (notificationIds && Array.isArray(notificationIds)) {
    const { error } = await db
      .from("notifications")
      .update({ is_read: true })
      .in("id", notificationIds);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  return NextResponse.json({ success: true });
}

// POST /api/notifications — create a notification (internal use)
export async function POST(req: NextRequest) {
  const { userId, businessId, type, title, body, data } = await req.json();

  if (!userId || !type || !title || !body) {
    return NextResponse.json({ error: "userId, type, title, and body required" }, { status: 400 });
  }

  const db = createServerClient();
  const { data: notification, error } = await db
    .from("notifications")
    .insert({
      user_id: userId,
      business_id: businessId || null,
      type,
      title,
      body,
      data: data || {},
      sent_via: ["in_app"],
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ notification });
}
