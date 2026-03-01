"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import GoogleSignInButton from "@/components/GoogleSignInButton";
import { T, CTA_GRAD } from "@/lib/design-tokens";

interface AuthGateModalProps {
  businessId: string;
  businessName: string;
  onSuccess: (userId: string) => void;
  onSkip: () => void;
}

export default function AuthGateModal({
  businessId,
  businessName,
  onSuccess,
  onSkip,
}: AuthGateModalProps) {
  const [tab, setTab] = useState<"signup" | "signin">("signup");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function claimBusiness(userId: string) {
    await fetch("/api/onboarding", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        businessId,
        step: "claim",
        data: { userId },
      }),
    });
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { data, error: authErr } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } },
      });

      if (authErr) {
        setError(authErr.message);
        setLoading(false);
        return;
      }

      if (data.user) {
        // Create profile
        await supabase.from("profiles").upsert({
          id: data.user.id,
          full_name: fullName,
          email,
        });

        // Claim the business
        await claimBusiness(data.user.id);
        onSuccess(data.user.id);
      }
    } catch {
      setError("Something went wrong. Please try again.");
    }
    setLoading(false);
  }

  async function handleSignin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { data, error: authErr } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authErr) {
        setError(authErr.message);
        setLoading(false);
        return;
      }

      if (data.user) {
        await claimBusiness(data.user.id);
        onSuccess(data.user.id);
      }
    } catch {
      setError("Something went wrong. Please try again.");
    }
    setLoading(false);
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 60,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0,0,0,0.75)",
        backdropFilter: "blur(8px)",
        padding: 16,
      }}
    >
      <div
        className="animate-scaleIn"
        style={{
          width: "100%",
          maxWidth: 440,
          background: T.bgEl,
          borderRadius: 20,
          border: `1px solid ${T.border}`,
          padding: "32px 28px",
          boxShadow: "0 24px 80px rgba(0,0,0,0.6)",
          backdropFilter: "blur(12px)",
        }}
      >
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: "50%",
              backgroundColor: T.purple,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
            }}
          >
            <span style={{ fontSize: 22 }}>&#10003;</span>
          </div>
          <h2 style={{ color: "#fff", fontSize: 22, fontWeight: 800, marginBottom: 6 }}>
            Your business is ready!
          </h2>
          <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 14 }}>
            Create an account to save <strong style={{ color: T.purpleLight }}>{businessName}</strong> and
            finish setting it up.
          </p>
        </div>

        {/* Tabs */}
        <div
          style={{
            display: "flex",
            borderRadius: 10,
            background: "rgba(255,255,255,0.04)",
            padding: 3,
            marginBottom: 20,
          }}
        >
          {(["signup", "signin"] as const).map((t) => (
            <button
              key={t}
              onClick={() => { setTab(t); setError(""); }}
              style={{
                flex: 1,
                padding: "10px 0",
                borderRadius: 8,
                border: "none",
                background: tab === t ? "rgba(123,57,252,0.15)" : "transparent",
                color: tab === t ? T.purpleLight : "rgba(255,255,255,0.4)",
                fontWeight: 600,
                fontSize: 13,
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              {t === "signup" ? "Sign Up" : "Sign In"}
            </button>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={tab === "signup" ? handleSignup : handleSignin}>
          {tab === "signup" && (
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: "block", fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Full Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                placeholder="Your name"
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  borderRadius: 10,
                  border: "1px solid rgba(255,255,255,0.1)",
                  background: "rgba(255,255,255,0.04)",
                  color: "#fff",
                  fontSize: 14,
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
            </div>
          )}

          <div style={{ marginBottom: 12 }}>
            <label style={{ display: "block", fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@email.com"
              style={{
                width: "100%",
                padding: "12px 14px",
                borderRadius: 10,
                border: "1px solid rgba(255,255,255,0.1)",
                background: "rgba(255,255,255,0.04)",
                color: "#fff",
                fontSize: 14,
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ display: "block", fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              placeholder="6+ characters"
              style={{
                width: "100%",
                padding: "12px 14px",
                borderRadius: 10,
                border: "1px solid rgba(255,255,255,0.1)",
                background: "rgba(255,255,255,0.04)",
                color: "#fff",
                fontSize: 14,
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>

          {error && (
            <p style={{ color: "#f87171", fontSize: 13, marginBottom: 12 }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "14px 0",
              borderRadius: 12,
              border: "none",
              background: CTA_GRAD,
              color: "#fff",
              fontWeight: 700,
              fontSize: 15,
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.6 : 1,
            }}
          >
            {loading ? "Please wait..." : tab === "signup" ? "Create Account" : "Sign In"}
          </button>
        </form>

        {/* Google OAuth divider */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "20px 0" }}>
          <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.05)" }} />
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", textTransform: "uppercase" }}>or</span>
          <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.05)" }} />
        </div>

        <GoogleSignInButton
          redirectTo={`/onboarding/${businessId}`}
          label={tab === "signup" ? "Sign up with Google" : "Sign in with Google"}
        />

        {/* Skip */}
        <div style={{ textAlign: "center", marginTop: 16 }}>
          <button
            onClick={onSkip}
            style={{
              background: "none",
              border: "none",
              color: "rgba(255,255,255,0.3)",
              fontSize: 13,
              cursor: "pointer",
              textDecoration: "underline",
            }}
          >
            Skip for now
          </button>
        </div>
      </div>
    </div>
  );
}
