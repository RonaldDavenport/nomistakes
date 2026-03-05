"use client";

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
  parent_id: string | null;
  subtasks?: Deliverable[];
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

interface Activity {
  id: string;
  type: string;
  body: string | null;
  created_at: string;
}

interface FileAttachment {
  id: string;
  filename: string;
  size_bytes: number | null;
  mime_type: string | null;
  created_at: string;
  download_url?: string | null;
}

interface ProjectUI {
  files: FileAttachment[];
  uploading: boolean;
  activities: Activity[];
  commentText: string;
  submittingComment: boolean;
  showActivity: boolean;
}

const DEFAULT_UI: ProjectUI = {
  files: [], uploading: false, activities: [],
  commentText: "", submittingComment: false, showActivity: false,
};

const STATUS_COLORS: Record<string, string> = {
  active: T.green,
  completed: T.blue,
  on_hold: T.gold,
  cancelled: T.red,
};

const STATUS_BG: Record<string, string> = {
  active: "rgba(34,197,94,0.12)",
  completed: "rgba(59,130,246,0.12)",
  on_hold: "rgba(200,164,78,0.12)",
  cancelled: "rgba(239,68,68,0.12)",
};

function buildDeliverableTree(flat: Deliverable[]): Deliverable[] {
  const map: Record<string, Deliverable> = {};
  const roots: Deliverable[] = [];
  flat.forEach((d) => { map[d.id] = { ...d, subtasks: [] }; });
  flat.forEach((d) => {
    if (d.parent_id && map[d.parent_id]) {
      map[d.parent_id].subtasks!.push(map[d.id]);
    } else {
      roots.push(map[d.id]);
    }
  });
  return roots;
}

function formatBytes(bytes: number | null) {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
}

