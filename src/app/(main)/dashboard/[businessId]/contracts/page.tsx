"use client";

import { useBusinessContext } from "@/components/dashboard/BusinessProvider";
import { PaywallGate } from "@/components/dashboard/PaywallGate";
import { T, CTA_GRAD } from "@/lib/design-tokens";
import { useParams } from "next/navigation";
import { useState, useEffect, useCallback } from "react";

interface Contract {
  id: string;
  title: string;
  body: string;
  sign_token: string;
  signed_at: string | null;
  signer_name: string | null;
  created_at: string;
  contacts: { name: string; email: string } | null;
}


export default function ContractsPage() {
  const params = useParams();
  const businessId = params.businessId as string;
  const { userId } = useBusinessContext();

  const [contracts, setContracts] = useState<Contract[]>([]);
  const [contacts, setContacts] = useState<{ id: string; name: string; email: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  // Create form
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [contactId, setContactId] = useState("");

  const fetchContracts = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/contracts?businessId=${businessId}`);
    const data = await res.json();
    setContracts(data.contracts || []);
    setLoading(false);
  }, [businessId]);

  const fetchContacts = useCallback(async () => {
    const res = await fetch(`/api/contacts?businessId=${businessId}&limit=200`);
    const data = await res.json();
    setContacts((data.contacts || []).map((c: { id: string; name: string; email: string }) => ({ id: c.id, name: c.name || c.email, email: c.email })));
  }, [businessId]);

  useEffect(() => { fetchContracts(); fetchContacts(); }, [fetchContracts, fetchContacts]);

  const createContract = async () => {
    if (!title.trim() || !body.trim()) return;
    setSaving(true);
    await fetch("/api/contracts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ businessId, userId, contactId: contactId || null, title, body }),
    });
    setSaving(false);
    setShowCreate(false);
    setTitle(""); setBody(""); setContactId("");
    fetchContracts();
  };

  const deleteContract = async (contractId: string) => {
    if (!confirm("Delete this contract?")) return;
    await fetch("/api/contracts", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contractId }),
    });
    fetchContracts();
  };

  const copyLink = (token: string) => {
    const url = `${window.location.origin}/sign/${token}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(token);
      setTimeout(() => setCopied(null), 2000);
    });
  };

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "10px 12px", fontSize: 13,
    background: T.bgAlt, border: `1px solid ${T.border}`,
    borderRadius: 8, color: T.text, outline: "none",
    boxSizing: "border-box",
  };

  const pending = contracts.filter((c) => !c.signed_at).length;
  const signed = contracts.filter((c) => c.signed_at).length;

  return (
    <PaywallGate requiredPlan="solo" teaser={{ headline: "Contracts & E-Signatures", description: "Send contracts, collect legally binding e-signatures.", bullets: ["Create contracts", "Send signing links", "Track signature status"] }}>
      <div style={{ padding: "32px 40px 80px" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
          <div>
            <h1 style={{ fontFamily: T.h, fontSize: 28, fontWeight: 700, color: T.text, letterSpacing: "-0.5px", margin: 0 }}>Contracts</h1>
            <p style={{ fontSize: 14, color: T.text2, marginTop: 4, margin: "4px 0 0" }}>Send and track client contracts with e-signatures.</p>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            style={{ background: CTA_GRAD, color: "#09090B", border: "none", borderRadius: 8, padding: "10px 20px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}
          >
            + New Contract
          </button>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 24 }}>
          {[
            { label: "Total", value: contracts.length, color: T.text },
            { label: "Pending Signature", value: pending, color: T.gold },
            { label: "Signed", value: signed, color: T.green },
          ].map((s) => (
            <div key={s.label} style={{ padding: "16px 20px", borderRadius: 10, background: T.bgEl, border: `1px solid ${T.border}` }}>
              <span style={{ fontSize: 26, fontWeight: 700, color: s.color, fontFamily: T.h, display: "block" }}>{s.value}</span>
              <span style={{ fontSize: 12, color: T.text3, display: "block", marginTop: 2 }}>{s.label}</span>
            </div>
          ))}
        </div>

        {loading ? (
          <p style={{ color: T.text3, fontSize: 13 }}>Loading...</p>
        ) : contracts.length === 0 ? (
          <div style={{
            textAlign: "center", padding: "64px 24px",
            borderRadius: 12, border: `1px dashed ${T.border}`, background: T.bgEl,
          }}>
            <div style={{
              width: 48, height: 48, borderRadius: 12, background: T.goldDim,
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 16px", fontSize: 22,
            }}>
              📄
            </div>
            <h3 style={{ fontFamily: T.h, fontSize: 17, fontWeight: 600, color: T.text, marginBottom: 6 }}>No contracts yet</h3>
            <p style={{ fontSize: 13, color: T.text2, maxWidth: 320, margin: "0 auto 20px", lineHeight: 1.5 }}>
              Create a contract, send the signing link to your client, and get an e-signature in minutes.
            </p>
            <button onClick={() => setShowCreate(true)} style={{ display: "inline-block", padding: "10px 22px", borderRadius: 9, background: CTA_GRAD, color: "#09090B", fontSize: 13, fontWeight: 600, border: "none", cursor: "pointer" }}>
              Create First Contract
            </button>
          </div>
        ) : (
          <div style={{ background: T.bgEl, border: `1px solid ${T.border}`, borderRadius: 12, overflow: "hidden" }}>
            {/* Table header */}
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 100px 120px", gap: 12, padding: "10px 16px", borderBottom: `1px solid ${T.border}`, fontSize: 11, fontWeight: 600, color: T.text3, textTransform: "uppercase", letterSpacing: "0.06em", background: T.bgEl }}>
              <span>Title</span>
              <span>Client</span>
              <span>Status</span>
              <span style={{ textAlign: "right" }}>Actions</span>
            </div>
            {contracts.map((c, idx) => (
              <div key={c.id} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 100px 120px", gap: 12, padding: "14px 16px", borderTop: idx > 0 ? `1px solid ${T.border}` : "none", alignItems: "center" }}>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 500, color: T.text, margin: 0 }}>{c.title}</p>
                  <p style={{ fontSize: 12, color: T.text3, margin: 0, marginTop: 2 }}>
                    {new Date(c.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </p>
                </div>
                <span style={{ fontSize: 13, color: T.text2 }}>{c.contacts?.name || "—"}</span>
                <span style={{
                  display: "inline-flex", alignItems: "center",
                  fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 100,
                  background: c.signed_at ? "rgba(34,197,94,0.12)" : "rgba(200,164,78,0.12)",
                  color: c.signed_at ? T.green : T.gold,
                }}>
                  {c.signed_at ? "Signed" : "Pending"}
                </span>
                <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                  <button
                    onClick={() => copyLink(c.sign_token)}
                    style={{ fontSize: 12, color: copied === c.sign_token ? T.green : T.gold, background: "none", border: "none", cursor: "pointer", fontWeight: 500, padding: 0 }}
                  >
                    {copied === c.sign_token ? "Copied!" : "Copy link"}
                  </button>
                  <button
                    onClick={() => deleteContract(c.id)}
                    style={{ fontSize: 12, color: T.text3, background: "none", border: "none", cursor: "pointer", padding: 0 }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create modal */}
        {showCreate && (
          <>
            <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 50 }} onClick={() => setShowCreate(false)} />
            <div style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: 600, maxHeight: "85vh", overflowY: "auto", background: T.bgEl, border: `1px solid ${T.border}`, borderRadius: 12, padding: 28, zIndex: 51 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: T.text, marginBottom: 20 }}>New Contract</h2>

              <label style={{ display: "block", marginBottom: 16 }}>
                <span style={{ fontSize: 12, fontWeight: 500, color: T.text2, display: "block", marginBottom: 6 }}>Contract Title *</span>
                <input value={title} onChange={(e) => setTitle(e.target.value)} style={inputStyle} placeholder="e.g. Web Design Agreement" />
              </label>

              <label style={{ display: "block", marginBottom: 16 }}>
                <span style={{ fontSize: 12, fontWeight: 500, color: T.text2, display: "block", marginBottom: 6 }}>Client (optional)</span>
                <select value={contactId} onChange={(e) => setContactId(e.target.value)} style={{ ...inputStyle, appearance: "none" as const }}>
                  <option value="">Select a client...</option>
                  {contacts.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </label>

              <label style={{ display: "block", marginBottom: 20 }}>
                <span style={{ fontSize: 12, fontWeight: 500, color: T.text2, display: "block", marginBottom: 6 }}>Contract Body *</span>
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  rows={12}
                  style={{ ...inputStyle, resize: "vertical", fontFamily: "inherit", lineHeight: 1.6 }}
                  placeholder="Enter contract terms and conditions. HTML formatting is supported."
                />
              </label>

              <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
                <button onClick={() => setShowCreate(false)} style={{ padding: "10px 20px", fontSize: 13, background: "none", border: `1px solid ${T.border}`, borderRadius: 8, color: T.text2, cursor: "pointer" }}>Cancel</button>
                <button onClick={createContract} disabled={saving || !title.trim() || !body.trim()} style={{ padding: "10px 20px", fontSize: 13, fontWeight: 600, background: CTA_GRAD, border: "none", borderRadius: 8, color: "#09090B", cursor: "pointer", opacity: saving ? 0.6 : 1 }}>
                  {saving ? "Creating..." : "Create Contract"}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </PaywallGate>
  );
}
