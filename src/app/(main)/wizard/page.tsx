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
import {
  trackWizardStep,
  trackWizardBuildStarted,
  trackWizardBuildComplete,
} from "@/lib/analytics";

type Step = "describe" | "name" | "building" | "done";

// New business: describe what they do first, name comes last (with AI suggestions)
const NEW_STEPS: Step[]      = ["describe", "name"];
// Existing business: name first (they know it), then describe
const EXISTING_STEPS: Step[] = ["name", "describe"];

const BUILD_STEPS = [
  { at: 5,  label: "Setting up your business profile..." },
  { at: 15, label: "Designing your brand and website..." },
  { at: 30, label: "Building your booking and proposal system..." },
  { at: 50, label: "Configuring your CRM and client workspace..." },
  { at: 65, label: "Setting up invoicing and payments..." },
  { at: 78, label: "Generating your marketing content..." },
  { at: 92, label: "Deploying your site to a live URL..." },
];

export default function WizardPage() {
  return (
    <Suspense>
      <WizardContent />
    </Suspense>
  );
}

function WizardContent() {
  const router = useRouter();
  const params = useSearchParams();
  const isExisting = params.get("existing") === "true";
  const QUESTION_STEPS = isExisting ? EXISTING_STEPS : NEW_STEPS;

  const [step, setStep] = useState<Step>(QUESTION_STEPS[0]);
  const [description, setDescription] = useState("");
  const [bizName, setBizName] = useState("");
  const [nameSuggestions, setNameSuggestions] = useState<string[]>([]);
  const [loadingNames, setLoadingNames] = useState(false);

  const [buildProgress, setBuildProgress] = useState(0);
  const [deployedUrl, setDeployedUrl] = useState("");
  const [error, setError] = useState("");

  const [showAuthGate, setShowAuthGate] = useState(false);
  const [pendingBusinessId, setPendingBusinessId] = useState("");

  const buildStarted = useRef(false);
  const buildStartTime = useRef(0);

  useEffect(() => {
    trackWizardStep(step);
  }, [step]);

  const stepIdx = QUESTION_STEPS.indexOf(step as Step);
  const isQuestionStep = stepIdx !== -1;
  const stepNum = stepIdx + 1;
  const stepTotal = QUESTION_STEPS.length;

  function goBack() {
    if (stepIdx > 0) setStep(QUESTION_STEPS[stepIdx - 1]);
  }

  async function suggestNames() {
    setLoadingNames(true);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "names",
          currentName: bizName.trim() || description.slice(0, 60),
          type: "service",
          audience: "",
          tagline: description,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.names?.length) setNameSuggestions(data.names);
      }
    } catch {}
    setLoadingNames(false);
  }

  // Build
  useEffect(() => {
    if (step !== "building" || buildStarted.current) return;
    buildStarted.current = true;
    buildStartTime.current = Date.now();
    trackWizardBuildStarted();
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
            try {
              const deployRes = await fetch("/api/deploy", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ businessId: bizId, userId: user?.id || null }),
              });
              const deployData = await deployRes.json();
              if (deployRes.ok && deployData.url) setDeployedUrl(deployData.url);
            } catch {}

            setBuildProgress(100);
            trackWizardBuildComplete(bizId, Math.round((Date.now() - buildStartTime.current) / 1000));

            const { data: { user: authUser } } = await supabase.auth.getUser();
            if (authUser) {
              router.push(`/onboarding/${bizId}`);
            } else {
              setPendingBusinessId(bizId);
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
  }, [step]);

  const currentBuildStep = BUILD_STEPS.filter((s) => buildProgress >= s.at).pop();

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

      {/* Logo bar */}
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

          {/* ── DESCRIBE ── */}
          {step === "describe" && (
            <motion.div key="describe" {...pt} style={{ maxWidth: 520, width: "100%" }}>
              <p style={stepLabel}>{stepNum} / {stepTotal}</p>
              <h2 style={headingStyle}>What do you do?</h2>
              <p style={subtitleStyle}>{isExisting ? "Describe what you do. We use this to write your site copy, set up your tools, and configure your workspace." : "Describe your work in plain terms. We build everything around it."}</p>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. I help small business owners with their finances and bookkeeping"
                rows={3}
                style={{ ...inputStyle, resize: "none", lineHeight: 1.65, marginBottom: 20 }}
                autoFocus
              />
              <button
                disabled={description.trim().length < 10}
                onClick={() => {
                  const next = QUESTION_STEPS[stepIdx + 1];
                  if (next) setStep(next);
                  else { buildStarted.current = false; setStep("building"); }
                }}
                style={primaryBtn(description.trim().length < 10)}
              >
                Continue
              </button>
            </motion.div>
          )}


          {/* ── NAME ── */}
          {step === "name" && (
            <motion.div key="name" {...pt} style={{ maxWidth: 480, width: "100%" }}>
              <button onClick={goBack} style={backBtn}>
                <BackArrow /> Back
              </button>
              <p style={stepLabel}>{stepNum} / {stepTotal}</p>
              <h2 style={headingStyle}>{isExisting ? "What's your business called?" : "What's it called?"}</h2>
              <p style={subtitleStyle}>{isExisting ? "We'll set up your workspace around it." : "Don't have a name yet? We'll suggest some."}</p>

              <input
                type="text"
                value={bizName}
                onChange={(e) => setBizName(e.target.value)}
                placeholder="Your business name"
                style={{ ...inputStyle, marginBottom: 12 }}
                autoFocus
              />

              {nameSuggestions.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
                  {nameSuggestions.map((name) => {
                    const active = bizName === name;
                    return (
                      <button
                        key={name}
                        onClick={() => setBizName(name)}
                        style={{
                          padding: "6px 14px",
                          borderRadius: 100,
                          fontSize: "0.8rem",
                          fontFamily: T.h,
                          fontWeight: 500,
                          background: active ? T.goldDim : T.bgEl,
                          border: `1px solid ${active ? "rgba(200,164,78,0.25)" : T.border}`,
                          color: active ? T.gold : T.text2,
                          cursor: "pointer",
                          transition: "all 0.15s",
                        }}
                      >
                        {name}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Only show name suggestions for new business journey */}
              {!isExisting && (
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 32 }}>
                  <button
                    onClick={suggestNames}
                    disabled={loadingNames}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "7px 14px",
                      borderRadius: 8,
                      fontSize: "0.8rem",
                      fontFamily: T.h,
                      fontWeight: 500,
                      background: T.bgEl,
                      border: `1px solid ${T.border}`,
                      color: loadingNames ? T.text3 : T.text2,
                      cursor: loadingNames ? "wait" : "pointer",
                      transition: "all 0.15s",
                    }}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                    </svg>
                    {loadingNames ? "Thinking..." : "Suggest names"}
                  </button>
                  {!loadingNames && nameSuggestions.length === 0 && (
                    <span style={{ fontSize: "0.75rem", color: T.text3, fontFamily: T.h }}>or just type yours</span>
                  )}
                </div>
              )}
              {isExisting && <div style={{ marginBottom: 32 }} />}

              <button
                disabled={bizName.trim().length === 0}
                onClick={() => {
                  buildStarted.current = false;
                  setStep("building");
                }}
                style={primaryBtn(bizName.trim().length === 0)}
              >
                {isExisting ? "Set up my workspace" : "Build my workspace"}
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
                currentStepLabel={currentBuildStep?.label ?? "Setting up your workspace..."}
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
                {bizName} is live.
              </h2>
              <p style={{ color: T.text2, fontSize: "0.95rem", marginBottom: 32 }}>
                Your workspace is ready. Sign in to access it.
              </p>
              {deployedUrl && (
                <a
                  href={deployedUrl}
                  target="_blank"
                  rel="noreferrer"
                  style={{ display: "block", color: T.text3, fontSize: "0.78rem", marginBottom: 28, textDecoration: "none", fontFamily: T.mono }}
                >
                  {deployedUrl}
                </a>
              )}
              <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 10 }}>
                {deployedUrl && (
                  <a
                    href={deployedUrl}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      padding: "12px 24px", borderRadius: 10, fontSize: "0.88rem",
                      fontWeight: 600, fontFamily: T.h, textDecoration: "none",
                      background: CTA_GRAD, color: "#09090B", display: "inline-block",
                    }}
                  >
                    View site
                  </a>
                )}
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
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {showAuthGate && pendingBusinessId && (
        <AuthGateModal
          businessId={pendingBusinessId}
          businessName={bizName}
          onSuccess={() => router.push(`/onboarding/${pendingBusinessId}`)}
          onSkip={() => router.push(`/onboarding/${pendingBusinessId}`)}
        />
      )}
    </div>
  );
}
