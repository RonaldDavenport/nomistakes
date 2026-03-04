"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useBusinessContext } from "@/components/dashboard/BusinessProvider";
import { T, CTA_GRAD } from "@/lib/design-tokens";
import { getChecklistForSubtype } from "@/lib/checklist-data";

/* ── Cobra Mark ── */

function CobraMark({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" style={{ flexShrink: 0 }}>
      <path
        d="M16 2C10 2 6 6 4 10c-1 2-1.5 4.5-1 7 .5 2 1.5 3.5 3 4.5 1 .7 2.2 1 3.5.8C11 22 12 21 12.5 19.5c.3-1 .2-2-.2-3-.5-1-1.3-1.8-2.3-2.2-.5-.2-.5-.8 0-1C12 12 14 11 16 11s4 1 6 2.3c.5.3.5.8 0 1-1 .4-1.8 1.2-2.3 2.2-.4 1-.5 2-.2 3 .5 1.5 1.5 2.5 3 2.8 1.3.2 2.5-.1 3.5-.8 1.5-1 2.5-2.5 3-4.5.5-2.5 0-5-1-7C26 6 22 2 16 2z"
        fill={T.gold}
      />
      <circle cx="11.5" cy="15" r="1.2" fill={T.bg} />
      <circle cx="20.5" cy="15" r="1.2" fill={T.bg} />
    </svg>
  );
}

/* ── Thin rule ── */

function Rule() {
  return <div style={{ height: 1, background: T.border, margin: "32px 0" }} />;
}

/* ── Phase detection ── */

type DashPhase = "setup" | "get_clients" | "active";

function detectPhase(business: {
  onboarding_completed: boolean;
  stripe_account_id: string | null;
  deployed_url: string;
  live_url: string;
}, contactCount: number, invoiceCount: number): DashPhase {
  const hasStripe = !!business.stripe_account_id;
  const hasSite = !!(business.deployed_url || business.live_url);

  // Active: has contacts and at least one invoice (they're doing business)
  if (contactCount >= 1 && invoiceCount >= 1) return "active";

  // Get Clients: site is live + stripe connected, but no real clients yet
  if (hasSite && hasStripe) return "get_clients";

  // Setup: still setting up fundamentals
  return "setup";
}

/* ══════════════════════════════════════════
   SETUP PHASE — checklist + quick actions
   ══════════════════════════════════════════ */

