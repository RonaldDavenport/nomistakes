"use client";

import { useBusinessContext } from "@/components/dashboard/BusinessProvider";
import { PaywallGate } from "@/components/dashboard/PaywallGate";
import { T } from "@/lib/design-tokens";
import { useParams } from "next/navigation";
import { useState, useEffect, useCallback } from "react";

interface Lead {
  id: string;
  name: string | null;
  email: string | null;
  linkedin_url: string | null;
  title: string | null;
  company: string | null;
  status: string;
  credits_spent: number;
  reached_out_at: string | null;
  created_at: string;
  source: string;
}

const STATUS_STYLES: Record<string, { bg: string; color: string }> = {
  new:          { bg: "rgba(255,255,255,0.06)", color: T.text3 },
  reached_out:  { bg: "rgba(59,130,246,0.15)",  color: "#3b82f6" },
  replied:      { bg: "rgba(245,158,11,0.15)",   color: T.gold },
  converted:    { bg: "rgba(34,197,94,0.15)",    color: "#22c55e" },
  dead:         { bg: "rgba(239,68,68,0.1)",     color: "#ef4444" },
};

const STATUS_FILTERS = [
  { value: "", label: "All" },
  { value: "new", label: "New" },
  { value: "reached_out", label: "Reached Out" },
  { value: "replied", label: "Replied" },
  { value: "converted", label: "Converted" },
  { value: "dead", label: "Dead" },
];

const OUTREACH_CHANNELS = [
  { value: "linkedin", label: "LinkedIn" },
  { value: "email", label: "Email" },
  { value: "twitter", label: "Twitter / X" },
];

const HR = { border: "none", borderTop: `1px solid ${T.border}`, margin: 0 } as const;

