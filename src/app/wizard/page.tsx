"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import AuthGateModal from "@/components/onboarding/AuthGateModal";
import BuildingScreen from "@/components/wizard/BuildingScreen";
import { supabase } from "@/lib/supabase";
import { T, CTA_GRAD } from "@/lib/design-tokens";
import {
  SKILLS,
  TIME_OPTIONS,
  BUDGET_OPTIONS,
  TYPE_OPTIONS,
  SUBTYPE_OPTIONS,
  generateConcepts as localGenerateConcepts,
  type BusinessConcept,
} from "@/lib/wizard-data";

type Step = "skills" | "audience" | "budget" | "time" | "generating" | "building" | "done";

const QUESTION_STEPS = ["skills", "audience", "budget", "time"];

function getStepNumber(step: Step): { current: number; total: number } {
  const idx = QUESTION_STEPS.indexOf(step);
  if (idx === -1) return { current: 0, total: 0 };
  return { current: idx + 1, total: 4 };
}

/* Subtype descriptions for the second-phase picker */
const SUBTYPE_DESCS: Record<string, string> = {
  freelance: "Solo client work",
  consulting: "Strategic advisory",
  coaching: "1:1 or group coaching",
  agency: "Team-based services",
  courses: "Online education",
  templates: "Downloadable assets",
  ebooks: "Written products",
  memberships: "Recurring community",
};

