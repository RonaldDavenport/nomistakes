"use client";

import { Suspense, useState, useEffect } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { T, CTA_GRAD } from "@/lib/design-tokens";

interface Business {
  id: string;
  name: string;
  slug: string;
  deployed_url?: string;
  live_url?: string;
  stripe_account_id?: string;
  onboarding_completed?: boolean;
}

interface Stats {
  contacts: number;
  proposals: number;
  invoices: number;
  revenue: number;
}

const TOOL_MAP: Record<string, { kovra: string; section: string }> = {
  "Apollo":              { kovra: "Lead Engine", section: "leads" },
  "Lemlist":             { kovra: "Cold email infra", section: "infrastructure" },
  "Instantly":           { kovra: "Cold email infra", section: "infrastructure" },
  "LinkedIn Sales Nav":  { kovra: "Unified inbox", section: "inbox" },
  "Calendly":            { kovra: "Booking link", section: "calls" },
  "Acuity":              { kovra: "Booking link", section: "calls" },
  "HoneyBook":           { kovra: "CRM + Proposals", section: "contacts" },
  "Dubsado":             { kovra: "CRM + Contracts", section: "proposals" },
  "DocuSign":            { kovra: "E-signatures", section: "proposals" },
  "PayPal":              { kovra: "Online invoicing", section: "invoices" },
  "FreshBooks":          { kovra: "Invoicing + payments", section: "invoices" },
  "Notion":              { kovra: "Projects + notes", section: "projects" },
  "Toggl":               { kovra: "Time tracking", section: "time" },
  "Pipedrive":           { kovra: "CRM + pipeline", section: "contacts" },
  "Typeform":            { kovra: "Intake forms", section: "calls" },
  "17hats":              { kovra: "Full business OS", section: "contacts" },
};

const TOOL_COSTS: Record<string, number> = {
  Calendly: 16, HoneyBook: 40, Dubsado: 200, DocuSign: 25,
  Acuity: 20, PayPal: 0, FreshBooks: 17, Notion: 10,
  Toggl: 10, Pipedrive: 15, Typeform: 25, "17hats": 45,
  Apollo: 49, Lemlist: 99, Instantly: 37, "LinkedIn Sales Nav": 100,
};

const QUICK_ACTIONS = [
  {
    title: "Copy your booking link",
    desc: "Share it in your bio, email signature, anywhere. Clients pick a slot.",
    icon: "calendar",
    href: (bizId: string) => `/dashboard/${bizId}/calls`,
    cta: "Go to Calls",
  },
  {
    title: "Write a proposal",
    desc: "Describe the project. Kovra writes it. Client signs on the same page.",
    icon: "file",
    href: (bizId: string) => `/dashboard/${bizId}/proposals`,
    cta: "New proposal",
  },
  {
    title: "Send an invoice",
    desc: "Branded invoices paid by card or bank. Not PayPal.",
    icon: "invoice",
    href: (bizId: string) => `/dashboard/${bizId}/invoices`,
    cta: "New invoice",
  },
  {
    title: "Add your clients",
    desc: "Your CRM is live. Import a list or add them one by one.",
    icon: "contacts",
    href: (bizId: string) => `/dashboard/${bizId}/contacts`,
    cta: "Add clients",
  },
];