export default function ProjectsPage() {
  const params = useParams();
  const businessId = params.businessId as string;

  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [dueDate, setDueDate] = useState("");

  const [ui, setUi] = useState<Record<string, ProjectUI>>({});
  const patchUi = (id: string, patch: Partial<ProjectUI>) =>
    setUi((prev) => ({ ...prev, [id]: { ...DEFAULT_UI, ...prev[id], ...patch } }));

  const [addingSubtask, setAddingSubtask] = useState<Record<string, boolean>>({});
  const [subtaskName, setSubtaskName] = useState<Record<string, string>>({});

  const [toast, setToast] = useState<string | null>(null);
  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  const fetchProjectFiles = useCallback(async (projectId: string) => {
    const res = await fetch(`/api/files?businessId=${businessId}&projectId=${projectId}`);
    if (res.ok) {
      const data = await res.json();
      patchUi(projectId, { files: data.files || [] });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [businessId]);

  const fetchActivities = useCallback(async (projectId: string) => {
    const res = await fetch(`/api/projects/activities?projectId=${projectId}&businessId=${businessId}`);
    if (res.ok) {
      const data = await res.json();
      patchUi(projectId, { activities: data.activities || [] });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [businessId]);

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/projects?businessId=${businessId}`);
    const data = await res.json();
    const ps: Project[] = data.projects || [];
    setProjects(ps);
    setLoading(false);
    ps.forEach((p) => { fetchProjectFiles(p.id); fetchActivities(p.id); });
  }, [businessId, fetchProjectFiles, fetchActivities]);

  useEffect(() => { fetchProjects(); }, [fetchProjects]);

  const uploadFile = async (projectId: string, file: File) => {
    patchUi(projectId, { uploading: true });
    try {
      const urlRes = await fetch("/api/files/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessId, projectId, filename: file.name, mimeType: file.type, sizeBytes: file.size }),
      });
      if (!urlRes.ok) { showToast("Upload failed — file type may not be allowed"); return; }
      const { uploadUrl, storagePath } = await urlRes.json();
      const put = await fetch(uploadUrl, { method: "PUT", body: file, headers: { "Content-Type": file.type } });
      if (!put.ok) { showToast("Upload failed"); return; }
      const reg = await fetch("/api/files", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessId, projectId, filename: file.name, storagePath, sizeBytes: file.size, mimeType: file.type }),
      });
      if (!reg.ok) { showToast("File uploaded but failed to save"); return; }
      fetchProjectFiles(projectId);
    } catch {
      showToast("Upload failed");
    } finally {
      patchUi(projectId, { uploading: false });
    }
  };

  const deleteFile = async (fileId: string, projectId: string) => {
    if (!confirm("Delete this file?")) return;
    const res = await fetch("/api/files", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fileId }),
    });
    if (!res.ok) { showToast("Failed to delete file"); return; }
    fetchProjectFiles(projectId);
  };

  const submitComment = async (projectId: string) => {
    const body = ui[projectId]?.commentText?.trim();
    if (!body) return;
    patchUi(projectId, { submittingComment: true });
    const res = await fetch("/api/projects/activities", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectId, businessId, body, type: "comment" }),
    });
    if (!res.ok) { showToast("Failed to save note"); patchUi(projectId, { submittingComment: false }); return; }
    patchUi(projectId, { commentText: "", submittingComment: false });
    fetchActivities(projectId);
  };

  const deleteActivity = async (activityId: string, projectId: string) => {
    const res = await fetch("/api/projects/activities", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ activityId }),
    });
    if (!res.ok) { showToast("Failed to delete note"); return; }
    fetchActivities(projectId);
  };

  const addSubtask = async (parentId: string, projectId: string) => {
    const sName = subtaskName[parentId]?.trim();
    if (!sName) return;
    const res = await fetch("/api/projects/deliverables", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectId, businessId, name: sName, parentId }),
    });
    if (!res.ok) { showToast("Failed to add subtask"); return; }
    setSubtaskName((prev) => ({ ...prev, [parentId]: "" }));
    setAddingSubtask((prev) => ({ ...prev, [parentId]: false }));
    fetchProjects();
  };

  const createProject = async () => {
    setSaving(true);
    const res = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ businessId, name, description: desc, dueDate: dueDate || null }),
    });
    setSaving(false);
    if (!res.ok) { showToast("Failed to create project"); return; }
    setShowCreate(false);
    setName(""); setDesc(""); setDueDate("");
    fetchProjects();
  };

  const deleteProject = async (projectId: string) => {
    if (!confirm("Delete this project and all its deliverables?")) return;
    const res = await fetch("/api/projects", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectId }),
    });
    if (!res.ok) { showToast("Failed to delete project"); return; }
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
  const totalDeliverables = projects.reduce((sum, p) => sum + p.deliverables.length, 0);

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "10px 12px", fontSize: 13,
    background: T.bgAlt, border: `1px solid ${T.border}`, borderRadius: 8,
    color: T.text, outline: "none",
  };

  const renderDeliverable = (d: Deliverable, project: Project, depth = 0): React.ReactNode => (
    <div key={d.id}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 0", paddingLeft: depth * 22 }}>
        <button
          onClick={() => toggleDeliverable(d.id, d.status)}
          style={{
            width: 18, height: 18, borderRadius: 4, flexShrink: 0,
            border: `1.5px solid ${d.status === "completed" ? T.gold : T.border}`,
            background: d.status === "completed" ? T.goldDim : "transparent",
            cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
            color: T.gold, fontSize: 11,
          }}
        >
          {d.status === "completed" ? "✓" : ""}
        </button>
        <span style={{
          fontSize: 13, flex: 1,
          color: d.status === "completed" ? T.text3 : T.text,
          textDecoration: d.status === "completed" ? "line-through" : "none",
        }}>
          {d.name}
        </span>
        {d.due_date && (
          <span style={{ fontSize: 11, color: T.text3, flexShrink: 0 }}>
            {new Date(d.due_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
          </span>
        )}
        {depth === 0 && (
          <button
            onClick={() => setAddingSubtask((prev) => ({ ...prev, [d.id]: !prev[d.id] }))}
            title="Add subtask"
            style={{ fontSize: 13, color: T.text3, background: "none", border: "none", cursor: "pointer", flexShrink: 0, lineHeight: 1, padding: "0 2px" }}
          >
            ···
          </button>
        )}
      </div>

      {addingSubtask[d.id] && (
        <div style={{ display: "flex", gap: 8, alignItems: "center", paddingLeft: 28, paddingBottom: 6 }}>
          <input
            autoFocus
            value={subtaskName[d.id] || ""}
            onChange={(e) => setSubtaskName((prev) => ({ ...prev, [d.id]: e.target.value }))}
            onKeyDown={(e) => {
              if (e.key === "Enter") addSubtask(d.id, project.id);
              if (e.key === "Escape") setAddingSubtask((prev) => ({ ...prev, [d.id]: false }));
            }}
            placeholder="Subtask name…"
            style={{ ...inputStyle, padding: "6px 10px", fontSize: 12, flex: 1 }}
          />
          <button
            onClick={() => addSubtask(d.id, project.id)}
            disabled={!subtaskName[d.id]?.trim()}
            style={{ padding: "6px 14px", fontSize: 12, fontWeight: 600, background: CTA_GRAD, border: "none", borderRadius: 6, color: "#09090B", cursor: "pointer", flexShrink: 0 }}
          >
            Add
          </button>
          <button
            onClick={() => setAddingSubtask((prev) => ({ ...prev, [d.id]: false }))}
            style={{ fontSize: 12, color: T.text3, background: "none", border: "none", cursor: "pointer", flexShrink: 0 }}
          >
            Cancel
          </button>
        </div>
      )}

      {(d.subtasks || []).map((sub) => renderDeliverable(sub, project, depth + 1))}
    </div>
  );

  return (
    <PaywallGate requiredPlan="scale" teaser={{ headline: "Projects", description: "Track deliverables, manage timelines, and keep clients in the loop.", bullets: ["Deliverable checklists", "Progress tracking", "Client visibility"] }}>
      <div style={{ padding: "32px 40px 80px" }}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
          <div>
            <h1 style={{ fontFamily: T.h, fontSize: 28, fontWeight: 700, color: T.text, letterSpacing: "-0.5px", margin: 0 }}>Projects</h1>
            <p style={{ fontSize: 14, color: T.text2, margin: 0, marginTop: 4 }}>
              Deliverables, files, and notes — all in one place.
            </p>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            style={{ background: CTA_GRAD, color: "#09090B", border: "none", borderRadius: 10, padding: "11px 22px", fontSize: 14, fontWeight: 600, cursor: "pointer" }}
          >
            + New Project
          </button>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 24 }}>
          {[
            { label: "Active", value: activeProjects.length, color: T.green },
            { label: "Completed", value: completedProjects.length, color: T.blue },
            { label: "Deliverables", value: totalDeliverables, color: T.text },
          ].map((s) => (
            <div key={s.label} style={{ padding: "16px 20px", borderRadius: 10, background: T.bgEl, border: `1px solid ${T.border}` }}>
              <span style={{ fontSize: 26, fontWeight: 700, color: s.color, fontFamily: T.h, display: "block" }}>{s.value}</span>
              <span style={{ fontSize: 12, color: T.text3, display: "block", marginTop: 2 }}>{s.label}</span>
            </div>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: 60, color: T.text3 }}>Loading...</div>
        ) : projects.length === 0 ? (
          <div style={{
            textAlign: "center", padding: "64px 24px",
            borderRadius: 12, border: `1px dashed ${T.border}`, background: T.bgEl,
          }}>
            <div style={{
              width: 48, height: 48, borderRadius: 12, background: T.goldDim,
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 16px", fontSize: 22,
            }}>
              📁
            </div>
            <h3 style={{ fontFamily: T.h, fontSize: 17, fontWeight: 600, color: T.text, marginBottom: 6 }}>No projects yet</h3>
            <p style={{ fontSize: 13, color: T.text2, maxWidth: 320, margin: "0 auto 20px", lineHeight: 1.5 }}>
              Create a project for each client engagement. Add deliverables, track progress, upload files, and leave notes.
            </p>
            <button
              onClick={() => setShowCreate(true)}
              style={{ background: CTA_GRAD, color: "#09090B", border: "none", borderRadius: 9, padding: "10px 22px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}
            >
              Create Your First Project
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {projects.map((project) => {
              const allDel = project.deliverables;
              const totalDel = allDel.length;
              const doneDel = allDel.filter((d) => d.status === "completed").length;
              const progress = totalDel > 0 ? Math.round((doneDel / totalDel) * 100) : 0;
              const tree = buildDeliverableTree(project.deliverables);
              const pui = ui[project.id] ?? DEFAULT_UI;

              return (
                <div key={project.id} style={{
                  background: T.bgEl, border: `1px solid ${T.border}`,
                  borderRadius: 12, padding: "20px 24px",
                }}>
                  {/* Project header */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                        <h3 style={{ fontFamily: T.h, fontSize: 16, fontWeight: 600, color: T.text, margin: 0 }}>{project.name}</h3>
                        <span style={{
                          fontSize: 11, fontWeight: 600, padding: "2px 9px", borderRadius: 100,
                          background: STATUS_BG[project.status] || "rgba(255,255,255,0.06)",
                          color: STATUS_COLORS[project.status] || T.text3,
                        }}>
                          {project.status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                        </span>
                      </div>
                      {project.contacts && (
                        <p style={{ fontSize: 12, color: T.text2, margin: 0 }}>{project.contacts.name}</p>
                      )}
                      {project.description && (
                        <p style={{ fontSize: 13, color: T.text2, margin: 0, marginTop: 4 }}>{project.description}</p>
                      )}
                    </div>
                    <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                      {project.due_date && (
                        <span style={{ fontSize: 12, color: T.text3 }}>
                          Due {new Date(project.due_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </span>
                      )}
                      {project.status === "active" && (
                        <button onClick={() => completeProject(project.id)} style={{ fontSize: 12, color: T.green, background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                          Complete
                        </button>
                      )}
                      <button onClick={() => deleteProject(project.id)} style={{ fontSize: 12, color: T.text3, background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                        Delete
                      </button>
                    </div>
                  </div>

                  {/* Progress bar */}
                  {totalDel > 0 && (
                    <div style={{ marginBottom: 14 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                        <span style={{ fontSize: 11, color: T.text3 }}>{doneDel}/{totalDel} deliverables</span>
                        <span style={{ fontSize: 11, color: T.text3 }}>{progress}%</span>
                      </div>
                      <div style={{ height: 4, background: T.border, borderRadius: 2 }}>
                        <div style={{ height: 4, background: T.gold, borderRadius: 2, width: `${progress}%`, transition: "width 0.3s ease" }} />
                      </div>
                    </div>
                  )}

                  {/* Deliverables tree */}
                  {tree.length > 0 && (
                    <div style={{ marginBottom: 14 }}>
                      {tree.map((d) => renderDeliverable(d, project))}
                    </div>
                  )}

                  {/* Files */}
                  <div style={{ paddingTop: 14, borderTop: `1px solid ${T.border}` }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                      <span style={{ fontSize: 11, fontWeight: 600, color: T.text3, textTransform: "uppercase", letterSpacing: "0.05em" }}>Files</span>
                      <label style={{ fontSize: 11, color: T.gold, cursor: "pointer", fontWeight: 500 }}>
                        {pui.uploading ? "Uploading..." : "+ Upload"}
                        <input
                          type="file" style={{ display: "none" }} disabled={pui.uploading}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) uploadFile(project.id, file);
                            e.target.value = "";
                          }}
                        />
                      </label>
                    </div>
                    {pui.files.length === 0 ? (
                      <p style={{ fontSize: 12, color: T.text3, margin: 0 }}>No files yet.</p>
                    ) : (
                      <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                        {pui.files.map((f) => (
                          <div key={f.id} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <a href={f.download_url || "#"} download={f.filename}
                              style={{ fontSize: 12, color: T.text2, textDecoration: "none", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {f.filename}
                            </a>
                            {f.size_bytes && <span style={{ fontSize: 11, color: T.text3, flexShrink: 0 }}>{formatBytes(f.size_bytes)}</span>}
                            <button onClick={() => deleteFile(f.id, project.id)}
                              style={{ fontSize: 12, color: T.text3, background: "none", border: "none", cursor: "pointer", flexShrink: 0 }}>×</button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Activity / Notes */}
                  <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${T.border}` }}>
                    <button
                      onClick={() => patchUi(project.id, { showActivity: !pui.showActivity })}
                      style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", cursor: "pointer", padding: 0, marginBottom: pui.showActivity ? 12 : 0 }}
                    >
                      <span style={{ fontSize: 11, fontWeight: 600, color: T.text3, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                        Notes {pui.activities.length > 0 ? `(${pui.activities.length})` : ""}
                      </span>
                      <span style={{ fontSize: 10, color: T.text3 }}>{pui.showActivity ? "▲" : "▼"}</span>
                    </button>

                    {pui.showActivity && (
                      <div>
                        {pui.activities.length > 0 && (
                          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 14 }}>
                            {pui.activities.map((a) => (
                              <div key={a.id} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                                <div style={{ flex: 1 }}>
                                  <p style={{ fontSize: 13, color: T.text, margin: 0, lineHeight: 1.55 }}>{a.body}</p>
                                  <p style={{ fontSize: 11, color: T.text3, margin: "2px 0 0" }}>
                                    {new Date(a.created_at).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
                                  </p>
                                </div>
                                <button onClick={() => deleteActivity(a.id, project.id)}
                                  style={{ fontSize: 12, color: T.text3, background: "none", border: "none", cursor: "pointer", flexShrink: 0 }}>×</button>
                              </div>
                            ))}
                          </div>
                        )}
                        <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
                          <textarea
                            rows={2}
                            value={pui.commentText}
                            onChange={(e) => patchUi(project.id, { commentText: e.target.value })}
                            onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) submitComment(project.id); }}
                            placeholder="Add a note… (⌘↵ to submit)"
                            style={{ ...inputStyle, resize: "none", flex: 1, fontSize: 12, padding: "8px 10px" }}
                          />
                          <button
                            onClick={() => submitComment(project.id)}
                            disabled={pui.submittingComment || !pui.commentText.trim()}
                            style={{
                              padding: "8px 16px", fontSize: 12, fontWeight: 600,
                              background: CTA_GRAD, border: "none", borderRadius: 8,
                              color: "#09090B", cursor: "pointer", flexShrink: 0,
                              opacity: pui.submittingComment ? 0.6 : 1,
                            }}
                          >
                            Add
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Create modal */}
        {showCreate && (
          <>
            <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 50 }} onClick={() => setShowCreate(false)} />
            <div style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: 480, background: T.bgEl, border: `1px solid ${T.border}`, borderRadius: 14, padding: 28, zIndex: 51 }}>
              <h2 style={{ fontFamily: T.h, fontSize: 18, fontWeight: 700, color: T.text, marginBottom: 20 }}>New Project</h2>
              <label style={{ display: "block", marginBottom: 16 }}>
                <span style={{ fontSize: 12, fontWeight: 500, color: T.text2, display: "block", marginBottom: 6 }}>Project Name</span>
                <input value={name} onChange={(e) => setName(e.target.value)} style={inputStyle} placeholder="e.g. Brand Strategy for Marcus Chen" />
              </label>
              <label style={{ display: "block", marginBottom: 16 }}>
                <span style={{ fontSize: 12, fontWeight: 500, color: T.text2, display: "block", marginBottom: 6 }}>Description</span>
                <textarea value={desc} onChange={(e) => setDesc(e.target.value)} rows={3} style={{ ...inputStyle, resize: "vertical" }} />
              </label>
              <label style={{ display: "block", marginBottom: 20 }}>
                <span style={{ fontSize: 12, fontWeight: 500, color: T.text2, display: "block", marginBottom: 6 }}>Due Date</span>
                <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} style={inputStyle} />
              </label>
              <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
                <button onClick={() => setShowCreate(false)} style={{ padding: "10px 20px", fontSize: 13, background: "none", border: `1px solid ${T.border}`, borderRadius: 9, color: T.text2, cursor: "pointer" }}>Cancel</button>
                <button onClick={createProject} disabled={saving || !name} style={{ padding: "10px 20px", fontSize: 13, fontWeight: 600, background: CTA_GRAD, border: "none", borderRadius: 9, color: "#09090B", cursor: "pointer", opacity: saving ? 0.6 : 1 }}>
                  {saving ? "Creating..." : "Create Project"}
                </button>
              </div>
            </div>
          </>
        )}

        {/* Toast */}
        {toast && (
          <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 100, background: T.bgEl, border: `1px solid ${T.border}`, borderRadius: 8, padding: "10px 16px", fontSize: 13, color: T.text, boxShadow: "0 4px 16px rgba(0,0,0,0.4)" }}>
            {toast}
          </div>
        )}
      </div>
    </PaywallGate>
  );
}
