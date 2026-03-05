"use client";

import { useBusinessContext } from "@/components/dashboard/BusinessProvider";
import { PaywallGate } from "@/components/dashboard/PaywallGate";
import { T, CTA_GRAD } from "@/lib/design-tokens";
import { useParams } from "next/navigation";
import { useState, useEffect, useCallback } from "react";

interface IntakeField {
  label: string;
  type: "text" | "textarea" | "select";
  options?: string;
  required: boolean;
}

interface Call {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  scheduled_at: string;
  duration_minutes: number;
  status: string;
  notes: string | null;
  call_notes: string | null;
  outcome: string | null;
}

interface AvailabilitySettings {
  days?: Record<string, boolean>;
  startHour?: number;
  endHour?: number;
  slotDuration?: number;
  timezone?: string;
}

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function statusStyle(status: string) {
  const map: Record<string, { bg: string; color: string }> = {
    scheduled: { bg: "rgba(59,130,246,0.15)", color: "#3b82f6" },
    confirmed: { bg: "rgba(34,197,94,0.15)", color: T.green },
    completed: { bg: "rgba(123,57,252,0.15)", color: T.purpleLight },
    cancelled: { bg: "rgba(239,68,68,0.15)", color: "#ef4444" },
    no_show: { bg: "rgba(245,158,11,0.15)", color: T.gold },
  };
  return map[status] || map.scheduled;
}

