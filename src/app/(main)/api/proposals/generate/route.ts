import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { executeAIAction, parseAIJson, InsufficientCreditsError } from "@/lib/ai-actions";
import { randomBytes } from "crypto";

// POST /api/proposals/generate — AI-generate a proposal
export async function POST(req: NextRequest) {
  const { businessId, userId, contactId, discoveryCallId, projectDescription, budget } = await req.json();

  if (!businessId || !userId || !contactId || !projectDescription) {
    return NextResponse.json(
      { error: "businessId, userId, contactId, and projectDescription are required" },
      { status: 400 }
    );
  }

  const db = createServerClient();

  // Fetch contact info
  const { data: contact } = await db
    .from("contacts")
    .select("name, email, company")
    .eq("id", contactId)
    .single();

  if (!contact) {
    return NextResponse.json({ error: "Contact not found" }, { status: 404 });
  }

  // Fetch call notes if linked to a discovery call
  let callNotes = "";
  if (discoveryCallId) {
    const { data: call } = await db
      .from("discovery_calls")
      .select("call_notes, notes, outcome")
      .eq("id", discoveryCallId)
      .single();
    if (call) {
      callNotes = [call.call_notes, call.notes, call.outcome].filter(Boolean).join("\n");
    }
  }

  const systemPrompt = `You are a professional proposal writer for service businesses. Generate a detailed, compelling proposal based on the project description and client context.

Return valid JSON with this structure:
{
  "title": "Proposal title",
  "scope": {
    "overview": "2-3 paragraph project overview",
    "deliverables": ["deliverable 1", "deliverable 2", ...],
    "timeline": "Timeline description (e.g. '4-6 weeks')",
    "terms": "Payment terms and conditions"
  },
  "pricing": {
    "line_items": [
      { "name": "Item name", "description": "Brief description", "amount_cents": 50000 }
    ],
    "total_cents": 150000
  },
  "valid_days": 30
}

Guidelines:
- Be specific to the project description
- Price in cents (e.g. $500 = 50000)
- Include 3-7 deliverables
- Make the overview professional but warm
- If a budget is mentioned, work within that range
- Terms should mention 50% upfront, 50% on completion`;

  let userPrompt = `Client: ${contact.name}${contact.company ? ` (${contact.company})` : ""}
Project: ${projectDescription}`;
  if (budget) userPrompt += `\nBudget: ${budget}`;
  if (callNotes) userPrompt += `\nDiscovery call notes: ${callNotes}`;

  try {
    const result = await executeAIAction({
      businessId,
      userId,
      action: "proposal_generation",
      creditCost: 10,
      model: "claude-sonnet-4-5-20250929",
      systemPrompt,
      userPrompt,
      maxTokens: 4096,
    });

    const generated = parseAIJson<{
      title: string;
      scope: { overview: string; deliverables: string[]; timeline: string; terms: string };
      pricing: { line_items: { name: string; description: string; amount_cents: number }[]; total_cents: number };
      valid_days: number;
    }>(result.content);

    // Create the proposal
    const accessToken = randomBytes(32).toString("hex");
    const validUntil = new Date();
    validUntil.setDate(validUntil.getDate() + (generated.valid_days || 30));

    const { data: proposal, error } = await db
      .from("proposals")
      .insert({
        business_id: businessId,
        user_id: userId,
        contact_id: contactId,
        discovery_call_id: discoveryCallId || null,
        title: generated.title,
        access_token: accessToken,
        status: "draft",
        scope: generated.scope,
        pricing: generated.pricing,
        valid_until: validUntil.toISOString(),
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Log activity
    db.from("contact_activity").insert({
      contact_id: contactId,
      business_id: businessId,
      type: "proposal_created",
      title: "Proposal created",
      description: generated.title,
      metadata: { proposal_id: proposal.id },
    }).then(({ error: actErr }) => {
      if (actErr) console.error("[proposals/generate] Activity log error:", actErr.message);
    });

    return NextResponse.json({
      proposal,
      creditsRemaining: result.creditsRemaining,
    }, { status: 201 });
  } catch (err) {
    if (err instanceof InsufficientCreditsError) {
      return NextResponse.json({ error: err.message }, { status: 402 });
    }
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[proposals/generate] Error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
