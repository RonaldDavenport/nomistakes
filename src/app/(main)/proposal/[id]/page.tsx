"use client";

import { useParams, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { T, CTA_GRAD, glassCard } from "@/lib/design-tokens";

interface Proposal {
  id: string;
  business_id: string;
  contact_id: string;
  title: string;
  status: string;
  scope: {
    overview?: string;
    deliverables?: string[];
    timeline?: string;
    terms?: string;
  };
  pricing: {
    line_items?: { name: string; description?: string; amount_cents: number }[];
    total_cents?: number;
  };
  valid_until: string | null;
  viewed_at: string | null;
  accepted_at: string | null;
  paid_at: string | null;
  created_at: string;
  contacts: { name: string; email: string } | null;
  businesses: { name: string; brand: Record<string, unknown> | null } | null;
}

function formatCurrency(cents: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);
}

export default function ProposalPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const proposalId = params.id as string;
  const token = searchParams.get("token");
  const paid = searchParams.get("paid");

  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [accepting, setAccepting] = useState(false);

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/proposals/view?id=${proposalId}&token=${token}`);
      if (res.ok) {
        const data = await res.json();
        setProposal(data.proposal);
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Proposal not found");
      }
      setLoading(false);
    }
    load();
  }, [proposalId, token]);

  async function handleAccept() {
    setAccepting(true);
    const res = await fetch("/api/proposals/accept", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ proposalId, accessToken: token }),
    });
    if (res.ok) {
      const { url } = await res.json();
      if (url) window.location.href = url;
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Failed to process payment");
      setAccepting(false);
    }
  }

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: T.bg }}>
        <p style={{ color: T.text3, fontSize: 16 }}>Loading proposal...</p>
      </div>
    );
  }

  if (error || !proposal) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: T.bg }}>
        <div style={{ textAlign: "center" }}>
          <p style={{ color: "#ef4444", fontSize: 18, fontWeight: 600 }}>{error || "Proposal not found"}</p>
          <p style={{ color: T.text3, fontSize: 14, marginTop: 8 }}>This link may be invalid or expired.</p>
        </div>
      </div>
    );
  }

  const brand = proposal.businesses?.brand as Record<string, unknown> | null;
  const colors = brand?.colors as Record<string, string> | null;
  const primaryColor = colors?.primary || "#7B39FC";
  const businessName = proposal.businesses?.name || "Business";
  const contactName = proposal.contacts?.name || "Client";
  const scope = proposal.scope || {};
  const pricing = proposal.pricing || {};
  const lineItems = pricing.line_items || [];
  const totalCents = pricing.total_cents || 0;
  const isExpired = proposal.valid_until && new Date(proposal.valid_until) < new Date();
  const isAccepted = proposal.status === "accepted";
  const isPaid = paid === "true" || !!proposal.paid_at;

  return (
    <div style={{ minHeight: "100vh", background: T.bg, padding: "0 16px" }}>
      <div style={{ maxWidth: 760, margin: "0 auto", padding: "48px 0 80px" }}>
        {/* Business Header */}
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 14, background: primaryColor,
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 16px", fontSize: 24, fontWeight: 700, color: "#fff",
          }}>
            {businessName[0]}
          </div>
          <h2 style={{ fontFamily: T.h, fontSize: 14, fontWeight: 500, color: T.text3, letterSpacing: 1, textTransform: "uppercase" }}>
            {businessName}
          </h2>
        </div>

        {/* Success Banner */}
        {isPaid && (
          <div style={{
            ...glassCard, padding: "20px 24px", marginBottom: 24,
            background: "rgba(34,197,94,0.1)", borderColor: "rgba(34,197,94,0.3)",
            textAlign: "center",
          }}>
            <p style={{ fontSize: 16, fontWeight: 600, color: T.green }}>Payment received — thank you!</p>
            <p style={{ fontSize: 13, color: T.text2, marginTop: 4 }}>We'll be in touch to get started.</p>
          </div>
        )}

        {/* Proposal Title */}
        <div style={{ ...glassCard, padding: "32px 36px", marginBottom: 24 }}>
          <h1 style={{ fontFamily: T.h, fontSize: 26, fontWeight: 700, color: T.text, marginBottom: 8, letterSpacing: "-0.5px" }}>
            {proposal.title}
          </h1>
          <p style={{ fontSize: 14, color: T.text3 }}>
            Prepared for <strong style={{ color: T.text2 }}>{contactName}</strong> &middot;{" "}
            {new Date(proposal.created_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
          </p>
          {proposal.valid_until && (
            <p style={{ fontSize: 12, color: isExpired ? "#ef4444" : T.text3, marginTop: 4 }}>
              {isExpired ? "Expired" : "Valid until"} {new Date(proposal.valid_until).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
            </p>
          )}

          {/* Status badge */}
          {(isAccepted || proposal.status === "declined") && (
            <div style={{
              display: "inline-block", marginTop: 12,
              padding: "4px 12px", borderRadius: 6, fontSize: 12, fontWeight: 600,
              background: isAccepted ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.15)",
              color: isAccepted ? T.green : "#ef4444",
            }}>
              {proposal.status.charAt(0).toUpperCase() + proposal.status.slice(1)}
            </div>
          )}
        </div>

        {/* Overview */}
        {scope.overview && (
          <div style={{ ...glassCard, padding: "28px 36px", marginBottom: 24 }}>
            <h2 style={{ fontFamily: T.h, fontSize: 16, fontWeight: 600, color: T.text, marginBottom: 16 }}>
              Project Overview
            </h2>
            <p style={{ fontSize: 14, color: T.text2, lineHeight: 1.7, whiteSpace: "pre-wrap" }}>
              {scope.overview}
            </p>
          </div>
        )}

        {/* Deliverables */}
        {scope.deliverables && scope.deliverables.length > 0 && (
          <div style={{ ...glassCard, padding: "28px 36px", marginBottom: 24 }}>
            <h2 style={{ fontFamily: T.h, fontSize: 16, fontWeight: 600, color: T.text, marginBottom: 16 }}>
              Deliverables
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {scope.deliverables.map((d, i) => (
                <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <div style={{
                    width: 22, height: 22, borderRadius: 6, flexShrink: 0, marginTop: 1,
                    background: `${primaryColor}20`, border: `1px solid ${primaryColor}40`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 11, fontWeight: 700, color: primaryColor,
                  }}>
                    {i + 1}
                  </div>
                  <p style={{ fontSize: 14, color: T.text2, lineHeight: 1.5 }}>{d}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Timeline */}
        {scope.timeline && (
          <div style={{ ...glassCard, padding: "28px 36px", marginBottom: 24 }}>
            <h2 style={{ fontFamily: T.h, fontSize: 16, fontWeight: 600, color: T.text, marginBottom: 12 }}>
              Timeline
            </h2>
            <p style={{ fontSize: 14, color: T.text2, lineHeight: 1.7 }}>{scope.timeline}</p>
          </div>
        )}

        {/* Pricing */}
        {lineItems.length > 0 && (
          <div style={{ ...glassCard, padding: "28px 36px", marginBottom: 24 }}>
            <h2 style={{ fontFamily: T.h, fontSize: 16, fontWeight: 600, color: T.text, marginBottom: 20 }}>
              Investment
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              {lineItems.map((item, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    padding: "14px 0",
                    borderBottom: i < lineItems.length - 1 ? `1px solid ${T.border}` : "none",
                  }}
                >
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 500, color: T.text }}>{item.name}</p>
                    {item.description && (
                      <p style={{ fontSize: 12, color: T.text3, marginTop: 2 }}>{item.description}</p>
                    )}
                  </div>
                  <span style={{ fontSize: 14, fontWeight: 600, color: T.text, fontFamily: T.mono }}>
                    {formatCurrency(item.amount_cents)}
                  </span>
                </div>
              ))}

              {/* Total */}
              <div style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "18px 0 4px", marginTop: 8,
                borderTop: `2px solid ${T.border}`,
              }}>
                <span style={{ fontSize: 16, fontWeight: 700, color: T.text }}>Total</span>
                <span style={{ fontSize: 20, fontWeight: 700, color: primaryColor, fontFamily: T.mono }}>
                  {formatCurrency(totalCents)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Terms */}
        {scope.terms && (
          <div style={{ ...glassCard, padding: "28px 36px", marginBottom: 32 }}>
            <h2 style={{ fontFamily: T.h, fontSize: 16, fontWeight: 600, color: T.text, marginBottom: 12 }}>
              Terms
            </h2>
            <p style={{ fontSize: 13, color: T.text3, lineHeight: 1.7, whiteSpace: "pre-wrap" }}>{scope.terms}</p>
          </div>
        )}

        {/* Accept & Pay CTA */}
        {!isAccepted && !isPaid && !isExpired && proposal.status !== "declined" && (
          <div style={{ textAlign: "center", padding: "16px 0 32px" }}>
            <button
              onClick={handleAccept}
              disabled={accepting}
              style={{
                background: CTA_GRAD, color: "#fff", border: "none",
                padding: "16px 48px", borderRadius: 12, fontSize: 16,
                fontWeight: 700, cursor: accepting ? "default" : "pointer",
                opacity: accepting ? 0.7 : 1,
                letterSpacing: "-0.3px",
              }}
            >
              {accepting ? "Processing..." : `Accept & Pay ${formatCurrency(totalCents)}`}
            </button>
            <p style={{ fontSize: 12, color: T.text3, marginTop: 12 }}>
              Secure payment via Stripe
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
