"use client";

import { useBusinessContext } from "@/components/dashboard/BusinessProvider";
import { PaywallGate } from "@/components/dashboard/PaywallGate";
import { T, CTA_GRAD } from "@/lib/design-tokens";
import { useParams } from "next/navigation";
import { useState, useEffect, useCallback } from "react";

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

const RULE = { borderBottom: "1px solid #1E1E21" } as const;

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

  // Availability settings
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

  useEffect(() => {
    fetchCalls();
  }, [fetchCalls]);

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
    const res = await fetch("/api/businesses/update", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        businessId,
        availability_settings: { days, startHour, endHour, slotDuration, timezone },
      }),
    });
    setSavingSettings(false);
    if (res.ok) {
      setShowSettings(false);
    }
  }

  const bookingUrl = typeof window !== "undefined"
    ? `${window.location.origin}/book/${businessId}`
    : `/book/${businessId}`;

  return (
    <PaywallGate
      requiredPlan="starter"
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
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28, flexWrap: "wrap", gap: 12 }}>
          <div>
            <h1 style={{ fontFamily: T.h, fontSize: 28, fontWeight: 700, color: T.text, letterSpacing: "-0.5px" }}>
              Discovery Calls
            </h1>
            <p style={{ fontSize: 14, color: "#9CA3AF", marginTop: 4 }}>
              {upcoming.length} upcoming
            </p>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button
              onClick={() => setShowSettings(!showSettings)}
              style={{
                padding: "10px 20px", borderRadius: 10,
                background: "rgba(255,255,255,0.04)", border: `1px solid ${T.border}`,
                color: T.text2, fontSize: 13, cursor: "pointer",
              }}
            >
              Settings
            </button>
            <button
              onClick={() => navigator.clipboard.writeText(bookingUrl)}
              style={{
                background: CTA_GRAD, color: "#09090B", border: "none",
                padding: "10px 20px", borderRadius: 10, fontSize: 13,
                fontWeight: 600, cursor: "pointer",
              }}
            >
              Copy Booking Link
            </button>
          </div>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div style={{ paddingBottom: 24, marginBottom: 24, ...RULE }}>
            <h3 style={{ fontFamily: T.h, fontSize: 16, fontWeight: 600, color: T.text, marginBottom: 20 }}>
              Booking Settings
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {/* Available Days */}
              <div>
                <label style={{ fontSize: 12, color: "#9CA3AF", display: "block", marginBottom: 8 }}>Available Days</label>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {DAY_NAMES.map((day) => (
                    <button
                      key={day}
                      onClick={() => setDays({ ...days, [day]: !days[day] })}
                      style={{
                        padding: "8px 14px", borderRadius: 8,
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

              {/* Time Range */}
              <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                <div>
                  <label style={{ fontSize: 12, color: "#9CA3AF", display: "block", marginBottom: 6 }}>Start Hour</label>
                  <select
                    value={startHour}
                    onChange={(e) => setStartHour(parseInt(e.target.value))}
                    style={{ padding: "8px 12px", borderRadius: 8, background: "rgba(255,255,255,0.04)", border: `1px solid ${T.border}`, color: T.text, fontSize: 13, outline: "none" }}
                  >
                    {Array.from({ length: 24 }, (_, i) => (
                      <option key={i} value={i} style={{ background: T.bgEl }}>{`${i}:00`}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 12, color: "#9CA3AF", display: "block", marginBottom: 6 }}>End Hour</label>
                  <select
                    value={endHour}
                    onChange={(e) => setEndHour(parseInt(e.target.value))}
                    style={{ padding: "8px 12px", borderRadius: 8, background: "rgba(255,255,255,0.04)", border: `1px solid ${T.border}`, color: T.text, fontSize: 13, outline: "none" }}
                  >
                    {Array.from({ length: 24 }, (_, i) => (
                      <option key={i} value={i} style={{ background: T.bgEl }}>{`${i}:00`}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 12, color: "#9CA3AF", display: "block", marginBottom: 6 }}>Slot Duration</label>
                  <select
                    value={slotDuration}
                    onChange={(e) => setSlotDuration(parseInt(e.target.value))}
                    style={{ padding: "8px 12px", borderRadius: 8, background: "rgba(255,255,255,0.04)", border: `1px solid ${T.border}`, color: T.text, fontSize: 13, outline: "none" }}
                  >
                    {[15, 30, 45, 60].map((d) => (
                      <option key={d} value={d} style={{ background: T.bgEl }}>{d} min</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 12, color: "#9CA3AF", display: "block", marginBottom: 6 }}>Timezone</label>
                  <input
                    type="text" value={timezone} onChange={(e) => setTimezone(e.target.value)}
                    style={{ padding: "8px 12px", borderRadius: 8, background: "rgba(255,255,255,0.04)", border: `1px solid ${T.border}`, color: T.text, fontSize: 13, outline: "none", width: 200 }}
                  />
                </div>
              </div>

              {/* Booking Link */}
              <div>
                <label style={{ fontSize: 12, color: "#9CA3AF", display: "block", marginBottom: 6 }}>Booking Link</label>
                <div style={{ display: "flex", gap: 8 }}>
                  <input
                    type="text" value={bookingUrl} readOnly
                    style={{ flex: 1, padding: "8px 12px", borderRadius: 8, background: "rgba(255,255,255,0.04)", border: `1px solid ${T.border}`, color: T.text2, fontSize: 12, fontFamily: T.mono, outline: "none" }}
                  />
                  <button
                    onClick={() => navigator.clipboard.writeText(bookingUrl)}
                    style={{ padding: "8px 16px", borderRadius: 8, background: "rgba(255,255,255,0.06)", border: `1px solid ${T.border}`, color: T.text2, fontSize: 12, cursor: "pointer" }}
                  >
                    Copy
                  </button>
                </div>
              </div>

              <button
                onClick={saveSettings}
                disabled={savingSettings}
                style={{
                  padding: "10px 24px", borderRadius: 10,
                  background: CTA_GRAD, border: "none",
                  color: "#09090B", fontSize: 13, fontWeight: 600, cursor: "pointer",
                  alignSelf: "flex-start",
                }}
              >
                {savingSettings ? "Saving..." : "Save Settings"}
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: "center", padding: 60, color: "#9CA3AF" }}>Loading...</div>
        ) : (
          <>
            {/* Upcoming Calls */}
            <div style={{ marginBottom: 40 }}>
              <h2 style={{ fontFamily: T.h, fontSize: 18, fontWeight: 600, color: T.text, marginBottom: 16 }}>
                Upcoming
              </h2>
              {upcoming.length === 0 ? (
                <div style={{ padding: "32px 0" }}>
                  <p style={{ fontSize: 15, fontWeight: 500, color: T.text, marginBottom: 6 }}>
                    No upcoming calls yet
                  </p>
                  <p style={{ fontSize: 13, color: "#9CA3AF", lineHeight: 1.6, maxWidth: 520, marginBottom: 24 }}>
                    Discovery calls let potential clients book time with you directly. They pick a slot
                    from your availability, receive an automatic confirmation email, and you get notified
                    so you can prepare.
                  </p>

                  <div style={{ ...RULE, marginBottom: 20 }} />

                  <p style={{ fontSize: 13, fontWeight: 600, color: T.text, marginBottom: 12 }}>
                    How it works
                  </p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
                    {[
                      { step: "1", label: "Share your booking link", desc: "Post it on your website, social bios, or send it directly to leads." },
                      { step: "2", label: "Client picks a time", desc: "They see your available slots based on the settings you configure above." },
                      { step: "3", label: "Both sides get notified", desc: "Automatic confirmation emails go out. The call appears here for you to manage." },
                      { step: "4", label: "Track outcomes", desc: "After the call, mark it complete and log notes so you never lose context." },
                    ].map((item) => (
                      <div key={item.step} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                        <span style={{
                          width: 22, height: 22, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center",
                          background: "rgba(200,164,78,0.10)", color: T.gold, fontSize: 11, fontWeight: 700, flexShrink: 0,
                        }}>
                          {item.step}
                        </span>
                        <div>
                          <span style={{ fontSize: 13, fontWeight: 500, color: T.text }}>{item.label}</span>
                          <p style={{ fontSize: 12, color: "#52525B", marginTop: 2, lineHeight: 1.5 }}>{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div style={{ ...RULE, marginBottom: 20 }} />

                  <p style={{ fontSize: 13, fontWeight: 600, color: T.text, marginBottom: 8 }}>
                    Your booking link
                  </p>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <span style={{ fontSize: 12, color: T.text2, fontFamily: T.mono, padding: "6px 10px", background: "rgba(255,255,255,0.03)", borderRadius: 6 }}>
                      {bookingUrl}
                    </span>
                    <button
                      onClick={() => navigator.clipboard.writeText(bookingUrl)}
                      style={{
                        background: CTA_GRAD, color: "#09090B", border: "none",
                        padding: "8px 16px", borderRadius: 8, fontSize: 12,
                        fontWeight: 600, cursor: "pointer",
                      }}
                    >
                      Copy Link
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  {upcoming.map((call, idx) => {
                    const ss = statusStyle(call.status);
                    const d = new Date(call.scheduled_at);
                    const isLast = idx === upcoming.length - 1;
                    return (
                      <div key={call.id} style={{ padding: "16px 0", ...(isLast ? {} : RULE) }}>
                        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
                          <div>
                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                              <span style={{ fontSize: 16, fontWeight: 600, color: T.text }}>{call.name}</span>
                              <span style={{ padding: "3px 8px", borderRadius: 5, fontSize: 11, fontWeight: 600, background: ss.bg, color: ss.color }}>
                                {call.status}
                              </span>
                            </div>
                            <p style={{ fontSize: 13, color: "#9CA3AF", marginTop: 4 }}>{call.email}</p>
                            {call.phone && <p style={{ fontSize: 13, color: "#52525B", marginTop: 2 }}>{call.phone}</p>}
                            {call.notes && <p style={{ fontSize: 13, color: "#52525B", marginTop: 6, fontStyle: "italic" }}>{call.notes}</p>}
                          </div>
                          <div style={{ textAlign: "right" }}>
                            <p style={{ fontSize: 14, fontWeight: 600, color: T.text, fontFamily: T.mono }}>
                              {d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                            </p>
                            <p style={{ fontSize: 13, color: "#9CA3AF", fontFamily: T.mono }}>
                              {d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} ({call.duration_minutes}m)
                            </p>
                            <div style={{ display: "flex", gap: 8, marginTop: 10, justifyContent: "flex-end" }}>
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
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Past Calls */}
            {past.length > 0 && (
              <div>
                <h2 style={{ fontFamily: T.h, fontSize: 18, fontWeight: 600, color: T.text, marginBottom: 16 }}>
                  Past
                </h2>
                <div>
                  {past.slice(0, 20).map((call, idx) => {
                    const ss = statusStyle(call.status);
                    const d = new Date(call.scheduled_at);
                    const isLast = idx === Math.min(past.length, 20) - 1;
                    return (
                      <div key={call.id} style={{ padding: "12px 0", ...(isLast ? {} : RULE), opacity: 0.7 }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                            <span style={{ fontSize: 14, fontWeight: 500, color: T.text }}>{call.name}</span>
                            <span style={{ padding: "2px 6px", borderRadius: 4, fontSize: 10, fontWeight: 600, background: ss.bg, color: ss.color }}>
                              {call.status}
                            </span>
                            {call.outcome && (
                              <span style={{ fontSize: 12, color: "#52525B" }}>{call.outcome}</span>
                            )}
                          </div>
                          <span style={{ fontSize: 12, color: "#52525B", fontFamily: T.mono }}>
                            {d.toLocaleDateString()}
                          </span>
                        </div>
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
