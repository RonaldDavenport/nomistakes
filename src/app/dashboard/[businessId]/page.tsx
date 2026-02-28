"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useBusinessContext } from "@/components/dashboard/BusinessProvider";
import { WelcomeTour } from "@/components/dashboard/WelcomeTour";
import { PaywallGate } from "@/components/dashboard/PaywallGate";
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

/* ── helpers ── */

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

function deriveCurrentPhase(phases: PhaseGroup[]): number {
  const first = phases.find((p) =>
    p.tasks.some((t) => t.status !== "completed" && t.status !== "skipped")
  );
  return first ? first.phase : -1; // -1 means all done
}

function phaseTimeLeft(tasks: TaskWithStatus[]): number {
  return tasks
    .filter((t) => t.status !== "completed" && t.status !== "skipped")
    .reduce((sum, t) => sum + t.estimatedMinutes, 0);
}

function aiCoachHint(task: TaskWithStatus): string | null {
  if (task.aiCapability === "full") return "Your AI Coach can generate this for you. Click below to get started.";
  if (task.aiCapability === "draft") return "Your AI Coach can draft this. You review and refine.";
  if (task.aiCapability === "strategy") return "Ask your AI Coach for a tailored strategy on this.";
  return null;
}

/* ── PhaseStepper ── */

