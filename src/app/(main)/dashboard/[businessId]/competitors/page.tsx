"use client";

import { useBusinessContext } from "@/components/dashboard/BusinessProvider";
import { PaywallGate } from "@/components/dashboard/PaywallGate";
import { T, CTA_GRAD, glassCard } from "@/lib/design-tokens";
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";

interface CompetitorAnalysis {
  industry: string;
  positioning: string;
  strengths: string[];
  weaknesses: string[];
  pricing_strategy: string;
  key_differentiators: string[];
  opportunities: string[];
  threat_level: string;
  recommended_actions: string[];
}

interface Competitor {
  id: string;
  name: string;
  url: string;
  industry: string;
  baseline_data: CompetitorAnalysis;
  is_active: boolean;
  last_checked_at: string;
  created_at: string;
}

function threatColor(level: string) {
  if (level === "high") return { bg: "rgba(239,68,68,0.15)", color: "#ef4444" };
  if (level === "medium") return { bg: "rgba(245,158,11,0.15)", color: T.gold };
  return { bg: "rgba(34,197,94,0.15)", color: T.green };
}

export default function CompetitorsPage() {
  const params = useParams();
  const businessId = params.businessId as string;
  const { business, userId, credits, refreshCredits } = useBusinessContext();

  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [removing, setRemoving] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [expandedComp, setExpandedComp] = useState<string | null>(null);

  // Form state
  const [compName, setCompName] = useState("");
  const [compUrl, setCompUrl] = useState("");

  useEffect(() => {
    fetchCompetitors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [businessId]);

  async function fetchCompetitors() {
    setLoading(true);
    try {
      const res = await fetch(`/api/competitors?businessId=${businessId}`);
      if (res.ok) {
        const data = await res.json();
        setCompetitors(data.competitors || []);
      }
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }

  async function handleAnalyze() {
    if (!compName.trim() || !compUrl.trim()) return;
    setAnalyzing(true);
    setError("");
    try {
      const res = await fetch("/api/competitors/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessId,
          userId,
          competitorName: compName.trim(),
          competitorUrl: compUrl.trim(),
        }),
      });

      if (res.status === 402) {
        setError("insufficient_credits");
        return;
      }

      if (!res.ok) {
        setError("Analysis failed. Please try again.");
        return;
      }

      const data = await res.json();
      if (data.competitor) {
        setCompetitors((prev) => [data.competitor as Competitor, ...prev]);
        setExpandedComp(data.competitor.id);
      }
      setShowForm(false);
      setCompName("");
      setCompUrl("");
      await refreshCredits();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setAnalyzing(false);
    }
  }

  async function handleRemove(competitorId: string) {
    setRemoving(competitorId);
    try {
      const res = await fetch("/api/competitors", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ competitorId }),
      });

      if (res.ok) {
        setCompetitors((prev) => prev.filter((c) => c.id !== competitorId));
        if (expandedComp === competitorId) setExpandedComp(null);
      }
    } catch {
      /* ignore */
    } finally {
      setRemoving(null);
    }
  }

  if (!business) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <div
          className="w-8 h-8 rounded-full animate-spin"
          style={{ border: `2px solid ${T.purple}`, borderTopColor: "transparent" }}
        />
      </div>
    );
  }

  const inputStyle: React.CSSProperties = {
    background: T.bgEl,
    color: T.text,
    border: `1px solid ${T.border}`,
  };

  return (
    <PaywallGate
      requiredPlan="solo"
      teaser={{
        headline: "Competitive Intelligence",
          description: "Analyze any competitor's positioning, pricing, and strategy in seconds.",
          bullets: [
            "Strengths & weaknesses breakdown",
            "Pricing & positioning analysis",
            "Actionable recommendations",
          ],
          previewRows: [
            { label: "Competitors", value: "3 analyzed", color: "#22C55E" },
            { label: "Weaknesses", value: "7 found", color: "#F59E0B" },
            { label: "Recommendations", value: "5 actionable" },
          ],
        }}
      >
      <div className="p-4 sm:p-6 lg:p-8 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <h1
            className="text-xl sm:text-2xl font-bold mb-1"
            style={{ color: T.text, fontFamily: T.h }}
          >
            Competitive Intel
          </h1>
          <p className="text-sm" style={{ color: T.text3 }}>
            Track and analyze competitors to find opportunities for {business.name}.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-xs" style={{ color: T.text3 }}>
            5 credits
          </span>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2"
            style={{ background: CTA_GRAD, color: "#fff" }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Add Competitor
          </button>
        </div>
      </div>

        {/* Error Messages */}
        {error === "insufficient_credits" && (
          <div
            className="mb-6 p-4 rounded-xl flex items-center justify-between"
            style={{ border: "1px solid rgba(239,68,68,0.20)", background: "rgba(239,68,68,0.05)" }}
          >
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 shrink-0" style={{ color: "#ef4444" }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
              <div>
                <p className="text-sm font-medium" style={{ color: T.text }}>Not enough credits</p>
                <p className="text-xs" style={{ color: T.text3 }}>
                  Competitor analysis costs 5 credits. You have {credits} remaining.
                </p>
              </div>
            </div>
            <a
              href={`/dashboard/${businessId}/settings?tab=credits`}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0"
              style={{ background: CTA_GRAD, color: "#fff" }}
            >
              Buy Credits
            </a>
          </div>
        )}

        {error && error !== "insufficient_credits" && (
          <div
            className="mb-6 p-4 rounded-xl"
            style={{ border: "1px solid rgba(239,68,68,0.20)", background: "rgba(239,68,68,0.05)" }}
          >
            <p className="text-sm" style={{ color: "#ef4444" }}>{error}</p>
          </div>
        )}

        {/* Add Competitor Form */}
        {showForm && (
          <div className="mb-6 rounded-xl p-5" style={{ ...glassCard }}>
            <h3 className="text-sm font-semibold mb-4" style={{ color: T.text, fontFamily: T.h }}>
              Analyze a Competitor
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs mb-1.5" style={{ color: T.text2 }}>
                  Competitor Name
                </label>
                <input
                  type="text"
                  value={compName}
                  onChange={(e) => setCompName(e.target.value)}
                  placeholder="e.g., Acme Corp"
                  className="w-full px-4 py-2.5 rounded-lg text-sm focus:outline-none"
                  style={inputStyle}
                />
              </div>
              <div>
                <label className="block text-xs mb-1.5" style={{ color: T.text2 }}>
                  Website URL
                </label>
                <input
                  type="url"
                  value={compUrl}
                  onChange={(e) => setCompUrl(e.target.value)}
                  placeholder="https://competitor.com"
                  className="w-full px-4 py-2.5 rounded-lg text-sm focus:outline-none"
                  style={inputStyle}
                />
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleAnalyze}
                  disabled={analyzing || !compName.trim() || !compUrl.trim()}
                  className="px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 disabled:opacity-50"
                  style={{ background: CTA_GRAD, color: "#fff" }}
                >
                  {analyzing ? (
                    <>
                      <div
                        className="w-4 h-4 rounded-full animate-spin"
                        style={{ border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff" }}
                      />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                      </svg>
                      Analyze
                    </>
                  )}
                </button>
                <button
                  onClick={() => { setShowForm(false); setCompName(""); setCompUrl(""); setError(""); }}
                  className="px-4 py-2 rounded-lg text-sm"
                  style={{ color: T.text3 }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Competitors List */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div
              className="w-6 h-6 rounded-full animate-spin"
              style={{ border: `2px solid ${T.purple}`, borderTopColor: "transparent" }}
            />
          </div>
        ) : competitors.length === 0 ? (
          <div className="rounded-xl p-8 text-center" style={{ ...glassCard }}>
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4"
              style={{ background: "rgba(123,57,252,0.10)" }}
            >
              <svg className="w-6 h-6" style={{ color: T.purpleLight }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold mb-2" style={{ color: T.text, fontFamily: T.h }}>
              No competitors tracked yet
            </h2>
            <p className="text-sm max-w-md mx-auto leading-relaxed mb-4" style={{ color: T.text3 }}>
              Add a competitor to get AI-powered analysis of their strengths, weaknesses, and
              opportunities you can exploit.
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="px-4 py-2 rounded-lg text-sm font-semibold"
              style={{ background: CTA_GRAD, color: "#fff" }}
            >
              Add First Competitor
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {competitors.map((comp) => {
              const analysis = comp.baseline_data;
              const tc = threatColor(analysis?.threat_level || "low");
              const isExpanded = expandedComp === comp.id;

              return (
                <div key={comp.id} className="rounded-xl overflow-hidden" style={{ ...glassCard }}>
                  {/* Competitor Header */}
                  <div className="px-4 py-3 flex items-center gap-3">
                    <button
                      onClick={() => setExpandedComp(isExpanded ? null : comp.id)}
                      className="flex-1 min-w-0 flex items-center gap-3 text-left"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-sm font-semibold truncate" style={{ color: T.text }}>
                            {comp.name}
                          </h3>
                          <span
                            className="text-[10px] font-medium px-2 py-0.5 rounded-full shrink-0"
                            style={{ backgroundColor: tc.bg, color: tc.color }}
                          >
                            {analysis?.threat_level || "unknown"} threat
                          </span>
                          {comp.industry && (
                            <span
                              className="text-[10px] font-medium px-2 py-0.5 rounded-full shrink-0"
                              style={{ backgroundColor: "rgba(255,255,255,0.06)", color: T.text3 }}
                            >
                              {comp.industry}
                            </span>
                          )}
                        </div>
                        <p className="text-xs truncate" style={{ color: T.text3 }}>
                          {comp.url}
                        </p>
                      </div>
                      <svg
                        className="w-4 h-4 shrink-0 transition-transform"
                        style={{ color: T.text3, transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)" }}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleRemove(comp.id)}
                      disabled={removing === comp.id}
                      className="p-1.5 rounded-lg transition shrink-0 disabled:opacity-50"
                      style={{ color: T.text3 }}
                      title="Remove competitor"
                    >
                      {removing === comp.id ? (
                        <div
                          className="w-4 h-4 rounded-full animate-spin"
                          style={{ border: `2px solid ${T.text3}`, borderTopColor: "transparent" }}
                        />
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                        </svg>
                      )}
                    </button>
                  </div>

                  {/* Expanded Analysis */}
                  {isExpanded && analysis && (
                    <div className="px-4 pb-4 space-y-4" style={{ borderTop: `1px solid ${T.border}` }}>
                      {/* Positioning */}
                      {analysis.positioning && (
                        <div className="pt-4">
                          <p className="text-xs font-medium mb-1" style={{ color: T.text2 }}>Positioning</p>
                          <p className="text-xs leading-relaxed" style={{ color: T.text3 }}>
                            {analysis.positioning}
                          </p>
                        </div>
                      )}

                      {/* Pricing Strategy */}
                      {analysis.pricing_strategy && (
                        <div>
                          <p className="text-xs font-medium mb-1" style={{ color: T.text2 }}>Pricing Strategy</p>
                          <p className="text-xs leading-relaxed" style={{ color: T.text3 }}>
                            {analysis.pricing_strategy}
                          </p>
                        </div>
                      )}

                      {/* Strengths / Weaknesses / Opportunities grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {/* Strengths */}
                        <div className="rounded-lg p-3" style={{ background: "rgba(34,197,94,0.05)", border: "1px solid rgba(34,197,94,0.12)" }}>
                          <p className="text-xs font-semibold mb-2" style={{ color: T.green }}>
                            Strengths
                          </p>
                          <ul className="space-y-1.5">
                            {(analysis.strengths || []).map((s, i) => (
                              <li key={i} className="flex items-start gap-1.5">
                                <svg className="w-3 h-3 shrink-0 mt-0.5" style={{ color: T.green }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                </svg>
                                <span className="text-[11px] leading-relaxed" style={{ color: T.text3 }}>{s}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Weaknesses */}
                        <div className="rounded-lg p-3" style={{ background: "rgba(239,68,68,0.05)", border: "1px solid rgba(239,68,68,0.12)" }}>
                          <p className="text-xs font-semibold mb-2" style={{ color: "#ef4444" }}>
                            Weaknesses
                          </p>
                          <ul className="space-y-1.5">
                            {(analysis.weaknesses || []).map((w, i) => (
                              <li key={i} className="flex items-start gap-1.5">
                                <svg className="w-3 h-3 shrink-0 mt-0.5" style={{ color: "#ef4444" }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                                <span className="text-[11px] leading-relaxed" style={{ color: T.text3 }}>{w}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Opportunities */}
                        <div className="rounded-lg p-3" style={{ background: "rgba(123,57,252,0.05)", border: "1px solid rgba(123,57,252,0.12)" }}>
                          <p className="text-xs font-semibold mb-2" style={{ color: T.purpleLight }}>
                            Opportunities
                          </p>
                          <ul className="space-y-1.5">
                            {(analysis.opportunities || []).map((o, i) => (
                              <li key={i} className="flex items-start gap-1.5">
                                <svg className="w-3 h-3 shrink-0 mt-0.5" style={{ color: T.purpleLight }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
                                </svg>
                                <span className="text-[11px] leading-relaxed" style={{ color: T.text3 }}>{o}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {/* Key Differentiators */}
                      {analysis.key_differentiators && analysis.key_differentiators.length > 0 && (
                        <div>
                          <p className="text-xs font-medium mb-2" style={{ color: T.text2 }}>Key Differentiators</p>
                          <div className="flex flex-wrap gap-2">
                            {analysis.key_differentiators.map((d, i) => (
                              <span
                                key={i}
                                className="text-[11px] px-3 py-1.5 rounded-full"
                                style={{ backgroundColor: "rgba(255,255,255,0.06)", color: T.text3 }}
                              >
                                {d}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Recommended Actions */}
                      {analysis.recommended_actions && analysis.recommended_actions.length > 0 && (
                        <div>
                          <p className="text-xs font-medium mb-2" style={{ color: T.text2 }}>Recommended Actions</p>
                          <div className="space-y-2">
                            {analysis.recommended_actions.map((action, i) => (
                              <div key={i} className="flex items-start gap-2">
                                <span
                                  className="text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                                  style={{ backgroundColor: "rgba(123,57,252,0.15)", color: T.purpleLight }}
                                >
                                  {i + 1}
                                </span>
                                <span className="text-xs leading-relaxed" style={{ color: T.text3 }}>
                                  {action}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Last Checked */}
                      <p className="text-[10px] pt-2" style={{ color: T.text3, borderTop: `1px solid ${T.border}` }}>
                        Last analyzed: {new Date(comp.last_checked_at).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </PaywallGate>
  );
}
