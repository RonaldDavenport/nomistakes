"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
const StripeConnectProvider = dynamic(() => import("@/components/StripeConnectProvider"), { ssr: false });
import { supabase } from "@/lib/supabase";
import {
  ONBOARDING_STEPS,
  COLOR_PRESETS,
  ONBOARDING_AFFILIATES,
  type ColorPreset,
} from "@/lib/onboarding-data";
import { getTrackedUrl } from "@/lib/affiliates";
import { T, CTA_GRAD } from "@/lib/design-tokens";
import {
  trackOnboardingStep,
  trackOnboardingStepComplete,
  trackOnboardingSkip,
  trackOnboardingNameEdit,
  trackOnboardingAINames,
  trackOnboardingLayoutSelect,
  trackOnboardingColorSelect,
  trackOnboardingStripeConnect,
  trackOnboardingComplete,
} from "@/lib/analytics";

interface Business {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  type: string;
  audience: string;
  subtype?: string;
  persona?: "grinder" | "operator" | "scaler" | null;
  quiz_experience?: string;
  brand: {
    colors?: { primary: string; secondary: string; accent: string; background: string; text: string };
    logo_url?: string;
    [key: string]: unknown;
  };
  layout?: string;
  calendly_url?: string;
  stripe_account_id?: string;
  business_email?: string;
  site_content?: Record<string, unknown>;
  onboarding_step: number;
  onboarding_completed: boolean;
  deployed_url?: string;
  live_url?: string;
  user_id?: string;
}

