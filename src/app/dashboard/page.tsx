"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

interface Business {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  type: string;
  status: string;
  revenue_estimate: string;
  audience: string;
  live_url: string;
  deployed_url: string;
  custom_domain: string;
  created_at: string;
  brand: Record<string, unknown>;
  site_content: Record<string, unknown>;
}

export default function DashboardPage() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("");
  const [deploying, setDeploying] = useState<string | null>(null);
  const [userId, setUserId] = useState("");

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        window.location.href = "/auth/login";
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .single();
      setUserName(profile?.full_name || user.email?.split("@")[0] || "there");
      setUserId(user.id);

      const { data } = await supabase
        .from("businesses")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      setBusinesses((data as Business[]) || []);
      setLoading(false);
    }

    load();
  }, []);

  async function deployBusiness(biz: Business) {
    setDeploying(biz.id);
    try {
      const res = await fetch("/api/deploy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessId: biz.id, userId }),
      });
      const data = await res.json();
      if (res.ok && data.url) {
        setBusinesses((prev) =>
          prev.map((b) =>
            b.id === biz.id ? { ...b, deployed_url: data.url, status: "live" } : b
          )
        );
      }
    } catch {
      // Deploy failed silently
    }
    setDeploying(null);
  }

  function getSiteUrl(biz: Business): string {
    if (biz.custom_domain) return `https://${biz.custom_domain}`;
    if (biz.deployed_url) return biz.deployed_url;
    return `/site/${biz.slug}`;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl font-bold text-white mb-1">Dashboard</h1>
        <p className="text-zinc-500 text-sm">Welcome back, {userName}. Here&apos;s your businesses.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
        <div className="p-5 rounded-xl border border-white/5 bg-surface/50">
          <p className="text-zinc-500 text-xs font-medium mb-1">Total Businesses</p>
          <p className="text-2xl font-bold text-white">{businesses.length}</p>
        </div>
        <div className="p-5 rounded-xl border border-white/5 bg-surface/50">
          <p className="text-zinc-500 text-xs font-medium mb-1">Live Sites</p>
          <p className="text-2xl font-bold text-white">{businesses.filter((b) => b.status === "live").length}</p>
        </div>
        <div className="p-5 rounded-xl border border-white/5 bg-surface/50">
          <p className="text-zinc-500 text-xs font-medium mb-1">Plan</p>
          <p className="text-2xl font-bold text-white">Free</p>
        </div>
        <div className="p-5 rounded-xl border border-white/5 bg-surface/50">
          <p className="text-zinc-500 text-xs font-medium mb-1">AI Credits</p>
          <p className="text-2xl font-bold text-white">Unlimited</p>
        </div>
      </div>

      {/* Businesses list */}
      {businesses.length === 0 ? (
        <div className="text-center py-20 rounded-xl border border-white/5 bg-surface/50">
          <p className="text-zinc-400 text-lg mb-2">No businesses yet</p>
          <p className="text-zinc-600 text-sm mb-6">Answer 4 questions and AI builds your first business in 60 seconds.</p>
          <Link href="/wizard" className="btn-primary px-8 py-3 rounded-xl text-sm font-bold text-white inline-block">
            Build Your First Business
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {businesses.map((biz) => (
            <div key={biz.id} className="p-4 sm:p-6 rounded-xl border border-white/5 bg-surface/50 hover:border-brand-600/30 transition-all">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-3 mb-1 flex-wrap">
                    <h3 className="text-base sm:text-lg font-bold text-white">{biz.name}</h3>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      biz.status === "live"
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                    }`}>
                      {biz.status}
                    </span>
                  </div>
                  <p className="text-brand-400 text-sm mb-2 truncate">{biz.tagline}</p>
                  <div className="flex flex-wrap gap-3 sm:gap-4 text-xs text-zinc-500">
                    <span className="capitalize">Type: {biz.type}</span>
                    <span>Revenue: {biz.revenue_estimate}</span>
                    <span>Created: {new Date(biz.created_at).toLocaleDateString()}</span>
                  </div>
                  {(biz.deployed_url || biz.custom_domain) && (
                    <p className="text-brand-400 font-mono text-xs mt-2">
                      {biz.custom_domain ? biz.custom_domain : biz.deployed_url}
                    </p>
                  )}
                </div>
                <div className="flex gap-2 w-full sm:w-auto shrink-0">
                  <Link
                    href={`/dashboard/site/${biz.id}`}
                    className="btn-secondary px-4 py-2 rounded-lg text-xs font-semibold text-zinc-300 text-center flex-1 sm:flex-initial"
                  >
                    Edit Site
                  </Link>
                  {!biz.deployed_url ? (
                    <button
                      onClick={() => deployBusiness(biz)}
                      disabled={deploying === biz.id}
                      className="btn-primary px-4 py-2 rounded-lg text-xs font-semibold text-white text-center flex-1 sm:flex-initial"
                    >
                      {deploying === biz.id ? "Deploying..." : "Deploy"}
                    </button>
                  ) : (
                    <a
                      href={getSiteUrl(biz)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-primary px-4 py-2 rounded-lg text-xs font-semibold text-white text-center flex-1 sm:flex-initial"
                    >
                      View Site
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}

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
