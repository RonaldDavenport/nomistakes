import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { sendEmail } from "@/lib/email";

// POST /api/invoices/send — send invoice email to contact
export async function POST(req: NextRequest) {
  const { invoiceId, message } = await req.json();

  if (!invoiceId) {
    return NextResponse.json({ error: "invoiceId required" }, { status: 400 });
  }

  const db = createServerClient();

  const { data: invoice, error } = await db
    .from("invoices")
    .select("*, contacts:contact_id(name, email), businesses:business_id(name, slug)")
    .eq("id", invoiceId)
    .single();

  if (error || !invoice) {
    return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
  }

  const contact = invoice.contacts as { name: string; email: string } | null;
  const business = invoice.businesses as { name: string; slug: string } | null;

  if (!contact?.email) {
    return NextResponse.json({ error: "Invoice has no contact email" }, { status: 400 });
  }

  if (!business) {
    return NextResponse.json({ error: "Business not found" }, { status: 500 });
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const invoiceUrl = `${baseUrl}/invoice/${invoice.id}?token=${invoice.access_token}`;
  const totalFormatted = `$${(invoice.total_cents / 100).toFixed(2)}`;

  const html = `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 32px;">
  <h2 style="margin-bottom: 16px;">Invoice from ${business.name}</h2>
  <p>Hi ${contact.name || "there"},</p>
  ${message ? `<p>${message}</p>` : `<p>Please find your invoice below.</p>`}
  <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
    <p style="margin: 4px 0;"><strong>Invoice:</strong> ${invoice.invoice_number}</p>
    <p style="margin: 4px 0;"><strong>Amount:</strong> ${totalFormatted}</p>
    ${invoice.due_date ? `<p style="margin: 4px 0;"><strong>Due:</strong> ${new Date(invoice.due_date).toLocaleDateString()}</p>` : ""}
  </div>
  <p style="margin: 24px 0;">
    <a href="${invoiceUrl}" style="background: #C8A44E; color: #0A0A0A; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600;">View & Pay Invoice</a>
  </p>
  <p>Thank you for your business!</p>
  <p>— ${business.name}</p>
</div>`;

  try {
    await sendEmail({
      businessSlug: business.slug,
      businessName: business.name,
      to: contact.email,
      subject: `Invoice ${invoice.invoice_number} from ${business.name} — ${totalFormatted}`,
      html,
    });

    const now = new Date().toISOString();
    await db
      .from("invoices")
      .update({ status: "sent", sent_at: now, updated_at: now })
      .eq("id", invoiceId);

    // Log activity
    if (invoice.contact_id) {
      await db.from("contact_activity").insert({
        contact_id: invoice.contact_id,
        business_id: invoice.business_id,
        type: "invoice_sent",
        title: `Invoice ${invoice.invoice_number} sent (${totalFormatted})`,
        metadata: { invoice_id: invoiceId },
      });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
