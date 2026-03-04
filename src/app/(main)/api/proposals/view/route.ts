import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

// GET /api/proposals/view?id=X&token=Y — public proposal view (no auth)
export async function GET(req: NextRequest) {
  const proposalId = req.nextUrl.searchParams.get("id");
  const token = req.nextUrl.searchParams.get("token");

  if (!proposalId || !token) {
    return NextResponse.json({ error: "id and token required" }, { status: 400 });
  }

  const db = createServerClient();

  const { data: proposal, error } = await db
    .from("proposals")
    .select("*, contacts(name, email), businesses:business_id(name, brand)")
    .eq("id", proposalId)
    .eq("access_token", token)
    .single();

  if (error || !proposal) {
    return NextResponse.json({ error: "Proposal not found or invalid token" }, { status: 404 });
  }

  // Mark as viewed on first view
  if (!proposal.viewed_at && proposal.status === "sent") {
    const now = new Date().toISOString();
    db.from("proposals")
      .update({ viewed_at: now, status: "viewed", updated_at: now })
      .eq("id", proposalId)
      .then(({ error: upErr }) => {
        if (upErr) console.error("[proposals/view] Update error:", upErr.message);
      });

    // Log activity
    db.from("contact_activity").insert({
      contact_id: proposal.contact_id,
      business_id: proposal.business_id,
      type: "proposal_viewed",
      title: "Proposal viewed",
      description: proposal.title,
      metadata: { proposal_id: proposalId },
    }).then(({ error: actErr }) => {
      if (actErr) console.error("[proposals/view] Activity log error:", actErr.message);
    });
  }

  return NextResponse.json({ proposal });
}
