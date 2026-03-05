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
  { value: "", label: "All" },
  { value: "subscriber", label: "Subscriber" },
  { value: "lead", label: "Lead" },
  { value: "qualified_lead", label: "Qualified" },
  { value: "customer", label: "Customer" },
  { value: "repeat_customer", label: "Repeat" },
  { value: "advocate", label: "Advocate" },
];

const SOURCES = ["website", "booking", "referral", "social", "email", "manual", "other"];

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

function getInitials(name: string | null, email: string): string {
  if (name) {
    const parts = name.trim().split(" ").filter(Boolean);
    return parts.length > 1
      ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
      : parts[0][0].toUpperCase();
  }
  return email[0].toUpperCase();
}

const AVATAR_COLORS = ["#8B5CF6", "#3B82F6", "#22C55E", "#C8A44E", "#F97316", "#EF4444"];

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

  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newCompany, setNewCompany] = useState("");
  const [newSource, setNewSource] = useState("manual");

  const fetchContacts = useCallback(async () => {
    setLoading(true);
    const qs = new URLSearchParams({ businessId });
    if (stage) qs.set("stage", stage);
    if (search) qs.set("search", search);
    const res = await fetch(`/api/contacts?${qs}`);
    if (res.ok) {
      const data = await res.json();
      setContacts(data.contacts);
      setTotal(data.total);
    }
    setLoading(false);
  }, [businessId, stage, search]);

  useEffect(() => { fetchContacts(); }, [fetchContacts]);

  async function handleAdd() {
    if (!newEmail.trim()) return;
    setSaving(true);
    const res = await fetch("/api/contacts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        businessId, userId,
        email: newEmail.trim(),
        name: newName.trim() || null,
        phone: newPhone.trim() || null,
        company: newCompany.trim() || null,
        source: newSource,
      }),
    });
    if (res.ok) {
      setShowAdd(false);
      setNewName(""); setNewEmail(""); setNewPhone(""); setNewCompany(""); setNewSource("manual");
      fetchContacts();
    } else {
      const err = await res.json();
      alert(err.error || "Failed to add contact");
    }
    setSaving(false);
  }

  const customers = contacts.filter((c) =>
    c.lifecycle_stage === "customer" || c.lifecycle_stage === "repeat_customer"
  ).length;
  const leadsCount = contacts.filter((c) =>
    c.lifecycle_stage === "lead" || c.lifecycle_stage === "qualified_lead"
  ).length;
  const activeThisWeek = contacts.filter((c) =>
    c.last_contacted_at && (Date.now() - new Date(c.last_contacted_at).getTime()) < 7 * 86400000
  ).length;

  const fieldStyle: React.CSSProperties = {
    width: "100%", padding: "10px 14px", borderRadius: 10,
    background: "rgba(255,255,255,0.04)", border: `1px solid ${T.border}`,
    color: T.text, fontSize: 14, outline: "none",
  };

  return (
    <PaywallGate
      requiredPlan="solo"
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
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24 }}>
          <div>
            <h1 style={{ fontFamily: T.h, fontSize: 28, fontWeight: 700, color: T.text, letterSpacing: "-0.5px", margin: 0 }}>
              Contacts
            </h1>
            <p style={{ fontSize: 14, color: T.text2, marginTop: 4 }}>
              {total} contact{total !== 1 ? "s" : ""} in your CRM
            </p>
          </div>
          <button
            onClick={() => setShowAdd(true)}
            style={{
              background: CTA_GRAD, color: "#09090B", border: "none",
              padding: "11px 22px", borderRadius: 10, fontSize: 14,
              fontWeight: 600, cursor: "pointer",
            }}
          >
            + Add Contact
          </button>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 20 }}>
          {[
            { label: "Total", value: total, color: T.text },
            { label: "Customers", value: customers, color: T.green },
            { label: "Leads", value: leadsCount, color: T.blue },
            { label: "Active this week", value: activeThisWeek, color: T.text2 },
          ].map((s) => (
            <div key={s.label} style={{ padding: "16px 20px", borderRadius: 10, background: T.bgEl, border: `1px solid ${T.border}` }}>
              <span style={{ fontSize: 26, fontWeight: 700, color: s.color, fontFamily: T.h, display: "block" }}>{s.value}</span>
              <span style={{ fontSize: 12, color: T.text3, display: "block", marginTop: 2 }}>{s.label}</span>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
          {STAGES.map((s) => (
            <button
              key={s.value}
              onClick={() => setStage(s.value)}
              style={{
                padding: "6px 14px", borderRadius: 100, fontSize: 12, fontWeight: 500,
                border: `1px solid ${stage === s.value ? T.gold : T.border}`,
                background: stage === s.value ? T.goldDim : "transparent",
                color: stage === s.value ? T.gold : T.text2,
                cursor: "pointer",
              }}
            >
              {s.label}
            </button>
          ))}
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              marginLeft: "auto", background: T.bgEl, border: `1px solid ${T.border}`,
              borderRadius: 8, padding: "6px 14px", fontSize: 13,
              color: T.text, outline: "none", width: 200,
            }}
          />
        </div>

        {/* Table */}
        {loading ? (
          <div style={{ textAlign: "center", padding: 60, color: T.text3 }}>Loading...</div>
        ) : contacts.length === 0 ? (
          <div style={{
            textAlign: "center", padding: "64px 24px",
            borderRadius: 12, border: `1px dashed ${T.border}`, background: T.bgEl,
          }}>
            <div style={{
              width: 48, height: 48, borderRadius: 12, background: T.goldDim,
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 16px", fontSize: 22,
            }}>
              👥
            </div>
            <h3 style={{ fontFamily: T.h, fontSize: 17, fontWeight: 600, color: T.text, marginBottom: 6 }}>
              {stage || search ? "No contacts match" : "No contacts yet"}
            </h3>
            <p style={{ fontSize: 13, color: T.text2, maxWidth: 320, margin: "0 auto 20px", lineHeight: 1.5 }}>
              {stage || search
                ? "Try clearing filters or searching for something else."
                : "Add contacts manually or they're created automatically when someone books a call."}
            </p>
            {!stage && !search && (
              <button
                onClick={() => setShowAdd(true)}
                style={{
                  background: CTA_GRAD, color: "#09090B", border: "none",
                  padding: "10px 22px", borderRadius: 9, fontSize: 13,
                  fontWeight: 600, cursor: "pointer",
                }}
              >
                + Add Your First Contact
              </button>
            )}
          </div>
        ) : (
          <div style={{ borderRadius: 12, border: `1px solid ${T.border}`, overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${T.border}`, background: T.bgEl }}>
                  {["Name", "Stage", "Source", "Tags", "Last Contact"].map((h) => (
                    <th key={h} style={{
                      padding: "12px 16px", textAlign: "left", fontSize: 11,
                      fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: T.text3,
                    }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {contacts.map((c, idx) => {
                  const ss = stageStyle(c.lifecycle_stage);
                  const color = AVATAR_COLORS[idx % AVATAR_COLORS.length];
                  return (
                    <tr
                      key={c.id}
                      onClick={() => router.push(`/dashboard/${businessId}/contacts/${c.id}`)}
                      style={{ borderBottom: idx < contacts.length - 1 ? `1px solid ${T.border}` : "none", cursor: "pointer" }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.02)"; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                    >
                      <td style={{ padding: "12px 16px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={{
                            width: 32, height: 32, borderRadius: 8,
                            background: `${color}20`, border: `1px solid ${color}40`,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: 12, fontWeight: 700, color, flexShrink: 0,
                          }}>
                            {getInitials(c.name, c.email)}
                          </div>
                          <div>
                            <span style={{ fontSize: 14, fontWeight: 500, color: T.text, display: "block" }}>
                              {c.name || "—"}
                            </span>
                            <span style={{ fontSize: 12, color: T.text2 }}>{c.email}</span>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <span style={{
                          display: "inline-block", padding: "3px 9px", borderRadius: 100,
                          fontSize: 11, fontWeight: 600, background: ss.bg, color: ss.color,
                        }}>
                          {stageLabel(c.lifecycle_stage)}
                        </span>
                      </td>
                      <td style={{ padding: "12px 16px", fontSize: 12, color: T.text3 }}>
                        {c.source || "—"}
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                          {(c.tags || []).slice(0, 3).map((tag) => (
                            <span key={tag} style={{
                              padding: "2px 8px", borderRadius: 4, fontSize: 11,
                              background: "rgba(255,255,255,0.06)", color: T.text2,
                            }}>
                              {tag}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td style={{ padding: "12px 16px", fontSize: 12, color: T.text3, fontFamily: T.mono }}>
                        {c.last_contacted_at
                          ? new Date(c.last_contacted_at).toLocaleDateString()
                          : "—"}
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
              background: "rgba(0,0,0,0.6)", display: "flex",
              alignItems: "center", justifyContent: "center", padding: 16,
            }}
            onClick={() => setShowAdd(false)}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                background: T.bgEl, border: `1px solid ${T.border}`,
                borderRadius: 14, padding: "32px", maxWidth: 460, width: "100%",
              }}
            >
              <h3 style={{ fontFamily: T.h, fontSize: 20, fontWeight: 600, color: T.text, marginBottom: 24 }}>
                Add Contact
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div>
                  <label style={{ fontSize: 12, color: T.text2, display: "block", marginBottom: 6 }}>Email *</label>
                  <input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder="name@company.com" style={fieldStyle} />
                </div>
                <div>
                  <label style={{ fontSize: 12, color: T.text2, display: "block", marginBottom: 6 }}>Name</label>
                  <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="John Smith" style={fieldStyle} />
                </div>
                <div style={{ display: "flex", gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: 12, color: T.text2, display: "block", marginBottom: 6 }}>Phone</label>
                    <input type="tel" value={newPhone} onChange={(e) => setNewPhone(e.target.value)} placeholder="(555) 123-4567" style={fieldStyle} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: 12, color: T.text2, display: "block", marginBottom: 6 }}>Company</label>
                    <input type="text" value={newCompany} onChange={(e) => setNewCompany(e.target.value)} placeholder="Acme Inc" style={fieldStyle} />
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: 12, color: T.text2, display: "block", marginBottom: 6 }}>Source</label>
                  <select value={newSource} onChange={(e) => setNewSource(e.target.value)} style={{ ...fieldStyle, color: T.text2 }}>
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
                    color: "#09090B", fontSize: 14, fontWeight: 600,
                    cursor: saving ? "wait" : "pointer",
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