export default function OnboardingPage() {
  const { businessId } = useParams<{ businessId: string }>();
  const router = useRouter();
  const [business, setBusiness] = useState<Business | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showIntro, setShowIntro] = useState(true);

  // Step-specific state
  const [nameValue, setNameValue] = useState("");
  const [slugValue, setSlugValue] = useState("");
  const [altNames, setAltNames] = useState<{ name: string; slug: string; why: string }[]>([]);
  const [generatingNames, setGeneratingNames] = useState(false);
  const [selectedColors, setSelectedColors] = useState<ColorPreset["colors"] | null>(null);
  const [businessEmail, setBusinessEmail] = useState("");
  const [stripeConnecting, setStripeConnecting] = useState(false);
  const [showStripeModal, setShowStripeModal] = useState(false);
  const [calendlyUrl, setCalendlyUrl] = useState("");
  // Lead Engine step state
  const [leadTitles, setLeadTitles] = useState("");
  const [leadIndustries, setLeadIndustries] = useState("");
  const [leadLocations, setLeadLocations] = useState("");
  // Satellite domain step state
  const [satelliteSubdomain, setSatelliteSubdomain] = useState("");
  const [provisioningInfra, setProvisioningInfra] = useState(false);
  const [infraResult, setInfraResult] = useState<{ satellite_domain?: string; workspace_email?: string } | null>(null);

  // Fetch business data
  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/onboarding?businessId=${businessId}`);
      if (res.ok) {
        const data = await res.json();
        const biz = data.business as Business;
        setBusiness(biz);
        setNameValue(biz.name);
        setSlugValue(biz.slug);
        if (biz.brand?.colors) setSelectedColors(biz.brand.colors);
        if (biz.business_email) setBusinessEmail(biz.business_email);
        if (biz.calendly_url) setCalendlyUrl(biz.calendly_url);
        // Map old 8-step index to new 5-step range
        if (biz.onboarding_step > 0 && biz.onboarding_step < ONBOARDING_STEPS.length) {
          setCurrentStep(Math.min(biz.onboarding_step, ONBOARDING_STEPS.length - 1));
          setShowIntro(false); // returning user — skip intro
        }

        // Auto-claim: if user is authed but business has no user_id, claim it
        const { data: { user } } = await supabase.auth.getUser();
        if (user && !biz.user_id) {
          await fetch("/api/onboarding", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ businessId, step: "claim", data: { userId: user.id } }),
          });
          setBusiness({ ...biz, user_id: user.id });
        }
      }
      setLoading(false);
    }
    load();
  }, [businessId]);

  // Track step views
  useEffect(() => {
    if (!loading && business) {
      const stepName = ONBOARDING_STEPS[currentStep]?.id ?? `step-${currentStep}`;
      trackOnboardingStep(currentStep, stepName);
    }
  }, [currentStep, loading, business]);

  const saveStep = useCallback(async (step: string, data: Record<string, unknown>) => {
    setSaving(true);
    try {
      const res = await fetch("/api/onboarding", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessId, step, data }),
      });
      if (res.ok) {
        const result = await res.json();
        setBusiness(result.business);
      }
    } catch (e) {
      console.error("Save failed:", e);
    }
    setSaving(false);
  }, [businessId]);

  function nextStep() {
    const stepName = ONBOARDING_STEPS[currentStep]?.id ?? `step-${currentStep}`;
    trackOnboardingStepComplete(currentStep, stepName);
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      setCurrentStep((s) => s + 1);
    } else {
      trackOnboardingComplete(businessId);
      router.push(`/dashboard/${businessId}`);
    }
  }

  function skipStep() {
    const stepName = ONBOARDING_STEPS[currentStep]?.id ?? `step-${currentStep}`;
    trackOnboardingSkip(currentStep, stepName);
    saveStep(ONBOARDING_STEPS[currentStep].id, {});
    nextStep();
  }

  async function regenerateNames() {
    if (!business) return;
    trackOnboardingAINames();
    setGeneratingNames(true);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "names",
          currentName: business.name,
          type: business.type,
          audience: business.audience,
          tagline: business.tagline,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setAltNames(data.names || []);
      }
    } catch {
      // silent
    }
    setGeneratingNames(false);
  }

  async function connectStripe() {
    trackOnboardingStripeConnect();
    setStripeConnecting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const res = await fetch("/api/stripe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "connect",
          businessId,
          userId: user?.id,
          businessName: business?.name,
        }),
      });
      const data = await res.json();
      if (res.ok && data.accountId) {
        setBusiness((prev) => prev ? { ...prev, stripe_account_id: data.accountId } : prev);
        return true;
      } else if (!data.alreadyConnected) {
        console.error("[stripe] Connect failed:", data.error || res.status);
        alert(data.error || "Failed to connect Stripe. Please try again.");
      }
    } catch (err) {
      console.error("[stripe] Connect error:", err);
      alert("Failed to connect to Stripe. Please try again.");
    }
    setStripeConnecting(false);
    return false;
  }

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: T.bg }}>
        <div style={{ width: 32, height: 32, borderRadius: "50%", border: "2px solid transparent", borderTopColor: T.gold, animation: "spin 0.8s linear infinite" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!business) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: T.bg }}>
        <p style={{ color: T.text3, marginBottom: 16 }}>Business not found</p>
        <Link href="/dashboard" style={{ color: T.purple }}>Back to Dashboard</Link>
      </div>
    );
  }

  // ── Welcome intro ── shown once, before step 1, on fresh builds
  if (showIntro) {
    const builtItems = [
      { label: "Website", detail: business.deployed_url || `kovra-${business.slug}.vercel.app` },
      { label: "Booking system", detail: "Ready to take appointments" },
      { label: "Invoicing", detail: "Send and track paid invoices" },
      { label: "CRM", detail: "Manage clients and leads" },
    ];
    return (
      <div style={{
        minHeight: "100vh",
        background: T.bg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "64px 24px",
      }}>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            style={{ maxWidth: 480, width: "100%" }}
          >
            {/* Check icon */}
            <div style={{
              width: 52, height: 52, borderRadius: 14,
              background: "rgba(34,197,94,0.08)",
              border: "1px solid rgba(34,197,94,0.18)",
              display: "flex", alignItems: "center", justifyContent: "center",
              marginBottom: 28,
            }}>
              <svg width="22" height="22" fill="none" stroke={T.green} viewBox="0 0 24 24" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </div>

            <h1 style={{
              fontFamily: T.h,
              fontSize: "clamp(1.8rem, 4vw, 2.4rem)",
              fontWeight: 700,
              color: T.text,
              letterSpacing: "-0.03em",
              lineHeight: 1.1,
              marginBottom: 10,
            }}>
              {business.name} is built.
            </h1>
            <p style={{ color: T.text2, fontSize: "0.95rem", lineHeight: 1.65, marginBottom: 36 }}>
              Your workspace is ready. Now let&apos;s spend 2 minutes finishing the setup so you can start working.
            </p>

            {/* What was built */}
            <div style={{
              borderRadius: 12,
              border: `1px solid ${T.border}`,
              background: T.bgEl,
              marginBottom: 32,
              overflow: "hidden",
            }}>
              {builtItems.map((item, i) => (
                <div key={item.label} style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  padding: "14px 18px",
                  borderBottom: i < builtItems.length - 1 ? `1px solid ${T.border}` : "none",
                }}>
                  <div style={{
                    width: 24, height: 24, borderRadius: 6, flexShrink: 0,
                    background: "rgba(34,197,94,0.08)",
                    border: "1px solid rgba(34,197,94,0.15)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <svg width="11" height="11" fill="none" stroke={T.green} viewBox="0 0 24 24" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ color: T.text, fontWeight: 500, fontSize: "0.88rem", fontFamily: T.h }}>{item.label}</p>
                    <p style={{ color: T.text3, fontSize: "0.75rem", marginTop: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.detail}</p>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => setShowIntro(false)}
              style={{
                width: "100%",
                padding: "14px 28px",
                borderRadius: 10,
                fontSize: "0.95rem",
                fontWeight: 600,
                fontFamily: T.h,
                border: "none",
                cursor: "pointer",
                background: CTA_GRAD,
                color: "#09090B",
                letterSpacing: "-0.01em",
              }}
            >
              Finish setup
            </button>
          </motion.div>
      </div>
    );
  }

  const stepDef = ONBOARDING_STEPS[currentStep];
  const progress = ((currentStep + 1) / ONBOARDING_STEPS.length) * 100;

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "14px 16px",
    borderRadius: 10,
    background: T.bgEl,
    border: `1px solid ${T.border}`,
    color: T.text,
    fontSize: "1rem",
    outline: "none",
    transition: "border-color 0.2s",
    boxSizing: "border-box",
  };

  return (
    <div style={{ minHeight: "100vh", background: T.bg }}>
      {/* Gold progress bar */}
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, height: 3, background: "rgba(255,255,255,0.05)", zIndex: 100 }}>
        <motion.div
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          style={{ height: "100%", background: T.gold }}
        />
      </div>

      {/* Top bar */}
      <div style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height: 52,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 24px",
        zIndex: 99,
        background: T.bg,
        borderBottom: `1px solid ${T.border}`,
      }}>
        <span style={{ fontFamily: T.h, fontSize: "1.05rem", fontWeight: 700, color: T.text, letterSpacing: "-0.03em" }}>kovra</span>
        <span style={{ fontSize: "0.78rem", color: T.text3 }}>Step {currentStep + 1} of {ONBOARDING_STEPS.length}</span>
      </div>

      {/* Main content */}
      <div style={{
        minHeight: "100vh",
        paddingTop: 72,
        paddingBottom: 64,
        paddingLeft: 24,
        paddingRight: 24,
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
      }}>
        <div style={{ maxWidth: 480, width: "100%", paddingTop: 48 }}>
          <AnimatePresence mode="wait">

            {/* ── Step 1: your-site ── */}
            {stepDef.id === "your-site" && (
              <motion.div
                key="your-site"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.3 }}
                style={{ display: "flex", flexDirection: "column", gap: 28 }}
              >
                <div>
                  <h2 style={{ fontFamily: T.h, fontSize: "clamp(1.6rem, 4vw, 2rem)", fontWeight: 700, color: T.text, letterSpacing: "-0.03em", lineHeight: 1.15, marginBottom: 8 }}>
                    Confirm your name.
                  </h2>
                  <p style={{ color: T.text2, fontSize: "0.9rem", lineHeight: 1.6 }}>
                    This appears on your site, invoices, and booking pages.
                  </p>
                </div>

                <div>
                  <input
                    type="text"
                    value={nameValue}
                    onChange={(e) => {
                      setNameValue(e.target.value);
                      setSlugValue(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""));
                      trackOnboardingNameEdit("manual");
                    }}
                    style={{ ...inputStyle, fontSize: "1.1rem", fontWeight: 500 }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = T.gold; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = T.border; }}
                  />
                  <p style={{ color: T.text3, fontSize: "0.75rem", marginTop: 8, fontFamily: T.mono }}>
                    {business.deployed_url || `kovra-${slugValue || business.slug}.vercel.app`}
                  </p>
                </div>

                <div>
                  <button
                    onClick={regenerateNames}
                    disabled={generatingNames}
                    style={{ fontSize: "0.875rem", color: T.text3, background: "none", border: "none", cursor: "pointer", padding: 0, opacity: generatingNames ? 0.5 : 1, textDecoration: "underline", textUnderlineOffset: 3 }}
                  >
                    {generatingNames ? "Generating names..." : "Suggest alternative names"}
                  </button>
                  {altNames.length > 0 && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 12 }}>
                      {altNames.map((alt) => (
                        <button
                          key={alt.slug}
                          onClick={() => { setNameValue(alt.name); setSlugValue(alt.slug); trackOnboardingNameEdit("ai_suggestion"); }}
                          style={{
                            padding: "12px 16px",
                            borderRadius: 10,
                            border: nameValue === alt.name ? `1px solid ${T.gold}` : `1px solid ${T.border}`,
                            background: nameValue === alt.name ? "rgba(212,175,55,0.06)" : T.bgEl,
                            cursor: "pointer",
                            textAlign: "left",
                            transition: "border-color 0.2s, background 0.2s",
                          }}
                        >
                          <span style={{ color: T.text, fontWeight: 500, fontSize: "0.9rem" }}>{alt.name}</span>
                          {alt.why && <span style={{ color: T.text3, fontSize: "0.78rem", display: "block", marginTop: 2 }}>{alt.why}</span>}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  onClick={async () => {
                    await saveStep("name", { name: nameValue, slug: slugValue });
                    nextStep();
                  }}
                  disabled={saving || !nameValue.trim()}
                  style={{
                    width: "100%",
                    padding: "14px",
                    borderRadius: 10,
                    border: "none",
                    background: CTA_GRAD,
                    color: "#09090B",
                    fontSize: "0.95rem",
                    fontWeight: 600,
                    fontFamily: T.h,
                    cursor: saving || !nameValue.trim() ? "not-allowed" : "pointer",
                    opacity: saving || !nameValue.trim() ? 0.5 : 1,
                    letterSpacing: "-0.01em",
                  }}
                >
                  {saving ? "Saving..." : "Continue"}
                </button>
              </motion.div>
            )}

            {/* ── Step 2: your-brand ── */}
            {stepDef.id === "your-brand" && (
              <motion.div
                key="your-brand"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.3 }}
                style={{ display: "flex", flexDirection: "column", gap: 28 }}
              >
                <div>
                  <h2 style={{ fontFamily: T.h, fontSize: "clamp(1.6rem, 4vw, 2rem)", fontWeight: 700, color: T.text, letterSpacing: "-0.03em", lineHeight: 1.15, marginBottom: 8 }}>
                    Pick your colors.
                  </h2>
                  <p style={{ color: T.text2, fontSize: "0.9rem", lineHeight: 1.6 }}>
                    These show up on your site and proposals.
                  </p>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
                  {business.brand?.colors && (() => {
                    const c = business.brand.colors!;
                    const isActive = selectedColors?.primary === c.primary && !COLOR_PRESETS.some((p) => p.colors.primary === c.primary);
                    return (
                      <button
                        key="ai-generated"
                        onClick={() => { setSelectedColors(c); trackOnboardingColorSelect("ai-generated"); }}
                        style={{
                          padding: 14,
                          borderRadius: 10,
                          border: isActive ? `1px solid ${T.gold}` : `1px solid ${T.border}`,
                          background: isActive ? "rgba(212,175,55,0.06)" : T.bgEl,
                          cursor: "pointer",
                          transition: "border-color 0.2s, background 0.2s",
                          textAlign: "left",
                        }}
                      >
                        <div style={{ display: "flex", gap: 4, marginBottom: 8 }}>
                          {[c.primary, c.secondary, c.accent].map((col, i) => (
                            <div key={i} style={{ width: 18, height: 18, borderRadius: "50%", background: col }} />
                          ))}
                        </div>
                        <span style={{ fontSize: "0.75rem", color: T.text2 }}>AI Pick</span>
                      </button>
                    );
                  })()}
                  {COLOR_PRESETS.map((preset) => {
                    const isActive = selectedColors?.primary === preset.colors.primary;
                    return (
                      <button
                        key={preset.id}
                        onClick={() => { setSelectedColors(preset.colors); trackOnboardingColorSelect(preset.id); }}
                        style={{
                          padding: 14,
                          borderRadius: 10,
                          border: isActive ? `1px solid ${T.gold}` : `1px solid ${T.border}`,
                          background: isActive ? "rgba(212,175,55,0.06)" : T.bgEl,
                          cursor: "pointer",
                          transition: "border-color 0.2s, background 0.2s",
                          textAlign: "left",
                        }}
                      >
                        <div style={{ display: "flex", gap: 4, marginBottom: 8 }}>
                          {[preset.colors.primary, preset.colors.secondary, preset.colors.accent].map((c, i) => (
                            <div key={i} style={{ width: 18, height: 18, borderRadius: "50%", background: c }} />
                          ))}
                        </div>
                        <span style={{ fontSize: "0.75rem", color: T.text2 }}>{preset.name}</span>
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={async () => {
                    if (selectedColors) await saveStep("colors", { colors: selectedColors });
                    nextStep();
                  }}
                  disabled={saving}
                  style={{
                    width: "100%",
                    padding: "14px",
                    borderRadius: 10,
                    border: "none",
                    background: CTA_GRAD,
                    color: "#09090B",
                    fontSize: "0.95rem",
                    fontWeight: 600,
                    fontFamily: T.h,
                    cursor: saving ? "not-allowed" : "pointer",
                    opacity: saving ? 0.5 : 1,
                    letterSpacing: "-0.01em",
                  }}
                >
                  {saving ? "Saving..." : "Continue"}
                </button>
              </motion.div>
            )}

            {/* ── Step 3: payments ── */}
            {stepDef.id === "payments" && (
              <motion.div
                key="payments"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.3 }}
                style={{ display: "flex", flexDirection: "column", gap: 28 }}
              >
                <div>
                  <h2 style={{ fontFamily: T.h, fontSize: "clamp(1.6rem, 4vw, 2rem)", fontWeight: 700, color: T.text, letterSpacing: "-0.03em", lineHeight: 1.15, marginBottom: 8 }}>
                    Connect Stripe.
                  </h2>
                  <p style={{ color: T.text2, fontSize: "0.9rem", lineHeight: 1.6 }}>
                    Send invoices and get paid directly from your dashboard. Stripe handles the money movement.
                  </p>
                </div>

                {business.stripe_account_id ? (
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "16px 18px",
                    borderRadius: 10,
                    background: "rgba(34,197,94,0.04)",
                    border: "1px solid rgba(34,197,94,0.2)",
                  }}>
                    <div style={{ width: 10, height: 10, borderRadius: "50%", background: T.green, flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <p style={{ color: T.text, fontWeight: 500, fontSize: "0.9rem" }}>Stripe connected</p>
                      <p style={{ color: T.text3, fontSize: "0.78rem", marginTop: 2 }}>Complete setup to start accepting payments</p>
                    </div>
                    <button
                      onClick={() => setShowStripeModal(true)}
                      style={{ padding: "8px 14px", borderRadius: 8, background: CTA_GRAD, color: "#09090B", fontSize: "0.82rem", fontWeight: 600, border: "none", cursor: "pointer" }}
                    >
                      Finish setup
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={async () => {
                      const ok = await connectStripe();
                      if (ok) setShowStripeModal(true);
                    }}
                    disabled={stripeConnecting}
                    style={{
                      width: "100%",
                      padding: "18px 20px",
                      borderRadius: 10,
                      border: `1px solid ${T.border}`,
                      background: T.bgEl,
                      cursor: stripeConnecting ? "not-allowed" : "pointer",
                      textAlign: "left",
                      opacity: stripeConnecting ? 0.6 : 1,
                      transition: "border-color 0.2s",
                    }}
                    onMouseEnter={(e) => { if (!stripeConnecting) e.currentTarget.style.borderColor = T.gold; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = T.border; }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                      <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(99,91,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "1rem", color: "#635bff", flexShrink: 0 }}>
                        S
                      </div>
                      <div>
                        <p style={{ color: T.text, fontWeight: 500, fontSize: "0.9rem" }}>
                          {stripeConnecting ? "Connecting..." : "Connect Stripe"}
                        </p>
                        <p style={{ color: T.text3, fontSize: "0.78rem", marginTop: 2 }}>For invoicing and getting paid. Takes 2 minutes.</p>
                      </div>
                    </div>
                  </button>
                )}

                {showStripeModal && (
                  <StripeOnboardingModal
                    businessId={businessId}
                    onComplete={async () => {
                      setShowStripeModal(false);
                      await saveStep("payments", { stripeAccountId: business.stripe_account_id });
                      nextStep();
                    }}
                    onClose={() => setShowStripeModal(false)}
                  />
                )}

                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <button
                    onClick={async () => {
                      await saveStep("payments", { stripeAccountId: business.stripe_account_id || undefined });
                      nextStep();
                    }}
                    disabled={saving}
                    style={{
                      width: "100%",
                      padding: "14px",
                      borderRadius: 10,
                      border: "none",
                      background: CTA_GRAD,
                      color: "#09090B",
                      fontSize: "0.95rem",
                      fontWeight: 600,
                      fontFamily: T.h,
                      cursor: saving ? "not-allowed" : "pointer",
                      opacity: saving ? 0.5 : 1,
                      letterSpacing: "-0.01em",
                    }}
                  >
                    Continue
                  </button>
                  <button
                    onClick={skipStep}
                    style={{ fontSize: "0.85rem", color: T.text3, background: "none", border: "none", cursor: "pointer", padding: "8px 0" }}
                  >
                    Skip for now
                  </button>
                </div>
              </motion.div>
            )}

            {/* ── Step 4: booking ── */}
            {stepDef.id === "booking" && (
              <motion.div
                key="booking"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.3 }}
                style={{ display: "flex", flexDirection: "column", gap: 28 }}
              >
                <div>
                  <h2 style={{ fontFamily: T.h, fontSize: "clamp(1.6rem, 4vw, 2rem)", fontWeight: 700, color: T.text, letterSpacing: "-0.03em", lineHeight: 1.15, marginBottom: 8 }}>
                    Add a booking link.
                  </h2>
                  <p style={{ color: T.text2, fontSize: "0.9rem", lineHeight: 1.6 }}>
                    Paste your Calendly, Cal.com, or any scheduling URL. It gets embedded on your site so clients can book you without a back-and-forth.
                  </p>
                </div>

                <div>
                  <input
                    type="url"
                    value={calendlyUrl}
                    onChange={(e) => setCalendlyUrl(e.target.value)}
                    placeholder="https://calendly.com/yourname"
                    style={inputStyle}
                    onFocus={(e) => { e.currentTarget.style.borderColor = T.gold; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = T.border; }}
                  />
                  <p style={{ color: T.text3, fontSize: "0.75rem", marginTop: 8 }}>
                    Works with Calendly, Cal.com, Acuity, TidyCal, or any embeddable link.
                  </p>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <button
                    onClick={async () => {
                      if (calendlyUrl.trim()) {
                        await saveStep("scheduling", { calendlyUrl: calendlyUrl.trim() });
                      }
                      nextStep();
                    }}
                    disabled={saving}
                    style={{
                      width: "100%",
                      padding: "14px",
                      borderRadius: 10,
                      border: "none",
                      background: CTA_GRAD,
                      color: "#09090B",
                      fontSize: "0.95rem",
                      fontWeight: 600,
                      fontFamily: T.h,
                      cursor: saving ? "not-allowed" : "pointer",
                      opacity: saving ? 0.5 : 1,
                      letterSpacing: "-0.01em",
                    }}
                  >
                    {saving ? "Saving..." : "Continue"}
                  </button>
                  <button
                    onClick={skipStep}
                    style={{ fontSize: "0.85rem", color: T.text3, background: "none", border: "none", cursor: "pointer", padding: "8px 0" }}
                  >
                    Skip for now
                  </button>
                </div>
              </motion.div>
            )}

            {/* ── Step 5: go-live ── */}
            {stepDef.id === "go-live" && (
              <motion.div
                key="go-live"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.3 }}
                style={{ display: "flex", flexDirection: "column", gap: 28 }}
              >
                <div>
                  <h2 style={{ fontFamily: T.h, fontSize: "clamp(1.6rem, 4vw, 2rem)", fontWeight: 700, color: T.text, letterSpacing: "-0.03em", lineHeight: 1.15, marginBottom: 8 }}>
                    Add a contact email.
                  </h2>
                  <p style={{ color: T.text2, fontSize: "0.9rem", lineHeight: 1.6 }}>
                    This shows on your website so clients can reach you.
                  </p>
                </div>

                <input
                  type="email"
                  value={businessEmail}
                  onChange={(e) => setBusinessEmail(e.target.value)}
                  placeholder={`hello@${slugValue || business.slug}.com`}
                  style={inputStyle}
                  onFocus={(e) => { e.currentTarget.style.borderColor = T.gold; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = T.border; }}
                />

                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <button
                    onClick={async () => {
                      await saveStep("email", { businessEmail: businessEmail || undefined });
                      nextStep();
                    }}
                    disabled={saving}
                    style={{
                      width: "100%",
                      padding: "14px",
                      borderRadius: 10,
                      border: "none",
                      background: CTA_GRAD,
                      color: "#09090B",
                      fontSize: "0.95rem",
                      fontWeight: 600,
                      fontFamily: T.h,
                      cursor: saving ? "not-allowed" : "pointer",
                      opacity: saving ? 0.5 : 1,
                      letterSpacing: "-0.01em",
                    }}
                  >
                    {saving ? "Saving..." : "Finish setup"}
                  </button>
                  <button
                    onClick={skipStep}
                    style={{ fontSize: "0.85rem", color: T.text3, background: "none", border: "none", cursor: "pointer", padding: "8px 0" }}
                  >
                    Skip for now
                  </button>
                </div>
              </motion.div>
            )}

            {/* ── Step 6: Lead Engine ── */}
            {stepDef.id === "lead-engine" && (
              <motion.div
                key="lead-engine"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.3 }}
                style={{ display: "flex", flexDirection: "column", gap: 20 }}
              >
                <div>
                  <h2 style={{ fontFamily: T.h, fontSize: "clamp(1.5rem, 4vw, 1.9rem)", fontWeight: 700, color: T.text, letterSpacing: "-0.03em", lineHeight: 1.15, marginBottom: 8 }}>
                    Who do you want to reach?
                  </h2>
                  <p style={{ color: T.text2, fontSize: "0.9rem", lineHeight: 1.6 }}>
                    Tell Kovra your ideal client profile. We use this to find prospects in Apollo.io.
                  </p>
                </div>

                {[
                  { label: "Job Titles", value: leadTitles, set: setLeadTitles, placeholder: "CEO, Founder, VP of Sales" },
                  { label: "Industries", value: leadIndustries, set: setLeadIndustries, placeholder: "SaaS, E-commerce, Healthcare" },
                  { label: "Locations", value: leadLocations, set: setLeadLocations, placeholder: "United States, New York, Remote" },
                ].map(({ label, value, set, placeholder }) => (
                  <div key={label}>
                    <label style={{ fontSize: "0.78rem", fontWeight: 500, color: T.text3, display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                      {label}
                    </label>
                    <input
                      value={value}
                      onChange={(e) => set(e.target.value)}
                      placeholder={placeholder}
                      style={{
                        width: "100%", padding: "10px 14px",
                        background: T.bgEl,
                        border: `1px solid ${T.border}`,
                        borderRadius: 10, fontSize: "0.9rem", color: T.text,
                        outline: "none", boxSizing: "border-box",
                        fontFamily: T.h,
                      }}
                    />
                    <p style={{ fontSize: "0.75rem", color: T.text3, marginTop: 4 }}>Comma-separated</p>
                  </div>
                ))}

                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <button
                    onClick={async () => {
                      await saveStep("lead-engine", {
                        leadTitles: leadTitles.split(",").map((t) => t.trim()).filter(Boolean),
                        leadIndustries: leadIndustries.split(",").map((i) => i.trim()).filter(Boolean),
                        leadLocations: leadLocations.split(",").map((l) => l.trim()).filter(Boolean),
                      });
                      nextStep();
                    }}
                    disabled={saving}
                    style={{
                      width: "100%", padding: "14px", borderRadius: 10, border: "none",
                      background: CTA_GRAD, color: "#09090B",
                      fontSize: "0.95rem", fontWeight: 600, fontFamily: T.h,
                      cursor: saving ? "not-allowed" : "pointer", letterSpacing: "-0.01em",
                      opacity: saving ? 0.7 : 1,
                    }}
                  >
                    {saving ? "Saving..." : "Save and continue"}
                  </button>
                  <button
                    onClick={skipStep}
                    style={{
                      width: "100%", padding: "14px", borderRadius: 10,
                      border: `1px solid ${T.border}`, background: T.bgEl, color: T.text3,
                      fontSize: "0.9rem", fontWeight: 500, cursor: "pointer",
                    }}
                  >
                    Skip for now
                  </button>
                </div>
              </motion.div>
            )}

            {/* ── Step 7: Satellite Domain ── */}
            {stepDef.id === "satellite-domain" && (
              <motion.div
                key="satellite-domain"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.3 }}
                style={{ display: "flex", flexDirection: "column", gap: 20 }}
              >
                <div>
                  <h2 style={{ fontFamily: T.h, fontSize: "clamp(1.5rem, 4vw, 1.9rem)", fontWeight: 700, color: T.text, letterSpacing: "-0.03em", lineHeight: 1.15, marginBottom: 8 }}>
                    Set up your outreach domain.
                  </h2>
                  <p style={{ color: T.text2, fontSize: "0.9rem", lineHeight: 1.6 }}>
                    A dedicated subdomain keeps your main domain healthy. Cold emails come from here, not your primary address.
                  </p>
                </div>

                <div>
                  <label style={{ fontSize: "0.78rem", fontWeight: 500, color: T.text3, display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    Subdomain
                  </label>
                  <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
                    <input
                      value={satelliteSubdomain}
                      onChange={(e) => setSatelliteSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                      placeholder="acme-outreach"
                      style={{
                        flex: 1, padding: "10px 14px",
                        background: T.bgEl, border: `1px solid ${T.border}`,
                        borderRadius: "10px 0 0 10px", fontSize: "0.9rem", color: T.text,
                        outline: "none", fontFamily: T.mono,
                      }}
                    />
                    <span style={{
                      padding: "10px 14px", background: "rgba(255,255,255,0.04)",
                      border: `1px solid ${T.border}`, borderLeft: "none",
                      borderRadius: "0 10px 10px 0", fontSize: "0.9rem", color: T.text3,
                      fontFamily: T.mono, whiteSpace: "nowrap",
                    }}>
                      .kovra.io
                    </span>
                  </div>
                </div>

                {infraResult && (
                  <div style={{ padding: "12px 16px", borderRadius: 10, background: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.15)" }}>
                    <p style={{ fontSize: "0.82rem", color: T.text2, fontWeight: 500 }}>Domain provisioned</p>
                    {infraResult.workspace_email && (
                      <p style={{ fontSize: "0.8rem", color: T.text3, marginTop: 4 }}>
                        Outreach email: <span style={{ fontFamily: T.mono, color: T.text }}>{infraResult.workspace_email}</span>
                      </p>
                    )}
                  </div>
                )}

                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <button
                    onClick={async () => {
                      if (!satelliteSubdomain.trim()) { nextStep(); return; }
                      setProvisioningInfra(true);
                      const { data: { user } } = await supabase.auth.getUser();
                      const res = await fetch("/api/infrastructure", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          businessId,
                          userId: user?.id,
                          subdomain: satelliteSubdomain.trim(),
                          firstName: business.name.split(" ")[0] || "Business",
                          lastName: business.name.split(" ")[1] || "Owner",
                        }),
                      });
                      const data = await res.json();
                      setProvisioningInfra(false);
                      if (data.infrastructure) setInfraResult(data.infrastructure);
                      nextStep();
                    }}
                    disabled={provisioningInfra}
                    style={{
                      width: "100%", padding: "14px", borderRadius: 10, border: "none",
                      background: CTA_GRAD, color: "#09090B",
                      fontSize: "0.95rem", fontWeight: 600, fontFamily: T.h,
                      cursor: provisioningInfra ? "not-allowed" : "pointer", letterSpacing: "-0.01em",
                      opacity: provisioningInfra ? 0.7 : 1,
                    }}
                  >
                    {provisioningInfra ? "Provisioning..." : satelliteSubdomain.trim() ? "Set up domain" : "Skip"}
                  </button>
                  {!provisioningInfra && (
                    <button
                      onClick={skipStep}
                      style={{
                        width: "100%", padding: "14px", borderRadius: 10,
                        border: `1px solid ${T.border}`, background: T.bgEl, color: T.text3,
                        fontSize: "0.9rem", fontWeight: 500, cursor: "pointer",
                      }}
                    >
                      Skip for now
                    </button>
                  )}
                </div>
              </motion.div>
            )}

            {/* ── Step 8: Inbox Connect ── */}
            {stepDef.id === "inbox-connect" && (
              <motion.div
                key="inbox-connect"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.3 }}
                style={{ display: "flex", flexDirection: "column", gap: 20 }}
              >
                <div>
                  <h2 style={{ fontFamily: T.h, fontSize: "clamp(1.5rem, 4vw, 1.9rem)", fontWeight: 700, color: T.text, letterSpacing: "-0.03em", lineHeight: 1.15, marginBottom: 8 }}>
                    Connect your inbox.
                  </h2>
                  <p style={{ color: T.text2, fontSize: "0.9rem", lineHeight: 1.6 }}>
                    Replies from LinkedIn, X, and email all land in one place. Connect your accounts to activate the unified inbox.
                  </p>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {[
                    { label: "LinkedIn", icon: "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z", color: "#0077b5" },
                    { label: "Email (Nylas)", icon: "M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75", color: "#3b82f6" },
                    { label: "X / Twitter", icon: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.259 5.632L18.244 2.25z", color: "#1da1f2" },
                  ].map(({ label, icon, color }) => (
                    <div
                      key={label}
                      style={{
                        display: "flex", alignItems: "center", justifyContent: "space-between",
                        padding: "14px 16px", borderRadius: 10,
                        background: T.bgEl, border: `1px solid ${T.border}`,
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div style={{ width: 36, height: 36, borderRadius: 8, background: `${color}18`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill={color}>
                            <path d={icon} />
                          </svg>
                        </div>
                        <span style={{ fontSize: "0.9rem", fontWeight: 500, color: T.text }}>{label}</span>
                      </div>
                      <span style={{ fontSize: "0.78rem", color: T.text3, padding: "4px 10px", borderRadius: 6, border: `1px solid ${T.border}` }}>
                        Coming soon
                      </span>
                    </div>
                  ))}
                </div>

                <p style={{ fontSize: "0.78rem", color: T.text3, lineHeight: 1.6 }}>
                  Native integrations with LinkedIn (Unipile) and email (Nylas) are in beta. You can skip this and connect later from your Inbox settings.
                </p>

                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <button
                    onClick={nextStep}
                    style={{
                      width: "100%", padding: "14px", borderRadius: 10, border: "none",
                      background: CTA_GRAD, color: "#09090B",
                      fontSize: "0.95rem", fontWeight: 600, fontFamily: T.h,
                      cursor: "pointer", letterSpacing: "-0.01em",
                    }}
                  >
                    Continue
                  </button>
                </div>
              </motion.div>
            )}

            {/* ── Step 9: done screen ── */}
            {stepDef.id === "meet-your-coach" && (
              <motion.div
                key="meet-your-coach"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.3 }}
                style={{ display: "flex", flexDirection: "column", gap: 28 }}
              >
                <div style={{
                  width: 52,
                  height: 52,
                  borderRadius: 14,
                  background: "rgba(34,197,94,0.08)",
                  border: "1px solid rgba(34,197,94,0.18)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}>
                  <svg width="22" height="22" fill="none" stroke={T.green} viewBox="0 0 24 24" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                </div>

                {(() => {
                  const subtypeLabel = business.subtype === "consulting" ? "consulting practice"
                    : business.subtype === "coaching" ? "coaching practice"
                    : business.subtype === "agency" ? "agency"
                    : "business";
                  const personaSubtext = business.persona === "grinder"
                    ? "Your site is live and your workspace is ready. Your first priority: landing your first clients. The checklist walks you through it step by step."
                    : business.persona === "scaler"
                    ? "Your workspace is built for scale. Start by importing your client base — then use the lead engine and pipeline to grow from there."
                    : "Import your existing clients first — it takes about 10 minutes and unlocks the full CRM. Then use proposals and invoicing to run everything from one place.";
                  return (
                    <div>
                      <h2 style={{ fontFamily: T.h, fontSize: "clamp(1.6rem, 4vw, 2rem)", fontWeight: 700, color: T.text, letterSpacing: "-0.03em", lineHeight: 1.15, marginBottom: 8 }}>
                        Your {subtypeLabel} is ready.
                      </h2>
                      <p style={{ color: T.text2, fontSize: "0.9rem", lineHeight: 1.6 }}>
                        {personaSubtext}
                      </p>
                    </div>
                  );
                })()}

                {(() => {
                  const siteUrl = business.deployed_url || business.live_url || `kovra-${slugValue || business.slug}.vercel.app`;
                  const href = siteUrl.startsWith("http") ? siteUrl : `https://${siteUrl}`;
                  return (
                    <div style={{ padding: "14px 16px", borderRadius: 10, background: T.bgEl, border: `1px solid ${T.border}` }}>
                      <p style={{ color: T.text3, fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>Your site</p>
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: T.text, fontFamily: T.mono, fontSize: "0.85rem", textDecoration: "none", wordBreak: "break-all" }}
                      >
                        {siteUrl}
                      </a>
                    </div>
                  );
                })()}

                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <button
                    onClick={() => {
                      trackOnboardingComplete(businessId);
                      router.push(`/dashboard/${businessId}`);
                    }}
                    style={{
                      width: "100%",
                      padding: "14px",
                      borderRadius: 10,
                      border: "none",
                      background: CTA_GRAD,
                      color: "#09090B",
                      fontSize: "0.95rem",
                      fontWeight: 600,
                      fontFamily: T.h,
                      cursor: "pointer",
                      letterSpacing: "-0.01em",
                    }}
                  >
                    Go to dashboard
                  </button>
                  {(() => {
                    const siteUrl = business.deployed_url || business.live_url;
                    if (!siteUrl) return null;
                    const href = siteUrl.startsWith("http") ? siteUrl : `https://${siteUrl}`;
                    return (
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: "block",
                          padding: "14px",
                          borderRadius: 10,
                          border: `1px solid ${T.border}`,
                          background: T.bgEl,
                          color: T.text,
                          fontSize: "0.95rem",
                          fontWeight: 600,
                          fontFamily: T.h,
                          cursor: "pointer",
                          letterSpacing: "-0.01em",
                          textDecoration: "none",
                          textAlign: "center",
                          boxSizing: "border-box",
                        }}
                      >
                        View site
                      </a>
                    );
                  })()}
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// ── Reusable Components ──

