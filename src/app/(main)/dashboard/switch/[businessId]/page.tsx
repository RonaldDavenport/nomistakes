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

// Maps replaced tools to their Kovra equivalent
const TOOL_MAP: Record<string, { kovra: string; section: string }> = {
  "Apollo":              { kovra: "Lead Engine", section: "leads" },
  "Lemlist":             { kovra: "Cold email infra", section: "infrastructure" },
  "Instantly":           { kovra: "Cold email infra", section: "infrastructure" },
  "LinkedIn Sales Nav":  { kovra: "Unified inbox", section: "inbox" },
  "Calendly":            { kovra: "Booking link", section: "calls" },
  "Acuity":              { kovra: "Booking link", section: "calls" },
  "HoneyBook":           { kovra: "CRM + Proposals", section: "contacts" },
  "Dubsado":             { kovra: "CRM + Contracts", section: "proposals" },
  "DocuSign":            { kovra: "E-signatures on proposals", section: "proposals" },
  "PayPal":              { kovra: "Online invoicing", section: "invoices" },
  "FreshBooks":          { kovra: "Invoicing + payments", section: "invoices" },
  "Notion":              { kovra: "Projects + notes", section: "projects" },
  "Toggl":               { kovra: "Time tracking", section: "time" },
  "Pipedrive":           { kovra: "CRM + pipeline", section: "contacts" },
  "Typeform":            { kovra: "Intake forms", section: "calls" },
  "17hats":              { kovra: "Full business OS", section: "contacts" },
};

const QUICK_ACTIONS = [
  {
    title: "Copy your booking link",
    desc: "Share it anywhere — social bio, email, website. Clients pick a slot.",
    icon: "calendar",
    href: (bizId: string) => `/dashboard/${bizId}/calls`,
    cta: "Go to Calls",
  },
  {
    title: "Write your first proposal",
    desc: "Describe the project. Kovra writes it. Client signs on the page.",
    icon: "file",
    href: (bizId: string) => `/dashboard/${bizId}/proposals`,
    cta: "New proposal",
  },
  {
    title: "Send an invoice",
    desc: "Branded, paid by card or bank. Not PayPal.",
    icon: "invoice",
    href: (bizId: string) => `/dashboard/${bizId}/invoices`,
    cta: "New invoice",
  },
  {
    title: "Add your clients",
    desc: "Your CRM is ready. Import a list or add them one by one.",
    icon: "contacts",
    href: (bizId: string) => `/dashboard/${bizId}/contacts`,
    cta: "Add clients",
  },
];

