"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, Check, X } from "lucide-react";
import { InfiniteSlider } from "@/components/ui/infinite-slider";

const DISPLAY = "'DM Sans', -apple-system, sans-serif";
const SANS = DISPLAY;
const GRAD = "linear-gradient(135deg, #C8A44E 0%, #E8C56E 60%, #C8A44E 100%)";

const C = {
  bg: "#07070A",
  surface: "#0F0F13",
  gold: "#C8A44E",
  goldDim: "rgba(200,164,78,0.10)",
  goldBorder: "rgba(200,164,78,0.22)",
  text: "#F2F2F5",
  textSec: "#9A9AA8",
  textDim: "#4A4A58",
  border: "rgba(255,255,255,0.07)",
};

const BIZ_TYPES = [
  { id: "designer",   label: "Designer",        avg: "$4,500 per project" },
  { id: "copywriter", label: "Copywriter",       avg: "$2,000/mo" },
  { id: "photo",      label: "Photographer",     avg: "$1,800 per session" },
  { id: "developer",  label: "Developer",        avg: "$6,000 per project" },
  { id: "consultant", label: "Consultant",       avg: "$5,000 per engagement" },
  { id: "coach",      label: "Coach",            avg: "$3,000/mo" },
  { id: "social",     label: "Social Media Mgr", avg: "$1,500/mo" },
  { id: "other",      label: "Something else",   avg: "your own rates" },
];

const TAGLINES: Record<string, string> = {
  designer:   "Brand identity and visual design for businesses that want to stand out.",
  copywriter: "Conversion copy for SaaS, e-commerce, and growing brands.",
  photo:      "Commercial and editorial photography for brands and publications.",
  developer:  "Custom web development and product engineering.",
  consultant: "Strategy consulting for growth-stage companies.",
  coach:      "Life and business coaching for ambitious professionals.",
  social:     "Social media management that turns followers into paying clients.",
  other:      "Professional services that deliver real, measurable results.",
};

const NAME_PLACEHOLDERS: Record<string, string> = {
  designer:   "e.g. Studio Park",
  copywriter: "e.g. Clear Copy Co.",
  photo:      "e.g. Frames by Jordan",
  developer:  "e.g. Forge Labs",
  consultant: "e.g. Peak Advisory",
  coach:      "e.g. Peak Performance",
  social:     "e.g. Signal Creative",
  other:      "e.g. Your Business Name",
};

const TOOLS = [
  "Calendly", "Dubsado", "HoneyBook", "DocuSign",
  "Toggl", "Dropbox", "Pipedrive", "Typeform",
  "ManyChat", "FreshBooks", "Acuity", "17hats",
];

type WebsitePath = "keep" | "rebuild" | "new" | "";

const COMPARISON_ROWS = [
  { feature: "Booking link",       kovra: true,  calendly: true,  dubsado: true,  stack: true  },
  { feature: "CRM / pipeline",     kovra: true,  calendly: false, dubsado: true,  stack: true  },
  { feature: "Proposals",          kovra: true,  calendly: false, dubsado: true,  stack: true  },
  { feature: "E-signatures",       kovra: true,  calendly: false, dubsado: true,  stack: true  },
  { feature: "Invoicing",          kovra: true,  calendly: false, dubsado: "partial", stack: true },
  { feature: "Project management", kovra: true,  calendly: false, dubsado: true,  stack: true  },
  { feature: "AI website",         kovra: true,  calendly: false, dubsado: false, stack: false },
  { feature: "AI writing",         kovra: true,  calendly: false, dubsado: false, stack: false },
  { feature: "Monthly cost",       kovra: "$79", calendly: "$16+", dubsado: "$200+", stack: "$300+" },
];

