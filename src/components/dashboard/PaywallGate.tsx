"use client";

import { meetsRequiredPlan, getUpgradePlan } from "@/lib/plans";
import { useBusinessContext } from "./BusinessProvider";
import { supabase } from "@/lib/supabase";
import { useState } from "react";
import { T, CTA_GRAD, glassCard } from "@/lib/design-tokens";

interface PaywallGateProps {
  requiredPlan: "free" | "starter" | "growth" | "pro";
  feature?: string;
  children: React.ReactNode;
  compact?: boolean;
}

export function PaywallGate({ requiredPlan, children, compact }: PaywallGateProps) {
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