function SetupDashboard({ businessId, business }: { businessId: string; business: Record<string, unknown> }) {
  const subtype = (business.subtype as string) || "freelance";
  const tasks = getChecklistForSubtype(subtype);
  const phase1 = tasks.filter((t) => t.phase === 1);

  const checks = {
    site: !!(business.deployed_url || business.live_url),
    stripe: !!business.stripe_account_id,
    booking: !!(business.availability_settings && Object.keys(business.availability_settings as object).length > 0),
  };

  const completedSteps = [checks.site, checks.stripe, checks.booking].filter(Boolean).length;
  const totalSteps = 3 + phase1.length;
  const pct = Math.round((completedSteps / totalSteps) * 100);

  return (
    <>
      <div style={{ marginBottom: 4 }}>
        <p style={{ fontSize: 13, color: T.text3, marginBottom: 2 }}>
          {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
        </p>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: T.text, letterSpacing: "-0.02em", margin: 0 }}>
          Let&apos;s get you set up
        </h1>
        <p style={{ fontSize: 13, color: T.text2, marginTop: 6 }}>
          Complete these steps to start getting clients.
        </p>
      </div>

      <Rule />

      {/* Progress */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 500, color: T.text }}>{completedSteps} of {totalSteps} complete</span>
          <span style={{ fontSize: 13, color: T.text3 }}>{pct}%</span>
        </div>
        <div style={{ height: 4, background: T.border, borderRadius: 2 }}>
          <div style={{ height: 4, background: T.gold, borderRadius: 2, width: `${pct}%`, transition: "width 0.3s" }} />
        </div>
      </div>

      {/* Core setup steps */}
      {[
        {
          done: checks.site,
          title: "Review your live site",
          desc: "Check your copy, services, and pricing. Make it yours.",
          href: `/dashboard/${businessId}/editor`,
          action: "Open editor",
        },
        {
          done: checks.stripe,
          title: "Connect payments",
          desc: "Link Stripe so clients can pay you directly.",
          href: `/dashboard/${businessId}/settings?tab=stripe`,
          action: "Connect Stripe",
        },
        {
          done: checks.booking,
          title: "Set up booking availability",
          desc: "Let clients book discovery calls on your schedule.",
          href: `/dashboard/${businessId}/calls`,
          action: "Set up calls",
        },
      ].map((step, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 0", borderBottom: `1px solid ${T.border}` }}>
          <div style={{
            width: 20, height: 20, borderRadius: 5, flexShrink: 0,
            border: `1.5px solid ${step.done ? T.gold : T.border}`,
            background: step.done ? T.goldDim : "transparent",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: T.gold, fontSize: 11,
          }}>
            {step.done ? "✓" : ""}
          </div>
          <div style={{ flex: 1 }}>
            <span style={{ fontSize: 14, fontWeight: 500, color: step.done ? T.text3 : T.text, textDecoration: step.done ? "line-through" : "none" }}>{step.title}</span>
            {!step.done && <p style={{ fontSize: 12, color: T.text3, marginTop: 2 }}>{step.desc}</p>}
          </div>
          {!step.done && (
            <Link href={step.href} style={{ fontSize: 12, fontWeight: 600, color: T.gold, textDecoration: "none", whiteSpace: "nowrap" }}>
              {step.action}
            </Link>
          )}
        </div>
      ))}

      <Rule />

      {/* Phase 1 checklist tasks */}
      <h2 style={{ fontSize: 14, fontWeight: 600, color: T.text, margin: "0 0 16px" }}>
        {phase1[0]?.phaseTitle || "Review & Refine"}
      </h2>
      {phase1.map((task) => (
        <div key={task.id} style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "10px 0", borderBottom: `1px solid ${T.border}` }}>
          <div style={{ width: 18, height: 18, borderRadius: 4, border: `1.5px solid ${T.border}`, flexShrink: 0, marginTop: 1 }} />
          <div style={{ flex: 1 }}>
            <span style={{ fontSize: 13, fontWeight: 500, color: T.text }}>{task.title}</span>
            <p style={{ fontSize: 12, color: T.text3, marginTop: 2 }}>{task.description}</p>
          </div>
          {task.aiCapability !== "manual" && (
            <span style={{ fontSize: 10, color: T.gold, padding: "2px 6px", borderRadius: 4, background: T.goldDim, flexShrink: 0, marginTop: 2 }}>
              AI {task.aiCapability}
            </span>
          )}
        </div>
      ))}

      <Rule />

      {/* AI Coach nudge */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
        <CobraMark size={18} />
        <p style={{ fontSize: 13, color: T.text2, lineHeight: 1.55, margin: 0 }}>
          Your site is live — now let&apos;s make it yours. Review your copy, connect payments, and set up booking.{" "}
          <Link href={`/dashboard/${businessId}/chat`} style={{ color: T.gold, textDecoration: "none", fontWeight: 500 }}>
            Ask me anything
          </Link>
        </p>
      </div>
    </>
  );
}

/* ══════════════════════════════════════════
   GET CLIENTS PHASE — outreach + lead gen
   ══════════════════════════════════════════ */

