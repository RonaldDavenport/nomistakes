"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useBusinessContext } from "./BusinessProvider";

const TOUR_STEPS = [
  {
    title: "Welcome to your dashboard!",
    description:
      "This is your business command center. Everything you need to launch and grow is right here.",
    icon: "rocket",
  },
  {
    title: "Your Launch Checklist",
    description:
      "We built a personalized step-by-step plan based on your business type. Complete tasks to launch faster — AI handles the heavy lifting.",
    icon: "checklist",
  },
  {
    title: "AI Coach",
    description:
      "Your AI coach knows your business inside out — products, audience, pricing, everything. Ask it to write emails, review strategy, or create content.",
    icon: "chat",
    link: "chat",
  },
  {
    title: "You're all set!",
    description:
      "Start with the first task in your checklist. Each one is designed to move you closer to your first customer.",
    icon: "flag",
  },
];

export function WelcomeTour() {
  const { business } = useBusinessContext();
  const [step, setStep] = useState(0);
  const [dismissed, setDismissed] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!business) return;
    const key = `nm_tour_${business.id}`;
    if (localStorage.getItem(key)) {
      setDismissed(true);
    } else {
      setVisible(true);
    }
  }, [business]);

  if (dismissed || !visible || !business) return null;

  function dismiss() {
    localStorage.setItem(`nm_tour_${business!.id}`, "1");
    setDismissed(true);
  }

  const current = TOUR_STEPS[step];
  const isLast = step === TOUR_STEPS.length - 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md mx-4 rounded-2xl border border-white/10 bg-[#0e0e14] p-6 sm:p-8 shadow-2xl">
        {/* Progress dots */}
        <div className="flex gap-1.5 mb-6">
          {TOUR_STEPS.map((_, i) => (
            <div
              key={i}
              className={`h-1 rounded-full flex-1 transition-all ${
                i <= step ? "bg-brand-500" : "bg-white/10"
              }`}
            />
          ))}
        </div>

        {/* Icon */}
        <div className="w-12 h-12 rounded-xl bg-brand-600/10 flex items-center justify-center mb-4">
          {current.icon === "rocket" && (
            <svg className="w-6 h-6 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
            </svg>
          )}
          {current.icon === "checklist" && (
            <svg className="w-6 h-6 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
          {current.icon === "chat" && (
            <svg className="w-6 h-6 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
            </svg>
          )}
          {current.icon === "flag" && (
            <svg className="w-6 h-6 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 3v1.5M3 21v-6m0 0l2.77-.693a9 9 0 016.208.682l.108.054a9 9 0 006.086.71l3.114-.732a48.524 48.524 0 01-.005-10.499l-3.11.732a9 9 0 01-6.085-.711l-.108-.054a9 9 0 00-6.208-.682L3 4.5M3 15V4.5" />
            </svg>
          )}
        </div>

        <h2 className="text-xl font-bold text-white mb-2">{current.title}</h2>
        <p className="text-zinc-400 text-sm leading-relaxed mb-6">
          {current.description}
        </p>

        <div className="flex items-center justify-between">
          <button
            onClick={dismiss}
            className="text-xs text-zinc-600 hover:text-zinc-400 transition"
          >
            Skip tour
          </button>
          <div className="flex gap-2">
            {step > 0 && (
              <button
                onClick={() => setStep((s) => s - 1)}
                className="px-4 py-2 rounded-lg text-sm font-medium text-zinc-400 border border-white/5 hover:border-white/10 transition"
              >
                Back
              </button>
            )}
            {isLast ? (
              <button
                onClick={dismiss}
                className="btn-primary px-6 py-2 rounded-lg text-sm font-semibold text-white"
              >
                Get Started
              </button>
            ) : (
              <button
                onClick={() => setStep((s) => s + 1)}
                className="btn-primary px-6 py-2 rounded-lg text-sm font-semibold text-white"
              >
                Next
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
