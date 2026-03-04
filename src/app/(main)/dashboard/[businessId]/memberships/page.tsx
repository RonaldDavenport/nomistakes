"use client";

import { useBusinessContext } from "@/components/dashboard/BusinessProvider";
import { PaywallGate } from "@/components/dashboard/PaywallGate";
import { T, CTA_GRAD } from "@/lib/design-tokens";
import { useParams } from "next/navigation";
import { useState, useEffect, useCallback } from "react";

interface Membership {
  id: string;
  name: string;
  description: string | null;
  price_cents: number;
  interval: string;
  features: string[];
  status: string;
  member_count: number;
  created_at: string;
}

function fmt(cents: number) { return `$${(cents / 100).toFixed(2)}`; }

const HR: React.CSSProperties = {
  width: "100%",
  height: 1,
  background: "#1E1E21",
  border: "none",
  margin: 0,
};

export default function MembershipsPage() {
  const params = useParams();
  const businessId = params.businessId as string;
  const { userId } = useBusinessContext();

  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [price, setPrice] = useState("");
  const [interval, setInterval] = useState("monthly");
  const [features, setFeatures] = useState("");

  const fetchMemberships = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/memberships?businessId=${businessId}`);
    const data = await res.json();
    setMemberships(data.memberships || []);
    setLoading(false);
  }, [businessId]);

  useEffect(() => { fetchMemberships(); }, [fetchMemberships]);

  const createMembership = async () => {
    setSaving(true);
    await fetch("/api/memberships", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        businessId, userId, name, description: desc,
        priceCents: Math.round(parseFloat(price || "0") * 100),
        interval,
        features: features.split("\n").map((f) => f.trim()).filter(Boolean),
      }),
    });
    setSaving(false);
    setShowCreate(false);
    setName(""); setDesc(""); setPrice(""); setInterval("monthly"); setFeatures("");
    fetchMemberships();
  };

  const toggleStatus = async (id: string, current: string) => {
    await fetch("/api/memberships", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ membershipId: id, status: current === "active" ? "draft" : "active" }),
    });
    fetchMemberships();
  };

  const totalMembers = memberships.reduce((s, m) => s + (m.member_count || 0), 0);
  const totalMRR = memberships
    .filter((m) => m.status === "active")
    .reduce((s, m) => s + (m.price_cents * (m.member_count || 0)), 0);

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "10px 12px", fontSize: 13,
    background: T.bgAlt, border: `1px solid ${T.border}`, borderRadius: 8, color: T.text, outline: "none",
  };

  return (
    <PaywallGate requiredPlan="growth" teaser={{ headline: "Memberships", description: "Create recurring membership tiers. Offer exclusive content, community access, and perks to subscribers.", bullets: ["Monthly and yearly tiers", "Feature lists per tier", "Member tracking"] }}>
      <div style={{ padding: "32px 40px 80px" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: T.text, margin: 0 }}>Memberships</h1>
            <p style={{ fontSize: 13, color: "#9CA3AF", marginTop: 4 }}>
              Create recurring tiers and manage your subscriber base
            </p>
          </div>
          <button onClick={() => setShowCreate(true)} style={{ background: CTA_GRAD, color: "#09090B", border: "none", borderRadius: 8, padding: "10px 20px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
            + New Tier
          </button>
        </div>

        {/* Flat stats row */}
        <div style={HR} />
        <div style={{ display: "flex", alignItems: "center", padding: "16px 0" }}>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 11, fontWeight: 500, color: "#52525B", margin: 0, marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.05em" }}>Tiers</p>
            <p style={{ fontSize: 20, fontWeight: 700, color: T.text, margin: 0, fontVariantNumeric: "tabular-nums" }}>{memberships.length}</p>
          </div>
          <div style={{ width: 1, height: 36, background: "#1E1E21" }} />
          <div style={{ flex: 1, paddingLeft: 24 }}>
            <p style={{ fontSize: 11, fontWeight: 500, color: "#52525B", margin: 0, marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.05em" }}>Members</p>
            <p style={{ fontSize: 20, fontWeight: 700, color: T.text, margin: 0, fontVariantNumeric: "tabular-nums" }}>{totalMembers}</p>
          </div>
          <div style={{ width: 1, height: 36, background: "#1E1E21" }} />
          <div style={{ flex: 1, paddingLeft: 24 }}>
            <p style={{ fontSize: 11, fontWeight: 500, color: "#52525B", margin: 0, marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.05em" }}>Monthly MRR</p>
            <p style={{ fontSize: 20, fontWeight: 700, color: T.text, margin: 0, fontVariantNumeric: "tabular-nums" }}>{fmt(totalMRR)}<span style={{ fontSize: 13, fontWeight: 400, color: "#9CA3AF" }}>/mo</span></p>
          </div>
        </div>
        <div style={HR} />

        {/* Content */}
        {loading ? (
          <p style={{ color: "#9CA3AF", fontSize: 13, padding: "40px 0" }}>Loading...</p>
        ) : memberships.length === 0 ? (
          <div style={{ padding: "48px 0" }}>
            {/* Educational empty state */}
            <div style={{ maxWidth: 640 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: T.text, margin: 0, marginBottom: 6 }}>Build a recurring revenue stream</h2>
              <p style={{ fontSize: 14, color: "#9CA3AF", margin: 0, marginBottom: 32, lineHeight: 1.6 }}>
                Memberships let your customers subscribe to your business for ongoing access, perks, and exclusive content.
                Create tiers at different price points to capture every segment of your audience.
              </p>

              <div style={HR} />

              {/* How it works section */}
              <div style={{ padding: "28px 0" }}>
                <h3 style={{ fontSize: 14, fontWeight: 600, color: T.text, margin: 0, marginBottom: 16 }}>How memberships work</h3>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 20 }}>
                  {[
                    { step: "1", title: "Create tiers", desc: "Set up monthly or yearly plans with pricing, features, and descriptions that speak to your audience." },
                    { step: "2", title: "Share with customers", desc: "Publish your tiers and embed them on your site. Customers subscribe through Stripe-powered checkout." },
                    { step: "3", title: "Grow and manage", desc: "Track member counts, MRR, and engagement. Adjust tiers as your community evolves." },
                  ].map((item) => (
                    <div key={item.step}>
                      <div style={{ width: 28, height: 28, borderRadius: 6, background: T.goldDim, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 10 }}>
                        <span style={{ fontSize: 12, fontWeight: 700, color: T.gold }}>{item.step}</span>
                      </div>
                      <p style={{ fontSize: 13, fontWeight: 600, color: T.text, margin: 0, marginBottom: 4 }}>{item.title}</p>
                      <p style={{ fontSize: 12, color: "#9CA3AF", margin: 0, lineHeight: 1.5 }}>{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div style={HR} />

              {/* Ideas section */}
              <div style={{ padding: "28px 0" }}>
                <h3 style={{ fontSize: 14, fontWeight: 600, color: T.text, margin: 0, marginBottom: 16 }}>What you can offer members</h3>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  {[
                    "Early access to new products or drops",
                    "Exclusive discounts and promotions",
                    "Members-only content or tutorials",
                    "Priority customer support",
                    "Monthly or quarterly swag boxes",
                    "Community access (Discord, Slack, etc.)",
                    "1-on-1 calls or group coaching sessions",
                    "Behind-the-scenes updates and roadmaps",
                  ].map((idea, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: "8px 0" }}>
                      <span style={{ fontSize: 12, color: T.gold, marginTop: 1, flexShrink: 0 }}>&#10003;</span>
                      <span style={{ fontSize: 13, color: "#9CA3AF", lineHeight: 1.4 }}>{idea}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={HR} />

              {/* CTA */}
              <div style={{ paddingTop: 28 }}>
                <button onClick={() => setShowCreate(true)} style={{ background: CTA_GRAD, color: "#09090B", border: "none", borderRadius: 8, padding: "12px 24px", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
                  Create your first tier
                </button>
                <p style={{ fontSize: 12, color: "#52525B", marginTop: 10 }}>
                  You can always save a tier as a draft before publishing it to customers.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div style={{ paddingTop: 8 }}>
            {memberships.map((m, idx) => (
              <div key={m.id}>
                <div style={{ padding: "20px 0" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                        <span style={{ fontSize: 15, fontWeight: 600, color: T.text }}>{m.name}</span>
                        <span style={{ fontSize: 12, fontWeight: 500, color: m.status === "active" ? T.green : "#52525B" }}>
                          {m.status === "active" ? "Active" : "Draft"}
                        </span>
                      </div>
                      {m.description && (
                        <p style={{ fontSize: 13, color: "#9CA3AF", marginBottom: 8 }}>{m.description}</p>
                      )}
                      {m.features.length > 0 && (
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                          {m.features.map((f, i) => (
                            <span key={i} style={{ fontSize: 11, color: "#9CA3AF", padding: "3px 8px", borderRadius: 4, background: "rgba(255,255,255,0.04)" }}>
                              {f}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 16, marginLeft: 16 }}>
                      <div style={{ textAlign: "right" }}>
                        <span style={{ fontSize: 15, fontWeight: 600, color: T.text, fontVariantNumeric: "tabular-nums" }}>
                          {fmt(m.price_cents)}
                        </span>
                        <span style={{ fontSize: 12, color: "#52525B" }}>/{m.interval === "yearly" ? "yr" : "mo"}</span>
                      </div>
                      <span style={{ fontSize: 12, color: "#9CA3AF" }}>{m.member_count || 0} members</span>
                      <button onClick={() => toggleStatus(m.id, m.status)} style={{ fontSize: 12, color: T.gold, background: "none", border: "none", cursor: "pointer" }}>
                        {m.status === "active" ? "Unpublish" : "Publish"}
                      </button>
                    </div>
                  </div>
                </div>
                {idx < memberships.length - 1 && <div style={HR} />}
              </div>
            ))}
          </div>
        )}

        {/* Create modal */}
        {showCreate && (
          <>
            <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 50 }} onClick={() => setShowCreate(false)} />
            <div style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: 480, background: T.bgEl, border: `1px solid ${T.border}`, borderRadius: 12, padding: 28, zIndex: 51 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: T.text, marginBottom: 20 }}>New Membership Tier</h2>
              <label style={{ display: "block", marginBottom: 16 }}>
                <span style={{ fontSize: 12, fontWeight: 500, color: "#9CA3AF", display: "block", marginBottom: 6 }}>Tier Name</span>
                <input value={name} onChange={(e) => setName(e.target.value)} style={inputStyle} placeholder="e.g. Pro Member" />
              </label>
              <label style={{ display: "block", marginBottom: 16 }}>
                <span style={{ fontSize: 12, fontWeight: 500, color: "#9CA3AF", display: "block", marginBottom: 6 }}>Description</span>
                <textarea value={desc} onChange={(e) => setDesc(e.target.value)} rows={2} style={{ ...inputStyle, resize: "vertical" }} />
              </label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
                <label>
                  <span style={{ fontSize: 12, fontWeight: 500, color: "#9CA3AF", display: "block", marginBottom: 6 }}>Price ($)</span>
                  <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} style={inputStyle} placeholder="29.00" />
                </label>
                <label>
                  <span style={{ fontSize: 12, fontWeight: 500, color: "#9CA3AF", display: "block", marginBottom: 6 }}>Interval</span>
                  <select value={interval} onChange={(e) => setInterval(e.target.value)} style={{ ...inputStyle, appearance: "none" as const }}>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </label>
              </div>
              <label style={{ display: "block", marginBottom: 20 }}>
                <span style={{ fontSize: 12, fontWeight: 500, color: "#9CA3AF", display: "block", marginBottom: 6 }}>Features (one per line)</span>
                <textarea value={features} onChange={(e) => setFeatures(e.target.value)} rows={4} style={{ ...inputStyle, resize: "vertical" }} placeholder={"Priority support\nExclusive content\nMonthly 1-on-1 call"} />
              </label>
              <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
                <button onClick={() => setShowCreate(false)} style={{ padding: "10px 20px", fontSize: 13, background: "none", border: `1px solid ${T.border}`, borderRadius: 8, color: "#9CA3AF", cursor: "pointer" }}>Cancel</button>
                <button onClick={createMembership} disabled={saving || !name} style={{ padding: "10px 20px", fontSize: 13, fontWeight: 600, background: CTA_GRAD, border: "none", borderRadius: 8, color: "#09090B", cursor: "pointer", opacity: saving ? 0.6 : 1 }}>
                  {saving ? "Creating..." : "Create Tier"}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </PaywallGate>
  );
}
