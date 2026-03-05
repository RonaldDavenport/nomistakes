"use client";

import { Suspense } from "react";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import BuildingScreen from "@/components/wizard/BuildingScreen";
import AuthGateModal from "@/components/onboarding/AuthGateModal";
import { supabase } from "@/lib/supabase";
import { T, CTA_GRAD } from "@/lib/design-tokens";

type SiteChoice = "transfer" | "remake" | "scratch";
type Step = "site-choice" | "name" | "describe" | "tools" | "building" | "done";

const SWITCH_STEPS: Step[] = ["site-choice", "name", "describe", "tools"];

const SITE_CHOICE_OPTIONS: { id: SiteChoice; title: string; subtitle: string; detail: string }[] = [
  {
    id: "transfer",
    title: "Keep my existing site",
    subtitle: "My site stays where it is. I just need the workspace behind it.",
    detail: "Kovra acts as your business engine. Your site links to your Kovra booking page, and you manage proposals, invoices, and clients from your Kovra dashboard.",
  },
  {
    id: "remake",
    title: "Remake my existing site",
    subtitle: "I have a site but want it rebuilt. Use my existing one as a reference.",
    detail: "We'll generate a fresh AI-written site based on your business — no design skills needed.",
  },
  {
    id: "scratch",
    title: "Build a new one from scratch",
    subtitle: "I don't have a site, or I'm starting completely fresh.",
    detail: "4 minutes. Kovra generates your site, copy, and workspace in one go.",
  },
];

const BUILD_STEPS_BY_CHOICE: Record<SiteChoice, { at: number; label: string }[]> = {
  transfer: [
    { at: 5,  label: "Setting up your business profile..." },
    { at: 15, label: "Configuring your booking link..." },
    { at: 30, label: "Building your client pipeline..." },
    { at: 50, label: "Setting up proposals and contracts..." },
    { at: 65, label: "Configuring invoicing and payments..." },
    { at: 78, label: "Building your client portal..." },
    { at: 92, label: "Your workspace is ready..." },
  ],
  remake: [
    { at: 5,  label: "Setting up your business profile..." },
    { at: 15, label: "Designing your new site from scratch..." },
    { at: 30, label: "Writing your site copy with AI..." },
    { at: 50, label: "Configuring your CRM and client pipeline..." },
    { at: 65, label: "Building your proposal and contract system..." },
    { at: 78, label: "Setting up invoicing and payments..." },
    { at: 92, label: "Deploying your rebuilt site..." },
  ],
  scratch: [
    { at: 5,  label: "Setting up your business profile..." },
    { at: 15, label: "Generating your new site and brand..." },
    { at: 30, label: "Setting up your booking link..." },
    { at: 50, label: "Configuring your CRM and client pipeline..." },
    { at: 65, label: "Building your proposal and contract system..." },
    { at: 78, label: "Setting up invoicing and payments..." },
    { at: 92, label: "Deploying your site live..." },
  ],
};

