"use client";

import { useBusinessContext } from "@/components/dashboard/BusinessProvider";
import { PaywallGate } from "@/components/dashboard/PaywallGate";
import { T, CTA_GRAD } from "@/lib/design-tokens";
import { useParams } from "next/navigation";
import { useState, useEffect, useCallback, useRef } from "react";

interface TimeEntry {
  id: string;
  description: string | null;
  started_at: string;
  ended_at: string | null;
  minutes: number | null;
  hourly_rate: number | null;
  billable: boolean;
  created_at: string;
  projects: { name: string } | null;
}


function formatMinutes(mins: number | null): string {
  if (!mins) return "—";
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

function formatElapsed(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export default function TimePage() {
  const params = useParams();
  const businessId = params.businessId as string;
  const { userId } = useBusinessContext();

  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [projects, setProjects] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);

  // Timer state
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerStart, setTimerStart] = useState<string | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [activeEntryId, setActiveEntryId] = useState<string | null>(null);
  const [timerDesc, setTimerDesc] = useState("");
  const [timerProject, setTimerProject] = useState("");
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchEntries = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/time-entries?businessId=${businessId}`);
    const data = await res.json();
    setEntries(data.entries || []);
    setLoading(false);
  }, [businessId]);

  const fetchProjects = useCallback(async () => {
    const res = await fetch(`/api/projects?businessId=${businessId}`);
    const data = await res.json();
    setProjects((data.projects || []).map((p: { id: string; name: string }) => ({ id: p.id, name: p.name })));
  }, [businessId]);

  useEffect(() => { fetchEntries(); fetchProjects(); }, [fetchEntries, fetchProjects]);

  // Timer tick
  useEffect(() => {
    if (timerRunning && timerStart) {
      intervalRef.current = setInterval(() => {
        setElapsed(Math.floor((Date.now() - new Date(timerStart).getTime()) / 1000));
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [timerRunning, timerStart]);

  const startTimer = async () => {
    const startedAt = new Date().toISOString();
    setTimerStart(startedAt);
    setTimerRunning(true);
    setElapsed(0);

    const res = await fetch("/api/time-entries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        businessId,
        userId,
        description: timerDesc || null,
        projectId: timerProject || null,
        startedAt,
        billable: true,
      }),
    });
    const data = await res.json();
    if (data.entry) setActiveEntryId(data.entry.id);
  };

  const stopTimer = async () => {
    if (!activeEntryId) return;
    setTimerRunning(false);
    const endedAt = new Date().toISOString();

    await fetch("/api/time-entries", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ entryId: activeEntryId, endedAt }),
    });

    setActiveEntryId(null);
    setTimerStart(null);
    setElapsed(0);
    setTimerDesc("");
    setTimerProject("");
    fetchEntries();
  };

  const deleteEntry = async (entryId: string) => {
    await fetch("/api/time-entries", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ entryId }),
    });
    fetchEntries();
  };

  // Stats
  const thisWeekEntries = entries.filter((e) => {
    const d = new Date(e.started_at);
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    weekStart.setHours(0, 0, 0, 0);
    return d >= weekStart;
  });
  const weekMinutes = thisWeekEntries.reduce((s, e) => s + (e.minutes || 0), 0);
  const billableMinutes = entries.filter((e) => e.billable).reduce((s, e) => s + (e.minutes || 0), 0);
  const billableValue = entries
    .filter((e) => e.billable && e.hourly_rate && e.minutes)
    .reduce((s, e) => s + (e.hourly_rate! * e.minutes! / 60), 0);

  const inputStyle: React.CSSProperties = {
    padding: "10px 12px", fontSize: 13,
    background: T.bgAlt, border: `1px solid ${T.border}`,
    borderRadius: 8, color: T.text, outline: "none",
  };

  return (
    <PaywallGate requiredPlan="scale" teaser={{ headline: "Time Tracking", description: "Track billable hours and generate time reports.", bullets: ["Built-in timer", "Billable hours tracking", "Per-project reporting"] }}>
      <div style={{ padding: "32px 40px 80px" }}>
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontFamily: T.h, fontSize: 28, fontWeight: 700, color: T.text, letterSpacing: "-0.5px", margin: 0 }}>Time Tracking</h1>
          <p style={{ fontSize: 14, color: T.text2, marginTop: 4 }}>Track billable hours across projects and clients.</p>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 24 }}>
          {[
            { label: "This Week", value: formatMinutes(weekMinutes), color: T.text },
            { label: "Billable Hours", value: formatMinutes(billableMinutes), color: T.gold },
            { label: "Billable Value", value: billableValue > 0 ? `$${billableValue.toFixed(2)}` : "$0.00", color: T.green },
          ].map((s) => (
            <div key={s.label} style={{ padding: "16px 20px", borderRadius: 10, background: T.bgEl, border: `1px solid ${T.border}` }}>
              <span style={{ fontSize: 26, fontWeight: 700, color: s.color, fontFamily: T.h, fontVariantNumeric: "tabular-nums", display: "block" }}>{s.value}</span>
              <span style={{ fontSize: 12, color: T.text3, display: "block", marginTop: 2 }}>{s.label}</span>
            </div>
          ))}
        </div>

        {/* Timer widget */}
        <div style={{ background: T.bgEl, border: `1px solid ${T.border}`, borderRadius: 10, padding: "20px 24px", marginBottom: 24 }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: T.text, marginBottom: 16 }}>Timer</p>
          <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
            <input
              value={timerDesc}
              onChange={(e) => setTimerDesc(e.target.value)}
              placeholder="What are you working on?"
              disabled={timerRunning}
              style={{ ...inputStyle, flex: 1, minWidth: 200 }}
            />
            <select
              value={timerProject}
              onChange={(e) => setTimerProject(e.target.value)}
              disabled={timerRunning}
              style={{ ...inputStyle, minWidth: 160, appearance: "none" as const }}
            >
              <option value="">No project</option>
              {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            {timerRunning && (
              <span style={{ fontSize: 18, fontWeight: 700, color: T.gold, fontVariantNumeric: "tabular-nums", minWidth: 80 }}>
                {formatElapsed(elapsed)}
              </span>
            )}
            <button
              onClick={timerRunning ? stopTimer : startTimer}
              style={{
                padding: "10px 24px", fontSize: 13, fontWeight: 600,
                background: timerRunning ? "rgba(239,68,68,0.1)" : CTA_GRAD,
                color: timerRunning ? T.red : "#09090B",
                border: timerRunning ? `1px solid ${T.red}` : "none",
                borderRadius: 8, cursor: "pointer",
              }}
            >
              {timerRunning ? "Stop" : "Start Timer"}
            </button>
          </div>
        </div>

        {/* Entries table */}
        {loading ? (
          <p style={{ color: T.text3, fontSize: 13 }}>Loading...</p>
        ) : entries.length === 0 ? (
          <div style={{
            textAlign: "center", padding: "48px 24px",
            borderRadius: 12, border: `1px dashed ${T.border}`, background: T.bgEl,
          }}>
            <p style={{ fontSize: 15, color: T.text, marginBottom: 4 }}>No entries yet</p>
            <p style={{ fontSize: 13, color: T.text3 }}>Start the timer above to log your first session.</p>
          </div>
        ) : (
          <div style={{ background: T.bgEl, border: `1px solid ${T.border}`, borderRadius: 12, overflow: "hidden" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 140px 80px 80px 80px 60px", gap: 12, padding: "10px 16px", borderBottom: `1px solid ${T.border}`, fontSize: 11, fontWeight: 600, color: T.text3, textTransform: "uppercase", letterSpacing: "0.06em" }}>
              <span>Description</span>
              <span>Project</span>
              <span>Duration</span>
              <span>Date</span>
              <span>Billable</span>
              <span style={{ textAlign: "right" }}></span>
            </div>
            {entries.map((e, idx) => (
              <div key={e.id} style={{ display: "grid", gridTemplateColumns: "1fr 140px 80px 80px 80px 60px", gap: 12, padding: "12px 16px", borderTop: idx > 0 ? `1px solid ${T.border}` : "none", alignItems: "center" }}>
                <span style={{ fontSize: 13, color: T.text }}>{e.description || <span style={{ color: T.text3 }}>No description</span>}</span>
                <span style={{ fontSize: 12, color: T.text2 }}>{e.projects?.name || "—"}</span>
                <span style={{ fontSize: 13, color: T.text, fontVariantNumeric: "tabular-nums" }}>{formatMinutes(e.minutes)}</span>
                <span style={{ fontSize: 12, color: T.text3 }}>
                  {new Date(e.started_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </span>
                <span style={{ fontSize: 12, color: e.billable ? T.green : T.text3 }}>{e.billable ? "Yes" : "No"}</span>
                <button onClick={() => deleteEntry(e.id)} style={{ fontSize: 11, color: T.text3, background: "none", border: "none", cursor: "pointer", textAlign: "right" }}>
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </PaywallGate>
  );
}
