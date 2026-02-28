"use client";

import Link from "next/link";
import { meetsRequiredPlan, getUpgradePlan } from "@/lib/plans";
import { useBusinessContext } from "./BusinessProvider";

interface PaywallGateProps {
  requiredPlan: "free" | "starter" | "growth" | "pro";
  feature?: string;
  children: React.ReactNode;
  compact?: boolean; // smaller inline version for checklist tasks
}

export function PaywallGate({ requiredPlan, children, compact }: PaywallGateProps) {
  const { plan } = useBusinessContext();

  if (meetsRequiredPlan(plan, requiredPlan)) {
    return <>{children}</>;
  }

  const upgrade = getUpgradePlan(requiredPlan);

  if (compact) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/[0.02] border border-white/5">
        <svg className="w-4 h-4 text-zinc-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
        </svg>
        <span className="text-xs text-zinc-500">
          Upgrade to <span className="text-brand-400 font-medium">{upgrade.name}</span> to unlock
        </span>
      </div>
    );
  }

  return (
    <div className="relative rounded-xl border border-white/5 bg-surface/50 p-8 text-center">
      <div className="absolute inset-0 rounded-xl bg-gradient-to-b from-transparent to-[rgba(10,10,15,0.9)]" />
      <div className="relative z-10">
        <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-brand-600/10 flex items-center justify-center">
          <svg className="w-6 h-6 text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
          </svg>
        </div>
        <h3 className="text-white font-semibold text-lg mb-2">Upgrade to {upgrade.name}</h3>
        <p className="text-zinc-400 text-sm mb-6 max-w-sm mx-auto">
          This feature is available on the {upgrade.name} plan.
          {upgrade.price > 0 && ` Starting at $${(upgrade.price / 100).toFixed(2)}/mo.`}
        </p>
        <Link
          href="/pricing"
          className="inline-block btn-primary px-6 py-3 rounded-xl text-sm font-semibold text-white"
        >
          Upgrade to {upgrade.name}
        </Link>
      </div>
    </div>
  );
}
