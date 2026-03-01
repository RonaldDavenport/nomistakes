"use client";

import { useBusinessContext } from "@/components/dashboard/BusinessProvider";
import { PaywallGate } from "@/components/dashboard/PaywallGate";
import { T, CTA_GRAD, glassCard } from "@/lib/design-tokens";
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

interface Email {
  order: number;
  subject: string;
  preview_text: string;
  body_html: string;
  delay_days: number;
  cta_text: string;
  cta_url_placeholder: string;
}

interface EmailSequence {
  id: string;
  sequence_name: string;
  sequence_type: string;
  emails: Email[];
  status: string;
  created_at: string;
}

const SEQUENCE_TYPES = [
  { value: "welcome", label: "Welcome Series" },
  { value: "abandoned_cart", label: "Abandoned Cart" },
  { value: "post_purchase", label: "Post-Purchase" },
  { value: "winback", label: "Win-Back" },
  { value: "newsletter", label: "Newsletter" },
  { value: "custom", label: "Custom" },
] as const;

function typeColor(type: string) {
  const map: Record<string, { bg: string; color: string }> = {
    welcome: { bg: "rgba(34,197,94,0.15)", color: T.green },
    abandoned_cart: { bg: "rgba(245,158,11,0.15)", color: T.gold },
    post_purchase: { bg: "rgba(123,57,252,0.15)", color: T.purpleLight },
    winback: { bg: "rgba(239,68,68,0.15)", color: "#ef4444" },
    newsletter: { bg: "rgba(59,130,246,0.15)", color: "#3b82f6" },
    custom: { bg: "rgba(255,255,255,0.06)", color: T.text3 },
  };
  return map[type] || map.custom;
}

function statusColor(status: string) {
  if (status === "active") return { bg: "rgba(34,197,94,0.15)", color: T.green };
  if (status === "paused") return { bg: "rgba(245,158,11,0.15)", color: T.gold };
  return { bg: "rgba(255,255,255,0.06)", color: T.text3 };
}

