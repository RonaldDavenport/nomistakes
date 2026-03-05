"use client";

import { useBusinessContext } from "@/components/dashboard/BusinessProvider";
import { PaywallGate } from "@/components/dashboard/PaywallGate";
import { T, CTA_GRAD } from "@/lib/design-tokens";
import { useParams } from "next/navigation";
import { useState, useEffect, useCallback } from "react";

interface ReferralLink {
  id: string;
  code: string;
  label: string | null;
  target_url: string;
  clicks: number;
  conversions: number;
  created_at: string;
}


export default function ReferralsPage() {
  const params = useParams();
  const businessId = params.businessId as string;
  useBusinessContext();

  const [referrals, setReferrals] = useState<ReferralLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [label, setLabel] = useState("");
  const [targetUrl, setTargetUrl] = useState("");

  const fetchReferrals = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/referrals?businessId=${businessId}`);
    const data = await res.json();
    setReferrals(data.referrals || []);
    setLoading(false);
  }, [businessId]);

  useEffect(() => { fetchReferrals(); }, [fetchReferrals]);

  const createReferral = async () => {
    if (!targetUrl.trim()) return;
    setSaving(true);
    await fetch("/api/referrals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ businessId, label: label || null, targetUrl }),
    });
    setSaving(false);
    setShowCreate(false);
    setLabel(""); setTargetUrl("");
    fetchReferrals();
  };

  const deleteReferral = async (referralId: string) => {
    if (!confirm("Delete this referral link?")) return;
    await fetch("/api/referrals", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ referralId }),
    });
    fetchReferrals();
  };

  const copyLink = (code: string) => {
    const url = `${window.location.origin}/r/${code}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(code);
      setTimeout(() => setCopied(null), 2000);
    });
  };

  const totalClicks = referrals.reduce((s, r) => s + r.clicks, 0);
  const totalConversions = referrals.reduce((s, r) => s + r.conversions, 0);

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "10px 12px", fontSize: 13,
    background: T.bgAlt, border: `1px solid ${T.border}`,
    borderRadius: 8, color: T.text, outline: "none", boxSizing: "border-box",
  };

  return (
    <PaywallGate requiredPlan="starter" teaser={{ headline: "Referral Links", description: "Create trackable referral links to see which channels drive the most bookings.", bullets: ["Track link clicks", "Measure conversions", "Multiple links per channel"] }}>
      <div style={{ padding: "32px 40px 80px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: T.text, margin: 0 }}>Referral Links</h1>
            <p style={{ fontSize: 13, color: T.subtitle, marginTop: 4 }}>Track where your clients are coming from.</p>
          </div>
          <button onClick={() => setShowCreate(true)} style={{ background: CTA_GRAD, color: "#09090B", border: "none", borderRadius: 8, padding: "10px 20px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
            + New Link
          </button>
        </div>

        {/* Stats */}
        <div style={{ display: "flex", gap: 40, marginBottom: 28 }}>
          {[
            { label: "Total Links", value: referrals.length },
            { label: "Total Clicks", value: totalClicks },
            { label: "Conversions", value: totalConversions },
          ].map((s, i, arr) => (
            <div key={s.label} style={{ display: "flex", gap: 40, alignItems: "center" }}>
              <div>
                <p style={{ fontSize: 11, fontWeight: 600, color: T.subtitle, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>{s.label}</p>
                <p style={{ fontSize: 28, fontWeight: 700, color: T.text, margin: 0 }}>{s.value}</p>
              </div>
              {i < arr.length - 1 && <div style={{ width: 1, height: 40, background: T.rule }} />}
            </div>
          ))}
        </div>

        <div style={{ height: 1, background: T.rule, marginBottom: 24 }} />

        {loading ? (
          <p style={{ color: T.subtitle, fontSize: 13 }}>Loading...</p>
        ) : referrals.length === 0 ? (
          <div style={{ maxWidth: 480, paddingTop: 16 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: T.text, marginBottom: 8 }}>No referral links yet</h2>
            <p style={{ fontSize: 14, color: T.subtitle, lineHeight: 1.6, marginBottom: 24 }}>
              Create trackable links for your Instagram bio, email signature, or anywhere you promote your business. See exactly which channels drive bookings.
            </p>
            <button onClick={() => setShowCreate(true)} style={{ background: CTA_GRAD, color: "#09090B", border: "none", borderRadius: 8, padding: "10px 24px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
              Create First Link
            </button>
          </div>
        ) : (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 80px 80px 80px 100px", gap: 12, padding: "8px 0", borderBottom: `1px solid ${T.rule}`, fontSize: 11, fontWeight: 600, color: T.subtitle, textTransform: "uppercase", letterSpacing: "0.06em" }}>
              <span>Label / Code</span>
              <span>Clicks</span>
              <span>Conversions</span>
              <span>Created</span>
              <span style={{ textAlign: "right" }}>Actions</span>
            </div>
            {referrals.map((r) => (
              <div key={r.id} style={{ display: "grid", gridTemplateColumns: "1fr 80px 80px 80px 100px", gap: 12, padding: "14px 0", borderBottom: `1px solid ${T.rule}`, alignItems: "center" }}>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 500, color: T.text, margin: 0 }}>{r.label || "Untitled link"}</p>
                  <p style={{ fontSize: 12, color: T.subtitle, margin: 0, marginTop: 2, fontFamily: "monospace" }}>
                    {window.location.origin}/r/{r.code}
                  </p>
                </div>
                <span style={{ fontSize: 14, fontWeight: 600, color: T.text }}>{r.clicks}</span>
                <span style={{ fontSize: 14, fontWeight: 600, color: r.conversions > 0 ? T.green : T.text }}>{r.conversions}</span>
                <span style={{ fontSize: 12, color: T.subtitle }}>
                  {new Date(r.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </span>
                <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                  <button onClick={() => copyLink(r.code)} style={{ fontSize: 12, color: copied === r.code ? T.green : T.gold, background: "none", border: "none", cursor: "pointer", fontWeight: 500, padding: 0 }}>
                    {copied === r.code ? "Copied!" : "Copy"}
                  </button>
                  <button onClick={() => deleteReferral(r.id)} style={{ fontSize: 12, color: T.subtitle, background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create modal */}
        {showCreate && (
          <>
            <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 50 }} onClick={() => setShowCreate(false)} />
            <div style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: 480, background: T.bgEl, border: `1px solid ${T.border}`, borderRadius: 12, padding: 28, zIndex: 51 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: T.text, marginBottom: 20 }}>New Referral Link</h2>
              <label style={{ display: "block", marginBottom: 16 }}>
                <span style={{ fontSize: 12, fontWeight: 500, color: T.subtitle, display: "block", marginBottom: 6 }}>Label (optional)</span>
                <input value={label} onChange={(e) => setLabel(e.target.value)} style={inputStyle} placeholder="e.g. Instagram bio, Email signature" />
              </label>
              <label style={{ display: "block", marginBottom: 20 }}>
                <span style={{ fontSize: 12, fontWeight: 500, color: T.subtitle, display: "block", marginBottom: 6 }}>Destination URL *</span>
                <input value={targetUrl} onChange={(e) => setTargetUrl(e.target.value)} style={inputStyle} placeholder="https://yourbusiness.com/book" />
              </label>
              <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
                <button onClick={() => setShowCreate(false)} style={{ padding: "10px 20px", fontSize: 13, background: "none", border: `1px solid ${T.border}`, borderRadius: 8, color: T.subtitle, cursor: "pointer" }}>Cancel</button>
                <button onClick={createReferral} disabled={saving || !targetUrl.trim()} style={{ padding: "10px 20px", fontSize: 13, fontWeight: 600, background: CTA_GRAD, border: "none", borderRadius: 8, color: "#09090B", cursor: "pointer", opacity: saving ? 0.6 : 1 }}>
                  {saving ? "Creating..." : "Create Link"}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </PaywallGate>
  );
}
