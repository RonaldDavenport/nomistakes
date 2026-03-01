"use client";

import { meetsRequiredPlan, getUpgradePlan } from "@/lib/plans";
import { useBusinessContext } from "./BusinessProvider";
import { supabase } from "@/lib/supabase";
import { useState } from "react";
import { T, CTA_GRAD, glassCard } from "@/lib/design-tokens";

interface PaywallGateProps {
  requiredPlan: "free" | "starter" | "growth" | "pro";
  children: React.ReactNode;
  compact?: boolean;
  teaser?: {
    headline: string;
    description: string;
    bullets: string[];
  };
}

export function PaywallGate({ requiredPlan, children, compact, teaser }: PaywallGateProps) {
  const { plan } = useBusinessContext();
  const [loading, setLoading] = useState(false);

  if (meetsRequiredPlan(plan, requiredPlan)) {
    return <>{children}</>;
  }

  const upgrade = getUpgradePlan(requiredPlan);

  async function handleUpgrade() {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId: upgrade.id, userId: user.id, email: user.email }),
      });
      const { url } = await res.json();
      if (url) window.location.href = url;
    } catch {
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

  // Teaser mode: blur children behind + overlay teaser card
  if (teaser) {
    return (
      <div style={{ position: "relative", minHeight: 400 }}>
        {/* Blurred children behind */}
        <div
          aria-hidden
          style={{
            filter: "blur(6px)",
            opacity: 0.4,
            pointerEvents: "none",
            userSelect: "none",
            overflow: "hidden",
            maxHeight: 600,
          }}
        >
          {children}
        </div>

        {/* Dark overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `linear-gradient(to bottom, rgba(0,0,0,0.5), ${T.bg})`,
            zIndex: 1,
          }}
        />

        {/* Teaser card */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
          }}
        >
          <div
            style={{
              ...glassCard,
              background: "rgba(10,10,15,0.85)",
              backdropFilter: "blur(20px)",
              padding: "40px 36px",
              maxWidth: 440,
              width: "100%",
              textAlign: "center",
            }}
          >
            {/* Icon */}
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 14,
                background: "rgba(123,57,252,0.12)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 20px",
              }}
            >
              <svg width="24" height="24" style={{ color: T.purpleLight }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
              </svg>
            </div>

            {/* Headline */}
            <h3
              style={{
                fontFamily: T.h,
                fontSize: 22,
                fontWeight: 700,
                color: T.text,
                marginBottom: 10,
                letterSpacing: "-0.3px",
              }}
            >
              {teaser.headline}
            </h3>

            {/* Description */}
            <p
              style={{
                fontSize: 14,
                color: T.text2,
                lineHeight: 1.6,
                marginBottom: 24,
                maxWidth: 360,
                marginLeft: "auto",
                marginRight: "auto",
              }}
            >
              {teaser.description}
            </p>

            {/* Bullets */}
            <div style={{ textAlign: "left", marginBottom: 28, maxWidth: 320, marginLeft: "auto", marginRight: "auto" }}>
              {teaser.bullets.map((bullet) => (
                <div key={bullet} style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 12 }}>
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke={T.purpleLight}
                    strokeWidth={2.5}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ flexShrink: 0, marginTop: 1 }}
                  >
                    <path d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                  <span style={{ fontSize: 13, color: T.text2, lineHeight: 1.5 }}>{bullet}</span>
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
                padding: "14px 32px",
                borderRadius: 12,
                fontSize: 15,
                fontWeight: 600,
                fontFamily: T.h,
                cursor: loading ? "wait" : "pointer",
                width: "100%",
                maxWidth: 300,
                transition: "opacity 0.2s",
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? "Redirecting..." : `Unlock ${teaser.headline.split(" ")[0]} — $${(upgrade.price / 100).toFixed(2)}/mo`}
            </button>

            {/* Plan badge */}
            <p style={{ fontSize: 11, color: T.text3, marginTop: 14 }}>
              Included in the {upgrade.name} plan
            </p>
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
      </div>
    </div>
  );
}
