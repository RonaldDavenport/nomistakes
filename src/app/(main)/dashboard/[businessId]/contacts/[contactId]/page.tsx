"use client";

import { useBusinessContext } from "@/components/dashboard/BusinessProvider";
import { T, CTA_GRAD, glassCard } from "@/lib/design-tokens";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";

interface Contact {
  id: string;
  business_id: string;
  email: string;
  name: string | null;
  phone: string | null;
  company: string | null;
  lifecycle_stage: string;
  source: string | null;
  tags: string[];
  notes: string | null;
  last_contacted_at: string | null;
  created_at: string;
}

interface Activity {
  id: string;
  type: string;
  title: string;
  description: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

const STAGES = ["subscriber", "lead", "qualified_lead", "customer", "repeat_customer", "advocate"];

function stageStyle(stage: string) {
  const map: Record<string, { bg: string; color: string }> = {
    subscriber: { bg: "rgba(255,255,255,0.06)", color: T.text3 },
    lead: { bg: "rgba(59,130,246,0.15)", color: "#3b82f6" },
    qualified_lead: { bg: "rgba(245,158,11,0.15)", color: T.gold },
    customer: { bg: "rgba(34,197,94,0.15)", color: T.green },
    repeat_customer: { bg: "rgba(123,57,252,0.15)", color: T.purpleLight },
    advocate: { bg: "rgba(168,85,247,0.15)", color: "#a855f7" },
  };
  return map[stage] || map.subscriber;
}

function stageLabel(stage: string) {
  return stage.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function activityIcon(type: string) {
  const icons: Record<string, { path: string; color: string }> = {
    email_sent: { path: "M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75", color: "#3b82f6" },
    email_opened: { path: "M21.75 9v.906a2.25 2.25 0 01-1.183 1.981l-6.478 3.488M2.25 9v.906a2.25 2.25 0 001.183 1.981l6.478 3.488m8.839 2.51l-4.66-2.51m0 0l-1.023-.55a2.25 2.25 0 00-2.134 0l-1.022.55m0 0l-4.661 2.51", color: T.green },
    call_booked: { path: "M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z", color: T.gold },
    call_completed: { path: "M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z", color: T.green },
    proposal_sent: { path: "M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z", color: T.purpleLight },
    proposal_viewed: { path: "M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z M15 12a3 3 0 11-6 0 3 3 0 016 0z", color: T.gold },
    proposal_accepted: { path: "M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z", color: T.green },
    payment_received: { path: "M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z", color: T.green },
    note_added: { path: "M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10", color: T.text2 },
    stage_changed: { path: "M3 7.5L7.5 3m0 0L12 7.5M7.5 3v13.5m13.5 0L16.5 21m0 0L12 16.5m4.5 4.5V7.5", color: T.purpleLight },
  };
  return icons[type] || { path: "M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z", color: T.text3 };
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

export default function ContactDetailPage() {
  const params = useParams();
  const router = useRouter();
  const businessId = params.businessId as string;
  const contactId = params.contactId as string;
  const { userId } = useBusinessContext();

  const [contact, setContact] = useState<Contact | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [noteText, setNoteText] = useState("");
  const [savingNote, setSavingNote] = useState(false);
  const [newTag, setNewTag] = useState("");

  const fetchContact = useCallback(async () => {
    const res = await fetch(`/api/contacts?businessId=${businessId}&search=${contactId}`);
    if (!res.ok) return;
    // Fetch by getting all and filtering — or we can use the contactId directly
    // Actually, let's fetch all for this business and find the one
    // Better: just fetch with search that might not work — let's just fetch directly
    const db = await fetch(`/api/contacts?businessId=${businessId}`);
    if (db.ok) {
      const data = await db.json();
      const found = data.contacts.find((c: Contact) => c.id === contactId);
      if (found) setContact(found);
    }
  }, [businessId, contactId]);

  const fetchActivities = useCallback(async () => {
    const res = await fetch(`/api/contacts/activity?contactId=${contactId}`);
    if (res.ok) {
      const data = await res.json();
      setActivities(data.activities);
    }
  }, [contactId]);

  useEffect(() => {
    async function load() {
      setLoading(true);
      await Promise.all([fetchContact(), fetchActivities()]);
      setLoading(false);
    }
    load();
  }, [fetchContact, fetchActivities]);

  async function updateStage(newStage: string) {
    if (!contact) return;
    const res = await fetch("/api/contacts", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contactId, lifecycle_stage: newStage }),
    });
    if (res.ok) {
      setContact({ ...contact, lifecycle_stage: newStage });
      fetchActivities();
    }
  }

