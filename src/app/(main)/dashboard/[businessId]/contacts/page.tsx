"use client";

import { useBusinessContext } from "@/components/dashboard/BusinessProvider";
import { PaywallGate } from "@/components/dashboard/PaywallGate";
import { T, CTA_GRAD } from "@/lib/design-tokens";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";

interface Contact {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  company: string | null;
  lifecycle_stage: string;
  source: string | null;
  tags: string[];
  last_contacted_at: string | null;
  created_at: string;
}

const STAGES = [
  { value: "", label: "All Stages" },
  { value: "subscriber", label: "Subscriber" },
  { value: "lead", label: "Lead" },
  { value: "qualified_lead", label: "Qualified" },
  { value: "customer", label: "Customer" },
  { value: "repeat_customer", label: "Repeat" },
  { value: "advocate", label: "Advocate" },
];

const SOURCES = [
  "website",
  "booking",
  "referral",
  "social",
  "email",
  "manual",
  "other",
];

function stageStyle(stage: string) {
  const map: Record<string, { bg: string; color: string }> = {
    subscriber: { bg: "rgba(255,255,255,0.06)", color: T.text3 },
    lead: { bg: "rgba(59,130,246,0.15)", color: "#3b82f6" },
    qualified_lead: { bg: "rgba(245,158,11,0.15)", color: T.gold },
    customer: { bg: "rgba(34,197,94,0.15)", color: T.green },
    repeat_customer: { bg: "rgba(123,57,252,0.15)", color: T.purpleLight },
    advocate: { bg: "rgba(168,85,247,0.15)", color: "#a855f7" },
  };
  return map[stage] || map.subscriber;
}

