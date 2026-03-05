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
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export default function InboxPage() {
  const params = useParams();
  const businessId = params.businessId as string;
  const { userId } = useBusinessContext();

  const [messages, setMessages] = useState<InboxMessage[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [channelFilter, setChannelFilter] = useState("");
  const [selected, setSelected] = useState<InboxMessage | null>(null);

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

  return (
    <PaywallGate requiredPlan="growth">
      <div style={{ display: "flex", height: "calc(100vh - 56px)" }}>

        {/* Left pane: thread list */}
        <div style={{
          width: 320,
          borderRight: `1px solid ${T.border}`,
          display: "flex",
          flexDirection: "column",
          flexShrink: 0,
        }}>
          {/* Filters */}
          <div style={{ padding: "16px 16px 12px", borderBottom: `1px solid ${T.border}` }}>
            <p style={{ fontSize: 15, fontWeight: 700, color: T.text, marginBottom: 12 }}>
              Inbox <span style={{ fontSize: 12, color: T.text3, fontWeight: 400 }}>({total})</span>
            </p>
            <div style={{ display: "flex", gap: 6 }}>
              {[{ value: "", label: "All" }, { value: "email", label: "Email" }, { value: "linkedin", label: "LinkedIn" }, { value: "twitter", label: "X" }].map((f) => (
                <button
                  key={f.value}
                  onClick={() => setChannelFilter(f.value)}
                  style={{
                    padding: "4px 10px", borderRadius: 5, fontSize: 11, fontWeight: 500,
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
              <p style={{ padding: 24, color: T.text3, fontSize: 13 }}>Loading...</p>
            ) : messages.length === 0 ? (
              <div style={{ padding: 32, textAlign: "center" }}>
                <p style={{ color: T.text3, fontSize: 13 }}>No messages yet.</p>
                <p style={{ color: T.text3, fontSize: 12, marginTop: 4 }}>
                  Messages logged after outreach appear here.
                </p>
              </div>
            ) : (
              messages.map((msg) => {
                const isSelected = selected?.id === msg.id;
                const isUnread = !msg.read_at && msg.direction === "inbound";
                return (
                  <div
                    key={msg.id}
                    onClick={() => handleSelect(msg)}
                    style={{
                      padding: "12px 16px",
                      borderBottom: `1px solid ${T.border}`,
                      cursor: "pointer",
                      background: isSelected ? T.goldDim : isUnread ? "rgba(255,255,255,0.02)" : "transparent",
                      borderLeft: isSelected ? `2px solid ${T.gold}` : "2px solid transparent",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                      <span style={{
                        fontSize: 13, fontWeight: isUnread ? 700 : 500,
                        color: isSelected ? T.gold : T.text,
                      }}>
                        {senderName(msg)}
                      </span>
                      <span style={{ fontSize: 11, color: T.text3 }}>{relativeTime(msg.sent_at)}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{
                        fontSize: 10, fontWeight: 600,
                        padding: "2px 6px", borderRadius: 3,
                        background: `${CHANNEL_COLORS[msg.channel]}22`,
                        color: CHANNEL_COLORS[msg.channel] ?? T.text3,
                      }}>
                        {CHANNEL_LABELS[msg.channel] ?? msg.channel}
                      </span>
                      <span style={{
                        fontSize: 10, padding: "2px 6px", borderRadius: 3,
                        background: msg.direction === "inbound" ? "rgba(34,197,94,0.12)" : "rgba(255,255,255,0.05)",
                        color: msg.direction === "inbound" ? "#22c55e" : T.text3,
                      }}>
                        {msg.direction}
                      </span>
                    </div>
                    <p style={{
                      fontSize: 12, color: T.text3, marginTop: 4,
                      whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                    }}>
                      {msg.content.slice(0, 80)}
                    </p>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right pane: message view */}
        <div style={{ flex: 1, overflowY: "auto", padding: 32 }}>
          {!selected ? (
            <div style={{ textAlign: "center", paddingTop: 80 }}>
              <p style={{ fontSize: 15, color: T.text3 }}>Select a message to read it.</p>
            </div>
          ) : (
            <div style={{ maxWidth: 640 }}>
              {/* Message header */}
              <div style={{ marginBottom: 24 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                  <span style={{
                    fontSize: 11, fontWeight: 600, padding: "3px 8px", borderRadius: 4,
                    background: `${CHANNEL_COLORS[selected.channel] ?? T.border}22`,
                    color: CHANNEL_COLORS[selected.channel] ?? T.text3,
                  }}>
                    {CHANNEL_LABELS[selected.channel] ?? selected.channel}
                  </span>
                  <span style={{
                    fontSize: 11, padding: "3px 8px", borderRadius: 4,
                    background: selected.direction === "inbound" ? "rgba(34,197,94,0.12)" : "rgba(255,255,255,0.05)",
                    color: selected.direction === "inbound" ? "#22c55e" : T.text3,
                  }}>
                    {selected.direction}
                  </span>
                  <span style={{ fontSize: 11, color: T.text3, marginLeft: "auto" }}>
                    {new Date(selected.sent_at).toLocaleString()}
                  </span>
                </div>
                <h2 style={{ fontSize: 17, fontWeight: 700, color: T.text, marginBottom: 2 }}>
                  {selected.subject || senderName(selected)}
                </h2>
                <p style={{ fontSize: 13, color: T.text3 }}>
                  From: {senderName(selected)}
                  {selected.lead?.company ? ` · ${selected.lead.company}` : ""}
                </p>
              </div>

              {/* Message body */}
              <div style={{
                background: T.bgEl,
                border: `1px solid ${T.border}`,
                borderRadius: 10,
                padding: "20px 24px",
              }}>
                <p style={{ fontSize: 14, color: T.text, lineHeight: 1.7, whiteSpace: "pre-wrap" }}>
                  {selected.content}
                </p>
              </div>

              {/* Lead context */}
              {selected.lead && (
                <div style={{
                  marginTop: 20,
                  padding: "14px 18px",
                  background: T.bgEl,
                  border: `1px solid ${T.border}`,
                  borderRadius: 8,
                }}>
                  <p style={{ fontSize: 11, fontWeight: 600, color: T.text3, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>
                    Lead Context
                  </p>
                  <p style={{ fontSize: 13, fontWeight: 600, color: T.text }}>
                    {selected.lead.name || "Unknown"}
                  </p>
                  {selected.lead.company && (
                    <p style={{ fontSize: 12, color: T.text3 }}>{selected.lead.company}</p>
                  )}
                  <p style={{ fontSize: 12, color: T.text3, marginTop: 4 }}>
                    Status: <span style={{ color: T.gold }}>{selected.lead.status}</span>
                  </p>
                  {selected.lead.linkedin_url && (
                    <a
                      href={selected.lead.linkedin_url}
                      target="_blank"
                      rel="noreferrer"
                      style={{ fontSize: 12, color: "#3b82f6", textDecoration: "none", display: "inline-block", marginTop: 6 }}
                    >
                      View LinkedIn
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
