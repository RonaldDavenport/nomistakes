"use client";

import { useParams, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";

const T = {
  bg: "#09090B", bgEl: "#111113", bgAlt: "#18181B", border: "#27272A",
  text: "#FAFAFA", text2: "#A1A1AA", text3: "#71717A",
  gold: "#C8A44E", goldDim: "rgba(200,164,78,0.08)",
  green: "#22C55E", blue: "#3B82F6", red: "#EF4444", orange: "#F59E0B",
};

interface PortalData {
  contact: { name: string; email: string; company: string | null };
  business: { name: string; slug: string };
  proposals: {
    id: string; title: string; status: string;
    pricing: { total_cents?: number };
    created_at: string; accepted_at: string | null;
  }[];
  invoices: {
    id: string; invoice_number: string; status: string;
    total_cents: number; due_date: string | null; access_token: string;
    paid_at: string | null;
  }[];
  projects: {
    id: string; name: string; description: string | null; status: string;
    due_date: string | null;
    deliverables: { id: string; name: string; status: string; due_date: string | null }[];
  }[];
}

function fmt(cents: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);
}

const STATUS_COLORS: Record<string, string> = {
  sent: T.gold, viewed: T.blue, accepted: T.green, declined: T.red,
  paid: T.green, overdue: T.orange, draft: T.text3,
  active: T.green, completed: T.blue, on_hold: T.gold,
  pending: T.text3,
};

