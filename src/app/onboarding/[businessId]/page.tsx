"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { supabase } from "@/lib/supabase";
import {
  ONBOARDING_STEPS,
  COLOR_PRESETS,
  LAYOUT_OPTIONS,
  ONBOARDING_AFFILIATES,
  type ColorPreset,
} from "@/lib/onboarding-data";
import { getTrackedUrl } from "@/lib/affiliates";

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
  const [selectedLayout, setSelectedLayout] = useState("default");
  const [calendlyUrl, setCalendlyUrl] = useState("");
  const [businessEmail, setBusinessEmail] = useState("");
  const [domainInput, setDomainInput] = useState("");
  const [logoMode, setLogoMode] = useState<"text" | "upload" | null>(null);
  const [stripeConnecting, setStripeConnecting] = useState(false);

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
        if (biz.layout) setSelectedLayout(biz.layout);
        if (biz.calendly_url) setCalendlyUrl(biz.calendly_url);
        if (biz.business_email) setBusinessEmail(biz.business_email);
        // Resume from last completed step
        if (biz.onboarding_step > 0 && biz.onboarding_step < ONBOARDING_STEPS.length) {
          setCurrentStep(biz.onboarding_step);
        }
      }
      setLoading(false);
    }
    load();
  }, [businessId]);

  // Save step data
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

  // Navigate
  function nextStep() {
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      setCurrentStep((s) => s + 1);
    } else {
      // Done — go to dashboard
      router.push("/dashboard");
    }
  }

  function skipStep() {
    // Still save the step index so we track progress
    saveStep(ONBOARDING_STEPS[currentStep].id, {});
    nextStep();
  }

  // Generate alternative names
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

  // Stripe Connect
  async function connectStripe() {
    setStripeConnecting(true);
    try {
      const res = await fetch("/api/stripe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "connect",
          businessId,
          businessName: business?.name,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.url) {
          window.location.href = data.url;
          return;
        }
      }
    } catch {
      // silent
    }
    setStripeConnecting(false);
  }

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen pt-24 flex items-center justify-center">
          <div className="w-10 h-10 rounded-full border-2 border-transparent border-t-brand-500 animate-spin" />
        </div>
      </>
    );
  }

  if (!business) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen pt-24 flex flex-col items-center justify-center">
          <p className="text-zinc-400 mb-4">Business not found</p>
          <Link href="/dashboard" className="text-brand-400 hover:underline">Back to Dashboard</Link>
        </div>
      </>
    );
  }

  const stepDef = ONBOARDING_STEPS[currentStep];
  const progressPct = Math.round(((currentStep + 1) / ONBOARDING_STEPS.length) * 100);

  return (
    <>
      <Navbar />
      <div className="min-h-screen pt-20 sm:pt-24 pb-16 px-4 sm:px-6">
        <div className="max-w-2xl mx-auto">

          {/* Progress */}
          <div className="mb-10">
            <div className="flex justify-between text-xs text-zinc-600 mb-2">
              <span>Step {currentStep + 1} of {ONBOARDING_STEPS.length}</span>
              <span>{progressPct}%</span>
            </div>
            <div className="h-1 rounded-full bg-white/5">
              <div
                className="h-full rounded-full bg-gradient-to-r from-brand-600 to-purple-500 transition-all duration-500"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            {/* Step dots */}
            <div className="flex gap-1.5 mt-3">
              {ONBOARDING_STEPS.map((s, i) => (
                <div
                  key={s.id}
                  className={`h-1 flex-1 rounded-full transition-colors ${
                    i < currentStep ? "bg-brand-600" : i === currentStep ? "bg-brand-400" : "bg-white/5"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Step header */}
          <div className="mb-8 animate-fadeIn">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-1">{stepDef.title}</h2>
            <p className="text-zinc-500">{stepDef.subtitle}</p>
          </div>

          {/* ── STEP 1: Name ── */}
          {stepDef.id === "name" && (
            <div className="animate-fadeIn space-y-6">
              <div>
                <label className="text-xs text-zinc-500 uppercase tracking-wider mb-2 block">Business Name</label>
                <input
                  type="text"
                  value={nameValue}
                  onChange={(e) => {
                    setNameValue(e.target.value);
                    setSlugValue(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""));
                  }}
                  className="w-full px-4 py-3 rounded-xl bg-surface border border-white/10 text-white text-lg focus:border-brand-600/50 focus:outline-none transition-colors"
                />
                <p className="text-xs text-zinc-600 mt-2">URL: nm-{slugValue}.vercel.app</p>
              </div>

              <button
                onClick={regenerateNames}
                disabled={generatingNames}
                className="text-sm text-brand-400 hover:text-brand-300 transition-colors disabled:opacity-50"
              >
                {generatingNames ? "Generating..." : "Suggest 5 AI alternatives"}
              </button>

              {altNames.length > 0 && (
                <div className="space-y-2">
                  {altNames.map((alt) => (
                    <button
                      key={alt.slug}
                      onClick={() => { setNameValue(alt.name); setSlugValue(alt.slug); }}
                      className={`w-full text-left p-3 rounded-lg border transition-all ${
                        nameValue === alt.name
                          ? "border-brand-600/50 bg-brand-600/10"
                          : "border-white/5 bg-surface/50 hover:border-white/15"
                      }`}
                    >
                      <span className="text-white font-medium">{alt.name}</span>
                      <span className="text-zinc-500 text-sm ml-2">{alt.why}</span>
                    </button>
                  ))}
                </div>
              )}

              <StepActions
                saving={saving}
                skippable={false}
                onContinue={async () => {
                  await saveStep("name", { name: nameValue, slug: slugValue });
                  nextStep();
                }}
                onSkip={skipStep}
              />
            </div>
          )}

          {/* ── STEP 2: Colors ── */}
          {stepDef.id === "colors" && (
            <div className="animate-fadeIn space-y-6">
              {/* Current palette preview */}
              {selectedColors && (
                <div className="flex gap-2 mb-2">
                  {Object.entries(selectedColors).map(([key, val]) => (
                    <div key={key} className="flex flex-col items-center gap-1">
                      <div className="w-12 h-12 rounded-lg border border-white/10" style={{ background: val }} />
                      <span className="text-[10px] text-zinc-600 capitalize">{key}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {COLOR_PRESETS.map((preset) => {
                  const isActive = selectedColors?.primary === preset.colors.primary;
                  return (
                    <button
                      key={preset.id}
                      onClick={() => setSelectedColors(preset.colors)}
                      className={`p-4 rounded-xl border text-left transition-all ${
                        isActive
                          ? "border-brand-600/50 bg-brand-600/10"
                          : "border-white/5 bg-surface/50 hover:border-white/15"
                      }`}
                    >
                      <div className="flex gap-1 mb-2">
                        {[preset.colors.primary, preset.colors.secondary, preset.colors.accent].map((c, i) => (
                          <div key={i} className="w-6 h-6 rounded-full" style={{ background: c }} />
                        ))}
                      </div>
                      <span className="text-sm font-medium text-white">{preset.name}</span>
                    </button>
                  );
                })}
              </div>

              {/* AI-generated option */}
              {business.brand?.colors && (
                <button
                  onClick={() => setSelectedColors(business.brand.colors!)}
                  className={`w-full p-4 rounded-xl border text-left transition-all ${
                    selectedColors?.primary === business.brand.colors.primary &&
                    !COLOR_PRESETS.some((p) => p.colors.primary === selectedColors?.primary)
                      ? "border-brand-600/50 bg-brand-600/10"
                      : "border-white/5 bg-surface/50 hover:border-white/15"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex gap-1">
                      {[business.brand.colors.primary, business.brand.colors.secondary, business.brand.colors.accent].map((c, i) => (
                        <div key={i} className="w-6 h-6 rounded-full" style={{ background: c }} />
                      ))}
                    </div>
                    <div>
                      <span className="text-sm font-medium text-white">AI Generated</span>
                      <span className="text-xs text-zinc-500 ml-2">Custom palette for {business.name}</span>
                    </div>
                  </div>
                </button>
              )}

              <StepActions
                saving={saving}
                skippable={false}
                onContinue={async () => {
                  if (selectedColors) await saveStep("colors", { colors: selectedColors });
                  nextStep();
                }}
                onSkip={skipStep}
              />
            </div>
          )}

          {/* ── STEP 3: Logo ── */}
          {stepDef.id === "logo" && (
            <div className="animate-fadeIn space-y-6">
              {/* Text mark preview */}
              <div className="p-8 rounded-xl border border-white/5 bg-surface/50 flex items-center justify-center">
                <div
                  style={{
                    fontSize: "2.5rem",
                    fontWeight: 800,
                    letterSpacing: "-0.02em",
                    color: selectedColors?.primary || business.brand?.colors?.primary || "#4c6ef5",
                  }}
                >
                  {nameValue || business.name}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={() => setLogoMode("text")}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    logoMode === "text" ? "border-brand-600/50 bg-brand-600/10" : "border-white/5 bg-surface/50 hover:border-white/15"
                  }`}
                >
                  <p className="text-white font-medium mb-1">Use Text Mark</p>
                  <p className="text-zinc-500 text-sm">Simple, clean text logo using your business name</p>
                </button>
                <button
                  onClick={() => setLogoMode("upload")}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    logoMode === "upload" ? "border-brand-600/50 bg-brand-600/10" : "border-white/5 bg-surface/50 hover:border-white/15"
                  }`}
                >
                  <p className="text-white font-medium mb-1">Upload Your Own</p>
                  <p className="text-zinc-500 text-sm">Upload a PNG or SVG logo file</p>
                </button>
              </div>

              {logoMode === "upload" && (
                <div className="p-6 rounded-xl border border-dashed border-white/10 bg-surface/30 text-center">
                  <input
                    type="file"
                    accept="image/png,image/svg+xml,image/jpeg"
                    className="hidden"
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
                  <label htmlFor="logo-upload" className="cursor-pointer">
                    <p className="text-zinc-400 mb-1">Click to upload</p>
                    <p className="text-xs text-zinc-600">PNG, SVG, or JPEG. Max 2MB.</p>
                  </label>
                </div>
              )}

              {/* Looka affiliate card */}
              <AffiliateCard step="logo" businessId={businessId} />

              <StepActions
                saving={saving}
                skippable
                onContinue={async () => {
                  if (logoMode === "text") {
                    // Text mark — save as null (will render text dynamically)
                    await saveStep("logo", {});
                  }
                  nextStep();
                }}
                onSkip={skipStep}
              />
            </div>
          )}

          {/* ── STEP 4: Layout ── */}
          {stepDef.id === "layout" && (
            <div className="animate-fadeIn space-y-6">
              <div className="grid gap-4">
                {LAYOUT_OPTIONS.map((layout) => (
                  <button
                    key={layout.id}
                    onClick={() => setSelectedLayout(layout.id)}
                    className={`p-5 rounded-xl border text-left transition-all ${
                      selectedLayout === layout.id
                        ? "border-brand-600/50 bg-brand-600/10"
                        : "border-white/5 bg-surface/50 hover:border-white/15"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-white font-semibold text-lg">{layout.name}</h3>
                      <span className="text-xs text-zinc-500 bg-white/5 px-2 py-1 rounded-full">{layout.bestFor}</span>
                    </div>
                    <p className="text-zinc-400 text-sm mb-3">{layout.description}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {layout.sections.map((s) => (
                        <span key={s} className="text-[10px] text-zinc-600 bg-white/5 px-2 py-0.5 rounded capitalize">
                          {s.replace(/_/g, " ")}
                        </span>
                      ))}
                    </div>
                  </button>
                ))}
              </div>

              <StepActions
                saving={saving}
                skippable={false}
                onContinue={async () => {
                  await saveStep("layout", { layout: selectedLayout });
                  nextStep();
                }}
                onSkip={skipStep}
              />
            </div>
          )}

          {/* ── STEP 5: Domain ── */}
          {stepDef.id === "domain" && (
            <div className="animate-fadeIn space-y-6">
              <div className="p-5 rounded-xl border border-white/5 bg-surface/50">
                <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Your current URL</p>
                <p className="text-white font-mono">
                  {business.deployed_url || `nm-${slugValue || business.slug}.vercel.app`}
                </p>
              </div>

              {/* Namecheap affiliate */}
              <AffiliateCard step="domain" businessId={businessId} />

              <div>
                <label className="text-xs text-zinc-500 uppercase tracking-wider mb-2 block">
                  Already own a domain?
                </label>
                <input
                  type="text"
                  value={domainInput}
                  onChange={(e) => setDomainInput(e.target.value)}
                  placeholder="mybusiness.com"
                  className="w-full px-4 py-3 rounded-xl bg-surface border border-white/10 text-white focus:border-brand-600/50 focus:outline-none transition-colors"
                />
                {domainInput && (
                  <p className="text-xs text-zinc-500 mt-2">
                    After connecting, you&apos;ll need to update your DNS settings. We&apos;ll show you how.
                  </p>
                )}
              </div>

              <StepActions
                saving={saving}
                skippable
                onContinue={async () => {
                  if (domainInput) {
                    await saveStep("domain", { customDomain: domainInput });
                  } else {
                    await saveStep("domain", {});
                  }
                  nextStep();
                }}
                onSkip={skipStep}
              />
            </div>
          )}

          {/* ── STEP 6: Scheduling ── */}
          {stepDef.id === "scheduling" && (
            <div className="animate-fadeIn space-y-6">
              <div className="p-5 rounded-xl border border-white/5 bg-surface/50">
                <p className="text-zinc-400 text-sm">
                  Add your Calendly link to let visitors book meetings directly from your website.
                  A booking widget will appear on your site&apos;s contact page.
                </p>
              </div>

              <div>
                <label className="text-xs text-zinc-500 uppercase tracking-wider mb-2 block">
                  Calendly URL
                </label>
                <input
                  type="url"
                  value={calendlyUrl}
                  onChange={(e) => setCalendlyUrl(e.target.value)}
                  placeholder="https://calendly.com/your-name"
                  className="w-full px-4 py-3 rounded-xl bg-surface border border-white/10 text-white focus:border-brand-600/50 focus:outline-none transition-colors"
                />
              </div>

              {calendlyUrl && calendlyUrl.includes("calendly.com") && (
                <div className="p-4 rounded-xl border border-brand-600/20 bg-brand-600/5">
                  <p className="text-xs text-zinc-500 mb-2">Preview</p>
                  <div className="h-32 rounded-lg bg-white/5 flex items-center justify-center text-zinc-600 text-sm">
                    Calendly widget will appear here on your site
                  </div>
                </div>
              )}

              <p className="text-xs text-zinc-600">
                Don&apos;t have Calendly?{" "}
                <a href="https://calendly.com" target="_blank" rel="noopener noreferrer" className="text-brand-400 hover:underline">
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
            </div>
          )}

          {/* ── STEP 7: Payments ── */}
          {stepDef.id === "payments" && (
            <div className="animate-fadeIn space-y-6">
              <div className="p-5 rounded-xl border border-white/5 bg-surface/50">
                <p className="text-zinc-400 text-sm">
                  Connect Stripe to accept payments for your {business.type === "services" ? "services" : "digital products"} directly through your website.
                  Customers can pay via credit card, Apple Pay, and more.
                </p>
              </div>

              {business.stripe_account_id ? (
                <div className="p-5 rounded-xl border border-emerald-500/20 bg-emerald-500/5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 text-sm">
                      &#10003;
                    </div>
                    <div>
                      <p className="text-white font-medium">Stripe Connected</p>
                      <p className="text-zinc-500 text-sm">You&apos;re ready to accept payments</p>
                    </div>
                  </div>
                </div>
              ) : (
                <button
                  onClick={connectStripe}
                  disabled={stripeConnecting}
                  className="w-full p-5 rounded-xl border border-white/10 bg-surface/50 hover:border-brand-600/40 transition-all text-left"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-[#635bff]/10 flex items-center justify-center text-[#635bff] font-bold text-lg">
                      S
                    </div>
                    <div>
                      <p className="text-white font-medium">
                        {stripeConnecting ? "Connecting..." : "Connect with Stripe"}
                      </p>
                      <p className="text-zinc-500 text-sm">Set up in 2 minutes. No monthly fees.</p>
                    </div>
                  </div>
                </button>
              )}

              <StepActions
                saving={saving}
                skippable
                onContinue={async () => {
                  await saveStep("payments", {
                    stripeAccountId: business.stripe_account_id || undefined,
                  });
                  nextStep();
                }}
                onSkip={skipStep}
              />
            </div>
          )}

          {/* ── STEP 8: Email ── */}
          {stepDef.id === "email" && (
            <div className="animate-fadeIn space-y-6">
              {/* Google Workspace affiliate */}
              <AffiliateCard step="email" businessId={businessId} />

              <div>
                <label className="text-xs text-zinc-500 uppercase tracking-wider mb-2 block">
                  Your business email
                </label>
                <input
                  type="email"
                  value={businessEmail}
                  onChange={(e) => setBusinessEmail(e.target.value)}
                  placeholder={`hello@${slugValue || business.slug}.com`}
                  className="w-full px-4 py-3 rounded-xl bg-surface border border-white/10 text-white focus:border-brand-600/50 focus:outline-none transition-colors"
                />
                <p className="text-xs text-zinc-600 mt-2">
                  This will be shown as the contact email on your website.
                </p>
              </div>

              <StepActions
                saving={saving}
                skippable
                lastStep
                onContinue={async () => {
                  await saveStep("email", { businessEmail: businessEmail || undefined });
                  router.push("/dashboard");
                }}
                onSkip={async () => {
                  await saveStep("email", {});
                  router.push("/dashboard");
                }}
              />
            </div>
          )}

        </div>
      </div>
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
    <div className="flex items-center justify-between pt-4 border-t border-white/5">
      {skippable ? (
        <button onClick={onSkip} className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors">
          Skip for now
        </button>
      ) : (
        <div />
      )}
      <button
        onClick={onContinue}
        disabled={saving}
        className="btn-primary px-8 py-3 rounded-xl text-sm font-bold text-white"
      >
        {saving ? "Saving..." : lastStep ? "Finish Setup" : "Continue"}
      </button>
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
      className="block p-5 rounded-xl border border-white/5 bg-gradient-to-br from-surface to-surface-light hover:border-brand-600/20 transition-all group"
    >
      <div className="flex items-start justify-between mb-2">
        <h4 className="text-white font-semibold">{aff.headline}</h4>
        <span className="text-[10px] text-zinc-600 bg-white/5 px-2 py-0.5 rounded-full">Recommended</span>
      </div>
      <p className="text-zinc-400 text-sm mb-3">{aff.pitch}</p>
      <span className="text-brand-400 text-sm font-medium group-hover:text-brand-300 transition-colors">
        {aff.ctaLabel} &rarr;
      </span>
    </a>
  );
}
