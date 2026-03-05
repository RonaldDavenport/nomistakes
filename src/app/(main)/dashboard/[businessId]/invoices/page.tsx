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

const STATUS_BG: Record<string, string> = {
  draft: "rgba(255,255,255,0.06)",
  sent: "rgba(200,164,78,0.12)",
  viewed: "rgba(59,130,246,0.12)",
  paid: "rgba(34,197,94,0.12)",
  overdue: "rgba(249,115,22,0.12)",
  cancelled: "rgba(239,68,68,0.12)",
};

function fmt(cents: number) {
  return `$${(cents / 100).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
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
        businessId, userId,
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

  const outstanding = invoices
    .filter((i) => ["sent", "viewed", "overdue"].includes(i.status))
    .reduce((s, i) => s + i.total_cents, 0);
  const paidThisMonth = invoices
    .filter((i) => i.status === "paid" && i.paid_at && new Date(i.paid_at).getMonth() === new Date().getMonth())
    .reduce((s, i) => s + i.total_cents, 0);
  const overdueCount = invoices.filter((i) =>
    i.status === "overdue" || (i.due_date && new Date(i.due_date) < new Date() && !["paid", "cancelled", "draft"].includes(i.status))
  ).length;

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "10px 12px", fontSize: 13,
    background: T.bgAlt, border: `1px solid ${T.border}`,
    borderRadius: 8, color: T.text, outline: "none",
  };

  return (
    <PaywallGate
      requiredPlan="solo"
      teaser={{ headline: "Invoicing", description: "Send professional invoices, track payments, and get paid faster.", bullets: ["Create and send invoices", "Automatic payment tracking", "Stripe checkout integration"] }}
    >
      <div style={{ padding: "32px 40px 80px" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
          <div>
            <h1 style={{ fontFamily: T.h, fontSize: 28, fontWeight: 700, color: T.text, letterSpacing: "-0.5px", margin: 0 }}>
              Invoices
            </h1>
            <p style={{ fontSize: 14, color: T.text2, marginTop: 4 }}>
              {invoices.length} total
            </p>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            style={{
              background: CTA_GRAD, color: "#09090B", border: "none",
              borderRadius: 10, padding: "11px 22px", fontSize: 14,
              fontWeight: 600, cursor: "pointer",
            }}
          >
            + New Invoice
          </button>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 20 }}>
          <div style={{ padding: "16px 20px", borderRadius: 10, background: T.bgEl, border: `1px solid ${T.border}` }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: T.text3, textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: 6 }}>Outstanding</span>
            <span style={{ fontSize: 26, fontWeight: 700, color: T.text, fontFamily: T.h, fontVariantNumeric: "tabular-nums" }}>{fmt(outstanding)}</span>
          </div>
          <div style={{ padding: "16px 20px", borderRadius: 10, background: T.bgEl, border: `1px solid ${T.border}` }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: T.text3, textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: 6 }}>Paid this month</span>
            <span style={{ fontSize: 26, fontWeight: 700, color: T.green, fontFamily: T.h, fontVariantNumeric: "tabular-nums" }}>{fmt(paidThisMonth)}</span>
          </div>
          <div style={{ padding: "16px 20px", borderRadius: 10, background: T.bgEl, border: `1px solid ${T.border}` }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: T.text3, textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: 6 }}>Overdue</span>
            <span style={{ fontSize: 26, fontWeight: 700, color: overdueCount > 0 ? T.orange : T.text, fontFamily: T.h }}>{overdueCount}</span>
          </div>
        </div>

        {/* Filter pills */}
        <div style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap" }}>
          {["", "draft", "sent", "viewed", "paid", "overdue"].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              style={{
                padding: "6px 14px", fontSize: 12, fontWeight: 500, borderRadius: 100,
                border: `1px solid ${filter === s ? T.gold : T.border}`,
                background: filter === s ? T.goldDim : "transparent",
                color: filter === s ? T.gold : T.text2,
                cursor: "pointer",
              }}
            >
              {s ? statusLabel(s) : "All"}
            </button>
          ))}
        </div>

        {/* Invoice list */}
        {loading ? (
          <div style={{ textAlign: "center", padding: 60, color: T.text3 }}>Loading...</div>
        ) : invoices.length === 0 ? (
          <div style={{
            textAlign: "center", padding: "64px 24px",
            borderRadius: 12, border: `1px dashed ${T.border}`, background: T.bgEl,
          }}>
            <div style={{
              width: 48, height: 48, borderRadius: 12, background: T.goldDim,
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 16px", fontSize: 22,
            }}>
              🧾
            </div>
            <h3 style={{ fontFamily: T.h, fontSize: 17, fontWeight: 600, color: T.text, marginBottom: 6 }}>
              {filter ? "No invoices match" : "No invoices yet"}
            </h3>
            <p style={{ fontSize: 13, color: T.text2, maxWidth: 300, margin: "0 auto 20px", lineHeight: 1.5 }}>
              {filter
                ? "Try a different status filter."
                : "Create an invoice, send it to your client, and get paid through Stripe."}
            </p>
            {!filter && (
              <button
                onClick={() => setShowCreate(true)}
                style={{
                  background: CTA_GRAD, color: "#09090B", border: "none",
                  padding: "10px 22px", borderRadius: 9, fontSize: 13,
                  fontWeight: 600, cursor: "pointer",
                }}
              >
                Create your first invoice
              </button>
            )}
          </div>
        ) : (
          <div style={{ borderRadius: 12, border: `1px solid ${T.border}`, overflow: "hidden" }}>
            {/* Table header */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "100px 1.5fr 120px 100px 100px 130px",
              gap: 12, padding: "11px 16px",
              borderBottom: `1px solid ${T.border}`,
              background: T.bgEl,
            }}>
              {["Invoice", "Client", "Amount", "Status", "Due", "Actions"].map((h, i) => (
                <span key={h} style={{
                  fontSize: 11, fontWeight: 600, color: T.text3,
                  textTransform: "uppercase", letterSpacing: "0.06em",
                  textAlign: i === 5 ? "right" : "left",
                }}>
                  {h}
                </span>
              ))}
            </div>
            {invoices.map((inv, idx) => (
              <div
                key={inv.id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "100px 1.5fr 120px 100px 100px 130px",
                  gap: 12, padding: "13px 16px", alignItems: "center",
                  borderBottom: idx < invoices.length - 1 ? `1px solid ${T.border}` : "none",
                }}
              >
                <div>
                  <span style={{ fontSize: 13, fontWeight: 600, color: T.text, fontVariantNumeric: "tabular-nums" }}>
                    {inv.invoice_number}
                  </span>
                  <div style={{ display: "flex", gap: 4, marginTop: 3, flexWrap: "wrap" }}>
                    {inv.recurring && (
                      <span style={{ fontSize: 10, fontWeight: 500, padding: "1px 6px", borderRadius: 4, background: "rgba(59,130,246,0.1)", color: T.blue }}>
                        Recurring
                      </span>
                    )}
                    {inv.deposit_amount && !inv.deposit_paid && (
                      <span style={{ fontSize: 10, fontWeight: 500, padding: "1px 6px", borderRadius: 4, background: "rgba(245,158,11,0.1)", color: T.orange }}>
                        Deposit due
                      </span>
                    )}
                    {inv.deposit_amount && inv.deposit_paid && (
                      <span style={{ fontSize: 10, fontWeight: 500, padding: "1px 6px", borderRadius: 4, background: "rgba(34,197,94,0.1)", color: T.green }}>
                        Deposit paid
                      </span>
                    )}
                  </div>
                </div>
                <div>
                  <span style={{ fontSize: 13, fontWeight: 500, color: T.text }}>{inv.contacts?.name || "—"}</span>
                  {inv.contacts?.email && (
                    <span style={{ fontSize: 12, color: T.text2, display: "block", marginTop: 1 }}>{inv.contacts.email}</span>
                  )}
                </div>
                <span style={{ fontSize: 14, fontWeight: 600, color: T.text, fontVariantNumeric: "tabular-nums" }}>
                  {fmt(inv.total_cents)}
                </span>
                <span style={{
                  display: "inline-flex", alignItems: "center", padding: "3px 9px", borderRadius: 100,
                  fontSize: 11, fontWeight: 600,
                  background: STATUS_BG[inv.status] || "rgba(255,255,255,0.06)",
                  color: STATUS_COLORS[inv.status] || T.text2,
                }}>
                  {statusLabel(inv.status)}
                </span>
                <span style={{ fontSize: 12, color: T.text3 }}>
                  {inv.due_date ? new Date(inv.due_date).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "—"}
                </span>
                <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                  {inv.status === "draft" && (
                    <button
                      onClick={() => sendInvoice(inv.id)}
                      disabled={sending === inv.id}
                      style={{ fontSize: 12, fontWeight: 500, color: T.gold, background: "none", border: "none", cursor: "pointer", padding: 0 }}
                    >
                      {sending === inv.id ? "Sending..." : "Send"}
                    </button>
                  )}
                  {["sent", "viewed", "overdue"].includes(inv.status) && (
                    <button
                      onClick={() => markPaid(inv.id)}
                      style={{ fontSize: 12, fontWeight: 500, color: T.green, background: "none", border: "none", cursor: "pointer", padding: 0 }}
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
            <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 50 }} onClick={() => setShowCreate(false)} />
            <div style={{
              position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
              width: 560, maxHeight: "85vh", overflowY: "auto",
              background: T.bgEl, border: `1px solid ${T.border}`,
              borderRadius: 14, padding: 28, zIndex: 51,
            }}>
              <h2 style={{ fontFamily: T.h, fontSize: 18, fontWeight: 700, color: T.text, marginBottom: 20 }}>
                New Invoice
              </h2>

              <label style={{ display: "block", marginBottom: 16 }}>
                <span style={{ fontSize: 12, fontWeight: 500, color: T.text2, display: "block", marginBottom: 6 }}>Client</span>
                <select value={contactId} onChange={(e) => setContactId(e.target.value)} style={inputStyle}>
                  <option value="">Select a client...</option>
                  {contacts.map((c) => (
                    <option key={c.id} value={c.id}>{c.name || c.email}</option>
                  ))}
                </select>
              </label>

              <div style={{ marginBottom: 16 }}>
                <span style={{ fontSize: 12, fontWeight: 500, color: T.text2, display: "block", marginBottom: 8 }}>Line Items</span>
                {items.map((item, idx) => (
                  <div key={idx} style={{ display: "grid", gridTemplateColumns: "2fr 60px 100px 32px", gap: 8, marginBottom: 8 }}>
                    <input placeholder="Item name" value={item.name}
                      onChange={(e) => { const u = [...items]; u[idx].name = e.target.value; setItems(u); }}
                      style={inputStyle} />
                    <input type="number" placeholder="Qty" value={item.quantity || ""}
                      onChange={(e) => { const u = [...items]; u[idx].quantity = parseInt(e.target.value) || 1; setItems(u); }}
                      style={inputStyle} />
                    <input type="number" placeholder="Price" value={item.unit_price_cents ? item.unit_price_cents / 100 : ""}
                      onChange={(e) => { const u = [...items]; u[idx].unit_price_cents = Math.round(parseFloat(e.target.value || "0") * 100); setItems(u); }}
                      style={inputStyle} />
                    {items.length > 1 && (
                      <button onClick={() => setItems(items.filter((_, i) => i !== idx))}
                        style={{ background: "none", border: "none", color: T.text2, cursor: "pointer", fontSize: 16 }}>×</button>
                    )}
                  </div>
                ))}
                <button
                  onClick={() => setItems([...items, { name: "", description: "", quantity: 1, unit_price_cents: 0 }])}
                  style={{ fontSize: 12, color: T.gold, background: "none", border: "none", cursor: "pointer", padding: 0, fontWeight: 500 }}
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
                <span style={{ fontSize: 12, fontWeight: 500, color: T.text2, display: "block", marginBottom: 6 }}>Due Date</span>
                <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} style={inputStyle} />
              </label>

              <label style={{ display: "block", marginBottom: 20 }}>
                <span style={{ fontSize: 12, fontWeight: 500, color: T.text2, display: "block", marginBottom: 6 }}>Notes (optional)</span>
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} style={{ ...inputStyle, resize: "vertical" }} />
              </label>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
                  <input type="checkbox" checked={recurring} onChange={(e) => setRecurring(e.target.checked)} style={{ width: 16, height: 16 }} />
                  <span style={{ fontSize: 13, color: T.text }}>Recurring invoice</span>
                </label>
                {recurring && (
                  <select value={recurringInterval}
                    onChange={(e) => setRecurringInterval(e.target.value as typeof recurringInterval)}
                    style={{ ...inputStyle, marginTop: 8 }}>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                  </select>
                )}
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
                  <input type="checkbox" checked={depositEnabled} onChange={(e) => setDepositEnabled(e.target.checked)} style={{ width: 16, height: 16 }} />
                  <span style={{ fontSize: 13, color: T.text }}>Require deposit</span>
                </label>
                {depositEnabled && (
                  <input type="number" placeholder="Deposit amount ($)" value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    style={{ ...inputStyle, marginTop: 8 }} />
                )}
              </div>

              <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
                <button onClick={() => setShowCreate(false)}
                  style={{ padding: "10px 20px", fontSize: 13, fontWeight: 500, background: "none", border: `1px solid ${T.border}`, borderRadius: 9, color: T.text2, cursor: "pointer" }}>
                  Cancel
                </button>
                <button onClick={createInvoice}
                  disabled={saving || !items.some((i) => i.name && i.unit_price_cents > 0)}
                  style={{ padding: "10px 20px", fontSize: 13, fontWeight: 600, background: CTA_GRAD, border: "none", borderRadius: 9, color: "#09090B", cursor: "pointer", opacity: saving ? 0.6 : 1 }}>
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
