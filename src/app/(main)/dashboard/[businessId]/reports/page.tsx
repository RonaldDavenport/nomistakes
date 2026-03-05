"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useBusinessContext } from "@/components/dashboard/BusinessProvider";
import { PaywallGate } from "@/components/dashboard/PaywallGate";
import { T, CTA_GRAD, glassCard } from "@/lib/design-tokens";

interface WeeklyReport {
  id: string;
  period_start: string;
  period_end: string;
  report: {
    summary: string;
    highlights: string[];
    metrics: Record<string, number>;
    next_week_priority: string;
    tip: string;
    mood: string;
  };
  is_read: boolean;
  created_at: string;
}

export default function ReportsPage() {
  const params = useParams();
  const businessId = params.businessId as string;
  const { business, userId, credits, refreshCredits } = useBusinessContext();

  const [reports, setReports] = useState<WeeklyReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    fetchReports();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [businessId]);

  async function fetchReports() {
    setLoading(true);
    try {
      const res = await fetch(`/api/reports/weekly?businessId=${businessId}`);
      if (res.ok) {
        const data = await res.json();
        setReports(data.reports || []);
      }
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }

  async function generateReport() {
    setGenerating(true);
    setError("");
    try {
      const res = await fetch("/api/reports/weekly", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessId, userId }),
      });

      if (res.status === 402) {
        setError("Not enough credits. Buy more to generate reports.");
        setGenerating(false);
        return;
      }

      if (!res.ok) throw new Error("Failed to generate report");

      const data = await res.json();
      if (data.report) {
        setReports((prev) => [data.report, ...prev]);
        setExpanded(data.report.id);
        refreshCredits();
      }
    } catch {
      setError("Report generation failed. Please try again.");
    } finally {
      setGenerating(false);
    }
  }

  const moodColors: Record<string, { bg: string; text: string; label: string }> = {
    growing: { bg: "rgba(34,197,94,0.15)", text: T.green, label: "Growing" },
    steady: { bg: "rgba(59,130,246,0.15)", text: "#3B82F6", label: "Steady" },
    needs_attention: { bg: "rgba(245,158,11,0.15)", text: T.gold, label: "Needs Attention" },
  };

  if (!business) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <div className="w-8 h-8 rounded-full animate-spin" style={{ border: `2px solid ${T.purple}`, borderTopColor: "transparent" }} />
      </div>
    );
  }

  return (
    <PaywallGate
      requiredPlan="solo"
      teaser={{
        headline: "Weekly AI Reports",
        description: "Automated business progress reports with trends, highlights, and priorities.",
        bullets: [
          "Weekly progress tracking",
          "Highlights & action items",
          "Priority recommendations",
        ],
        previewRows: [
          { label: "Period", value: "This week", color: "#22C55E" },
          { label: "Highlights", value: "4 key trends" },
          { label: "Action Items", value: "3 priorities" },
        ],
      }}
    >
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold mb-1" style={{ color: T.text, fontFamily: T.h }}>Weekly Reports</h1>
          <p className="text-sm" style={{ color: T.text3 }}>
            AI-generated business progress reports for {business.name}
          </p>
        </div>
        <button
          onClick={generateReport}
          disabled={generating}
          className="px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 shrink-0 transition"
          style={{ background: CTA_GRAD, color: "#fff", opacity: generating ? 0.7 : 1 }}
        >
          {generating ? (
            <>
              <div className="w-4 h-4 rounded-full animate-spin" style={{ border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff" }} />
              Generating...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
              </svg>
              Generate Report
              <span className="text-xs opacity-70">3 credits</span>
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="mb-4 px-4 py-3 rounded-lg text-sm" style={{ background: "rgba(239,68,68,0.1)", color: "#EF4444", border: "1px solid rgba(239,68,68,0.2)" }}>
          {error}{" "}
          <a href={`/dashboard/${businessId}/settings?tab=credits`} style={{ color: T.purpleLight, textDecoration: "underline" }}>
            Buy Credits
          </a>
        </div>
      )}

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-6 h-6 rounded-full animate-spin" style={{ border: `2px solid ${T.purple}`, borderTopColor: "transparent" }} />
          </div>
        ) : reports.length === 0 ? (
          <div className="rounded-xl p-8 text-center" style={{ ...glassCard }}>
            <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4" style={{ background: "rgba(123,57,252,0.10)" }}>
              <svg className="w-6 h-6" style={{ color: T.purpleLight }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold mb-2" style={{ color: T.text, fontFamily: T.h }}>No reports yet</h2>
            <p className="text-sm max-w-md mx-auto leading-relaxed mb-4" style={{ color: T.text3 }}>
              Generate your first weekly report to see AI-powered insights about your business progress.
            </p>
            <button
              onClick={generateReport}
              disabled={generating}
              className="px-4 py-2 rounded-lg text-sm font-semibold"
              style={{ background: CTA_GRAD, color: "#fff" }}
            >
              {generating ? "Generating..." : "Generate First Report"}
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {reports.map((report) => {
              const isExpanded = expanded === report.id;
              const mood = moodColors[report.report.mood] || moodColors.steady;

              return (
                <div key={report.id} className="rounded-xl overflow-hidden" style={{ ...glassCard }}>
                  <button
                    onClick={() => setExpanded(isExpanded ? null : report.id)}
                    className="w-full px-4 py-4 flex items-center justify-between text-left"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex flex-col min-w-0">
                        <span className="text-sm font-semibold truncate" style={{ color: T.text }}>
                          Week of {new Date(report.period_start).toLocaleDateString()} — {new Date(report.period_end).toLocaleDateString()}
                        </span>
                        <span className="text-xs truncate" style={{ color: T.text3 }}>
                          {report.report.summary?.slice(0, 80)}...
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: mood.bg, color: mood.text }}
                      >
                        {mood.label}
                      </span>
                      <svg
                        className="w-4 h-4 transition-transform"
                        style={{ color: T.text3, transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)" }}
                        fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                      </svg>
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="px-4 pb-4" style={{ borderTop: `1px solid ${T.border}` }}>
                      <div className="pt-4 space-y-4">
                        {/* Summary */}
                        <div>
                          <h4 className="text-xs font-semibold uppercase mb-1" style={{ color: T.text3 }}>Summary</h4>
                          <p className="text-sm leading-relaxed" style={{ color: T.text2 }}>{report.report.summary}</p>
                        </div>

                        {/* Highlights */}
                        {report.report.highlights && report.report.highlights.length > 0 && (
                          <div>
                            <h4 className="text-xs font-semibold uppercase mb-1" style={{ color: T.text3 }}>Highlights</h4>
                            <ul className="space-y-1">
                              {report.report.highlights.map((h, i) => (
                                <li key={i} className="text-sm flex items-start gap-2" style={{ color: T.text2 }}>
                                  <span style={{ color: T.green }}>+</span> {h}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Priority */}
                        <div
                          className="px-3 py-2.5 rounded-lg"
                          style={{ background: "rgba(123,57,252,0.06)", border: `1px solid rgba(123,57,252,0.12)` }}
                        >
                          <h4 className="text-xs font-semibold uppercase mb-0.5" style={{ color: T.purpleLight }}>Next Week Priority</h4>
                          <p className="text-sm" style={{ color: T.text }}>{report.report.next_week_priority}</p>
                        </div>

                        {/* Tip */}
                        <div>
                          <h4 className="text-xs font-semibold uppercase mb-1" style={{ color: T.text3 }}>Pro Tip</h4>
                          <p className="text-sm" style={{ color: T.text2 }}>{report.report.tip}</p>
                        </div>
                      </div>
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