function StepActions({
  saving,
  skippable,
  lastStep,
  onContinue,
  onSkip,
}: {
  saving: boolean;
  skippable: boolean;
  lastStep?: boolean;
  onContinue: () => void;
  onSkip: () => void;
}) {
  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      paddingTop: 16,
      borderTop: `1px solid ${T.border}`,
    }}>
      {skippable ? (
        <button
          onClick={onSkip}
          style={{ fontSize: "0.875rem", color: T.text3, background: "none", border: "none", cursor: "pointer" }}
        >
          Skip for now
        </button>
      ) : (
        <div />
      )}
      <button
        onClick={onContinue}
        disabled={saving}
        style={{
          padding: "12px 32px",
          borderRadius: 12,
          fontSize: "0.875rem",
          fontWeight: 600,
          color: "#fff",
          background: CTA_GRAD,
          border: "none",
          cursor: saving ? "not-allowed" : "pointer",
          opacity: saving ? 0.6 : 1,
          transition: "opacity 0.2s",
        }}
      >
        {saving ? "Saving..." : lastStep ? "Finish Setup" : "Continue"}
      </button>
    </div>
  );
}

function StripeOnboardingModal({ businessId, onComplete, onClose }: { businessId: string; onComplete: () => void; onClose: () => void }) {
  const [OnboardingComponent, setOnboardingComponent] = useState<React.ComponentType<{ onExit: () => void }> | null>(null);

  useEffect(() => {
    import("@stripe/react-connect-js").then((mod) => {
      setOnboardingComponent(() => mod.ConnectAccountOnboarding);
    });
  }, []);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 100,
        background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 16,
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        background: T.bgEl, borderRadius: 16,
        border: `1px solid ${T.border}`,
        width: "100%", maxWidth: 900, maxHeight: "95vh",
        display: "flex", flexDirection: "column",
        overflow: "hidden",
      }}>
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "16px 20px", borderBottom: `1px solid ${T.border}`,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: "rgba(123,57,252,0.12)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: T.purple, fontWeight: 700, fontSize: 14,
            }}>S</div>
            <span style={{ color: T.text, fontWeight: 600, fontSize: 15 }}>Set Up Stripe</span>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "rgba(255,255,255,0.06)", border: "none",
              borderRadius: 8, width: 32, height: 32,
              display: "flex", alignItems: "center", justifyContent: "center",
              color: T.text2, cursor: "pointer", fontSize: 18,
            }}
          >&times;</button>
        </div>

        <div style={{ flex: 1, overflow: "auto", padding: "0 4px" }}>
          <StripeConnectProvider businessId={businessId}>
            {OnboardingComponent ? (
              <OnboardingComponent onExit={onComplete} />
            ) : (
              <div style={{ padding: 60, textAlign: "center" }}>
                <div style={{
                  width: 24, height: 24, border: `2px solid ${T.purple}`,
                  borderTopColor: "transparent", borderRadius: "50%",
                  animation: "spin 0.6s linear infinite", margin: "0 auto",
                }} />
                <p style={{ color: T.text3, fontSize: 13, marginTop: 12 }}>Loading Stripe onboarding...</p>
              </div>
            )}
          </StripeConnectProvider>
        </div>
      </div>
    </div>
  );
}