export default function EmailsPage() {
  const params = useParams();
  const businessId = params.businessId as string;
  const { business, userId, credits, refreshCredits } = useBusinessContext();

  const [sequences, setSequences] = useState<EmailSequence[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [expandedSeq, setExpandedSeq] = useState<string | null>(null);
  const [expandedEmail, setExpandedEmail] = useState<string | null>(null);

  // Form state
  const [seqType, setSeqType] = useState("welcome");
  const [goal, setGoal] = useState("");

  useEffect(() => {
    fetchSequences();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [businessId]);

  async function fetchSequences() {
    setLoading(true);
    try {
      const { data, error: dbErr } = await supabase
        .from("email_sequences")
        .select("*")
        .eq("business_id", businessId)
        .order("created_at", { ascending: false });

      if (!dbErr && data) {
        setSequences(data as EmailSequence[]);
      }
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }

  async function handleGenerate() {
    setGenerating(true);
    setError("");
    try {
      const res = await fetch("/api/email-sequences/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessId,
          userId,
          sequenceType: seqType,
          goal: goal.trim() || undefined,
        }),
      });

      if (res.status === 402) {
        setError("insufficient_credits");
        return;
      }

      if (!res.ok) {
        setError("Generation failed. Please try again.");
        return;
      }

      const data = await res.json();
      if (data.sequence) {
        setSequences((prev) => [data.sequence as EmailSequence, ...prev]);
        setExpandedSeq(data.sequence.id);
      }
      setShowForm(false);
      setGoal("");
      await refreshCredits();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setGenerating(false);
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
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <h1
            className="text-xl sm:text-2xl font-bold mb-1"
            style={{ color: T.text, fontFamily: T.h }}
          >
            Email Sequences
          </h1>
          <p className="text-sm" style={{ color: T.text3 }}>
            AI-generated email sequences to nurture and convert for {business.name}.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-xs" style={{ color: T.text3 }}>
            8 credits
          </span>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2"
            style={{ background: CTA_GRAD, color: "#fff" }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Create Sequence
          </button>
        </div>
      </div>

      <PaywallGate requiredPlan="starter">
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
                  Email sequences cost 8 credits. You have {credits} remaining.
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

        {/* Create Form */}
        {showForm && (
          <div className="mb-6 rounded-xl p-5" style={{ ...glassCard }}>
            <h3 className="text-sm font-semibold mb-4" style={{ color: T.text, fontFamily: T.h }}>
              New Email Sequence
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs mb-1.5" style={{ color: T.text2 }}>
                  Sequence Type
                </label>
                <select
                  value={seqType}
                  onChange={(e) => setSeqType(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg text-sm focus:outline-none"
                  style={inputStyle}
                >
                  {SEQUENCE_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs mb-1.5" style={{ color: T.text2 }}>
                  Goal <span style={{ color: T.text3 }}>(optional)</span>
                </label>
                <input
                  type="text"
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  placeholder="e.g., Convert trial users to paid within 7 days..."
                  className="w-full px-4 py-2.5 rounded-lg text-sm focus:outline-none"
                  style={inputStyle}
                />
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleGenerate}
                  disabled={generating}
                  className="px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 disabled:opacity-50"
                  style={{ background: CTA_GRAD, color: "#fff" }}
                >
                  {generating ? (
                    <>
                      <div
                        className="w-4 h-4 rounded-full animate-spin"
                        style={{ border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff" }}
                      />
                      Generating...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                      </svg>
                      Generate
                    </>
                  )}
                </button>
                <button
                  onClick={() => { setShowForm(false); setGoal(""); setError(""); }}
                  className="px-4 py-2 rounded-lg text-sm"
                  style={{ color: T.text3 }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Sequences List */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div
              className="w-6 h-6 rounded-full animate-spin"
              style={{ border: `2px solid ${T.purple}`, borderTopColor: "transparent" }}
            />
          </div>
        ) : sequences.length === 0 ? (
          <div className="rounded-xl p-8 text-center" style={{ ...glassCard }}>
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4"
              style={{ background: "rgba(123,57,252,0.10)" }}
            >
              <svg className="w-6 h-6" style={{ color: T.purpleLight }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold mb-2" style={{ color: T.text, fontFamily: T.h }}>
              No email sequences yet
            </h2>
            <p className="text-sm max-w-md mx-auto leading-relaxed mb-4" style={{ color: T.text3 }}>
              Create your first AI-generated email sequence. Choose a type like welcome, abandoned cart,
              or post-purchase and let AI write the emails for you.
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="px-4 py-2 rounded-lg text-sm font-semibold"
              style={{ background: CTA_GRAD, color: "#fff" }}
            >
              Create First Sequence
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {sequences.map((seq) => {
              const tc = typeColor(seq.sequence_type);
              const sc = statusColor(seq.status);
              const isExpanded = expandedSeq === seq.id;
              const emails = (seq.emails || []) as Email[];

              return (
                <div key={seq.id} className="rounded-xl overflow-hidden" style={{ ...glassCard }}>
                  {/* Sequence Header */}
                  <button
                    onClick={() => setExpandedSeq(isExpanded ? null : seq.id)}
                    className="w-full px-4 py-3 flex items-center gap-3 text-left"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-sm font-semibold truncate" style={{ color: T.text }}>
                          {seq.sequence_name}
                        </h3>
                        <span
                          className="text-[10px] font-medium px-2 py-0.5 rounded-full shrink-0"
                          style={{ backgroundColor: tc.bg, color: tc.color }}
                        >
                          {seq.sequence_type.replace(/_/g, " ")}
                        </span>
                        <span
                          className="text-[10px] font-medium px-2 py-0.5 rounded-full shrink-0"
                          style={{ backgroundColor: sc.bg, color: sc.color }}
                        >
                          {seq.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-[10px]" style={{ color: T.text3 }}>
                        <span>{emails.length} email{emails.length !== 1 ? "s" : ""}</span>
                        <span>{new Date(seq.created_at).toLocaleDateString()}</span>
                      </div>
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

                  {/* Expanded Emails */}
                  {isExpanded && emails.length > 0 && (
                    <div style={{ borderTop: `1px solid ${T.border}` }}>
                      {emails.map((email, i) => {
                        const emailKey = `${seq.id}-${i}`;
                        const isEmailExpanded = expandedEmail === emailKey;
                        return (
                          <div
                            key={i}
                            style={i > 0 ? { borderTop: `1px solid ${T.border}` } : undefined}
                          >
                            <button
                              onClick={() => setExpandedEmail(isEmailExpanded ? null : emailKey)}
                              className="w-full px-4 py-3 flex items-center gap-3 text-left"
                              style={{ background: "rgba(0,0,0,0.15)" }}
                            >
                              <span
                                className="text-[10px] font-bold w-6 h-6 rounded-full flex items-center justify-center shrink-0"
                                style={{ backgroundColor: "rgba(123,57,252,0.15)", color: T.purpleLight }}
                              >
                                {email.order}
                              </span>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate" style={{ color: T.text }}>
                                  {email.subject}
                                </p>
                                <p className="text-xs truncate" style={{ color: T.text3 }}>
                                  {email.preview_text}
                                </p>
                              </div>
                              {email.delay_days > 0 && (
                                <span className="text-[10px] shrink-0" style={{ color: T.text3 }}>
                                  +{email.delay_days}d
                                </span>
                              )}
                              <svg
                                className="w-3 h-3 shrink-0 transition-transform"
                                style={{ color: T.text3, transform: isEmailExpanded ? "rotate(180deg)" : "rotate(0deg)" }}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                strokeWidth={2}
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                              </svg>
                            </button>
                            {isEmailExpanded && (
                              <div className="px-4 pb-4" style={{ background: "rgba(0,0,0,0.10)" }}>
                                <div className="pt-3 space-y-3">
                                  <div className="flex items-center gap-4 text-xs" style={{ color: T.text3 }}>
                                    {email.delay_days > 0 && (
                                      <span>Sent after {email.delay_days} day{email.delay_days !== 1 ? "s" : ""}</span>
                                    )}
                                    {email.delay_days === 0 && <span>Sent immediately</span>}
                                    {email.cta_text && (
                                      <span>
                                        CTA: <strong style={{ color: T.text2 }}>{email.cta_text}</strong>
                                      </span>
                                    )}
                                  </div>
                                  <div
                                    className="rounded-lg p-4 text-sm leading-relaxed"
                                    style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${T.border}`, color: T.text2 }}
                                    dangerouslySetInnerHTML={{ __html: email.body_html }}
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </PaywallGate>
    </div>
  );
}