function useScrolled(offset = 24) {
  const [v, setV] = useState(false);
  useEffect(() => {
    const fn = () => setV(window.scrollY > offset);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, [offset]);
  return v;
}

function useIsMobile(bp = 768) {
  const [v, setV] = useState(false);
  useEffect(() => {
    const fn = () => setV(window.innerWidth < bp);
    fn();
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, [bp]);
  return v;
}

function Logo({ size = 24, dim = false }: { size?: number; dim?: boolean }) {
  return (
    <svg width={size} height={Math.round(size * 88 / 80)} viewBox="0 0 80 88" fill="none">
      <path d="M40 4C40 4 14 16 14 38C14 54 26 62 32 65.5C34.5 67 36 69 36 72V80C36 82.5 37.5 84 40 84C42.5 84 44 82.5 44 80V72C44 69 45.5 67 48 65.5C54 62 66 54 66 38C66 16 40 4 40 4Z" fill={dim ? "rgba(200,164,78,0.5)" : "#C8A44E"} />
      <circle cx="33" cy="35" r="3.5" fill="#07070A" />
      <circle cx="47" cy="35" r="3.5" fill="#07070A" />
    </svg>
  );
}

function CompCell({ value }: { value: boolean | string | "partial" }) {
  if (value === true) return <Check size={15} color={C.gold} strokeWidth={2.5} />;
  if (value === false) return <X size={15} color={C.textDim} strokeWidth={2} />;
  if (value === "partial") return <span style={{ fontSize: 11, color: "#F59E0B", fontWeight: 600 }}>Partial</span>;
  return <span style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{value as string}</span>;
}

function SwitchWizard({ isMobile }: { isMobile: boolean }) {
  const [step, setStep] = useState(0);
  const [type, setType] = useState("");
  const [websitePath, setWebsitePath] = useState<WebsitePath>("");
  const [currentDomain, setCurrentDomain] = useState("");
  const [name, setName] = useState("");
  const [tagline, setTagline] = useState("");

  const selectedType = BIZ_TYPES.find(b => b.id === type);
  const displayName = name.trim() || "Your Business";
  const signupUrl = `/auth/signup?biz_type=${type}&website_path=${websitePath}&biz_name=${encodeURIComponent(name)}&tagline=${encodeURIComponent(tagline)}&domain=${encodeURIComponent(currentDomain)}`;

  function pickType(id: string) {
    setType(id);
    if (!tagline && TAGLINES[id]) setTagline(TAGLINES[id]);
  }

  function pickPath(path: WebsitePath) {
    setWebsitePath(path);
    setStep(2);
  }

  // Step labels change based on path
  const stepLabel3 = websitePath === "keep" ? "Confirm" : websitePath === "rebuild" ? "Your brand" : websitePath === "new" ? "Your brand" : "Details";

  const STEPS = ["Your work", "Your website", stepLabel3, "Switch"];

  return (
    <div style={{
      maxWidth: 600, margin: "0 auto",
      background: C.surface, border: `1px solid ${C.border}`,
      borderRadius: 16, padding: isMobile ? 24 : 40,
    }}>
      {/* Progress */}
      <div style={{ display: "flex", alignItems: "center", marginBottom: 36 }}>
        {STEPS.map((label, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", flex: i < STEPS.length - 1 ? 1 : 0 }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
              <div style={{
                width: 26, height: 26, borderRadius: "50%",
                background: i < step ? C.gold : i === step ? C.goldDim : "transparent",
                border: `1.5px solid ${i <= step ? C.gold : C.border}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
              }}>
                {i < step
                  ? <Check size={11} color={C.bg} strokeWidth={3} />
                  : <span style={{ fontSize: 10, fontWeight: 700, color: i === step ? C.gold : C.textDim }}>{i + 1}</span>
                }
              </div>
              <span style={{ fontSize: 9, fontWeight: i === step ? 700 : 400, color: i === step ? C.text : C.textDim, whiteSpace: "nowrap" }}>{label}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div style={{ flex: 1, height: 1, background: i < step ? C.gold : C.border, margin: "0 6px", marginBottom: 14, transition: "background 0.3s" }} />
            )}
          </div>
        ))}
      </div>

      {/* Step 0: Pick business type */}
      {step === 0 && (
        <div>
          <h3 style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 20, marginBottom: 6, letterSpacing: "-0.025em" }}>What kind of work do you do?</h3>
          <p style={{ fontSize: 13, color: C.textSec, marginBottom: 22 }}>We set up the right tools for your business type.</p>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(4, 1fr)", gap: 8 }}>
            {BIZ_TYPES.map(b => (
              <button
                key={b.id}
                onClick={() => pickType(b.id)}
                style={{
                  background: type === b.id ? C.goldDim : "rgba(255,255,255,0.02)",
                  border: `1.5px solid ${type === b.id ? C.goldBorder : C.border}`,
                  borderRadius: 9, padding: "12px 8px",
                  color: type === b.id ? C.gold : C.textSec,
                  fontSize: 12, fontWeight: type === b.id ? 700 : 500,
                  cursor: "pointer", transition: "all 0.15s",
                  fontFamily: SANS,
                }}
              >{b.label}</button>
            ))}
          </div>
          {type && (
            <p style={{ fontSize: 12, color: C.textSec, marginTop: 14 }}>
              <span style={{ color: C.gold, fontWeight: 600 }}>{selectedType?.avg}</span>{" "}
              — average for {selectedType?.label.toLowerCase()}s on Kovra.
            </p>
          )}
          <button
            onClick={() => type && setStep(1)}
            disabled={!type}
            style={{
              display: "flex", alignItems: "center", gap: 8, justifyContent: "center",
              width: "100%", marginTop: 20,
              background: type ? GRAD : "rgba(255,255,255,0.04)",
              border: type ? "none" : `1px solid ${C.border}`,
              color: type ? C.bg : C.textDim,
              fontFamily: SANS, fontWeight: 700, fontSize: 14,
              padding: "13px 0", borderRadius: 9,
              cursor: type ? "pointer" : "not-allowed",
              transition: "all 0.2s",
            }}
          >
            Continue <ArrowRight size={14} />
          </button>
        </div>
      )}

      {/* Step 1: Website question — 3 paths */}
      {step === 1 && (
        <div>
          <h3 style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 20, marginBottom: 6, letterSpacing: "-0.025em" }}>Do you have a website?</h3>
          <p style={{ fontSize: 13, color: C.textSec, marginBottom: 24 }}>We&apos;ll handle the migration or build you a new one.</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              { path: "keep" as WebsitePath, title: "Yes — bring it over", desc: "Connect your existing domain. We import your content." },
              { path: "rebuild" as WebsitePath, title: "Yes — but I need a better one", desc: "We generate a new site and redirect your old domain." },
              { path: "new" as WebsitePath, title: "No — build me one from scratch", desc: "4 minutes to a professional site. Custom domain included." },
            ].map(opt => (
              <button
                key={opt.path}
                onClick={() => pickPath(opt.path)}
                style={{
                  display: "flex", flexDirection: "column", alignItems: "flex-start",
                  background: websitePath === opt.path ? C.goldDim : "rgba(255,255,255,0.02)",
                  border: `1.5px solid ${websitePath === opt.path ? C.goldBorder : C.border}`,
                  borderRadius: 10, padding: "14px 16px",
                  cursor: "pointer", transition: "all 0.15s", textAlign: "left",
                  fontFamily: SANS,
                }}
              >
                <span style={{ fontSize: 14, fontWeight: 600, color: websitePath === opt.path ? C.gold : C.text, marginBottom: 3 }}>{opt.title}</span>
                <span style={{ fontSize: 12, color: C.textSec }}>{opt.desc}</span>
              </button>
            ))}
          </div>
          <button onClick={() => setStep(0)} style={{ width: "100%", marginTop: 16, padding: "11px 0", borderRadius: 9, background: "transparent", border: `1px solid ${C.border}`, color: C.textSec, fontSize: 13, fontWeight: 500, cursor: "pointer", fontFamily: SANS }}>Back</button>
        </div>
      )}

      {/* Step 2: Details based on path */}
      {step === 2 && websitePath === "keep" && (
        <div>
          <h3 style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 20, marginBottom: 6, letterSpacing: "-0.025em" }}>What&apos;s your current domain?</h3>
          <p style={{ fontSize: 13, color: C.textSec, marginBottom: 22 }}>We&apos;ll connect it to your Kovra site on signup.</p>
          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: C.textSec, letterSpacing: "0.06em", textTransform: "uppercase" as const, display: "block", marginBottom: 7 }}>Your domain</label>
            <input
              type="text"
              value={currentDomain}
              onChange={e => setCurrentDomain(e.target.value)}
              autoFocus
              placeholder="e.g. yourname.com"
              style={{
                width: "100%", padding: "12px 14px", borderRadius: 9,
                background: "rgba(255,255,255,0.03)", border: `1.5px solid ${C.border}`,
                color: C.text, fontSize: 14, fontFamily: SANS,
                outline: "none", boxSizing: "border-box" as const,
              }}
            />
            <p style={{ fontSize: 11, color: C.textDim, marginTop: 5 }}>We&apos;ll walk you through DNS setup after signup.</p>
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 22 }}>
            <button onClick={() => setStep(1)} style={{ flex: 1, padding: "13px 0", borderRadius: 9, background: "transparent", border: `1px solid ${C.border}`, color: C.textSec, fontSize: 13, fontWeight: 500, cursor: "pointer", fontFamily: SANS }}>Back</button>
            <button
              onClick={() => setStep(3)}
              style={{
                flex: 3, display: "flex", alignItems: "center", gap: 8, justifyContent: "center",
                background: GRAD, color: C.bg,
                fontFamily: SANS, fontWeight: 700, fontSize: 14,
                padding: "13px 0", borderRadius: 9, cursor: "pointer", border: "none",
              }}
            >
              Continue <ArrowRight size={14} />
            </button>
          </div>
        </div>
      )}

      {step === 2 && (websitePath === "rebuild" || websitePath === "new") && (
        <div>
          <h3 style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 20, marginBottom: 6, letterSpacing: "-0.025em" }}>
            {websitePath === "rebuild" ? "What should the new site say?" : "Name your business."}
          </h3>
          <p style={{ fontSize: 13, color: C.textSec, marginBottom: 22 }}>
            {websitePath === "rebuild" ? "We generate a new site — just give us the basics." : "You can change this any time."}
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: C.textSec, letterSpacing: "0.06em", textTransform: "uppercase" as const, display: "block", marginBottom: 7 }}>Business name</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                autoFocus
                placeholder={NAME_PLACEHOLDERS[type] || "e.g. Your Business Name"}
                style={{
                  width: "100%", padding: "12px 14px", borderRadius: 9,
                  background: "rgba(255,255,255,0.03)", border: `1.5px solid ${C.border}`,
                  color: C.text, fontSize: 14, fontFamily: SANS,
                  outline: "none", boxSizing: "border-box" as const,
                }}
              />
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: C.textSec, letterSpacing: "0.06em", textTransform: "uppercase" as const, display: "block", marginBottom: 7 }}>Tagline</label>
              <textarea
                value={tagline}
                onChange={e => setTagline(e.target.value)}
                rows={2}
                placeholder={TAGLINES[type] || "One-line description of what you do"}
                style={{
                  width: "100%", padding: "12px 14px", borderRadius: 9,
                  background: "rgba(255,255,255,0.03)", border: `1.5px solid ${C.border}`,
                  color: C.text, fontSize: 13, fontFamily: SANS,
                  outline: "none", resize: "none" as const, boxSizing: "border-box" as const,
                }}
              />
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 22 }}>
            <button onClick={() => setStep(1)} style={{ flex: 1, padding: "13px 0", borderRadius: 9, background: "transparent", border: `1px solid ${C.border}`, color: C.textSec, fontSize: 13, fontWeight: 500, cursor: "pointer", fontFamily: SANS }}>Back</button>
            <button
              onClick={() => setStep(3)}
              style={{
                flex: 3, display: "flex", alignItems: "center", gap: 8, justifyContent: "center",
                background: GRAD, color: C.bg,
                fontFamily: SANS, fontWeight: 700, fontSize: 14,
                padding: "13px 0", borderRadius: 9, cursor: "pointer", border: "none",
              }}
            >
              Preview setup <ArrowRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Summary + CTA */}
      {step === 3 && (
        <div style={{ textAlign: "center" }}>
          <div style={{ width: 52, height: 52, borderRadius: "50%", background: C.goldDim, border: `1.5px solid ${C.goldBorder}`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
            <Logo size={22} />
          </div>
          <h3 style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 22, letterSpacing: "-0.03em", marginBottom: 14, lineHeight: 1.15 }}>
            Your Kovra setup is ready.
          </h3>

          {/* Summary card */}
          <div style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${C.border}`, borderRadius: 12, padding: 20, textAlign: "left", marginBottom: 24 }}>
            {[
              { label: "Business type", value: selectedType?.label || type },
              websitePath === "keep" && { label: "Domain", value: currentDomain || "Connecting on signup" },
              (websitePath === "rebuild" || websitePath === "new") && name && { label: "Business", value: name },
              websitePath === "rebuild" && { label: "Website", value: "New site generated, old domain redirected" },
              websitePath === "new" && { label: "Website", value: "New site generated on Kovra" },
              websitePath === "keep" && { label: "Website", value: "Existing site connected to Kovra" },
              { label: "Included", value: "Booking, proposals, contracts, invoicing, CRM" },
            ].filter(Boolean).map((row) => {
              const r = row as { label: string; value: string };
              return (
                <div key={r.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "9px 0", borderBottom: `1px solid ${C.border}` }}>
                  <span style={{ fontSize: 12, color: C.textSec }}>{r.label}</span>
                  <span style={{ fontSize: 12, color: C.text, fontWeight: 500, textAlign: "right", maxWidth: "55%" }}>{r.value}</span>
                </div>
              );
            })}
          </div>

          <Link
            href={signupUrl}
            style={{
              display: "inline-flex", alignItems: "center", gap: 10,
              fontFamily: SANS, fontWeight: 700, fontSize: 14, color: C.bg,
              background: GRAD, padding: "15px 32px", borderRadius: 9,
              boxShadow: "0 6px 32px rgba(200,164,78,0.28)",
              textDecoration: "none",
            }}
          >
            Switch to Kovra — free <ArrowRight size={14} />
          </Link>
          <div style={{ display: "flex", justifyContent: "center", gap: 18, marginTop: 18, flexWrap: "wrap" }}>
            {["15 free credits", "4-min setup", "No card needed"].map(t => (
              <div key={t} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <Check size={11} color={C.gold} strokeWidth={2.5} />
                <span style={{ fontSize: 11, color: C.textDim }}>{t}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function SwitchPage() {
  const scrolled = useScrolled();
  const isMobile = useIsMobile();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div style={{ fontFamily: SANS, background: C.bg, color: C.text, minHeight: "100vh", overflowX: "hidden" }}>

      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        ::selection { background: rgba(200,164,78,0.2); }
        a { text-decoration: none; color: inherit; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(32px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .a1 { animation: fadeUp 1s cubic-bezier(0.16,1,0.3,1) both; }
        .a2 { animation: fadeUp 1s cubic-bezier(0.16,1,0.3,1) 0.1s both; }
        .a3 { animation: fadeUp 1s cubic-bezier(0.16,1,0.3,1) 0.2s both; }
        .a4 { animation: fadeUp 1s cubic-bezier(0.16,1,0.3,1) 0.32s both; }

        .btn-cta { transition: transform 0.18s, box-shadow 0.18s; }
        .btn-cta:hover { transform: translateY(-2px); box-shadow: 0 16px 48px rgba(200,164,78,0.38) !important; }
        .btn-ghost { transition: background 0.15s, border-color 0.15s; }
        .btn-ghost:hover { background: rgba(255,255,255,0.07) !important; border-color: rgba(255,255,255,0.18) !important; }
        .nav-item { transition: color 0.15s; }
        .nav-item:hover { color: #F2F2F5 !important; }
        .comp-row { transition: background 0.15s; }
        .comp-row:hover { background: rgba(255,255,255,0.02) !important; }

        @media (max-width: 768px) {
          .comp-table { font-size: 11px !important; }
          .comp-col-hide { display: none !important; }
        }
      `}</style>

      {/* ─── NAV ─── */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, height: 60,
        display: "flex", alignItems: "center", padding: "0 clamp(20px, 5vw, 56px)",
        background: scrolled ? "rgba(7,7,10,0.92)" : "transparent",
        backdropFilter: scrolled ? "blur(24px)" : "none",
        borderBottom: scrolled ? `1px solid ${C.border}` : "none",
        transition: "background 0.3s, border-color 0.3s",
      }}>
        <div style={{ maxWidth: 1160, width: "100%", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
            <Logo size={24} />
            <span style={{ fontFamily: DISPLAY, fontSize: 16, fontWeight: 700, letterSpacing: "-0.03em" }}>kovra</span>
          </Link>

          {!isMobile && (
            <div style={{ display: "flex", gap: 32 }}>
              {[["Compare", "#compare"], ["Pricing", "#pricing"]].map(([l, h]) => (
                <a key={l} href={h} className="nav-item" style={{ fontFamily: SANS, fontSize: 13, fontWeight: 500, color: C.textSec }}>{l}</a>
              ))}
            </div>
          )}

          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {!isMobile && (
              <Link href="/auth/login" className="btn-ghost" style={{
                fontSize: 13, fontWeight: 500, color: C.textSec,
                padding: "7px 14px", borderRadius: 7, border: "1px solid transparent",
              }}>Sign in</Link>
            )}
            <Link href="/auth/signup" className="btn-cta" style={{
              fontFamily: SANS, fontSize: 13, fontWeight: 700, color: "#07070A",
              background: GRAD, borderRadius: 7, padding: "8px 18px",
              boxShadow: "0 4px 20px rgba(200,164,78,0.25)",
            }}>Switch now</Link>
            {isMobile && (
              <button onClick={() => setMenuOpen(o => !o)} style={{ background: "none", border: "none", color: C.text, cursor: "pointer", padding: 6 }}>
                <svg width="20" height="14" viewBox="0 0 20 14" fill="none">
                  {menuOpen ? (
                    <><line x1="1" y1="1" x2="19" y2="13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /><line x1="19" y1="1" x2="1" y2="13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></>
                  ) : (
                    <><line x1="0" y1="1" x2="20" y2="1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /><line x1="0" y1="7" x2="20" y2="7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /><line x1="0" y1="13" x2="20" y2="13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></>
                  )}
                </svg>
              </button>
            )}
          </div>
        </div>
      </nav>

      {menuOpen && (
        <div style={{ position: "fixed", inset: 0, zIndex: 90, background: "rgba(7,7,10,0.98)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 40 }}>
          {[["Compare", "#compare"], ["Pricing", "#pricing"], ["Sign in", "/auth/login"]].map(([l, h]) => (
            <a key={l} href={h} onClick={() => setMenuOpen(false)} style={{ fontFamily: DISPLAY, fontSize: 32, fontWeight: 700, color: C.text, letterSpacing: "-0.04em" }}>{l}</a>
          ))}
        </div>
      )}

      {/* ─── HERO ─── */}
      <section style={{ position: "relative", minHeight: "88vh", display: "flex", alignItems: "center", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
          <div style={{ position: "absolute", top: "-20%", left: "50%", transform: "translateX(-50%)", width: "130%", height: "80%", background: "radial-gradient(ellipse at 50% 0%, rgba(200,164,78,0.14) 0%, transparent 65%)", filter: "blur(60px)" }} />
          <div style={{ position: "absolute", top: "10%", right: "-20%", width: "60%", height: "100%", background: "radial-gradient(ellipse at center, rgba(59,130,246,0.08) 0%, transparent 65%)", filter: "blur(80px)" }} />
          <div style={{ position: "absolute", inset: 0, opacity: 0.025, backgroundImage: "linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)", backgroundSize: "80px 80px" }} />
        </div>

        <div style={{ position: "relative", zIndex: 1, maxWidth: 1160, margin: "0 auto", width: "100%", padding: "140px clamp(20px, 5vw, 56px) 80px" }}>
          <div className="a1" style={{ display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 36, background: C.goldDim, border: `1px solid ${C.goldBorder}`, borderRadius: 100, padding: "6px 16px" }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: C.gold, flexShrink: 0 }} />
            <span style={{ fontSize: 12, fontWeight: 500, color: C.gold, letterSpacing: "0.02em" }}>Replace your entire stack</span>
          </div>

          <h1 className="a2" style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: isMobile ? "clamp(2.2rem, 9vw, 3.2rem)" : "clamp(2.6rem, 4.8vw, 4.2rem)", lineHeight: 1.0, letterSpacing: "-0.03em", maxWidth: 700, marginBottom: 24 }}>
            <span style={{ background: "linear-gradient(175deg, #F2F2F5 0%, rgba(242,242,245,0.55) 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              You&apos;re already good at what you do.{" "}
            </span>
            <span style={{ background: GRAD, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>Your tools aren&apos;t.</span>
          </h1>

          <p className="a3" style={{ fontSize: "clamp(1rem, 2vw, 1.15rem)", lineHeight: 1.7, color: C.textSec, maxWidth: 500, marginBottom: 44 }}>
            Replace Calendly, Dubsado, DocuSign, and 8 more tools with one platform. $79/mo. Everything included.
          </p>

          <div className="a4" style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <a href="#wizard" className="btn-cta" style={{
              display: "inline-flex", alignItems: "center", gap: 10,
              fontFamily: SANS, fontWeight: 700, fontSize: 14, color: "#07070A",
              background: GRAD, padding: "14px 28px", borderRadius: 9,
              boxShadow: "0 6px 28px rgba(200,164,78,0.30)",
            }}>
              Switch to Kovra <ArrowRight size={15} />
            </a>
            <a href="#compare" className="btn-ghost" style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              fontWeight: 500, fontSize: 14, color: C.text,
              background: "rgba(255,255,255,0.04)", border: `1px solid ${C.border}`,
              padding: "14px 28px", borderRadius: 9,
            }}>
              See the comparison
            </a>
          </div>
          <p className="a4" style={{ fontSize: 12, color: C.textDim, marginTop: 22 }}>15 free credits · No card required · Setup in 4 minutes</p>
        </div>
      </section>

      {/* ─── TOOLS REPLACED (InfiniteSlider) ─── */}
      <section style={{ borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}`, padding: "32px 0", overflow: "hidden" }}>
        <div style={{ display: "flex", alignItems: "center" }}>
          <div style={{ flexShrink: 0, padding: "0 clamp(20px, 4vw, 48px)", borderRight: `1px solid ${C.border}` }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: C.textDim, letterSpacing: "0.1em", textTransform: "uppercase", whiteSpace: "nowrap" }}>
              Replaces all of
            </p>
          </div>
          <div style={{ flex: 1, overflow: "hidden", position: "relative" }}>
            <InfiniteSlider speed={28} gap={56}>
              {TOOLS.map(t => (
                <div key={t} style={{ display: "flex", alignItems: "center", paddingRight: 8 }}>
                  <span style={{ fontFamily: DISPLAY, fontSize: 14, fontWeight: 700, color: C.textDim, letterSpacing: "-0.02em", textDecoration: "line-through", textDecorationColor: "rgba(255,255,255,0.12)" }}>{t}</span>
                </div>
              ))}
            </InfiniteSlider>
            <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 80, background: `linear-gradient(to right, ${C.bg}, transparent)`, pointerEvents: "none" }} />
            <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: 80, background: `linear-gradient(to left, ${C.bg}, transparent)`, pointerEvents: "none" }} />
          </div>
        </div>
      </section>

      {/* ─── WIZARD ─── */}
      <section id="wizard" style={{ padding: "100px clamp(20px, 5vw, 56px)" }}>
        <div style={{ maxWidth: 1160, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 52 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: C.gold, letterSpacing: "0.12em", textTransform: "uppercase" }}>Switch in 4 minutes</span>
            <h2 style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: "clamp(1.8rem, 3vw, 2.6rem)", letterSpacing: "-0.03em", lineHeight: 1.08, marginTop: 10, marginBottom: 10 }}>
              Tell us where you&apos;re starting from.
            </h2>
            <p style={{ fontSize: 15, color: C.textSec }}>We handle the migration. You handle the work.</p>
          </div>
          <SwitchWizard isMobile={isMobile} />
        </div>
      </section>

      {/* ─── COMPARISON TABLE ─── */}
      <section id="compare" style={{ padding: "100px clamp(20px, 5vw, 56px)", background: C.surface, borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}` }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div style={{ marginBottom: 48 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: C.gold, letterSpacing: "0.12em", textTransform: "uppercase" }}>The numbers</span>
            <h2 style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: "clamp(1.8rem, 3vw, 2.6rem)", letterSpacing: "-0.03em", lineHeight: 1.08, marginTop: 10 }}>
              One tool.<br />
              <span style={{ color: C.textSec, fontWeight: 400 }}>Versus the rest.</span>
            </h2>
          </div>

          <div className="comp-table" style={{ fontSize: 13, border: `1px solid ${C.border}`, borderRadius: 14, overflow: "hidden" }}>
            {/* Header */}
            <div style={{ display: "grid", gridTemplateColumns: "1.8fr 1fr 1fr 1fr 1fr", background: "#0A0A0E", borderBottom: `1px solid ${C.border}` }}>
              <div style={{ padding: "14px 20px", fontSize: 11, fontWeight: 600, color: C.textDim, letterSpacing: "0.06em", textTransform: "uppercase" }}>Feature</div>
              {[
                { label: "Kovra", highlight: true },
                { label: "Calendly", highlight: false },
                { label: "Dubsado", highlight: false },
                { label: "11 tools", highlight: false },
              ].map(col => (
                <div key={col.label} style={{ padding: "14px 16px", fontSize: 11, fontWeight: 700, color: col.highlight ? C.gold : C.textSec, letterSpacing: "0.04em", textAlign: "center" }}>{col.label}</div>
              ))}
            </div>

            {/* Rows */}
            {COMPARISON_ROWS.map((row, i) => (
              <div
                key={row.feature}
                className="comp-row"
                style={{
                  display: "grid", gridTemplateColumns: "1.8fr 1fr 1fr 1fr 1fr",
                  borderBottom: i < COMPARISON_ROWS.length - 1 ? `1px solid ${C.border}` : "none",
                  background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.01)",
                }}
              >
                <div style={{ padding: "13px 20px", fontSize: 13, color: C.text, fontWeight: 500 }}>{row.feature}</div>
                {[row.kovra, row.calendly, row.dubsado, row.stack].map((val, ci) => (
                  <div key={ci} style={{
                    padding: "13px 16px", display: "flex", alignItems: "center", justifyContent: "center",
                    background: ci === 0 ? "rgba(200,164,78,0.04)" : "transparent",
                  }}>
                    <CompCell value={val as boolean | string} />
                  </div>
                ))}
              </div>
            ))}
          </div>

          <p style={{ fontSize: 12, color: C.textDim, marginTop: 16, textAlign: "center" }}>
            Calendly $16+/mo · Dubsado $200+/mo · 11 tools combined $300+/mo. Kovra replaces all of them for $79/mo.
          </p>
        </div>
      </section>

      {/* ─── WHAT YOU GAIN ─── */}
      <section style={{ padding: "100px clamp(20px, 5vw, 56px)" }}>
        <div style={{ maxWidth: 1160, margin: "0 auto" }}>
          <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", gap: 64, alignItems: isMobile ? "flex-start" : "center" }}>
            <div style={{ flex: 1 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: C.gold, letterSpacing: "0.12em", textTransform: "uppercase" }}>What you stop paying for</span>
              <h2 style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: "clamp(1.6rem, 2.8vw, 2.4rem)", letterSpacing: "-0.03em", lineHeight: 1.1, marginTop: 10, marginBottom: 24 }}>
                Cancel everything else.
              </h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {[
                  { tool: "Calendly", cost: "$16–192/mo", reason: "Booking link replaced" },
                  { tool: "Dubsado / HoneyBook", cost: "$200+/mo", reason: "CRM + proposals replaced" },
                  { tool: "DocuSign", cost: "$25+/mo", reason: "E-signatures built in" },
                  { tool: "Toggl Track", cost: "$10+/mo", reason: "Time tracking built in" },
                  { tool: "Pipedrive", cost: "$15+/mo", reason: "Pipeline + CRM replaced" },
                ].map(item => (
                  <div key={item.tool} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: `1px solid ${C.border}` }}>
                    <div>
                      <span style={{ fontSize: 13, color: C.text, fontWeight: 500 }}>{item.tool}</span>
                      <p style={{ fontSize: 11, color: C.textDim, marginTop: 2 }}>{item.reason}</p>
                    </div>
                    <span style={{ fontSize: 13, color: "#EF4444", fontWeight: 600, textDecoration: "line-through" }}>{item.cost}</span>
                  </div>
                ))}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0" }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: C.text }}>Total saved</span>
                  <span style={{ fontSize: 16, fontWeight: 800, color: C.gold }}>$220+/mo</span>
                </div>
              </div>
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: 28 }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: C.textSec, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 6 }}>Kovra Starter</p>
                <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 8 }}>
                  <span style={{ fontFamily: DISPLAY, fontSize: 52, fontWeight: 800, letterSpacing: "-0.05em", lineHeight: 1 }}>$79</span>
                  <span style={{ fontSize: 14, color: C.textSec }}>/mo</span>
                </div>
                <p style={{ fontSize: 13, color: C.textSec, marginBottom: 24 }}>Everything. No per-seat fees. No feature gating.</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
                  {["500 credits/mo", "Booking link + intake forms", "Proposals + e-signatures", "Invoicing + payment plans", "Project management + files", "Automations + referral links", "Team accounts (up to 3)", "AI website included"].map(f => (
                    <div key={f} style={{ display: "flex", gap: 9, alignItems: "center" }}>
                      <Check size={12} color={C.gold} strokeWidth={2.5} />
                      <span style={{ fontSize: 12, color: C.textSec }}>{f}</span>
                    </div>
                  ))}
                </div>
                <Link href="/auth/signup" className="btn-cta" style={{
                  display: "block", textAlign: "center",
                  fontFamily: SANS, fontWeight: 700, fontSize: 13, color: C.bg,
                  background: GRAD, borderRadius: 9, padding: "13px 0",
                }}>
                  Start free — no card needed
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FINAL CTA ─── */}
      <section id="pricing" style={{ padding: "120px clamp(20px, 5vw, 56px)", position: "relative", overflow: "hidden", borderTop: `1px solid ${C.border}` }}>
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none", background: "radial-gradient(ellipse 80% 70% at 50% 50%, rgba(200,164,78,0.09) 0%, transparent 70%)" }} />
        <div style={{ position: "relative", maxWidth: 640, margin: "0 auto", textAlign: "center" }}>
          <h2 style={{ fontFamily: DISPLAY, fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1.08, fontSize: "clamp(1.8rem, 3.5vw, 3rem)", marginBottom: 20 }}>
            <span style={{ background: "linear-gradient(175deg, #F2F2F5 0%, rgba(242,242,245,0.55) 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>Switch in 4 minutes. </span>
            <span style={{ background: GRAD, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>Cancel everything else.</span>
          </h2>
          <p style={{ fontSize: 15, color: C.textSec, lineHeight: 1.7, marginBottom: 40 }}>
            You&apos;re already doing the work. Kovra just stops charging you $300/mo in subscriptions to prove it.
          </p>
          <a href="#wizard" className="btn-cta" style={{
            display: "inline-flex", alignItems: "center", gap: 10,
            fontFamily: SANS, fontWeight: 700, fontSize: 15, color: "#07070A",
            background: GRAD, padding: "16px 36px", borderRadius: 10,
            boxShadow: "0 8px 40px rgba(200,164,78,0.28)",
          }}>
            Switch to Kovra <ArrowRight size={16} />
          </a>
          <p style={{ fontSize: 12, color: C.textDim, marginTop: 18 }}>15 free credits on signup. Takes 4 minutes.</p>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer style={{ padding: "40px clamp(20px, 5vw, 56px)", borderTop: `1px solid ${C.border}` }}>
        <div style={{ maxWidth: 1160, margin: "0 auto", display: "flex", flexWrap: "wrap", gap: 20, alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Logo size={20} dim />
            <span style={{ fontFamily: DISPLAY, fontSize: 14, fontWeight: 600, color: C.textSec }}>kovra</span>
          </div>
          <p style={{ fontSize: 12, color: C.textDim }}>© 2026 Kovra. All rights reserved.</p>
          <div style={{ display: "flex", gap: 24 }}>
            {["Privacy", "Terms", "Contact"].map(l => (
              <a key={l} href="#" className="nav-item" style={{ fontSize: 12, color: C.textDim }}>{l}</a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