function Icon({ type }: { type: string }) {
  const s = { width: 18, height: 18, color: T.gold };
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

function CheckIcon() {
  return (
    <svg width="12" height="12" fill="none" stroke={T.green} viewBox="0 0 24 24" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
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

  const bookingUrl = business?.deployed_url || business?.live_url
    ? `${business.deployed_url || business.live_url}/book`
    : null;

  function copyBookingLink() {
    if (!bookingUrl) return;
    navigator.clipboard.writeText(bookingUrl);
    setBookingCopied(true);
    setTimeout(() => setBookingCopied(false), 2000);
  }

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: T.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: 32, height: 32, borderRadius: "50%", border: `2px solid ${T.border}`, borderTop: `2px solid ${T.gold}`, animation: "spin 0.8s linear infinite" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const totalSaved = replacedTools.reduce((acc, tool) => {
    const costs: Record<string, number> = {
      Calendly: 16, HoneyBook: 40, Dubsado: 200, DocuSign: 25,
      Acuity: 20, PayPal: 0, FreshBooks: 17, Notion: 10,
      Toggl: 10, Pipedrive: 15, Typeform: 25, "17hats": 45,
    };
    return acc + (costs[tool] ?? 0);
  }, 0);

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
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
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
      </div>

      {/* Content */}
      <div style={{ maxWidth: 800, margin: "0 auto", padding: "40px 24px 80px" }}>

        {/* Welcome */}
        <div style={{ marginBottom: 40 }}>
          <p style={{ fontSize: "0.75rem", color: T.text3, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 6 }}>
            Migration complete
          </p>
          <h1 style={{ fontSize: "clamp(1.8rem, 4vw, 2.4rem)", fontWeight: 700, color: T.text, letterSpacing: "-0.03em", marginBottom: 8 }}>
            {business?.name ?? "Your workspace"} is ready.
          </h1>
          <p style={{ fontSize: "0.95rem", color: T.text2 }}>
            Here's everything that's set up and where to go next.
          </p>
        </div>

        {/* Savings banner */}
        {totalSaved > 0 && (
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "16px 20px", borderRadius: 12,
            background: "rgba(200,164,78,0.06)",
            border: "1px solid rgba(200,164,78,0.2)",
            marginBottom: 32,
          }}>
            <div>
              <p style={{ fontSize: "0.88rem", fontWeight: 600, color: T.gold, marginBottom: 2 }}>
                You replaced ${totalSaved}/mo in tools
              </p>
              <p style={{ fontSize: "0.78rem", color: T.text3 }}>
                That's ${totalSaved * 12}/year freed up. Kovra is ${79}/mo.
              </p>
            </div>
            <div style={{ textAlign: "right" }}>
              <p style={{ fontSize: "1.4rem", fontWeight: 800, color: T.gold, letterSpacing: "-0.03em" }}>
                ${totalSaved - 79}/mo
              </p>
              <p style={{ fontSize: "0.72rem", color: T.text3 }}>net savings</p>
            </div>
          </div>
        )}

        {/* Tools replaced */}
        {replacedTools.length > 0 && (
          <div style={{ marginBottom: 40 }}>
            <p style={{ fontSize: "0.72rem", color: T.text3, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 14 }}>
              Tools replaced by Kovra
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {replacedTools.map(tool => {
                const map = TOOL_MAP[tool];
                return (
                  <div
                    key={tool}
                    style={{
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      padding: "12px 16px", borderRadius: 10,
                      background: T.bgEl, border: `1px solid ${T.border}`,
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{
                        width: 24, height: 24, borderRadius: 6,
                        background: "rgba(239,68,68,0.08)",
                        border: "1px solid rgba(239,68,68,0.15)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        <svg width="10" height="10" fill="none" stroke="#EF4444" viewBox="0 0 24 24" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </div>
                      <span style={{ fontSize: "0.88rem", color: T.text2, textDecoration: "line-through" }}>{tool}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <svg width="14" height="14" fill="none" stroke={T.text3} viewBox="0 0 24 24" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <CheckIcon />
                        <span style={{ fontSize: "0.85rem", fontWeight: 600, color: T.text }}>
                          {map?.kovra ?? "Kovra"}
                        </span>
                      </div>
                      {map && (
                        <Link
                          href={`/dashboard/${businessId}/${map.section}`}
                          style={{
                            fontSize: "0.72rem", color: T.gold, textDecoration: "none",
                            padding: "3px 8px", borderRadius: 5,
                            background: "rgba(200,164,78,0.08)",
                            border: "1px solid rgba(200,164,78,0.15)",
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
            padding: "18px 20px", borderRadius: 12,
            background: T.bgEl, border: `1px solid ${T.border}`,
            marginBottom: 32,
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
              <div>
                <p style={{ fontSize: "0.78rem", color: T.text3, marginBottom: 4, letterSpacing: "0.04em", textTransform: "uppercase" }}>
                  Your booking link
                </p>
                <p style={{ fontSize: "0.88rem", color: T.text2, fontFamily: "monospace" }}>{bookingUrl}</p>
              </div>
              <button
                onClick={copyBookingLink}
                style={{
                  padding: "9px 18px", borderRadius: 8, fontSize: "0.82rem",
                  fontWeight: 600, fontFamily: T.h,
                  border: `1px solid ${bookingCopied ? "rgba(34,197,94,0.3)" : T.border}`,
                  background: bookingCopied ? "rgba(34,197,94,0.08)" : T.bgAlt,
                  color: bookingCopied ? T.green : T.text2,
                  cursor: "pointer", transition: "all 0.15s", flexShrink: 0,
                }}
              >
                {bookingCopied ? "Copied" : "Copy link"}
              </button>
            </div>
          </div>
        )}

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 40 }}>
          {[
            { label: "Clients", value: stats.contacts },
            { label: "Proposals", value: stats.proposals },
            { label: "Invoices", value: stats.invoices },
            { label: "Revenue", value: `$${stats.revenue.toLocaleString()}` },
          ].map(({ label, value }) => (
            <div key={label} style={{ padding: "16px 18px", borderRadius: 10, background: T.bgEl, border: `1px solid ${T.border}` }}>
              <p style={{ fontSize: "1.4rem", fontWeight: 800, color: T.text, letterSpacing: "-0.03em", marginBottom: 2 }}>{value}</p>
              <p style={{ fontSize: "0.75rem", color: T.text3 }}>{label}</p>
            </div>
          ))}
        </div>

        {/* Quick actions */}
        <div style={{ marginBottom: 40 }}>
          <p style={{ fontSize: "0.72rem", color: T.text3, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 14 }}>
            Start here
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {QUICK_ACTIONS.map(({ title, desc, icon, href, cta }) => (
              <div key={title} style={{ padding: "18px 20px", borderRadius: 12, background: T.bgEl, border: `1px solid ${T.border}` }}>
                <div style={{ width: 36, height: 36, borderRadius: 9, background: T.bgAlt, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
                  <Icon type={icon} />
                </div>
                <p style={{ fontSize: "0.9rem", fontWeight: 600, color: T.text, marginBottom: 4 }}>{title}</p>
                <p style={{ fontSize: "0.78rem", color: T.text3, lineHeight: 1.55, marginBottom: 14 }}>{desc}</p>
                <Link
                  href={href(businessId as string)}
                  style={{
                    display: "inline-block",
                    padding: "8px 16px", borderRadius: 7, fontSize: "0.8rem",
                    fontWeight: 600, fontFamily: T.h, textDecoration: "none",
                    background: CTA_GRAD, color: "#09090B",
                  }}
                >
                  {cta}
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Go to full dashboard */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "16px 20px", borderRadius: 12,
          border: `1px solid ${T.border}`,
        }}>
          <div>
            <p style={{ fontSize: "0.88rem", fontWeight: 600, color: T.text, marginBottom: 2 }}>Ready to dive in?</p>
            <p style={{ fontSize: "0.78rem", color: T.text3 }}>Your full dashboard has CRM, analytics, lead engine, and more.</p>
          </div>
          <Link
            href={`/dashboard/${businessId}`}
            style={{
              padding: "10px 22px", borderRadius: 9, fontSize: "0.85rem",
              fontWeight: 600, fontFamily: T.h, textDecoration: "none",
              border: `1px solid ${T.border}`, color: T.text2, background: T.bgEl,
              flexShrink: 0,
            }}
          >
            Full dashboard
          </Link>
        </div>

      </div>
    </div>
  );
}
