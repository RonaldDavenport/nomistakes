"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useBusinessContext } from "@/components/dashboard/BusinessProvider";
import { T } from "@/lib/design-tokens";
import { getChecklistForSubtype } from "@/lib/checklist-data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Calendar, Users, FileText, CreditCard,
  TrendingUp, Edit3, Link2, BarChart2,
  UserPlus, ArrowRight, CheckCircle2, Circle,
  Clock, Zap,
} from "lucide-react";

// ─── Design tokens (local overrides for readability) ─────────────────────────

const SYNE = "'DM Sans', -apple-system, sans-serif";
const SANS = "'DM Sans', -apple-system, sans-serif";
const GRAD = "linear-gradient(135deg, #C8A44E, #E8C56E)";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmt(cents: number) {
  return `$${(cents / 100).toFixed(2).replace(/\.00$/, "").replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

// ─── Phase detection ─────────────────────────────────────────────────────────

type DashPhase = "setup" | "get_clients" | "active";

function detectPhase(
  business: { onboarding_completed: boolean; stripe_account_id: string | null; deployed_url: string; live_url: string },
  contactCount: number,
  invoiceCount: number
): DashPhase {
  if (contactCount >= 1 && invoiceCount >= 1) return "active";
  if (!!(business.deployed_url || business.live_url) && !!business.stripe_account_id) return "get_clients";
  return "setup";
}

// ─── Stat Card ───────────────────────────────────────────────────────────────

function StatCard({ label, value, sub, icon: Icon, accent }: { label: string; value: string; sub: string; icon: React.ElementType; accent: string }) {
  return (
    <div style={{
      background: T.bgEl, border: `1px solid ${T.border}`, borderRadius: 14, padding: "20px 22px",
      display: "flex", flexDirection: "column", gap: 16,
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontFamily: SANS, fontSize: 12, fontWeight: 600, color: T.text2, textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</span>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: accent + "18", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon size={15} color={accent} />
        </div>
      </div>
      <div>
        <p style={{ fontFamily: SYNE, fontSize: 28, fontWeight: 800, letterSpacing: "-0.04em", lineHeight: 1, color: T.text, fontVariantNumeric: "tabular-nums" }}>{value}</p>
        <p style={{ fontFamily: SANS, fontSize: 12, color: T.text3, marginTop: 6 }}>{sub}</p>
      </div>
    </div>
  );
}

// ─── Section header ──────────────────────────────────────────────────────────

function SectionHeader({ title, linkHref, linkLabel }: { title: string; linkHref?: string; linkLabel?: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
      <h3 style={{ fontFamily: SYNE, fontSize: 14, fontWeight: 700, color: T.text, letterSpacing: "-0.02em" }}>{title}</h3>
      {linkHref && (
        <Link href={linkHref} style={{ fontFamily: SANS, fontSize: 12, fontWeight: 500, color: T.gold, display: "flex", alignItems: "center", gap: 4 }}>
          {linkLabel || "View all"} <ArrowRight size={11} />
        </Link>
      )}
    </div>
  );
}

// ─── Welcome Banner ──────────────────────────────────────────────────────────

function WelcomeBanner({ businessId, businessName, phase }: { businessId: string; businessName: string; phase: DashPhase }) {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const date = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

  const phaseLabel: Record<DashPhase, { text: string; color: string }> = {
    setup: { text: "Setting up", color: T.gold },
    get_clients: { text: "Finding clients", color: T.blue },
    active: { text: "Active", color: T.green },
  };

  return (
    <div style={{
      background: T.bgEl, border: `1px solid ${T.border}`, borderRadius: 16,
      padding: "28px 32px", marginBottom: 28, position: "relative", overflow: "hidden",
    }}>
      {/* Glow */}
      <div style={{ position: "absolute", top: "-40%", right: "-10%", width: "50%", height: "200%", background: "radial-gradient(ellipse at center, rgba(200,164,78,0.07) 0%, transparent 70%)", pointerEvents: "none" }} />

      <div style={{ position: "relative", display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
        <div>
          <p style={{ fontFamily: SANS, fontSize: 12, color: T.text3, marginBottom: 6 }}>{date}</p>
          <h1 style={{ fontFamily: SYNE, fontSize: "clamp(1.6rem, 3vw, 2.2rem)", fontWeight: 900, letterSpacing: "-0.04em", color: T.text, lineHeight: 1.1, marginBottom: 8 }}>
            {greeting},<br />
            <span style={{ background: GRAD, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              {businessName || "welcome back"}
            </span>
          </h1>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 12 }}>
            <div style={{ width: 7, height: 7, borderRadius: "50%", background: phaseLabel[phase].color, flexShrink: 0 }} />
            <span style={{ fontFamily: SANS, fontSize: 12, color: T.text2 }}>{phaseLabel[phase].text}</span>
          </div>
        </div>

        {/* Quick nav chips */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "flex-start" }}>
          {[
            { label: "Contacts", href: `/dashboard/${businessId}/contacts`, Icon: Users },
            { label: "Proposals", href: `/dashboard/${businessId}/pipeline`, Icon: FileText },
            { label: "Invoices", href: `/dashboard/${businessId}/invoices`, Icon: CreditCard },
            { label: "Projects", href: `/dashboard/${businessId}/projects`, Icon: BarChart2 },
          ].map(({ label, href, Icon }) => (
            <Link key={label} href={href} style={{
              display: "flex", alignItems: "center", gap: 6,
              fontFamily: SANS, fontSize: 12, fontWeight: 500, color: T.text2,
              background: T.bgAlt, border: `1px solid ${T.border}`,
              padding: "6px 12px", borderRadius: 7,
              transition: "border-color 0.15s, color 0.15s",
            }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = T.gold; (e.currentTarget as HTMLElement).style.color = T.gold; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = T.border; (e.currentTarget as HTMLElement).style.color = T.text2; }}
            >
              <Icon size={12} /> {label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── SETUP PHASE ─────────────────────────────────────────────────────────────

function SetupDashboard({ businessId, business }: { businessId: string; business: Record<string, unknown> }) {
  const subtype = (business.subtype as string) || "freelance";
  const hasExistingWebsite = !!(business.has_existing_website);
  const persona = (business.persona as "grinder" | "operator" | "scaler" | null) ?? null;
  const tasks = getChecklistForSubtype(subtype, { hasExistingWebsite, persona });
  const phase1 = tasks.filter((t) => t.phase === 1);

  const checks = {
    site: !!(business.deployed_url || business.live_url),
    stripe: !!business.stripe_account_id,
    booking: !!(business.availability_settings && Object.keys(business.availability_settings as object).length > 0),
  };

  const completedSteps = [checks.site, checks.stripe, checks.booking].filter(Boolean).length;
  const totalSteps = 3 + phase1.length;
  const pct = Math.round((completedSteps / totalSteps) * 100);

  const coreSteps = [
    { done: checks.site, title: "Review your live site", desc: "Check your copy, services, and pricing.", href: `/dashboard/${businessId}/editor`, action: "Open editor", Icon: Edit3 },
    { done: checks.stripe, title: "Connect payments", desc: "Link Stripe so clients can pay you.", href: `/dashboard/${businessId}/settings?tab=stripe`, action: "Connect Stripe", Icon: CreditCard },
    { done: checks.booking, title: "Set up booking", desc: "Let clients book discovery calls.", href: `/dashboard/${businessId}/calls`, action: "Set availability", Icon: Calendar },
  ];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 24 }}>
      {/* Main */}
      <div>
        {/* Progress card */}
        <div style={{ background: T.bgEl, border: `1px solid ${T.border}`, borderRadius: 14, padding: "24px", marginBottom: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <SectionHeader title="Setup progress" />
            <span style={{ fontFamily: SYNE, fontSize: 22, fontWeight: 800, color: T.gold }}>{pct}%</span>
          </div>
          <div style={{ height: 5, background: T.border, borderRadius: 3, marginBottom: 24 }}>
            <div style={{ height: 5, background: GRAD, borderRadius: 3, width: `${pct}%`, transition: "width 0.5s ease" }} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {coreSteps.map((step) => (
              <div key={step.title} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", borderRadius: 10, background: step.done ? "transparent" : T.bgAlt, border: `1px solid ${step.done ? "transparent" : T.border}` }}>
                {step.done
                  ? <CheckCircle2 size={18} color={T.green} />
                  : <div style={{ width: 18, height: 18, borderRadius: "50%", border: `1.5px solid ${T.border}`, flexShrink: 0 }} />
                }
                <div style={{ flex: 1 }}>
                  <span style={{ fontFamily: SANS, fontSize: 13, fontWeight: 600, color: step.done ? T.text3 : T.text, textDecoration: step.done ? "line-through" : "none" }}>{step.title}</span>
                  {!step.done && <p style={{ fontFamily: SANS, fontSize: 11, color: T.text3, marginTop: 2 }}>{step.desc}</p>}
                </div>
                {!step.done && (
                  <Link href={step.href}>
                    <Button size="sm" variant="outline" className="text-xs h-7 px-3" style={{ fontFamily: SANS }}>
                      {step.action}
                    </Button>
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Phase 1 checklist */}
        <div style={{ background: T.bgEl, border: `1px solid ${T.border}`, borderRadius: 14, padding: "24px" }}>
          <SectionHeader title={phase1[0]?.phaseTitle || "Review & Refine"} />
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {phase1.map((task) => (
              <div key={task.id} style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "12px 0", borderBottom: `1px solid ${T.border}` }}>
                <Circle size={16} color={T.border} style={{ marginTop: 2, flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <span style={{ fontFamily: SANS, fontSize: 13, fontWeight: 500, color: T.text }}>{task.title}</span>
                  <p style={{ fontFamily: SANS, fontSize: 11, color: T.text3, marginTop: 2 }}>{task.description}</p>
                </div>
                {task.aiCapability !== "manual" && (
                  <Badge variant="outline" style={{ fontFamily: SANS, fontSize: 10, color: T.gold, borderColor: T.goldDim, background: T.goldDim }}>
                    AI {task.aiCapability}
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <SetupRightPanel businessId={businessId} />
    </div>
  );
}

function SetupRightPanel({ businessId }: { businessId: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* AI Coach */}
      <div style={{ background: T.bgEl, border: "1px solid rgba(200,164,78,0.2)", borderRadius: 14, padding: "22px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
          <Zap size={15} color={T.gold} />
          <span style={{ fontFamily: SYNE, fontSize: 13, fontWeight: 700, color: T.gold }}>AI Coach</span>
        </div>
        <p style={{ fontFamily: SANS, fontSize: 13, color: T.text2, lineHeight: 1.6, marginBottom: 16 }}>
          Your site is live — now make it yours. Review your copy, connect payments, and set up booking to start getting clients.
        </p>
        <Link href={`/dashboard/${businessId}/chat`}>
          <Button size="sm" style={{ fontFamily: SYNE, fontWeight: 700, fontSize: 12, background: GRAD, color: "#09090B", width: "100%", height: 36 }}>
            Ask me anything
          </Button>
        </Link>
      </div>

      {/* Quick links */}
      <div style={{ background: T.bgEl, border: `1px solid ${T.border}`, borderRadius: 14, padding: "22px" }}>
        <SectionHeader title="Quick actions" />
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {[
            { label: "Share booking link", href: `/dashboard/${businessId}/calls`, Icon: Link2 },
            { label: "View your live site", href: `/dashboard/${businessId}/editor`, Icon: Edit3 },
            { label: "Add a contact", href: `/dashboard/${businessId}/contacts`, Icon: UserPlus },
          ].map(({ label, href, Icon }) => (
            <Link key={label} href={href} style={{
              display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 8,
              fontFamily: SANS, fontSize: 13, fontWeight: 500, color: T.text2,
              border: `1px solid ${T.border}`, transition: "border-color 0.15s, color 0.15s",
            }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = T.gold; (e.currentTarget as HTMLElement).style.color = T.text; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = T.border; (e.currentTarget as HTMLElement).style.color = T.text2; }}
            >
              <Icon size={14} color={T.gold} /> {label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── GET CLIENTS PHASE ────────────────────────────────────────────────────────

function GetClientsDashboard({ businessId, business }: { businessId: string; business: Record<string, unknown> }) {
  const subtype = (business.subtype as string) || "freelance";
  const hasExistingWebsite = !!(business.has_existing_website);
  const persona = (business.persona as "grinder" | "operator" | "scaler" | null) ?? null;
  const tasks = getChecklistForSubtype(subtype, { hasExistingWebsite, persona });
  const phase2 = tasks.filter((t) => t.phase === 2);
  const phase3 = tasks.filter((t) => t.phase === 3);

  const quickActions = [
    { label: "Share booking link", desc: "Send your scheduling page", href: `/dashboard/${businessId}/calls`, Icon: Calendar, accent: T.gold },
    { label: "Write a blog post", desc: "SEO content drives traffic", href: `/dashboard/${businessId}/content`, Icon: Edit3, accent: T.blue },
    { label: "Create an ad", desc: "Get in front of your audience", href: `/dashboard/${businessId}/ads`, Icon: TrendingUp, accent: T.purple },
    { label: "Add a contact", desc: "Build your client list", href: `/dashboard/${businessId}/contacts`, Icon: UserPlus, accent: T.green },
  ];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 24 }}>
      {/* Main */}
      <div>
        {/* Quick actions */}
        <div style={{ background: T.bgEl, border: `1px solid ${T.border}`, borderRadius: 14, padding: "24px", marginBottom: 20 }}>
          <SectionHeader title="Quick actions" linkHref={`/dashboard/${businessId}/checklist`} linkLabel="Full checklist" />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {quickActions.map((a) => (
              <Link key={a.label} href={a.href} style={{
                display: "flex", alignItems: "center", gap: 12, padding: "16px",
                borderRadius: 10, border: `1px solid ${T.border}`,
                textDecoration: "none", transition: "border-color 0.15s, background 0.15s",
              }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = a.accent; (e.currentTarget as HTMLElement).style.background = a.accent + "0A"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = T.border; (e.currentTarget as HTMLElement).style.background = "transparent"; }}
              >
                <div style={{ width: 34, height: 34, borderRadius: 8, background: a.accent + "15", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <a.Icon size={15} color={a.accent} />
                </div>
                <div>
                  <span style={{ fontFamily: SANS, fontSize: 13, fontWeight: 600, color: T.text, display: "block" }}>{a.label}</span>
                  <span style={{ fontFamily: SANS, fontSize: 11, color: T.text3 }}>{a.desc}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Phase tasks */}
        {[...phase2, ...phase3].length > 0 && (
          <div style={{ background: T.bgEl, border: `1px solid ${T.border}`, borderRadius: 14, padding: "24px" }}>
            <SectionHeader title="Growth checklist" linkHref={`/dashboard/${businessId}/checklist`} />
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {[...phase2, ...phase3].slice(0, 6).map((task) => (
                <div key={task.id} style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "12px 0", borderBottom: `1px solid ${T.border}` }}>
                  <Circle size={16} color={T.border} style={{ marginTop: 2, flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <span style={{ fontFamily: SANS, fontSize: 13, fontWeight: 500, color: T.text }}>{task.title}</span>
                    <p style={{ fontFamily: SANS, fontSize: 11, color: T.text3, marginTop: 2 }}>{task.description}</p>
                  </div>
                  {task.aiCapability !== "manual" && (
                    <Badge variant="outline" style={{ fontFamily: SANS, fontSize: 10, color: T.gold, borderColor: T.goldDim, background: T.goldDim }}>
                      AI {task.aiCapability}
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Right panel */}
      <SetupRightPanel businessId={businessId} />
    </div>
  );
}

// ─── ACTIVE PHASE ────────────────────────────────────────────────────────────

interface DashStats {
  revenue: number; clientCount: number; proposalCount: number;
  invoicesDue: number; pipelineValue: number; invoicesDueAmount: number;
}

interface DashActivity {
  color: string; title: string; desc: string; amount?: string; time: string;
}

interface DashProposal {
  id: string; title: string; contact_name: string; total_cents: number; status: string;
}

interface DashUpcoming {
  title: string; time: string;
}

function ActiveDashboard({ businessId, stats, activities, recentProposals, upcomingCalls }: {
  businessId: string; stats: DashStats; activities: DashActivity[];
  recentProposals: DashProposal[]; upcomingCalls: DashUpcoming[];
}) {
  const STATUS_COLORS: Record<string, string> = {
    accepted: T.green, viewed: T.blue, sent: T.gold, draft: T.text3,
  };

  const months = ["Sep", "Oct", "Nov", "Dec", "Jan", "Feb"];
  const revenue = [6200, 8100, 7400, 9800, 11200, stats.revenue || 12480];
  const maxRev = Math.max(...revenue) * 1.12;
  const chartH = 120;

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 24 }}>
      {/* ── Main column ── */}
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <StatCard label="Revenue" value={fmt(stats.revenue)} sub="this month" icon={CreditCard} accent={T.gold} />
          <StatCard label="Clients" value={String(stats.clientCount)} sub="total" icon={Users} accent={T.green} />
          <StatCard label="Proposals" value={String(stats.proposalCount)} sub={stats.pipelineValue > 0 ? fmt(stats.pipelineValue) + " pipeline" : "open"} icon={FileText} accent={T.blue} />
          <StatCard label="Invoices due" value={String(stats.invoicesDue)} sub={stats.invoicesDueAmount > 0 ? fmt(stats.invoicesDueAmount) + " outstanding" : "all paid"} icon={TrendingUp} accent={stats.invoicesDue > 0 ? T.orange : T.green} />
        </div>

        {/* Revenue chart */}
        <div style={{ background: T.bgEl, border: `1px solid ${T.border}`, borderRadius: 14, padding: "24px" }}>
          <SectionHeader title="Revenue" linkHref={`/dashboard/${businessId}/analytics`} linkLabel="Analytics" />
          <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: chartH }}>
            {revenue.map((v, i) => {
              const barH = Math.max(4, (v / maxRev) * chartH);
              const isLast = i === revenue.length - 1;
              return (
                <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
                  <span style={{ fontFamily: SYNE, fontSize: 10, fontWeight: 700, color: isLast ? T.gold : T.text3, fontVariantNumeric: "tabular-nums" }}>
                    ${(v / 1000).toFixed(1)}k
                  </span>
                  <div style={{ width: "100%", height: barH, background: isLast ? GRAD : "rgba(255,255,255,0.06)", borderRadius: "5px 5px 2px 2px", transition: "height 0.5s ease" }} />
                </div>
              );
            })}
          </div>
          <div style={{ display: "flex", marginTop: 8 }}>
            {months.map((m, i) => (
              <span key={i} style={{ flex: 1, textAlign: "center", fontFamily: SANS, fontSize: 11, color: T.text3 }}>{m}</span>
            ))}
          </div>
        </div>

        {/* Recent activity */}
        {activities.length > 0 && (
          <div style={{ background: T.bgEl, border: `1px solid ${T.border}`, borderRadius: 14, padding: "24px" }}>
            <SectionHeader title="Recent activity" linkHref={`/dashboard/${businessId}/analytics`} />
            <div style={{ display: "flex", flexDirection: "column" }}>
              {activities.map((a, i) => (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "12px 0", borderBottom: i < activities.length - 1 ? `1px solid ${T.border}` : "none" }}>
                  <div style={{ width: 7, height: 7, borderRadius: "50%", background: a.color, marginTop: 5, flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <span style={{ fontFamily: SANS, fontSize: 13, fontWeight: 500, color: T.text }}>{a.title}</span>
                    <p style={{ fontFamily: SANS, fontSize: 12, color: T.text2, marginTop: 1 }}>{a.desc}</p>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    {a.amount && <span style={{ fontFamily: SANS, fontSize: 13, fontWeight: 600, color: a.amount.startsWith("+") ? T.green : T.text, fontVariantNumeric: "tabular-nums" }}>{a.amount}</span>}
                    <p style={{ fontFamily: SANS, fontSize: 11, color: T.text3, marginTop: a.amount ? 1 : 0 }}>{a.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Right panel ── */}
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

        {/* Upcoming calls */}
        <div style={{ background: T.bgEl, border: `1px solid ${T.border}`, borderRadius: 14, padding: "22px" }}>
          <SectionHeader title="Schedule" linkHref={`/dashboard/${businessId}/calls`} linkLabel="Calendar" />
          {upcomingCalls.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {upcomingCalls.map((e, i) => (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "10px 0", borderBottom: i < upcomingCalls.length - 1 ? `1px solid ${T.border}` : "none" }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: T.goldDim, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Calendar size={14} color={T.gold} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <span style={{ fontFamily: SANS, fontSize: 12, fontWeight: 600, color: T.text, display: "block" }}>{e.title}</span>
                    <span style={{ fontFamily: SANS, fontSize: 11, color: T.text3 }}>{e.time}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: "20px 0" }}>
              <Calendar size={24} color={T.text3} style={{ margin: "0 auto 8px" }} />
              <p style={{ fontFamily: SANS, fontSize: 12, color: T.text3 }}>No upcoming calls</p>
              <Link href={`/dashboard/${businessId}/calls`} style={{ fontFamily: SANS, fontSize: 12, color: T.gold, display: "inline-block", marginTop: 8 }}>Set up booking →</Link>
            </div>
          )}
        </div>

        {/* Proposals */}
        {recentProposals.length > 0 && (
          <div style={{ background: T.bgEl, border: `1px solid ${T.border}`, borderRadius: 14, padding: "22px" }}>
            <SectionHeader title="Proposals" linkHref={`/dashboard/${businessId}/pipeline`} />
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {recentProposals.map((p, i) => (
                <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 0", borderBottom: i < recentProposals.length - 1 ? `1px solid ${T.border}` : "none" }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ fontFamily: SANS, fontSize: 12, fontWeight: 600, color: T.text, display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.contact_name}</span>
                    <span style={{ fontFamily: SANS, fontSize: 11, color: T.text3 }}>{p.title}</span>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <span style={{ fontFamily: SYNE, fontSize: 13, fontWeight: 700, color: T.text, fontVariantNumeric: "tabular-nums", display: "block" }}>{fmt(p.total_cents)}</span>
                    <span style={{ fontFamily: SANS, fontSize: 11, fontWeight: 600, color: STATUS_COLORS[p.status] || T.text3, textTransform: "capitalize" }}>{p.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* AI Coach */}
        <div style={{ background: T.bgEl, border: `1px solid rgba(200,164,78,0.2)`, borderRadius: 14, padding: "22px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <Zap size={14} color={T.gold} />
            <span style={{ fontFamily: SYNE, fontSize: 13, fontWeight: 700, color: T.gold }}>AI Coach</span>
          </div>
          <p style={{ fontFamily: SANS, fontSize: 13, color: T.text2, lineHeight: 1.6, marginBottom: 14 }}>
            {stats.invoicesDue > 0
              ? `${stats.invoicesDue} invoice${stats.invoicesDue > 1 ? "s" : ""} outstanding. Want me to draft a follow-up?`
              : "All invoices are paid up. Ready to work on growth?"}
          </p>
          <Link href={`/dashboard/${businessId}/chat`}>
            <Button size="sm" style={{ fontFamily: SYNE, fontWeight: 700, fontSize: 12, background: GRAD, color: "#09090B", width: "100%", height: 36 }}>
              Ask me anything
            </Button>
          </Link>
        </div>

        {/* Time tracker shortcut */}
        <div style={{ background: T.bgEl, border: `1px solid ${T.border}`, borderRadius: 14, padding: "22px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Clock size={14} color={T.text3} />
              <span style={{ fontFamily: SYNE, fontSize: 13, fontWeight: 700, color: T.text }}>Time Tracker</span>
            </div>
            <Link href={`/dashboard/${businessId}/time`} style={{ fontFamily: SANS, fontSize: 11, color: T.gold }}>View all →</Link>
          </div>
          <Link href={`/dashboard/${businessId}/time`}>
            <Button variant="outline" size="sm" style={{ fontFamily: SANS, fontWeight: 500, fontSize: 12, width: "100%", height: 36, borderColor: T.border, color: T.text2 }}>
              Start timer
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────

export default function BusinessHome() {
  const params = useParams();
  const businessId = params.businessId as string;
  const { business, loading } = useBusinessContext();
  const [loaded, setLoaded] = useState(false);
  const [phase, setPhase] = useState<DashPhase>("setup");
  const [dashData, setDashData] = useState<{
    contactCount: number; invoiceCount: number; stats: DashStats;
    activities: DashActivity[]; recentProposals: DashProposal[]; upcomingCalls: DashUpcoming[];
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

      const paidInvoices = invoices.filter((i: { status: string }) => i.status === "paid");
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

      setDashData({
        contactCount: contacts.length,
        invoiceCount: invoices.length,
        stats: { revenue: revenueThisMonth, clientCount: contacts.length, proposalCount: openProposals.length, invoicesDue: unpaidInvoices.length, pipelineValue, invoicesDueAmount },
        activities: recentActivity.slice(0, 5).map((a: { type: string; title: string; description: string; created_at: string }) => ({
          color: activityColors[a.type] || T.text3, title: a.title, desc: a.description || "", time: timeAgo(a.created_at),
        })),
        recentProposals: proposals.slice(0, 4).map((p: { id: string; title: string; contacts?: { name: string } | null; pricing?: { total_cents?: number }; status: string }) => ({
          id: p.id, title: p.title, contact_name: p.contacts?.name || "Unknown", total_cents: p.pricing?.total_cents || 0, status: p.status,
        })),
        upcomingCalls: calls.slice(0, 3).map((c: { name: string; scheduled_at: string }) => ({
          title: `${c.name}`,
          time: new Date(c.scheduled_at).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }),
        })),
      });
    } catch {
      setDashData({ contactCount: 0, invoiceCount: 0, stats: { revenue: 0, clientCount: 0, proposalCount: 0, invoicesDue: 0, pipelineValue: 0, invoicesDueAmount: 0 }, activities: [], recentProposals: [], upcomingCalls: [] });
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
        <div style={{ width: 32, height: 32, borderRadius: "50%", border: `2px solid ${T.gold}`, borderTopColor: "transparent", animation: "spin 1s linear infinite" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const businessObj = business as unknown as Record<string, unknown>;
  const businessName = businessObj.name as string || "";

  return (
    <div style={{ padding: "28px 32px 80px", opacity: loaded ? 1 : 0, transform: loaded ? "none" : "translateY(6px)", transition: "all 0.35s ease" }}>
      <style>{`
        @media (max-width: 1024px) {
          .dash-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      <WelcomeBanner businessId={businessId} businessName={businessName} phase={phase} />

      <div className="dash-grid">
        {phase === "setup" && <SetupDashboard businessId={businessId} business={businessObj} />}
        {phase === "get_clients" && <GetClientsDashboard businessId={businessId} business={businessObj} />}
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
    </div>
  );
}