  async function addNote() {
    if (!noteText.trim() || !contact) return;
    setSavingNote(true);
    const res = await fetch("/api/contacts/activity", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contactId,
        businessId,
        type: "note_added",
        title: "Note added",
        description: noteText.trim(),
      }),
    });
    if (res.ok) {
      setNoteText("");
      fetchActivities();
    }
    setSavingNote(false);
  }

  async function addTag() {
    if (!newTag.trim() || !contact) return;
    const updated = [...(contact.tags || []), newTag.trim()];
    const res = await fetch("/api/contacts", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contactId, tags: updated }),
    });
    if (res.ok) {
      setContact({ ...contact, tags: updated });
      setNewTag("");
    }
  }

  async function removeTag(tag: string) {
    if (!contact) return;
    const updated = contact.tags.filter((t) => t !== tag);
    const res = await fetch("/api/contacts", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contactId, tags: updated }),
    });
    if (res.ok) {
      setContact({ ...contact, tags: updated });
    }
  }

  async function deleteContact() {
    if (!confirm("Are you sure you want to delete this contact?")) return;
    const res = await fetch("/api/contacts", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contactId }),
    });
    if (res.ok) {
      router.push(`/dashboard/${businessId}/contacts`);
    }
  }

  if (loading) {
    return <div style={{ padding: 60, textAlign: "center", color: T.text3 }}>Loading...</div>;
  }

  if (!contact) {
    return <div style={{ padding: 60, textAlign: "center", color: T.text3 }}>Contact not found</div>;
  }

  const ss = stageStyle(contact.lifecycle_stage);

  return (
    <div style={{ padding: "32px 32px 64px", maxWidth: 1000, margin: "0 auto" }}>
      {/* Back + Delete */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <button
          onClick={() => router.push(`/dashboard/${businessId}/contacts`)}
          style={{ fontSize: 13, color: T.text3, background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}
        >
          <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          Back to Contacts
        </button>
        <button
          onClick={deleteContact}
          style={{ fontSize: 12, color: "#ef4444", background: "none", border: "none", cursor: "pointer" }}
        >
          Delete Contact
        </button>
      </div>

      {/* Contact Header */}
      <div style={{ ...glassCard, padding: "28px 32px", marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
          <div>
            <h1 style={{ fontFamily: T.h, fontSize: 26, fontWeight: 700, color: T.text, letterSpacing: "-0.5px" }}>
              {contact.name || contact.email}
            </h1>
            <p style={{ fontSize: 14, color: T.text2, marginTop: 4 }}>{contact.email}</p>
            <div style={{ display: "flex", gap: 16, marginTop: 12, flexWrap: "wrap" }}>
              {contact.phone && (
                <span style={{ fontSize: 13, color: T.text3 }}>
                  {contact.phone}
                </span>
              )}
              {contact.company && (
                <span style={{ fontSize: 13, color: T.text3 }}>
                  {contact.company}
                </span>
              )}
              {contact.source && (
                <span style={{ fontSize: 12, color: T.text3, padding: "2px 8px", borderRadius: 4, background: "rgba(255,255,255,0.04)" }}>
                  {contact.source}
                </span>
              )}
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <select
              value={contact.lifecycle_stage}
              onChange={(e) => updateStage(e.target.value)}
              style={{
                padding: "8px 14px",
                borderRadius: 8,
                background: ss.bg,
                border: "none",
                color: ss.color,
                fontSize: 13,
                fontWeight: 600,
                outline: "none",
                cursor: "pointer",
              }}
            >
              {STAGES.map((s) => (
                <option key={s} value={s} style={{ background: T.bgEl, color: T.text }}>
                  {stageLabel(s)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Tags */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 16, alignItems: "center" }}>
          {(contact.tags || []).map((tag) => (
            <span
              key={tag}
              style={{
                padding: "4px 10px",
                borderRadius: 6,
                fontSize: 12,
                background: "rgba(123,57,252,0.10)",
                color: T.purpleLight,
                display: "flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              {tag}
              <button
                onClick={() => removeTag(tag)}
                style={{ background: "none", border: "none", color: T.purpleLight, cursor: "pointer", padding: 0, fontSize: 14, lineHeight: 1 }}
              >
                &times;
              </button>
            </span>
          ))}
          <div style={{ display: "flex", gap: 4 }}>
            <input
              type="text"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addTag()}
              placeholder="+ tag"
              style={{
                width: 80,
                padding: "4px 8px",
                borderRadius: 6,
                background: "rgba(255,255,255,0.04)",
                border: `1px solid ${T.border}`,
                color: T.text2,
                fontSize: 12,
                outline: "none",
              }}
            />
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ display: "flex", gap: 10, marginBottom: 24, flexWrap: "wrap" }}>
        {[
          { label: "Send Email", icon: "M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" },
          { label: "Create Proposal", icon: "M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" },
          { label: "Book Call", icon: "M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" },
        ].map((btn) => (
          <button
            key={btn.label}
            style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "10px 18px", borderRadius: 10,
              background: "rgba(255,255,255,0.04)", border: `1px solid ${T.border}`,
              color: T.text2, fontSize: 13, fontWeight: 500, cursor: "pointer",
            }}
          >
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d={btn.icon} />
            </svg>
            {btn.label}
          </button>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 24 }}>
        {/* Left: Activity Timeline */}
        <div>
          {/* Add Note */}
          <div style={{ ...glassCard, padding: "20px 24px", marginBottom: 24 }}>
            <textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Add a note..."
              rows={3}
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: 10,
                background: "rgba(255,255,255,0.04)",
                border: `1px solid ${T.border}`,
                color: T.text,
                fontSize: 14,
                outline: "none",
                resize: "vertical",
              }}
            />
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 10 }}>
              <button
                onClick={addNote}
                disabled={savingNote || !noteText.trim()}
                style={{
                  padding: "8px 20px",
                  borderRadius: 8,
                  background: CTA_GRAD,
                  border: "none",
                  color: "#fff",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: savingNote ? "wait" : "pointer",
                  opacity: savingNote || !noteText.trim() ? 0.5 : 1,
                }}
              >
                {savingNote ? "Saving..." : "Add Note"}
              </button>
            </div>
          </div>

          {/* Timeline */}
          <div>
            <h3 style={{ fontFamily: T.h, fontSize: 16, fontWeight: 600, color: T.text, marginBottom: 16 }}>
              Activity
            </h3>
            {activities.length === 0 ? (
              <p style={{ fontSize: 14, color: T.text3, padding: 20 }}>No activity yet</p>
            ) : (
              <div style={{ position: "relative" }}>
                {/* Timeline line */}
                <div
                  style={{
                    position: "absolute",
                    left: 15,
                    top: 0,
                    bottom: 0,
                    width: 1,
                    background: T.border,
                  }}
                />
                {activities.map((a) => {
                  const ai = activityIcon(a.type);
                  return (
                    <div
                      key={a.id}
                      style={{
                        display: "flex",
                        gap: 16,
                        paddingBottom: 20,
                        position: "relative",
                      }}
                    >
                      <div
                        style={{
                          width: 30,
                          height: 30,
                          borderRadius: "50%",
                          background: `${ai.color}18`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                          zIndex: 1,
                        }}
                      >
                        <svg width="14" height="14" fill="none" stroke={ai.color} viewBox="0 0 24 24" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d={ai.path} />
                        </svg>
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{ fontSize: 14, fontWeight: 500, color: T.text }}>{a.title}</span>
                          <span style={{ fontSize: 11, color: T.text3, fontFamily: T.mono }}>{timeAgo(a.created_at)}</span>
                        </div>
                        {a.description && (
                          <p style={{ fontSize: 13, color: T.text2, marginTop: 4, lineHeight: 1.6 }}>{a.description}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right: Info sidebar */}
        <div>
          <div style={{ ...glassCard, padding: "20px 24px" }}>
            <h4 style={{ fontSize: 13, fontWeight: 600, color: T.text3, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 16 }}>
              Details
            </h4>
            {[
              { label: "Email", value: contact.email },
              { label: "Phone", value: contact.phone || "—" },
              { label: "Company", value: contact.company || "—" },
              { label: "Source", value: contact.source || "—" },
              { label: "Created", value: new Date(contact.created_at).toLocaleDateString() },
              { label: "Last Contact", value: contact.last_contacted_at ? new Date(contact.last_contacted_at).toLocaleDateString() : "Never" },
            ].map((row) => (
              <div key={row.label} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: `1px solid ${T.border}` }}>
                <span style={{ fontSize: 13, color: T.text3 }}>{row.label}</span>
                <span style={{ fontSize: 13, color: T.text2, textAlign: "right", maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis" }}>{row.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
