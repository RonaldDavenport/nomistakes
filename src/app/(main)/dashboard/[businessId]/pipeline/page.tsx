"use client";

import { useBusinessContext } from "@/components/dashboard/BusinessProvider";
import { PaywallGate } from "@/components/dashboard/PaywallGate";
import { T, CTA_GRAD } from "@/lib/design-tokens";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";

interface PipelineContact {
  id: string;
  name: string;
  email: string;
  company: string | null;
  lifecycle_stage: string;
  last_contacted_at: string | null;
  created_at: string;
  proposals: {
    id: string;
    title: string;
    status: string;
    pricing: { total_cents?: number } | null;
    created_at: string;
  }[];
}

const STAGES = [
  { key: "discovery", label: "Discovery", color: "#3b82f6", bg: "rgba(59,130,246,0.12)" },
  { key: "proposal_sent", label: "Proposal Sent", color: "#a855f7", bg: "rgba(168,85,247,0.12)" },
  { key: "viewed", label: "Viewed", color: "#f59e0b", bg: "rgba(245,158,11,0.12)" },
  { key: "won", label: "Won", color: T.green, bg: "rgba(34,197,94,0.12)" },
  { key: "lost", label: "Lost", color: "#ef4444", bg: "rgba(239,68,68,0.12)" },
];

function getStage(contact: PipelineContact): string {
  const proposals = contact.proposals || [];
  if (proposals.find((p) => p.status === "accepted")) return "won";
  const declined = proposals.find((p) => p.status === "declined");
  if (declined && !proposals.find((p) => ["draft", "sent", "viewed"].includes(p.status))) return "lost";
  if (proposals.find((p) => p.status === "viewed")) return "viewed";
  if (proposals.find((p) => p.status === "sent")) return "proposal_sent";
  return "discovery";
}

function getDealValue(contact: PipelineContact): number {
  const active = (contact.proposals || []).find((p) => ["sent", "viewed", "accepted"].includes(p.status));
  return (active?.pricing as { total_cents?: number } | null)?.total_cents || 0;
}

function fmt(cents: number): string {
  if (cents === 0) return "$0";
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 }).format(cents / 100);
}

