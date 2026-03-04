import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

// GET /api/invoices?businessId=X&status=&contactId=&limit=50&offset=0
export async function GET(req: NextRequest) {
  const businessId = req.nextUrl.searchParams.get("businessId");
  if (!businessId) {
    return NextResponse.json({ error: "businessId required" }, { status: 400 });
  }

  const status = req.nextUrl.searchParams.get("status");
  const contactId = req.nextUrl.searchParams.get("contactId");
  const limit = parseInt(req.nextUrl.searchParams.get("limit") || "50");
  const offset = parseInt(req.nextUrl.searchParams.get("offset") || "0");

  const db = createServerClient();
  let query = db
    .from("invoices")
    .select("*, contacts:contact_id(name, email, company)", { count: "exact" })
    .eq("business_id", businessId)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (status) query = query.eq("status", status);
  if (contactId) query = query.eq("contact_id", contactId);

  const { data, error, count } = await query;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ invoices: data || [], total: count || 0 });
}

// POST /api/invoices — create a new invoice
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { businessId, userId, contactId, lineItems, dueDate, notes, terms, taxRate } = body;

  if (!businessId || !userId) {
    return NextResponse.json({ error: "businessId and userId required" }, { status: 400 });
  }

  const db = createServerClient();

  // Generate next invoice number for this business
  const { data: lastInvoice } = await db
    .from("invoices")
    .select("invoice_number")
    .eq("business_id", businessId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  let nextNum = 1;
  if (lastInvoice?.invoice_number) {
    const match = lastInvoice.invoice_number.match(/INV-(\d+)/);
    if (match) nextNum = parseInt(match[1]) + 1;
  }
  const invoiceNumber = `INV-${String(nextNum).padStart(4, "0")}`;

  // Calculate totals
  const items = lineItems || [];
  const subtotalCents = items.reduce(
    (sum: number, item: { quantity: number; unit_price_cents: number }) =>
      sum + item.quantity * item.unit_price_cents,
    0
  );
  const rate = parseFloat(taxRate || "0");
  const taxCents = Math.round(subtotalCents * rate);
  const totalCents = subtotalCents + taxCents;

  const { data, error } = await db
    .from("invoices")
    .insert({
      business_id: businessId,
      user_id: userId,
      contact_id: contactId || null,
      invoice_number: invoiceNumber,
      line_items: items,
      subtotal_cents: subtotalCents,
      tax_rate: rate,
      tax_cents: taxCents,
      total_cents: totalCents,
      due_date: dueDate || null,
      notes: notes || null,
      terms: terms || null,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ invoice: data });
}

// PATCH /api/invoices — update an invoice
export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const { invoiceId, ...updates } = body;

  if (!invoiceId) {
    return NextResponse.json({ error: "invoiceId required" }, { status: 400 });
  }

  // Recalculate totals if line items changed
  if (updates.lineItems) {
    const items = updates.lineItems;
    updates.line_items = items;
    delete updates.lineItems;
    updates.subtotal_cents = items.reduce(
      (sum: number, item: { quantity: number; unit_price_cents: number }) =>
        sum + item.quantity * item.unit_price_cents,
      0
    );
    const rate = parseFloat(updates.tax_rate || updates.taxRate || "0");
    updates.tax_rate = rate;
    delete updates.taxRate;
    updates.tax_cents = Math.round(updates.subtotal_cents * rate);
    updates.total_cents = updates.subtotal_cents + updates.tax_cents;
  }

  updates.updated_at = new Date().toISOString();

  const db = createServerClient();
  const { data, error } = await db
    .from("invoices")
    .update(updates)
    .eq("id", invoiceId)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ invoice: data });
}

// DELETE /api/invoices — delete an invoice
export async function DELETE(req: NextRequest) {
  const { invoiceId } = await req.json();
  if (!invoiceId) {
    return NextResponse.json({ error: "invoiceId required" }, { status: 400 });
  }

  const db = createServerClient();
  const { error } = await db.from("invoices").delete().eq("id", invoiceId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
