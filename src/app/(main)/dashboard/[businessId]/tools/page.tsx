"use client";

import { useState } from "react";
import { useBusinessContext } from "@/components/dashboard/BusinessProvider";
import {
  getRelevantPartners,
  getTrackedUrl,
  type AffiliatePartner,
} from "@/lib/affiliates";
import { T, CTA_GRAD, glassCard } from "@/lib/design-tokens";

export default function ToolsPage() {
  const { business } = useBusinessContext();
  const [filter, setFilter] = useState("all");

  if (!business) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <div className="w-8 h-8 rounded-full animate-spin" style={{ border: `2px solid ${T.purple}`, borderTopColor: "transparent" }} />
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
        <h1 className="text-xl sm:text-2xl font-bold mb-1" style={{ color: T.text, fontFamily: T.h }}>
          Recommended Tools
        </h1>
        <p className="text-sm" style={{ color: T.text3 }}>
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
            className="px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all"
            style={
              filter === cat
                ? {
                    background: "rgba(123,57,252,0.10)",
                    color: T.purpleLight,
                    border: "1px solid rgba(123,57,252,0.20)",
                  }
                : {
                    color: T.text3,
                    border: `1px solid ${T.border}`,
                  }
            }
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
            className="p-5 rounded-xl transition-all"
            style={{ ...glassCard }}
          >
            <div className="flex items-start justify-between gap-3 mb-3">
              <div>
                <h3 className="font-semibold" style={{ color: T.text }}>{partner.name}</h3>
                <span
                  className="inline-block px-2 py-0.5 rounded text-xs font-medium mt-1"
                  style={{ background: "rgba(123,57,252,0.10)", color: T.purpleLight }}
                >
                  {partner.category}
                </span>
              </div>
              <span
                className="text-xs font-medium px-2 py-1 rounded"
                style={{ background: "rgba(34,197,94,0.10)", color: T.green }}
              >
                {partner.commission}
              </span>
            </div>
            <p className="text-sm leading-relaxed mb-4" style={{ color: T.text3 }}>
              {partner.description}
            </p>
            <a
              href={getTrackedUrl(partner.id, business.id, "dashboard")}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-center px-4 py-2.5 rounded-lg text-sm font-semibold"
              style={{ background: CTA_GRAD, color: "#fff" }}
            >
              Get {partner.name}
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
