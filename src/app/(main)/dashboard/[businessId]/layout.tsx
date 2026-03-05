"use client";

import Link from "next/link";
import { usePathname, useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { BusinessProvider, useBusinessContext } from "@/components/dashboard/BusinessProvider";
import { BusinessSwitcher } from "@/components/dashboard/BusinessSwitcher";
import { getPlan, meetsRequiredPlan } from "@/lib/plans";
import { supabase } from "@/lib/supabase";
import { T, CTA_GRAD } from "@/lib/design-tokens";

/* ── Nav item definitions with plan gates ── */

type NavItem = { href: string; label: string; icon: string; minPlan: string };
type NavGroup = { label?: string; items: NavItem[] };

const buildNavGroups = (businessId: string): NavGroup[] => [
  {
    items: [
      { href: `/dashboard/${businessId}`, label: "Dashboard", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0h4", minPlan: "free" },
    ],
  },
  {
    label: "SELL",
    items: [
      { href: `/dashboard/${businessId}/leads`, label: "Leads", icon: "M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75", minPlan: "solo" },
      { href: `/dashboard/${businessId}/contacts`, label: "Clients", icon: "M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z", minPlan: "solo" },
      { href: `/dashboard/${businessId}/pipeline`, label: "Proposals", icon: "M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z", minPlan: "solo" },
      { href: `/dashboard/${businessId}/invoices`, label: "Invoices", icon: "M9 14.25l6-6m4.5-3.493V21.75l-3.75-1.5-3.75 1.5-3.75-1.5-3.75 1.5V4.757c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0c1.1.128 1.907 1.077 1.907 2.185zM9.75 9h.008v.008H9.75V9zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm4.125 4.5h.008v.008h-.008V13.5zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z", minPlan: "solo" },
      { href: `/dashboard/${businessId}/calls`, label: "Calendar", icon: "M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5", minPlan: "solo" },
    ],
  },
  {
    label: "MANAGE",
    items: [
      { href: `/dashboard/${businessId}/inbox`, label: "Inbox", icon: "M2.25 13.5h3.86a2.25 2.25 0 012.012 1.244l.256.512a2.25 2.25 0 002.013 1.244h3.218a2.25 2.25 0 002.013-1.244l.256-.512a2.25 2.25 0 012.013-1.244h3.859m-19.5.338V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18v-4.162c0-.224-.034-.447-.1-.661L19.24 5.338a2.25 2.25 0 00-2.15-1.588H6.911a2.25 2.25 0 00-2.15 1.588L2.35 13.177a2.25 2.25 0 00-.1.661z", minPlan: "solo" },
      { href: `/dashboard/${businessId}/emails`, label: "Email", icon: "M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75", minPlan: "solo" },
      { href: `/dashboard/${businessId}/contracts`, label: "Contracts", icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z", minPlan: "solo" },
      { href: `/dashboard/${businessId}/time`, label: "Time", icon: "M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z", minPlan: "solo" },
      { href: `/dashboard/${businessId}/team`, label: "Team", icon: "M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z", minPlan: "solo" },
      { href: `/dashboard/${businessId}/chat`, label: "AI Coach", icon: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z", minPlan: "free" },
    ],
  },
  {
    label: "GROW",
    items: [
      { href: `/dashboard/${businessId}/editor`, label: "Website", icon: "M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418", minPlan: "free" },
      { href: `/dashboard/${businessId}/analytics`, label: "Analytics", icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z", minPlan: "solo" },
      { href: `/dashboard/${businessId}/content`, label: "Blog", icon: "M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z", minPlan: "solo" },
      { href: `/dashboard/${businessId}/referrals`, label: "Referrals", icon: "M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z", minPlan: "solo" },
      { href: `/dashboard/${businessId}/ads`, label: "Marketing", icon: "M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z", minPlan: "scale" },
      { href: `/dashboard/${businessId}/automations`, label: "Automations", icon: "M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z", minPlan: "scale" },
    ],
  },
];

function TrialBadge({ trialEndsAt }: { trialEndsAt: Date }) {
  const daysLeft = Math.max(0, Math.ceil((trialEndsAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
  const urgent = daysLeft <= 3;
  return (
    <div style={{
      margin: "0 16px 8px",
      padding: "10px 12px",
      borderRadius: 8,
      background: urgent ? "rgba(239,68,68,0.08)" : "rgba(200,164,78,0.08)",
      border: `1px solid ${urgent ? "rgba(239,68,68,0.2)" : "rgba(200,164,78,0.2)"}`,
    }}>
      <p style={{ fontSize: 11, fontWeight: 600, color: urgent ? "#ef4444" : T.gold, margin: "0 0 2px", textTransform: "uppercase", letterSpacing: "0.06em" }}>
        Trial — {daysLeft}d left
      </p>
      <p style={{ fontSize: 11, color: T.text3, margin: 0 }}>Full Solo access until {trialEndsAt.toLocaleDateString("en-US", { month: "short", day: "numeric" })}</p>
    </div>
  );
}

function SidebarNav({ businessId }: { businessId: string }) {
  const pathname = usePathname();
  const { plan: planId, credits, loading, isOnTrial, trialEndsAt, business } = useBusinessContext();
  const plan = getPlan(planId);
  const isFreeNoTrial = planId === "free" && !isOnTrial;
  const hasExistingWebsite = business?.has_existing_website ?? false;

  if (loading) return null;

  // Filter groups/items by plan, and hide Website for users who indicated they have an existing site (unless they've since generated one)
  const hasSiteContent = !!(business?.site_content && Object.keys(business.site_content).length > 0);
  const groups = buildNavGroups(businessId)
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => {
        if (!meetsRequiredPlan(planId, item.minPlan)) return false;
        if (hasExistingWebsite && !hasSiteContent && item.href.endsWith("/editor")) return false;
        return true;
      }),
    }))
    .filter((group) => group.items.length > 0);

  return (
    <>
      <div style={{ padding: 16, borderBottom: `1px solid ${T.border}` }}>
        <BusinessSwitcher />
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "8px 16px", overflowY: "auto" }}>
        {groups.map((group, gi) => (
          <div key={gi} style={{ marginBottom: 4 }}>
            {group.label && (
              <p style={{
                fontSize: 10, fontWeight: 600, color: T.text3,
                textTransform: "uppercase", letterSpacing: "0.08em",
                padding: "12px 12px 4px", margin: 0,
              }}>
                {group.label}
              </p>
            )}
            {group.items.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  style={{
                    display: "flex", alignItems: "center", gap: 10,
                    padding: "8px 12px", borderRadius: 8,
                    fontSize: 13, fontWeight: active ? 600 : 400,
                    textDecoration: "none", marginBottom: 1,
                    transition: "all 0.15s",
                    background: active ? T.goldDim : "transparent",
                    color: active ? T.gold : T.text3,
                    borderLeft: active ? `2px solid ${T.gold}` : "2px solid transparent",
                  }}
                  onMouseEnter={(e) => {
                    if (!active) {
                      (e.currentTarget as HTMLElement).style.color = T.text2;
                      (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.03)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!active) {
                      (e.currentTarget as HTMLElement).style.color = T.text3;
                      (e.currentTarget as HTMLElement).style.background = "transparent";
                    }
                  }}
                >
                  <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5} style={{ flexShrink: 0 }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                  </svg>
                  {item.label}
                </Link>
              );
            })}
          </div>
        ))}

        {/* Existing-website users: offer to build a new site */}
        {hasExistingWebsite && !hasSiteContent && (
          <div style={{ marginTop: 8, padding: "12px", borderRadius: 8, border: `1px dashed ${T.border}`, background: "rgba(255,255,255,0.01)" }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: T.text3, margin: "0 0 4px", textTransform: "uppercase", letterSpacing: "0.06em" }}>Want a new website?</p>
            <p style={{ fontSize: 11, color: T.text3, margin: "0 0 8px" }}>We can build you one from scratch — AI-generated, deploy-ready.</p>
            <Link
              href={`/dashboard/${businessId}/editor`}
              style={{ fontSize: 11, fontWeight: 600, color: T.gold, textDecoration: "none" }}
            >
              Build a site →
            </Link>
          </div>
        )}

        {/* Free-user teaser: show what's locked */}
        {isFreeNoTrial && (
          <div style={{ marginTop: 8, padding: "12px", borderRadius: 8, border: `1px dashed ${T.border}`, background: "rgba(255,255,255,0.01)" }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: T.text3, margin: "0 0 8px", textTransform: "uppercase", letterSpacing: "0.06em" }}>Unlock on Solo</p>
            {["Leads & CRM", "Invoices", "Inbox", "Email sequences", "Contracts", "Analytics", "Blog, Referrals"].map((label) => (
              <div key={label} style={{ display: "flex", alignItems: "center", gap: 6, padding: "3px 0" }}>
                <svg width="12" height="12" fill="none" stroke={T.text3} strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                </svg>
                <span style={{ fontSize: 12, color: T.text3 }}>{label}</span>
              </div>
            ))}
          </div>
        )}
      </nav>

      {/* Trial countdown badge */}
      {isOnTrial && trialEndsAt && <TrialBadge trialEndsAt={trialEndsAt} />}

      {/* Credits display (paid users only) */}
      {plan.id !== "free" && !isOnTrial && (
        <div style={{ padding: "0 16px 8px" }}>
          <div
            style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "8px 12px", borderRadius: 8,
              background: T.goldDim, border: `1px solid rgba(200,164,78,0.12)`,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={T.gold} strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
              </svg>
              <span style={{ fontSize: 12, fontWeight: 500, color: T.text2 }}>{credits} credits</span>
            </div>
            <Link
              href={`/dashboard/${businessId}/settings?tab=credits`}
              style={{ fontSize: 10, fontWeight: 500, color: T.gold, textDecoration: "none" }}
            >
              Buy more
            </Link>
          </div>
        </div>
      )}

      {/* Bottom plan card */}
      <div style={{ padding: 16, borderTop: `1px solid ${T.border}` }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 32, height: 32, borderRadius: "50%",
                display: "flex", alignItems: "center", justifyContent: "center",
                background: CTA_GRAD, color: "#09090B",
                fontSize: 12, fontWeight: 700, flexShrink: 0,
              }}
            >
              K
            </div>
            <div>
              <p style={{ fontSize: 13, fontWeight: 500, color: T.text, margin: 0 }}>
                {isOnTrial ? "Solo (trial)" : `${plan.name} Plan`}
              </p>
              <Link
                href="/dashboard/account"
                style={{ fontSize: 11, color: T.text3, textDecoration: "none" }}
              >
                Account
              </Link>
            </div>
          </div>
          {/* Upgrade button for free users (no trial) */}
          {isFreeNoTrial && (
            <button
              onClick={async () => {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) return;
                const res = await fetch("/api/stripe/checkout", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ planId: "solo", userId: user.id, email: user.email }),
                });
                const { url } = await res.json();
                if (url) window.location.href = url;
              }}
              style={{
                fontSize: 11, fontWeight: 600, padding: "6px 12px",
                borderRadius: 6, background: CTA_GRAD,
                border: "none", color: "#09090B", cursor: "pointer",
              }}
            >
              Upgrade
            </button>
          )}
          {/* Upgrade button for trial users nearing expiry */}
          {isOnTrial && trialEndsAt && Math.ceil((trialEndsAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24)) <= 7 && (
            <button
              onClick={async () => {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) return;
                const res = await fetch("/api/stripe/checkout", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ planId: "solo", userId: user.id, email: user.email }),
                });
                const { url } = await res.json();
                if (url) window.location.href = url;
              }}
              style={{
                fontSize: 11, fontWeight: 600, padding: "6px 12px",
                borderRadius: 6, background: CTA_GRAD,
                border: "none", color: "#09090B", cursor: "pointer",
              }}
            >
              Subscribe
            </button>
          )}
        </div>
      </div>
    </>
  );
}