export default function LeadsPage() {
  const params = useParams();
  const businessId = params.businessId as string;
  const { userId, plan: planId, credits } = useBusinessContext();

  const [leads, setLeads] = useState<Lead[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");

  // Apollo search form
  const [titles, setTitles] = useState("");
  const [industries, setIndustries] = useState("");
  const [locations, setLocations] = useState("");
  const [discovering, setDiscovering] = useState(false);
  const [discoverResult, setDiscoverResult] = useState<{ inserted: number; skipped: number } | null>(null);

  // Outreach modal
  const [outreachLead, setOutreachLead] = useState<Lead | null>(null);
  const [outreachChannel, setOutreachChannel] = useState("linkedin");
  const [outreachContent, setOutreachContent] = useState("");
  const [sending, setSending] = useState(false);

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ businessId, limit: "50", offset: "0" });
    if (statusFilter) params.set("status", statusFilter);
    if (search) params.set("search", search);

    const res = await fetch(`/api/leads?${params}`);
    const data = await res.json();
    setLeads(data.leads || []);
    setTotal(data.total || 0);
    setLoading(false);
  }, [businessId, statusFilter, search]);

  useEffect(() => { fetchLeads(); }, [fetchLeads]);

  async function handleDiscover() {
    if (!userId) return;
    setDiscovering(true);
    setDiscoverResult(null);

    const res = await fetch("/api/leads/discover", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        businessId,
        userId,
        titles: titles.split(",").map((t) => t.trim()).filter(Boolean),
        industries: industries.split(",").map((i) => i.trim()).filter(Boolean),
        locations: locations.split(",").map((l) => l.trim()).filter(Boolean),
      }),
    });

    const data = await res.json();
    setDiscovering(false);

    if (res.ok) {
      setDiscoverResult({ inserted: data.inserted, skipped: data.skipped });
      fetchLeads();
    } else {
      alert(data.error || "Discovery failed");
    }
  }

  async function handleOutreach() {
    if (!outreachLead || !userId || !outreachContent.trim()) return;
    setSending(true);

    const res = await fetch("/api/leads/outreach", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        businessId,
        userId,
        leadId: outreachLead.id,
        channel: outreachChannel,
        content: outreachContent.trim(),
      }),
    });

    const data = await res.json();
    setSending(false);

    if (res.ok) {
      setOutreachLead(null);
      setOutreachContent("");
      fetchLeads();
    } else {
      alert(data.error || "Outreach failed");
    }
  }

  async function handleConvert(lead: Lead) {
    if (!userId) return;
    const res = await fetch("/api/contacts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        businessId,
        userId,
        email: lead.email || `${lead.name?.toLowerCase().replace(/\s+/g, ".")}@unknown.com`,
        name: lead.name,
        company: lead.company,
        source: lead.source,
        lifecycle_stage: "lead",
      }),
    });

    if (res.ok) {
      await fetch("/api/leads", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadId: lead.id, status: "converted" }),
      });
      fetchLeads();
    } else {
      const data = await res.json();
      alert(data.error || "Could not convert to contact");
    }
  }

  return (
    <PaywallGate requiredPlan="starter">
      <div style={{ padding: "32px 24px", maxWidth: 1100, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: T.text, marginBottom: 4 }}>Lead Engine</h1>
          <p style={{ fontSize: 13, color: T.text3 }}>
            Discover and reach out to prospects. Each outreach costs 1 credit.
          </p>
        </div>

        {/* Apollo Search Panel */}
        <div style={{
          background: T.bgEl,
          border: `1px solid ${T.border}`,
          borderRadius: 12,
          padding: 20,
          marginBottom: 24,
        }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: T.text, marginBottom: 16 }}>
            Find Prospects via Apollo.io
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 14 }}>
            {[
              { label: "Job Titles", value: titles, set: setTitles, placeholder: "CEO, Founder, CMO" },
              { label: "Industries", value: industries, set: setIndustries, placeholder: "SaaS, Fintech, Healthcare" },
              { label: "Locations", value: locations, set: setLocations, placeholder: "New York, San Francisco" },
            ].map(({ label, value, set, placeholder }) => (
              <div key={label}>
                <label style={{ fontSize: 11, fontWeight: 500, color: T.text3, display: "block", marginBottom: 6 }}>
                  {label} <span style={{ color: T.text3, fontWeight: 400 }}>(comma-separated)</span>
                </label>
                <input
                  value={value}
                  onChange={(e) => set(e.target.value)}
                  placeholder={placeholder}
                  style={{
                    width: "100%", padding: "8px 12px",
                    background: "rgba(255,255,255,0.04)",
                    border: `1px solid ${T.border}`,
                    borderRadius: 8, fontSize: 13, color: T.text,
                    outline: "none", boxSizing: "border-box",
                  }}
                />
              </div>
            ))}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button
              onClick={handleDiscover}
              disabled={discovering}
              style={{
                padding: "8px 20px", borderRadius: 8,
                background: discovering ? T.border : T.gold,
                color: discovering ? T.text3 : "#09090B",
                fontSize: 13, fontWeight: 600,
                border: "none", cursor: discovering ? "not-allowed" : "pointer",
              }}
            >
              {discovering ? "Searching..." : "Find Prospects"}
            </button>
            {discoverResult && (
              <span style={{ fontSize: 12, color: T.text3 }}>
                +{discoverResult.inserted} added
                {discoverResult.skipped > 0 ? `, ${discoverResult.skipped} skipped` : ""}
              </span>
            )}
          </div>
        </div>

        {/* Filters */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search leads..."
            style={{
              flex: 1, maxWidth: 280,
              padding: "8px 12px",
              background: T.bgEl,
              border: `1px solid ${T.border}`,
              borderRadius: 8, fontSize: 13, color: T.text, outline: "none",
            }}
          />
          <div style={{ display: "flex", gap: 6 }}>
            {STATUS_FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => setStatusFilter(f.value)}
                style={{
                  padding: "6px 12px", borderRadius: 6, fontSize: 12, fontWeight: 500,
                  border: `1px solid ${statusFilter === f.value ? T.gold : T.border}`,
                  background: statusFilter === f.value ? T.goldDim : "transparent",
                  color: statusFilter === f.value ? T.gold : T.text3,
                  cursor: "pointer",
                }}
              >
                {f.label}
              </button>
            ))}
          </div>
          <span style={{ marginLeft: "auto", fontSize: 12, color: T.text3 }}>{total} total</span>
        </div>

        {/* Leads table */}
        <div style={{ background: T.bgEl, border: `1px solid ${T.border}`, borderRadius: 12, overflow: "hidden" }}>
          {/* Table header */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 100px 80px 120px",
            padding: "10px 20px",
            borderBottom: `1px solid ${T.border}`,
          }}>
            {["Name / Company", "Contact", "Status", "Credits", "Actions"].map((h) => (
              <span key={h} style={{ fontSize: 11, fontWeight: 600, color: T.text3, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                {h}
              </span>
            ))}
          </div>

          {loading ? (
            <div style={{ padding: 40, textAlign: "center", color: T.text3 }}>Loading...</div>
          ) : leads.length === 0 ? (
            <div style={{ padding: 40, textAlign: "center" }}>
              <p style={{ color: T.text3, fontSize: 14 }}>No leads yet.</p>
              <p style={{ color: T.text3, fontSize: 12, marginTop: 4 }}>Use the search panel above to find prospects.</p>
            </div>
          ) : (
            leads.map((lead, i) => (
              <div key={lead.id}>
                {i > 0 && <hr style={HR} />}
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 100px 80px 120px",
                  padding: "14px 20px",
                  alignItems: "center",
                }}>
                  {/* Name / Company */}
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 600, color: T.text }}>
                      {lead.name || "Unknown"}
                    </p>
                    <p style={{ fontSize: 12, color: T.text3 }}>
                      {lead.title ? `${lead.title}` : ""}{lead.title && lead.company ? " @ " : ""}{lead.company || ""}
                    </p>
                  </div>

                  {/* Contact */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    {lead.email && (
                      <a href={`mailto:${lead.email}`} style={{ fontSize: 12, color: T.gold, textDecoration: "none" }}>
                        {lead.email}
                      </a>
                    )}
                    {lead.linkedin_url && (
                      <a href={lead.linkedin_url} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: "#3b82f6", textDecoration: "none" }}>
                        LinkedIn
                      </a>
                    )}
                    {!lead.email && !lead.linkedin_url && (
                      <span style={{ fontSize: 12, color: T.text3 }}>—</span>
                    )}
                  </div>

                  {/* Status */}
                  <div>
                    <span style={{
                      fontSize: 11, fontWeight: 600,
                      padding: "3px 8px", borderRadius: 4,
                      background: STATUS_STYLES[lead.status]?.bg ?? STATUS_STYLES.new.bg,
                      color: STATUS_STYLES[lead.status]?.color ?? STATUS_STYLES.new.color,
                    }}>
                      {lead.status.replace(/_/g, " ")}
                    </span>
                  </div>

                  {/* Credits spent */}
                  <div>
                    <span style={{ fontSize: 12, color: T.text3 }}>{lead.credits_spent}</span>
                  </div>

                  {/* Actions */}
                  <div style={{ display: "flex", gap: 6 }}>
                    {lead.status !== "converted" && lead.status !== "dead" && (
                      <button
                        onClick={() => { setOutreachLead(lead); setOutreachContent(""); }}
                        disabled={credits < 1}
                        title={credits < 1 ? "Not enough credits" : "Reach Out (1 credit)"}
                        style={{
                          fontSize: 11, padding: "4px 10px", borderRadius: 6,
                          background: credits < 1 ? "rgba(255,255,255,0.04)" : T.goldDim,
                          color: credits < 1 ? T.text3 : T.gold,
                          border: `1px solid ${credits < 1 ? T.border : "rgba(200,164,78,0.25)"}`,
                          cursor: credits < 1 ? "not-allowed" : "pointer",
                          fontWeight: 500,
                        }}
                      >
                        Reach Out
                      </button>
                    )}
                    {lead.status === "replied" && (
                      <button
                        onClick={() => handleConvert(lead)}
                        style={{
                          fontSize: 11, padding: "4px 10px", borderRadius: 6,
                          background: "rgba(34,197,94,0.1)",
                          color: "#22c55e",
                          border: "1px solid rgba(34,197,94,0.2)",
                          cursor: "pointer",
                          fontWeight: 500,
                        }}
                      >
                        Convert
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Low credit warning */}
        {credits < 10 && credits >= 0 && (
          <div style={{
            marginTop: 16, padding: "10px 16px", borderRadius: 8,
            background: "rgba(245,158,11,0.08)",
            border: "1px solid rgba(245,158,11,0.2)",
            display: "flex", alignItems: "center", justifyContent: "space-between",
          }}>
            <span style={{ fontSize: 13, color: T.gold }}>
              {credits === 0 ? "No credits left." : `Only ${credits} credits remaining.`} Each outreach costs 1 credit.
            </span>
            <a
              href={`/dashboard/${businessId}/settings?tab=credits`}
              style={{ fontSize: 12, fontWeight: 600, color: T.gold, textDecoration: "none" }}
            >
              Buy credits
            </a>
          </div>
        )}

        {/* Outreach modal */}
        {outreachLead && (
          <div style={{
            position: "fixed", inset: 0, zIndex: 100,
            background: "rgba(0,0,0,0.7)",
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: 24,
          }}>
            <div style={{
              background: T.bgEl,
              border: `1px solid ${T.border}`,
              borderRadius: 16,
              padding: 28,
              width: "100%", maxWidth: 520,
            }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: T.text, marginBottom: 4 }}>
                Reach Out to {outreachLead.name || "Lead"}
              </h2>
              <p style={{ fontSize: 12, color: T.text3, marginBottom: 20 }}>
                1 credit will be deducted. Current balance: {credits} credits.
              </p>

              {/* Channel selector */}
              <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
                {OUTREACH_CHANNELS.map((ch) => (
                  <button
                    key={ch.value}
                    onClick={() => setOutreachChannel(ch.value)}
                    style={{
                      padding: "6px 14px", borderRadius: 6, fontSize: 12, fontWeight: 500,
                      border: `1px solid ${outreachChannel === ch.value ? T.gold : T.border}`,
                      background: outreachChannel === ch.value ? T.goldDim : "transparent",
                      color: outreachChannel === ch.value ? T.gold : T.text3,
                      cursor: "pointer",
                    }}
                  >
                    {ch.label}
                  </button>
                ))}
              </div>

              {/* Message */}
              <textarea
                value={outreachContent}
                onChange={(e) => setOutreachContent(e.target.value)}
                placeholder={`Write your ${outreachChannel} message...`}
                rows={5}
                style={{
                  width: "100%", padding: "10px 14px",
                  background: "rgba(255,255,255,0.04)",
                  border: `1px solid ${T.border}`,
                  borderRadius: 8, fontSize: 13, color: T.text,
                  outline: "none", resize: "vertical", boxSizing: "border-box",
                }}
              />

              <div style={{ display: "flex", gap: 10, marginTop: 16, justifyContent: "flex-end" }}>
                <button
                  onClick={() => { setOutreachLead(null); setOutreachContent(""); }}
                  style={{
                    padding: "8px 18px", borderRadius: 8, fontSize: 13,
                    background: "transparent",
                    border: `1px solid ${T.border}`,
                    color: T.text3, cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleOutreach}
                  disabled={sending || !outreachContent.trim()}
                  style={{
                    padding: "8px 18px", borderRadius: 8, fontSize: 13, fontWeight: 600,
                    background: sending || !outreachContent.trim() ? T.border : T.gold,
                    color: sending || !outreachContent.trim() ? T.text3 : "#09090B",
                    border: "none", cursor: sending || !outreachContent.trim() ? "not-allowed" : "pointer",
                  }}
                >
                  {sending ? "Sending..." : "Send (1 credit)"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </PaywallGate>
  );
}
