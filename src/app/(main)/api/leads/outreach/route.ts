import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { deductCredits, InsufficientCreditsError } from "@/lib/credits";

// POST /api/leads/outreach — deduct 1 credit, mark lead as reached_out, log inbox message
export async function POST(req: NextRequest) {
  const { businessId, userId, leadId, channel, content, subject } = await req.json();

  if (!businessId || !userId || !leadId || !channel || !content) {
    return NextResponse.json(
      { error: "businessId, userId, leadId, channel, and content are required" },
      { status: 400 }
    );
  }

  const validChannels = ["email", "linkedin", "twitter"];
  if (!validChannels.includes(channel)) {
    return NextResponse.json({ error: `channel must be one of: ${validChannels.join(", ")}` }, { status: 400 });
  }

  const db = createServerClient();

  // Deduct 1 credit (throws InsufficientCreditsError if balance is too low)
  let newBalance: number;
  try {
    newBalance = await deductCredits(userId, businessId, 1, "outreach", { lead_id: leadId, channel });
  } catch (err) {
    if (err instanceof InsufficientCreditsError) {
      return NextResponse.json(
        { error: "Insufficient credits. Purchase more credits to continue outreach.", required: 1, available: err.available },
        { status: 402 }
      );
    }
    throw err;
  }

  const now = new Date().toISOString();

  // Fetch current lead to get credits_spent baseline before updating
  const { data: existing } = await db
    .from("leads")
    .select("credits_spent, status")
    .eq("id", leadId)
    .single();

  // Update lead: mark reached_out and increment credits_spent atomically
  const { error: leadErr } = await db
    .from("leads")
    .update({
      status: "reached_out",
      // Only set reached_out_at on first outreach (when status is still 'new')
      ...(existing?.status === "new" ? { reached_out_at: now } : {}),
      credits_spent: (existing?.credits_spent ?? 0) + 1,
      updated_at: now,
    })
    .eq("id", leadId);

  if (leadErr) {
    console.error("[outreach] lead update error:", leadErr.message);
  }

  // Log the message in inbox_messages
  const { data: message, error: msgErr } = await db
    .from("inbox_messages")
    .insert({
      business_id: businessId,
      lead_id: leadId,
      channel,
      direction: "outbound",
      subject: subject || null,
      content,
      sent_at: now,
    })
    .select()
    .single();

  if (msgErr) {
    console.error("[outreach] inbox_messages insert error:", msgErr.message);
    // Non-fatal — lead was already marked reached_out and credit deducted
  }

  return NextResponse.json({ success: true, credits_remaining: newBalance, message });
}
