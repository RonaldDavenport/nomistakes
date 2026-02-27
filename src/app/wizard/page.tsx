"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import {
  SKILLS,
  TIME_OPTIONS,
  BUDGET_OPTIONS,
  TYPE_OPTIONS,
  generateConcepts,
  type BusinessConcept,
} from "@/lib/wizard-data";

type Step = "skills" | "time" | "budget" | "type" | "generating" | "results" | "building" | "done";

export default function WizardPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("skills");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [selectedTime, setSelectedTime] = useState("");
  const [selectedBudget, setSelectedBudget] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [concepts, setConcepts] = useState<BusinessConcept[]>([]);
  const [chosenConcept, setChosenConcept] = useState<BusinessConcept | null>(null);
  const [buildProgress, setBuildProgress] = useState(0);

  const progress =
    step === "skills" ? 25 :
    step === "time" ? 50 :
    step === "budget" ? 75 :
    step === "type" ? 90 :
    100;

  function toggleSkill(id: string) {
    setSelectedSkills((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : prev.length < 5 ? [...prev, id] : prev
    );
  }

  function handleTimeSelect(id: string) {
    setSelectedTime(id);
    setTimeout(() => setStep("budget"), 300);
  }

  function handleBudgetSelect(id: string) {
    setSelectedBudget(id);
    setTimeout(() => setStep("type"), 300);
  }

  function handleTypeSelect(id: string) {
    setSelectedType(id);
    setStep("generating");
  }

  // Generate concepts
  useEffect(() => {
    if (step !== "generating") return;
    const timer = setTimeout(() => {
      const results = generateConcepts(selectedSkills, selectedTime, selectedBudget, selectedType);
      setConcepts(results);
      setStep("results");
    }, 2500);
    return () => clearTimeout(timer);
  }, [step, selectedSkills, selectedTime, selectedBudget, selectedType]);

  // Build animation
  useEffect(() => {
    if (step !== "building") return;
    setBuildProgress(0);
    const interval = setInterval(() => {
      setBuildProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => setStep("done"), 500);
          return 100;
        }
        return prev + 2;
      });
    }, 80);
    return () => clearInterval(interval);
  }, [step]);

  function pickConcept(c: BusinessConcept) {
    setChosenConcept(c);
    setStep("building");
  }

  const buildSteps = [
    { at: 10, label: "Registering domain..." },
    { at: 20, label: "Generating brand identity..." },
    { at: 35, label: "Creating logo & color palette..." },
    { at: 50, label: "Writing website copy..." },
    { at: 65, label: "Building product pages..." },
    { at: 75, label: "Setting up checkout..." },
    { at: 85, label: "Configuring SEO..." },
    { at: 95, label: "Deploying to live URL..." },
  ];

  const currentBuildStep = buildSteps.filter((s) => buildProgress >= s.at).pop();

  return (
    <>
      <Navbar />
      <div className="min-h-screen pt-24 pb-16 px-6">
        <div className="max-w-3xl mx-auto">

          {/* Progress bar */}
          {!["generating", "building", "done"].includes(step) && (
            <div className="mb-12">
              <div className="flex justify-between text-xs text-zinc-600 mb-2">
                <span>Step {step === "skills" ? 1 : step === "time" ? 2 : step === "budget" ? 3 : 4} of 4</span>
                <span>{progress}%</span>
              </div>
              <div className="h-1 rounded-full bg-white/5">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-brand-600 to-purple-500 transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* STEP: Skills */}
          {step === "skills" && (
            <div className="animate-fadeIn">
              <h2 className="text-2xl md:text-4xl font-bold text-white mb-2">What are you good at?</h2>
              <p className="text-zinc-500 mb-8">Pick up to 5 skills. We&apos;ll match you with businesses that use them.</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
                {SKILLS.map((s) => {
                  const active = selectedSkills.includes(s.id);
                  return (
                    <button
                      key={s.id}
                      onClick={() => toggleSkill(s.id)}
                      className={`p-4 rounded-xl text-left transition-all border ${
                        active
                          ? "border-brand-600/50 bg-brand-600/10 text-white"
                          : "border-white/5 bg-surface/50 text-zinc-400 hover:border-white/15"
                      }`}
                    >
                      <span className="text-lg mr-2">{s.icon}</span>
                      <span className="text-sm font-medium">{s.label}</span>
                    </button>
                  );
                })}
              </div>
              <button
                disabled={selectedSkills.length === 0}
                onClick={() => setStep("time")}
                className="btn-primary px-8 py-4 rounded-xl text-base font-bold text-white w-full sm:w-auto"
              >
                Continue ({selectedSkills.length} selected)
              </button>
            </div>
          )}

          {/* STEP: Time */}
          {step === "time" && (
            <div className="animate-fadeIn">
              <h2 className="text-2xl md:text-4xl font-bold text-white mb-2">How much time can you commit?</h2>
              <p className="text-zinc-500 mb-8">This helps us find the right scale for your business.</p>
              <div className="grid gap-3">
                {TIME_OPTIONS.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => handleTimeSelect(t.id)}
                    className={`flex items-center gap-4 p-5 rounded-xl border text-left transition-all ${
                      selectedTime === t.id
                        ? "border-brand-600/50 bg-brand-600/10"
                        : "border-white/5 bg-surface/50 hover:border-white/15"
                    }`}
                  >
                    <span className="text-2xl">{t.icon}</span>
                    <div>
                      <p className="text-white font-semibold">{t.label}</p>
                      <p className="text-zinc-500 text-sm">{t.desc} &middot; {t.hours}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP: Budget */}
          {step === "budget" && (
            <div className="animate-fadeIn">
              <h2 className="text-2xl md:text-4xl font-bold text-white mb-2">What&apos;s your starting budget?</h2>
              <p className="text-zinc-500 mb-8">$0 is totally fine. Seriously.</p>
              <div className="grid gap-3">
                {BUDGET_OPTIONS.map((b) => (
                  <button
                    key={b.id}
                    onClick={() => handleBudgetSelect(b.id)}
                    className={`flex items-center gap-4 p-5 rounded-xl border text-left transition-all ${
                      selectedBudget === b.id
                        ? "border-brand-600/50 bg-brand-600/10"
                        : "border-white/5 bg-surface/50 hover:border-white/15"
                    }`}
                  >
                    <span className="text-2xl">{b.icon}</span>
                    <div>
                      <p className="text-white font-semibold">{b.label}</p>
                      <p className="text-zinc-500 text-sm">{b.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP: Type */}
          {step === "type" && (
            <div className="animate-fadeIn">
              <h2 className="text-2xl md:text-4xl font-bold text-white mb-2">What type of business?</h2>
              <p className="text-zinc-500 mb-8">Or let AI decide based on your profile.</p>
              <div className="grid gap-3">
                {TYPE_OPTIONS.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => handleTypeSelect(t.id)}
                    className={`flex items-center gap-4 p-5 rounded-xl border text-left transition-all ${
                      selectedType === t.id
                        ? "border-brand-600/50 bg-brand-600/10"
                        : "border-white/5 bg-surface/50 hover:border-white/15"
                    }`}
                  >
                    <span className="text-2xl">{t.icon}</span>
                    <div>
                      <p className="text-white font-semibold">{t.label}</p>
                      <p className="text-zinc-500 text-sm">{t.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* GENERATING */}
          {step === "generating" && (
            <div className="flex flex-col items-center justify-center py-20 animate-fadeIn">
              <div className="w-16 h-16 mb-8 relative">
                <div className="absolute inset-0 rounded-full border-2 border-brand-600/20" />
                <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-brand-500 animate-spin" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Analyzing your profile...</h2>
              <p className="text-zinc-500">AI is generating 3 perfect-fit business ideas</p>
            </div>
          )}

          {/* RESULTS */}
          {step === "results" && (
            <div className="animate-fadeIn">
              <div className="text-center mb-10">
                <h2 className="text-2xl md:text-4xl font-bold text-white mb-2">Your top 3 business ideas</h2>
                <p className="text-zinc-500">Tap one to start building it. Right now.</p>
              </div>
              <div className="grid gap-5">
                {concepts.map((c, i) => (
                  <button
                    key={c.name}
                    onClick={() => pickConcept(c)}
                    className="text-left p-6 rounded-xl border border-white/5 bg-surface/50 hover:border-brand-600/40 hover:shadow-[0_0_40px_rgba(76,110,245,0.08)] transition-all animate-fadeIn"
                    style={{ animationDelay: `${i * 150}ms` }}
                  >
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div>
                        <h3 className="text-xl font-bold text-white">{c.name}</h3>
                        <p className="text-brand-400 text-sm font-medium">{c.tagline}</p>
                      </div>
                      <span className="shrink-0 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {c.revenue}
                      </span>
                    </div>
                    <p className="text-zinc-400 text-sm mb-3">{c.desc}</p>
                    <div className="flex flex-wrap gap-4 text-xs text-zinc-500">
                      <span>Startup: {c.startup}</span>
                      <span>Audience: {c.audience}</span>
                      <span className="capitalize">Type: {c.type}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* BUILDING */}
          {step === "building" && chosenConcept && (
            <div className="flex flex-col items-center justify-center py-20 animate-fadeIn">
              <h2 className="text-2xl font-bold text-white mb-2">
                Building {chosenConcept.name}...
              </h2>
              <p className="text-zinc-500 mb-10">{chosenConcept.tagline}</p>
              <div className="w-full max-w-md mb-6">
                <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-brand-600 to-purple-500 transition-all duration-300"
                    style={{ width: `${buildProgress}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-zinc-600 mt-2">
                  <span>{currentBuildStep?.label ?? "Initializing..."}</span>
                  <span>{buildProgress}%</span>
                </div>
              </div>
            </div>
          )}

          {/* DONE */}
          {step === "done" && chosenConcept && (
            <div className="text-center py-16 animate-fadeIn">
              <div className="text-5xl mb-6">&#127881;</div>
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
                {chosenConcept.name} is live!
              </h2>
              <p className="text-zinc-400 text-lg mb-2">Your business has been deployed and is ready to go.</p>
              <p className="text-brand-400 font-mono text-sm mb-10">
                https://{chosenConcept.name.toLowerCase().replace(/\s/g, "")}.nomistakes.ai
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/dashboard"
                  className="btn-primary px-8 py-4 rounded-xl text-base font-bold text-white w-full sm:w-auto text-center"
                >
                  Go to Dashboard
                </Link>
                <button
                  onClick={() => {
                    setStep("skills");
                    setSelectedSkills([]);
                    setSelectedTime("");
                    setSelectedBudget("");
                    setSelectedType("");
                    setConcepts([]);
                    setChosenConcept(null);
                  }}
                  className="btn-secondary px-8 py-4 rounded-xl text-base font-medium text-zinc-300 w-full sm:w-auto text-center"
                >
                  Start Over
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