function PhaseStepper({
  phases,
  currentPhase,
  reviewPhase,
  onReview,
}: {
  phases: PhaseGroup[];
  currentPhase: number;
  reviewPhase: number | null;
  onReview: (phase: number | null) => void;
}) {
  return (
    <div className="flex items-center justify-center gap-0 mb-8 overflow-x-auto px-2">
      {phases.map((p, i) => {
        const isDone = p.tasks.every((t) => t.status === "completed" || t.status === "skipped");
        const isCurrent = p.phase === currentPhase;
        const isReviewing = p.phase === reviewPhase;

        return (
          <div key={p.phase} className="flex items-center">
            {/* Dot */}
            <button
              onClick={() => isDone ? onReview(isReviewing ? null : p.phase) : undefined}
              className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-all ${
                isDone
                  ? "bg-emerald-500/15 text-emerald-400 border-2 border-emerald-500/30 cursor-pointer hover:border-emerald-400"
                  : isCurrent
                    ? "bg-brand-600/15 text-brand-400 border-2 border-brand-500/50 ring-4 ring-brand-500/10"
                    : "bg-white/5 text-zinc-600 border-2 border-white/10 cursor-default"
              }`}
              title={isDone ? `Review: ${p.title}` : p.title}
            >
              {isDone ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              ) : (
                p.phase
              )}
            </button>
            {/* Connector line */}
            {i < phases.length - 1 && (
              <div className={`w-8 sm:w-12 h-0.5 ${
                isDone ? "bg-emerald-500/30" : "bg-white/5"
              }`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ── PhaseHero ── */

function PhaseHero({ phase, tasks }: { phase: PhaseGroup; tasks: TaskWithStatus[] }) {
  const completed = tasks.filter((t) => t.status === "completed").length;
  const total = tasks.length;
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
  const minsLeft = phaseTimeLeft(tasks);

  return (
    <div className="mb-8">
      <div className="flex items-start justify-between gap-4 mb-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-brand-400 mb-1">
            Phase {phase.phase}
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">{phase.title}</h1>
        </div>
        <div className="text-right shrink-0">
          <p className="text-sm text-zinc-400">
            {completed}/{total} tasks
          </p>
          {minsLeft > 0 && (
            <p className="text-xs text-zinc-600">~{minsLeft} min left</p>
          )}
        </div>
      </div>
      <div className="h-2 rounded-full bg-white/5 overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-brand-600 to-purple-500 transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

/* ── TaskList ── */

function TaskList({
  tasks,
  plan,
  businessId,
  updatingTask,
  onComplete,
  onSkip,
}: {
  tasks: TaskWithStatus[];
  plan: string;
  businessId: string;
  updatingTask: string | null;
  onComplete: (taskId: string) => void;
  onSkip: (taskId: string) => void;
}) {
  // First pending task is the "current" one (expanded)
  const firstPending = tasks.find(
    (t) => t.status !== "completed" && t.status !== "skipped"
  );

  return (
    <div className="space-y-3">
      {tasks.map((task) => {
        const isCompleted = task.status === "completed";
        const isSkipped = task.status === "skipped";
        const isLocked = !meetsRequiredPlan(plan, task.requiredPlan);
        const isUpdating = updatingTask === task.id;
        const isCurrent = task.id === firstPending?.id;
        const hint = isCurrent ? aiCoachHint(task) : null;

        if (isCompleted || isSkipped) {
          /* ── Compact completed row ── */
          return (
            <div
              key={task.id}
              className="flex items-center gap-3 px-4 py-3 rounded-xl bg-emerald-500/[0.03] border border-emerald-500/10"
            >
              <div className="w-5 h-5 rounded-full bg-emerald-500/15 flex items-center justify-center shrink-0">
                <svg className="w-3 h-3 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              </div>
              <span className="text-sm text-zinc-400 flex-1">{task.title}</span>
              {isSkipped && (
                <span className="text-[10px] text-zinc-600">Skipped</span>
              )}
              <button
                onClick={() => onComplete(task.id)}
                className="text-[10px] text-zinc-600 hover:text-zinc-400 transition-colors"
              >
                Undo
              </button>
            </div>
          );
        }

        if (isCurrent) {
          /* ── Expanded current task ── */
          return (
            <div
              key={task.id}
              className="rounded-xl border border-brand-500/20 bg-brand-600/[0.04] overflow-hidden"
            >
              <div className="p-5">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-base font-semibold text-white">{task.title}</h3>
                      {task.aiCapability !== "manual" && (
                        <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                          task.aiCapability === "full"
                            ? "bg-brand-600/10 text-brand-400"
                            : task.aiCapability === "draft"
                              ? "bg-purple-500/10 text-purple-400"
                              : "bg-amber-500/10 text-amber-400"
                        }`}>
                          {task.aiCapability === "full" ? "AI Generate" : task.aiCapability === "draft" ? "AI Draft" : "AI Strategy"}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-zinc-400 leading-relaxed">{task.description}</p>
                  </div>
                  <span className="text-xs text-zinc-600 shrink-0">~{task.estimatedMinutes}m</span>
                </div>

                {/* AI Coach hint */}
                {hint && (
                  <div className="mt-4 p-3 rounded-lg bg-brand-600/[0.06] border border-brand-500/10 flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-brand-600/15 flex items-center justify-center shrink-0 mt-0.5">
                      <svg className="w-3.5 h-3.5 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-zinc-300 leading-relaxed">{hint}</p>
                      <Link
                        href={`/dashboard/${businessId}/chat`}
                        className="inline-block mt-2 text-xs text-brand-400 hover:text-brand-300 font-medium transition-colors"
                      >
                        Open AI Coach &rarr;
                      </Link>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="mt-4 flex items-center gap-3">
                  <button
                    onClick={() => onComplete(task.id)}
                    disabled={isUpdating}
                    className="btn-primary px-5 py-2.5 rounded-lg text-sm font-semibold text-white disabled:opacity-50"
                  >
                    {isUpdating ? "Saving..." : "Mark Complete"}
                  </button>
                  <button
                    onClick={() => onSkip(task.id)}
                    disabled={isUpdating}
                    className="px-4 py-2.5 rounded-lg text-sm font-medium text-zinc-500 hover:text-zinc-300 hover:bg-white/5 transition-all"
                  >
                    Skip
                  </button>
                  {task.externalUrl && (
                    <a
                      href={task.externalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-auto text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
                    >
                      Open link &rarr;
                    </a>
                  )}
                </div>
              </div>
            </div>
          );
        }

        /* ── Compact pending row ── */
        return (
          <div
            key={task.id}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl border border-white/5 bg-surface/30 ${
              isLocked ? "opacity-50" : ""
            }`}
          >
            <div className="w-5 h-5 rounded-full border border-white/15 shrink-0" />
            <span className={`text-sm flex-1 ${isLocked ? "text-zinc-600" : "text-zinc-400"}`}>
              {task.title}
            </span>
            {isLocked && (
              <PaywallGate requiredPlan={task.requiredPlan} compact>
                <span />
              </PaywallGate>
            )}
            {!isLocked && task.aiCapability !== "manual" && (
              <span className={`px-2 py-0.5 rounded text-[10px] font-medium shrink-0 ${
                task.aiCapability === "full"
                  ? "bg-brand-600/10 text-brand-400"
                  : task.aiCapability === "draft"
                    ? "bg-purple-500/10 text-purple-400"
                    : "bg-amber-500/10 text-amber-400"
              }`}>
                {task.aiCapability === "full" ? "AI" : task.aiCapability === "draft" ? "Draft" : "Strategy"}
              </span>
            )}
            <span className="text-[10px] text-zinc-600 shrink-0 hidden sm:block">
              ~{task.estimatedMinutes}m
            </span>
          </div>
        );
      })}
    </div>
  );
}

/* ── PhaseReview (inline, read-only) ── */

function PhaseReview({ phase, onClose }: { phase: PhaseGroup; onClose: () => void }) {
  const completed = phase.tasks.filter((t) => t.status === "completed").length;

  return (
    <div className="mb-8 rounded-xl border border-emerald-500/10 bg-emerald-500/[0.02] p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-full bg-emerald-500/15 flex items-center justify-center">
            <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Phase {phase.phase}: {phase.title}</p>
            <p className="text-xs text-zinc-500">{completed}/{phase.tasks.length} completed</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          Close
        </button>
      </div>
      <div className="space-y-1.5">
        {phase.tasks.map((t) => (
          <div key={t.id} className="flex items-center gap-2 px-3 py-1.5 text-xs">
            {t.status === "completed" ? (
              <svg className="w-3.5 h-3.5 text-emerald-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            ) : (
              <span className="w-3.5 h-3.5 text-center text-zinc-600 shrink-0">&mdash;</span>
            )}
            <span className={t.status === "completed" ? "text-zinc-400" : "text-zinc-600"}>
              {t.title}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── PhaseTransition ── */

function PhaseTransition({
  phase,
  nextPhase,
  onContinue,
}: {
  phase: PhaseGroup;
  nextPhase: PhaseGroup | null;
  onContinue: () => void;
}) {
  const completed = phase.tasks.filter((t) => t.status === "completed").length;
  const skipped = phase.tasks.filter((t) => t.status === "skipped").length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#111118] p-8 text-center">
        <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-emerald-500/10 flex items-center justify-center">
          <svg className="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-white mb-1">Phase {phase.phase} Complete!</h2>
        <p className="text-sm text-zinc-400 mb-1">{phase.title}</p>
        <p className="text-xs text-zinc-600 mb-6">
          {completed} completed{skipped > 0 ? `, ${skipped} skipped` : ""}
        </p>

        {nextPhase ? (
          <>
            <p className="text-xs text-zinc-500 mb-1">Up next</p>
            <p className="text-sm font-semibold text-white mb-6">
              Phase {nextPhase.phase}: {nextPhase.title}
            </p>
            <button
              onClick={onContinue}
              className="btn-primary w-full px-6 py-3 rounded-xl text-sm font-semibold text-white"
            >
              Continue to Phase {nextPhase.phase}
            </button>
          </>
        ) : (
          <button
            onClick={onContinue}
            className="btn-primary w-full px-6 py-3 rounded-xl text-sm font-semibold text-white"
          >
            View Results
          </button>
        )}
      </div>
    </div>
  );
}

/* ── CompletionView ── */

function CompletionView({
  phases,
  tasks,
  businessId,
  businessName,
  onReviewPhase,
}: {
  phases: PhaseGroup[];
  tasks: TaskWithStatus[];
  businessId: string;
  businessName: string;
  onReviewPhase: (phase: number) => void;
}) {
  const completed = tasks.filter((t) => t.status === "completed").length;
  const skipped = tasks.filter((t) => t.status === "skipped").length;
  const totalMinutes = tasks.reduce((s, t) => s + t.estimatedMinutes, 0);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <div className="w-20 h-20 mx-auto mb-5 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-brand-600/20 flex items-center justify-center">
          <svg className="w-10 h-10 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
          </svg>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
          Launch Checklist Complete
        </h1>
        <p className="text-zinc-400 text-sm">
          {businessName} is set up for success.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-8">
        <div className="p-4 rounded-xl border border-white/5 bg-surface/50 text-center">
          <p className="text-2xl font-bold text-emerald-400">{completed}</p>
          <p className="text-xs text-zinc-500 mt-1">Completed</p>
        </div>
        <div className="p-4 rounded-xl border border-white/5 bg-surface/50 text-center">
          <p className="text-2xl font-bold text-white">{phases.length}</p>
          <p className="text-xs text-zinc-500 mt-1">Phases</p>
        </div>
        <div className="p-4 rounded-xl border border-white/5 bg-surface/50 text-center">
          <p className="text-2xl font-bold text-white">~{totalMinutes}m</p>
          <p className="text-xs text-zinc-500 mt-1">Invested</p>
        </div>
      </div>

      {skipped > 0 && (
        <p className="text-xs text-zinc-600 text-center mb-6">
          {skipped} task{skipped > 1 ? "s" : ""} skipped &mdash; you can revisit them anytime.
        </p>
      )}

      <div className="rounded-xl border border-white/5 bg-surface/50 p-5 mb-6">
        <h3 className="text-sm font-semibold text-white mb-3">What to do now</h3>
        <ul className="space-y-2 text-sm text-zinc-400">
          <li className="flex items-start gap-2">
            <span className="text-brand-400 mt-0.5">&#8227;</span>
            Use your AI Coach to create content, draft emails, and strategize next moves.
          </li>
          <li className="flex items-start gap-2">
            <span className="text-brand-400 mt-0.5">&#8227;</span>
            Check out the recommended tools to accelerate your growth.
          </li>
          <li className="flex items-start gap-2">
            <span className="text-brand-400 mt-0.5">&#8227;</span>
            Revisit any phase below to redo or refine tasks.
          </li>
        </ul>
      </div>

      <div className="space-y-2 mb-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-2">Review phases</p>
        {phases.map((p) => (
          <button
            key={p.phase}
            onClick={() => onReviewPhase(p.phase)}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-white/5 bg-surface/30 hover:bg-white/[0.03] transition-all text-left"
          >
            <div className="w-6 h-6 rounded-full bg-emerald-500/15 flex items-center justify-center shrink-0">
              <svg className="w-3 h-3 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </div>
            <span className="text-sm text-white flex-1">Phase {p.phase}: {p.title}</span>
            <span className="text-xs text-zinc-600">{p.tasks.filter((t) => t.status === "completed").length}/{p.tasks.length}</span>
          </button>
        ))}
      </div>

      <div className="flex gap-3">
        <Link
          href={`/dashboard/${businessId}/chat`}
          className="btn-primary flex-1 px-4 py-3 rounded-xl text-sm font-semibold text-white text-center"
        >
          Talk to AI Coach
        </Link>
        <Link
          href={`/dashboard/${businessId}/tools`}
          className="btn-secondary flex-1 px-4 py-3 rounded-xl text-sm font-semibold text-zinc-300 text-center"
        >
          Browse Tools
        </Link>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   MAIN PAGE
   ══════════════════════════════════════════════════════════════════ */

export default function BusinessHome() {
  const params = useParams();
  const businessId = params.businessId as string;
  const { business, plan, loading } = useBusinessContext();

  const [tasks, setTasks] = useState<TaskWithStatus[]>([]);
  const [fetchingTasks, setFetchingTasks] = useState(true);
  const [updatingTask, setUpdatingTask] = useState<string | null>(null);
  const [reviewPhase, setReviewPhase] = useState<number | null>(null);
  const [showTransition, setShowTransition] = useState(false);
  const [transitionPhase, setTransitionPhase] = useState<number | null>(null);

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
    }
    setFetchingTasks(false);
  }

  async function updateTaskStatus(taskId: string, status: string) {
    if (!business) return;
    setUpdatingTask(taskId);

    // Optimistic update
    const prevTasks = tasks;
    const updated = tasks.map((t) =>
      t.id === taskId
        ? { ...t, status, completedAt: status === "completed" ? new Date().toISOString() : null }
        : t
    );
    setTasks(updated);

    const res = await fetch("/api/checklist", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ businessId: business.id, taskId, status }),
    });

    if (!res.ok) {
      setTasks(prevTasks); // rollback
    } else {
      // Check if we just completed a phase
      const phases = groupByPhase(updated);
      const taskPhase = updated.find((t) => t.id === taskId)?.phase;
      if (taskPhase && status === "completed") {
        const phaseGroup = phases.find((p) => p.phase === taskPhase);
        if (phaseGroup && phaseGroup.tasks.every((t) => t.status === "completed" || t.status === "skipped")) {
          setTransitionPhase(taskPhase);
          setShowTransition(true);
        }
      }
    }

    setUpdatingTask(null);
  }

  if (loading || !business || fetchingTasks) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const phases = groupByPhase(tasks);
  const currentPhase = deriveCurrentPhase(phases);
  const allDone = currentPhase === -1;
  const currentPhaseGroup = phases.find((p) => p.phase === currentPhase);
  const transitionPhaseGroup = phases.find((p) => p.phase === transitionPhase);
  const nextPhaseGroup = transitionPhase
    ? phases.find((p) => p.phase === transitionPhase + 1) || null
    : null;
  const reviewPhaseGroup = reviewPhase ? phases.find((p) => p.phase === reviewPhase) : null;

  /* Phase transition overlay */
  if (showTransition && transitionPhaseGroup) {
    return (
      <PhaseTransition
        phase={transitionPhaseGroup}
        nextPhase={nextPhaseGroup}
        onContinue={() => {
          setShowTransition(false);
          setTransitionPhase(null);
        }}
      />
    );
  }

  /* All done */
  if (allDone) {
    if (reviewPhaseGroup) {
      return (
        <div className="p-4 sm:p-6 lg:p-8">
          <button
            onClick={() => setReviewPhase(null)}
            className="text-xs text-zinc-500 hover:text-zinc-300 mb-4 transition-colors"
          >
            &larr; Back to summary
          </button>
          <PhaseReview phase={reviewPhaseGroup} onClose={() => setReviewPhase(null)} />
        </div>
      );
    }
    return (
      <CompletionView
        phases={phases}
        tasks={tasks}
        businessId={businessId}
        businessName={business.name}
        onReviewPhase={setReviewPhase}
      />
    );
  }

  /* Active phase */
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <WelcomeTour />

      <PhaseStepper
        phases={phases}
        currentPhase={currentPhase}
        reviewPhase={reviewPhase}
        onReview={setReviewPhase}
      />

      {/* Review drawer (inline) */}
      {reviewPhaseGroup && (
        <PhaseReview phase={reviewPhaseGroup} onClose={() => setReviewPhase(null)} />
      )}

      {/* Current phase */}
      {currentPhaseGroup && (
        <>
          <PhaseHero phase={currentPhaseGroup} tasks={currentPhaseGroup.tasks} />
          <TaskList
            tasks={currentPhaseGroup.tasks}
            plan={plan}
            businessId={businessId}
            updatingTask={updatingTask}
            onComplete={(id) => {
              const task = tasks.find((t) => t.id === id);
              if (!task) return;
              const newStatus = task.status === "completed" ? "pending" : "completed";
              updateTaskStatus(id, newStatus);
            }}
            onSkip={(id) => updateTaskStatus(id, "skipped")}
          />
        </>
      )}
    </div>
  );
}
