"use client";

import { useBusinessContext } from "@/components/dashboard/BusinessProvider";
import { PaywallGate } from "@/components/dashboard/PaywallGate";
import { T } from "@/lib/design-tokens";
import { useParams } from "next/navigation";
import { useState, useEffect, useCallback } from "react";

interface InboxMessage {
  id: string;
  channel: string;
  direction: "inbound" | "outbound";
  subject: string | null;
  content: string;
  sent_at: string;
  read_at: string | null;
  lead_id: string | null;
  contact_id: string | null;
  lead: { id: string; name: string | null; company: string | null; linkedin_url: string | null; status: string } | null;
  contact: { id: string; name: string | null; email: string | null } | null;
}

const CHANNEL_COLORS: Record<string, string> = {
  email: "#3b82f6",
  linkedin: "#0077b5",
  twitter: "#1da1f2",
};

const CHANNEL_LABELS: Record<string, string> = {
  email: "Email",
  linkedin: "LinkedIn",
  twitter: "X / Twitter",
};

function senderName(msg: InboxMessage): string {
  if (msg.lead?.name) return msg.lead.name;
  if (msg.contact?.name) return msg.contact.name;
  return "Unknown";
}

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function getInitials(name: string): string {
  const parts = name.trim().split(" ").filter(Boolean);
  return parts.length > 1 ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase() : parts[0]?.[0]?.toUpperCase() || "?";
}

const AVATAR_COLORS = ["#8B5CF6", "#3B82F6", "#22C55E", "#C8A44E", "#F97316"];