function UpsellModal({ businessId, onClose, onSkip }: { businessId: string; onClose: () => void; onSkip: () => void }) {
  const router = useRouter();

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const featureCheck = (text: string, included: boolean) => (
    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 0" }}>
      <span style={{ fontSize: 14, color: included ? T.green : T.text3, flexShrink: 0 }}>
        {included ? "\u2713" : "\u2014"}
      </span>
      <span style={{ fontSize: "0.85rem", color: included ? T.text : T.text3 }}>{text}</span>
    </div>
  );

  async function handleChoosePlan(planId: "solo" | "scale") {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert("Please sign in first.");
        return;
      }
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId, userId: user.id, email: user.email }),
      });
      const data = await res.json();
      if (res.ok && data.url) {
        window.location.href = data.url;
      } else {
        console.error("[upsell] Checkout error:", data.error);
        alert(data.error || "Failed to start checkout. Please try again.");
      }
    } catch (err) {
      console.error("[upsell] Checkout exception:", err);
      alert("Something went wrong. Please try again.");
    }
  }

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 100,
        background: "rgba(0,0,0,0.75)", backdropFilter: "blur(10px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 16,
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        background: T.bgEl, borderRadius: 20,
        border: `1px solid ${T.border}`,
        width: "100%", maxWidth: 720, maxHeight: "92vh",
        display: "flex", flexDirection: "column",
        overflow: "hidden",
        position: "relative",
      }}>
        {/* Top accent bar */}
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: CTA_GRAD }} />

        {/* Header */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "20px 24px", borderBottom: `1px solid ${T.border}`,
        }}>
          <div>
            <h2 style={{ fontFamily: T.h, fontSize: "1.3rem", fontWeight: 700, color: T.text, marginBottom: 2 }}>
              Choose Your Plan
            </h2>
            <p style={{ fontSize: "0.8rem", color: T.text3 }}>Unlock the tools that drive real results</p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "rgba(255,255,255,0.06)", border: "none",
              borderRadius: 8, width: 32, height: 32,
              display: "flex", alignItems: "center", justifyContent: "center",
              color: T.text2, cursor: "pointer", fontSize: 18,
            }}
          >&times;</button>
        </div>

        {/* Plans */}
        <div style={{ flex: 1, overflow: "auto", padding: 24 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {/* Starter */}
            <div style={{
              padding: 24,
              borderRadius: 16,
              background: T.glass,
              border: `1px solid ${T.border}`,
              backdropFilter: "blur(12px)",
              display: "flex",
              flexDirection: "column",
            }}>
              <p style={{ fontSize: "0.7rem", color: T.text3, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>Starter</p>
              <p style={{ fontFamily: T.h, fontSize: "2rem", fontWeight: 700, color: T.text, marginBottom: 4 }}>
                $79<span style={{ fontSize: "0.85rem", fontWeight: 400, color: T.text3 }}>/mo</span>
              </p>
              <p style={{ color: T.text2, fontSize: "0.8rem", marginBottom: 20, lineHeight: 1.5 }}>
                Everything you need to find clients and start closing.
              </p>

              <div style={{ flex: 1, marginBottom: 20 }}>
                {featureCheck("3 businesses", true)}
                {featureCheck("AI Coach (50 messages/day)", true)}
                {featureCheck("Lead Engine (Apollo.io search)", true)}
                {featureCheck("500 outreach credits/mo", true)}
                {featureCheck("Satellite email domain", true)}
                {featureCheck("Custom domain", true)}
                {featureCheck("Remove Kovra branding", true)}
                {featureCheck("SEO + blog tools", true)}
                {featureCheck("Multi-channel inbox", false)}
                {featureCheck("Ad creative generation", false)}
                {featureCheck("Priority support", false)}
              </div>

              <button
                onClick={() => handleChoosePlan("solo")}
                style={{
                  width: "100%",
                  padding: "12px 0",
                  borderRadius: 12,
                  border: `1px solid ${T.border}`,
                  background: T.glass,
                  color: T.text,
                  fontSize: "0.9rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "border-color 0.2s, background 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "rgba(123,57,252,0.4)";
                  e.currentTarget.style.background = "rgba(123,57,252,0.06)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = T.border;
                  e.currentTarget.style.background = T.glass;
                }}
              >
                Start with Starter
              </button>
            </div>

            {/* Growth */}
            <div style={{
              padding: 24,
              borderRadius: 16,
              background: "rgba(123,57,252,0.06)",
              border: "1px solid rgba(123,57,252,0.25)",
              backdropFilter: "blur(12px)",
              display: "flex",
              flexDirection: "column",
              position: "relative",
            }}>
              <div style={{
                position: "absolute",
                top: 14,
                right: 14,
                fontSize: "0.6rem",
                fontWeight: 700,
                color: "#fff",
                background: CTA_GRAD,
                padding: "4px 10px",
                borderRadius: 100,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
              }}>
                Most Popular
              </div>
              <p style={{ fontSize: "0.7rem", color: T.purpleLight, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>Growth</p>
              <p style={{ fontFamily: T.h, fontSize: "2rem", fontWeight: 700, color: T.text, marginBottom: 4 }}>
                $199<span style={{ fontSize: "0.85rem", fontWeight: 400, color: T.text3 }}>/mo</span>
              </p>
              <p style={{ color: T.text2, fontSize: "0.8rem", marginBottom: 20, lineHeight: 1.5 }}>
                The full Active Business OS — leads, outreach, ads, and closing on autopilot.
              </p>

              <div style={{ flex: 1, marginBottom: 20 }}>
                {featureCheck("Everything in Starter", true)}
                {featureCheck("10 businesses", true)}
                {featureCheck("2,500 outreach credits/mo", true)}
                {featureCheck("Multi-channel inbox", true)}
                {featureCheck("Ad creative generation", true)}
                {featureCheck("AI proposals + auto-invoicing", true)}
                {featureCheck("UGC video ad creation", true)}
                {featureCheck("AI Coach (200 messages/day)", true)}
                {featureCheck("Priority support", true)}
              </div>

              <button
                onClick={() => handleChoosePlan("scale")}
                style={{
                  width: "100%",
                  padding: "12px 0",
                  borderRadius: 12,
                  border: "none",
                  background: CTA_GRAD,
                  color: "#fff",
                  fontSize: "0.9rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "transform 0.15s, box-shadow 0.15s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-1px)";
                  e.currentTarget.style.boxShadow = "0 6px 24px rgba(123,57,252,0.35)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                Start with Growth
              </button>
            </div>
          </div>

          {/* Skip */}
          <div style={{ textAlign: "center", marginTop: 20 }}>
            <button
              onClick={onSkip}
              style={{ fontSize: "0.85rem", color: T.text3, background: "none", border: "none", cursor: "pointer" }}
            >
              Continue with free plan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function AffiliateCard({ step, businessId }: { step: string; businessId: string }) {
  const aff = ONBOARDING_AFFILIATES.find((a) => a.step === step);
  if (!aff) return null;

  const trackedUrl = getTrackedUrl(aff.partnerId, businessId, "platform_recommendation");

  return (
    <a
      href={trackedUrl}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: "block",
        padding: 20,
        borderRadius: 16,
        border: `1px solid ${T.border}`,
        background: T.glass,
        backdropFilter: "blur(12px)",
        transition: "border-color 0.2s",
        textDecoration: "none",
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 8 }}>
        <h4 style={{ color: T.text, fontWeight: 600 }}>{aff.headline}</h4>
        <span style={{ fontSize: "0.65rem", color: T.text3, background: "rgba(123,57,252,0.08)", padding: "2px 8px", borderRadius: 100 }}>Recommended</span>
      </div>
      <p style={{ color: T.text2, fontSize: "0.875rem", marginBottom: 12 }}>{aff.pitch}</p>
      <span style={{ color: T.purple, fontSize: "0.875rem", fontWeight: 500 }}>
        {aff.ctaLabel} &rarr;
      </span>
    </a>
  );
}