export default function CallsPage() {
  const params = useParams();
  const businessId = params.businessId as string;
  const { business, userId } = useBusinessContext();

  const [calls, setCalls] = useState<Call[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSettings, setShowSettings] = useState(false);

  const [intakeFields, setIntakeFields] = useState<IntakeField[]>(
    (business?.intake_form_fields as IntakeField[] | undefined) || []
  );
  const [savingIntake, setSavingIntake] = useState(false);
  const [calendarCopied, setCalendarCopied] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  const availability = (business?.availability_settings || {}) as AvailabilitySettings;
  const [days, setDays] = useState<Record<string, boolean>>(
    availability.days || { Monday: true, Tuesday: true, Wednesday: true, Thursday: true, Friday: true, Saturday: false, Sunday: false }
  );
  const [startHour, setStartHour] = useState(availability.startHour || 9);
  const [endHour, setEndHour] = useState(availability.endHour || 17);
  const [slotDuration, setSlotDuration] = useState(availability.slotDuration || 30);
  const [timezone, setTimezone] = useState(availability.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone);
  const [savingSettings, setSavingSettings] = useState(false);

  const fetchCalls = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/discovery-calls?businessId=${businessId}`);
    if (res.ok) {
      const data = await res.json();
      setCalls(data.calls);
    }
    setLoading(false);
  }, [businessId]);

  useEffect(() => { fetchCalls(); }, [fetchCalls]);

  const now = new Date();
  const upcoming = calls.filter((c) => new Date(c.scheduled_at) >= now && c.status !== "cancelled" && c.status !== "completed");
  const past = calls.filter((c) => new Date(c.scheduled_at) < now || c.status === "completed" || c.status === "cancelled");

  async function updateCall(callId: string, data: Record<string, unknown>) {
    const res = await fetch("/api/discovery-calls", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ callId, ...data }),
    });
    if (res.ok) fetchCalls();
  }

  async function cancelCall(callId: string) {
    if (!confirm("Cancel this call?")) return;
    const res = await fetch("/api/discovery-calls", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ callId }),
    });
    if (res.ok) fetchCalls();
  }

  async function saveSettings() {
    setSavingSettings(true);
    await fetch("/api/businesses/update", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        businessId,
        availability_settings: { days, startHour, endHour, slotDuration, timezone },
      }),
    });
    setSavingSettings(false);
    setShowSettings(false);
  }

  const bookingUrl = typeof window !== "undefined"
    ? `${window.location.origin}/book/${businessId}`
    : `/book/${businessId}`;

  const calendarFeedUrl = typeof window !== "undefined"
    ? `${window.location.origin}/api/calendar/${businessId}/feed.ics`
    : `/api/calendar/${businessId}/feed.ics`;

  const saveIntakeForm = async () => {
    setSavingIntake(true);
    await fetch("/api/businesses/update", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ businessId, intake_form_fields: intakeFields }),
    });
    setSavingIntake(false);
  };

  const addIntakeField = () => {
    setIntakeFields([...intakeFields, { label: "", type: "text", required: false }]);
  };

  const updateIntakeField = (idx: number, patch: Partial<IntakeField>) => {
    setIntakeFields(intakeFields.map((f, i) => i === idx ? { ...f, ...patch } : f));
  };

  const removeIntakeField = (idx: number) => {
    setIntakeFields(intakeFields.filter((_, i) => i !== idx));
  };

  void userId;

  const selectStyle: React.CSSProperties = {
    padding: "8px 12px", borderRadius: 8,
    background: "rgba(255,255,255,0.04)", border: `1px solid ${T.border}`,
    color: T.text, fontSize: 13, outline: "none",
  };

  return (
    <PaywallGate
      requiredPlan="solo"
      teaser={{
        headline: "Discovery Call Booking",
        description: "Let clients book discovery calls directly. Manage your schedule, get reminders, and track outcomes.",
        bullets: [
          "Public booking page with your brand",
          "Automatic confirmation & reminder emails",
          "Availability settings with timezone support",
          "Call notes and outcome tracking",
        ],
      }}
    >
      <div style={{ padding: "32px 40px 80px" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
          <div>
            <h1 style={{ fontFamily: T.h, fontSize: 28, fontWeight: 700, color: T.text, letterSpacing: "-0.5px", margin: 0 }}>
              Discovery Calls
            </h1>
            <p style={{ fontSize: 14, color: T.text2, marginTop: 4 }}>
              {upcoming.length} upcoming · {past.length} past
            </p>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={() => setShowSettings(!showSettings)}
              style={{
                padding: "10px 18px", borderRadius: 9,
                background: showSettings ? T.bgAlt : T.bgEl, border: `1px solid ${T.border}`,
                color: T.text2, fontSize: 13, cursor: "pointer",
              }}
            >
              {showSettings ? "Hide settings" : "Settings"}
            </button>
            <button
              onClick={() => { navigator.clipboard.writeText(bookingUrl); setLinkCopied(true); setTimeout(() => setLinkCopied(false), 2000); }}
              style={{
                background: linkCopied ? T.goldDim : CTA_GRAD,
                color: linkCopied ? T.gold : "#09090B",
                border: linkCopied ? `1px solid ${T.gold}` : "none",
                padding: "10px 18px", borderRadius: 9, fontSize: 13,
                fontWeight: 600, cursor: "pointer",
              }}
            >
              {linkCopied ? "Copied!" : "Copy Booking Link"}
            </button>
          </div>
        </div>

        {/* Stats cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 24 }}>
          {[
            { label: "Upcoming", value: upcoming.length, color: T.blue },
            { label: "Completed", value: past.filter((c) => c.status === "completed").length, color: T.green },
            { label: "Cancelled", value: past.filter((c) => c.status === "cancelled").length, color: T.text3 },
          ].map((s) => (
            <div key={s.label} style={{ padding: "16px 20px", borderRadius: 10, background: T.bgEl, border: `1px solid ${T.border}` }}>
              <span style={{ fontSize: 26, fontWeight: 700, color: s.color, fontFamily: T.h, display: "block" }}>{s.value}</span>
              <span style={{ fontSize: 12, color: T.text3, display: "block", marginTop: 2 }}>{s.label}</span>
            </div>
          ))}
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div style={{
            background: T.bgEl, border: `1px solid ${T.border}`,
            borderRadius: 12, padding: 20, marginBottom: 20,
          }}>
            <h3 style={{ fontFamily: T.h, fontSize: 15, fontWeight: 600, color: T.text, marginBottom: 20 }}>
              Booking Settings
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div>
                <label style={{ fontSize: 12, color: T.text2, display: "block", marginBottom: 8 }}>Available Days</label>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {DAY_NAMES.map((day) => (
                    <button
                      key={day}
                      onClick={() => setDays({ ...days, [day]: !days[day] })}
                      style={{
                        padding: "7px 13px", borderRadius: 8,
                        background: days[day] ? "rgba(123,57,252,0.15)" : "rgba(255,255,255,0.04)",
                        border: days[day] ? `1px solid ${T.purple}40` : `1px solid ${T.border}`,
                        color: days[day] ? T.purpleLight : T.text3,
                        fontSize: 12, fontWeight: 500, cursor: "pointer",
                      }}
                    >
                      {day.slice(0, 3)}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                <div>
                  <label style={{ fontSize: 12, color: T.text2, display: "block", marginBottom: 6 }}>Start Hour</label>
                  <select value={startHour} onChange={(e) => setStartHour(parseInt(e.target.value))} style={selectStyle}>
                    {Array.from({ length: 24 }, (_, i) => (
                      <option key={i} value={i} style={{ background: T.bgEl }}>{`${i}:00`}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 12, color: T.text2, display: "block", marginBottom: 6 }}>End Hour</label>
                  <select value={endHour} onChange={(e) => setEndHour(parseInt(e.target.value))} style={selectStyle}>
                    {Array.from({ length: 24 }, (_, i) => (
                      <option key={i} value={i} style={{ background: T.bgEl }}>{`${i}:00`}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 12, color: T.text2, display: "block", marginBottom: 6 }}>Slot Duration</label>
                  <select value={slotDuration} onChange={(e) => setSlotDuration(parseInt(e.target.value))} style={selectStyle}>
                    {[15, 30, 45, 60].map((d) => (
                      <option key={d} value={d} style={{ background: T.bgEl }}>{d} min</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 12, color: T.text2, display: "block", marginBottom: 6 }}>Timezone</label>
                  <input
                    type="text" value={timezone} onChange={(e) => setTimezone(e.target.value)}
                    style={{ ...selectStyle, width: 220 }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: 12, color: T.text2, display: "block", marginBottom: 6 }}>Booking Link</label>
                <div style={{ display: "flex", gap: 8 }}>
                  <input type="text" value={bookingUrl} readOnly
                    style={{ flex: 1, ...selectStyle, color: T.text2, fontSize: 12, fontFamily: T.mono }} />
                  <button
                    onClick={() => navigator.clipboard.writeText(bookingUrl)}
                    style={{ padding: "8px 14px", borderRadius: 8, background: "rgba(255,255,255,0.06)", border: `1px solid ${T.border}`, color: T.text2, fontSize: 12, cursor: "pointer" }}
                  >
                    Copy
                  </button>
                </div>
              </div>

              <button
                onClick={saveSettings}
                disabled={savingSettings}
                style={{
                  padding: "10px 22px", borderRadius: 9, background: CTA_GRAD, border: "none",
                  color: "#09090B", fontSize: 13, fontWeight: 600, cursor: "pointer",
                  alignSelf: "flex-start", opacity: savingSettings ? 0.7 : 1,
                }}
              >
                {savingSettings ? "Saving..." : "Save Settings"}
              </button>
            </div>
          </div>
        )}

        {/* Intake Form */}
        <div style={{ background: T.bgEl, border: `1px solid ${T.border}`, borderRadius: 12, padding: 20, marginBottom: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <div>
              <h3 style={{ fontSize: 14, fontWeight: 600, color: T.text, margin: 0 }}>Intake Form</h3>
              <p style={{ fontSize: 12, color: T.text2, marginTop: 3 }}>Fields shown to clients after they pick a time slot.</p>
            </div>
            <button
              onClick={addIntakeField}
              style={{ fontSize: 12, color: T.gold, background: T.goldDim, border: `1px solid rgba(200,164,78,0.2)`, borderRadius: 6, padding: "6px 12px", cursor: "pointer", fontWeight: 500 }}
            >
              + Add field
            </button>
          </div>

          {intakeFields.length === 0 ? (
            <p style={{ fontSize: 13, color: T.text3, margin: 0 }}>No intake fields yet.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 12 }}>
              {intakeFields.map((field, idx) => (
                <div key={idx} style={{ display: "grid", gridTemplateColumns: "1fr 120px 80px 32px", gap: 8, alignItems: "center" }}>
                  <input
                    value={field.label}
                    onChange={(e) => updateIntakeField(idx, { label: e.target.value })}
                    placeholder="Field label"
                    style={{ padding: "8px 10px", borderRadius: 7, background: "rgba(255,255,255,0.04)", border: `1px solid ${T.border}`, color: T.text, fontSize: 12, outline: "none" }}
                  />
                  <select
                    value={field.type}
                    onChange={(e) => updateIntakeField(idx, { type: e.target.value as IntakeField["type"] })}
                    style={{ padding: "8px 10px", borderRadius: 7, background: "rgba(255,255,255,0.04)", border: `1px solid ${T.border}`, color: T.text, fontSize: 12, outline: "none" }}
                  >
                    <option value="text">Text</option>
                    <option value="textarea">Long text</option>
                    <option value="select">Dropdown</option>
                  </select>
                  <button
                    onClick={() => updateIntakeField(idx, { required: !field.required })}
                    style={{
                      fontSize: 11, padding: "6px 8px", borderRadius: 6,
                      background: field.required ? "rgba(200,164,78,0.1)" : "rgba(255,255,255,0.03)",
                      border: `1px solid ${field.required ? T.gold : T.border}`,
                      color: field.required ? T.gold : T.text2, cursor: "pointer",
                    }}
                  >
                    {field.required ? "Required" : "Optional"}
                  </button>
                  <button
                    onClick={() => removeIntakeField(idx)}
                    style={{ fontSize: 16, color: T.text3, background: "none", border: "none", cursor: "pointer", lineHeight: 1 }}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          {intakeFields.length > 0 && (
            <button
              onClick={saveIntakeForm}
              disabled={savingIntake}
              style={{ fontSize: 12, fontWeight: 500, padding: "7px 16px", borderRadius: 7, background: CTA_GRAD, border: "none", color: "#09090B", cursor: "pointer", opacity: savingIntake ? 0.6 : 1, marginTop: 4 }}
            >
              {savingIntake ? "Saving..." : "Save form"}
            </button>
          )}
        </div>

        {/* Calendar Feed */}
        <div style={{ background: T.bgEl, border: `1px solid ${T.border}`, borderRadius: 12, padding: 20, marginBottom: 28 }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: T.text, margin: "0 0 4px" }}>Calendar Feed</h3>
          <p style={{ fontSize: 12, color: T.text2, marginBottom: 12 }}>Subscribe in Google Calendar, Apple Calendar, or Outlook.</p>
          <div style={{ display: "flex", gap: 8 }}>
            <input type="text" value={calendarFeedUrl} readOnly
              style={{ flex: 1, padding: "8px 12px", borderRadius: 8, background: "rgba(255,255,255,0.04)", border: `1px solid ${T.border}`, color: T.text2, fontSize: 12, fontFamily: T.mono, outline: "none" }}
            />
            <button
              onClick={() => { navigator.clipboard.writeText(calendarFeedUrl); setCalendarCopied(true); setTimeout(() => setCalendarCopied(false), 2000); }}
              style={{ padding: "8px 16px", borderRadius: 8, background: calendarCopied ? T.goldDim : "rgba(255,255,255,0.06)", border: `1px solid ${calendarCopied ? T.gold : T.border}`, color: calendarCopied ? T.gold : T.text2, fontSize: 12, cursor: "pointer", whiteSpace: "nowrap" }}
            >
              {calendarCopied ? "Copied!" : "Copy URL"}
            </button>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: 60, color: T.text3 }}>Loading...</div>
        ) : (
          <>
            {/* Upcoming Calls */}
            <div style={{ marginBottom: 32 }}>
              <h2 style={{ fontFamily: T.h, fontSize: 17, fontWeight: 600, color: T.text, marginBottom: 14 }}>
                Upcoming
              </h2>
              {upcoming.length === 0 ? (
                <div style={{
                  textAlign: "center", padding: "40px 24px",
                  borderRadius: 12, border: `1px dashed ${T.border}`, background: T.bgEl,
                }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 10, background: T.goldDim,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    margin: "0 auto 14px", fontSize: 20,
                  }}>
                    📅
                  </div>
                  <h3 style={{ fontFamily: T.h, fontSize: 16, fontWeight: 600, color: T.text, marginBottom: 6 }}>No upcoming calls</h3>
                  <p style={{ fontSize: 13, color: T.text2, maxWidth: 300, margin: "0 auto 18px", lineHeight: 1.5 }}>
                    Share your booking link and clients can book directly from your availability.
                  </p>
                  <button
                    onClick={() => { navigator.clipboard.writeText(bookingUrl); setLinkCopied(true); setTimeout(() => setLinkCopied(false), 2000); }}
                    style={{ background: CTA_GRAD, color: "#09090B", border: "none", padding: "9px 20px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer" }}
                  >
                    {linkCopied ? "Copied!" : "Copy Booking Link"}
                  </button>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {upcoming.map((call) => {
                    const ss = statusStyle(call.status);
                    const d = new Date(call.scheduled_at);
                    return (
                      <div key={call.id} style={{
                        background: T.bgEl, border: `1px solid ${T.border}`,
                        borderRadius: 12, padding: "16px 20px",
                        display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, flexWrap: "wrap",
                      }}>
                        <div>
                          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                            <span style={{ fontSize: 15, fontWeight: 600, color: T.text }}>{call.name}</span>
                            <span style={{ padding: "2px 8px", borderRadius: 100, fontSize: 11, fontWeight: 600, background: ss.bg, color: ss.color }}>
                              {call.status}
                            </span>
                          </div>
                          <p style={{ fontSize: 13, color: T.text2, margin: 0 }}>{call.email}</p>
                          {call.phone && <p style={{ fontSize: 12, color: T.text3, marginTop: 2 }}>{call.phone}</p>}
                          {call.notes && <p style={{ fontSize: 12, color: T.text2, marginTop: 6, fontStyle: "italic" }}>{call.notes}</p>}
                        </div>
                        <div style={{ textAlign: "right", flexShrink: 0 }}>
                          <p style={{ fontSize: 14, fontWeight: 600, color: T.text, fontFamily: T.mono }}>
                            {d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                          </p>
                          <p style={{ fontSize: 13, color: T.text2, fontFamily: T.mono }}>
                            {d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} ({call.duration_minutes}m)
                          </p>
                          <div style={{ display: "flex", gap: 10, marginTop: 10, justifyContent: "flex-end" }}>
                            <button
                              onClick={() => updateCall(call.id, { status: "completed" })}
                              style={{ fontSize: 12, color: T.green, background: "none", border: "none", cursor: "pointer" }}
                            >
                              Complete
                            </button>
                            <button
                              onClick={() => cancelCall(call.id)}
                              style={{ fontSize: 12, color: "#ef4444", background: "none", border: "none", cursor: "pointer" }}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Past Calls */}
            {past.length > 0 && (
              <div>
                <h2 style={{ fontFamily: T.h, fontSize: 17, fontWeight: 600, color: T.text, marginBottom: 14 }}>
                  Past
                </h2>
                <div style={{ borderRadius: 12, border: `1px solid ${T.border}`, overflow: "hidden" }}>
                  {past.slice(0, 20).map((call, idx) => {
                    const ss = statusStyle(call.status);
                    const d = new Date(call.scheduled_at);
                    return (
                      <div key={call.id} style={{
                        display: "flex", alignItems: "center", justifyContent: "space-between",
                        padding: "12px 16px", opacity: 0.75,
                        borderBottom: idx < Math.min(past.length, 20) - 1 ? `1px solid ${T.border}` : "none",
                      }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <span style={{ fontSize: 14, fontWeight: 500, color: T.text }}>{call.name}</span>
                          <span style={{ padding: "2px 7px", borderRadius: 100, fontSize: 10, fontWeight: 600, background: ss.bg, color: ss.color }}>
                            {call.status}
                          </span>
                          {call.outcome && <span style={{ fontSize: 12, color: T.text3 }}>{call.outcome}</span>}
                        </div>
                        <span style={{ fontSize: 12, color: T.text3, fontFamily: T.mono }}>
                          {d.toLocaleDateString()}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </PaywallGate>
  );
}
