"use client";

import { useState } from "react";
import { useBusinessContext } from "@/components/dashboard/BusinessProvider";
import {
  getRelevantPartners,
  getTrackedUrl,
  type AffiliatePartner,
} from "@/lib/affiliates";

export default function ToolsPage() {
  const { business } = useBusinessContext();
  const [filter, setFilter] = useState("all");

  if (!business) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const partners: AffiliatePartner[] = getRelevantPartners(
    business.type as "digital" | "services"
  );
  const categories = [
    "all",
    ...new Set(partners.map((p) => p.category)),
  ];
  const filtered =
    filter === "all"
      ? partners
      : partners.filter((p) => p.category === filter);

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl font-bold text-white mb-1">
          Recommended Tools
        </h1>
        <p className="text-zinc-500 text-sm">
          Essential tools to grow {business.name}. Hand-picked for{" "}
          {business.subtype || business.type} businesses.
        </p>
      </div>

      {/* Category filter */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
              filter === cat
                ? "bg-brand-600/10 text-brand-400 border border-brand-600/20"
                : "text-zinc-500 hover:text-zinc-300 border border-white/5 hover:border-white/10"
            }`}
          >
            {cat === "all"
              ? "All"
              : cat.charAt(0).toUpperCase() + cat.slice(1)}
          </button>
        ))}
      </div>

      {/* Partners grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((partner) => (
          <div
            key={partner.id}
            className="p-5 rounded-xl border border-white/5 bg-surface/50 hover:border-brand-600/30 transition-all"
          >
            <div className="flex items-start justify-between gap-3 mb-3">
              <div>
                <h3 className="text-white font-semibold">{partner.name}</h3>
                <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-brand-600/10 text-brand-400 mt-1">
                  {partner.category}
                </span>
              </div>
              <span className="text-xs text-emerald-400 font-medium bg-emerald-500/10 px-2 py-1 rounded">
                {partner.commission}
              </span>
            </div>
            <p className="text-zinc-500 text-sm leading-relaxed mb-4">
              {partner.description}
            </p>
            <a
              href={getTrackedUrl(partner.id, business.id, "dashboard")}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary block text-center px-4 py-2.5 rounded-lg text-sm font-semibold text-white"
            >
              Get {partner.name}
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
