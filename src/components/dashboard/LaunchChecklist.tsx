"use client";

import { useEffect, useState } from "react";
import { useBusinessContext } from "./BusinessProvider";
import { PaywallGate } from "./PaywallGate";
import { meetsRequiredPlan } from "@/lib/plans";
import { T, CTA_GRAD, glassCard } from "@/lib/design-tokens";
import type { ChecklistTask } from "@/lib/checklist-data";

interface TaskWithStatus extends ChecklistTask {
  status: string;
  completedAt: string | null;
  metadata: Record<string, unknown>;
}

interface PhaseGroup {
  phase: number;
  title: string;
  tasks: TaskWithStatus[];
}

export function LaunchChecklist() {
  const { business, plan } = useBusinessContext();
  const [tasks, setTasks] = useState<TaskWithStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedPhase, setExpandedPhase] = useState<number | null>(1);
  const [updatingTask, setUpdatingTask] = useState<string | null>(null);

  useEffect(() => {
    if (!business) return;
    fetchChecklist();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [business?.id]);

  async function fetchChecklist() {
    if (!business) return;
    const res = await fetch(`/api/checklist?businessId=${business.id}`);
    if (res.ok) {
      const data = await res.json();
      setTasks(data.tasks);
      // Auto-expand the first incomplete phase
      const phases = groupByPhase(data.tasks);
      const firstIncomplete = phases.find((p) => p.tasks.some((t) => t.status !== "completed" && t.status !== "skipped"));
      if (firstIncomplete) setExpandedPhase(firstIncomplete.phase);
    }
    setLoading(false);
  }

  async function updateTaskStatus(taskId: string, status: string) {
    if (!business) return;
    setUpdatingTask(taskId);
    await fetch("/api/checklist", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ businessId: business.id, taskId, status }),
    });
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? { ...t, status, completedAt: status === "completed" ? new Date().toISOString() : null }
          : t
      )
    );
    setUpdatingTask(null);
  }

  function groupByPhase(items: TaskWithStatus[]): PhaseGroup[] {
    const map = new Map<number, PhaseGroup>();
    for (const task of items) {
      if (!map.has(task.phase)) {
        map.set(task.phase, { phase: task.phase, title: task.phaseTitle, tasks: [] });
      }
      map.get(task.phase)!.tasks.push(task);
    }
    return Array.from(map.values()).sort((a, b) => a.phase - b.phase);
  }

  if (loading) {
    return (
      <div className="p-6 rounded-xl" style={{ ...glassCard }}>
        <div className="h-6 w-48 rounded animate-pulse mb-4" style={{ background: "rgba(255,255,255,0.05)" }} />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 rounded-lg animate-pulse" style={{ background: "rgba(255,255,255,0.05)" }} />
          ))}
        </div>
      </div>
    );
  }

  const phases = groupByPhase(tasks);
  const totalCompleted = tasks.filter((t) => t.status === "completed").length;
  const totalTasks = tasks.length;
  const pctComplete = totalTasks > 0 ? Math.round((totalCompleted / totalTasks) * 100) : 0;

  return (
    <div>
      {/* Overall progress */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-bold" style={{ color: T.text, fontFamily: T.h }}>Launch Checklist</h2>
          <span className="text-sm" style={{ color: T.text2 }}>
            {totalCompleted}/{totalTasks} tasks ({pctComplete}%)
          </span>
        </div>
        <div className="h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.05)" }}>
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${pctComplete}%`, background: CTA_GRAD }}
          />
        </div>
      </div>

      {/* Phase accordion */}
      <div className="space-y-3">
        {phases.map((phase) => {
          const phaseCompleted = phase.tasks.filter((t) => t.status === "completed").length;
          const phaseTotal = phase.tasks.length;
          const phasePct = phaseTotal > 0 ? Math.round((phaseCompleted / phaseTotal) * 100) : 0;
          const isExpanded = expandedPhase === phase.phase;
          const isDone = phaseCompleted === phaseTotal;

          return (
            <div key={phase.phase} className="rounded-xl overflow-hidden" style={{ ...glassCard }}>
              <button
                onClick={() => setExpandedPhase(isExpanded ? null : phase.phase)}
                className="w-full flex items-center gap-4 p-4 sm:p-5 text-left transition-all"
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold shrink-0"
                  style={
                    isDone
                      ? { background: "rgba(34,197,94,0.10)", color: T.green }
                      : { background: "rgba(123,57,252,0.10)", color: T.purpleLight }
                  }
                >
                  {isDone ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  ) : (
                    phase.phase
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold" style={{ color: T.text }}>{phase.title}</p>
                  <p className="text-xs" style={{ color: T.text3 }}>{phaseCompleted}/{phaseTotal} tasks</p>
                </div>
                <div className="w-20 h-1.5 rounded-full shrink-0 hidden sm:block" style={{ background: "rgba(255,255,255,0.05)" }}>
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${phasePct}%`, background: isDone ? T.green : T.purple }}
                  />
                </div>
                <svg
                  className={`w-4 h-4 transition-transform shrink-0 ${isExpanded ? "rotate-180" : ""}`}
                  style={{ color: T.text3 }}
                  fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {isExpanded && (
                <div className="px-4 sm:px-5 pb-4 sm:pb-5 space-y-2">
                  {phase.tasks.map((task) => {
                    const isCompleted = task.status === "completed";
                    const isLocked = !meetsRequiredPlan(plan, task.requiredPlan);
                    const isUpdating = updatingTask === task.id;

                    return (
                      <div
                        key={task.id}
                        className="flex items-start gap-3 p-3 rounded-lg transition-all"
                        style={{
                          background: isCompleted ? "rgba(34,197,94,0.03)" : "rgba(255,255,255,0.02)",
                          opacity: isLocked ? 0.6 : 1,
                        }}
                      >
                        {/* Checkbox */}
                        <button
                          onClick={() => {
                            if (isLocked) return;
                            updateTaskStatus(task.id, isCompleted ? "pending" : "completed");
                          }}
                          disabled={isLocked || isUpdating}
                          className="w-5 h-5 rounded shrink-0 mt-0.5 flex items-center justify-center transition-all"
                          style={
                            isCompleted
                              ? { background: T.green, border: `1px solid ${T.green}` }
                              : isLocked
                                ? { border: "1px solid rgba(255,255,255,0.10)", cursor: "not-allowed" }
                                : { border: "1px solid rgba(255,255,255,0.20)" }
                          }
                        >
                          {isCompleted && (
                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                            </svg>
                          )}
                        </button>

                        <div className="flex-1 min-w-0">
                          <p
                            className="text-sm font-medium"
                            style={{
                              color: isCompleted ? T.text3 : T.text,
                              textDecoration: isCompleted ? "line-through" : "none",
                            }}
                          >
                            {task.title}
                          </p>
                          <p className="text-xs mt-0.5 line-clamp-2" style={{ color: T.text3 }}>{task.description}</p>

                          {isLocked && (
                            <PaywallGate requiredPlan={task.requiredPlan} compact>
                              <span />
                            </PaywallGate>
                          )}
                        </div>

                        {/* AI badge */}
                        {!isLocked && !isCompleted && task.aiCapability !== "manual" && (
                          <span
                            className="px-2 py-0.5 rounded text-[10px] font-medium shrink-0"
                            style={
                              task.aiCapability === "full"
                                ? { background: "rgba(123,57,252,0.10)", color: T.purpleLight }
                                : task.aiCapability === "draft"
                                  ? { background: "rgba(168,85,247,0.10)", color: T.purpleLight }
                                  : { background: "rgba(245,158,11,0.10)", color: T.gold }
                            }
                          >
                            {task.aiCapability === "full" ? "AI Generate" : task.aiCapability === "draft" ? "AI Draft" : "AI Strategy"}
                          </span>
                        )}

                        {/* Time estimate */}
                        <span className="text-[10px] shrink-0 hidden sm:block" style={{ color: T.text3 }}>
                          ~{task.estimatedMinutes}m
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
