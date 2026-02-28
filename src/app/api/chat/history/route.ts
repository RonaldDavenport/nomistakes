import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { supabase } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const businessId = req.nextUrl.searchParams.get("businessId");
  if (!businessId) {
    return NextResponse.json({ error: "Missing businessId" }, { status: 400 });
  }

  const db = createServerClient();

  // Verify ownership
  const { data: business } = await db
    .from("businesses")
    .select("id")
    .eq("id", businessId)
    .eq("user_id", user.id)
    .single();

  if (!business) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { data: messages } = await db
    .from("chat_messages")
    .select("role, content")
    .eq("business_id", businessId)
    .order("created_at", { ascending: true })
    .limit(50);

  return NextResponse.json({ messages: messages || [] });
}
