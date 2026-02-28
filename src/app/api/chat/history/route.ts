import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  const businessId = req.nextUrl.searchParams.get("businessId");
  if (!businessId) {
    return NextResponse.json({ error: "Missing businessId" }, { status: 400 });
  }

  const db = createServerClient();

  const { data: messages } = await db
    .from("chat_messages")
    .select("role, content")
    .eq("business_id", businessId)
    .order("created_at", { ascending: true })
    .limit(50);

  return NextResponse.json({ messages: messages || [] });
}