export default function BusinessLayout({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const pathname = usePathname();
  const businessId = params.businessId as string;
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  return (
    <BusinessProvider businessId={businessId}>
      <style>{`[data-dashboard-header] { display: none !important; }`}</style>
      <div style={{ display: "flex", minHeight: "100vh" }}>
        {/* Mobile overlay */}
        {sidebarOpen && (
          <div
            style={{ position: "fixed", inset: 0, zIndex: 40, background: "rgba(0,0,0,0.6)" }}
            className="lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 z-50 flex flex-col shrink-0 transform transition-transform duration-200 ease-out lg:relative lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
          style={{ width: 240, background: T.bgEl, borderRight: `1px solid ${T.border}` }}
        >
          <div style={{ padding: "20px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: `1px solid ${T.border}` }}>
            <Link href="/dashboard" style={{ fontSize: 20, fontWeight: 700, color: T.text, letterSpacing: "-0.02em", textDecoration: "none" }}>
              kovra
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden"
              style={{ width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 8, background: "none", border: "none", color: T.text3, cursor: "pointer" }}
            >
              <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <SidebarNav businessId={businessId} />
        </aside>

        {/* Main content */}
        <main style={{ flex: 1, overflowY: "auto", minWidth: 0, background: T.bg }}>
          {/* Mobile top bar */}
          <div
            className="flex items-center lg:hidden"
            style={{ position: "sticky", top: 0, zIndex: 30, padding: "0 16px", height: 56, gap: 12, borderBottom: `1px solid ${T.border}`, background: "rgba(9,9,11,0.85)", backdropFilter: "blur(20px)" }}
          >
            <button
              onClick={() => setSidebarOpen(true)}
              style={{ width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 8, background: "none", border: "none", color: T.text2, cursor: "pointer" }}
            >
              <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5" />
              </svg>
            </button>
            <Link href="/dashboard" style={{ fontSize: 20, fontWeight: 700, color: T.text, letterSpacing: "-0.02em", textDecoration: "none" }}>
              kovra
            </Link>
          </div>
          {children}
        </main>
      </div>
    </BusinessProvider>
  );
}