export default function InboxPage() {
  const params = useParams();
  const businessId = params.businessId as string;
  const { userId } = useBusinessContext();

  const [messages, setMessages] = useState<InboxMessage[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [channelFilter, setChannelFilter] = useState("");
  const [selected, setSelected] = useState<InboxMessage | null>(null);

  void userId;
  void businessId;

  const fetchMessages = useCallback(async () => {
    setLoading(true);
    const qs = new URLSearchParams({ businessId, limit: "50", offset: "0" });
    if (channelFilter) qs.set("channel", channelFilter);
    const res = await fetch(`/api/inbox?${qs}`);
    const data = await res.json();
    setMessages(data.messages || []);
    setTotal(data.total || 0);
    setLoading(false);
  }, [businessId, channelFilter]);

  useEffect(() => { fetchMessages(); }, [fetchMessages]);

  async function markRead(msg: InboxMessage) {
    if (msg.read_at) return;
    await fetch("/api/inbox", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messageId: msg.id }),
    });
    setMessages((prev) => prev.map((m) => m.id === msg.id ? { ...m, read_at: new Date().toISOString() } : m));
  }

  function handleSelect(msg: InboxMessage) {
    setSelected(msg);
    markRead(msg);
  }

  const unreadCount = messages.filter((m) => !m.read_at && m.direction === "inbound").length;

  return (
    <PaywallGate
      requiredPlan="scale"
      teaser={{
        headline: "Unified Inbox",
        description: "All your client conversations in one place — email, LinkedIn, and Twitter threads.",
        bullets: [
          "Email, LinkedIn, and Twitter in one thread view",
          "Log outreach and replies from Lead Engine",
          "Full conversation history per contact",
          "Mark threads read/unread, add notes",
        ],
      }}
    >
      <div style={{ display: "flex", height: "calc(100vh - 56px)" }}>

        {/* Left pane: thread list */}
        <div style={{
          width: 300,
          borderRight: `1px solid ${T.border}`,
          display: "flex",
          flexDirection: "column",
          flexShrink: 0,
          background: T.bgEl,
        }}>
          {/* Header */}
          <div style={{ padding: "16px 16px 12px", borderBottom: `1px solid ${T.border}` }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
              <span style={{ fontSize: 15, fontWeight: 700, color: T.text }}>Inbox</span>
              <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                {unreadCount > 0 && (
                  <span style={{
                    fontSize: 11, fontWeight: 700, padding: "2px 7px", borderRadius: 100,
                    background: "rgba(59,130,246,0.15)", color: "#3b82f6",
                  }}>
                    {unreadCount} unread
                  </span>
                )}
                <span style={{ fontSize: 11, color: T.text3 }}>{total} total</span>
              </div>
            </div>
            <div style={{ display: "flex", gap: 5 }}>
              {[{ value: "", label: "All" }, { value: "email", label: "Email" }, { value: "linkedin", label: "LinkedIn" }, { value: "twitter", label: "X" }].map((f) => (
                <button
                  key={f.value}
                  onClick={() => setChannelFilter(f.value)}
                  style={{
                    padding: "4px 10px", borderRadius: 100, fontSize: 11, fontWeight: 500,
                    border: `1px solid ${channelFilter === f.value ? T.gold : T.border}`,
                    background: channelFilter === f.value ? T.goldDim : "transparent",
                    color: channelFilter === f.value ? T.gold : T.text3,
                    cursor: "pointer",
                  }}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Thread list */}
          <div style={{ flex: 1, overflowY: "auto" }}>
            {loading ? (
              <p style={{ padding: 24, color: T.text3, fontSize: 13, textAlign: "center" }}>Loading...</p>
            ) : messages.length === 0 ? (
              <div style={{ padding: "40px 20px", textAlign: "center" }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 10, background: T.goldDim,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  margin: "0 auto 12px", fontSize: 18,
                }}>
                  💬
                </div>
                <p style={{ color: T.text2, fontSize: 13, marginBottom: 4 }}>No messages yet</p>
                <p style={{ color: T.text3, fontSize: 12, lineHeight: 1.5 }}>
                  Messages appear here after you reach out to leads.
                </p>
              </div>
            ) : (
              messages.map((msg, idx) => {
                const isSelected = selected?.id === msg.id;
                const isUnread = !msg.read_at && msg.direction === "inbound";
                const name = senderName(msg);
                const color = AVATAR_COLORS[idx % AVATAR_COLORS.length];
                return (
                  <div
                    key={msg.id}
                    onClick={() => handleSelect(msg)}
                    style={{
                      padding: "12px 14px",
                      borderBottom: `1px solid ${T.border}`,
                      cursor: "pointer",
                      background: isSelected ? T.goldDim : "transparent",
                      borderLeft: isSelected ? `2px solid ${T.gold}` : "2px solid transparent",
                      transition: "background 0.1s",
                    }}
                    onMouseEnter={(e) => { if (!isSelected) (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.02)"; }}
                    onMouseLeave={(e) => { if (!isSelected) (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                  >
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                      <div style={{
                        width: 30, height: 30, borderRadius: 7, flexShrink: 0,
                        background: `${color}20`, border: `1px solid ${color}40`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 11, fontWeight: 700, color,
                      }}>
                        {getInitials(name)}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 3 }}>
                          <span style={{
                            fontSize: 13, fontWeight: isUnread ? 700 : 500,
                            color: isSelected ? T.gold : T.text,
                            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1,
                          }}>
                            {name}
                          </span>
                          <span style={{ fontSize: 10, color: T.text3, flexShrink: 0, marginLeft: 6 }}>{relativeTime(msg.sent_at)}</span>
                        </div>
                        <div style={{ display: "flex", gap: 4, marginBottom: 4 }}>
                          <span style={{
                            fontSize: 10, fontWeight: 600, padding: "1px 6px", borderRadius: 100,
                            background: `${CHANNEL_COLORS[msg.channel] ?? T.border}22`,
                            color: CHANNEL_COLORS[msg.channel] ?? T.text3,
                          }}>
                            {CHANNEL_LABELS[msg.channel] ?? msg.channel}
                          </span>
                          <span style={{
                            fontSize: 10, padding: "1px 6px", borderRadius: 100,
                            background: msg.direction === "inbound" ? "rgba(34,197,94,0.12)" : "rgba(255,255,255,0.05)",
                            color: msg.direction === "inbound" ? T.green : T.text3,
                          }}>
                            {msg.direction}
                          </span>
                          {isUnread && (
                            <span style={{ width: 6, height: 6, borderRadius: "50%", background: T.blue, display: "inline-block", alignSelf: "center" }} />
                          )}
                        </div>
                        <p style={{
                          fontSize: 12, color: T.text3, margin: 0,
                          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                        }}>
                          {msg.content.slice(0, 70)}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right pane: message view */}
        <div style={{ flex: 1, overflowY: "auto", padding: "28px 36px" }}>
          {!selected ? (
            <div style={{ textAlign: "center", paddingTop: 100 }}>
              <div style={{
                width: 52, height: 52, borderRadius: 14, background: T.bgEl, border: `1px solid ${T.border}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                margin: "0 auto 16px", fontSize: 22,
              }}>
                ✉️
              </div>
              <p style={{ fontSize: 15, fontWeight: 500, color: T.text2, marginBottom: 6 }}>Select a message</p>
              <p style={{ fontSize: 13, color: T.text3 }}>Click any thread on the left to read it.</p>
            </div>
          ) : (
            <div style={{ maxWidth: 640 }}>
              {/* Message header */}
              <div style={{ marginBottom: 24 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                  <span style={{
                    fontSize: 11, fontWeight: 600, padding: "3px 9px", borderRadius: 100,
                    background: `${CHANNEL_COLORS[selected.channel] ?? T.border}22`,
                    color: CHANNEL_COLORS[selected.channel] ?? T.text3,
                  }}>
                    {CHANNEL_LABELS[selected.channel] ?? selected.channel}
                  </span>
                  <span style={{
                    fontSize: 11, padding: "3px 9px", borderRadius: 100,
                    background: selected.direction === "inbound" ? "rgba(34,197,94,0.12)" : "rgba(255,255,255,0.05)",
                    color: selected.direction === "inbound" ? T.green : T.text3,
                  }}>
                    {selected.direction}
                  </span>
                  <span style={{ fontSize: 11, color: T.text3, marginLeft: "auto" }}>
                    {new Date(selected.sent_at).toLocaleString()}
                  </span>
                </div>
                <h2 style={{ fontFamily: T.h, fontSize: 18, fontWeight: 700, color: T.text, marginBottom: 4 }}>
                  {selected.subject || senderName(selected)}
                </h2>
                <p style={{ fontSize: 13, color: T.text2 }}>
                  From: {senderName(selected)}
                  {selected.lead?.company ? ` · ${selected.lead.company}` : ""}
                </p>
              </div>

              {/* Message body */}
              <div style={{
                background: T.bgEl, border: `1px solid ${T.border}`,
                borderRadius: 12, padding: "20px 24px", marginBottom: 16,
              }}>
                <p style={{ fontSize: 14, color: T.text, lineHeight: 1.7, whiteSpace: "pre-wrap", margin: 0 }}>
                  {selected.content}
                </p>
              </div>

              {/* Lead context */}
              {selected.lead && (
                <div style={{
                  padding: "16px 18px", background: T.bgEl,
                  border: `1px solid ${T.border}`, borderRadius: 10,
                }}>
                  <p style={{ fontSize: 11, fontWeight: 600, color: T.text3, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>
                    Lead
                  </p>
                  <p style={{ fontSize: 14, fontWeight: 600, color: T.text, marginBottom: 2 }}>
                    {selected.lead.name || "Unknown"}
                  </p>
                  {selected.lead.company && (
                    <p style={{ fontSize: 12, color: T.text2 }}>{selected.lead.company}</p>
                  )}
                  <p style={{ fontSize: 12, color: T.text3, marginTop: 4 }}>
                    Status: <span style={{ color: T.gold }}>{selected.lead.status}</span>
                  </p>
                  {selected.lead.linkedin_url && (
                    <a
                      href={selected.lead.linkedin_url}
                      target="_blank"
                      rel="noreferrer"
                      style={{ fontSize: 12, color: "#3b82f6", textDecoration: "none", display: "inline-block", marginTop: 8 }}
                    >
                      View LinkedIn →
                    </a>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </PaywallGate>
  );
}
