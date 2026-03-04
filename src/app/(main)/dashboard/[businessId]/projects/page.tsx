"use client";

import { useBusinessContext } from "@/components/dashboard/BusinessProvider";
import { PaywallGate } from "@/components/dashboard/PaywallGate";
import { T, CTA_GRAD } from "@/lib/design-tokens";
import { useParams } from "next/navigation";
import { useState, useEffect, useCallback } from "react";

interface Deliverable {
  id: string;
  name: string;
  status: string;
  due_date: string | null;
  completed_at: string | null;
}

interface Project {
  id: string;
  name: string;
  description: string | null;
  status: string;
  start_date: string | null;
  due_date: string | null;
  completed_at: string | null;
  contacts: { name: string; email: string } | null;
  deliverables: Deliverable[];
}

const STATUS_COLORS: Record<string, string> = {
  active: T.green,
  completed: T.blue,
  on_hold: T.gold,
  cancelled: T.red,
};

const RULE = "#1E1E21";
const SUBTITLE = "#9CA3AF";
const DIM = "#52525B";

export default function ProjectsPage() {
  const params = useParams();
  const businessId = params.businessId as string;
  const { userId } = useBusinessContext();

  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [dueDate, setDueDate] = useState("");

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/projects?businessId=${businessId}`);
    const data = await res.json();
    setProjects(data.projects || []);
    setLoading(false);
  }, [businessId]);

  useEffect(() => { fetchProjects(); }, [fetchProjects]);

  const createProject = async () => {
    setSaving(true);
    await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ businessId, userId, name, description: desc, dueDate: dueDate || null }),
    });
    setSaving(false);
    setShowCreate(false);
    setName(""); setDesc(""); setDueDate("");
    fetchProjects();
  };

  const toggleDeliverable = async (deliverableId: string, current: string) => {
    await fetch("/api/projects/deliverables", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ deliverableId, status: current === "completed" ? "pending" : "completed" }),
    });
    fetchProjects();
  };

  const completeProject = async (projectId: string) => {
    await fetch("/api/projects", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectId, status: "completed" }),
    });
    fetchProjects();
  };

  const activeProjects = projects.filter((p) => p.status === "active");
  const completedProjects = projects.filter((p) => p.status === "completed");

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "10px 12px", fontSize: 13,
    background: T.bgAlt, border: `1px solid ${T.border}`, borderRadius: 8, color: T.text, outline: "none",
  };

  return (
    <PaywallGate requiredPlan="growth" teaser={{ headline: "Projects", description: "Track deliverables, manage timelines, and keep clients in the loop.", bullets: ["Deliverable checklists", "Progress tracking", "Client visibility"] }}>
      <div style={{ padding: "32px 40px 80px" }}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: T.text, margin: 0 }}>Projects</h1>
            <p style={{ fontSize: 13, color: SUBTITLE, margin: 0, marginTop: 4 }}>
              Manage deliverables, track progress, and keep clients updated.
            </p>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            style={{
              background: CTA_GRAD, color: "#09090B", border: "none", borderRadius: 8,
              padding: "10px 20px", fontSize: 13, fontWeight: 600, cursor: "pointer",
            }}
          >
            + New Project
          </button>
        </div>

        {/* Flat stats row */}
        <div style={{ display: "flex", alignItems: "stretch", marginBottom: 28 }}>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 11, fontWeight: 500, color: DIM, margin: 0, textTransform: "uppercase", letterSpacing: "0.05em" }}>Active</p>
            <p style={{ fontSize: 28, fontWeight: 700, color: T.text, margin: 0, marginTop: 4 }}>{activeProjects.length}</p>
          </div>
          <div style={{ width: 1, background: RULE, alignSelf: "stretch" }} />
          <div style={{ flex: 1, paddingLeft: 24 }}>
            <p style={{ fontSize: 11, fontWeight: 500, color: DIM, margin: 0, textTransform: "uppercase", letterSpacing: "0.05em" }}>Completed</p>
            <p style={{ fontSize: 28, fontWeight: 700, color: T.text, margin: 0, marginTop: 4 }}>{completedProjects.length}</p>
          </div>
        </div>

        {/* Divider below stats */}
        <div style={{ height: 1, background: RULE, marginBottom: 28 }} />

        {loading ? (
          <p style={{ color: SUBTITLE, fontSize: 13 }}>Loading...</p>
        ) : projects.length === 0 ? (
          /* ---------- RICH EMPTY STATE ---------- */
          <div style={{ maxWidth: 640 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: T.text, margin: 0, marginBottom: 8 }}>
              How Projects Work
            </h2>
            <p style={{ fontSize: 14, color: SUBTITLE, lineHeight: 1.65, margin: 0, marginBottom: 24 }}>
              Projects let you group related deliverables under one roof so nothing slips through
              the cracks. Create a project for each engagement, attach deliverables with due dates,
              and track completion in real time.
            </p>

            <div style={{ height: 1, background: RULE, marginBottom: 24 }} />

            <h3 style={{ fontSize: 14, fontWeight: 600, color: T.text, margin: 0, marginBottom: 16 }}>
              What you can do
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 24 }}>
              {[
                {
                  title: "Deliverable checklists",
                  desc: "Break each project into concrete deliverables. Check them off as you go -- your client sees the same progress bar you do.",
                },
                {
                  title: "Timeline tracking",
                  desc: "Set due dates on projects and individual deliverables. Overdue items surface automatically so you can course-correct early.",
                },
                {
                  title: "Completion workflow",
                  desc: "When every deliverable is done, mark the project complete. It moves to your completed list for future reference and reporting.",
                },
              ].map((item) => (
                <div key={item.title}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: T.text, margin: 0, marginBottom: 2 }}>
                    {item.title}
                  </p>
                  <p style={{ fontSize: 13, color: SUBTITLE, margin: 0, lineHeight: 1.55 }}>
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>

            <div style={{ height: 1, background: RULE, marginBottom: 24 }} />

            <h3 style={{ fontSize: 14, fontWeight: 600, color: T.text, margin: 0, marginBottom: 8 }}>
              Getting started
            </h3>
            <p style={{ fontSize: 13, color: SUBTITLE, lineHeight: 1.55, margin: 0, marginBottom: 20 }}>
              Click <span style={{ fontWeight: 600, color: T.text }}>+ New Project</span> above to
              create your first project. Give it a name, an optional description, and a due date.
              Deliverables can be added once the project exists.
            </p>

            <button
              onClick={() => setShowCreate(true)}
              style={{
                background: CTA_GRAD, color: "#09090B", border: "none", borderRadius: 8,
                padding: "10px 24px", fontSize: 13, fontWeight: 600, cursor: "pointer",
              }}
            >
              Create Your First Project
            </button>
          </div>
        ) : (
          /* ---------- PROJECT LIST ---------- */
          <div>
            {projects.map((project, idx) => {
              const totalDel = project.deliverables.length;
              const doneDel = project.deliverables.filter((d) => d.status === "completed").length;
              const progress = totalDel > 0 ? Math.round((doneDel / totalDel) * 100) : 0;

              return (
                <div key={project.id}>
                  <div style={{ paddingBottom: 24, paddingTop: idx === 0 ? 0 : 24 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                          <h3 style={{ fontSize: 16, fontWeight: 600, color: T.text, margin: 0 }}>{project.name}</h3>
                          <span style={{ fontSize: 11, fontWeight: 500, color: STATUS_COLORS[project.status] || DIM }}>
                            {project.status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                          </span>
                        </div>
                        {project.contacts && (
                          <p style={{ fontSize: 12, color: SUBTITLE, margin: 0 }}>{project.contacts.name}</p>
                        )}
                        {project.description && (
                          <p style={{ fontSize: 13, color: T.text2, margin: 0, marginTop: 4 }}>{project.description}</p>
                        )}
                      </div>
                      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        {project.due_date && (
                          <span style={{ fontSize: 12, color: SUBTITLE }}>
                            Due {new Date(project.due_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                          </span>
                        )}
                        {project.status === "active" && (
                          <button onClick={() => completeProject(project.id)} style={{ fontSize: 12, color: T.green, background: "none", border: "none", cursor: "pointer" }}>
                            Complete
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Progress bar */}
                    {totalDel > 0 && (
                      <div style={{ marginBottom: 12 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                          <span style={{ fontSize: 11, color: DIM }}>{doneDel}/{totalDel} deliverables</span>
                          <span style={{ fontSize: 11, color: DIM }}>{progress}%</span>
                        </div>
                        <div style={{ height: 4, background: T.border, borderRadius: 2 }}>
                          <div style={{ height: 4, background: T.gold, borderRadius: 2, width: `${progress}%`, transition: "width 0.3s ease" }} />
                        </div>
                      </div>
                    )}

                    {/* Deliverables */}
                    {project.deliverables.map((d) => (
                      <div
                        key={d.id}
                        style={{
                          display: "flex", alignItems: "center", gap: 10,
                          padding: "8px 0",
                        }}
                      >
                        <button
                          onClick={() => toggleDeliverable(d.id, d.status)}
                          style={{
                            width: 18, height: 18, borderRadius: 4, flexShrink: 0,
                            border: `1.5px solid ${d.status === "completed" ? T.gold : T.border}`,
                            background: d.status === "completed" ? T.goldDim : "transparent",
                            cursor: "pointer",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            color: T.gold, fontSize: 11,
                          }}
                        >
                          {d.status === "completed" ? "✓" : ""}
                        </button>
                        <span style={{
                          fontSize: 13, color: d.status === "completed" ? DIM : T.text,
                          textDecoration: d.status === "completed" ? "line-through" : "none",
                        }}>
                          {d.name}
                        </span>
                        {d.due_date && (
                          <span style={{ fontSize: 11, color: DIM, marginLeft: "auto" }}>
                            {new Date(d.due_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Section divider between projects */}
                  {idx < projects.length - 1 && (
                    <div style={{ height: 1, background: RULE }} />
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Create modal */}
        {showCreate && (
          <>
            <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 50 }} onClick={() => setShowCreate(false)} />
            <div style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: 480, background: T.bgEl, border: `1px solid ${T.border}`, borderRadius: 12, padding: 28, zIndex: 51 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: T.text, marginBottom: 20 }}>New Project</h2>
              <label style={{ display: "block", marginBottom: 16 }}>
                <span style={{ fontSize: 12, fontWeight: 500, color: SUBTITLE, display: "block", marginBottom: 6 }}>Project Name</span>
                <input value={name} onChange={(e) => setName(e.target.value)} style={inputStyle} placeholder="e.g. Brand Strategy for Marcus Chen" />
              </label>
              <label style={{ display: "block", marginBottom: 16 }}>
                <span style={{ fontSize: 12, fontWeight: 500, color: SUBTITLE, display: "block", marginBottom: 6 }}>Description</span>
                <textarea value={desc} onChange={(e) => setDesc(e.target.value)} rows={3} style={{ ...inputStyle, resize: "vertical" }} />
              </label>
              <label style={{ display: "block", marginBottom: 20 }}>
                <span style={{ fontSize: 12, fontWeight: 500, color: SUBTITLE, display: "block", marginBottom: 6 }}>Due Date</span>
                <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} style={inputStyle} />
              </label>
              <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
                <button onClick={() => setShowCreate(false)} style={{ padding: "10px 20px", fontSize: 13, background: "none", border: `1px solid ${T.border}`, borderRadius: 8, color: SUBTITLE, cursor: "pointer" }}>Cancel</button>
                <button onClick={createProject} disabled={saving || !name} style={{ padding: "10px 20px", fontSize: 13, fontWeight: 600, background: CTA_GRAD, border: "none", borderRadius: 8, color: "#09090B", cursor: "pointer", opacity: saving ? 0.6 : 1 }}>
                  {saving ? "Creating..." : "Create Project"}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </PaywallGate>
  );
}
