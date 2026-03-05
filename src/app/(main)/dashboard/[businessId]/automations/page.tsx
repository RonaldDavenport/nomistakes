"use client";

import { useBusinessContext } from "@/components/dashboard/BusinessProvider";
import { PaywallGate } from "@/components/dashboard/PaywallGate";
import { T, CTA_GRAD } from "@/lib/design-tokens";
import { useParams } from "next/navigation";
import { useState, useEffect, useCallback } from "react";

interface Automation {
  id: string;
  name: string;
  trigger: string;
  action: string;
  action_config: Record<string, string>;
  enabled: boolean;
  last_run_at: string | null;
  created_at: string;
}

const TRIGGER_LABELS: Record<string, string> = {
  project_completed: "Project completed",
  invoice_paid: "Invoice paid",
  contact_inactive_30d: "Contact inactive 30 days",
  booking_confirmed: "New booking confirmed",
};

const ACTION_LABELS: Record<string, string> = {
  send_email: "Send email",
  send_review_request: "Send review request",
  send_re_engagement: "Send re-engagement email",
};


const TEMPLATES = [
  { name: "Request review after project", trigger: "project_completed", action: "send_review_request", config: { google_review_url: "" } },
  { name: "Re-engage inactive contacts", trigger: "contact_inactive_30d", action: "send_re_engagement", config: { subject: "Checking in — still thinking about it?", body: "<p>Hi there,</p><p>Just wanted to check in and see how things are going. If you're still interested in working together, we'd love to reconnect.</p>" } },
  { name: "Follow up after invoice paid", trigger: "invoice_paid", action: "send_email", config: { subject: "Thank you for your payment!", body: "<p>Hi there,</p><p>Thank you for your payment. We appreciate your business!</p>" } },
];

