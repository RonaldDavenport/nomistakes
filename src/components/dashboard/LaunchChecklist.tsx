"use client";

import { useEffect, useState } from "react";
import { useBusinessContext } from "./BusinessProvider";
import { PaywallGate } from "./PaywallGate";
import { meetsRequiredPlan } from "@/lib/plans";
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
      <div className="p-6 rounded-xl border border-white/5 bg-surface/50">
        <div className="h-6 w-48 bg-white/5 rounded animate-pulse mb-4" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-white/5 rounded-lg animate-pulse" />
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
          <h2 className="text-lg font-bold text-white">Launch Checklist</h2>
          <span className="text-sm text-zinc-400">
            {totalCompleted}/{totalTasks} tasks ({pctComplete}%)
          </span>
        </div>
        <div className="h-2 rounded-full bg-white/5 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-brand-600 to-purple-500 transition-all duration-500"
            style={{ width: `${pctComplete}%` }}
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
            <div key={phase.phase} className="rounded-xl border border-white/5 bg-surface/50 overflow-hidden">
              <button
                onClick={() => setExpandedPhase(isExpanded ? null : phase.phase)}
                className="w-full flex items-center gap-4 p-4 sm:p-5 text-left hover:bg-white/[0.02] transition-all"
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold shrink-0 ${
                  isDone
                    ? "bg-emerald-500/10 text-emerald-400"
                    : "bg-brand-600/10 text-brand-400"
                }`}>
                  {isDone ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  ) : (
                    phase.phase
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white">{phase.title}</p>
                  <p className="text-xs text-zinc-500">{phaseCompleted}/{phaseTotal} tasks</p>
                </div>
                <div className="w-20 h-1.5 rounded-full bg-white/5 shrink-0 hidden sm:block">
                  <div
                    className={`h-full rounded-full transition-all ${isDone ? "bg-emerald-500" : "bg-brand-600"}`}
                    style={{ width: `${phasePct}%` }}
                  />
                </div>
                <svg
                  className={`w-4 h-4 text-zinc-500 transition-transform shrink-0 ${isExpanded ? "rotate-180" : ""}`}
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
                        className={`flex items-start gap-3 p-3 rounded-lg transition-all ${
                          isCompleted ? "bg-emerald-500/[0.03]" : "bg-white/[0.02]"
                        } ${isLocked ? "opacity-60" : ""}`}
                      >
                        {/* Checkbox */}
                        <button
                          onClick={() => {
                            if (isLocked) return;
                            updateTaskStatus(task.id, isCompleted ? "pending" : "completed");
                          }}
                          disabled={isLocked || isUpdating}
                          className={`w-5 h-5 rounded border shrink-0 mt-0.5 flex items-center justify-center transition-all ${
                            isCompleted
                              ? "bg-emerald-500 border-emerald-500"
                              : isLocked
                                ? "border-white/10 cursor-not-allowed"
                                : "border-white/20 hover:border-brand-500"
                          }`}
                        >
                          {isCompleted && (
                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                            </svg>
                          )}
                        </button>

                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium ${isCompleted ? "text-zinc-500 line-through" : "text-white"}`}>
                            {task.title}
                          </p>
                          <p className="text-xs text-zinc-600 mt-0.5 line-clamp-2">{task.description}</p>

                          {isLocked && (
                            <PaywallGate requiredPlan={task.requiredPlan} compact>
                              <span />
                            </PaywallGate>
                          )}
                        </div>

                        {/* AI badge */}
                        {!isLocked && !isCompleted && task.aiCapability !== "manual" && (
                          <span className={`px-2 py-0.5 rounded text-[10px] font-medium shrink-0 ${
                            task.aiCapability === "full"
                              ? "bg-brand-600/10 text-brand-400"
                              : task.aiCapability === "draft"
                                ? "bg-purple-500/10 text-purple-400"
                                : "bg-amber-500/10 text-amber-400"
                          }`}>
                            {task.aiCapability === "full" ? "AI Generate" : task.aiCapability === "draft" ? "AI Draft" : "AI Strategy"}
                          </span>
                        )}

                        {/* Time estimate */}
                        <span className="text-[10px] text-zinc-600 shrink-0 hidden sm:block">
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