const SERVICE_SUGGESTIONS = [
  { label: "Web design",       fill: "I design and build websites. Have several clients, running on Calendly, PayPal, and a handful of spreadsheets. Want to consolidate everything into one system." },
  { label: "Consulting",       fill: "I run a consulting practice with recurring clients. Managing projects, invoices, and proposals across too many tools. Need one place for everything." },
  { label: "Coaching",         fill: "I'm an established coach with regular clients. Using a mix of Calendly, Stripe, and Notion. Want a proper system that makes me look and operate more professionally." },
  { label: "Marketing",        fill: "I freelance in marketing — content, strategy, ads. Have clients but my backend is a mess. Chasing invoices, juggling tools. Need to consolidate." },
  { label: "Photography",      fill: "I'm a working photographer with bookings, galleries, and invoicing. Current tools don't talk to each other. Want everything in one place." },
  { label: "Copywriting",      fill: "I write for clients and have steady work. But proposals go out in Google Docs, invoices in PayPal, and scheduling is a back-and-forth mess. Want a real system." },
  { label: "Bookkeeping",      fill: "I run a bookkeeping practice with existing clients. Need to replace my current tool stack with something that handles scheduling, invoicing, and client management together." },
  { label: "Fitness training", fill: "I train clients regularly. Managing bookings and payments across different apps. Want one platform that handles scheduling, invoices, and client tracking." },
  { label: "IT & tech",        fill: "I run IT and tech support for small businesses. Have ongoing clients but my billing and project tracking are scattered. Need to consolidate into one system." },
  { label: "Legal services",   fill: "I do legal consulting with active clients. Running on disconnected tools for scheduling, contracts, and invoicing. Want a single platform that handles it professionally." },
  { label: "Interior design",  fill: "I have a design practice with real projects. Proposals go out as PDFs, invoices through PayPal, projects tracked in Notion. Need everything in one place." },
  { label: "HR consulting",    fill: "I run an HR consulting practice with ongoing retainer clients. Current tools are siloed. Need a proper system for proposals, contracts, and client management." },
];

const TOOL_OPTIONS = [
  { label: "Apollo",             desc: "Lead discovery" },
  { label: "Lemlist",            desc: "Cold email" },
  { label: "Instantly",          desc: "Cold email" },
  { label: "LinkedIn Sales Nav", desc: "Prospecting" },
  { label: "Calendly",           desc: "Scheduling" },
  { label: "HoneyBook",          desc: "CRM + proposals" },
  { label: "Dubsado",            desc: "CRM + contracts" },
  { label: "DocuSign",           desc: "E-signatures" },
  { label: "Acuity",             desc: "Scheduling" },
  { label: "PayPal",             desc: "Invoicing" },
  { label: "FreshBooks",         desc: "Accounting" },
  { label: "Notion",             desc: "Project tracking" },
  { label: "Toggl",              desc: "Time tracking" },
  { label: "Pipedrive",          desc: "CRM" },
  { label: "Typeform",           desc: "Intake forms" },
  { label: "17hats",             desc: "Business mgmt" },
];


export default function SwitchWizardPage() {
  return (
    <Suspense>
      <SwitchWizardContent />
    </Suspense>
  );
}