function GetClientsDashboard({ businessId, business }: { businessId: string; business: Record<string, unknown> }) {
  const subtype = (business.subtype as string) || "freelance";
  const tasks = getChecklistForSubtype(subtype);
  const phase2 = tasks.filter((t) => t.phase === 2);
  const phase3 = tasks.filter((t) => t.phase === 3);

  const quickActions = [
    { label: "Share booking link", desc: "Send clients your scheduling page", href: `/dashboard/${businessId}/calls`, icon: "M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" },
    { label: "Write a blog post", desc: "SEO content drives organic traffic", href: `/dashboard/${businessId}/content`, icon: "M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" },
    { label: "Create an ad", desc: "Get in front of your audience", href: `/dashboard/${businessId}/ads`, icon: "M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" },
    { label: "Add a contact", desc: "Start building your client list", href: `/dashboard/${businessId}/contacts`, icon: "M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" },
  ];

  return (
    <>
      <div style={{ marginBottom: 4 }}>
        <p style={{ fontSize: 13, color: T.text3, marginBottom: 2 }}>
          {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
        </p>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: T.text, letterSpacing: "-0.02em", margin: 0 }}>
          Time to get clients
        </h1>
        <p style={{ fontSize: 13, color: T.text2, marginTop: 6 }}>
          Your business is set up. Now let&apos;s fill your pipeline.
        </p>
      </div>

      <Rule />

      {/* Quick actions */}
      <h2 style={{ fontSize: 14, fontWeight: 600, color: T.text, margin: "0 0 16px" }}>Quick actions</h2>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 0 }}>
        {quickActions.map((a) => (
          <Link
            key={a.label}
            href={a.href}
            style={{
              display: "flex", alignItems: "center", gap: 12,
              padding: "14px 16px", borderRadius: 8,
              border: `1px solid ${T.border}`, textDecoration: "none",
              transition: "border-color 0.15s",
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = T.gold; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = T.border; }}
          >
            <svg width="18" height="18" fill="none" stroke={T.gold} viewBox="0 0 24 24" strokeWidth={1.5} style={{ flexShrink: 0 }}>
              <path strokeLinecap="round" strokeLinejoin="round" d={a.icon} />
            </svg>
            <div>
              <span style={{ fontSize: 13, fontWeight: 600, color: T.text, display: "block" }}>{a.label}</span>
              <span style={{ fontSize: 11, color: T.text3 }}>{a.desc}</span>
            </div>
          </Link>
        ))}
      </div>

      <Rule />

      {/* Build proof tasks */}
      {phase2.length > 0 && (
        <>
          <h2 style={{ fontSize: 14, fontWeight: 600, color: T.text, margin: "0 0 16px" }}>
            {phase2[0].phaseTitle}
          </h2>
          {phase2.map((task) => (
            <div key={task.id} style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "10px 0", borderBottom: `1px solid ${T.border}` }}>
              <div style={{ width: 18, height: 18, borderRadius: 4, border: `1.5px solid ${T.border}`, flexShrink: 0, marginTop: 1 }} />
              <div style={{ flex: 1 }}>
                <span style={{ fontSize: 13, fontWeight: 500, color: T.text }}>{task.title}</span>
                <p style={{ fontSize: 12, color: T.text3, marginTop: 2 }}>{task.description}</p>
              </div>
              {task.aiCapability !== "manual" && (
                <span style={{ fontSize: 10, color: T.gold, padding: "2px 6px", borderRadius: 4, background: T.goldDim, flexShrink: 0, marginTop: 2 }}>
                  AI {task.aiCapability}
                </span>
              )}
            </div>
          ))}
          <Rule />
        </>
      )}

      {/* Outreach tasks */}
      {phase3.length > 0 && (
        <>
          <h2 style={{ fontSize: 14, fontWeight: 600, color: T.text, margin: "0 0 16px" }}>
            {phase3[0].phaseTitle}
          </h2>
          {phase3.slice(0, 4).map((task) => (
            <div key={task.id} style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "10px 0", borderBottom: `1px solid ${T.border}` }}>
              <div style={{ width: 18, height: 18, borderRadius: 4, border: `1.5px solid ${T.border}`, flexShrink: 0, marginTop: 1 }} />
              <div style={{ flex: 1 }}>
                <span style={{ fontSize: 13, fontWeight: 500, color: T.text }}>{task.title}</span>
                <p style={{ fontSize: 12, color: T.text3, marginTop: 2 }}>{task.description}</p>
              </div>
              {task.aiCapability !== "manual" && (
                <span style={{ fontSize: 10, color: T.gold, padding: "2px 6px", borderRadius: 4, background: T.goldDim, flexShrink: 0, marginTop: 2 }}>
                  AI {task.aiCapability}
                </span>
              )}
            </div>
          ))}
          {phase3.length > 4 && (
            <Link
              href={`/dashboard/${businessId}/checklist`}
              style={{ display: "block", fontSize: 12, color: T.gold, textDecoration: "none", fontWeight: 500, padding: "12px 0" }}
            >
              View all {phase3.length} outreach tasks
            </Link>
          )}
          <Rule />
        </>
      )}

      {/* AI Coach nudge */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
        <CobraMark size={18} />
        <p style={{ fontSize: 13, color: T.text2, lineHeight: 1.55, margin: 0 }}>
          Your site is live and payments are connected. Now focus on getting visible — write a blog post, share your booking link, or create your first ad.{" "}
          <Link href={`/dashboard/${businessId}/chat`} style={{ color: T.gold, textDecoration: "none", fontWeight: 500 }}>
            Need a strategy?
          </Link>
        </p>
      </div>
    </>
  );
}

