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

  // Teaser mode
  if (teaser) {
    const rows = teaser.previewRows || [];
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: 520,
          padding: "40px 16px",
        }}
      >
        <div
          style={{
            ...glassCard,
            background: "rgba(10,10,15,0.92)",
            backdropFilter: "blur(24px)",
            border: "1px solid rgba(123,57,252,0.15)",
            padding: "48px 40px 40px",
            maxWidth: 520,
            width: "100%",
            textAlign: "center",
          }}
        >
          {/* Icon */}
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 16,
              background: "linear-gradient(135deg, rgba(123,57,252,0.18), rgba(168,85,247,0.10))",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 24px",
              border: "1px solid rgba(123,57,252,0.20)",
            }}
          >
            <svg width="26" height="26" style={{ color: T.purpleLight }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
            </svg>
          </div>

          {/* Headline */}
          <h3
            style={{
              fontFamily: T.h,
              fontSize: 26,
              fontWeight: 700,
              color: T.text,
              marginBottom: 12,
              letterSpacing: "-0.4px",
              lineHeight: 1.2,
            }}
          >
            {teaser.headline}
          </h3>

          {/* Description */}
          <p
            style={{
              fontSize: 15,
              color: T.text2,
              lineHeight: 1.7,
              marginBottom: 28,
              maxWidth: 400,
              marginLeft: "auto",
              marginRight: "auto",
            }}
          >
            {teaser.description}
          </p>

          {/* Feature preview mockup */}
          {rows.length > 0 && (
            <div
              style={{
                background: "rgba(255,255,255,0.03)",
                border: `1px solid ${T.border}`,
                borderRadius: 12,
                padding: "4px 0",
                marginBottom: 28,
                overflow: "hidden",
              }}
            >
              {rows.map((row, i) => (
                <div
                  key={row.label}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "12px 20px",
                    borderBottom: i < rows.length - 1 ? `1px solid ${T.border}` : "none",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        background: row.color || T.purpleLight,
                        flexShrink: 0,
                      }}
                    />
                    <span style={{ fontSize: 13, color: T.text2 }}>{row.label}</span>
                  </div>
                  <span
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: T.text,
                      fontFamily: T.mono,
                    }}
                  >
                    {row.value}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Bullets */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 14,
              marginBottom: 32,
              maxWidth: 360,
              marginLeft: "auto",
              marginRight: "auto",
            }}
          >
            {teaser.bullets.map((bullet) => (
              <div key={bullet} style={{ display: "flex", alignItems: "center", gap: 12, textAlign: "left" }}>
                <div
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: "50%",
                    background: "rgba(34,197,94,0.12)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke={T.green}
                    strokeWidth={3}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                </div>
                <span style={{ fontSize: 14, color: T.text2, lineHeight: 1.4 }}>{bullet}</span>
              </div>
            ))}
          </div>

          {/* CTA */}
          <button
            onClick={handleUpgrade}
            disabled={loading}
            style={{
              background: CTA_GRAD,
              color: "#fff",
              border: "none",
              padding: "16px 36px",
              borderRadius: 14,
              fontSize: 16,
              fontWeight: 600,
              fontFamily: T.h,
              cursor: loading ? "wait" : "pointer",
              width: "100%",
              maxWidth: 340,
              transition: "all 0.2s",
              opacity: loading ? 0.7 : 1,
              boxShadow: "0 4px 24px rgba(123,57,252,0.25)",
              letterSpacing: "-0.2px",
            }}
          >
            {loading ? "Redirecting..." : `Unlock ${teaser.headline.split(" ")[0]} — $${(upgrade.price / 100).toFixed(2)}/mo`}
          </button>

          {/* Error message */}
          {error && (
            <p style={{ fontSize: 13, color: "#ef4444", marginTop: 12, maxWidth: 340 }}>
              {error}
            </p>
          )}

          {/* Social proof + plan badge */}
          <div style={{ marginTop: 20, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ display: "flex" }}>
                {[T.purple, T.purpleLight, T.green].map((c, i) => (
                  <div
                    key={c}
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: "50%",
                      background: `linear-gradient(135deg, ${c}, ${c}88)`,
                      border: "2px solid rgba(10,10,15,0.92)",
                      marginLeft: i > 0 ? -6 : 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="#fff" stroke="none">
                      <path d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                    </svg>
                  </div>
                ))}
              </div>
              <span style={{ fontSize: 12, color: T.text3 }}>
                Trusted by growing businesses
              </span>
            </div>
            <span style={{ fontSize: 11, color: T.text3 }}>
              Included in the {upgrade.name} plan
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Fallback: generic lock screen (no teaser prop)
  return (
    <div className="relative rounded-xl p-8 text-center" style={{ ...glassCard }}>
      <div
        className="absolute inset-0 rounded-xl"
        style={{ background: `linear-gradient(to bottom, transparent, ${T.bg})` }}
      />
      <div className="relative z-10">
        <div
          className="w-12 h-12 mx-auto mb-4 rounded-xl flex items-center justify-center"
          style={{ background: "rgba(123,57,252,0.10)" }}
        >
          <svg className="w-6 h-6" style={{ color: T.purpleLight }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
          </svg>
        </div>
        <h3 className="font-semibold text-lg mb-2" style={{ color: T.text, fontFamily: T.h }}>Upgrade to {upgrade.name}</h3>
        <p className="text-sm mb-6 max-w-sm mx-auto" style={{ color: T.text2 }}>
          This feature is available on the {upgrade.name} plan.
          {upgrade.price > 0 && ` Starting at $${(upgrade.price / 100).toFixed(2)}/mo.`}
        </p>
        <button
          onClick={handleUpgrade}
          disabled={loading}
          className="inline-block px-6 py-3 rounded-xl text-sm font-semibold"
          style={{ background: CTA_GRAD, color: "#fff" }}
        >
          {loading ? "Redirecting..." : `Upgrade to ${upgrade.name}`}
        </button>
        {error && (
          <p className="text-xs mt-3" style={{ color: "#ef4444" }}>{error}</p>
        )}
      </div>
    </div>
  );
}
