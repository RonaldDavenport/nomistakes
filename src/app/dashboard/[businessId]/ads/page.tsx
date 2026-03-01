"use client";

import { useBusinessContext } from "@/components/dashboard/BusinessProvider";
import { PaywallGate } from "@/components/dashboard/PaywallGate";
import { T, glassCard } from "@/lib/design-tokens";

export default function AdsPage() {
  const { business } = useBusinessContext();

  if (!business) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <div className="w-8 h-8 rounded-full animate-spin" style={{ border: `2px solid ${T.purple}`, borderTopColor: "transparent" }} />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold mb-1" style={{ color: T.text, fontFamily: T.h }}>Ads</h1>
          <p className="text-sm" style={{ color: T.text3 }}>
            AI-generated ad creatives for Meta, TikTok, and more.
          </p>
        </div>
      </div>

      <PaywallGate requiredPlan="growth">
        <div className="rounded-xl p-8 text-center" style={{ ...glassCard }}>
          <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4" style={{ background: "rgba(123,57,252,0.10)" }}>
            <svg className="w-6 h-6" style={{ color: T.purpleLight }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 110-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463 1.511l-.657.38c-.551.318-1.26.117-1.527-.461a20.845 20.845 0 01-1.44-4.282m3.102.069a18.03 18.03 0 01-.59-4.59c0-1.586.205-3.124.59-4.59m0 9.18a23.848 23.848 0 018.835 2.535M10.34 6.66a23.847 23.847 0 008.835-2.535m0 0A23.74 23.74 0 0018.795 3m.38 1.125a23.91 23.91 0 011.014 5.395m-1.014 8.855c-.118.38-.245.754-.38 1.125m.38-1.125a23.91 23.91 0 001.014-5.395m0-3.46c.495.413.811 1.035.811 1.73 0 .695-.316 1.317-.811 1.73m0-3.46a24.347 24.347 0 010 3.46" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold mb-2" style={{ color: T.text, fontFamily: T.h }}>
            Ad Creator Coming Soon
          </h2>
          <p className="text-sm max-w-md mx-auto leading-relaxed" style={{ color: T.text3 }}>
            Generate ad copy, images, and UGC-style videos for{" "}
            <strong style={{ color: T.text2 }}>{business.name}</strong>. Target
            your ideal customers on Meta, TikTok, and Twitter.
          </p>
        </div>
      </PaywallGate>
    </div>
  );
}