function stageLabel(stage: string) {
  return stage.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

const HR_STYLE = { border: "none", borderTop: "1px solid #1E1E21", margin: 0 } as const;

export default function ContactsPage() {
  const params = useParams();
  const router = useRouter();
  const businessId = params.businessId as string;
  const { userId } = useBusinessContext();

  const [contacts, setContacts] = useState<Contact[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [stage, setStage] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [saving, setSaving] = useState(false);

  // Add form
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newCompany, setNewCompany] = useState("");
  const [newSource, setNewSource] = useState("manual");

  const fetchContacts = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ businessId });
    if (stage) params.set("stage", stage);
    if (search) params.set("search", search);
    const res = await fetch(`/api/contacts?${params}`);
    if (res.ok) {
      const data = await res.json();
      setContacts(data.contacts);
      setTotal(data.total);
    }
    setLoading(false);
  }, [businessId, stage, search]);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  async function handleAdd() {
    if (!newEmail.trim()) return;
    setSaving(true);
    const res = await fetch("/api/contacts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        businessId,
        userId,
        email: newEmail.trim(),
        name: newName.trim() || null,
        phone: newPhone.trim() || null,
        company: newCompany.trim() || null,
        source: newSource,
      }),
    });
    if (res.ok) {
      setShowAdd(false);
      setNewName("");
      setNewEmail("");
      setNewPhone("");
      setNewCompany("");
      setNewSource("manual");
      fetchContacts();
    } else {
      const err = await res.json();
      alert(err.error || "Failed to add contact");
    }
    setSaving(false);
  }

  return (
    <PaywallGate
      requiredPlan="starter"
      teaser={{
        headline: "Built-In CRM",
        description: "Track contacts, manage your pipeline, book discovery calls, and send proposals — all from one place.",
        bullets: [
          "Contact management with lifecycle stages",
          "Discovery call booking & scheduling",
          "AI-generated proposals with Stripe payments",
          "Email sending with open & click tracking",
        ],
        previewRows: [
          { label: "Active contacts", value: "247", color: T.green },
          { label: "Proposals sent", value: "23", color: T.purpleLight },
          { label: "Pipeline value", value: "$45,200", color: T.gold },
        ],
      }}
    >
      <div style={{ padding: "32px 40px 80px" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
          <div>
            <h1 style={{ fontFamily: T.h, fontSize: 28, fontWeight: 700, color: T.text, letterSpacing: "-0.5px" }}>
              Contacts
            </h1>
            <p style={{ fontSize: 14, color: "#9CA3AF", marginTop: 4 }}>
              {total} contact{total !== 1 ? "s" : ""} in your CRM
            </p>
          </div>
          <button
            onClick={() => setShowAdd(true)}
            style={{
              background: CTA_GRAD,
              color: "#09090B",
              border: "none",
              padding: "12px 24px",
              borderRadius: 12,
              fontSize: 14,
              fontWeight: 600,
              fontFamily: T.h,
              cursor: "pointer",
            }}
          >
            + Add Contact
          </button>
        </div>

        <hr style={HR_STYLE} />

        {/* Stats */}
        <div style={{ display: "flex", gap: 48, padding: "20px 0" }}>
          <div>
            <span style={{ fontSize: 24, fontWeight: 700, color: T.text, fontFamily: T.h }}>{total}</span>
            <span style={{ fontSize: 13, color: "#9CA3AF", display: "block", marginTop: 2 }}>Total contacts</span>
          </div>
          <div>
            <span style={{ fontSize: 24, fontWeight: 700, color: T.green, fontFamily: T.h }}>
              {contacts.filter((c) => c.lifecycle_stage === "customer" || c.lifecycle_stage === "repeat_customer").length}
            </span>
            <span style={{ fontSize: 13, color: "#9CA3AF", display: "block", marginTop: 2 }}>Customers</span>
          </div>
          <div>
            <span style={{ fontSize: 24, fontWeight: 700, color: "#3b82f6", fontFamily: T.h }}>
              {contacts.filter((c) => c.lifecycle_stage === "lead" || c.lifecycle_stage === "qualified_lead").length}
            </span>
            <span style={{ fontSize: 13, color: "#9CA3AF", display: "block", marginTop: 2 }}>Leads</span>
          </div>
          <div>
            <span style={{ fontSize: 24, fontWeight: 700, color: T.text2, fontFamily: T.h }}>
              {contacts.filter((c) => c.last_contacted_at && (Date.now() - new Date(c.last_contacted_at).getTime()) < 7 * 86400000).length}
            </span>
            <span style={{ fontSize: 13, color: "#9CA3AF", display: "block", marginTop: 2 }}>Active this week</span>
          </div>
        </div>

        <hr style={HR_STYLE} />

        {/* Filters */}
        <div style={{ display: "flex", gap: 12, padding: "20px 0", flexWrap: "wrap" }}>
          <select
            value={stage}
            onChange={(e) => setStage(e.target.value)}
            style={{
              background: "rgba(255,255,255,0.04)",
              border: `1px solid ${T.border}`,
              borderRadius: 10,
              padding: "10px 16px",
              fontSize: 13,
              color: T.text2,
              outline: "none",
              minWidth: 160,
            }}
          >
            {STAGES.map((s) => (
              <option key={s.value} value={s.value} style={{ background: T.bgEl }}>
                {s.label}
              </option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Search contacts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              background: "rgba(255,255,255,0.04)",
              border: `1px solid ${T.border}`,
              borderRadius: 10,
              padding: "10px 16px",
              fontSize: 13,
              color: T.text,
              outline: "none",
              flex: 1,
              minWidth: 200,
            }}
          />
        </div>

        <hr style={HR_STYLE} />

        {/* Table */}
        {loading ? (
          <div style={{ textAlign: "center", padding: 60, color: "#9CA3AF" }}>Loading...</div>
        ) : contacts.length === 0 ? (
          <div style={{ padding: "48px 0" }}>
            {/* Empty state: educational walkthrough */}
            <h2 style={{ fontFamily: T.h, fontSize: 22, fontWeight: 700, color: T.text, marginBottom: 8 }}>
              Your contact list is empty
            </h2>
            <p style={{ fontSize: 14, color: "#9CA3AF", maxWidth: 540, lineHeight: 1.6, marginBottom: 32 }}>
              Contacts are the people you do business with -- leads, customers, and everyone in between.
              NoMistakes tracks each contact through lifecycle stages so you always know where they stand.
            </p>

            <hr style={HR_STYLE} />

            {/* How contacts work */}
            <div style={{ padding: "28px 0" }}>
              <h3 style={{ fontFamily: T.h, fontSize: 15, fontWeight: 600, color: T.text, marginBottom: 16, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                How contacts work
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#52525B", fontFamily: T.mono, minWidth: 20 }}>01</span>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 600, color: T.text, marginBottom: 2 }}>Add contacts manually or automatically</p>
                    <p style={{ fontSize: 13, color: "#52525B", lineHeight: 1.5 }}>
                      Add them yourself, or they get created automatically when someone books a discovery call or submits a form.
                    </p>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#52525B", fontFamily: T.mono, minWidth: 20 }}>02</span>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 600, color: T.text, marginBottom: 2 }}>Track lifecycle stages</p>
                    <p style={{ fontSize: 13, color: "#52525B", lineHeight: 1.5 }}>
                      Every contact moves through stages: Subscriber, Lead, Qualified Lead, Customer, Repeat Customer, and Advocate. You always know where someone stands.
                    </p>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#52525B", fontFamily: T.mono, minWidth: 20 }}>03</span>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 600, color: T.text, marginBottom: 2 }}>Tag and segment your audience</p>
                    <p style={{ fontSize: 13, color: "#52525B", lineHeight: 1.5 }}>
                      Use tags to group contacts by interest, campaign, or any criteria. Filter and search to find exactly who you need.
                    </p>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#52525B", fontFamily: T.mono, minWidth: 20 }}>04</span>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 600, color: T.text, marginBottom: 2 }}>Send emails and track engagement</p>
                    <p style={{ fontSize: 13, color: "#52525B", lineHeight: 1.5 }}>
                      Send emails directly from the contact detail page. Opens, clicks, and last-contact dates are tracked automatically.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <hr style={HR_STYLE} />

            {/* Get started */}
            <div style={{ padding: "28px 0" }}>
              <h3 style={{ fontFamily: T.h, fontSize: 15, fontWeight: 600, color: T.text, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Get started
              </h3>
              <p style={{ fontSize: 13, color: "#52525B", marginBottom: 20, lineHeight: 1.5 }}>
                Add your first contact to start building your CRM. You can always import more later or let the system create them automatically from bookings.
              </p>
              <button
                onClick={() => setShowAdd(true)}
                style={{
                  background: CTA_GRAD, color: "#09090B", border: "none",
                  padding: "12px 24px", borderRadius: 12, fontSize: 14,
                  fontWeight: 600, fontFamily: T.h, cursor: "pointer",
                }}
              >
                + Add Your First Contact
              </button>
            </div>
          </div>
        ) : (
          <div style={{ overflowX: "auto", marginTop: 4 }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #1E1E21" }}>
                  {["Name", "Email", "Stage", "Source", "Tags", "Last Contact"].map((h) => (
                    <th
                      key={h}
                      style={{
                        padding: "14px 16px",
                        textAlign: "left",
                        fontSize: 11,
                        fontWeight: 600,
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        color: "#52525B",
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {contacts.map((c) => {
                  const ss = stageStyle(c.lifecycle_stage);
                  return (
                    <tr
                      key={c.id}
                      onClick={() => router.push(`/dashboard/${businessId}/contacts/${c.id}`)}
                      style={{ borderBottom: "1px solid #1E1E21", cursor: "pointer" }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.02)";
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLElement).style.background = "transparent";
                      }}
                    >
                      <td style={{ padding: "14px 16px", fontSize: 14, fontWeight: 500, color: T.text }}>
                        {c.name || "\u2014"}
                      </td>
                      <td style={{ padding: "14px 16px", fontSize: 13, color: T.text2 }}>
                        {c.email}
                      </td>
                      <td style={{ padding: "14px 16px" }}>
                        <span
                          style={{
                            display: "inline-block",
                            padding: "4px 10px",
                            borderRadius: 6,
                            fontSize: 11,
                            fontWeight: 600,
                            background: ss.bg,
                            color: ss.color,
                          }}
                        >
                          {stageLabel(c.lifecycle_stage)}
                        </span>
                      </td>
                      <td style={{ padding: "14px 16px", fontSize: 13, color: "#52525B" }}>
                        {c.source || "\u2014"}
                      </td>
                      <td style={{ padding: "14px 16px" }}>
                        <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                          {(c.tags || []).slice(0, 3).map((tag) => (
                            <span
                              key={tag}
                              style={{
                                padding: "2px 8px",
                                borderRadius: 4,
                                fontSize: 11,
                                background: "rgba(255,255,255,0.06)",
                                color: "#9CA3AF",
                              }}
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td style={{ padding: "14px 16px", fontSize: 12, color: "#52525B", fontFamily: T.mono }}>
                        {c.last_contacted_at
                          ? new Date(c.last_contacted_at).toLocaleDateString()
                          : "\u2014"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Add Contact Modal */}
        {showAdd && (
          <div
            style={{
              position: "fixed", inset: 0, zIndex: 100,
              background: "rgba(0,0,0,0.6)",
              display: "flex", alignItems: "center", justifyContent: "center",
              padding: 16,
            }}
            onClick={() => setShowAdd(false)}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                background: T.bgEl,
                border: `1px solid ${T.border}`,
                borderRadius: 14,
                padding: "32px",
                maxWidth: 460,
                width: "100%",
              }}
            >
              <h3 style={{ fontFamily: T.h, fontSize: 20, fontWeight: 600, color: T.text, marginBottom: 24 }}>
                Add Contact
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div>
                  <label style={{ fontSize: 12, color: "#9CA3AF", display: "block", marginBottom: 6 }}>Email *</label>
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="name@company.com"
                    style={{
                      width: "100%", padding: "10px 14px", borderRadius: 10,
                      background: "rgba(255,255,255,0.04)", border: `1px solid ${T.border}`,
                      color: T.text, fontSize: 14, outline: "none",
                    }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, color: "#9CA3AF", display: "block", marginBottom: 6 }}>Name</label>
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="John Smith"
                    style={{
                      width: "100%", padding: "10px 14px", borderRadius: 10,
                      background: "rgba(255,255,255,0.04)", border: `1px solid ${T.border}`,
                      color: T.text, fontSize: 14, outline: "none",
                    }}
                  />
                </div>
                <div style={{ display: "flex", gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: 12, color: "#9CA3AF", display: "block", marginBottom: 6 }}>Phone</label>
                    <input
                      type="tel"
                      value={newPhone}
                      onChange={(e) => setNewPhone(e.target.value)}
                      placeholder="(555) 123-4567"
                      style={{
                        width: "100%", padding: "10px 14px", borderRadius: 10,
                        background: "rgba(255,255,255,0.04)", border: `1px solid ${T.border}`,
                        color: T.text, fontSize: 14, outline: "none",
                      }}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: 12, color: "#9CA3AF", display: "block", marginBottom: 6 }}>Company</label>
                    <input
                      type="text"
                      value={newCompany}
                      onChange={(e) => setNewCompany(e.target.value)}
                      placeholder="Acme Inc"
                      style={{
                        width: "100%", padding: "10px 14px", borderRadius: 10,
                        background: "rgba(255,255,255,0.04)", border: `1px solid ${T.border}`,
                        color: T.text, fontSize: 14, outline: "none",
                      }}
                    />
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: 12, color: "#9CA3AF", display: "block", marginBottom: 6 }}>Source</label>
                  <select
                    value={newSource}
                    onChange={(e) => setNewSource(e.target.value)}
                    style={{
                      width: "100%", padding: "10px 14px", borderRadius: 10,
                      background: "rgba(255,255,255,0.04)", border: `1px solid ${T.border}`,
                      color: T.text2, fontSize: 14, outline: "none",
                    }}
                  >
                    {SOURCES.map((s) => (
                      <option key={s} value={s} style={{ background: T.bgEl }}>
                        {s.charAt(0).toUpperCase() + s.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div style={{ display: "flex", gap: 12, marginTop: 28 }}>
                <button
                  onClick={() => setShowAdd(false)}
                  style={{
                    flex: 1, padding: "12px", borderRadius: 10,
                    background: "rgba(255,255,255,0.04)", border: `1px solid ${T.border}`,
                    color: T.text2, fontSize: 14, cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleAdd}
                  disabled={saving || !newEmail.trim()}
                  style={{
                    flex: 1, padding: "12px", borderRadius: 10,
                    background: CTA_GRAD, border: "none",
                    color: "#09090B", fontSize: 14, fontWeight: 600, cursor: saving ? "wait" : "pointer",
                    opacity: saving || !newEmail.trim() ? 0.6 : 1,
                  }}
                >
                  {saving ? "Adding..." : "Add Contact"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </PaywallGate>
  );
}