/* ══════════════════════════════════════════
   ACTIVE PHASE — full operational dashboard
   ══════════════════════════════════════════ */

interface DashStats {
  revenue: number;
  clientCount: number;
  proposalCount: number;
  invoicesDue: number;
  pipelineValue: number;
  invoicesDueAmount: number;
}

interface DashActivity {
  color: string;
  title: string;
  desc: string;
  amount?: string;
  time: string;
}

interface DashProposal {
  id: string;
  title: string;
  contact_name: string;
  total_cents: number;
  status: string;
}

interface DashUpcoming {
  title: string;
  time: string;
}

function ActiveDashboard({
  businessId,
  stats,
  activities,
  recentProposals,
  upcomingCalls,
}: {
  businessId: string;
  stats: DashStats;
  activities: DashActivity[];
  recentProposals: DashProposal[];
  upcomingCalls: DashUpcoming[];
}) {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  /* Revenue chart — placeholder data for now */
  const months = ["Sep", "Oct", "Nov", "Dec", "Jan", "Feb"];
  const revenue = [6200, 8100, 7400, 9800, 11200, stats.revenue || 12480];
  const maxRev = Math.max(...revenue) * 1.12;
  const chartH = 150;

  const STATUS_COLORS: Record<string, string> = {
    accepted: T.green, viewed: T.blue, sent: T.gold, draft: T.text3,
  };

  function fmt(cents: number) {
    return `$${(cents / 100).toFixed(2).replace(/\.00$/, "").replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
  }

  return (
    <>
      {/* ── Header ── */}
      <div style={{ marginBottom: 4 }}>
        <p style={{ fontSize: 13, color: T.text3, marginBottom: 2 }}>
          {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
        </p>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: T.text, letterSpacing: "-0.02em", margin: 0 }}>
          {greeting}
        </h1>
      </div>

      <Rule />

      {/* ── Stats ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 40, marginBottom: 0 }}>
        {[
          { label: "Revenue", value: fmt(stats.revenue), sub: "this month" },
          { label: "Clients", value: String(stats.clientCount), sub: "total" },
          { label: "Proposals", value: String(stats.proposalCount), sub: stats.pipelineValue > 0 ? fmt(stats.pipelineValue) + " pipeline" : "open" },
          { label: "Invoices", value: String(stats.invoicesDue), sub: stats.invoicesDueAmount > 0 ? fmt(stats.invoicesDueAmount) + " due" : "all paid" },
        ].map((s) => (
          <div key={s.label}>
            <p style={{ fontSize: 11, fontWeight: 600, color: T.text3, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>
              {s.label}
            </p>
            <p style={{ fontSize: 28, fontWeight: 700, color: T.text, letterSpacing: "-0.03em", lineHeight: 1, marginBottom: 8, fontVariantNumeric: "tabular-nums" }}>
              {s.value}
            </p>
            <span style={{ fontSize: 12, color: T.text3 }}>{s.sub}</span>
          </div>
        ))}
      </div>

      <Rule />

      {/* ── Revenue ── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 24 }}>
        <h2 style={{ fontSize: 14, fontWeight: 600, color: T.text, margin: 0 }}>Revenue</h2>
        <span style={{ fontSize: 12, color: T.text3 }}>Last 6 months</span>
      </div>

      <div style={{ display: "flex", alignItems: "flex-end", gap: 10, height: chartH }}>
        {revenue.map((v, i) => {
          const barH = (v / maxRev) * chartH;
          const isLast = i === revenue.length - 1;
          return (
            <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: isLast ? T.gold : T.text3, fontVariantNumeric: "tabular-nums" }}>
                ${(v / 1000).toFixed(1)}k
              </span>
              <div style={{
                width: "100%", height: barH,
                background: isLast ? T.gold : "rgba(255,255,255,0.06)",
                borderRadius: "5px 5px 2px 2px", transition: "height 0.5s ease",
              }} />
            </div>
          );
        })}
      </div>
      <div style={{ display: "flex", marginTop: 10 }}>
        {months.map((m, i) => (
          <span key={i} style={{ flex: 1, textAlign: "center", fontSize: 11, color: T.text3 }}>{m}</span>
        ))}
      </div>

      <Rule />

      {/* ── Upcoming ── */}
      {upcomingCalls.length > 0 && (
        <>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 16 }}>
            <h2 style={{ fontSize: 14, fontWeight: 600, color: T.text, margin: 0 }}>Upcoming</h2>
            <Link href={`/dashboard/${businessId}/calls`} style={{ fontSize: 12, color: T.gold, textDecoration: "none", fontWeight: 500 }}>
              Calendar
            </Link>
          </div>
          {upcomingCalls.map((e, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: i < upcomingCalls.length - 1 ? `1px solid ${T.border}` : "none" }}>
              <span style={{ fontSize: 13, fontWeight: 500, color: T.text }}>{e.title}</span>
              <span style={{ fontSize: 12, color: T.text3, flexShrink: 0, marginLeft: 16, whiteSpace: "nowrap" }}>{e.time}</span>
            </div>
          ))}
          <Rule />
        </>
      )}

      {/* ── Activity ── */}
      {activities.length > 0 && (
        <>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 16 }}>
            <h2 style={{ fontSize: 14, fontWeight: 600, color: T.text, margin: 0 }}>Recent activity</h2>
            <Link href={`/dashboard/${businessId}/analytics`} style={{ fontSize: 12, color: T.gold, textDecoration: "none", fontWeight: 500 }}>
              View all
            </Link>
          </div>
          {activities.map((a, i) => (
            <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "10px 0", borderBottom: i < activities.length - 1 ? `1px solid ${T.border}` : "none" }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: a.color, marginTop: 6, flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <span style={{ fontSize: 13, fontWeight: 500, color: T.text }}>{a.title}</span>
                <p style={{ fontSize: 12, color: T.text2, margin: "1px 0 0" }}>{a.desc}</p>
              </div>
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                {a.amount && (
                  <span style={{ fontSize: 13, fontWeight: 600, color: a.amount.startsWith("+") ? T.green : T.text, fontVariantNumeric: "tabular-nums" }}>
                    {a.amount}
                  </span>
                )}
                <p style={{ fontSize: 11, color: T.text3, margin: a.amount ? "1px 0 0" : 0 }}>{a.time}</p>
              </div>
            </div>
          ))}
          <Rule />
        </>
      )}

      {/* ── Proposals ── */}
      {recentProposals.length > 0 && (
        <>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 16 }}>
            <h2 style={{ fontSize: 14, fontWeight: 600, color: T.text, margin: 0 }}>Proposals</h2>
            <Link href={`/dashboard/${businessId}/pipeline`} style={{ fontSize: 12, color: T.gold, textDecoration: "none", fontWeight: 500 }}>
              View all
            </Link>
          </div>
          {recentProposals.map((p, i) => (
            <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: i < recentProposals.length - 1 ? `1px solid ${T.border}` : "none" }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <span style={{ fontSize: 13, fontWeight: 500, color: T.text }}>{p.contact_name}</span>
                <span style={{ fontSize: 12, color: T.text3, marginLeft: 8 }}>{p.title}</span>
              </div>
              <span style={{ fontSize: 13, fontWeight: 600, color: T.text, fontVariantNumeric: "tabular-nums", flexShrink: 0 }}>
                {fmt(p.total_cents)}
              </span>
              <span style={{ fontSize: 12, fontWeight: 500, color: STATUS_COLORS[p.status] || T.text3, flexShrink: 0, minWidth: 56, textAlign: "right", textTransform: "capitalize" }}>
                {p.status}
              </span>
            </div>
          ))}
          <Rule />
        </>
      )}

      {/* ── AI Coach ── */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
        <CobraMark size={18} />
        <p style={{ fontSize: 13, color: T.text2, lineHeight: 1.55, margin: 0 }}>
          {stats.invoicesDue > 0
            ? `You have ${stats.invoicesDue} outstanding invoice${stats.invoicesDue > 1 ? "s" : ""}. `
            : "All invoices are paid up. "}
          <Link href={`/dashboard/${businessId}/chat`} style={{ color: T.gold, textDecoration: "none", fontWeight: 500 }}>
            Ask me anything
          </Link>
        </p>
      </div>
    </>
  );
}

/* ════════════════════════════════════════
   MAIN DASHBOARD — phase router
   ════════════════════════════════════════ */

export default function BusinessHome() {
  const params = useParams();
  const businessId = params.businessId as string;
  const { business, loading } = useBusinessContext();
  const [loaded, setLoaded] = useState(false);
  const [phase, setPhase] = useState<DashPhase>("setup");
  const [dashData, setDashData] = useState<{
    contactCount: number;
    invoiceCount: number;
    stats: DashStats;
    activities: DashActivity[];
    recentProposals: DashProposal[];
    upcomingCalls: DashUpcoming[];
  } | null>(null);

  const fetchDashData = useCallback(async () => {
    try {
      const [contactsRes, invoicesRes, proposalsRes, callsRes, activityRes] = await Promise.all([
        fetch(`/api/contacts?businessId=${businessId}&limit=1`),
        fetch(`/api/invoices?businessId=${businessId}`),
        fetch(`/api/proposals?businessId=${businessId}`),
        fetch(`/api/discovery-calls?businessId=${businessId}&status=scheduled`),
        fetch(`/api/contacts/activity?businessId=${businessId}&limit=5`),
      ]);

      const [contactsData, invoicesData, proposalsData, callsData, activityData] = await Promise.all([
        contactsRes.ok ? contactsRes.json() : { contacts: [] },
        invoicesRes.ok ? invoicesRes.json() : { invoices: [] },
        proposalsRes.ok ? proposalsRes.json() : { proposals: [] },
        callsRes.ok ? callsRes.json() : { calls: [] },
        activityRes.ok ? activityRes.json() : { activities: [] },
      ]);

      const contacts = contactsData.contacts || [];
      const invoices = invoicesData.invoices || [];
      const proposals = proposalsData.proposals || [];
      const calls = callsData.calls || [];
      const recentActivity = activityData.activities || [];

      const paidInvoices = invoices.filter((i: { status: string; total_cents: number }) => i.status === "paid");
      const unpaidInvoices = invoices.filter((i: { status: string }) => ["sent", "viewed", "overdue"].includes(i.status));
      const openProposals = proposals.filter((p: { status: string }) => ["sent", "viewed"].includes(p.status));
      const revenueThisMonth = paidInvoices.reduce((s: number, i: { total_cents: number }) => s + i.total_cents, 0);
      const pipelineValue = openProposals.reduce((s: number, p: { pricing?: { total_cents?: number } }) => s + (p.pricing?.total_cents || 0), 0);
      const invoicesDueAmount = unpaidInvoices.reduce((s: number, i: { total_cents: number }) => s + i.total_cents, 0);

      const activityColors: Record<string, string> = {
        email_sent: T.blue, call_booked: T.green, proposal_sent: T.gold,
        payment_received: T.green, note_added: T.text3, stage_changed: T.orange,
        proposal_viewed: T.blue, proposal_accepted: T.green,
      };

      const mappedActivities: DashActivity[] = recentActivity.slice(0, 5).map((a: { type: string; title: string; description: string; created_at: string }) => ({
        color: activityColors[a.type] || T.text3,
        title: a.title,
        desc: a.description || "",
        time: timeAgo(a.created_at),
      }));

      const mappedProposals: DashProposal[] = proposals.slice(0, 5).map((p: { id: string; title: string; contacts?: { name: string } | null; pricing?: { total_cents?: number }; status: string }) => ({
        id: p.id,
        title: p.title,
        contact_name: p.contacts?.name || "Unknown",
        total_cents: p.pricing?.total_cents || 0,
        status: p.status,
      }));

      const mappedCalls: DashUpcoming[] = calls.slice(0, 3).map((c: { name: string; scheduled_at: string }) => ({
        title: `Discovery call — ${c.name}`,
        time: new Date(c.scheduled_at).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }),
      }));

      setDashData({
        contactCount: contacts.length,
        invoiceCount: invoices.length,
        stats: {
          revenue: revenueThisMonth,
          clientCount: contacts.length,
          proposalCount: openProposals.length,
          invoicesDue: unpaidInvoices.length,
          pipelineValue,
          invoicesDueAmount,
        },
        activities: mappedActivities,
        recentProposals: mappedProposals,
        upcomingCalls: mappedCalls,
      });
    } catch {
      // If APIs fail (no tables yet, etc.), default to setup
      setDashData({
        contactCount: 0, invoiceCount: 0,
        stats: { revenue: 0, clientCount: 0, proposalCount: 0, invoicesDue: 0, pipelineValue: 0, invoicesDueAmount: 0 },
        activities: [], recentProposals: [], upcomingCalls: [],
      });
    }
  }, [businessId]);

  useEffect(() => { setLoaded(true); }, []);
  useEffect(() => { fetchDashData(); }, [fetchDashData]);

  useEffect(() => {
    if (business && dashData) {
      setPhase(detectPhase(
        business as { onboarding_completed: boolean; stripe_account_id: string | null; deployed_url: string; live_url: string },
        dashData.contactCount,
        dashData.invoiceCount,
      ));
    }
  }, [business, dashData]);

  if (loading || !business) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "80vh" }}>
        <div style={{
          width: 32, height: 32, borderRadius: "50%",
          border: `2px solid ${T.gold}`, borderTopColor: "transparent",
          animation: "spin 1s linear infinite",
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div
      style={{
        padding: "32px 40px 80px",
        opacity: loaded ? 1 : 0, transform: loaded ? "none" : "translateY(4px)",
        transition: "all 0.3s ease",
      }}
    >
      {phase === "setup" && (
        <SetupDashboard businessId={businessId} business={business as unknown as Record<string, unknown>} />
      )}
      {phase === "get_clients" && (
        <GetClientsDashboard businessId={businessId} business={business as unknown as Record<string, unknown>} />
      )}
      {phase === "active" && dashData && (
        <ActiveDashboard
          businessId={businessId}
          stats={dashData.stats}
          activities={dashData.activities}
          recentProposals={dashData.recentProposals}
          upcomingCalls={dashData.upcomingCalls}
        />
      )}
    </div>
  );
}

/* ── Helpers ── */

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
