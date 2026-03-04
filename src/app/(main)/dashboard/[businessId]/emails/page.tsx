"use client";

import { useBusinessContext } from "@/components/dashboard/BusinessProvider";
import { PaywallGate } from "@/components/dashboard/PaywallGate";
import { T, CTA_GRAD } from "@/lib/design-tokens";
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

const spinKeyframes = `@keyframes copilot-spin { to { transform: rotate(360deg) } }`;

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
      <>
        <style>{spinKeyframes}</style>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "80vh" }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              border: `2px solid ${T.purple}`,
              borderTopColor: "transparent",
              animation: "copilot-spin 1s linear infinite",
            }}
          />
        </div>
      </>
    );
  }

  const inputStyle: React.CSSProperties = {
    background: T.bgEl,
    color: T.text,
    border: `1px solid ${T.border}`,
  };

  return (
    <PaywallGate
      requiredPlan="starter"
      teaser={{
        headline: "AI Email Sequences",
          description: "Generate complete email flows — welcome, nurture, win-back — ready to send.",
          bullets: [
            "Welcome & onboarding flows",
            "Nurture & win-back sequences",
            "Full HTML emails, ready to send",
          ],
          previewRows: [
            { label: "Sequence", value: "5-email flow", color: "#22C55E" },
            { label: "Open Rate Est.", value: "38%" },
            { label: "Status", value: "Ready to send" },
          ],
        }}
      >
      <style>{spinKeyframes}</style>
      <div style={{ padding: "32px 40px 80px" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, marginBottom: 32 }}>
        <div>
          <h1
            style={{ color: T.text, fontFamily: T.h, fontSize: 22, fontWeight: 700, marginBottom: 4 }}
          >
            Email Sequences
          </h1>
          <p style={{ color: "#9CA3AF", fontSize: 14, lineHeight: 1.5 }}>
            AI-generated email sequences to nurture and convert for {business.name}.
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
          <span style={{ color: "#52525B", fontSize: 12 }}>
            8 credits
          </span>
          <button
            onClick={() => setShowForm(!showForm)}
            style={{
              background: CTA_GRAD,
              color: "#09090B",
              padding: "8px 16px",
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 600,
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <svg style={{ width: 16, height: 16 }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Create Sequence
          </button>
        </div>
      </div>

        {/* Error Messages */}
        {error === "insufficient_credits" && (
          <div
            style={{
              marginBottom: 24,
              padding: 16,
              borderRadius: 12,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              border: "1px solid rgba(239,68,68,0.20)",
              background: "rgba(239,68,68,0.05)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <svg style={{ width: 20, height: 20, flexShrink: 0, color: "#ef4444" }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
              <div>
                <p style={{ fontSize: 14, fontWeight: 500, color: T.text }}>Not enough credits</p>
                <p style={{ fontSize: 12, color: "#9CA3AF" }}>
                  Email sequences cost 8 credits. You have {credits} remaining.
                </p>
              </div>
            </div>
            <a
              href={`/dashboard/${businessId}/settings?tab=credits`}
              style={{
                padding: "6px 12px",
                borderRadius: 8,
                fontSize: 12,
                fontWeight: 600,
                flexShrink: 0,
                background: CTA_GRAD,
                color: "#09090B",
                textDecoration: "none",
              }}
            >
              Buy Credits
            </a>
          </div>
        )}

        {error && error !== "insufficient_credits" && (
          <div
            style={{
              marginBottom: 24,
              padding: 16,
              borderRadius: 12,
              border: "1px solid rgba(239,68,68,0.20)",
              background: "rgba(239,68,68,0.05)",
            }}
          >
            <p style={{ fontSize: 14, color: "#ef4444" }}>{error}</p>
          </div>
        )}

        {/* Create Form */}
        {showForm && (
          <div style={{ marginBottom: 24, borderBottom: `1px solid #1E1E21`, paddingBottom: 24 }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16, color: T.text, fontFamily: T.h }}>
              New Email Sequence
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={{ display: "block", fontSize: 12, marginBottom: 6, color: T.text2 }}>
                  Sequence Type
                </label>
                <select
                  value={seqType}
                  onChange={(e) => setSeqType(e.target.value)}
                  style={{
                    ...inputStyle,
                    width: "100%",
                    padding: "10px 16px",
                    borderRadius: 8,
                    fontSize: 14,
                    outline: "none",
                    appearance: "none" as const,
                  }}
                >
                  {SEQUENCE_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ display: "block", fontSize: 12, marginBottom: 6, color: T.text2 }}>
                  Goal <span style={{ color: "#52525B" }}>(optional)</span>
                </label>
                <input
                  type="text"
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  placeholder="e.g., Convert trial users to paid within 7 days..."
                  style={{
                    ...inputStyle,
                    width: "100%",
                    padding: "10px 16px",
                    borderRadius: 8,
                    fontSize: 14,
                    outline: "none",
                  }}
                />
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <button
                  onClick={handleGenerate}
                  disabled={generating}
                  style={{
                    background: CTA_GRAD,
                    color: "#09090B",
                    padding: "8px 16px",
                    borderRadius: 8,
                    fontSize: 14,
                    fontWeight: 600,
                    border: "none",
                    cursor: generating ? "not-allowed" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    opacity: generating ? 0.5 : 1,
                  }}
                >
                  {generating ? (
                    <>
                      <div
                        style={{
                          width: 16,
                          height: 16,
                          borderRadius: "50%",
                          border: "2px solid rgba(9,9,11,0.3)",
                          borderTopColor: "#09090B",
                          animation: "copilot-spin 1s linear infinite",
                        }}
                      />
                      Generating...
                    </>
                  ) : (
                    <>
                      <svg style={{ width: 16, height: 16 }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                      </svg>
                      Generate
                    </>
                  )}
                </button>
                <button
                  onClick={() => { setShowForm(false); setGoal(""); setError(""); }}
                  style={{
                    padding: "8px 16px",
                    borderRadius: 8,
                    fontSize: 14,
                    color: "#9CA3AF",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Sequences List */}
        {loading ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "80px 0" }}>
            <div
              style={{
                width: 24,
                height: 24,
                borderRadius: "50%",
                border: `2px solid ${T.purple}`,
                borderTopColor: "transparent",
                animation: "copilot-spin 1s linear infinite",
              }}
            />
          </div>
        ) : sequences.length === 0 ? (
          /* Rich empty state — educational content */
          <div style={{ paddingTop: 24 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
              <svg style={{ width: 24, height: 24, color: T.purpleLight, flexShrink: 0 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
              </svg>
              <h2 style={{ color: T.text, fontFamily: T.h, fontSize: 18, fontWeight: 600 }}>
                How Email Sequences Work
              </h2>
            </div>
            <p style={{ color: "#9CA3AF", fontSize: 14, lineHeight: 1.7, marginBottom: 28, maxWidth: 600 }}>
              An email sequence is a series of automated emails sent over time to nurture leads, onboard new customers, or re-engage inactive users. Each email is timed and written to move the reader toward a specific goal. The AI writes the full sequence for you -- subject lines, preview text, body copy, and CTAs -- based on the type you choose and your business context.
            </p>

            <h3 style={{ color: T.text, fontFamily: T.h, fontSize: 14, fontWeight: 600, marginBottom: 16 }}>
              Sequence types you can generate
            </h3>

            <div style={{ display: "flex", flexDirection: "column" }}>
              {[
                {
                  label: "Welcome Series",
                  desc: "Introduce your brand after signup. Build trust, explain your product, and drive a first action.",
                  color: T.green,
                  bg: "rgba(34,197,94,0.10)",
                },
                {
                  label: "Abandoned Cart",
                  desc: "Recover lost sales with timed reminders, social proof, and urgency-driven nudges.",
                  color: T.gold,
                  bg: "rgba(200,164,78,0.10)",
                },
                {
                  label: "Post-Purchase",
                  desc: "Thank buyers, cross-sell related products, and ask for reviews while satisfaction is high.",
                  color: T.purpleLight,
                  bg: "rgba(123,57,252,0.10)",
                },
                {
                  label: "Win-Back",
                  desc: "Re-engage users who have gone quiet. Escalate from soft nudge to special offer.",
                  color: "#ef4444",
                  bg: "rgba(239,68,68,0.10)",
                },
                {
                  label: "Newsletter",
                  desc: "Recurring value emails with curated content, tips, and product updates.",
                  color: "#3b82f6",
                  bg: "rgba(59,130,246,0.10)",
                },
                {
                  label: "Custom",
                  desc: "Describe your goal and the AI will design a sequence structure from scratch.",
                  color: "#9CA3AF",
                  bg: "rgba(255,255,255,0.04)",
                },
              ].map((item, i, arr) => (
                <div
                  key={item.label}
                  style={{
                    padding: "14px 0",
                    borderBottom: i < arr.length - 1 ? "1px solid #1E1E21" : undefined,
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 12,
                  }}
                >
                  <span
                    style={{
                      display: "inline-block",
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      backgroundColor: item.color,
                      marginTop: 6,
                      flexShrink: 0,
                    }}
                  />
                  <div>
                    <span style={{ color: T.text, fontSize: 14, fontWeight: 500 }}>{item.label}</span>
                    <span style={{ color: "#52525B", fontSize: 13, marginLeft: 8 }}> -- </span>
                    <span style={{ color: "#9CA3AF", fontSize: 13 }}>{item.desc}</span>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 28 }}>
              <button
                onClick={() => setShowForm(true)}
                style={{
                  background: CTA_GRAD,
                  color: "#09090B",
                  padding: "10px 20px",
                  borderRadius: 8,
                  fontSize: 14,
                  fontWeight: 600,
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Create Your First Sequence
              </button>
              <p style={{ color: "#52525B", fontSize: 12, marginTop: 10 }}>
                Each sequence costs 8 credits. You have {credits} remaining.
              </p>
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column" }}>
            {sequences.map((seq, seqIdx) => {
              const tc = typeColor(seq.sequence_type);
              const sc = statusColor(seq.status);
              const isExpanded = expandedSeq === seq.id;
              const emails = (seq.emails || []) as Email[];

              return (
                <div
                  key={seq.id}
                  style={{
                    borderBottom: seqIdx < sequences.length - 1 ? "1px solid #1E1E21" : undefined,
                  }}
                >
                  {/* Sequence Header */}
                  <button
                    onClick={() => setExpandedSeq(isExpanded ? null : seq.id)}
                    style={{
                      width: "100%",
                      padding: "14px 0",
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      textAlign: "left",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                        <h3 style={{ fontSize: 14, fontWeight: 600, color: T.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {seq.sequence_name}
                        </h3>
                        <span
                          style={{
                            fontSize: 10,
                            fontWeight: 500,
                            padding: "2px 8px",
                            borderRadius: 9999,
                            flexShrink: 0,
                            backgroundColor: tc.bg,
                            color: tc.color,
                          }}
                        >
                          {seq.sequence_type.replace(/_/g, " ")}
                        </span>
                        <span
                          style={{
                            fontSize: 10,
                            fontWeight: 500,
                            padding: "2px 8px",
                            borderRadius: 9999,
                            flexShrink: 0,
                            backgroundColor: sc.bg,
                            color: sc.color,
                          }}
                        >
                          {seq.status}
                        </span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 10, color: "#52525B" }}>
                        <span>{emails.length} email{emails.length !== 1 ? "s" : ""}</span>
                        <span>{new Date(seq.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <svg
                      style={{
                        width: 16,
                        height: 16,
                        flexShrink: 0,
                        color: "#9CA3AF",
                        transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
                        transition: "transform 0.2s",
                      }}
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
                    <div style={{ borderTop: `1px solid ${T.border}`, marginBottom: 8 }}>
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
                              style={{
                                width: "100%",
                                padding: "12px 16px",
                                display: "flex",
                                alignItems: "center",
                                gap: 12,
                                textAlign: "left",
                                background: "rgba(0,0,0,0.15)",
                                border: "none",
                                cursor: "pointer",
                              }}
                            >
                              <span
                                style={{
                                  fontSize: 10,
                                  fontWeight: 700,
                                  width: 24,
                                  height: 24,
                                  borderRadius: "50%",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  flexShrink: 0,
                                  backgroundColor: "rgba(123,57,252,0.15)",
                                  color: T.purpleLight,
                                }}
                              >
                                {email.order}
                              </span>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <p style={{ fontSize: 14, fontWeight: 500, color: T.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                  {email.subject}
                                </p>
                                <p style={{ fontSize: 12, color: "#9CA3AF", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                  {email.preview_text}
                                </p>
                              </div>
                              {email.delay_days > 0 && (
                                <span style={{ fontSize: 10, flexShrink: 0, color: "#52525B" }}>
                                  +{email.delay_days}d
                                </span>
                              )}
                              <svg
                                style={{
                                  width: 12,
                                  height: 12,
                                  flexShrink: 0,
                                  color: "#9CA3AF",
                                  transform: isEmailExpanded ? "rotate(180deg)" : "rotate(0deg)",
                                  transition: "transform 0.2s",
                                }}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                strokeWidth={2}
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                              </svg>
                            </button>
                            {isEmailExpanded && (
                              <div style={{ padding: "0 16px 16px", background: "rgba(0,0,0,0.10)" }}>
                                <div style={{ paddingTop: 12, display: "flex", flexDirection: "column", gap: 12 }}>
                                  <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 12, color: "#9CA3AF" }}>
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
                                    style={{
                                      borderRadius: 8,
                                      padding: 16,
                                      fontSize: 14,
                                      lineHeight: 1.6,
                                      background: "rgba(255,255,255,0.02)",
                                      border: `1px solid ${T.border}`,
                                      color: T.text2,
                                    }}
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
      </div>
    </PaywallGate>
  );
}
