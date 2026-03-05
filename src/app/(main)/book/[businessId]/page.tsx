"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";

interface AvailabilitySettings {
  days?: Record<string, boolean>;
  startHour?: number;
  endHour?: number;
  slotDuration?: number;
  timezone?: string;
}

interface IntakeField {
  label: string;
  type: "text" | "textarea" | "select";
  options?: string;
  required: boolean;
}

interface Business {
  id: string;
  name: string;
  tagline: string;
  brand: { colors?: { primary?: string; accent?: string; background?: string; text?: string }; tone?: string } | null;
  availability_settings: AvailabilitySettings;
  intake_form_fields?: IntakeField[];
}

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function generateTimeSlots(startHour: number, endHour: number, duration: number) {
  const slots: string[] = [];
  for (let h = startHour; h < endHour; h++) {
    for (let m = 0; m < 60; m += duration) {
      const hour = h.toString().padStart(2, "0");
      const min = m.toString().padStart(2, "0");
      slots.push(`${hour}:${min}`);
    }
  }
  return slots;
}

function formatTime(time: string) {
  const [h, m] = time.split(":");
  const hour = parseInt(h);
  const ampm = hour >= 12 ? "PM" : "AM";
  const h12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return `${h12}:${m} ${ampm}`;
}

export default function BookingPage() {
  const params = useParams();
  const businessId = params.businessId as string;

  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [step, setStep] = useState<"date" | "intake" | "form" | "success">("date");
  const [intakeAnswers, setIntakeAnswers] = useState<Record<string, string>>({});

  // Form
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      // Fetch business via supabase directly (public page)
      const res = await fetch(`/api/businesses/${businessId}`).catch(() => null);
      if (res?.ok) {
        const data = await res.json();
        setBusiness(data.business);
      } else {
        // Fallback: try fetching from a public endpoint or show error
        // For now, try the discovery calls API to at least confirm business exists
      }
      setLoading(false);
    }
    load();
  }, [businessId]);

  useEffect(() => {
    if (!selectedDate || !businessId) return;
    // Fetch booked slots for selected date
    async function fetchBooked() {
      const dateStr = selectedDate!.toISOString().split("T")[0];
      const res = await fetch(`/api/discovery-calls?businessId=${businessId}&status=scheduled`);
      if (res.ok) {
        const data = await res.json();
        const daySlots = data.calls
          .filter((c: { scheduled_at: string }) => c.scheduled_at.startsWith(dateStr))
          .map((c: { scheduled_at: string }) => {
            const d = new Date(c.scheduled_at);
            return `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
          });
        setBookedSlots(daySlots);
      }
    }
    fetchBooked();
  }, [selectedDate, businessId]);

  async function handleSubmit() {
    if (!selectedDate || !selectedTime || !name || !email) return;
    setSubmitting(true);
    setError(null);

    const [hours, minutes] = selectedTime.split(":").map(Number);
    const scheduledAt = new Date(selectedDate);
    scheduledAt.setHours(hours, minutes, 0, 0);

    const availability = business?.availability_settings || {};
    const duration = availability.slotDuration || 30;

    const res = await fetch("/api/discovery-calls", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        businessId,
        name,
        email,
        phone: phone || undefined,
        notes: notes || undefined,
        scheduledAt: scheduledAt.toISOString(),
        durationMinutes: duration,
        intakeResponses: Object.keys(intakeAnswers).length > 0 ? intakeAnswers : undefined,
      }),
    });

    if (res.ok) {
      setStep("success");
    } else {
      const data = await res.json();
      setError(data.error || "Failed to book. Please try again.");
    }
    setSubmitting(false);
  }

  const colors = business?.brand?.colors;
  const primary = colors?.primary || "#7B39FC";
  const bg = colors?.background || "#000000";
  const text = colors?.text || "#FAFAFA";

  // Generate calendar days (next 30 days)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const calendarDays: Date[] = [];
  for (let i = 1; i <= 30; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    calendarDays.push(d);
  }

  const availability = business?.availability_settings || {};
  const availableDays = availability.days || { Monday: true, Tuesday: true, Wednesday: true, Thursday: true, Friday: true };
  const startHour = availability.startHour || 9;
  const endHour = availability.endHour || 17;
  const slotDuration = availability.slotDuration || 30;

  const filteredDays = calendarDays.filter((d) => {
    const dayName = DAY_NAMES[d.getDay()];
    return availableDays[dayName] !== false;
  });

  const timeSlots = generateTimeSlots(startHour, endHour, slotDuration);
  const availableSlots = timeSlots.filter((t) => !bookedSlots.includes(t));

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: text, opacity: 0.5 }}>Loading...</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: bg, padding: "40px 16px" }}>
      <div style={{ maxWidth: 560, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: text, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            {business?.name || "Book a Call"}
          </h1>
          {business?.tagline && (
            <p style={{ fontSize: 15, color: `${text}99`, marginTop: 8 }}>{business.tagline}</p>
          )}
        </div>

        {step === "success" ? (
          <div
            style={{
              background: `${primary}10`,
              border: `1px solid ${primary}30`,
              borderRadius: 16,
              padding: "48px 32px",
              textAlign: "center",
            }}
          >
            <div
              style={{
                width: 56, height: 56, borderRadius: "50%",
                background: `${primary}20`,
                display: "flex", alignItems: "center", justifyContent: "center",
                margin: "0 auto 20px",
              }}
            >
              <svg width="28" height="28" fill="none" stroke={primary} viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: text, marginBottom: 12 }}>You&apos;re booked!</h2>
            <p style={{ fontSize: 15, color: `${text}88`, lineHeight: 1.6 }}>
              Your discovery call has been scheduled. You&apos;ll receive a confirmation email shortly.
            </p>
            {selectedDate && selectedTime && (
              <div
                style={{
                  background: `${text}08`,
                  borderRadius: 10,
                  padding: "16px 20px",
                  marginTop: 24,
                  display: "inline-block",
                }}
              >
                <p style={{ fontSize: 14, color: text, fontWeight: 600 }}>
                  {selectedDate.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
                </p>
                <p style={{ fontSize: 14, color: `${text}88`, marginTop: 4 }}>{formatTime(selectedTime)}</p>
              </div>
            )}
          </div>
        ) : step === "intake" ? (
          <div
            style={{
              background: `${text}06`,
              border: `1px solid ${text}12`,
              borderRadius: 16,
              padding: "32px",
            }}
          >
            <h2 style={{ fontSize: 18, fontWeight: 600, color: text, marginBottom: 4 }}>A few quick questions</h2>
            <p style={{ fontSize: 13, color: `${text}60`, marginBottom: 24 }}>
              {selectedDate?.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })} at {selectedTime && formatTime(selectedTime)}
              <button onClick={() => { setStep("date"); setSelectedTime(null); }} style={{ color: primary, background: "none", border: "none", cursor: "pointer", marginLeft: 8, fontSize: 13 }}>Change</button>
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {(business?.intake_form_fields || []).map((field, idx) => (
                <div key={idx}>
                  <label style={{ fontSize: 12, color: `${text}60`, display: "block", marginBottom: 6 }}>
                    {field.label}{field.required && " *"}
                  </label>
                  {field.type === "textarea" ? (
                    <textarea
                      rows={3}
                      value={intakeAnswers[field.label] || ""}
                      onChange={(e) => setIntakeAnswers({ ...intakeAnswers, [field.label]: e.target.value })}
                      style={{ width: "100%", padding: "12px 14px", borderRadius: 10, background: `${text}06`, border: `1px solid ${text}15`, color: text, fontSize: 14, outline: "none", resize: "vertical" }}
                    />
                  ) : field.type === "select" ? (
                    <select
                      value={intakeAnswers[field.label] || ""}
                      onChange={(e) => setIntakeAnswers({ ...intakeAnswers, [field.label]: e.target.value })}
                      style={{ width: "100%", padding: "12px 14px", borderRadius: 10, background: `${text}06`, border: `1px solid ${text}15`, color: text, fontSize: 14, outline: "none" }}
                    >
                      <option value="">Select...</option>
                      {(field.options || "").split(",").map((o) => o.trim()).filter(Boolean).map((o) => (
                        <option key={o} value={o}>{o}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={intakeAnswers[field.label] || ""}
                      onChange={(e) => setIntakeAnswers({ ...intakeAnswers, [field.label]: e.target.value })}
                      style={{ width: "100%", padding: "12px 14px", borderRadius: 10, background: `${text}06`, border: `1px solid ${text}15`, color: text, fontSize: 14, outline: "none" }}
                    />
                  )}
                </div>
              ))}
            </div>
            <button
              onClick={() => setStep("form")}
              disabled={(business?.intake_form_fields || []).some((f) => f.required && !intakeAnswers[f.label])}
              style={{
                width: "100%", padding: "14px", borderRadius: 12, marginTop: 24,
                background: primary, border: "none", color: "#fff",
                fontSize: 15, fontWeight: 600, cursor: "pointer",
                opacity: (business?.intake_form_fields || []).some((f) => f.required && !intakeAnswers[f.label]) ? 0.5 : 1,
              }}
            >
              Continue
            </button>
          </div>
        ) : step === "form" ? (
          <div
            style={{
              background: `${text}06`,
              border: `1px solid ${text}12`,
              borderRadius: 16,
              padding: "32px",
            }}
          >
            <h2 style={{ fontSize: 18, fontWeight: 600, color: text, marginBottom: 4 }}>Your details</h2>
            <p style={{ fontSize: 13, color: `${text}60`, marginBottom: 24 }}>
              {selectedDate?.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })} at {selectedTime && formatTime(selectedTime)}
              <button onClick={() => { setStep("date"); setSelectedTime(null); }} style={{ color: primary, background: "none", border: "none", cursor: "pointer", marginLeft: 8, fontSize: 13 }}>Change</button>
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={{ fontSize: 12, color: `${text}60`, display: "block", marginBottom: 6 }}>Name *</label>
                <input
                  value={name} onChange={(e) => setName(e.target.value)}
                  style={{ width: "100%", padding: "12px 14px", borderRadius: 10, background: `${text}06`, border: `1px solid ${text}15`, color: text, fontSize: 14, outline: "none" }}
                />
              </div>
              <div>
                <label style={{ fontSize: 12, color: `${text}60`, display: "block", marginBottom: 6 }}>Email *</label>
                <input
                  type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  style={{ width: "100%", padding: "12px 14px", borderRadius: 10, background: `${text}06`, border: `1px solid ${text}15`, color: text, fontSize: 14, outline: "none" }}
                />
              </div>
              <div>
                <label style={{ fontSize: 12, color: `${text}60`, display: "block", marginBottom: 6 }}>Phone</label>
                <input
                  type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
                  style={{ width: "100%", padding: "12px 14px", borderRadius: 10, background: `${text}06`, border: `1px solid ${text}15`, color: text, fontSize: 14, outline: "none" }}
                />
              </div>
              <div>
                <label style={{ fontSize: 12, color: `${text}60`, display: "block", marginBottom: 6 }}>Notes</label>
                <textarea
                  value={notes} onChange={(e) => setNotes(e.target.value)} rows={3}
                  placeholder="Anything we should know beforehand?"
                  style={{ width: "100%", padding: "12px 14px", borderRadius: 10, background: `${text}06`, border: `1px solid ${text}15`, color: text, fontSize: 14, outline: "none", resize: "vertical" }}
                />
              </div>
            </div>
            {error && <p style={{ fontSize: 13, color: "#ef4444", marginTop: 12 }}>{error}</p>}
            <button
              onClick={handleSubmit}
              disabled={submitting || !name || !email}
              style={{
                width: "100%", padding: "14px", borderRadius: 12, marginTop: 24,
                background: primary, border: "none", color: "#fff",
                fontSize: 15, fontWeight: 600, cursor: submitting ? "wait" : "pointer",
                opacity: submitting || !name || !email ? 0.6 : 1,
              }}
            >
              {submitting ? "Booking..." : "Confirm Booking"}
            </button>
          </div>
        ) : (
          <>
            {/* Date Selection */}
            <div
              style={{
                background: `${text}06`,
                border: `1px solid ${text}12`,
                borderRadius: 16,
                padding: "24px",
                marginBottom: 24,
              }}
            >
              <h3 style={{ fontSize: 16, fontWeight: 600, color: text, marginBottom: 16 }}>Select a date</h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))", gap: 8 }}>
                {filteredDays.slice(0, 14).map((d) => {
                  const isSelected = selectedDate?.toDateString() === d.toDateString();
                  return (
                    <button
                      key={d.toISOString()}
                      onClick={() => { setSelectedDate(d); setSelectedTime(null); }}
                      style={{
                        padding: "12px 8px", borderRadius: 10,
                        background: isSelected ? primary : `${text}06`,
                        border: isSelected ? "none" : `1px solid ${text}12`,
                        color: isSelected ? "#fff" : text,
                        fontSize: 13, cursor: "pointer", textAlign: "center",
                      }}
                    >
                      <div style={{ fontWeight: 600 }}>{d.toLocaleDateString("en-US", { weekday: "short" })}</div>
                      <div style={{ fontSize: 18, fontWeight: 700, margin: "4px 0" }}>{d.getDate()}</div>
                      <div style={{ fontSize: 11, opacity: 0.6 }}>{d.toLocaleDateString("en-US", { month: "short" })}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Time Selection */}
            {selectedDate && (
              <div
                style={{
                  background: `${text}06`,
                  border: `1px solid ${text}12`,
                  borderRadius: 16,
                  padding: "24px",
                }}
              >
                <h3 style={{ fontSize: 16, fontWeight: 600, color: text, marginBottom: 16 }}>
                  Select a time — {selectedDate.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
                </h3>
                {availableSlots.length === 0 ? (
                  <p style={{ fontSize: 14, color: `${text}60` }}>No available slots for this date.</p>
                ) : (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))", gap: 8 }}>
                    {availableSlots.map((t) => {
                      const isSelected = selectedTime === t;
                      return (
                        <button
                          key={t}
                          onClick={() => {
                            setSelectedTime(t);
                            const fields = business?.intake_form_fields || [];
                            setStep(fields.length > 0 ? "intake" : "form");
                          }}
                          style={{
                            padding: "12px", borderRadius: 10,
                            background: isSelected ? primary : `${text}06`,
                            border: isSelected ? "none" : `1px solid ${text}12`,
                            color: isSelected ? "#fff" : text,
                            fontSize: 14, fontWeight: 500, cursor: "pointer",
                          }}
                        >
                          {formatTime(t)}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
