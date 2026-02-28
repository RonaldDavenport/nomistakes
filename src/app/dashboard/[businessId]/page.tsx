"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useBusinessContext } from "@/components/dashboard/BusinessProvider";
import { LaunchChecklist } from "@/components/dashboard/LaunchChecklist";
import { WelcomeTour } from "@/components/dashboard/WelcomeTour";

export default function BusinessHome() {
  const params = useParams();
  const businessId = params.businessId as string;
  const { business, plan, loading } = useBusinessContext();

  if (loading || !business) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const primaryColor = (business.brand as { colors?: { primary?: string } })?.colors?.primary || "#6366f1";

  function getSiteUrl(): string {
    if (business!.custom_domain) return `https://${business!.custom_domain}`;
    if (business!.deployed_url) return business!.deployed_url;
    return `/site/${business!.slug}`;
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <WelcomeTour />

      {/* Business header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
        <div className="flex items-center gap-4">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-xl font-bold shrink-0"
            style={{ backgroundColor: primaryColor }}
          >
            {business.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white">{business.name}</h1>
            <p className="text-zinc-500 text-sm capitalize">{business.subtype || business.type} business</p>
          </div>
        </div>
        <div className="flex gap-2">
          {business.deployed_url ? (
            <a
              href={getSiteUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary px-4 py-2 rounded-lg text-xs font-semibold text-zinc-300 text-center"
            >
              View Site
            </a>
          ) : (
            <Link
              href={`/dashboard/${businessId}/settings`}
              className="btn-secondary px-4 py-2 rounded-lg text-xs font-semibold text-zinc-300 text-center"
            >
              Deploy Site
            </Link>
          )}
          <Link
            href={`/dashboard/${businessId}/chat`}
            className="btn-primary px-4 py-2 rounded-lg text-xs font-semibold text-white text-center"
          >
            Chat with AI Coach
          </Link>
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6 sm:mb-8">
        <div className="p-4 rounded-xl border border-white/5 bg-surface/50">
          <p className="text-zinc-500 text-xs font-medium mb-1">Status</p>
          <p className={`text-lg font-bold capitalize ${business.status === "live" ? "text-emerald-400" : "text-amber-400"}`}>
            {business.status}
          </p>
        </div>
        <div className="p-4 rounded-xl border border-white/5 bg-surface/50">
          <p className="text-zinc-500 text-xs font-medium mb-1">Type</p>
          <p className="text-lg font-bold text-white capitalize">{business.subtype || business.type}</p>
        </div>
        <div className="p-4 rounded-xl border border-white/5 bg-surface/50">
          <p className="text-zinc-500 text-xs font-medium mb-1">Payments</p>
          <p className={`text-lg font-bold ${business.stripe_account_id ? "text-emerald-400" : "text-zinc-600"}`}>
            {business.stripe_account_id ? "Connected" : "Not set up"}
          </p>
        </div>
        <div className="p-4 rounded-xl border border-white/5 bg-surface/50">
          <p className="text-zinc-500 text-xs font-medium mb-1">Domain</p>
          <p className="text-lg font-bold text-white truncate">
            {business.custom_domain || (business.deployed_url ? "Default" : "None")}
          </p>
        </div>
      </div>

      {/* Launch Checklist */}
      <LaunchChecklist />
    </div>
  );
}