function Icon({ type }: { type: string }) {
  const s = { width: 16, height: 16, color: T.gold };
  if (type === "calendar") return (
    <svg {...s} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}>
      <rect x="3" y="4" width="18" height="18" rx="2" /><path strokeLinecap="round" d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  );
  if (type === "file") return (
    <svg {...s} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );
  if (type === "invoice") return (
    <svg {...s} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33" />
    </svg>
  );
  return (
    <svg {...s} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

export default function SwitchDashboardPage() {
  return (
    <Suspense>
      <SwitchDashboardContent />
    </Suspense>
  );
}

function SwitchDashboardContent() {
  const { businessId } = useParams<{ businessId: string }>();
  const searchParams = useSearchParams();
  const toolsParam = searchParams.get("tools") || "";
  const replacedTools = toolsParam ? toolsParam.split(",") : [];

  const [business, setBusiness] = useState<Business | null>(null);
  const [stats, setStats] = useState<Stats>({ contacts: 0, proposals: 0, invoices: 0, revenue: 0 });
  const [loading, setLoading] = useState(true);
  const [bookingCopied, setBookingCopied] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const [bizRes, statsRes] = await Promise.all([
          fetch(`/api/onboarding?businessId=${businessId}`),
          fetch(`/api/dashboard/stats?businessId=${businessId}`),
        ]);
        if (bizRes.ok) {
          const data = await bizRes.json();
          setBusiness(data.business);
        }
        if (statsRes.ok) {
          const data = await statsRes.json();
          setStats({
            contacts: data.contacts ?? 0,
            proposals: data.proposals ?? 0,
            invoices: data.invoices ?? 0,
            revenue: data.revenue ?? 0,
          });
        }
      } catch {}
      setLoading(false);
    }
    load();
  }, [businessId]);

  const bookingUrl = businessId
    ? `${typeof window !== "undefined" ? window.location.origin : ""}/book/${businessId}`
    : null;

  function copyBookingLink() {
    if (!bookingUrl) return;
    navigator.clipboard.writeText(bookingUrl);
    setBookingCopied(true);
    setTimeout(() => setBookingCopied(false), 2000);
  }

  const totalSaved = replacedTools.reduce((acc, tool) => acc + (TOOL_COSTS[tool] ?? 0), 0);
  const netSavings = totalSaved - 79;

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: T.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: 32, height: 32, borderRadius: "50%", border: `2px solid ${T.border}`, borderTop: `2px solid ${T.gold}`, animation: "spin 0.8s linear infinite" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: T.bg, fontFamily: T.h }}>

      {/* Nav */}
      <div style={{
        position: "sticky", top: 0, zIndex: 50,
        background: T.bg, borderBottom: `1px solid ${T.border}`,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 28px", height: 56,
      }}>
        <Link href="/" style={{ textDecoration: "none", color: T.text, fontWeight: 700, fontSize: 17, letterSpacing: "-0.03em" }}>
          kovra
        </Link>
        <Link
          href={`/dashboard/${businessId}`}
          style={{
            padding: "7px 16px", borderRadius: 8,
            fontSize: "0.82rem", fontWeight: 500,
            color: T.text2, textDecoration: "none",
            border: `1px solid ${T.border}`,
            background: T.bgEl,
          }}
        >
          Full dashboard
        </Link>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 760, margin: "0 auto", padding: "52px 24px 80px" }}>

        {/* Header */}
        <div style={{ marginBottom: 48 }}>
          <h1 style={{
            fontSize: "clamp(2rem, 5vw, 3rem)",
            fontWeight: 800,
            color: T.text,
            letterSpacing: "-0.04em",
            lineHeight: 1.0,
            marginBottom: 14,
          }}>
            {business?.name ?? "Your workspace"} is ready.
          </h1>

          {totalSaved > 0 ? (
            <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                padding: "6px 14px", borderRadius: 100,
                background: "rgba(200,164,78,0.08)",
                border: "1px solid rgba(200,164,78,0.2)",
              }}>
                <span style={{ fontSize: "0.9rem", fontWeight: 700, color: T.gold, letterSpacing: "-0.02em" }}>
                  ${totalSaved}/mo replaced
                </span>
              </div>
              {netSavings > 0 && (
                <span style={{ fontSize: "0.88rem", color: T.text3 }}>
                  ${netSavings}/mo net after Kovra
                </span>
              )}
            </div>
          ) : (
            <p style={{ fontSize: "0.95rem", color: T.text2 }}>
              Your workspace is configured and ready to use.
            </p>
          )}
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 40 }}>
          {[
            { label: "Clients", value: stats.contacts },
            { label: "Proposals", value: stats.proposals },
            { label: "Invoices", value: stats.invoices },
            { label: "Revenue", value: `$${stats.revenue.toLocaleString()}` },
          ].map(({ label, value }) => (
            <div key={label} style={{
              padding: "14px 16px", borderRadius: 10,
              background: T.bgEl, border: `1px solid ${T.border}`,
            }}>
              <p style={{ fontSize: "1.3rem", fontWeight: 800, color: T.text, letterSpacing: "-0.03em", marginBottom: 2 }}>{value}</p>
              <p style={{ fontSize: "0.72rem", color: T.text3 }}>{label}</p>
            </div>
          ))}
        </div>

        {/* Tools replaced — 2-col compact grid */}
        {replacedTools.length > 0 && (
          <div style={{ marginBottom: 44 }}>
            <p style={{ fontSize: "0.7rem", color: T.text3, letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: 12 }}>
              Replaced by Kovra
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {replacedTools.map(tool => {
                const map = TOOL_MAP[tool];
                return (
                  <div
                    key={tool}
                    style={{
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      padding: "10px 14px", borderRadius: 9,
                      background: T.bgEl, border: `1px solid ${T.border}`,
                      gap: 8,
                    }}
                  >
                    <span style={{ fontSize: "0.82rem", color: T.text3, textDecoration: "line-through", flexShrink: 0, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {tool}
                    </span>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                      <span style={{ fontSize: "0.8rem", fontWeight: 600, color: T.text, whiteSpace: "nowrap" }}>
                        {map?.kovra ?? "Kovra"}
                      </span>
                      {map && (
                        <Link
                          href={`/dashboard/${businessId}/${map.section}`}
                          style={{
                            fontSize: "0.68rem", color: T.gold, textDecoration: "none",
                            padding: "2px 8px", borderRadius: 4,
                            background: "rgba(200,164,78,0.08)",
                            border: "1px solid rgba(200,164,78,0.15)",
                            whiteSpace: "nowrap",
                          }}
                        >
                          Open
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Booking link */}
        {bookingUrl && (
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16,
            padding: "14px 18px", borderRadius: 10,
            background: T.bgEl, border: `1px solid ${T.border}`,
            marginBottom: 40, flexWrap: "wrap",
          }}>
            <div style={{ minWidth: 0, flex: 1 }}>
              <p style={{ fontSize: "0.7rem", color: T.text3, letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 3 }}>
                Your booking link
              </p>
              <p style={{ fontSize: "0.82rem", color: T.text2, fontFamily: "monospace", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {bookingUrl}
              </p>
            </div>
            <button
              onClick={copyBookingLink}
              style={{
                padding: "8px 16px", borderRadius: 7, fontSize: "0.8rem",
                fontWeight: 600, fontFamily: T.h, flexShrink: 0,
                border: `1px solid ${bookingCopied ? "rgba(34,197,94,0.3)" : T.border}`,
                background: bookingCopied ? "rgba(34,197,94,0.08)" : T.bgAlt,
                color: bookingCopied ? T.green : T.text2,
                cursor: "pointer", transition: "all 0.15s",
              }}
            >
              {bookingCopied ? "Copied" : "Copy link"}
            </button>
          </div>
        )}

        {/* Quick actions */}
        <div style={{ marginBottom: 40 }}>
          <p style={{ fontSize: "0.7rem", color: T.text3, letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: 12 }}>
            Start here
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {QUICK_ACTIONS.map(({ title, desc, icon, href, cta }) => (
              <div key={title} style={{
                padding: "18px 20px", borderRadius: 12,
                background: T.bgEl, border: `1px solid ${T.border}`,
              }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 8,
                  background: T.bgAlt,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  marginBottom: 12,
                }}>
                  <Icon type={icon} />
                </div>
                <p style={{ fontSize: "0.88rem", fontWeight: 600, color: T.text, marginBottom: 4 }}>{title}</p>
                <p style={{ fontSize: "0.76rem", color: T.text3, lineHeight: 1.55, marginBottom: 14 }}>{desc}</p>
                <Link
                  href={href(businessId as string)}
                  style={{
                    display: "inline-block",
                    padding: "7px 14px", borderRadius: 7,
                    fontSize: "0.78rem", fontWeight: 600, fontFamily: T.h,
                    textDecoration: "none",
                    background: CTA_GRAD, color: "#09090B",
                  }}
                >
                  {cta}
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Full dashboard */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "16px 20px", borderRadius: 12,
          border: `1px solid ${T.border}`,
          gap: 16,
        }}>
          <div>
            <p style={{ fontSize: "0.88rem", fontWeight: 600, color: T.text, marginBottom: 2 }}>Ready for the full picture?</p>
            <p style={{ fontSize: "0.78rem", color: T.text3 }}>CRM, lead engine, analytics, inbox — all in one dashboard.</p>
          </div>
          <Link
            href={`/dashboard/${businessId}`}
            style={{
              padding: "10px 22px", borderRadius: 9, fontSize: "0.85rem",
              fontWeight: 600, fontFamily: T.h, textDecoration: "none",
              background: CTA_GRAD, color: "#09090B",
              flexShrink: 0,
            }}
          >
            Open dashboard
          </Link>
        </div>

      </div>
    </div>
  );
}
