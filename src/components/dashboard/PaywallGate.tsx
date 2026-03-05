"use client";

import { meetsRequiredPlan, getUpgradePlan } from "@/lib/plans";
import { useBusinessContext } from "./BusinessProvider";
import { supabase } from "@/lib/supabase";
import { useState } from "react";
import { T, CTA_GRAD } from "@/lib/design-tokens";

interface PreviewRow {
  label: string;
  value: string;
  color?: string;
}

interface PaywallGateProps {
  requiredPlan: "free" | "solo" | "scale";
  children: React.ReactNode;
  compact?: boolean;
  teaser?: {
    headline: string;
    description: string;
    bullets: string[];
    previewRows?: PreviewRow[];
  };
}

// Icon paths for each plan tier
const LOCK_ICON = "M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z";

export function PaywallGate({ requiredPlan, children, compact, teaser }: PaywallGateProps) {
  const { plan } = useBusinessContext();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (meetsRequiredPlan(plan, requiredPlan)) {
    return <>{children}</>;
  }

  const upgrade = getUpgradePlan(requiredPlan);

  async function handleUpgrade() {
    setLoading(true);
    setError(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError("Please sign in to upgrade.");
        setLoading(false);
        return;
      }
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId: upgrade.id, userId: user.id, email: user.email }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        setError(data.error || "Something went wrong. Please try again.");
        setLoading(false);
        return;
      }
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError("Could not create checkout session. Please try again.");
        setLoading(false);
      }
    } catch (err) {
      console.error("Upgrade error:", err);
      setError("Network error. Please check your connection and try again.");
      setLoading(false);
    }
  }

  // Compact inline variant (used inside checklist, cards, etc.)
  if (compact) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", borderRadius: 8, background: "rgba(255,255,255,0.02)", border: `1px solid ${T.border}` }}>
        <svg width="16" height="16" style={{ color: T.text3, flexShrink: 0 }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d={LOCK_ICON} />
        </svg>
        <span style={{ fontSize: 12, color: T.text3 }}>
          Upgrade to{" "}
          <button onClick={handleUpgrade} style={{ background: "none", border: "none", padding: 0, cursor: "pointer", fontSize: 12, fontWeight: 600, color: T.gold, fontFamily: "inherit" }}>{upgrade.name}</button>
          {" "}to unlock
        </span>
      </div>
    );
  }

  const rows = teaser?.previewRows || [];
  const headline = teaser?.headline || upgrade.name;
  const description = teaser?.description || `Unlock this feature on the ${upgrade.name} plan.`;
  const bullets = teaser?.bullets || [];
  const price = upgrade.price > 0 ? `$${(upgrade.price / 100).toFixed(0)}/mo` : "Free";

  return (
    <div style={{ padding: "48px 24px 64px", maxWidth: 720, margin: "0 auto" }}>

      {/* Header */}
      <div style={{ marginBottom: 36 }}>
        <div style={{
          display: "inline-flex", alignItems: "center", justifyContent: "center",
          width: 44, height: 44, borderRadius: 12,
          background: "rgba(200,164,78,0.1)", border: `1px solid rgba(200,164,78,0.2)`,
          marginBottom: 16,
        }}>
          <svg width="20" height="20" fill="none" stroke={T.gold} viewBox="0 0 24 24" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d={LOCK_ICON} />
          </svg>
        </div>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: T.text, letterSpacing: "-0.02em", margin: "0 0 8px" }}>
          {headline}
        </h1>
        <p style={{ fontSize: 14, color: T.text2, margin: 0, lineHeight: 1.6 }}>{description}</p>
      </div>

      {/* Blurred preview rows */}
      {rows.length > 0 && (
        <div style={{
          borderRadius: 12, overflow: "hidden", marginBottom: 24,
          border: `1px solid ${T.border}`,
          filter: "blur(2px)", pointerEvents: "none", userSelect: "none", opacity: 0.45,
        }}>
          {rows.map((row, i) => (
            <div
              key={row.label}
              style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "13px 20px",
                background: T.glass,
                borderBottom: i < rows.length - 1 ? `1px solid ${T.border}` : "none",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 7, height: 7, borderRadius: "50%", background: row.color || T.gold, flexShrink: 0 }} />
                <span style={{ fontSize: 13, color: T.text2 }}>{row.label}</span>
              </div>
              <span style={{ fontSize: 13, fontWeight: 500, color: T.text3 }}>{row.value}</span>
            </div>
          ))}
        </div>
      )}

      {/* Upgrade card */}
      <div style={{
        background: T.glass,
        border: `1px solid ${T.border}`,
        borderRadius: 16,
        padding: "28px 28px 24px",
      }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 32, flexWrap: "wrap" }}>

          {/* Bullets */}
          {bullets.length > 0 && (
            <div style={{ flex: 1, minWidth: 200 }}>
              <p style={{ fontSize: 11, fontWeight: 600, color: T.text3, textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 14px" }}>
                What&apos;s included
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {bullets.map((b) => (
                  <div key={b} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={T.green} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                    <span style={{ fontSize: 13.5, color: T.text2 }}>{b}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Price + CTA */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: bullets.length > 0 ? "flex-end" : "flex-start", gap: 6, flexShrink: 0 }}>
            <div style={{ marginBottom: 4 }}>
              <p style={{ fontSize: 28, fontWeight: 700, color: T.text, margin: "0 0 2px", letterSpacing: "-0.03em" }}>
                {price}
              </p>
              <p style={{ fontSize: 12, color: T.text3, margin: 0 }}>{upgrade.name} plan</p>
            </div>
            <button
              onClick={handleUpgrade}
              disabled={loading}
              style={{
                background: CTA_GRAD,
                color: "#fff",
                border: "none",
                padding: "12px 32px",
                borderRadius: 10,
                fontSize: 14,
                fontWeight: 600,
                fontFamily: T.h,
                cursor: loading ? "wait" : "pointer",
                opacity: loading ? 0.7 : 1,
                whiteSpace: "nowrap",
                letterSpacing: "-0.01em",
              }}
            >
              {loading ? "Redirecting..." : `Upgrade to ${upgrade.name}`}
            </button>
            {error && <p style={{ fontSize: 12, color: "#ef4444", margin: 0 }}>{error}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
