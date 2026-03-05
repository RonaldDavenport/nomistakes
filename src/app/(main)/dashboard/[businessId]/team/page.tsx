"use client";

import { useBusinessContext } from "@/components/dashboard/BusinessProvider";
import { PaywallGate } from "@/components/dashboard/PaywallGate";
import { T, CTA_GRAD } from "@/lib/design-tokens";
import { useParams } from "next/navigation";
import { useState, useEffect, useCallback } from "react";

interface TeamMember {
  id: string;
  invited_email: string;
  role: string;
  accepted_at: string | null;
  created_at: string;
}


export default function TeamPage() {
  const params = useParams();
  const businessId = params.businessId as string;
  useBusinessContext();

  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInvite, setShowInvite] = useState(false);
  const [saving, setSaving] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("member");
  const [error, setError] = useState("");

  const fetchMembers = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/team?businessId=${businessId}`);
    const data = await res.json();
    setMembers(data.members || []);
    setLoading(false);
  }, [businessId]);

  useEffect(() => { fetchMembers(); }, [fetchMembers]);

  const invite = async () => {
    if (!inviteEmail.trim()) return;
    setSaving(true);
    setError("");
    const res = await fetch("/api/team", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ businessId, email: inviteEmail, role: inviteRole }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Failed to send invite");
    } else {
      setShowInvite(false);
      setInviteEmail(""); setInviteRole("member");
      fetchMembers();
    }
    setSaving(false);
  };

  const remove = async (memberId: string, email: string) => {
    if (!confirm(`Remove ${email} from the team?`)) return;
    await fetch(`/api/team/${memberId}`, { method: "DELETE" });
    fetchMembers();
  };

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "10px 12px", fontSize: 13,
    background: T.bgAlt, border: `1px solid ${T.border}`,
    borderRadius: 8, color: T.text, outline: "none", boxSizing: "border-box",
  };

  const active = members.filter((m) => m.accepted_at).length;
  const pending = members.filter((m) => !m.accepted_at).length;

  return (
    <PaywallGate requiredPlan="scale" teaser={{ headline: "Team Members", description: "Invite team members to collaborate on your business.", bullets: ["Unlimited team members", "Role-based access", "Email invitations"] }}>
      <div style={{ padding: "32px 40px 80px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
          <div>
            <h1 style={{ fontFamily: T.h, fontSize: 28, fontWeight: 700, color: T.text, letterSpacing: "-0.5px", margin: 0 }}>Team</h1>
            <p style={{ fontSize: 14, color: T.text2, marginTop: 4 }}>Invite and manage team members.</p>
          </div>
          <button onClick={() => setShowInvite(true)} style={{ background: CTA_GRAD, color: "#09090B", border: "none", borderRadius: 8, padding: "10px 20px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
            + Invite Member
          </button>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 24 }}>
          {[
            { label: "Total Members", value: members.length, color: T.text },
            { label: "Active", value: active, color: T.green },
            { label: "Pending Invite", value: pending, color: T.gold },
          ].map((s) => (
            <div key={s.label} style={{ padding: "16px 20px", borderRadius: 10, background: T.bgEl, border: `1px solid ${T.border}` }}>
              <span style={{ fontSize: 26, fontWeight: 700, color: s.color, fontFamily: T.h, display: "block" }}>{s.value}</span>
              <span style={{ fontSize: 12, color: T.text3, display: "block", marginTop: 2 }}>{s.label}</span>
            </div>
          ))}
        </div>

        {loading ? (
          <p style={{ color: T.text3, fontSize: 13 }}>Loading...</p>
        ) : members.length === 0 ? (
          <div style={{
            textAlign: "center", padding: "64px 24px",
            borderRadius: 12, border: `1px dashed ${T.border}`, background: T.bgEl,
          }}>
            <div style={{
              width: 48, height: 48, borderRadius: 12, background: T.goldDim,
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 16px", fontSize: 22,
            }}>
              👥
            </div>
            <h3 style={{ fontFamily: T.h, fontSize: 17, fontWeight: 600, color: T.text, marginBottom: 6 }}>No team members yet</h3>
            <p style={{ fontSize: 13, color: T.text2, maxWidth: 340, margin: "0 auto 20px", lineHeight: 1.5 }}>
              Invite team members to collaborate. They'll receive an email to accept the invitation.
            </p>
            <button onClick={() => setShowInvite(true)} style={{ display: "inline-block", padding: "10px 22px", borderRadius: 9, background: CTA_GRAD, color: "#09090B", fontSize: 13, fontWeight: 600, border: "none", cursor: "pointer" }}>
              Invite First Member
            </button>
          </div>
        ) : (
          <div style={{ background: T.bgEl, border: `1px solid ${T.border}`, borderRadius: 12, overflow: "hidden" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 100px 100px 60px", gap: 12, padding: "10px 16px", borderBottom: `1px solid ${T.border}`, fontSize: 11, fontWeight: 600, color: T.text3, textTransform: "uppercase", letterSpacing: "0.06em" }}>
              <span>Email</span>
              <span>Role</span>
              <span>Status</span>
              <span style={{ textAlign: "right" }}></span>
            </div>
            {members.map((m, idx) => (
              <div key={m.id} style={{ display: "grid", gridTemplateColumns: "1fr 100px 100px 60px", gap: 12, padding: "14px 16px", borderTop: idx > 0 ? `1px solid ${T.border}` : "none", alignItems: "center" }}>
                <span style={{ fontSize: 13, color: T.text }}>{m.invited_email}</span>
                <span style={{ fontSize: 12, color: T.text2, textTransform: "capitalize" }}>{m.role}</span>
                <span style={{
                  display: "inline-flex", alignItems: "center",
                  fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 100,
                  background: m.accepted_at ? "rgba(34,197,94,0.12)" : "rgba(200,164,78,0.12)",
                  color: m.accepted_at ? T.green : T.gold,
                }}>
                  {m.accepted_at ? "Active" : "Pending"}
                </span>
                <button onClick={() => remove(m.id, m.invited_email)} style={{ fontSize: 12, color: T.text3, background: "none", border: "none", cursor: "pointer", textAlign: "right" }}>
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Invite modal */}
        {showInvite && (
          <>
            <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 50 }} onClick={() => setShowInvite(false)} />
            <div style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: 440, background: T.bgEl, border: `1px solid ${T.border}`, borderRadius: 12, padding: 28, zIndex: 51 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: T.text, marginBottom: 20 }}>Invite Team Member</h2>
              <label style={{ display: "block", marginBottom: 16 }}>
                <span style={{ fontSize: 12, fontWeight: 500, color: T.text2, display: "block", marginBottom: 6 }}>Email Address *</span>
                <input type="email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} style={inputStyle} placeholder="teammate@example.com" />
              </label>
              <label style={{ display: "block", marginBottom: 20 }}>
                <span style={{ fontSize: 12, fontWeight: 500, color: T.text2, display: "block", marginBottom: 6 }}>Role</span>
                <select value={inviteRole} onChange={(e) => setInviteRole(e.target.value)} style={{ ...inputStyle, appearance: "none" as const }}>
                  <option value="member">Member</option>
                  <option value="admin">Admin</option>
                </select>
              </label>
              {error && <p style={{ fontSize: 13, color: T.red, marginBottom: 12 }}>{error}</p>}
              <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
                <button onClick={() => { setShowInvite(false); setError(""); }} style={{ padding: "10px 20px", fontSize: 13, background: "none", border: `1px solid ${T.border}`, borderRadius: 8, color: T.text2, cursor: "pointer" }}>Cancel</button>
                <button onClick={invite} disabled={saving || !inviteEmail.trim()} style={{ padding: "10px 20px", fontSize: 13, fontWeight: 600, background: CTA_GRAD, border: "none", borderRadius: 8, color: "#09090B", cursor: "pointer", opacity: saving ? 0.6 : 1 }}>
                  {saving ? "Sending..." : "Send Invite"}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </PaywallGate>
  );
}