export default function ClientPortalPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const businessId = params.businessId as string;
  const token = searchParams.get("token");

  const [data, setData] = useState<PortalData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<"overview" | "proposals" | "invoices" | "projects">("overview");

  useEffect(() => {
    async function load() {
      if (!token) { setError("Missing access token"); setLoading(false); return; }
      const res = await fetch(`/api/portal?businessId=${businessId}&token=${token}`);
      if (res.ok) {
        setData(await res.json());
      } else {
        const d = await res.json().catch(() => ({}));
        setError(d.error || "Unable to load portal");
      }
      setLoading(false);
    }
    load();
  }, [businessId, token]);

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: T.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: T.text3, fontSize: 14 }}>Loading your portal...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div style={{ minHeight: "100vh", background: T.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <p style={{ color: T.red, fontSize: 16, fontWeight: 600, marginBottom: 8 }}>Access Denied</p>
          <p style={{ color: T.text3, fontSize: 13 }}>{error || "This portal link is invalid or expired."}</p>
        </div>
      </div>
    );
  }

  const { contact, business, proposals, invoices, projects } = data;
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
  const unpaidInvoices = invoices.filter((i) => i.status !== "paid");
  const totalOwed = unpaidInvoices.reduce((s, i) => s + i.total_cents, 0);
  const activeProjects = projects.filter((p) => p.status === "active");

  const tabs: { key: typeof tab; label: string; count?: number }[] = [
    { key: "overview", label: "Overview" },
    { key: "proposals", label: "Proposals", count: proposals.length },
    { key: "invoices", label: "Invoices", count: invoices.length },
    { key: "projects", label: "Projects", count: projects.length },
  ];

  return (
    <div style={{ minHeight: "100vh", background: T.bg }}>
      {/* Header */}
      <div style={{ borderBottom: `1px solid ${T.border}`, padding: "20px 0" }}>
        <div style={{ maxWidth: 800, margin: "0 auto", padding: "0 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <p style={{ fontSize: 18, fontWeight: 700, color: T.text }}>{business.name}</p>
            <p style={{ fontSize: 12, color: T.text3, marginTop: 2 }}>Client Portal</p>
          </div>
          <div style={{ textAlign: "right" }}>
            <p style={{ fontSize: 13, fontWeight: 500, color: T.text }}>{contact.name}</p>
            <p style={{ fontSize: 12, color: T.text3 }}>{contact.email}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ borderBottom: `1px solid ${T.border}` }}>
        <div style={{ maxWidth: 800, margin: "0 auto", padding: "0 24px", display: "flex", gap: 0 }}>
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              style={{
                padding: "12px 16px", fontSize: 13, fontWeight: tab === t.key ? 600 : 400,
                color: tab === t.key ? T.gold : T.text3,
                background: "none", border: "none", cursor: "pointer",
                borderBottom: tab === t.key ? `2px solid ${T.gold}` : "2px solid transparent",
              }}
            >
              {t.label}{t.count !== undefined ? ` (${t.count})` : ""}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 800, margin: "0 auto", padding: "32px 24px 80px" }}>
        {tab === "overview" && (
          <div>
            <p style={{ fontSize: 20, fontWeight: 600, color: T.text, marginBottom: 24 }}>
              Welcome back, {contact.name?.split(" ")[0] || "there"}
            </p>

            {/* Quick stats */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 32 }}>
              <div>
                <p style={{ fontSize: 11, fontWeight: 500, color: T.text3, textTransform: "uppercase", letterSpacing: "0.05em" }}>Outstanding</p>
                <p style={{ fontSize: 24, fontWeight: 700, color: totalOwed > 0 ? T.orange : T.green, marginTop: 4 }}>{fmt(totalOwed)}</p>
              </div>
              <div>
                <p style={{ fontSize: 11, fontWeight: 500, color: T.text3, textTransform: "uppercase", letterSpacing: "0.05em" }}>Active Projects</p>
                <p style={{ fontSize: 24, fontWeight: 700, color: T.text, marginTop: 4 }}>{activeProjects.length}</p>
              </div>
              <div>
                <p style={{ fontSize: 11, fontWeight: 500, color: T.text3, textTransform: "uppercase", letterSpacing: "0.05em" }}>Proposals</p>
                <p style={{ fontSize: 24, fontWeight: 700, color: T.text, marginTop: 4 }}>{proposals.length}</p>
              </div>
            </div>

            <hr style={{ border: "none", borderTop: `1px solid ${T.border}`, margin: "0 0 24px" }} />

            {/* Unpaid invoices */}
            {unpaidInvoices.length > 0 && (
              <div style={{ marginBottom: 32 }}>
                <p style={{ fontSize: 14, fontWeight: 600, color: T.text, marginBottom: 12 }}>Invoices due</p>
                {unpaidInvoices.map((inv) => (
                  <div key={inv.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: `1px solid ${T.border}` }}>
                    <div>
                      <span style={{ fontSize: 13, fontWeight: 500, color: T.text }}>{inv.invoice_number}</span>
                      {inv.due_date && (
                        <span style={{ fontSize: 12, color: T.text3, marginLeft: 12 }}>
                          Due {new Date(inv.due_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </span>
                      )}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <span style={{ fontSize: 14, fontWeight: 600, color: T.text }}>{fmt(inv.total_cents)}</span>
                      <a
                        href={`${baseUrl}/invoice/${inv.id}?token=${inv.access_token}`}
                        style={{ fontSize: 12, fontWeight: 600, color: T.gold, textDecoration: "none" }}
                      >
                        Pay now
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Active projects */}
            {activeProjects.length > 0 && (
              <div>
                <p style={{ fontSize: 14, fontWeight: 600, color: T.text, marginBottom: 12 }}>Active projects</p>
                {activeProjects.map((proj) => {
                  const total = proj.deliverables.length;
                  const done = proj.deliverables.filter((d) => d.status === "completed").length;
                  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
                  return (
                    <div key={proj.id} style={{ padding: "12px 0", borderBottom: `1px solid ${T.border}` }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                        <span style={{ fontSize: 14, fontWeight: 500, color: T.text }}>{proj.name}</span>
                        {total > 0 && <span style={{ fontSize: 12, color: T.text3 }}>{done}/{total} done</span>}
                      </div>
                      {total > 0 && (
                        <div style={{ height: 4, background: T.border, borderRadius: 2 }}>
                          <div style={{ height: 4, background: T.gold, borderRadius: 2, width: `${pct}%`, transition: "width 0.3s" }} />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {proposals.length === 0 && invoices.length === 0 && projects.length === 0 && (
              <p style={{ fontSize: 14, color: T.text3, textAlign: "center", padding: "40px 0" }}>
                Nothing here yet. Your proposals, invoices, and projects will appear here.
              </p>
            )}
          </div>
        )}

        {tab === "proposals" && (
          <div>
            <p style={{ fontSize: 16, fontWeight: 600, color: T.text, marginBottom: 16 }}>Proposals</p>
            {proposals.length === 0 ? (
              <p style={{ fontSize: 13, color: T.text3 }}>No proposals yet.</p>
            ) : (
              proposals.map((p) => (
                <div key={p.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 0", borderBottom: `1px solid ${T.border}` }}>
                  <div>
                    <span style={{ fontSize: 14, fontWeight: 500, color: T.text }}>{p.title}</span>
                    <p style={{ fontSize: 12, color: T.text3, marginTop: 2 }}>
                      {new Date(p.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </p>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    {p.pricing?.total_cents && (
                      <span style={{ fontSize: 14, fontWeight: 600, color: T.text }}>{fmt(p.pricing.total_cents)}</span>
                    )}
                    <span style={{ fontSize: 11, fontWeight: 500, color: STATUS_COLORS[p.status] || T.text3, textTransform: "capitalize" }}>
                      {p.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {tab === "invoices" && (
          <div>
            <p style={{ fontSize: 16, fontWeight: 600, color: T.text, marginBottom: 16 }}>Invoices</p>
            {invoices.length === 0 ? (
              <p style={{ fontSize: 13, color: T.text3 }}>No invoices yet.</p>
            ) : (
              invoices.map((inv) => (
                <div key={inv.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 0", borderBottom: `1px solid ${T.border}` }}>
                  <div>
                    <span style={{ fontSize: 14, fontWeight: 500, color: T.text }}>{inv.invoice_number}</span>
                    {inv.due_date && (
                      <p style={{ fontSize: 12, color: T.text3, marginTop: 2 }}>
                        Due {new Date(inv.due_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </p>
                    )}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: T.text }}>{fmt(inv.total_cents)}</span>
                    <span style={{ fontSize: 11, fontWeight: 500, color: STATUS_COLORS[inv.status] || T.text3, textTransform: "capitalize" }}>
                      {inv.status}
                    </span>
                    {inv.status !== "paid" && (
                      <a
                        href={`${baseUrl}/invoice/${inv.id}?token=${inv.access_token}`}
                        style={{ fontSize: 12, fontWeight: 600, color: T.gold, textDecoration: "none" }}
                      >
                        Pay
                      </a>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {tab === "projects" && (
          <div>
            <p style={{ fontSize: 16, fontWeight: 600, color: T.text, marginBottom: 16 }}>Projects</p>
            {projects.length === 0 ? (
              <p style={{ fontSize: 13, color: T.text3 }}>No projects yet.</p>
            ) : (
              projects.map((proj) => {
                const total = proj.deliverables.length;
                const done = proj.deliverables.filter((d) => d.status === "completed").length;
                const pct = total > 0 ? Math.round((done / total) * 100) : 0;
                return (
                  <div key={proj.id} style={{ marginBottom: 24, paddingBottom: 24, borderBottom: `1px solid ${T.border}` }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                      <div>
                        <span style={{ fontSize: 15, fontWeight: 600, color: T.text }}>{proj.name}</span>
                        <span style={{ fontSize: 11, fontWeight: 500, color: STATUS_COLORS[proj.status] || T.text3, marginLeft: 8, textTransform: "capitalize" }}>
                          {proj.status.replace(/_/g, " ")}
                        </span>
                      </div>
                      {proj.due_date && (
                        <span style={{ fontSize: 12, color: T.text3 }}>
                          Due {new Date(proj.due_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </span>
                      )}
                    </div>
                    {proj.description && (
                      <p style={{ fontSize: 13, color: T.text2, marginBottom: 10 }}>{proj.description}</p>
                    )}

                    {/* Progress */}
                    {total > 0 && (
                      <div style={{ marginBottom: 12 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                          <span style={{ fontSize: 11, color: T.text3 }}>{done}/{total} deliverables</span>
                          <span style={{ fontSize: 11, color: T.text3 }}>{pct}%</span>
                        </div>
                        <div style={{ height: 4, background: T.border, borderRadius: 2 }}>
                          <div style={{ height: 4, background: T.gold, borderRadius: 2, width: `${pct}%`, transition: "width 0.3s" }} />
                        </div>
                      </div>
                    )}

                    {/* Deliverables */}
                    {proj.deliverables.map((d) => (
                      <div key={d.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 0" }}>
                        <div style={{
                          width: 16, height: 16, borderRadius: 3, flexShrink: 0,
                          border: `1.5px solid ${d.status === "completed" ? T.gold : T.border}`,
                          background: d.status === "completed" ? T.goldDim : "transparent",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          color: T.gold, fontSize: 10,
                        }}>
                          {d.status === "completed" ? "✓" : ""}
                        </div>
                        <span style={{
                          fontSize: 13, color: d.status === "completed" ? T.text3 : T.text,
                          textDecoration: d.status === "completed" ? "line-through" : "none",
                        }}>
                          {d.name}
                        </span>
                        {d.due_date && (
                          <span style={{ fontSize: 11, color: T.text3, marginLeft: "auto" }}>
                            {new Date(d.due_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{ borderTop: `1px solid ${T.border}`, padding: "16px 24px", textAlign: "center" }}>
        <p style={{ fontSize: 11, color: T.text3 }}>Powered by kovra</p>
      </div>
    </div>
  );
}
