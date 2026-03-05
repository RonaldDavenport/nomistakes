"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { getPlan, hasFeature } from "@/lib/plans";

interface Business {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  type: string;
  subtype: string;
  status: string;
  deployed_url: string;
  custom_domain: string;
  created_at: string;
  brand: Record<string, unknown>;
  onboarding_step: number;
  onboarding_completed: boolean;
}

export default function DashboardOverview() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("");
  const [userPlan, setUserPlan] = useState("free");
  const [upgradeBanner, setUpgradeBanner] = useState<string | null>(null);
  const [leadsCount, setLeadsCount] = useState<number | null>(null);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { window.location.href = "/auth/login"; return; }

      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, plan")
        .eq("id", user.id)
        .single();
      setUserName(profile?.full_name || user.email?.split("@")[0] || "there");
      setUserPlan(profile?.plan || "free");

      // If returning from Stripe checkout, sync subscription status
      const params = new URLSearchParams(window.location.search);
      if (params.get("upgraded") === "true") {
        // Remove the query param from URL
        window.history.replaceState({}, "", "/dashboard");

        // If plan is still free, call the sync endpoint
        if (!profile?.plan || profile.plan === "free") {
          try {
            const res = await fetch("/api/stripe/sync", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ userId: user.id, email: user.email }),
            });
            const data = await res.json();
            if (data.synced && data.plan) {
              setUserPlan(data.plan);
              setUpgradeBanner(data.plan);
            }
          } catch {
            // Sync failed silently — webhook will catch it later
          }
        } else {
          // Already upgraded (webhook was fast)
          setUpgradeBanner(profile.plan);
        }
      }

      const { data } = await supabase
        .from("businesses")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      const bizList = (data as Business[]) || [];
      setBusinesses(bizList);

      // Fetch lead count if plan has lead_engine feature
      const planId = profile?.plan ?? "free";
      if (hasFeature(planId, "lead_engine") && bizList.length > 0) {
        const bizIds = bizList.map((b) => b.id);
        const { count } = await supabase
          .from("leads")
          .select("*", { count: "exact", head: true })
          .in("business_id", bizIds);
        setLeadsCount(count ?? 0);
      }

      setLoading(false);
    }
    load();
  }, []);

  const plan = getPlan(userPlan);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto">
      {upgradeBanner && (
        <div
          style={{
            background: "linear-gradient(135deg, rgba(99,102,241,0.15), rgba(168,85,247,0.15))",
            border: "1px solid rgba(99,102,241,0.3)",
            borderRadius: 12,
            padding: "16px 20px",
            marginBottom: 24,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 24 }}>&#10003;</span>
            <div>
              <p style={{ color: "#fff", fontWeight: 600, fontSize: 15 }}>
                Welcome to {getPlan(upgradeBanner).name}!
              </p>
              <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 13 }}>
                Your plan has been upgraded. All features are now unlocked.
              </p>
            </div>
          </div>
          <button
            onClick={() => setUpgradeBanner(null)}
            style={{ color: "rgba(255,255,255,0.4)", background: "none", border: "none", cursor: "pointer", fontSize: 18 }}
          >
            &times;
          </button>
        </div>
      )}

      <div className="mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl font-bold text-white mb-1">Welcome back, {userName}</h1>
        <p className="text-zinc-500 text-sm">
          {businesses.length === 0
            ? "Build your first business with AI in under 60 seconds."
            : `You have ${businesses.length} business${businesses.length !== 1 ? "es" : ""}. Select one to manage.`}
        </p>
      </div>

      {/* Stats */}
      <div className={`grid grid-cols-2 ${leadsCount !== null ? "lg:grid-cols-5" : "lg:grid-cols-4"} gap-3 sm:gap-4 mb-6 sm:mb-8`}>
        <div className="p-5 rounded-xl border border-white/5 bg-surface/50">
          <p className="text-zinc-500 text-xs font-medium mb-1">Businesses</p>
          <p className="text-2xl font-bold text-white">{businesses.length}</p>
        </div>
        <div className="p-5 rounded-xl border border-white/5 bg-surface/50">
          <p className="text-zinc-500 text-xs font-medium mb-1">Live Sites</p>
          <p className="text-2xl font-bold text-white">{businesses.filter((b) => b.status === "live").length}</p>
        </div>
        {leadsCount !== null && (
          <Link
            href={businesses[0] ? `/dashboard/${businesses[0].id}/leads` : "/dashboard"}
            className="p-5 rounded-xl border border-white/5 bg-surface/50 hover:border-brand-600/30 transition-all block"
          >
            <p className="text-zinc-500 text-xs font-medium mb-1">Prospects</p>
            <p className="text-2xl font-bold text-white">{leadsCount}</p>
          </Link>
        )}
        <div className="p-5 rounded-xl border border-white/5 bg-surface/50">
          <p className="text-zinc-500 text-xs font-medium mb-1">Plan</p>
          <p className="text-2xl font-bold text-white">{plan.name}</p>
        </div>
        <div className="p-5 rounded-xl border border-white/5 bg-surface/50">
          <p className="text-zinc-500 text-xs font-medium mb-1">AI Chat</p>
          <p className="text-2xl font-bold text-white">
            {plan.limits.chatMessagesPerDay === Infinity ? "Unlimited" : `${plan.limits.chatMessagesPerDay}/day`}
          </p>
        </div>
      </div>

      {/* Business cards */}
      {businesses.length === 0 ? (
        <div className="text-center py-20 rounded-xl border border-white/5 bg-surface/50">
          <p className="text-zinc-400 text-lg mb-2">No businesses yet</p>
          <p className="text-zinc-600 text-sm mb-6">Add your business and Kovra sets up your workspace in minutes.</p>
          <Link href="/wizard" className="btn-primary px-8 py-3 rounded-xl text-sm font-bold text-white inline-block">
            Add Your Business
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {businesses.map((biz) => {
            const primaryColor = (biz.brand as { colors?: { primary?: string } })?.colors?.primary || "#6366f1";
            return (
              <Link
                key={biz.id}
                href={`/dashboard/${biz.id}`}
                className="p-4 sm:p-6 rounded-xl border border-white/5 bg-surface/50 hover:border-brand-600/30 transition-all group block"
              >
                <div className="flex items-start gap-4">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-lg font-bold shrink-0"
                    style={{ backgroundColor: primaryColor }}
                  >
                    {biz.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1 flex-wrap">
                      <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-brand-400 transition-colors">
                        {biz.name}
                      </h3>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        biz.status === "live"
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                      }`}>
                        {biz.status}
                      </span>
                    </div>
                    <p className="text-brand-400 text-sm mb-2 truncate">{biz.tagline}</p>
                    <div className="flex flex-wrap gap-3 text-xs text-zinc-500">
                      <span className="capitalize">{biz.subtype || biz.type}</span>
                      {biz.deployed_url && (
                        <span className="font-mono text-zinc-600">{biz.custom_domain || biz.deployed_url}</span>
                      )}
                      <span>{new Date(biz.created_at).toLocaleDateString()}</span>
                    </div>
                    {/* Onboarding progress */}
                    {!biz.onboarding_completed && biz.onboarding_step < 8 && (
                      <div className="mt-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-zinc-500">Setup: {biz.onboarding_step}/8 steps</span>
                        </div>
                        <div className="h-1 rounded-full bg-white/5">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-brand-600 to-purple-500 transition-all"
                            style={{ width: `${Math.round((biz.onboarding_step / 8) * 100)}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                  <svg className="w-5 h-5 text-zinc-600 group-hover:text-brand-400 transition-colors shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                  </svg>
                </div>
              </Link>
            );
          })}

          <Link
            href="/wizard"
            className="p-6 rounded-xl border border-dashed border-white/10 text-center hover:border-brand-600/30 transition-all block"
          >
            <p className="text-zinc-400 text-sm font-medium">+ Build Another Business</p>
          </Link>
        </div>
      )}
    </div>
  );
}
