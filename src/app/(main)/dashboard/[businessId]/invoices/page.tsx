"use client";

import { useBusinessContext } from "@/components/dashboard/BusinessProvider";
import { PaywallGate } from "@/components/dashboard/PaywallGate";
import { T, CTA_GRAD } from "@/lib/design-tokens";
import { useParams } from "next/navigation";
import { useState, useEffect, useCallback } from "react";

interface LineItem {
  name: string;
  description: string;
  quantity: number;
  unit_price_cents: number;
}

interface Invoice {
  id: string;
  invoice_number: string;
  status: string;
  total_cents: number;
  due_date: string | null;
  sent_at: string | null;
  paid_at: string | null;
  created_at: string;
  line_items: LineItem[];
  contacts: { name: string; email: string; company: string | null } | null;
  recurring?: boolean;
  recurring_interval?: string | null;
  deposit_amount?: number | null;
  deposit_paid?: boolean;
}

const STATUS_COLORS: Record<string, string> = {
  draft: T.text3,
  sent: T.gold,
  viewed: T.blue,
  paid: T.green,
  overdue: T.orange,
  cancelled: T.red,
};

function fmt(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

function statusLabel(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export default function InvoicesPage() {
  const params = useParams();
  const businessId = params.businessId as string;
  const { userId } = useBusinessContext();

  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState<string | null>(null);

  // Create form
  const [contactId, setContactId] = useState("");
  const [contacts, setContacts] = useState<{ id: string; name: string; email: string }[]>([]);
  const [items, setItems] = useState<LineItem[]>([{ name: "", description: "", quantity: 1, unit_price_cents: 0 }]);
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState("");
  const [recurring, setRecurring] = useState(false);
  const [recurringInterval, setRecurringInterval] = useState<"weekly" | "monthly" | "quarterly">("monthly");
  const [depositEnabled, setDepositEnabled] = useState(false);
  const [depositAmount, setDepositAmount] = useState("");

  const fetchInvoices = useCallback(async () => {
    setLoading(true);
    const qs = new URLSearchParams({ businessId });
    if (filter) qs.set("status", filter);
    const res = await fetch(`/api/invoices?${qs}`);
    const data = await res.json();
    setInvoices(data.invoices || []);
    setLoading(false);
  }, [businessId, filter]);

  const fetchContacts = useCallback(async () => {
    const res = await fetch(`/api/contacts?businessId=${businessId}&limit=200`);
    const data = await res.json();
    setContacts((data.contacts || []).map((c: { id: string; name: string; email: string }) => ({
      id: c.id, name: c.name || "", email: c.email,
    })));
  }, [businessId]);

  useEffect(() => { fetchInvoices(); }, [fetchInvoices]);
  useEffect(() => { fetchContacts(); }, [fetchContacts]);

  const createInvoice = async () => {
    setSaving(true);
    const res = await fetch("/api/invoices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        businessId,
        userId,
        contactId: contactId || null,
        lineItems: items.filter((i) => i.name),
        dueDate: dueDate || null,
        notes: notes || null,
        recurring: recurring || null,
        recurringInterval: recurring ? recurringInterval : null,
        depositAmount: depositEnabled && depositAmount ? Math.round(parseFloat(depositAmount) * 100) : null,
      }),
    });
    if (res.ok) {
      setShowCreate(false);
      setItems([{ name: "", description: "", quantity: 1, unit_price_cents: 0 }]);
      setContactId(""); setDueDate(""); setNotes("");
      setRecurring(false); setDepositEnabled(false); setDepositAmount("");
      fetchInvoices();
    }
    setSaving(false);
  };

  const sendInvoice = async (invoiceId: string) => {
    setSending(invoiceId);
    await fetch("/api/invoices/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ invoiceId }),
    });
    setSending(null);
    fetchInvoices();
  };

  const markPaid = async (invoiceId: string) => {
    await fetch("/api/invoices", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ invoiceId, status: "paid", paid_at: new Date().toISOString() }),
    });
    fetchInvoices();
  };

  // Stats
  const outstanding = invoices
    .filter((i) => ["sent", "viewed", "overdue"].includes(i.status))
    .reduce((s, i) => s + i.total_cents, 0);
  const paidThisMonth = invoices
    .filter((i) => i.status === "paid" && i.paid_at && new Date(i.paid_at).getMonth() === new Date().getMonth())
    .reduce((s, i) => s + i.total_cents, 0);
  const overdueCount = invoices.filter((i) => i.status === "overdue" || (i.due_date && new Date(i.due_date) < new Date() && !["paid", "cancelled", "draft"].includes(i.status))).length;

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "10px 12px",
    fontSize: 13,
    background: T.bgAlt,
    border: `1px solid ${T.border}`,
    borderRadius: 8,
    color: T.text,
    outline: "none",
  };

  const selectStyle: React.CSSProperties = {
    ...inputStyle,
    appearance: "none" as const,
  };

  const hrStyle: React.CSSProperties = {
    border: "none",
    borderTop: "1px solid #1E1E21",
    margin: 0,
  };

  return (
    <PaywallGate
      requiredPlan="starter"
      teaser={{ headline: "Invoicing", description: "Send professional invoices, track payments, and get paid faster.", bullets: ["Create and send invoices", "Automatic payment tracking", "Stripe checkout integration"] }}
    >
      <div style={{ padding: "32px 40px 80px" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: T.text, letterSpacing: "-0.02em", margin: 0 }}>
              Invoices
            </h1>
            <p style={{ fontSize: 13, color: "#9CA3AF", marginTop: 2 }}>
              {invoices.length} total
            </p>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            style={{
              background: CTA_GRAD,
              color: "#09090B",
              border: "none",
              borderRadius: 8,
              padding: "10px 20px",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            + New Invoice
          </button>
        </div>

        <hr style={hrStyle} />

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 40, padding: "28px 0" }}>
          <div>
            <p style={{ fontSize: 11, fontWeight: 600, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>
              Outstanding
            </p>
            <p style={{ fontSize: 24, fontWeight: 700, color: T.text, fontVariantNumeric: "tabular-nums" }}>
              {fmt(outstanding)}
            </p>
          </div>
          <div>
            <p style={{ fontSize: 11, fontWeight: 600, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>
              Paid this month
            </p>
            <p style={{ fontSize: 24, fontWeight: 700, color: T.green, fontVariantNumeric: "tabular-nums" }}>
              {fmt(paidThisMonth)}
            </p>
          </div>
          <div>
            <p style={{ fontSize: 11, fontWeight: 600, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>
              Overdue
            </p>
            <p style={{ fontSize: 24, fontWeight: 700, color: overdueCount > 0 ? T.orange : T.text, fontVariantNumeric: "tabular-nums" }}>
              {overdueCount}
            </p>
          </div>
        </div>

        <hr style={hrStyle} />

        {/* Filter */}
        <div style={{ display: "flex", gap: 8, padding: "20px 0" }}>
          {["", "draft", "sent", "viewed", "paid", "overdue"].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              style={{
                padding: "6px 14px",
                fontSize: 12,
                fontWeight: 500,
                borderRadius: 6,
                border: `1px solid ${filter === s ? T.gold : T.border}`,
                background: filter === s ? T.goldDim : "transparent",
                color: filter === s ? T.gold : "#9CA3AF",
                cursor: "pointer",
              }}
            >
              {s ? statusLabel(s) : "All"}
            </button>
          ))}
        </div>

        <hr style={hrStyle} />

        {/* Invoice list */}
        {loading ? (
          <p style={{ color: "#9CA3AF", fontSize: 13, paddingTop: 32 }}>Loading...</p>
        ) : invoices.length === 0 ? (
          <div style={{ padding: "48px 0 32px" }}>
            {/* Empty state: educational content */}
            <div style={{ maxWidth: 600 }}>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: T.text, margin: "0 0 8px", letterSpacing: "-0.01em" }}>
                Get paid faster with professional invoices
              </h2>
              <p style={{ fontSize: 14, lineHeight: 1.6, color: "#9CA3AF", margin: "0 0 32px" }}>
                Create itemized invoices, send them to clients via email, and track payment
                status all in one place. Clients receive a secure link to view and pay online
                through Stripe.
              </p>

              <hr style={hrStyle} />

              <div style={{ padding: "28px 0" }}>
                <h3 style={{ fontSize: 13, fontWeight: 600, color: T.text, textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 20px" }}>
                  How it works
                </h3>

                <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                  <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
                    <span style={{
                      display: "inline-flex", alignItems: "center", justifyContent: "center",
                      width: 28, height: 28, minWidth: 28, borderRadius: 8,
                      background: T.goldDim, color: T.gold, fontSize: 12, fontWeight: 700,
                    }}>
                      1
                    </span>
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 600, color: T.text, margin: "0 0 4px" }}>
                        Create an invoice
                      </p>
                      <p style={{ fontSize: 13, color: "#9CA3AF", margin: 0, lineHeight: 1.5 }}>
                        Add line items with descriptions and pricing. Select a client from your
                        contacts or create one on the fly. Set a due date and optional notes.
                      </p>
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
                    <span style={{
                      display: "inline-flex", alignItems: "center", justifyContent: "center",
                      width: 28, height: 28, minWidth: 28, borderRadius: 8,
                      background: T.goldDim, color: T.gold, fontSize: 12, fontWeight: 700,
                    }}>
                      2
                    </span>
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 600, color: T.text, margin: "0 0 4px" }}>
                        Send it to your client
                      </p>
                      <p style={{ fontSize: 13, color: "#9CA3AF", margin: 0, lineHeight: 1.5 }}>
                        Hit send and your client receives a professional email with a secure payment
                        link. No back-and-forth with PDFs or bank details.
                      </p>
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
                    <span style={{
                      display: "inline-flex", alignItems: "center", justifyContent: "center",
                      width: 28, height: 28, minWidth: 28, borderRadius: 8,
                      background: T.goldDim, color: T.gold, fontSize: 12, fontWeight: 700,
                    }}>
                      3
                    </span>
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 600, color: T.text, margin: "0 0 4px" }}>
                        Track and get paid
                      </p>
                      <p style={{ fontSize: 13, color: "#9CA3AF", margin: 0, lineHeight: 1.5 }}>
                        See when invoices are viewed, paid, or overdue. Payments are processed
                        through Stripe and deposited directly to your account.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <hr style={hrStyle} />

              <div style={{ padding: "28px 0 0" }}>
                <h3 style={{ fontSize: 13, fontWeight: 600, color: T.text, textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 16px" }}>
                  Invoice statuses
                </h3>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 24 }}>
                  {[
                    { label: "Draft", desc: "Created but not yet sent", color: "#52525B" },
                    { label: "Sent", desc: "Delivered to client email", color: T.gold },
                    { label: "Viewed", desc: "Client opened the invoice", color: T.blue },
                    { label: "Paid", desc: "Payment received", color: T.green },
                    { label: "Overdue", desc: "Past the due date", color: T.orange },
                  ].map((st) => (
                    <div key={st.label} style={{ minWidth: 140 }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: st.color, margin: "0 0 2px" }}>
                        {st.label}
                      </p>
                      <p style={{ fontSize: 12, color: "#52525B", margin: 0 }}>
                        {st.desc}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ paddingTop: 32 }}>
                <button
                  onClick={() => setShowCreate(true)}
                  style={{
                    background: CTA_GRAD,
                    color: "#09090B",
                    border: "none",
                    borderRadius: 8,
                    padding: "10px 20px",
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Create your first invoice
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div style={{ paddingTop: 4 }}>
            {/* Table header */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "100px 1.5fr 1fr 100px 100px 120px",
              gap: 12,
              padding: "8px 0",
              borderBottom: "1px solid #1E1E21",
              fontSize: 11,
              fontWeight: 600,
              color: "#9CA3AF",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
            }}>
              <span>Invoice</span>
              <span>Client</span>
              <span>Amount</span>
              <span>Status</span>
              <span>Due</span>
              <span style={{ textAlign: "right" }}>Actions</span>
            </div>
            {invoices.map((inv) => (
              <div
                key={inv.id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "100px 1.5fr 1fr 100px 100px 120px",
                  gap: 12,
                  padding: "14px 0",
                  borderBottom: "1px solid #1E1E21",
                  alignItems: "center",
                }}
              >
                <div>
                  <span style={{ fontSize: 13, fontWeight: 600, color: T.text, fontVariantNumeric: "tabular-nums" }}>
                    {inv.invoice_number}
                  </span>
                  {inv.recurring && (
                    <span style={{ fontSize: 10, fontWeight: 500, marginLeft: 6, padding: "1px 6px", borderRadius: 4, background: "rgba(59,130,246,0.1)", color: T.blue }}>
                      Recurring
                    </span>
                  )}
                  {inv.deposit_amount && !inv.deposit_paid && (
                    <span style={{ fontSize: 10, fontWeight: 500, marginLeft: 4, padding: "1px 6px", borderRadius: 4, background: "rgba(245,158,11,0.1)", color: T.orange }}>
                      Deposit due
                    </span>
                  )}
                  {inv.deposit_amount && inv.deposit_paid && (
                    <span style={{ fontSize: 10, fontWeight: 500, marginLeft: 4, padding: "1px 6px", borderRadius: 4, background: "rgba(34,197,94,0.1)", color: T.green }}>
                      Deposit paid
                    </span>
                  )}
                </div>
                <div>
                  <span style={{ fontSize: 13, fontWeight: 500, color: T.text }}>
                    {inv.contacts?.name || "\u2014"}
                  </span>
                  {inv.contacts?.email && (
                    <span style={{ fontSize: 12, color: "#9CA3AF", marginLeft: 6 }}>{inv.contacts.email}</span>
                  )}
                </div>
                <span style={{ fontSize: 14, fontWeight: 600, color: T.text, fontVariantNumeric: "tabular-nums" }}>
                  {fmt(inv.total_cents)}
                </span>
                <span style={{
                  fontSize: 12, fontWeight: 500,
                  color: STATUS_COLORS[inv.status] || "#9CA3AF",
                }}>
                  {statusLabel(inv.status)}
                </span>
                <span style={{ fontSize: 12, color: "#9CA3AF" }}>
                  {inv.due_date ? new Date(inv.due_date).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "\u2014"}
                </span>
                <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                  {inv.status === "draft" && (
                    <button
                      onClick={() => sendInvoice(inv.id)}
                      disabled={sending === inv.id}
                      style={{
                        fontSize: 12, fontWeight: 500, color: T.gold,
                        background: "none", border: "none", cursor: "pointer", padding: 0,
                      }}
                    >
                      {sending === inv.id ? "Sending..." : "Send"}
                    </button>
                  )}
                  {["sent", "viewed", "overdue"].includes(inv.status) && (
                    <button
                      onClick={() => markPaid(inv.id)}
                      style={{
                        fontSize: 12, fontWeight: 500, color: T.green,
                        background: "none", border: "none", cursor: "pointer", padding: 0,
                      }}
                    >
                      Mark paid
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create modal */}
        {showCreate && (
          <>
            <div
              style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 50 }}
              onClick={() => setShowCreate(false)}
            />
            <div
              style={{
                position: "fixed",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                width: 560,
                maxHeight: "85vh",
                overflowY: "auto",
                background: T.bgEl,
                border: `1px solid ${T.border}`,
                borderRadius: 12,
                padding: 28,
                zIndex: 51,
              }}
            >
              <h2 style={{ fontSize: 18, fontWeight: 700, color: T.text, marginBottom: 20 }}>
                New Invoice
              </h2>

              <label style={{ display: "block", marginBottom: 16 }}>
                <span style={{ fontSize: 12, fontWeight: 500, color: "#9CA3AF", display: "block", marginBottom: 6 }}>Client</span>
                <select value={contactId} onChange={(e) => setContactId(e.target.value)} style={selectStyle}>
                  <option value="">Select a client...</option>
                  {contacts.map((c) => (
                    <option key={c.id} value={c.id}>{c.name || c.email}</option>
                  ))}
                </select>
              </label>

              <div style={{ marginBottom: 16 }}>
                <span style={{ fontSize: 12, fontWeight: 500, color: "#9CA3AF", display: "block", marginBottom: 8 }}>Line Items</span>
                {items.map((item, idx) => (
                  <div key={idx} style={{ display: "grid", gridTemplateColumns: "2fr 60px 100px 32px", gap: 8, marginBottom: 8 }}>
                    <input
                      placeholder="Item name"
                      value={item.name}
                      onChange={(e) => {
                        const updated = [...items];
                        updated[idx].name = e.target.value;
                        setItems(updated);
                      }}
                      style={inputStyle}
                    />
                    <input
                      type="number"
                      placeholder="Qty"
                      value={item.quantity || ""}
                      onChange={(e) => {
                        const updated = [...items];
                        updated[idx].quantity = parseInt(e.target.value) || 1;
                        setItems(updated);
                      }}
                      style={inputStyle}
                    />
                    <input
                      type="number"
                      placeholder="Price"
                      value={item.unit_price_cents ? item.unit_price_cents / 100 : ""}
                      onChange={(e) => {
                        const updated = [...items];
                        updated[idx].unit_price_cents = Math.round(parseFloat(e.target.value || "0") * 100);
                        setItems(updated);
                      }}
                      style={inputStyle}
                    />
                    {items.length > 1 && (
                      <button
                        onClick={() => setItems(items.filter((_, i) => i !== idx))}
                        style={{ background: "none", border: "none", color: "#9CA3AF", cursor: "pointer", fontSize: 16 }}
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
                <button
                  onClick={() => setItems([...items, { name: "", description: "", quantity: 1, unit_price_cents: 0 }])}
                  style={{
                    fontSize: 12, color: T.gold, background: "none",
                    border: "none", cursor: "pointer", padding: 0, fontWeight: 500,
                  }}
                >
                  + Add line item
                </button>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
                <span style={{ fontSize: 16, fontWeight: 700, color: T.text, fontVariantNumeric: "tabular-nums" }}>
                  Total: {fmt(items.reduce((s, i) => s + i.quantity * i.unit_price_cents, 0))}
                </span>
              </div>

              <label style={{ display: "block", marginBottom: 16 }}>
                <span style={{ fontSize: 12, fontWeight: 500, color: "#9CA3AF", display: "block", marginBottom: 6 }}>Due Date</span>
                <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} style={inputStyle} />
              </label>

              <label style={{ display: "block", marginBottom: 20 }}>
                <span style={{ fontSize: 12, fontWeight: 500, color: "#9CA3AF", display: "block", marginBottom: 6 }}>Notes (optional)</span>
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} style={{ ...inputStyle, resize: "vertical" }} />
              </label>

              {/* Recurring */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
                  <input type="checkbox" checked={recurring} onChange={(e) => setRecurring(e.target.checked)} style={{ width: 16, height: 16 }} />
                  <span style={{ fontSize: 13, color: T.text }}>Recurring invoice</span>
                </label>
                {recurring && (
                  <select
                    value={recurringInterval}
                    onChange={(e) => setRecurringInterval(e.target.value as typeof recurringInterval)}
                    style={{ ...selectStyle, marginTop: 8 }}
                  >
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                  </select>
                )}
              </div>

              {/* Deposit */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
                  <input type="checkbox" checked={depositEnabled} onChange={(e) => setDepositEnabled(e.target.checked)} style={{ width: 16, height: 16 }} />
                  <span style={{ fontSize: 13, color: T.text }}>Require deposit</span>
                </label>
                {depositEnabled && (
                  <input
                    type="number"
                    placeholder="Deposit amount ($)"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    style={{ ...inputStyle, marginTop: 8 }}
                  />
                )}
              </div>

              <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
                <button
                  onClick={() => setShowCreate(false)}
                  style={{
                    padding: "10px 20px", fontSize: 13, fontWeight: 500,
                    background: "none", border: `1px solid ${T.border}`,
                    borderRadius: 8, color: "#9CA3AF", cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={createInvoice}
                  disabled={saving || !items.some((i) => i.name && i.unit_price_cents > 0)}
                  style={{
                    padding: "10px 20px", fontSize: 13, fontWeight: 600,
                    background: CTA_GRAD, border: "none",
                    borderRadius: 8, color: "#09090B", cursor: "pointer",
                    opacity: saving ? 0.6 : 1,
                  }}
                >
                  {saving ? "Creating..." : "Create Invoice"}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </PaywallGate>
  );
}