export default function AutomationsPage() {
  const params = useParams();
  const businessId = params.businessId as string;
  useBusinessContext();

  const [automations, setAutomations] = useState<Automation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [saving, setSaving] = useState(false);

  // Create form
  const [name, setName] = useState("");
  const [trigger, setTrigger] = useState("project_completed");
  const [action, setAction] = useState("send_review_request");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [reviewUrl, setReviewUrl] = useState("");

  const fetchAutomations = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/automations?businessId=${businessId}`);
    const data = await res.json();
    setAutomations(data.automations || []);
    setLoading(false);
  }, [businessId]);

  useEffect(() => { fetchAutomations(); }, [fetchAutomations]);

  const applyTemplate = (t: typeof TEMPLATES[number]) => {
    setName(t.name);
    setTrigger(t.trigger);
    setAction(t.action);
    if ("google_review_url" in t.config) setReviewUrl(t.config.google_review_url || "");
    if ("subject" in t.config) setSubject(t.config.subject || "");
    if ("body" in t.config) setBody(t.config.body || "");
  };

  const createAutomation = async () => {
    if (!name.trim()) return;
    setSaving(true);
    const config: Record<string, string> = {};
    if (action === "send_review_request") config.google_review_url = reviewUrl;
    else { config.subject = subject; config.body = body; }

    await fetch("/api/automations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ businessId, name, trigger, action, actionConfig: config }),
    });
    setSaving(false);
    setShowCreate(false);
    setName(""); setTrigger("project_completed"); setAction("send_review_request");
    setSubject(""); setBody(""); setReviewUrl("");
    fetchAutomations();
  };

  const toggleEnabled = async (automationId: string, current: boolean) => {
    await fetch("/api/automations", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ automationId, enabled: !current }),
    });
    fetchAutomations();
  };

  const deleteAutomation = async (automationId: string) => {
    if (!confirm("Delete this automation?")) return;
    await fetch("/api/automations", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ automationId }),
    });
    fetchAutomations();
  };

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "10px 12px", fontSize: 13,
    background: T.bgAlt, border: `1px solid ${T.border}`,
    borderRadius: 8, color: T.text, outline: "none", boxSizing: "border-box",
  };

  return (
    <PaywallGate requiredPlan="scale" teaser={{ headline: "Workflow Automations", description: "Automate follow-ups, review requests, and re-engagement emails.", bullets: ["Trigger on project completion", "Review request automation", "Re-engage inactive contacts"] }}>
      <div style={{ padding: "32px 40px 80px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
          <div>
            <h1 style={{ fontFamily: T.h, fontSize: 28, fontWeight: 700, color: T.text, letterSpacing: "-0.5px", margin: 0 }}>Automations</h1>
            <p style={{ fontSize: 14, color: T.text2, marginTop: 4 }}>Set rules that fire automatically based on client activity.</p>
          </div>
          <button onClick={() => setShowCreate(true)} style={{ background: CTA_GRAD, color: "#09090B", border: "none", borderRadius: 8, padding: "10px 20px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
            + New Automation
          </button>
        </div>

        {loading ? (
          <p style={{ color: T.text3, fontSize: 13 }}>Loading...</p>
        ) : automations.length === 0 ? (
          <div style={{ maxWidth: 560, paddingTop: 16 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: T.text, marginBottom: 8 }}>Automate your follow-ups</h2>
            <p style={{ fontSize: 14, color: T.text2, lineHeight: 1.6, marginBottom: 24 }}>
              Set rules that fire automatically — request reviews when projects close, re-engage contacts who go quiet, or send follow-ups after payments.
            </p>

            {/* Template cards */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 24 }}>
              {TEMPLATES.map((t) => (
                <button
                  key={t.name}
                  onClick={() => { applyTemplate(t); setShowCreate(true); }}
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "16px 20px", background: T.bgEl, border: `1px solid ${T.border}`,
                    borderRadius: 8, cursor: "pointer", textAlign: "left",
                  }}
                >
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 500, color: T.text, margin: 0 }}>{t.name}</p>
                    <p style={{ fontSize: 12, color: T.text2, margin: 0, marginTop: 4 }}>
                      When: {TRIGGER_LABELS[t.trigger]} → {ACTION_LABELS[t.action]}
                    </p>
                  </div>
                  <span style={{ fontSize: 12, color: T.gold, fontWeight: 500 }}>Use template →</span>
                </button>
              ))}
            </div>

            <button onClick={() => setShowCreate(true)} style={{ fontSize: 13, color: T.text3, background: "none", border: `1px solid ${T.border}`, borderRadius: 8, padding: "8px 16px", cursor: "pointer" }}>
              Build from scratch
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {automations.map((a) => (
              <div key={a.id} style={{ background: T.bgEl, border: `1px solid ${T.border}`, borderRadius: 10, padding: "18px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: T.text }}>{a.name}</span>
                    <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 10, background: a.enabled ? "rgba(34,197,94,0.1)" : "rgba(255,255,255,0.05)", color: a.enabled ? T.green : T.text2 }}>
                      {a.enabled ? "Active" : "Paused"}
                    </span>
                  </div>
                  <p style={{ fontSize: 12, color: T.text2, margin: 0 }}>
                    {TRIGGER_LABELS[a.trigger] || a.trigger} → {ACTION_LABELS[a.action] || a.action}
                  </p>
                  {a.last_run_at && (
                    <p style={{ fontSize: 11, color: T.text3, margin: 0, marginTop: 4 }}>
                      Last run: {new Date(a.last_run_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </p>
                  )}
                </div>
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <button
                    onClick={() => toggleEnabled(a.id, a.enabled)}
                    style={{ fontSize: 12, color: a.enabled ? T.text2 : T.green, background: "none", border: "none", cursor: "pointer", fontWeight: 500 }}
                  >
                    {a.enabled ? "Pause" : "Resume"}
                  </button>
                  <button
                    onClick={() => deleteAutomation(a.id)}
                    style={{ fontSize: 12, color: T.text2, background: "none", border: "none", cursor: "pointer" }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create modal */}
        {showCreate && (
          <>
            <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 50 }} onClick={() => setShowCreate(false)} />
            <div style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: 540, maxHeight: "85vh", overflowY: "auto", background: T.bgEl, border: `1px solid ${T.border}`, borderRadius: 12, padding: 28, zIndex: 51 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: T.text, marginBottom: 20 }}>New Automation</h2>

              <label style={{ display: "block", marginBottom: 16 }}>
                <span style={{ fontSize: 12, fontWeight: 500, color: T.text2, display: "block", marginBottom: 6 }}>Name *</span>
                <input value={name} onChange={(e) => setName(e.target.value)} style={inputStyle} placeholder="e.g. Request review after project" />
              </label>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
                <label style={{ display: "block" }}>
                  <span style={{ fontSize: 12, fontWeight: 500, color: T.text2, display: "block", marginBottom: 6 }}>Trigger</span>
                  <select value={trigger} onChange={(e) => setTrigger(e.target.value)} style={{ ...inputStyle, appearance: "none" as const }}>
                    {Object.entries(TRIGGER_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </label>
                <label style={{ display: "block" }}>
                  <span style={{ fontSize: 12, fontWeight: 500, color: T.text2, display: "block", marginBottom: 6 }}>Action</span>
                  <select value={action} onChange={(e) => setAction(e.target.value)} style={{ ...inputStyle, appearance: "none" as const }}>
                    {Object.entries(ACTION_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </label>
              </div>

              {action === "send_review_request" ? (
                <label style={{ display: "block", marginBottom: 16 }}>
                  <span style={{ fontSize: 12, fontWeight: 500, color: T.text2, display: "block", marginBottom: 6 }}>Google Review URL (optional)</span>
                  <input value={reviewUrl} onChange={(e) => setReviewUrl(e.target.value)} style={inputStyle} placeholder="https://g.page/r/..." />
                </label>
              ) : (
                <>
                  <label style={{ display: "block", marginBottom: 12 }}>
                    <span style={{ fontSize: 12, fontWeight: 500, color: T.text2, display: "block", marginBottom: 6 }}>Email Subject *</span>
                    <input value={subject} onChange={(e) => setSubject(e.target.value)} style={inputStyle} placeholder="e.g. Checking in..." />
                  </label>
                  <label style={{ display: "block", marginBottom: 16 }}>
                    <span style={{ fontSize: 12, fontWeight: 500, color: T.text2, display: "block", marginBottom: 6 }}>Email Body</span>
                    <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={5} style={{ ...inputStyle, resize: "vertical" }} placeholder="<p>Hi there,</p><p>...</p>" />
                  </label>
                </>
              )}

              <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
                <button onClick={() => setShowCreate(false)} style={{ padding: "10px 20px", fontSize: 13, background: "none", border: `1px solid ${T.border}`, borderRadius: 8, color: T.text2, cursor: "pointer" }}>Cancel</button>
                <button onClick={createAutomation} disabled={saving || !name.trim()} style={{ padding: "10px 20px", fontSize: 13, fontWeight: 600, background: CTA_GRAD, border: "none", borderRadius: 8, color: "#09090B", cursor: "pointer", opacity: saving ? 0.6 : 1 }}>
                  {saving ? "Creating..." : "Create Automation"}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </PaywallGate>
  );
}