function timeAgo(dateStr: string): string {
  const days = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "1d ago";
  if (days < 30) return `${days}d ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

export default function PipelinePage() {
  const params = useParams();
  const router = useRouter();
  const businessId = params.businessId as string;
  useBusinessContext();

  const [contacts, setContacts] = useState<PipelineContact[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPipeline = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/contacts?businessId=${businessId}&limit=200`);
    if (!res.ok) { setLoading(false); return; }
    const { contacts: allContacts } = await res.json();
    const propRes = await fetch(`/api/proposals?businessId=${businessId}`);
    const { proposals } = propRes.ok ? await propRes.json() : { proposals: [] };
    const contactMap = new Map<string, PipelineContact>();
    for (const c of allContacts) contactMap.set(c.id, { ...c, proposals: [] });
    for (const p of proposals) {
      const contact = contactMap.get(p.contact_id);
      if (contact) contact.proposals.push(p);
    }
    setContacts(Array.from(contactMap.values()).filter(
      (c) => c.lifecycle_stage !== "subscriber" || c.proposals.length > 0
    ));
    setLoading(false);
  }, [businessId]);

  useEffect(() => { fetchPipeline(); }, [fetchPipeline]);

  const grouped: Record<string, PipelineContact[]> = {};
  for (const s of STAGES) grouped[s.key] = [];
  for (const c of contacts) { const s = getStage(c); if (grouped[s]) grouped[s].push(c); }

  const totalValue = contacts.reduce((sum, c) => sum + getDealValue(c), 0);
  const wonValue = grouped.won.reduce((sum, c) => sum + getDealValue(c), 0);
  const dealCount = contacts.filter((c) => getStage(c) !== "discovery" || getDealValue(c) > 0).length;
  const winRate = grouped.won.length > 0 && dealCount > 0
    ? `${Math.round((grouped.won.length / dealCount) * 100)}%`
    : "--";

  return (
    <PaywallGate
      requiredPlan="solo"
      teaser={{ headline: "Sales Pipeline", description: "Track leads from discovery to close. See deal values, conversion rates, and manage your pipeline at a glance.", bullets: ["Visual pipeline with 5 stages", "Auto-derived from contacts & proposals", "Deal values and conversion tracking"] }}
    >
      <div style={{ padding: "32px 40px 80px" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
          <div>
            <h1 style={{ fontFamily: T.h, fontSize: 28, fontWeight: 700, color: T.text, letterSpacing: "-0.5px", margin: 0 }}>Pipeline</h1>
            <p style={{ fontSize: 14, color: T.text2, marginTop: 4 }}>{contacts.length} contacts in pipeline</p>
          </div>
          <Link href={`/dashboard/${businessId}/contacts`} style={{ fontSize: 13, fontWeight: 600, color: T.gold, textDecoration: "none", padding: "10px 18px", borderRadius: 9, border: `1px solid rgba(200,164,78,0.25)`, background: T.goldDim }}>
            All contacts →
          </Link>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 24 }}>
          {[
            { label: "Pipeline value", value: fmt(totalValue), color: T.text },
            { label: "Won", value: fmt(wonValue), color: T.green },
            { label: "Active deals", value: String(dealCount), color: T.text },
            { label: "Win rate", value: winRate, color: T.gold },
          ].map((s) => (
            <div key={s.label} style={{ padding: "16px 20px", borderRadius: 10, background: T.bgEl, border: `1px solid ${T.border}` }}>
              <span style={{ fontSize: 22, fontWeight: 700, color: s.color, fontFamily: T.h, fontVariantNumeric: "tabular-nums", display: "block" }}>{s.value}</span>
              <span style={{ fontSize: 12, color: T.text3, display: "block", marginTop: 2 }}>{s.label}</span>
            </div>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: 60, color: T.text3 }}>Loading...</div>
        ) : contacts.length === 0 ? (
          <div style={{
            textAlign: "center", padding: "64px 24px",
            borderRadius: 12, border: `1px dashed ${T.border}`, background: T.bgEl,
          }}>
            <div style={{
              width: 48, height: 48, borderRadius: 12, background: T.goldDim,
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 16px", fontSize: 22,
            }}>
              📊
            </div>
            <h3 style={{ fontFamily: T.h, fontSize: 17, fontWeight: 600, color: T.text, marginBottom: 6 }}>Pipeline is empty</h3>
            <p style={{ fontSize: 13, color: T.text2, maxWidth: 320, margin: "0 auto 20px", lineHeight: 1.5 }}>
              Add contacts and send proposals. Your pipeline builds automatically as you engage with leads.
            </p>
            <Link
              href={`/dashboard/${businessId}/contacts`}
              style={{ display: "inline-block", padding: "10px 22px", borderRadius: 9, background: CTA_GRAD, color: "#09090B", fontSize: 13, fontWeight: 600, textDecoration: "none" }}
            >
              Add your first contact
            </Link>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {STAGES.map((stage) => {
              const sc = grouped[stage.key];
              const sv = sc.reduce((sum, c) => sum + getDealValue(c), 0);
              return (
                <div key={stage.key} style={{ background: T.bgEl, border: `1px solid ${T.border}`, borderRadius: 12, overflow: "hidden" }}>
                  {/* Stage header */}
                  <div style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "12px 16px", borderBottom: sc.length > 0 ? `1px solid ${T.border}` : "none",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ width: 8, height: 8, borderRadius: "50%", background: stage.color, flexShrink: 0 }} />
                      <span style={{ fontSize: 13, fontWeight: 600, color: T.text }}>{stage.label}</span>
                      <span style={{
                        fontSize: 11, fontWeight: 600, padding: "1px 7px", borderRadius: 100,
                        background: stage.bg, color: stage.color,
                      }}>
                        {sc.length}
                      </span>
                    </div>
                    {sv > 0 && <span style={{ fontSize: 13, fontWeight: 600, color: T.text, fontVariantNumeric: "tabular-nums" }}>{fmt(sv)}</span>}
                  </div>
                  {sc.length === 0 ? (
                    <div style={{ padding: "10px 16px" }}>
                      <span style={{ fontSize: 12, color: T.text3 }}>No deals in this stage</span>
                    </div>
                  ) : (
                    sc.map((contact, idx) => {
                      const val = getDealValue(contact);
                      const lp = contact.proposals[0];
                      return (
                        <div
                          key={contact.id}
                          onClick={() => router.push(`/dashboard/${businessId}/contacts/${contact.id}`)}
                          style={{
                            display: "flex", alignItems: "center", gap: 12,
                            padding: "11px 16px", cursor: "pointer",
                            borderTop: idx > 0 ? `1px solid ${T.border}` : "none",
                          }}
                          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.02)"; }}
                          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                        >
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <span style={{ fontSize: 13, fontWeight: 500, color: T.text }}>{contact.name}</span>
                            {contact.company && <span style={{ fontSize: 12, color: T.text2, marginLeft: 8 }}>{contact.company}</span>}
                            {lp && <span style={{ fontSize: 12, color: T.text3, marginLeft: 8 }}>{lp.title}</span>}
                          </div>
                          {val > 0 && <span style={{ fontSize: 13, fontWeight: 600, color: T.text, fontVariantNumeric: "tabular-nums", flexShrink: 0 }}>{fmt(val)}</span>}
                          <span style={{ fontSize: 11, color: T.text3, flexShrink: 0, minWidth: 52, textAlign: "right" }}>
                            {timeAgo(contact.last_contacted_at || contact.created_at)}
                          </span>
                        </div>
                      );
                    })
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
