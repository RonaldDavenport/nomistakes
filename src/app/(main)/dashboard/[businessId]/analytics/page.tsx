"use client";

import { useBusinessContext } from "@/components/dashboard/BusinessProvider";
import { PaywallGate } from "@/components/dashboard/PaywallGate";
import { T } from "@/lib/design-tokens";
import { useParams } from "next/navigation";
import { useState, useEffect, useCallback } from "react";

interface Summary {
  uniqueVisitors: number;
  pageviews: number;
  events: number;
}

interface DayPoint {
  date: string;
  count: number;
}

interface TopPage {
  path: string;
  count: number;
}

interface TopReferrer {
  source: string;
  count: number;
}

interface RecentEvent {
  event_name: string;
  event_props: Record<string, unknown> | null;
  created_at: string;
}

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div style={{ background: T.bgEl, border: `1px solid ${T.border}`, borderRadius: 10, padding: "18px 20px" }}>
      <p style={{ fontSize: 11, fontWeight: 600, color: T.text3, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>
        {label}
      </p>
      <p style={{ fontSize: 26, fontWeight: 700, color: T.text, fontFamily: "var(--font-mono, monospace)" }}>
        {typeof value === "number" ? value.toLocaleString() : value}
      </p>
    </div>
  );
}

function BarChart({ data }: { data: DayPoint[] }) {
  const max = Math.max(...data.map((d) => d.count), 1);
  return (
    <div style={{ background: T.bgEl, border: `1px solid ${T.border}`, borderRadius: 10, padding: "20px 24px" }}>
      <p style={{ fontSize: 13, fontWeight: 600, color: T.text, marginBottom: 16 }}>
        Pageviews — last {data.length} days
      </p>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 2, height: 80 }}>
        {data.map((d) => (
          <div
            key={d.date}
            title={`${d.date}: ${d.count}`}
            style={{
              flex: 1,
              height: `${Math.max((d.count / max) * 100, d.count > 0 ? 4 : 2)}%`,
              background: d.count > 0 ? T.gold : "rgba(255,255,255,0.04)",
              borderRadius: 3,
            }}
          />
        ))}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
        <span style={{ fontSize: 10, color: T.text3 }}>{data[0]?.date?.slice(5)}</span>
        <span style={{ fontSize: 10, color: T.text3 }}>{data[data.length - 1]?.date?.slice(5)}</span>
      </div>
    </div>
  );
}

