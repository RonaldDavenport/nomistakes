"use client";

import { useParams } from "next/navigation";
import { useState, useEffect, useMemo } from "react";
import DOMPurify from "isomorphic-dompurify";

const T = {
  bg: "#09090B", bgEl: "#111113", bgAlt: "#18181B", border: "#27272A",
  text: "#FAFAFA", text2: "#A1A1AA", text3: "#71717A",
  gold: "#C8A44E", goldDim: "rgba(200,164,78,0.08)",
  green: "#22C55E", red: "#EF4444",
};

interface ContractData {
  id: string;
  title: string;
  body: string;
  signed_at: string | null;
  signer_name: string | null;
  created_at: string;
  businesses: { name: string } | null;
}

export default function SignPage() {
  const params = useParams();
  const token = params.token as string;

  const [contract, setContract] = useState<ContractData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [signerName, setSignerName] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [signing, setSigning] = useState(false);
  const [signed, setSigned] = useState(false);

  useEffect(() => {
    fetch(`/api/sign/${token}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.error) {
          setError(d.error);
        } else {
          setContract(d.contract);
          if (d.contract.signed_at) setSigned(true);
        }
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load contract");
        setLoading(false);
      });
  }, [token]);

  const handleSign = async () => {
    if (!signerName.trim() || !agreed) return;
    setSigning(true);
    const res = await fetch(`/api/sign/${token}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ signerName }),
    });
    const data = await res.json();
    if (res.ok) {
      setContract((prev) => prev ? { ...prev, signed_at: data.contract.signed_at, signer_name: data.contract.signer_name } : prev);
      setSigned(true);
    } else {
      setError(data.error || "Failed to sign");
    }
    setSigning(false);
  };

  // Sanitize contract body to prevent XSS — must be called unconditionally (hook rule)
  const sanitizedBody = useMemo(
    () => contract?.body ? DOMPurify.sanitize(contract.body, { USE_PROFILES: { html: true } }) : "",
    [contract?.body]
  );

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: T.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: T.text3, fontSize: 14 }}>Loading contract...</p>
      </div>
    );
  }

  if (error || !contract) {
    return (
      <div style={{ minHeight: "100vh", background: T.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center", maxWidth: 400 }}>
          <p style={{ color: T.red, fontSize: 16, fontWeight: 600, marginBottom: 8 }}>Contract Not Found</p>
          <p style={{ color: T.text3, fontSize: 13 }}>{error || "This signing link is invalid or expired."}</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: T.bg }}>
      {/* Header */}
      <div style={{ borderBottom: `1px solid ${T.border}`, padding: "20px 24px" }}>
        <div style={{ maxWidth: 760, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <p style={{ fontSize: 18, fontWeight: 700, color: T.text, margin: 0 }}>{contract.businesses?.name || "Contract"}</p>
            <p style={{ fontSize: 12, color: T.text3, marginTop: 2 }}>Electronic Signature Request</p>
          </div>
          {signed && (
            <span style={{ fontSize: 12, fontWeight: 600, color: T.green, padding: "4px 10px", borderRadius: 20, background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.2)" }}>
              Signed
            </span>
          )}
        </div>
      </div>

      <div style={{ maxWidth: 760, margin: "0 auto", padding: "40px 24px 80px" }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: T.text, marginBottom: 8, letterSpacing: "-0.02em" }}>
          {contract.title}
        </h1>
        <p style={{ fontSize: 13, color: T.text3, marginBottom: 32 }}>
          Created {new Date(contract.created_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
        </p>

        {/* Contract body — sanitized with DOMPurify to prevent XSS */}
        <div
          style={{
            background: T.bgEl, border: `1px solid ${T.border}`, borderRadius: 10,
            padding: "32px 40px", marginBottom: 32, color: T.text2,
            fontSize: 14, lineHeight: 1.8,
          }}
          dangerouslySetInnerHTML={{ __html: sanitizedBody }}
        />

        {signed ? (
          <div style={{ background: "rgba(34,197,94,0.05)", border: "1px solid rgba(34,197,94,0.2)", borderRadius: 10, padding: "24px 28px" }}>
            <p style={{ fontSize: 16, fontWeight: 600, color: T.green, marginBottom: 4 }}>Contract Signed</p>
            <p style={{ fontSize: 13, color: T.text3, margin: 0 }}>
              Signed by <strong style={{ color: T.text2 }}>{contract.signer_name}</strong> on{" "}
              {new Date(contract.signed_at!).toLocaleString("en-US", { dateStyle: "long", timeStyle: "short" })}
            </p>
          </div>
        ) : (
          <div style={{ background: T.bgEl, border: `1px solid ${T.border}`, borderRadius: 10, padding: "28px 32px" }}>
            <p style={{ fontSize: 15, fontWeight: 600, color: T.text, marginBottom: 20 }}>Sign this contract</p>

            <label style={{ display: "block", marginBottom: 16 }}>
              <span style={{ fontSize: 12, fontWeight: 500, color: T.text3, display: "block", marginBottom: 6 }}>Full Name *</span>
              <input
                type="text"
                value={signerName}
                onChange={(e) => setSignerName(e.target.value)}
                placeholder="Enter your full legal name"
                style={{
                  width: "100%", padding: "10px 12px", fontSize: 14,
                  background: T.bgAlt, border: `1px solid ${T.border}`,
                  borderRadius: 8, color: T.text, outline: "none",
                  boxSizing: "border-box",
                }}
              />
            </label>

            <label style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 24, cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                style={{ marginTop: 2, accentColor: T.gold }}
              />
              <span style={{ fontSize: 13, color: T.text2, lineHeight: 1.5 }}>
                I have read and agree to the terms of this contract. I understand that by signing, I am entering into a legally binding agreement.
              </span>
            </label>

            {error && <p style={{ fontSize: 13, color: T.red, marginBottom: 16 }}>{error}</p>}

            <button
              onClick={handleSign}
              disabled={!signerName.trim() || !agreed || signing}
              style={{
                padding: "12px 32px", fontSize: 14, fontWeight: 600,
                background: T.gold, color: "#09090B",
                border: "none", borderRadius: 8, cursor: "pointer",
                opacity: (!signerName.trim() || !agreed || signing) ? 0.5 : 1,
              }}
            >
              {signing ? "Signing..." : "Sign Contract"}
            </button>
          </div>
        )}
      </div>

      <div style={{ borderTop: `1px solid ${T.border}`, padding: "16px 24px", textAlign: "center" }}>
        <p style={{ fontSize: 11, color: T.text3 }}>Powered by kovra · Legally binding electronic signature</p>
      </div>
    </div>
  );
}