function SwitchWizardContent() {
  const router = useRouter();
  const params = useSearchParams();

  const [step, setStep] = useState<Step>("site-choice");
  const [siteChoice, setSiteChoice] = useState<SiteChoice | null>(null);
  const [existingUrl, setExistingUrl] = useState("");
  const [bizName, setBizName] = useState("");
  const [description, setDescription] = useState(params.get("fill") || "");
  const [selectedTools, setSelectedTools] = useState<string[]>([]);

  const [buildProgress, setBuildProgress] = useState(0);
  const [deployedUrl, setDeployedUrl] = useState("");
  const [error, setError] = useState("");

  const [showAuthGate, setShowAuthGate] = useState(false);
  const [pendingRedirect, setPendingRedirect] = useState("");

  const buildStarted = useRef(false);
  const buildStartTime = useRef(0);

  const stepIdx = SWITCH_STEPS.indexOf(step as Step);
  const isQuestionStep = stepIdx !== -1;
  const stepNum = stepIdx + 1;
  const stepTotal = SWITCH_STEPS.length;

  function goBack() {
    if (stepIdx > 0) setStep(SWITCH_STEPS[stepIdx - 1]);
  }

  function toggleTool(label: string) {
    setSelectedTools(prev =>
      prev.includes(label) ? prev.filter(t => t !== label) : [...prev, label]
    );
  }

  function buildRedirectUrl(bizId: string) {
    const params = new URLSearchParams();
    if (selectedTools.length > 0) params.set("tools", selectedTools.join(","));
    if (siteChoice) params.set("siteMode", siteChoice);
    const qs = params.toString();
    return `/onboarding/switch/${bizId}${qs ? `?${qs}` : ""}`;
  }

  useEffect(() => {
    if (step !== "building" || buildStarted.current) return;
    buildStarted.current = true;
    buildStartTime.current = Date.now();
    setBuildProgress(0);
    setError("");

    const interval = setInterval(() => {
      setBuildProgress((p) => (p >= 90 ? 90 : p + 1));
    }, 150);

    async function run() {
      try {
        const { data: { user } } = await supabase.auth.getUser();

        const concept = {
          name: bizName,
          tagline: "",
          type: "service",
          subtype: "",
          desc: description,
          revenue: "",
          startup: "",
          audience: "",
        };

        const res = await fetch("/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "build",
            userId: user?.id || null,
            concept,
            existingUrl: existingUrl || undefined,
            siteMode: siteChoice || undefined,
            skills: [],
            time: "",
            budget: "",
            bizType: "service",
          }),
        });

        clearInterval(interval);

        if (res.ok) {
          const data = await res.json();
          const bizId = data.business?.id;

          if (bizId) {
            setBuildProgress(92);
            // Skip deploy for workspace-only path (keep existing site)
            if (siteChoice !== "transfer") {
              try {
                const deployRes = await fetch("/api/deploy", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ businessId: bizId, userId: user?.id || null }),
                });
                const deployData = await deployRes.json();
                if (deployRes.ok && deployData.url) setDeployedUrl(deployData.url);
              } catch {}
            }

            setBuildProgress(100);
            const redirectUrl = buildRedirectUrl(bizId);
            const { data: { user: authUser } } = await supabase.auth.getUser();

            if (authUser) {
              router.push(redirectUrl);
            } else {
              setPendingRedirect(redirectUrl);
              setShowAuthGate(true);
              setStep("done");
            }
          } else {
            setBuildProgress(100);
            setError("Something went wrong. Please try again.");
          }
        } else {
          setBuildProgress(100);
          setError("Build failed. Please try again.");
        }
      } catch {
        clearInterval(interval);
        setBuildProgress(100);
        setError("Something went wrong. Please try again.");
      }
    }

    run();
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  const buildSteps = BUILD_STEPS_BY_CHOICE[siteChoice ?? "scratch"];
  const currentBuildStep = buildSteps.filter((s) => buildProgress >= s.at).pop();

  // ── Styles ──

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "13px 16px",
    borderRadius: 10,
    background: T.bgEl,
    border: `1px solid ${T.border}`,
    color: T.text,
    fontSize: "0.95rem",
    fontFamily: T.h,
    outline: "none",
    boxSizing: "border-box",
  };

  function primaryBtn(disabled: boolean): React.CSSProperties {
    return {
      padding: "13px 28px",
      borderRadius: 10,
      fontSize: "0.9rem",
      fontWeight: 600,
      fontFamily: T.h,
      border: "none",
      cursor: disabled ? "not-allowed" : "pointer",
      background: disabled ? T.bgAlt : CTA_GRAD,
      color: disabled ? T.text3 : "#09090B",
      opacity: disabled ? 0.5 : 1,
      transition: "all 0.15s",
      letterSpacing: "-0.01em",
    };
  }

  const backBtn: React.CSSProperties = {
    background: "none",
    border: "none",
    color: T.text3,
    fontSize: "0.85rem",
    cursor: "pointer",
    marginBottom: 32,
    padding: 0,
    display: "flex",
    alignItems: "center",
    gap: 6,
    fontFamily: T.h,
  };

  const stepLabel: React.CSSProperties = {
    fontSize: "0.7rem",
    color: T.text3,
    fontFamily: T.h,
    marginBottom: 20,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
  };

  const headingStyle: React.CSSProperties = {
    fontSize: "clamp(1.9rem, 5vw, 2.6rem)",
    fontWeight: 700,
    color: T.text,
    letterSpacing: "-0.03em",
    lineHeight: 1.05,
    marginBottom: 10,
    fontFamily: T.h,
  };

  const subtitleStyle: React.CSSProperties = {
    color: T.text2,
    fontSize: "0.95rem",
    marginBottom: 32,
    lineHeight: 1.65,
  };

  const pt = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    exit:    { opacity: 0, y: -8 },
    transition: { duration: 0.28 },
  };

  const BackArrow = () => (
    <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
    </svg>
  );

  return (
    <div style={{ minHeight: "100vh", background: T.bg }}>

      {/* Progress bar */}
      {isQuestionStep && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, height: 2, background: T.border, zIndex: 100 }}>
          <motion.div
            style={{ height: "100%", background: CTA_GRAD }}
            animate={{ width: `${(stepNum / stepTotal) * 100}%` }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          />
        </div>
      )}

      {/* Logo */}
      <div style={{
        position: "fixed", top: 0, left: 0, right: 0,
        height: 56, display: "flex", alignItems: "center",
        padding: "0 24px", zIndex: 50,
      }}>
        <Link href="/" style={{ textDecoration: "none", color: T.text, fontWeight: 700, fontSize: 18, letterSpacing: "-0.03em", fontFamily: T.h }}>
          kovra
        </Link>
      </div>

      {/* Content */}
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "80px 24px 64px",
      }}>
        <AnimatePresence mode="wait">

          {/* ── SITE CHOICE ── */}
          {step === "site-choice" && (
            <motion.div key="site-choice" {...pt} style={{ maxWidth: 520, width: "100%" }}>
              <p style={stepLabel}>{stepNum} / {stepTotal}</p>
              <h2 style={headingStyle}>What do you want to do with your site?</h2>
              <p style={subtitleStyle}>Pick one — we'll configure the rest of your workspace the same way regardless.</p>

              <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 32 }}>
                {SITE_CHOICE_OPTIONS.map(({ id, title, subtitle, detail }) => {
                  const active = siteChoice === id;
                  return (
                    <button
                      key={id}
                      onClick={() => setSiteChoice(id)}
                      style={{
                        padding: "18px 20px",
                        borderRadius: 12,
                        textAlign: "left",
                        background: active ? "rgba(200,164,78,0.07)" : T.bgEl,
                        border: `1.5px solid ${active ? "rgba(200,164,78,0.35)" : T.border}`,
                        cursor: "pointer",
                        transition: "all 0.15s",
                        width: "100%",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                        <div>
                          <p style={{ fontSize: "0.95rem", fontWeight: 600, color: active ? T.gold : T.text, fontFamily: T.h, marginBottom: 4 }}>{title}</p>
                          <p style={{ fontSize: "0.82rem", color: T.text2, fontFamily: T.h, lineHeight: 1.5 }}>{subtitle}</p>
                        </div>
                        <div style={{
                          width: 20, height: 20, borderRadius: "50%", flexShrink: 0, marginTop: 2,
                          border: `2px solid ${active ? T.gold : T.border}`,
                          background: active ? T.gold : "transparent",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          transition: "all 0.15s",
                        }}>
                          {active && (
                            <svg width="10" height="10" fill="none" stroke="#09090B" viewBox="0 0 24 24" strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                            </svg>
                          )}
                        </div>
                      </div>
                      {active && (
                        <div style={{ marginTop: 10, paddingTop: 10, borderTop: `1px solid ${T.border}` }}>
                          <p style={{ fontSize: "0.78rem", color: T.text3, fontFamily: T.h, marginBottom: id === "remake" ? 10 : 0 }}>
                            {detail}
                          </p>
                          {id === "remake" && (
                            <div>
                              <label style={{ fontSize: "0.72rem", color: T.text3, fontFamily: T.h, display: "block", marginBottom: 6, letterSpacing: "0.04em", textTransform: "uppercase" }}>
                                Your current site URL
                              </label>
                              <input
                                type="url"
                                value={existingUrl}
                                onChange={(e) => setExistingUrl(e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                                placeholder="https://yoursite.com"
                                autoFocus
                                style={{
                                  width: "100%",
                                  padding: "10px 13px",
                                  borderRadius: 8,
                                  background: T.bgAlt,
                                  border: `1px solid ${T.borderLight}`,
                                  color: T.text,
                                  fontSize: "0.88rem",
                                  fontFamily: T.h,
                                  outline: "none",
                                  boxSizing: "border-box",
                                }}
                              />
                            </div>
                          )}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {(() => {
                const needsUrl = siteChoice === "remake";
                const disabled = !siteChoice || (needsUrl && existingUrl.trim().length < 6);
                return (
                  <button disabled={disabled} onClick={() => setStep("name")} style={primaryBtn(disabled)}>
                    Continue
                  </button>
                );
              })()}
            </motion.div>
          )}

          {/* ── NAME ── */}
          {step === "name" && (
            <motion.div key="name" {...pt} style={{ maxWidth: 480, width: "100%" }}>
              <p style={stepLabel}>{stepNum} / {stepTotal}</p>
              <h2 style={headingStyle}>What's your business called?</h2>
              <p style={subtitleStyle}>We'll build your workspace around it.</p>
              <input
                type="text"
                value={bizName}
                onChange={(e) => setBizName(e.target.value)}
                placeholder="Your business name"
                style={{ ...inputStyle, marginBottom: 32 }}
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter" && bizName.trim().length > 0) setStep("describe");
                }}
              />
              <button
                disabled={bizName.trim().length === 0}
                onClick={() => setStep("describe")}
                style={primaryBtn(bizName.trim().length === 0)}
              >
                Continue
              </button>
            </motion.div>
          )}

          {/* ── DESCRIBE ── */}
          {step === "describe" && (
            <motion.div key="describe" {...pt} style={{ maxWidth: 520, width: "100%" }}>
              <button onClick={goBack} style={backBtn}>
                <BackArrow /> Back
              </button>
              <p style={stepLabel}>{stepNum} / {stepTotal}</p>
              <h2 style={headingStyle}>What kind of work do you do?</h2>
              <p style={subtitleStyle}>
                {siteChoice === "transfer"
                  ? "We use this to configure your proposals, set up your CRM, and personalize your workspace. Pick one or describe it yourself."
                  : "We use this to write your site copy, configure your proposals, and set up your CRM. Pick one or describe it yourself."}
              </p>

              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
                {SERVICE_SUGGESTIONS.map((s) => {
                  const active = description === s.fill;
                  return (
                    <button
                      key={s.label}
                      onClick={() => setDescription(s.fill)}
                      style={{
                        padding: "6px 14px",
                        borderRadius: 100,
                        fontSize: "0.78rem",
                        fontFamily: T.h,
                        fontWeight: 500,
                        background: active ? T.goldDim : T.bgEl,
                        border: `1px solid ${active ? "rgba(200,164,78,0.25)" : T.border}`,
                        color: active ? T.gold : T.text2,
                        cursor: "pointer",
                        transition: "all 0.15s",
                      }}
                    >
                      {s.label}
                    </button>
                  );
                })}
              </div>

              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. I run a bookkeeping practice with existing clients. Looking to replace my scattered tool stack."
                rows={3}
                style={{ ...inputStyle, resize: "none", lineHeight: 1.65, marginBottom: 20 }}
                autoFocus
              />
              <button
                disabled={description.trim().length < 10}
                onClick={() => setStep("tools")}
                style={primaryBtn(description.trim().length < 10)}
              >
                Continue
              </button>
            </motion.div>
          )}

          {/* ── TOOLS ── */}
          {step === "tools" && (
            <motion.div key="tools" {...pt} style={{ maxWidth: 560, width: "100%" }}>
              <button onClick={goBack} style={backBtn}>
                <BackArrow /> Back
              </button>
              <p style={stepLabel}>{stepNum} / {stepTotal}</p>
              <h2 style={headingStyle}>What are you replacing?</h2>
              <p style={subtitleStyle}>Select everything you're currently paying for. Kovra covers all of it.</p>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 10, marginBottom: 32 }}>
                {TOOL_OPTIONS.map(({ label, desc }) => {
                  const active = selectedTools.includes(label);
                  return (
                    <button
                      key={label}
                      onClick={() => toggleTool(label)}
                      style={{
                        padding: "12px 14px",
                        borderRadius: 10,
                        textAlign: "left",
                        background: active ? "rgba(200,164,78,0.08)" : T.bgEl,
                        border: `1.5px solid ${active ? "rgba(200,164,78,0.3)" : T.border}`,
                        cursor: "pointer",
                        transition: "all 0.15s",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 3 }}>
                        <span style={{ fontSize: "0.88rem", fontWeight: 600, color: active ? T.gold : T.text, fontFamily: T.h }}>{label}</span>
                        {active && (
                          <div style={{ width: 16, height: 16, borderRadius: "50%", background: T.gold, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                            <svg width="9" height="9" fill="none" stroke="#09090B" viewBox="0 0 24 24" strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <span style={{ fontSize: "0.72rem", color: T.text3, fontFamily: T.h }}>{desc}</span>
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => {
                  buildStarted.current = false;
                  setStep("building");
                }}
                style={primaryBtn(false)}
              >
                {selectedTools.length > 0
                  ? `Replace ${selectedTools.length} tool${selectedTools.length > 1 ? "s" : ""} — set up Kovra`
                  : "Skip — set up Kovra"}
              </button>
            </motion.div>
          )}

          {/* ── BUILDING ── */}
          {step === "building" && (
            <motion.div key="building" {...pt} style={{ width: "100%", maxWidth: 600 }}>
              <BuildingScreen
                businessName={bizName}
                tagline={description}
                buildProgress={buildProgress}
                currentStepLabel={currentBuildStep?.label ?? "Migrating your workspace..."}
                error={error}
                onRetry={() => {
                  buildStarted.current = false;
                  setBuildProgress(0);
                  setError("");
                  setStep("building");
                }}
              />
            </motion.div>
          )}

          {/* ── DONE (auth gate shown as modal, this is fallback) ── */}
          {step === "done" && (
            <motion.div key="done" {...pt} style={{ textAlign: "center", maxWidth: 440 }}>
              <div style={{
                width: 52, height: 52, borderRadius: 14,
                background: "rgba(34,197,94,0.08)",
                border: "1px solid rgba(34,197,94,0.18)",
                display: "flex", alignItems: "center", justifyContent: "center",
                margin: "0 auto 28px",
              }}>
                <svg width="22" height="22" fill="none" stroke={T.green} viewBox="0 0 24 24" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              </div>
              <h2 style={{ ...headingStyle, textAlign: "center", marginBottom: 10 }}>
                {bizName} is set up.
              </h2>
              <p style={{ color: T.text2, fontSize: "0.95rem", marginBottom: 32 }}>
                Your workspace is ready. Sign in to access it.
              </p>
              <Link
                href="/dashboard"
                style={{
                  padding: "12px 24px", borderRadius: 10, fontSize: "0.88rem",
                  fontWeight: 500, fontFamily: T.h, color: T.text2,
                  textDecoration: "none", background: T.bgEl,
                  border: `1px solid ${T.border}`, display: "inline-block",
                }}
              >
                Go to dashboard
              </Link>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {showAuthGate && pendingRedirect && (
        <AuthGateModal
          businessId={pendingRedirect.split("/")[3]?.split("?")[0] ?? ""}
          businessName={bizName}
          onSuccess={() => router.push(pendingRedirect)}
          onSkip={() => router.push(pendingRedirect)}
        />
      )}
    </div>
  );
}
