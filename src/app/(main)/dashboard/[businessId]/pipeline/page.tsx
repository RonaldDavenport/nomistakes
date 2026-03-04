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
  { key: "discovery", label: "Discovery", color: "#3b82f6" },
  { key: "proposal_sent", label: "Proposal Sent", color: "#a855f7" },
  { key: "viewed", label: "Viewed", color: "#f59e0b" },
  { key: "won", label: "Won", color: T.green },
  { key: "lost", label: "Lost", color: "#ef4444" },
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
  const winRate = grouped.won.length > 0 && dealCount > 0 ? `${Math.round((grouped.won.length / dealCount) * 100)}%` : "--";

  return (
    <PaywallGate
      requiredPlan="starter"
      teaser={{ headline: "Sales Pipeline", description: "Track leads from discovery to close. See deal values, conversion rates, and manage your pipeline at a glance.", bullets: ["Visual pipeline with 5 stages", "Auto-derived from contacts & proposals", "Deal values and conversion tracking"] }}
    >
      <div style={{ padding: "32px 40px 80px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: T.text, letterSpacing: "-0.02em", margin: 0 }}>Proposals</h1>
            <p style={{ fontSize: 13, color: "#9CA3AF", marginTop: 2 }}>{contacts.length} contacts in pipeline</p>
          </div>
          <Link href={`/dashboard/${businessId}/contacts`} style={{ fontSize: 13, fontWeight: 600, color: T.gold, textDecoration: "none" }}>View all clients</Link>
        </div>

        <div style={{ height: 1, background: "#1E1E21", margin: "24px 0" }} />

        {/* Flat stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 40 }}>
          {[
            { label: "Pipeline", value: fmt(totalValue) },
            { label: "Won", value: fmt(wonValue) },
            { label: "Active Deals", value: String(dealCount) },
            { label: "Win Rate", value: winRate },
          ].map((s) => (
            <div key={s.label}>
              <p style={{ fontSize: 11, fontWeight: 600, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>{s.label}</p>
              <p style={{ fontSize: 24, fontWeight: 700, color: T.text, fontVariantNumeric: "tabular-nums", lineHeight: 1 }}>{s.value}</p>
            </div>
          ))}
        </div>

        <div style={{ height: 1, background: "#1E1E21", margin: "24px 0" }} />

        {loading ? (
          <p style={{ color: "#9CA3AF", fontSize: 13 }}>Loading...</p>
        ) : contacts.length === 0 ? (
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: T.text, marginBottom: 8 }}>How proposals work</h2>
            <p style={{ fontSize: 14, color: "#9CA3AF", lineHeight: 1.6, marginBottom: 24, maxWidth: 560 }}>
              Your pipeline automatically builds from contacts and proposals. Every lead moves through stages as you engage with them.
            </p>
            {[
              { n: "1", t: "Add a contact", d: "Add leads manually or they appear automatically when someone books a discovery call." },
              { n: "2", t: "Create a proposal", d: "Use AI to generate a professional proposal from the contact detail page." },
              { n: "3", t: "Send & track", d: "Send proposals via email. Track opens, views, and acceptance in real time." },
              { n: "4", t: "Get paid", d: "Clients accept and pay through Stripe checkout. Revenue flows straight to your account." },
            ].map((item) => (
              <div key={item.n} style={{ display: "flex", gap: 14, padding: "14px 0", borderBottom: "1px solid #1E1E21" }}>
                <span style={{ width: 24, height: 24, borderRadius: 6, background: T.goldDim, color: T.gold, fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{item.n}</span>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 600, color: T.text, marginBottom: 2 }}>{item.t}</p>
                  <p style={{ fontSize: 13, color: "#9CA3AF", lineHeight: 1.5 }}>{item.d}</p>
                </div>
              </div>
            ))}
            <div style={{ marginTop: 24 }}>
              <Link href={`/dashboard/${businessId}/contacts`} style={{ display: "inline-block", padding: "10px 20px", borderRadius: 8, background: CTA_GRAD, color: "#09090B", fontSize: 13, fontWeight: 600, textDecoration: "none" }}>
                Add your first contact
              </Link>
            </div>
          </div>
        ) : (
          STAGES.map((stage) => {
            const sc = grouped[stage.key];
            const sv = sc.reduce((sum, c) => sum + getDealValue(c), 0);
            return (
              <div key={stage.key}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "12px 0" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ width: 8, height: 8, borderRadius: "50%", background: stage.color, flexShrink: 0 }} />
                    <span style={{ fontSize: 14, fontWeight: 600, color: T.text }}>{stage.label}</span>
                    <span style={{ fontSize: 12, color: "#9CA3AF" }}>{sc.length}</span>
                  </div>
                  {sv > 0 && <span style={{ fontSize: 13, fontWeight: 600, color: T.text, fontVariantNumeric: "tabular-nums" }}>{fmt(sv)}</span>}
                </div>
                {sc.length === 0 ? (
                  <p style={{ fontSize: 12, color: "#52525B", padding: "4px 0 4px 18px" }}>No deals</p>
                ) : (
                  sc.map((contact) => {
                    const val = getDealValue(contact);
                    const lp = contact.proposals[0];
                    return (
                      <div
                        key={contact.id}
                        onClick={() => router.push(`/dashboard/${businessId}/contacts/${contact.id}`)}
                        style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0 10px 18px", cursor: "pointer", borderBottom: "1px solid #1E1E21" }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.02)"; }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                      >
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <span style={{ fontSize: 13, fontWeight: 500, color: T.text }}>{contact.name}</span>
                          {contact.company && <span style={{ fontSize: 12, color: "#9CA3AF", marginLeft: 8 }}>{contact.company}</span>}
                          {lp && <span style={{ fontSize: 12, color: "#52525B", marginLeft: 8 }}>{lp.title}</span>}
                        </div>
                        {val > 0 && <span style={{ fontSize: 13, fontWeight: 600, color: T.text, fontVariantNumeric: "tabular-nums", flexShrink: 0 }}>{fmt(val)}</span>}
                        <span style={{ fontSize: 11, color: "#52525B", flexShrink: 0, minWidth: 56, textAlign: "right" }}>{timeAgo(contact.last_contacted_at || contact.created_at)}</span>
                      </div>
                    );
                  })
                )}
                <div style={{ height: 1, background: "#1E1E21", margin: "16px 0" }} />
              </div>
            );
          })
        )}
      </div>
    </PaywallGate>
  );
}
