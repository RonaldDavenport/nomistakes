import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

// POST /api/invoices/from-proposal — generate invoice from accepted proposal
export async function POST(req: NextRequest) {
  const { proposalId, userId, dueDate } = await req.json();

  if (!proposalId || !userId) {
    return NextResponse.json({ error: "proposalId and userId required" }, { status: 400 });
  }

  const db = createServerClient();

  const { data: proposal, error } = await db
    .from("proposals")
    .select("*")
    .eq("id", proposalId)
    .single();

  if (error || !proposal) {
    return NextResponse.json({ error: "Proposal not found" }, { status: 404 });
  }

  // Generate next invoice number
  const { data: lastInvoice } = await db
    .from("invoices")
    .select("invoice_number")
    .eq("business_id", proposal.business_id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  let nextNum = 1;
  if (lastInvoice?.invoice_number) {
    const match = lastInvoice.invoice_number.match(/INV-(\d+)/);
    if (match) nextNum = parseInt(match[1]) + 1;
  }
  const invoiceNumber = `INV-${String(nextNum).padStart(4, "0")}`;

  // Extract line items from proposal pricing
  const pricing = proposal.pricing as {
    line_items?: { name: string; description?: string; amount_cents: number }[];
    total_cents?: number;
  } | null;

  const lineItems = (pricing?.line_items || []).map((item) => ({
    name: item.name,
    description: item.description || "",
    quantity: 1,
    unit_price_cents: item.amount_cents,
  }));

  const subtotalCents = lineItems.reduce((sum, item) => sum + item.quantity * item.unit_price_cents, 0);

  // Default due date: 30 days from now
  const defaultDue = new Date();
  defaultDue.setDate(defaultDue.getDate() + 30);

  const { data: invoice, error: insertError } = await db
    .from("invoices")
    .insert({
      business_id: proposal.business_id,
      user_id: userId,
      contact_id: proposal.contact_id,
      proposal_id: proposalId,
      invoice_number: invoiceNumber,
      line_items: lineItems,
      subtotal_cents: subtotalCents,
      total_cents: subtotalCents,
      due_date: dueDate || defaultDue.toISOString(),
      notes: `Generated from proposal: ${proposal.title}`,
    })
    .select()
    .single();

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  return NextResponse.json({ invoice });
}
