import { createServerClient } from "@/lib/supabase";
import { notFound, redirect } from "next/navigation";

// Public invoice page — no auth required, validates access_token

export default async function PublicInvoicePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ token?: string; paid?: string }>;
}) {
  const { id } = await params;
  const { token, paid } = await searchParams;

  if (!token) return notFound();

  const db = createServerClient();

  const { data: invoice, error } = await db
    .from("invoices")
    .select("*, contacts:contact_id(name, email, company), businesses:business_id(name, slug)")
    .eq("id", id)
    .eq("access_token", token)
    .single();

  if (error || !invoice) return notFound();

  // Mark as viewed
  if (!invoice.viewed_at && invoice.status !== "paid") {
    await db
      .from("invoices")
      .update({
        viewed_at: new Date().toISOString(),
        status: invoice.status === "sent" ? "viewed" : invoice.status,
      })
      .eq("id", id);

    if (invoice.contact_id) {
      await db.from("contact_activity").insert({
        contact_id: invoice.contact_id,
        business_id: invoice.business_id,
        type: "invoice_viewed",
        title: `Invoice ${invoice.invoice_number} viewed`,
        metadata: { invoice_id: id },
      });
    }
  }

  // Handle paid redirect
  if (paid === "true" && invoice.status !== "paid") {
    await db
      .from("invoices")
      .update({ status: "paid", paid_at: new Date().toISOString() })
      .eq("id", id);
    redirect(`/invoice/${id}?token=${token}`);
  }

  const business = invoice.businesses as { name: string; slug: string } | null;
  const contact = invoice.contacts as { name: string; email: string; company: string | null } | null;
  const lineItems = invoice.line_items as { name: string; description?: string; quantity: number; unit_price_cents: number }[];
  const isPaid = invoice.status === "paid";
  const isOverdue = !isPaid && invoice.due_date && new Date(invoice.due_date) < new Date();

  const gold = "#C8A44E";
  const bg = "#09090B";
  const surface = "#111113";
  const border = "#27272A";
  const text = "#FAFAFA";
  const text2 = "#A1A1AA";
  const text3 = "#52525B";
  const green = "#22C55E";

  return (
    <div style={{ minHeight: "100vh", background: bg, padding: "40px 20px", fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ maxWidth: 640, margin: "0 auto" }}>
        {/* Business header */}
        <div style={{ marginBottom: 32, textAlign: "center" }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: text, margin: "0 0 4px" }}>
            {business?.name || "Invoice"}
          </h1>
          <p style={{ fontSize: 13, color: text3 }}>Invoice {invoice.invoice_number}</p>
        </div>

        {/* Status banner */}
        {isPaid && (
          <div style={{
            textAlign: "center", padding: "14px 0", marginBottom: 24,
            borderRadius: 8, background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.2)",
          }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: green }}>Paid</span>
            {invoice.paid_at && (
              <span style={{ fontSize: 12, color: text2, marginLeft: 8 }}>
                on {new Date(invoice.paid_at).toLocaleDateString()}
              </span>
            )}
          </div>
        )}
        {isOverdue && !isPaid && (
          <div style={{
            textAlign: "center", padding: "14px 0", marginBottom: 24,
            borderRadius: 8, background: "rgba(249,115,22,0.1)", border: "1px solid rgba(249,115,22,0.2)",
          }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: "#F97316" }}>Overdue</span>
          </div>
        )}

        {/* Client info */}
        <div style={{ marginBottom: 24, padding: "16px 20px", background: surface, borderRadius: 10, border: `1px solid ${border}` }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div>
              <p style={{ fontSize: 11, fontWeight: 600, color: text3, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>
                Billed to
              </p>
              <p style={{ fontSize: 14, fontWeight: 500, color: text }}>{contact?.name || "—"}</p>
              {contact?.email && <p style={{ fontSize: 12, color: text2 }}>{contact.email}</p>}
              {contact?.company && <p style={{ fontSize: 12, color: text3 }}>{contact.company}</p>}
            </div>
            <div style={{ textAlign: "right" }}>
              {invoice.due_date && (
                <>
                  <p style={{ fontSize: 11, fontWeight: 600, color: text3, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>
                    Due date
                  </p>
                  <p style={{ fontSize: 14, fontWeight: 500, color: isOverdue ? "#F97316" : text }}>
                    {new Date(invoice.due_date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                  </p>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Line items */}
        <div style={{ marginBottom: 24 }}>
          <div style={{
            display: "grid", gridTemplateColumns: "2fr 60px 100px 100px",
            gap: 12, padding: "8px 0",
            borderBottom: `1px solid ${border}`,
            fontSize: 11, fontWeight: 600, color: text3,
            textTransform: "uppercase", letterSpacing: "0.06em",
          }}>
            <span>Item</span>
            <span style={{ textAlign: "right" }}>Qty</span>
            <span style={{ textAlign: "right" }}>Price</span>
            <span style={{ textAlign: "right" }}>Total</span>
          </div>
          {lineItems.map((item, i) => (
            <div
              key={i}
              style={{
                display: "grid", gridTemplateColumns: "2fr 60px 100px 100px",
                gap: 12, padding: "14px 0",
                borderBottom: `1px solid ${border}`,
                alignItems: "center",
              }}
            >
              <div>
                <p style={{ fontSize: 14, fontWeight: 500, color: text }}>{item.name}</p>
                {item.description && <p style={{ fontSize: 12, color: text3, marginTop: 2 }}>{item.description}</p>}
              </div>
              <span style={{ fontSize: 13, color: text2, textAlign: "right", fontVariantNumeric: "tabular-nums" }}>
                {item.quantity}
              </span>
              <span style={{ fontSize: 13, color: text2, textAlign: "right", fontVariantNumeric: "tabular-nums" }}>
                ${(item.unit_price_cents / 100).toFixed(2)}
              </span>
              <span style={{ fontSize: 13, fontWeight: 600, color: text, textAlign: "right", fontVariantNumeric: "tabular-nums" }}>
                ${((item.quantity * item.unit_price_cents) / 100).toFixed(2)}
              </span>
            </div>
          ))}

          {/* Totals */}
          <div style={{ padding: "16px 0", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
            {invoice.tax_cents > 0 && (
              <>
                <div style={{ display: "flex", gap: 40 }}>
                  <span style={{ fontSize: 13, color: text3 }}>Subtotal</span>
                  <span style={{ fontSize: 13, color: text, fontVariantNumeric: "tabular-nums", minWidth: 80, textAlign: "right" }}>
                    ${(invoice.subtotal_cents / 100).toFixed(2)}
                  </span>
                </div>
                <div style={{ display: "flex", gap: 40 }}>
                  <span style={{ fontSize: 13, color: text3 }}>Tax</span>
                  <span style={{ fontSize: 13, color: text, fontVariantNumeric: "tabular-nums", minWidth: 80, textAlign: "right" }}>
                    ${(invoice.tax_cents / 100).toFixed(2)}
                  </span>
                </div>
              </>
            )}
            <div style={{ display: "flex", gap: 40, marginTop: 8 }}>
              <span style={{ fontSize: 16, fontWeight: 700, color: text }}>Total</span>
              <span style={{ fontSize: 16, fontWeight: 700, color: text, fontVariantNumeric: "tabular-nums", minWidth: 80, textAlign: "right" }}>
                ${(invoice.total_cents / 100).toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Notes */}
        {invoice.notes && (
          <div style={{ marginBottom: 24 }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: text3, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>
              Notes
            </p>
            <p style={{ fontSize: 13, color: text2, lineHeight: 1.6 }}>{invoice.notes}</p>
          </div>
        )}

        {/* Pay button */}
        {!isPaid && (
          <form action={`/api/invoices/pay`} method="POST" style={{ textAlign: "center" }}>
            <input type="hidden" name="invoiceId" value={invoice.id} />
            <input type="hidden" name="accessToken" value={token} />
            <button
              type="submit"
              style={{
                background: gold,
                color: bg,
                border: "none",
                borderRadius: 10,
                padding: "16px 48px",
                fontSize: 16,
                fontWeight: 700,
                cursor: "pointer",
                fontFamily: "'DM Sans', sans-serif",
              }}
              onClick={async (e) => {
                e.preventDefault();
                const res = await fetch("/api/invoices/pay", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ invoiceId: invoice.id, accessToken: token }),
                });
                const data = await res.json();
                if (data.url) window.location.href = data.url;
              }}
            >
              Pay ${(invoice.total_cents / 100).toFixed(2)}
            </button>
          </form>
        )}

        {/* Footer */}
        <div style={{ textAlign: "center", marginTop: 40, paddingTop: 20, borderTop: `1px solid ${border}` }}>
          <p style={{ fontSize: 11, color: text3 }}>
            Powered by <span style={{ color: gold, fontWeight: 600 }}>kovra</span>
          </p>
        </div>
      </div>
    </div>
  );
}
