"use client";

import { useBusinessContext } from "@/components/dashboard/BusinessProvider";
import { PaywallGate } from "@/components/dashboard/PaywallGate";
import { T, CTA_GRAD, glassCard } from "@/lib/design-tokens";
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";

interface SeoIssue {
  severity: "high" | "medium" | "low";
  category: string;
  title: string;
  description: string;
  fix: string;
}

interface KeywordOpp {
  keyword: string;
  search_volume: string;
  competition: string;
  recommendation: string;
}

interface SeoAudit {
  id: string;
  overall_score: number;
  pages_audited: number;
  issues: SeoIssue[];
  keyword_opportunities: KeywordOpp[];
  created_at: string;
}

interface AuditResponse {
  audit: SeoAudit;
  contentGaps: string[];
  quickWins: string[];
  creditsRemaining: number;
}

export default function SeoPage() {
  const params = useParams();
  const businessId = params.businessId as string;
  const { business, userId, credits, refreshCredits } = useBusinessContext();

  const [audits, setAudits] = useState<SeoAudit[]>([]);
  const [activeAudit, setActiveAudit] = useState<AuditResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState("");
  const [expandedIssue, setExpandedIssue] = useState<string | null>(null);

  useEffect(() => {
    fetchAudits();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [businessId]);

  async function fetchAudits() {
    setLoading(true);
    try {
      const res = await fetch(`/api/seo/audit?businessId=${businessId}`);
      if (res.ok) {
        const data = await res.json();
        setAudits(data.audits || []);
      }
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }

  async function runAudit() {
    setRunning(true);
    setError("");
    try {
      const res = await fetch("/api/seo/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessId, userId }),
      });

      if (res.status === 402) {
        setError("insufficient_credits");
        return;
      }

      if (!res.ok) {
        setError("Audit failed. Please try again.");
        return;
      }

      const data: AuditResponse = await res.json();
      setActiveAudit(data);
      setAudits((prev) => [data.audit, ...prev]);
      await refreshCredits();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setRunning(false);
    }
  }

  function severityColor(s: string) {
    if (s === "high") return { bg: "rgba(239,68,68,0.15)", color: "#ef4444" };
    if (s === "medium") return { bg: "rgba(245,158,11,0.15)", color: T.gold };
    return { bg: "rgba(34,197,94,0.15)", color: T.green };
  }

  function volumeLabel(v: string) {
    if (v === "high") return { bg: "rgba(34,197,94,0.15)", color: T.green };
    if (v === "medium") return { bg: "rgba(245,158,11,0.15)", color: T.gold };
    return { bg: "rgba(255,255,255,0.06)", color: T.text3 };
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

  const displayAudit = activeAudit?.audit || (audits.length > 0 ? audits[0] : null);

  return (
    <PaywallGate
      requiredPlan="solo"
      teaser={{
        headline: "AI SEO Audits",
        description: "Get a full SEO health score with actionable fixes and keyword opportunities.",
        bullets: [
          "Site health score 0-100",
          "Keyword opportunity finder",
          "Actionable fix suggestions",
        ],
        previewRows: [
          { label: "Site Health", value: "87/100", color: "#22C55E" },
          { label: "Keywords Found", value: "12 opportunities" },
          { label: "Fixes Needed", value: "5 suggestions", color: "#F59E0B" },
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
            SEO
          </h1>
          <p className="text-sm" style={{ color: T.text3 }}>
            Run AI-powered audits and discover keyword opportunities for {business.name}.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-xs" style={{ color: T.text3 }}>
            5 credits
          </span>
          <button
            onClick={runAudit}
            disabled={running}
            className="px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 disabled:opacity-50"
            style={{ background: CTA_GRAD, color: "#fff" }}
          >
            {running ? (
              <>
                <div
                  className="w-4 h-4 rounded-full animate-spin"
                  style={{ border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff" }}
                />
                Running Audit...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
                Run SEO Audit
              </>
            )}
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
                  SEO audits cost 5 credits. You have {credits} remaining.
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

        {/* Loading */}
        {loading && !displayAudit ? (
          <div className="flex items-center justify-center py-20">
            <div
              className="w-6 h-6 rounded-full animate-spin"
              style={{ border: `2px solid ${T.purple}`, borderTopColor: "transparent" }}
            />
          </div>
        ) : !displayAudit ? (
          /* Empty State */
          <div className="rounded-xl p-8 text-center" style={{ ...glassCard }}>
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4"
              style={{ background: "rgba(123,57,252,0.10)" }}
            >
              <svg className="w-6 h-6" style={{ color: T.purpleLight }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold mb-2" style={{ color: T.text, fontFamily: T.h }}>
              No SEO audits yet
            </h2>
            <p className="text-sm max-w-md mx-auto leading-relaxed" style={{ color: T.text3 }}>
              Run your first SEO audit to get an overall score, identify issues, and discover keyword
              opportunities for your site.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Score Card */}
            <div className="rounded-xl p-6" style={{ ...glassCard }}>
              <div className="flex flex-col sm:flex-row sm:items-center gap-6">
                {/* Circular Score */}
                <div className="flex items-center justify-center shrink-0">
                  <div style={{ position: "relative", width: 100, height: 100 }}>
                    <svg viewBox="0 0 36 36" style={{ width: 100, height: 100, transform: "rotate(-90deg)" }}>
                      <circle
                        cx="18"
                        cy="18"
                        r="15.915"
                        fill="none"
                        stroke="rgba(255,255,255,0.06)"
                        strokeWidth="3"
                      />
                      <circle
                        cx="18"
                        cy="18"
                        r="15.915"
                        fill="none"
                        stroke={
                          displayAudit.overall_score >= 80
                            ? T.green
                            : displayAudit.overall_score >= 50
                              ? T.gold
                              : "#ef4444"
                        }
                        strokeWidth="3"
                        strokeDasharray={`${displayAudit.overall_score} ${100 - displayAudit.overall_score}`}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <span
                        className="text-2xl font-bold"
                        style={{
                          color:
                            displayAudit.overall_score >= 80
                              ? T.green
                              : displayAudit.overall_score >= 50
                                ? T.gold
                                : "#ef4444",
                          fontFamily: T.h,
                        }}
                      >
                        {displayAudit.overall_score}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold mb-1" style={{ color: T.text, fontFamily: T.h }}>
                    Overall SEO Score
                  </h3>
                  <p className="text-xs mb-3" style={{ color: T.text3 }}>
                    {displayAudit.pages_audited} page{displayAudit.pages_audited !== 1 ? "s" : ""} audited
                    {displayAudit.created_at &&
                      ` on ${new Date(displayAudit.created_at).toLocaleDateString()}`}
                  </p>
                  <div className="flex items-center gap-4">
                    {["high", "medium", "low"].map((sev) => {
                      const count = displayAudit.issues?.filter((i) => i.severity === sev).length || 0;
                      const sc = severityColor(sev);
                      return (
                        <div key={sev} className="flex items-center gap-1.5">
                          <span
                            className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                            style={{ backgroundColor: sc.bg, color: sc.color }}
                          >
                            {count} {sev}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Wins */}
            {activeAudit?.quickWins && activeAudit.quickWins.length > 0 && (
              <div className="rounded-xl p-5" style={{ ...glassCard }}>
                <h3 className="text-sm font-semibold mb-3" style={{ color: T.text, fontFamily: T.h }}>
                  Quick Wins
                </h3>
                <div className="space-y-2">
                  {activeAudit.quickWins.map((win, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <svg className="w-4 h-4 shrink-0 mt-0.5" style={{ color: T.green }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-xs" style={{ color: T.text2 }}>{win}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Issues List */}
            {displayAudit.issues && displayAudit.issues.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold mb-3" style={{ color: T.text, fontFamily: T.h }}>
                  Issues ({displayAudit.issues.length})
                </h3>
                <div className="space-y-2">
                  {displayAudit.issues.map((issue, i) => {
                    const sc = severityColor(issue.severity);
                    const key = `${i}-${issue.title}`;
                    const isExpanded = expandedIssue === key;
                    return (
                      <div key={key} className="rounded-xl overflow-hidden" style={{ ...glassCard }}>
                        <button
                          onClick={() => setExpandedIssue(isExpanded ? null : key)}
                          className="w-full px-4 py-3 flex items-center gap-3 text-left"
                        >
                          <span
                            className="text-[10px] font-medium px-2 py-0.5 rounded-full shrink-0"
                            style={{ backgroundColor: sc.bg, color: sc.color }}
                          >
                            {issue.severity}
                          </span>
                          <span
                            className="text-[10px] font-medium px-2 py-0.5 rounded-full shrink-0"
                            style={{ backgroundColor: "rgba(255,255,255,0.06)", color: T.text3 }}
                          >
                            {issue.category}
                          </span>
                          <span className="text-sm font-medium flex-1 truncate" style={{ color: T.text }}>
                            {issue.title}
                          </span>
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
                        {isExpanded && (
                          <div className="px-4 pb-4 space-y-2" style={{ borderTop: `1px solid ${T.border}` }}>
                            <div className="pt-3">
                              <p className="text-xs mb-1 font-medium" style={{ color: T.text2 }}>Problem</p>
                              <p className="text-xs leading-relaxed" style={{ color: T.text3 }}>
                                {issue.description}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs mb-1 font-medium" style={{ color: T.green }}>Fix</p>
                              <p className="text-xs leading-relaxed" style={{ color: T.text3 }}>
                                {issue.fix}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Keyword Opportunities */}
            {displayAudit.keyword_opportunities && displayAudit.keyword_opportunities.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold mb-3" style={{ color: T.text, fontFamily: T.h }}>
                  Keyword Opportunities ({displayAudit.keyword_opportunities.length})
                </h3>
                <div className="space-y-2">
                  {displayAudit.keyword_opportunities.map((kw, i) => {
                    const vol = volumeLabel(kw.search_volume);
                    const comp = severityColor(kw.competition === "low" ? "low" : kw.competition === "medium" ? "medium" : "high");
                    return (
                      <div key={i} className="rounded-xl p-4" style={{ ...glassCard }}>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm font-medium" style={{ color: T.text }}>
                            {kw.keyword}
                          </span>
                          <span
                            className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                            style={{ backgroundColor: vol.bg, color: vol.color }}
                          >
                            {kw.search_volume} volume
                          </span>
                          <span
                            className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                            style={{ backgroundColor: comp.bg, color: comp.color }}
                          >
                            {kw.competition} competition
                          </span>
                        </div>
                        <p className="text-xs leading-relaxed" style={{ color: T.text3 }}>
                          {kw.recommendation}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Content Gaps */}
            {activeAudit?.contentGaps && activeAudit.contentGaps.length > 0 && (
              <div className="rounded-xl p-5" style={{ ...glassCard }}>
                <h3 className="text-sm font-semibold mb-3" style={{ color: T.text, fontFamily: T.h }}>
                  Content Gaps
                </h3>
                <div className="flex flex-wrap gap-2">
                  {activeAudit.contentGaps.map((gap, i) => (
                    <span
                      key={i}
                      className="text-xs px-3 py-1.5 rounded-full"
                      style={{ backgroundColor: "rgba(123,57,252,0.10)", color: T.purpleLight }}
                    >
                      {gap}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Past Audits */}
            {audits.length > 1 && (
              <div>
                <h3 className="text-sm font-semibold mb-3" style={{ color: T.text, fontFamily: T.h }}>
                  Past Audits
                </h3>
                <div className="space-y-2">
                  {audits.slice(1).map((audit) => (
                    <button
                      key={audit.id}
                      onClick={() => setActiveAudit({ audit, contentGaps: [], quickWins: [], creditsRemaining: credits })}
                      className="w-full rounded-xl p-4 flex items-center justify-between text-left transition"
                      style={{ ...glassCard }}
                    >
                      <div className="flex items-center gap-4">
                        <span
                          className="text-lg font-bold"
                          style={{
                            color:
                              audit.overall_score >= 80
                                ? T.green
                                : audit.overall_score >= 50
                                  ? T.gold
                                  : "#ef4444",
                            fontFamily: T.h,
                          }}
                        >
                          {audit.overall_score}
                        </span>
                        <div>
                          <p className="text-sm font-medium" style={{ color: T.text }}>
                            Score: {audit.overall_score}/100
                          </p>
                          <p className="text-xs" style={{ color: T.text3 }}>
                            {audit.issues?.length || 0} issues found
                          </p>
                        </div>
                      </div>
                      <span className="text-xs" style={{ color: T.text3 }}>
                        {new Date(audit.created_at).toLocaleDateString()}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
    </div>
    </PaywallGate>
  );
}