export default function WizardPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("skills");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [selectedTime, setSelectedTime] = useState("");
  const [selectedBudget, setSelectedBudget] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [selectedSubtype, setSelectedSubtype] = useState("");
  const [selectedAudience, setSelectedAudience] = useState("");
  const [concepts, setConcepts] = useState<BusinessConcept[]>([]);
  const [chosenConcept, setChosenConcept] = useState<BusinessConcept | null>(null);
  const [buildProgress, setBuildProgress] = useState(0);
  const [siteSlug, setSiteSlug] = useState("");
  const [businessIdResult, setBusinessIdResult] = useState("");
  const [deployedUrl, setDeployedUrl] = useState("");
  const [error, setError] = useState("");
  const [showAuthGate, setShowAuthGate] = useState(false);
  const [pendingBusinessId, setPendingBusinessId] = useState("");
  const [pendingBusinessName, setPendingBusinessName] = useState("");
  const buildStarted = useRef(false);

  const stepInfo = getStepNumber(step);

  function toggleSkill(id: string) {
    setSelectedSkills((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : prev.length < 5 ? [...prev, id] : prev
    );
  }

  function goBack() {
    const currentIdx = QUESTION_STEPS.indexOf(step);
    if (currentIdx > 0) {
      setStep(QUESTION_STEPS[currentIdx - 1] as Step);
    }
  }

  /* Phase 1: pick a category. Phase 2: pick subtype (if applicable), then advance. */
  function handleTypeSelect(id: string) {
    setSelectedType(id);
    setSelectedSubtype("");
    // "both" and "any" have no subtypes — advance immediately
    if (!SUBTYPE_OPTIONS[id]) {
      setSelectedAudience(id);
      setTimeout(() => setStep("budget"), 300);
    }
  }

  function handleSubtypeSelect(sub: string) {
    setSelectedSubtype(sub);
    setSelectedAudience(`${selectedType}__${sub}`);
    setTimeout(() => setStep("budget"), 300);
  }

  function handleBudgetSelect(id: string) {
    setSelectedBudget(id);
    setTimeout(() => setStep("time"), 300);
  }

  function handleTimeSelect(id: string) {
    setSelectedTime(id);
    setTimeout(() => setStep("generating"), 300);
  }

  // Generate concepts
  useEffect(() => {
    if (step !== "generating") return;
    let cancelled = false;

    async function fetchConcepts() {
      try {
        const res = await fetch("/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "concepts",
            skills: selectedSkills,
            time: selectedTime,
            budget: selectedBudget,
            bizType: selectedType,
            subtype: selectedSubtype || undefined,
          }),
        });

        if (!cancelled && res.ok) {
          const data = await res.json();
          if (data.concepts && data.concepts.length > 0) {
            setConcepts(data.concepts);
            return;
          }
        }
      } catch {
        // API failed -- fallback to local
      }

      if (!cancelled) {
        const results = localGenerateConcepts(selectedSkills, selectedTime, selectedBudget, selectedType, selectedSubtype || undefined);
        setConcepts(results);
      }
    }

    fetchConcepts();
    return () => { cancelled = true; };
  }, [step, selectedSkills, selectedTime, selectedBudget, selectedType, selectedSubtype]);

  // Build business
  useEffect(() => {
    if (step !== "building" || !chosenConcept || buildStarted.current) return;
    buildStarted.current = true;
    setBuildProgress(0);
    setError("");

    const interval = setInterval(() => {
      setBuildProgress((prev) => {
        if (prev >= 90) return 90;
        return prev + 1;
      });
    }, 150);

    async function buildBusiness() {
      try {
        const { data: { user } } = await supabase.auth.getUser();

        const res = await fetch("/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "build",
            userId: user?.id || null,
            concept: chosenConcept,
            skills: selectedSkills,
            time: selectedTime,
            budget: selectedBudget,
            bizType: selectedType,
            subtype: selectedSubtype || chosenConcept?.subtype || undefined,
          }),
        });

        clearInterval(interval);

        if (res.ok) {
          const data = await res.json();
          const bizId = data.business?.id;
          setSiteSlug(data.siteUrl || "");
          if (bizId) setBusinessIdResult(bizId);

          if (bizId) {
            setBuildProgress(92);
            try {
              const deployRes = await fetch("/api/deploy", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ businessId: bizId, userId: user?.id || null }),
              });
              const deployData = await deployRes.json();
              if (deployRes.ok && deployData.url) {
                setDeployedUrl(deployData.url);
              } else {
                console.error("[wizard] Deploy failed:", deployData.error || deployRes.status);
              }
            } catch (deployErr) {
              console.error("[wizard] Deploy exception:", deployErr);
            }
          }
          setBuildProgress(100);

          if (bizId) {
            const { data: { user: authUser } } = await supabase.auth.getUser();
            if (authUser) {
              router.push(`/onboarding/${bizId}`);
            } else {
              setPendingBusinessId(bizId);
              setPendingBusinessName(chosenConcept?.name || "your business");
              setShowAuthGate(true);
            }
          } else {
            setError("Something went wrong creating your business. Please try again.");
          }
        } else {
          console.error("[wizard] Build API returned non-ok:", res.status);
          clearInterval(interval);
          setBuildProgress(100);
          setError("Build failed. Please try again.");
        }
      } catch (err) {
        console.error("[wizard] Build error:", err);
        clearInterval(interval);
        setBuildProgress(100);
        setError("Something went wrong. Please try again.");
      }
    }

    buildBusiness();
    return () => clearInterval(interval);
  }, [step, chosenConcept, selectedSkills, selectedTime, selectedBudget, selectedType]);

  function pickConcept(c: BusinessConcept) {
    setChosenConcept(c);
    buildStarted.current = false;
    setStep("building");
  }

  const buildSteps = [
    { at: 5, label: "Picking the perfect name..." },
    { at: 15, label: "Designing your brand identity..." },
    { at: 30, label: "Crafting your website copy..." },
    { at: 50, label: "Building your storefront page by page..." },
    { at: 65, label: "Setting up checkout so you can get paid..." },
    { at: 78, label: "Optimizing for search engines..." },
    { at: 92, label: "Almost there -- deploying to your live URL..." },
  ];

  const currentBuildStep = buildSteps.filter((s) => buildProgress >= s.at).pop();

  const pageTransition = {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -8 },
    transition: { duration: 0.35, ease: [0.25, 0.1, 0.25, 1] as const },
  };

  // Shared layout for question steps
  const questionLayout: React.CSSProperties = {
    minHeight: "calc(100vh - 144px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "0 24px",
  };

  // Glass option button style
  function optionStyle(isSelected: boolean): React.CSSProperties {
    return {
      display: "flex",
      alignItems: "center",
      gap: 16,
      padding: "18px 20px",
      borderRadius: 16,
      textAlign: "left" as const,
      transition: "all 0.2s ease",
      border: isSelected ? `1px solid rgba(123,57,252,0.3)` : `1px solid ${T.border}`,
      borderLeft: isSelected ? `3px solid ${T.purple}` : `1px solid ${isSelected ? "rgba(123,57,252,0.3)" : T.border}`,
      background: isSelected ? "rgba(123,57,252,0.1)" : T.glass,
      backdropFilter: "blur(12px)",
      cursor: "pointer",
      width: "100%",
    };
  }

  // Heading style
  const headingStyle: React.CSSProperties = {
    fontFamily: T.h,
    fontSize: "clamp(2rem, 5vw, 3rem)",
    fontWeight: 600,
    color: T.text,
    letterSpacing: "-0.02em",
    lineHeight: 1.1,
    marginBottom: 12,
  };

  // Back button style
  const backBtnStyle: React.CSSProperties = {
    background: T.glass,
    border: `1px solid ${T.border}`,
    borderRadius: 8,
    color: T.text3,
    fontSize: "0.8rem",
    cursor: "pointer",
    marginBottom: 40,
    padding: "6px 14px",
    backdropFilter: "blur(8px)",
    transition: "all 0.2s ease",
  };

  return (
    <>
      <Navbar />

      {/* Progress indicator: "Step X of 4" */}
      {QUESTION_STEPS.includes(step) && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          background: "rgba(255,255,255,0.04)",
          zIndex: 100,
        }}>
          <motion.div
            style={{ height: "100%", background: CTA_GRAD }}
            animate={{ width: `${(stepInfo.current / stepInfo.total) * 100}%` }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          />
        </div>
      )}

      <div style={{ minHeight: "100vh", paddingTop: 80, paddingBottom: 64, background: T.bg }}>
        <AnimatePresence mode="wait">

          {/* ---- SKILLS ---- */}
          {step === "skills" && (
            <motion.div key="skills" {...pageTransition} style={questionLayout}>
              <div style={{ maxWidth: 600, width: "100%" }}>
                <p style={{ color: T.text3, fontSize: "0.8rem", fontFamily: T.h, marginBottom: 16 }}>
                  Step {stepInfo.current} of {stepInfo.total}
                </p>
                <h2 style={headingStyle}>
                  What are you good at?
                </h2>
                <p style={{ color: T.text2, marginBottom: 40, fontSize: "1rem", lineHeight: 1.6 }}>
                  Pick up to five. We&apos;ll match you with businesses that play to your strengths.
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 44 }}>
                  {SKILLS.map((s) => {
                    const active = selectedSkills.includes(s.id);
                    return (
                      <button
                        key={s.id}
                        onClick={() => toggleSkill(s.id)}
                        style={{
                          padding: "10px 20px",
                          borderRadius: 100,
                          border: active ? `1px solid rgba(123,57,252,0.4)` : `1px solid ${T.border}`,
                          cursor: "pointer",
                          transition: "all 0.2s ease",
                          background: active ? "rgba(123,57,252,0.12)" : T.glass,
                          color: active ? T.purpleLight : T.text2,
                          fontSize: "0.85rem",
                          fontWeight: 500,
                          fontFamily: T.h,
                          backdropFilter: "blur(8px)",
                          boxShadow: active ? "0 0 16px rgba(123,57,252,0.15)" : "none",
                        }}
                      >
                        <span style={{ marginRight: 6 }}>{s.icon}</span>
                        {s.label}
                      </button>
                    );
                  })}
                </div>
                <button
                  disabled={selectedSkills.length === 0}
                  onClick={() => setStep("audience")}
                  style={{
                    padding: "14px 44px",
                    borderRadius: 100,
                    fontSize: "0.9rem",
                    fontWeight: 600,
                    fontFamily: T.h,
                    border: "none",
                    cursor: selectedSkills.length === 0 ? "not-allowed" : "pointer",
                    background: selectedSkills.length === 0 ? "rgba(123,57,252,0.2)" : CTA_GRAD,
                    color: "#fff",
                    opacity: selectedSkills.length === 0 ? 0.5 : 1,
                    transition: "all 0.2s ease",
                  }}
                >
                  Continue &middot; {selectedSkills.length} selected
                </button>
              </div>
            </motion.div>
          )}

          {/* ---- AUDIENCE (two-phase: category → subtype) ---- */}
          {step === "audience" && (
            <motion.div key="audience" {...pageTransition} style={questionLayout}>
              <div style={{ maxWidth: 480, width: "100%" }}>
                <button onClick={goBack} style={backBtnStyle}>
                  &larr; Back
                </button>
                <p style={{ color: T.text3, fontSize: "0.8rem", fontFamily: T.h, marginBottom: 16 }}>
                  Step {stepInfo.current} of {stepInfo.total}
                </p>
                <h2 style={headingStyle}>
                  Who do you serve?
                </h2>
                <p style={{ color: T.text2, marginBottom: 36, fontSize: "1rem", lineHeight: 1.6 }}>
                  Pick the business model that fits you best.
                </p>

                {/* Phase 1: Category cards */}
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {TYPE_OPTIONS.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => handleTypeSelect(t.id)}
                      style={optionStyle(selectedType === t.id)}
                    >
                      <span style={{ fontSize: "1.3rem" }}>{t.icon}</span>
                      <div>
                        <p style={{ color: T.text, fontWeight: 500, marginBottom: 2, fontSize: "0.95rem", fontFamily: T.h }}>{t.label}</p>
                        <p style={{ color: T.text3, fontSize: "0.8rem" }}>{t.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Phase 2: Subtypes slide in when a category with subtypes is selected */}
                <AnimatePresence>
                  {selectedType && SUBTYPE_OPTIONS[selectedType] && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3, ease: "easeOut" }}
                      style={{ overflow: "hidden" }}
                    >
                      <p style={{ color: T.text3, fontSize: "0.8rem", fontFamily: T.h, marginTop: 32, marginBottom: 14 }}>
                        What kind of {selectedType === "services" ? "service" : "product"}?
                      </p>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                        {SUBTYPE_OPTIONS[selectedType].map((s, i) => (
                          <motion.button
                            key={s.id}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.06 }}
                            onClick={() => handleSubtypeSelect(s.id)}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 10,
                              padding: "14px 16px",
                              borderRadius: 14,
                              textAlign: "left" as const,
                              transition: "all 0.2s ease",
                              border: selectedSubtype === s.id
                                ? `1px solid rgba(123,57,252,0.3)`
                                : `1px solid ${T.border}`,
                              background: selectedSubtype === s.id
                                ? "rgba(123,57,252,0.1)"
                                : T.glass,
                              backdropFilter: "blur(12px)",
                              cursor: "pointer",
                            }}
                          >
                            <span style={{ fontSize: "1.1rem" }}>{s.icon}</span>
                            <div>
                              <span style={{ color: T.text, fontWeight: 500, display: "block", fontSize: "0.85rem", fontFamily: T.h }}>{s.label}</span>
                              <span style={{ color: T.text3, fontSize: "0.7rem" }}>{SUBTYPE_DESCS[s.id] || ""}</span>
                            </div>
                          </motion.button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}

          {/* ---- BUDGET ---- */}
          {step === "budget" && (
            <motion.div key="budget" {...pageTransition} style={questionLayout}>
              <div style={{ maxWidth: 480, width: "100%" }}>
                <button onClick={goBack} style={backBtnStyle}>
                  &larr; Back
                </button>
                <p style={{ color: T.text3, fontSize: "0.8rem", fontFamily: T.h, marginBottom: 16 }}>
                  Step {stepInfo.current} of {stepInfo.total}
                </p>
                <h2 style={headingStyle}>
                  What&apos;s your<br />starting budget?
                </h2>
                <p style={{ color: T.text2, marginBottom: 40, fontSize: "1rem", lineHeight: 1.6 }}>
                  $0 is totally fine. Seriously.
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {BUDGET_OPTIONS.map((b) => (
                    <button
                      key={b.id}
                      onClick={() => handleBudgetSelect(b.id)}
                      style={optionStyle(selectedBudget === b.id)}
                    >
                      <span style={{ fontSize: "1.3rem" }}>{b.icon}</span>
                      <div>
                        <p style={{ color: T.text, fontWeight: 500, marginBottom: 2, fontSize: "0.95rem", fontFamily: T.h }}>{b.label}</p>
                        <p style={{ color: T.text3, fontSize: "0.8rem" }}>{b.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* ---- TIME ---- */}
          {step === "time" && (
            <motion.div key="time" {...pageTransition} style={questionLayout}>
              <div style={{ maxWidth: 480, width: "100%" }}>
                <button onClick={goBack} style={backBtnStyle}>
                  &larr; Back
                </button>
                <p style={{ color: T.text3, fontSize: "0.8rem", fontFamily: T.h, marginBottom: 16 }}>
                  Step {stepInfo.current} of {stepInfo.total}
                </p>
                <h2 style={headingStyle}>
                  How much time<br />can you commit?
                </h2>
                <p style={{ color: T.text2, marginBottom: 40, fontSize: "1rem", lineHeight: 1.6 }}>
                  This helps us find the right scale.
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {TIME_OPTIONS.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => handleTimeSelect(t.id)}
                      style={optionStyle(selectedTime === t.id)}
                    >
                      <span style={{ fontSize: "1.3rem" }}>{t.icon}</span>
                      <div>
                        <p style={{ color: T.text, fontWeight: 500, marginBottom: 2, fontSize: "0.95rem", fontFamily: T.h }}>{t.label}</p>
                        <p style={{ color: T.text3, fontSize: "0.8rem" }}>{t.desc} &middot; {t.hours}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* ---- GENERATING (spinner + inline concept cards when ready) ---- */}
          {step === "generating" && (
            <motion.div
              key="generating"
              {...pageTransition}
              style={{
                minHeight: "calc(100vh - 144px)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "0 24px",
              }}
            >
              {/* Show spinner while concepts haven't loaded */}
              {concepts.length === 0 && (
                <>
                  <div style={{ width: 48, height: 48, marginBottom: 32, position: "relative" }}>
                    <div style={{
                      position: "absolute",
                      inset: 0,
                      borderRadius: "50%",
                      border: `2px solid rgba(123,57,252,0.12)`,
                    }} />
                    <div style={{
                      position: "absolute",
                      inset: 0,
                      borderRadius: "50%",
                      border: "2px solid transparent",
                      borderTopColor: T.purple,
                      animation: "spin 1s linear infinite",
                    }} />
                  </div>
                  <h2 style={{
                    fontFamily: T.h,
                    fontSize: "1.5rem",
                    fontWeight: 600,
                    color: T.text,
                    letterSpacing: "-0.02em",
                    marginBottom: 8,
                  }}>
                    Analyzing your profile...
                  </h2>
                  <p style={{ color: T.text3, fontSize: "0.9rem" }}>
                    Generating three perfect-fit business ideas
                  </p>
                </>
              )}

              {/* Concepts loaded -- show them inline as glass cards */}
              {concepts.length > 0 && (
                <div style={{ maxWidth: 600, width: "100%" }}>
                  <div style={{ marginBottom: 48, textAlign: "center" }}>
                    <h2 style={{
                      ...headingStyle,
                      textAlign: "center",
                    }}>
                      Your top three ideas
                    </h2>
                    <p style={{ color: T.text2, fontSize: "1rem" }}>
                      Pick one to start building. Right now.
                    </p>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {concepts.map((c, i) => (
                      <motion.button
                        key={c.name}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.12 }}
                        onClick={() => pickConcept(c)}
                        style={{
                          textAlign: "left",
                          padding: 24,
                          borderRadius: 16,
                          border: `1px solid ${T.border}`,
                          background: T.glass,
                          backdropFilter: "blur(12px)",
                          cursor: "pointer",
                          transition: "all 0.2s ease",
                          width: "100%",
                        }}
                        whileHover={{
                          backgroundColor: "rgba(123,57,252,0.08)",
                          borderColor: "rgba(123,57,252,0.25)",
                        }}
                      >
                        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-start", justifyContent: "space-between", gap: 8, marginBottom: 10 }}>
                          <div>
                            <h3 style={{
                              fontFamily: T.h,
                              fontSize: "1.15rem",
                              fontWeight: 600,
                              color: T.text,
                              marginBottom: 4,
                            }}>
                              {c.name}
                            </h3>
                            <p style={{ color: T.purpleLight, fontSize: "0.8rem", fontWeight: 500 }}>{c.tagline}</p>
                          </div>
                          <span style={{
                            flexShrink: 0,
                            fontSize: "0.75rem",
                            fontWeight: 600,
                            color: T.green,
                          }}>
                            {c.revenue}
                          </span>
                        </div>
                        <p style={{ color: T.text2, fontSize: "0.85rem", marginBottom: 12, lineHeight: 1.55 }}>{c.desc}</p>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 16, fontSize: "0.75rem", color: T.text3 }}>
                          <span>Startup: {c.startup}</span>
                          <span>Audience: {c.audience}</span>
                          <span style={{ textTransform: "capitalize" }}>Type: {c.type}{c.subtype ? ` \u00b7 ${c.subtype}` : ""}</span>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* ---- BUILDING ---- */}
          {step === "building" && chosenConcept && (
            <motion.div key="building" {...pageTransition}>
              <BuildingScreen
                businessName={chosenConcept.name}
                tagline={chosenConcept.tagline}
                buildProgress={buildProgress}
                currentStepLabel={currentBuildStep?.label ?? "Initializing..."}
                error={error}
                onRetry={() => {
                  setError("");
                  buildStarted.current = false;
                  setStep("building");
                }}
              />
            </motion.div>
          )}

          {/* ---- DONE ---- */}
          {step === "done" && chosenConcept && (
            <motion.div key="done" {...pageTransition} style={{
              minHeight: "calc(100vh - 144px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "0 24px",
            }}>
              <div style={{ textAlign: "center", maxWidth: 480 }}>
                <div style={{ fontSize: "2.5rem", marginBottom: 28 }}>&#127881;</div>
                <h2 style={{
                  ...headingStyle,
                  textAlign: "center",
                  marginBottom: 16,
                }}>
                  {chosenConcept.name} is live.
                </h2>
                <p style={{ color: T.text2, fontSize: "1rem", marginBottom: 8 }}>
                  {deployedUrl
                    ? "Your site has been deployed."
                    : "Your business is ready to go."}
                </p>
                {deployedUrl ? (
                  <a
                    href={deployedUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: T.purpleLight, fontFamily: T.mono, fontSize: "0.8rem", display: "inline-block", marginBottom: 40 }}
                  >
                    {deployedUrl}
                  </a>
                ) : siteSlug ? (
                  <Link href={siteSlug} style={{ color: T.purpleLight, fontFamily: T.mono, fontSize: "0.8rem", display: "inline-block", marginBottom: 40 }}>
                    Preview: {siteSlug}
                  </Link>
                ) : null}
                <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "center", gap: 12, marginTop: 32 }}>
                  {(deployedUrl || siteSlug) && (
                    <a
                      href={deployedUrl || siteSlug}
                      target={deployedUrl ? "_blank" : undefined}
                      rel={deployedUrl ? "noopener noreferrer" : undefined}
                      style={{
                        padding: "14px 36px",
                        borderRadius: 100,
                        fontSize: "0.9rem",
                        fontWeight: 600,
                        fontFamily: T.h,
                        textDecoration: "none",
                        background: CTA_GRAD,
                        color: "#fff",
                        display: "inline-block",
                      }}
                    >
                      View Your Site
                    </a>
                  )}
                  <Link
                    href="/dashboard"
                    style={{
                      padding: "14px 36px",
                      borderRadius: 100,
                      fontSize: "0.9rem",
                      fontWeight: 500,
                      fontFamily: T.h,
                      color: T.text2,
                      textDecoration: "none",
                      background: T.glass,
                      border: `1px solid ${T.border}`,
                      backdropFilter: "blur(8px)",
                      display: "inline-block",
                    }}
                  >
                    Go to Dashboard
                  </Link>
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* Auth gate modal */}
      {showAuthGate && pendingBusinessId && (
        <AuthGateModal
          businessId={pendingBusinessId}
          businessName={pendingBusinessName}
          onSuccess={() => {
            router.push(`/onboarding/${pendingBusinessId}`);
          }}
          onSkip={() => {
            router.push(`/onboarding/${pendingBusinessId}`);
          }}
        />
      )}

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
}
