"use client";

import { meetsRequiredPlan, getUpgradePlan } from "@/lib/plans";
import { useBusinessContext } from "./BusinessProvider";
import { supabase } from "@/lib/supabase";
import { useState } from "react";
import { T, CTA_GRAD, glassCard } from "@/lib/design-tokens";

interface PreviewRow {
  label: string;
  value: string;
  color?: string;
}

interface PaywallGateProps {
  requiredPlan: "free" | "starter" | "growth" | "pro";
  children: React.ReactNode;
  compact?: boolean;
  teaser?: {
    headline: string;
    description: string;
    bullets: string[];
    previewRows?: PreviewRow[];
  };
}

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

  if (compact) {
    return (
      <div
        className="flex items-center gap-2 px-3 py-2 rounded-lg"
        style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${T.border}` }}
      >
        <svg className="w-4 h-4 shrink-0" style={{ color: T.text3 }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
        </svg>
        <span className="text-xs" style={{ color: T.text3 }}>
          Upgrade to <button onClick={handleUpgrade} className="font-medium transition" style={{ color: T.purpleLight }}>{upgrade.name}</button> to unlock
        </span>
      </div>
    );
  }

  // Teaser mode or fallback — both render as a dashboard-style page section
  const rows = teaser?.previewRows || [];
  const headline = teaser?.headline || `Upgrade to ${upgrade.name}`;
  const description = teaser?.description || `This feature is available on the ${upgrade.name} plan.${upgrade.price > 0 ? ` Starting at $${(upgrade.price / 100).toFixed(2)}/mo.` : ""}`;
  const bullets = teaser?.bullets || [];

  return (
    <div style={{ padding: "32px 0" }}>
      {/* Page header — looks like any other dashboard page */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: T.text, letterSpacing: "-0.02em", margin: "0 0 4px" }}>
          {headline}
        </h1>
        <p style={{ fontSize: 14, color: T.text3, margin: 0 }}>{description}</p>
      </div>

      {/* Blurred preview rows — looks like real data, locked */}
      {rows.length > 0 && (
        <div
          style={{
            background: T.glass,
            border: `1px solid ${T.border}`,
            borderRadius: 12,
            overflow: "hidden",
            marginBottom: 24,
            filter: "blur(3px)",
            pointerEvents: "none",
            userSelect: "none",
            opacity: 0.5,
          }}
        >
          {rows.map((row, i) => (
            <div
              key={row.label}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "14px 20px",
                borderBottom: i < rows.length - 1 ? `1px solid ${T.border}` : "none",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: row.color || T.gold, flexShrink: 0 }} />
                <span style={{ fontSize: 13.5, color: T.text2 }}>{row.label}</span>
              </div>
              <span style={{ fontSize: 13.5, fontWeight: 600, color: T.text, fontFamily: T.mono }}>{row.value}</span>
            </div>
          ))}
        </div>
      )}

      {/* Upgrade card — inline, not a modal */}
      <div
        style={{
          background: T.glass,
          border: `1px solid ${T.border}`,
          borderRadius: 12,
          padding: "28px 24px",
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 32,
          flexWrap: "wrap",
        }}
      >
        {/* Left: bullets */}
        {bullets.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12, flex: 1, minWidth: 200 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: T.text3, textTransform: "uppercase", letterSpacing: "0.06em", margin: 0 }}>
              What you get
            </p>
            {bullets.map((bullet) => (
              <div key={bullet} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={T.green} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4.5 12.75l6 6 9-13.5" />
                </svg>
                <span style={{ fontSize: 13.5, color: T.text2 }}>{bullet}</span>
              </div>
            ))}
          </div>
        )}

        {/* Right: CTA */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 12, flexShrink: 0 }}>
          <div>
            <p style={{ fontSize: 22, fontWeight: 700, color: T.text, margin: "0 0 2px", letterSpacing: "-0.02em" }}>
              {upgrade.price > 0 ? `$${(upgrade.price / 100).toFixed(0)}/mo` : "Free"}
            </p>
            <p style={{ fontSize: 13, color: T.text3, margin: 0 }}>{upgrade.name} plan</p>
          </div>
          <button
            onClick={handleUpgrade}
            disabled={loading}
            style={{
              background: CTA_GRAD,
              color: "#fff",
              border: "none",
              padding: "12px 28px",
              borderRadius: 10,
              fontSize: 14,
              fontWeight: 600,
              fontFamily: T.h,
              cursor: loading ? "wait" : "pointer",
              opacity: loading ? 0.7 : 1,
              whiteSpace: "nowrap",
            }}
          >
            {loading ? "Redirecting..." : `Upgrade to ${upgrade.name}`}
          </button>
          {error && <p style={{ fontSize: 12, color: "#ef4444", margin: 0 }}>{error}</p>}
        </div>
      </div>
    </div>
  );
}