function TopTable({ title, rows, labelKey, countKey }: {
  title: string;
  rows: Record<string, string | number>[];
  labelKey: string;
  countKey: string;
}) {
  const max = Math.max(...rows.map((r) => r[countKey] as number), 1);
  return (
    <div style={{ background: T.bgEl, border: `1px solid ${T.border}`, borderRadius: 10, padding: "20px 24px" }}>
      <p style={{ fontSize: 13, fontWeight: 600, color: T.text, marginBottom: 16 }}>{title}</p>
      {rows.length === 0 ? (
        <p style={{ fontSize: 13, color: T.text3 }}>No data yet.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {rows.map((row, i) => (
            <div key={i}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ fontSize: 12, color: T.text2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "75%" }}>
                  {row[labelKey] as string}
                </span>
                <span style={{ fontSize: 12, color: T.text3 }}>{(row[countKey] as number).toLocaleString()}</span>
              </div>
              <div style={{ height: 3, borderRadius: 2, background: "rgba(255,255,255,0.05)" }}>
                <div style={{ height: "100%", width: `${((row[countKey] as number) / max) * 100}%`, borderRadius: 2, background: T.gold }} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AnalyticsPage() {
  const params = useParams();
  const businessId = params.businessId as string;
  useBusinessContext();

  const [summary, setSummary] = useState<Summary | null>(null);
  const [dailyData, setDailyData] = useState<DayPoint[]>([]);
  const [topPages, setTopPages] = useState<TopPage[]>([]);
  const [topReferrers, setTopReferrers] = useState<TopReferrer[]>([]);
  const [recentEvents, setRecentEvents] = useState<RecentEvent[]>([]);
  const [days, setDays] = useState(30);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/analytics?businessId=${businessId}&days=${days}`);
    if (res.ok) {
      const data = await res.json();
      setSummary(data.summary);
      setDailyData(data.dailyData || []);
      setTopPages(data.topPages || []);
      setTopReferrers(data.topReferrers || []);
      setRecentEvents(data.recentEvents || []);
    }
    setLoading(false);
  }, [businessId, days]);

  useEffect(() => { load(); }, [load]);

  const snippetOrigin = typeof window !== "undefined" ? window.location.origin : "https://kovra.app";
  const snippet = `<script>
(function(bid,base){
  function sid(){try{var k='_ks_'+bid,s=localStorage.getItem(k);if(!s){s=Math.random().toString(36).slice(2)+Date.now().toString(36);localStorage.setItem(k,s);}return s;}catch(e){return 'ns_'+Math.random().toString(36).slice(2);}}
  function send(n,p){var d=JSON.stringify({businessId:bid,sessionId:sid(),path:location.pathname,referrer:document.referrer,event:n||null,props:p||null});if(navigator.sendBeacon){navigator.sendBeacon(base,new Blob([d],{type:'application/json'}));}else{fetch(base,{method:'POST',headers:{'Content-Type':'application/json'},body:d,keepalive:true});}}
  window.kovra={track:function(n,p){send(n,p);}};
  send(null,null);
})('${businessId}','${snippetOrigin}/api/track');
<\/script>`;

  function copySnippet() {
    navigator.clipboard.writeText(snippet).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <PaywallGate
      requiredPlan="solo"
      teaser={{
        headline: "Site Analytics",
        description: "Track who visits your site, where they come from, and what they do.",
        bullets: [
          "Pageview and unique visitor tracking",
          "Top pages and referrer breakdown",
          "Custom event tracking via JS API",
          "7, 30, and 90 day windows",
          "One-line embed snippet",
        ],
      }}
    >
      <div style={{ padding: "32px 24px", maxWidth: 1100, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
          <div>
            <h1 style={{ fontFamily: T.h, fontSize: 28, fontWeight: 700, color: T.text, letterSpacing: "-0.5px", margin: 0 }}>
              Analytics
            </h1>
            <p style={{ fontSize: 14, color: T.text2, margin: "4px 0 0" }}>
              Visitor and event data for your deployed site.
            </p>
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            {[7, 30, 90].map((d) => (
              <button
                key={d}
                onClick={() => setDays(d)}
                style={{
                  padding: "6px 14px", borderRadius: 100, fontSize: 12, fontWeight: 500,
                  border: `1px solid ${days === d ? T.gold : T.border}`,
                  background: days === d ? T.goldDim : "transparent",
                  color: days === d ? T.gold : T.text2,
                  cursor: "pointer",
                }}
              >
                {d}d
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <p style={{ color: T.text3, fontSize: 13 }}>Loading...</p>
        ) : (
          <>
            {/* Summary cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 24 }}>
              <StatCard label="Unique Visitors" value={summary?.uniqueVisitors ?? 0} />
              <StatCard label="Pageviews" value={summary?.pageviews ?? 0} />
              <StatCard label="Custom Events" value={summary?.events ?? 0} />
            </div>

            {dailyData.length > 0 && (
              <div style={{ marginBottom: 24 }}>
                <BarChart data={dailyData} />
              </div>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
              <TopTable
                title="Top pages"
                rows={topPages as unknown as Record<string, string | number>[]}
                labelKey="path"
                countKey="count"
              />
              <TopTable
                title="Top referrers"
                rows={topReferrers as unknown as Record<string, string | number>[]}
                labelKey="source"
                countKey="count"
              />
            </div>

            {recentEvents.length > 0 && (
              <div style={{ background: T.bgEl, border: `1px solid ${T.border}`, borderRadius: 10, padding: "20px 24px", marginBottom: 24 }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: T.text, marginBottom: 16 }}>Recent events</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {recentEvents.map((ev, i) => (
                    <div key={i} style={{
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      padding: "8px 12px", borderRadius: 6, background: "rgba(255,255,255,0.02)",
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 4, background: `${T.gold}22`, color: T.gold }}>
                          {ev.event_name}
                        </span>
                        {ev.event_props && (
                          <span style={{ fontSize: 11, color: T.text3, fontFamily: "var(--font-mono, monospace)" }}>
                            {JSON.stringify(ev.event_props).slice(0, 60)}
                          </span>
                        )}
                      </div>
                      <span style={{ fontSize: 11, color: T.text3, flexShrink: 0 }}>{relativeTime(ev.created_at)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {summary && summary.pageviews === 0 && summary.events === 0 && (
              <div style={{
                background: T.bgEl, border: `1px solid ${T.border}`, borderRadius: 10,
                padding: "32px 24px", textAlign: "center", marginBottom: 24,
              }}>
                <p style={{ fontSize: 15, color: T.text, marginBottom: 4 }}>No data yet</p>
                <p style={{ fontSize: 13, color: T.text3 }}>
                  Add the snippet below to your site to start collecting data.
                </p>
              </div>
            )}
          </>
        )}

        {/* Embed snippet */}
        <div style={{ background: T.bgEl, border: `1px solid ${T.border}`, borderRadius: 10, padding: "20px 24px" }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12, gap: 16 }}>
            <div>
              <p style={{ fontSize: 13, fontWeight: 600, color: T.text, margin: 0 }}>Tracking snippet</p>
              <p style={{ fontSize: 12, color: T.text3, margin: "6px 0 0", lineHeight: 1.6 }}>
                Paste before{" "}
                <code style={{ fontSize: 11, background: "rgba(255,255,255,0.05)", padding: "1px 6px", borderRadius: 4 }}>&lt;/body&gt;</code>
                {" "}on your site. Tracks pageviews automatically. For custom events call{" "}
                <code style={{ fontSize: 11, background: "rgba(255,255,255,0.05)", padding: "1px 6px", borderRadius: 4 }}>
                  {"window.kovra.track('form_submit', { plan: 'starter' })"}
                </code>.
              </p>
            </div>
            <button
              onClick={copySnippet}
              style={{
                padding: "7px 16px", borderRadius: 7, fontSize: 12, fontWeight: 600,
                border: `1px solid ${copied ? T.gold : T.border}`,
                background: copied ? T.goldDim : "transparent",
                color: copied ? T.gold : T.text2,
                cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0,
              }}
            >
              {copied ? "Copied!" : "Copy snippet"}
            </button>
          </div>
          <pre style={{
            fontSize: 11, color: T.text3, background: "rgba(0,0,0,0.3)",
            borderRadius: 6, padding: "12px 14px", overflowX: "auto",
            margin: 0, lineHeight: 1.6, whiteSpace: "pre-wrap", wordBreak: "break-all",
            fontFamily: "var(--font-mono, monospace)",
          }}>
            {snippet}
          </pre>
        </div>
      </div>
    </PaywallGate>
  );
}
