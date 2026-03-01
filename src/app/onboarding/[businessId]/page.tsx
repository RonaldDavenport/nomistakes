"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import AvatarGuide from "@/components/onboarding/AvatarGuide";
import SitePreview from "@/components/onboarding/SitePreview";
const StripeConnectProvider = dynamic(() => import("@/components/StripeConnectProvider"), { ssr: false });
import { supabase } from "@/lib/supabase";
import {
  ONBOARDING_STEPS,
  COLOR_PRESETS,
  ONBOARDING_AFFILIATES,
  SOCIAL_PROOF_STATS,
  type ColorPreset,
} from "@/lib/onboarding-data";
import { getTrackedUrl } from "@/lib/affiliates";
import { T, CTA_GRAD } from "@/lib/design-tokens";

interface Business {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  type: string;
  audience: string;
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
}

export default function OnboardingPage() {
  const { businessId } = useParams<{ businessId: string }>();
  const router = useRouter();
  const [business, setBusiness] = useState<Business | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Step-specific state
  const [nameValue, setNameValue] = useState("");
  const [slugValue, setSlugValue] = useState("");
  const [altNames, setAltNames] = useState<{ name: string; slug: string; why: string }[]>([]);
  const [generatingNames, setGeneratingNames] = useState(false);
  const [selectedColors, setSelectedColors] = useState<ColorPreset["colors"] | null>(null);
  const selectedLayout = "default";
  const [calendlyUrl, setCalendlyUrl] = useState("");
  const [businessEmail, setBusinessEmail] = useState("");
  const [domainInput, setDomainInput] = useState("");
  const [logoMode, setLogoMode] = useState<"text" | "upload" | null>(null);
  const [stripeConnecting, setStripeConnecting] = useState(false);
  const [showStripeModal, setShowStripeModal] = useState(false);
  const [showUpsellModal, setShowUpsellModal] = useState(false);

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
        if (biz.calendly_url) setCalendlyUrl(biz.calendly_url);
        if (biz.business_email) setBusinessEmail(biz.business_email);
        // Map old 8-step index to new 5-step range
        if (biz.onboarding_step > 0 && biz.onboarding_step < ONBOARDING_STEPS.length) {
          setCurrentStep(Math.min(biz.onboarding_step, ONBOARDING_STEPS.length - 1));
        }
      }
      setLoading(false);
    }
    load();
  }, [businessId]);

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
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      setCurrentStep((s) => s + 1);
    } else {
      router.push(`/dashboard/${businessId}`);
    }
  }

  function skipStep() {
    saveStep(ONBOARDING_STEPS[currentStep].id, {});
    nextStep();
  }

  async function regenerateNames() {
    if (!business) return;
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
      <>
        <Navbar />
        <div style={{ minHeight: "100vh", paddingTop: 96, display: "flex", alignItems: "center", justifyContent: "center", background: T.bg }}>
          <div style={{ width: 40, height: 40, borderRadius: "50%", border: "2px solid transparent", borderTopColor: T.purple, animation: "spin 0.8s linear infinite" }} />
        </div>
      </>
    );
  }

  if (!business) {
    return (
      <>
        <Navbar />
        <div style={{ minHeight: "100vh", paddingTop: 96, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: T.bg }}>
          <p style={{ color: T.text3, marginBottom: 16 }}>Business not found</p>
          <Link href="/dashboard" style={{ color: T.purple }}>Back to Dashboard</Link>
        </div>
      </>
    );
  }

  const stepDef = ONBOARDING_STEPS[currentStep];
  const previewColors = selectedColors || business.brand?.colors || {
    primary: "#7B39FC",
    secondary: "#0A0A0F",
    accent: "#A855F7",
    background: "#000000",
    text: "#FAFAFA",
  };

  const pageTransition = {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -8 },
    transition: { duration: 0.35, ease: [0.25, 0.1, 0.25, 1] as const },
  };

  // Shared card style helper — purple glassmorphic
  const cardStyle = (active: boolean): React.CSSProperties => ({
    padding: 20,
    borderRadius: 12,
    textAlign: "left" as const,
    transition: "all 0.2s ease",
    border: active ? "1px solid rgba(123,57,252,0.3)" : `1px solid ${T.border}`,
    background: active ? "rgba(123,57,252,0.1)" : T.glass,
    borderLeft: active ? "3px solid #7B39FC" : "3px solid transparent",
    cursor: "pointer",
    backdropFilter: "blur(12px)",
  });

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "14px 16px",
    height: 48,
    borderRadius: 12,
    background: T.bgEl,
    border: `1px solid ${T.border}`,
    color: T.text,
    fontSize: "1rem",
    outline: "none",
    transition: "box-shadow 0.2s, border-color 0.2s",
  };

  const labelStyle: React.CSSProperties = {
    fontSize: "0.75rem",
    color: T.text3,
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    marginBottom: 8,
    display: "block",
  };

  return (
    <>
      <Navbar />
      <div style={{ minHeight: "100vh", paddingTop: 80, paddingBottom: 64, paddingLeft: 16, paddingRight: 16, background: T.bg }}>
        <div style={{ maxWidth: 1152, margin: "0 auto" }}>

          {/* Progress indicator + social proof */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              {/* Segmented dots */}
              <div style={{ display: "flex", gap: 6 }}>
                {ONBOARDING_STEPS.map((s, i) => (
                  <div
                    key={s.id}
                    style={{
                      height: 4,
                      borderRadius: 100,
                      transition: "all 0.3s ease",
                      width: i === currentStep ? 32 : 24,
                      background: i < currentStep ? T.purple : i === currentStep ? T.purpleLight : "rgba(255,255,255,0.04)",
                    }}
                  />
                ))}
              </div>
              <span style={{ fontSize: "0.8rem", color: T.text3 }}>Step {currentStep + 1} of {ONBOARDING_STEPS.length}</span>
            </div>
            {/* Social proof glass card */}
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              flexWrap: "wrap",
              padding: "10px 16px",
              borderRadius: 12,
              background: T.glass,
              border: `1px solid ${T.border}`,
              backdropFilter: "blur(12px)",
            }}>
              <div style={{ width: 4, height: 20, borderRadius: 2, background: CTA_GRAD }} />
              {SOCIAL_PROOF_STATS.map((stat) => (
                <span key={stat.label} style={{ fontSize: "0.75rem", color: T.text3 }}>
                  <span style={{ color: T.text2, fontWeight: 600 }}>{stat.value}</span>{" "}{stat.label}
                </span>
              ))}
            </div>
          </div>

          {/* Mobile-only preview */}
          <div className="lg:hidden">
            <SitePreview
              businessName={nameValue || business.name}
              tagline={business.tagline}
              type={business.type}
              colors={previewColors}
              layout={selectedLayout as "default" | "minimal" | "creator"}
              slug={slugValue || business.slug}

              siteContent={business.site_content}
            />
          </div>

          {/* Split layout */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 32 }} className="lg:!grid-cols-[1fr_440px]">
            {/* Left: Step form */}
            <div>
              {/* Step header */}
              <AnimatePresence mode="wait">
                <motion.div key={stepDef.id + "-header"} {...pageTransition} style={{ marginBottom: 20 }}>
                  <h2 style={{
                    fontFamily: T.h,
                    fontSize: 28,
                    fontWeight: 700,
                    color: T.text,
                    letterSpacing: "-0.02em",
                    lineHeight: 1.1,
                    marginBottom: 4,
                  }}>
                    {stepDef.title}
                  </h2>
                  <p style={{ fontSize: "0.9rem", color: T.text2 }}>{stepDef.subtitle}</p>
                </motion.div>
              </AnimatePresence>

              <AnimatePresence mode="wait">
                {/* ═══ STEP 1: Your Site (name + domain + layout) ═══ */}
                {stepDef.id === "your-site" && (
                  <motion.div key="your-site" {...pageTransition} style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                    {/* Business name */}
                    <div>
                      <label style={labelStyle}>Business Name</label>
                      <input
                        type="text"
                        value={nameValue}
                        onChange={(e) => {
                          setNameValue(e.target.value);
                          setSlugValue(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""));
                        }}
                        style={{ ...inputStyle, fontSize: "1.1rem" }}
                        onFocus={(e) => { e.currentTarget.style.boxShadow = "0 0 0 2px #7B39FC"; }}
                        onBlur={(e) => { e.currentTarget.style.boxShadow = "none"; }}
                      />
                    </div>

                    {/* AI name suggestions */}
                    <button
                      onClick={regenerateNames}
                      disabled={generatingNames}
                      style={{ fontSize: "0.875rem", color: T.purple, background: "none", border: "none", cursor: "pointer", textAlign: "left", opacity: generatingNames ? 0.5 : 1 }}
                    >
                      {generatingNames ? "Generating..." : "Suggest 5 AI alternatives"}
                    </button>

                    {altNames.length > 0 && (
                      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        {altNames.map((alt) => (
                          <button
                            key={alt.slug}
                            onClick={() => { setNameValue(alt.name); setSlugValue(alt.slug); }}
                            style={cardStyle(nameValue === alt.name)}
                          >
                            <span style={{ color: T.text, fontWeight: 500 }}>{alt.name}</span>
                            <span style={{ color: T.text3, fontSize: "0.85rem", marginLeft: 8 }}>{alt.why}</span>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Domain / Slug — reveals once name is set */}
                    <AnimatePresence>
                      {nameValue.trim().length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3, ease: "easeOut" }}
                          style={{ overflow: "hidden", display: "flex", flexDirection: "column", gap: 24 }}
                        >
                          <div style={{ padding: 20, borderRadius: 16, background: T.glass, border: `1px solid ${T.border}`, backdropFilter: "blur(12px)" }}>
                            <label style={labelStyle}>Your URL</label>
                            <p style={{ color: T.text, fontFamily: T.mono, fontSize: "0.9rem", marginBottom: 12 }}>
                              {business.deployed_url || `nm-${slugValue || business.slug}.vercel.app`}
                            </p>
                            <label style={{ ...labelStyle, marginTop: 12 }}>Already own a domain?</label>
                            <input
                              type="text"
                              value={domainInput}
                              onChange={(e) => setDomainInput(e.target.value)}
                              placeholder="mybusiness.com"
                              style={inputStyle}
                              onFocus={(e) => { e.currentTarget.style.boxShadow = "0 0 0 2px #7B39FC"; }}
                              onBlur={(e) => { e.currentTarget.style.boxShadow = "none"; }}
                            />
                            {domainInput && (
                              <p style={{ fontSize: "0.75rem", color: T.text3, marginTop: 8 }}>
                                After connecting, you&apos;ll need to update your DNS settings. We&apos;ll show you how.
                              </p>
                            )}
                          </div>

                          <AffiliateCard step="domain" businessId={businessId} />
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <StepActions
                      saving={saving}
                      skippable={false}
                      onContinue={async () => {
                        await saveStep("name", { name: nameValue, slug: slugValue });
                        if (domainInput) await saveStep("domain", { customDomain: domainInput });
                        nextStep();
                      }}
                      onSkip={skipStep}
                    />
                  </motion.div>
                )}

                {/* ═══ STEP 2: Your Brand (colors + logo) ═══ */}
                {stepDef.id === "your-brand" && (
                  <motion.div key="your-brand" {...pageTransition} style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                    {/* Current selection preview */}
                    {selectedColors && (
                      <div style={{ display: "flex", gap: 8, marginBottom: 4 }}>
                        {Object.entries(selectedColors).map(([key, val]) => (
                          <div key={key} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                            <div style={{ width: 48, height: 48, borderRadius: 8, border: `1px solid ${T.border}`, background: val }} />
                            <span style={{ fontSize: "0.6rem", color: T.text3, textTransform: "capitalize" }}>{key}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Color presets */}
                    <div>
                      <label style={labelStyle}>Color Palette</label>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(170px, 1fr))", gap: 10 }}>
                        {COLOR_PRESETS.map((preset, i) => {
                          const isActive = selectedColors?.primary === preset.colors.primary;
                          return (
                            <motion.button
                              key={preset.id}
                              initial={{ opacity: 0, y: 12 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: i * 0.04 }}
                              onClick={() => setSelectedColors(preset.colors)}
                              style={cardStyle(isActive)}
                            >
                              <div style={{ display: "flex", gap: 4, marginBottom: 8 }}>
                                {[preset.colors.primary, preset.colors.secondary, preset.colors.accent].map((c, idx) => (
                                  <div key={idx} style={{ width: 24, height: 24, borderRadius: "50%", background: c }} />
                                ))}
                              </div>
                              <span style={{ fontSize: "0.875rem", fontWeight: 500, color: T.text }}>{preset.name}</span>
                            </motion.button>
                          );
                        })}
                      </div>
                    </div>

                    {business.brand?.colors && (
                      <button
                        onClick={() => setSelectedColors(business.brand.colors!)}
                        style={cardStyle(
                          selectedColors?.primary === business.brand.colors.primary &&
                          !COLOR_PRESETS.some((p) => p.colors.primary === selectedColors?.primary)
                        )}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                          <div style={{ display: "flex", gap: 4 }}>
                            {[business.brand.colors.primary, business.brand.colors.secondary, business.brand.colors.accent].map((c, i) => (
                              <div key={i} style={{ width: 24, height: 24, borderRadius: "50%", background: c }} />
                            ))}
                          </div>
                          <div>
                            <span style={{ fontSize: "0.875rem", fontWeight: 500, color: T.text }}>AI Generated</span>
                            <span style={{ fontSize: "0.75rem", color: T.text3, marginLeft: 8 }}>Custom palette for {business.name}</span>
                          </div>
                        </div>
                      </button>
                    )}

                    {/* Logo section — reveals after colors are selected */}
                    <AnimatePresence>
                      {selectedColors && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.35, ease: "easeOut" }}
                          style={{ overflow: "hidden" }}
                        >
                          <div style={{ borderTop: `1px solid ${T.border}`, paddingTop: 24 }}>
                            <label style={labelStyle}>Logo</label>
                            <div style={{
                              padding: 32,
                              borderRadius: 16,
                              background: T.glass,
                              border: `1px solid ${T.border}`,
                              backdropFilter: "blur(12px)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              marginBottom: 16,
                            }}>
                              <div style={{
                                fontFamily: T.h,
                                fontSize: "2.5rem",
                                fontWeight: 700,
                                color: selectedColors?.primary || T.purple,
                              }}>
                                {nameValue || business.name}
                              </div>
                            </div>

                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                              <button onClick={() => setLogoMode("text")} style={cardStyle(logoMode === "text")}>
                                <p style={{ color: T.text, fontWeight: 500, marginBottom: 4 }}>Use Text Mark</p>
                                <p style={{ color: T.text3, fontSize: "0.85rem" }}>Clean text logo</p>
                              </button>
                              <button onClick={() => setLogoMode("upload")} style={cardStyle(logoMode === "upload")}>
                                <p style={{ color: T.text, fontWeight: 500, marginBottom: 4 }}>Upload Your Own</p>
                                <p style={{ color: T.text3, fontSize: "0.85rem" }}>PNG, SVG, or JPEG</p>
                              </button>
                            </div>

                            {logoMode === "upload" && (
                              <div style={{
                                padding: 24,
                                borderRadius: 12,
                                border: `1px dashed rgba(123,57,252,0.25)`,
                                background: "rgba(123,57,252,0.04)",
                                textAlign: "center",
                                marginTop: 12,
                              }}>
                                <input
                                  type="file"
                                  accept="image/png,image/svg+xml,image/jpeg"
                                  style={{ display: "none" }}
                                  id="logo-upload"
                                  onChange={async (e) => {
                                    const file = e.target.files?.[0];
                                    if (!file) return;
                                    const { data, error } = await supabase.storage
                                      .from("logos")
                                      .upload(`${businessId}/${file.name}`, file, { upsert: true });
                                    if (!error && data) {
                                      const { data: { publicUrl } } = supabase.storage
                                        .from("logos")
                                        .getPublicUrl(data.path);
                                      await saveStep("logo", { logoUrl: publicUrl });
                                    }
                                  }}
                                />
                                <label htmlFor="logo-upload" style={{ cursor: "pointer" }}>
                                  <p style={{ color: T.text2, marginBottom: 4 }}>Click to upload</p>
                                  <p style={{ fontSize: "0.75rem", color: T.text3 }}>PNG, SVG, or JPEG. Max 2MB.</p>
                                </label>
                              </div>
                            )}

                            <div style={{ marginTop: 12 }}>
                              <AffiliateCard step="logo" businessId={businessId} />
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <StepActions
                      saving={saving}
                      skippable={false}
                      onContinue={async () => {
                        if (selectedColors) await saveStep("colors", { colors: selectedColors });
                        if (logoMode === "text") await saveStep("logo", {});
                        nextStep();
                      }}
                      onSkip={skipStep}
                    />
                  </motion.div>
                )}

                {/* ═══ STEP 3: Payments (Stripe Connect) ═══ */}
                {stepDef.id === "payments" && (
                  <motion.div key="payments" {...pageTransition} style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                    <div style={{
                      padding: 20,
                      borderRadius: 16,
                      background: T.glass,
                      border: `1px solid ${T.border}`,
                      backdropFilter: "blur(12px)",
                    }}>
                      <p style={{ color: T.text2, fontSize: "0.9rem" }}>
                        Connect Stripe to accept payments for your {business.type === "services" ? "services" : "digital products"} directly through your website.
                        Customers can pay via credit card, Apple Pay, and more.
                      </p>
                    </div>

                    {business.stripe_account_id ? (
                      <>
                        <div style={{
                          padding: 16,
                          borderRadius: 12,
                          background: "rgba(34,197,94,0.04)",
                          border: "1px solid rgba(34,197,94,0.2)",
                          display: "flex",
                          alignItems: "center",
                          gap: 12,
                        }}>
                          <div style={{ width: 10, height: 10, borderRadius: "50%", background: T.green }} />
                          <div style={{ flex: 1 }}>
                            <p style={{ color: "#4ade80", fontSize: "0.875rem", fontWeight: 500 }}>Stripe account created</p>
                            <p style={{ color: T.text3, fontSize: "0.75rem" }}>Complete onboarding to start accepting payments</p>
                          </div>
                          <button
                            onClick={() => setShowStripeModal(true)}
                            style={{
                              padding: "8px 16px",
                              borderRadius: 8,
                              background: CTA_GRAD,
                              color: "#fff",
                              fontSize: "0.85rem",
                              fontWeight: 500,
                              border: "none",
                              cursor: "pointer",
                            }}
                          >
                            Continue Setup
                          </button>
                        </div>
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
                      </>
                    ) : (
                      <button
                        onClick={async () => {
                          const ok = await connectStripe();
                          if (ok) setShowStripeModal(true);
                        }}
                        disabled={stripeConnecting}
                        style={{
                          width: "100%",
                          padding: 20,
                          borderRadius: 16,
                          border: `1px solid ${T.border}`,
                          background: T.glass,
                          backdropFilter: "blur(12px)",
                          cursor: "pointer",
                          textAlign: "left",
                          transition: "border-color 0.2s",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                          <div style={{
                            width: 48,
                            height: 48,
                            borderRadius: 12,
                            background: "rgba(123,57,252,0.1)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: T.purple,
                            fontWeight: 700,
                            fontSize: "1.1rem",
                          }}>
                            S
                          </div>
                          <div>
                            <p style={{ color: T.text, fontWeight: 500 }}>
                              {stripeConnecting ? "Connecting..." : "Set Up Stripe"}
                            </p>
                            <p style={{ color: T.text3, fontSize: "0.85rem" }}>Set up in 2 minutes. No monthly fees.</p>
                          </div>
                        </div>
                      </button>
                    )}

                    <StepActions
                      saving={saving}
                      skippable
                      onContinue={async () => {
                        await saveStep("payments", { stripeAccountId: business.stripe_account_id || undefined });
                        nextStep();
                      }}
                      onSkip={skipStep}
                    />
                  </motion.div>
                )}

                {/* ═══ STEP 4: Booking (Calendly link) ═══ */}
                {stepDef.id === "booking" && (
                  <motion.div key="booking" {...pageTransition} style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                    <div style={{
                      padding: 20,
                      borderRadius: 16,
                      background: T.glass,
                      border: `1px solid ${T.border}`,
                      backdropFilter: "blur(12px)",
                    }}>
                      <p style={{ color: T.text2, fontSize: "0.9rem", marginBottom: 16 }}>
                        Add your Calendly link to let visitors book meetings directly from your website.
                        A booking widget will appear on your site&apos;s contact page.
                      </p>
                      <label style={labelStyle}>Calendly URL</label>
                      <input
                        type="url"
                        value={calendlyUrl}
                        onChange={(e) => setCalendlyUrl(e.target.value)}
                        placeholder="https://calendly.com/your-name"
                        style={inputStyle}
                        onFocus={(e) => { e.currentTarget.style.boxShadow = "0 0 0 2px #7B39FC"; }}
                        onBlur={(e) => { e.currentTarget.style.boxShadow = "none"; }}
                      />
                    </div>

                    {calendlyUrl && calendlyUrl.includes("calendly.com") && (
                      <div style={{
                        padding: 16,
                        borderRadius: 16,
                        border: "1px solid rgba(123,57,252,0.15)",
                        background: "rgba(123,57,252,0.03)",
                      }}>
                        <p style={{ fontSize: "0.75rem", color: T.text3, marginBottom: 8 }}>Preview</p>
                        <div style={{ borderRadius: 8, overflow: "hidden" }}>
                          <iframe
                            src={`${calendlyUrl}?hide_gdpr_banner=1&background_color=000000&text_color=fafafa&primary_color=7B39FC`}
                            style={{ width: "100%", height: 400, border: "none" }}
                            title="Calendly preview"
                          />
                        </div>
                      </div>
                    )}

                    <p style={{ fontSize: "0.75rem", color: T.text3 }}>
                      Don&apos;t have Calendly?{" "}
                      <a href="https://calendly.com" target="_blank" rel="noopener noreferrer" style={{ color: T.purple }}>
                        Create a free account
                      </a>
                    </p>

                    <StepActions
                      saving={saving}
                      skippable
                      onContinue={async () => {
                        if (calendlyUrl) {
                          await saveStep("scheduling", { calendlyUrl });
                        } else {
                          await saveStep("scheduling", {});
                        }
                        nextStep();
                      }}
                      onSkip={skipStep}
                    />
                  </motion.div>
                )}

                {/* ═══ STEP 5: Go Live (email + launch) ═══ */}
                {stepDef.id === "go-live" && (
                  <motion.div key="go-live" {...pageTransition} style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                    <AffiliateCard step="email" businessId={businessId} />

                    <div>
                      <label style={labelStyle}>Your business email</label>
                      <input
                        type="email"
                        value={businessEmail}
                        onChange={(e) => setBusinessEmail(e.target.value)}
                        placeholder={`hello@${slugValue || business.slug}.com`}
                        style={inputStyle}
                        onFocus={(e) => { e.currentTarget.style.boxShadow = "0 0 0 2px #7B39FC"; }}
                        onBlur={(e) => { e.currentTarget.style.boxShadow = "none"; }}
                      />
                      <p style={{ fontSize: "0.75rem", color: T.text3, marginTop: 8 }}>
                        This will be shown as the contact email on your website.
                      </p>
                    </div>

                    <StepActions
                      saving={saving}
                      skippable
                      onContinue={async () => {
                        await saveStep("email", { businessEmail: businessEmail || undefined });
                        nextStep();
                      }}
                      onSkip={skipStep}
                    />
                  </motion.div>
                )}

                {/* ═══ STEP 6: Meet Your Coach (summary + upsell) ═══ */}
                {stepDef.id === "meet-your-coach" && (
                  <motion.div key="meet-your-coach" {...pageTransition} style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                    {/* Summary card */}
                    <div style={{
                      padding: 24,
                      borderRadius: 16,
                      background: T.glass,
                      border: `1px solid ${T.border}`,
                      backdropFilter: "blur(12px)",
                    }}>
                      <h3 style={{ fontFamily: T.h, fontSize: "1.1rem", fontWeight: 700, color: T.text, marginBottom: 16 }}>
                        Here&apos;s what we built
                      </h3>
                      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                          <div style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(34,197,94,0.12)", display: "flex", alignItems: "center", justifyContent: "center", color: T.green, fontSize: 16 }}>&#10003;</div>
                          <div>
                            <p style={{ color: T.text3, fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.06em" }}>Business Name</p>
                            <p style={{ color: T.text, fontWeight: 600 }}>{business.name}</p>
                          </div>
                        </div>
                        {(() => {
                          const siteUrl = business.deployed_url || business.live_url || `nm-${slugValue || business.slug}.vercel.app`;
                          return (
                            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                              <div style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(34,197,94,0.12)", display: "flex", alignItems: "center", justifyContent: "center", color: T.green, fontSize: 16 }}>&#10003;</div>
                              <div>
                                <p style={{ color: T.text3, fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.06em" }}>Website</p>
                                <a
                                  href={siteUrl.startsWith("http") ? siteUrl : `https://${siteUrl}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  style={{ color: T.purple, fontWeight: 600, fontFamily: T.mono, fontSize: "0.9rem", textDecoration: "none" }}
                                >
                                  {siteUrl}
                                </a>
                              </div>
                            </div>
                          );
                        })()}
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                          <div style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(34,197,94,0.12)", display: "flex", alignItems: "center", justifyContent: "center", color: T.green, fontSize: 16 }}>&#10003;</div>
                          <div>
                            <p style={{ color: T.text3, fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.06em" }}>Business Type</p>
                            <p style={{ color: T.text, fontWeight: 600, textTransform: "capitalize" }}>{business.type?.replace(/-/g, " ") || "Service Business"}</p>
                          </div>
                        </div>
                        {business.stripe_account_id && (
                          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                            <div style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(34,197,94,0.12)", display: "flex", alignItems: "center", justifyContent: "center", color: T.green, fontSize: 16 }}>&#10003;</div>
                            <div>
                              <p style={{ color: T.text3, fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.06em" }}>Payments</p>
                              <p style={{ color: T.text, fontWeight: 600 }}>Stripe Connected</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Meet your coach CTA */}
                    <div style={{
                      padding: 32,
                      borderRadius: 16,
                      background: "rgba(123,57,252,0.06)",
                      border: "1px solid rgba(123,57,252,0.18)",
                      backdropFilter: "blur(12px)",
                      textAlign: "center",
                      position: "relative",
                      overflow: "hidden",
                    }}>
                      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: CTA_GRAD }} />
                      <div style={{
                        width: 64,
                        height: 64,
                        borderRadius: "50%",
                        background: CTA_GRAD,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 28,
                        margin: "0 auto 16px",
                      }}>
                        <span role="img" aria-label="robot">&#129302;</span>
                      </div>
                      <h3 style={{ fontFamily: T.h, fontSize: "1.4rem", fontWeight: 700, color: T.text, marginBottom: 8 }}>
                        Meet Your AI Coach
                      </h3>
                      <p style={{ color: T.text2, fontSize: "0.9rem", maxWidth: 380, margin: "0 auto 20px", lineHeight: 1.6 }}>
                        Your AI coach can answer questions, write content, and help you figure out your next steps to get customers.
                      </p>
                      <button
                        onClick={() => setShowUpsellModal(true)}
                        style={{
                          padding: "14px 36px",
                          borderRadius: 12,
                          fontSize: "1rem",
                          fontWeight: 600,
                          color: "#fff",
                          background: CTA_GRAD,
                          border: "none",
                          cursor: "pointer",
                          transition: "transform 0.15s, box-shadow 0.15s",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = "translateY(-1px)";
                          e.currentTarget.style.boxShadow = "0 8px 30px rgba(123,57,252,0.35)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = "translateY(0)";
                          e.currentTarget.style.boxShadow = "none";
                        }}
                      >
                        Chat With My Coach
                      </button>
                    </div>

                    {/* Skip to dashboard */}
                    <div style={{ textAlign: "center" }}>
                      <button
                        onClick={() => router.push(`/dashboard/${businessId}`)}
                        style={{ fontSize: "0.85rem", color: T.text3, background: "none", border: "none", cursor: "pointer" }}
                      >
                        Skip for now — go to dashboard
                      </button>
                    </div>

                    {/* Upsell modal */}
                    {showUpsellModal && (
                      <UpsellModal
                        businessId={businessId}
                        onClose={() => setShowUpsellModal(false)}
                        onSkip={() => {
                          const msg = encodeURIComponent("Give me a full audit of my business setup and help me figure out my next steps to start getting customers.");
                          router.push(`/dashboard/${businessId}/chat?msg=${msg}`);
                        }}
                      />
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Right: Desktop site preview */}
            <div className="hidden lg:block">
              <div style={{ position: "sticky", top: 96 }}>
                <SitePreview
                  businessName={nameValue || business.name}
                  tagline={business.tagline}
                  type={business.type}
                  colors={previewColors}
                  layout={selectedLayout as "default" | "minimal" | "creator"}
                  slug={slugValue || business.slug}
    
                  siteContent={business.site_content}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Avatar guide */}
      <AvatarGuide stepId={stepDef.id} businessName={business.name} />

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </>
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

  function handleChoosePlan(plan: string) {
    const msg = encodeURIComponent(
      `I just signed up for ${plan}. Give me a full audit of my business setup and help me figure out my next steps to start getting customers.`
    );
    router.push(`/dashboard/${businessId}/chat?msg=${msg}`);
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
                $19<span style={{ fontSize: "0.85rem", fontWeight: 400, color: T.text3 }}>/mo</span>
              </p>
              <p style={{ color: T.text2, fontSize: "0.8rem", marginBottom: 20, lineHeight: 1.5 }}>
                Everything you need to look professional and start earning.
              </p>

              <div style={{ flex: 1, marginBottom: 20 }}>
                {featureCheck("Custom domain (yourbusiness.com)", true)}
                {featureCheck("Remove NoMistakes branding", true)}
                {featureCheck("Up to 3 businesses", true)}
                {featureCheck("SEO tools + site audits", true)}
                {featureCheck("Blog post generator", true)}
                {featureCheck("AI image generation", true)}
                {featureCheck("Ad copy generator", true)}
                {featureCheck("Cold outreach templates", true)}
                {featureCheck("AI Coach (unlimited)", false)}
                {featureCheck("Promo video creation", false)}
                {featureCheck("Priority support", false)}
              </div>

              <button
                onClick={() => handleChoosePlan("the Starter plan")}
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
                $49<span style={{ fontSize: "0.85rem", fontWeight: 400, color: T.text3 }}>/mo</span>
              </p>
              <p style={{ color: T.text2, fontSize: "0.8rem", marginBottom: 20, lineHeight: 1.5 }}>
                The full toolkit to grow, convert, and scale your business.
              </p>

              <div style={{ flex: 1, marginBottom: 20 }}>
                {featureCheck("Everything in Starter", true)}
                {featureCheck("AI Coach — unlimited sessions", true)}
                {featureCheck("Up to 10 businesses", true)}
                {featureCheck("Promo video creation", true)}
                {featureCheck("UGC-style ad scripts", true)}
                {featureCheck("Webinar + funnel scripts", true)}
                {featureCheck("Course + ebook content", true)}
                {featureCheck("Contracts + SOPs", true)}
                {featureCheck("Extra AI image credits", true)}
                {featureCheck("Priority support", true)}
              </div>

              <button
                onClick={() => handleChoosePlan("the Growth plan")}
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
