"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
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

const FEATURES = [
  { title: "Your own booking link", desc: "Clients book directly. No back-and-forth emails, no Calendly subscription.", accent: C.gold },
  { title: "AI-written proposals", desc: "Describe the project. Kovra writes the proposal — deliverables, timeline, pricing.", accent: "#3B82F6" },
  { title: "E-signed contracts", desc: "Legally binding. Client signs from any device. Auto-stored forever.", accent: "#22C55E" },
  { title: "Online invoicing", desc: "Send invoices, collect payment via card or bank. Deposits and payment plans built in.", accent: "#8B5CF6" },
  { title: "Client portal", desc: "Clients see their projects, files, and invoices in one clean, professional place.", accent: "#F97316" },
  { title: "AI website", desc: "A full professional site generated in 4 minutes. Custom domain included.", accent: C.gold },
];

const BEFORE_AFTER = [
  { before: "5 separate tools for one client", after: "One platform, everything connected" },
  { before: "$280+/mo in subscriptions", after: "$79/mo, all features included" },
  { before: "No professional website", after: "Site live in 4 minutes" },
  { before: "Manual follow-up emails", after: "Automated reminders and re-engagement" },
  { before: "PDF invoices sent by email", after: "Online payment with auto-receipts" },
];

const ROLES = [
  "Designer", "Developer", "Photographer", "Copywriter",
  "Consultant", "Coach", "Social Media Manager", "Videographer",
  "VA", "Brand Strategist", "Web Designer", "Content Creator",
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

function BuildWizard({ isMobile }: { isMobile: boolean }) {
  const [step, setStep] = useState(0);
  const [type, setType] = useState("");
  const [name, setName] = useState("");
  const [tagline, setTagline] = useState("");
  const selectedType = BIZ_TYPES.find(b => b.id === type);
  const displayName = name.trim() || "Your Business";
  const signupUrl = `/auth/signup?biz_type=${type}&biz_name=${encodeURIComponent(name)}&tagline=${encodeURIComponent(tagline)}`;

  function pickType(id: string) {
    setType(id);
    if (!tagline && TAGLINES[id]) setTagline(TAGLINES[id]);
  }

  const STEPS = ["Your work", "Your brand", "Preview", "Launch"];

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

      {/* Step 0: Pick type */}
      {step === 0 && (
        <div>
          <h3 style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 20, marginBottom: 6, letterSpacing: "-0.025em" }}>What kind of work do you do?</h3>
          <p style={{ fontSize: 13, color: C.textSec, marginBottom: 22 }}>We set everything up based on your answer.</p>
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

      {/* Step 1: Name + tagline */}
      {step === 1 && (
        <div>
          <h3 style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 20, marginBottom: 6, letterSpacing: "-0.025em" }}>Name your business.</h3>
          <p style={{ fontSize: 13, color: C.textSec, marginBottom: 22 }}>You can change this any time.</p>
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
              <p style={{ fontSize: 11, color: C.textDim, marginTop: 5 }}>Pre-filled based on your type — edit it freely.</p>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 22 }}>
            <button onClick={() => setStep(0)} style={{ flex: 1, padding: "13px 0", borderRadius: 9, background: "transparent", border: `1px solid ${C.border}`, color: C.textSec, fontSize: 13, fontWeight: 500, cursor: "pointer", fontFamily: SANS }}>Back</button>
            <button
              onClick={() => setStep(2)}
              style={{
                flex: 3, display: "flex", alignItems: "center", gap: 8, justifyContent: "center",
                background: GRAD, color: C.bg,
                fontFamily: SANS, fontWeight: 700, fontSize: 14,
                padding: "13px 0", borderRadius: 9, cursor: "pointer",
                border: "none",
              }}
            >
              Preview my site <ArrowRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Preview */}
      {step === 2 && (
        <div>
          <h3 style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 20, marginBottom: 6, letterSpacing: "-0.025em" }}>Your site, generated.</h3>
          <p style={{ fontSize: 13, color: C.textSec, marginBottom: 20 }}>Full site goes live when you create your account.</p>
          {/* Browser mock */}
          <div style={{ borderRadius: 10, border: `1px solid ${C.border}`, overflow: "hidden", background: "#08080C" }}>
            <div style={{ background: "#0A0A0E", padding: "8px 14px", display: "flex", alignItems: "center", gap: 10, borderBottom: `1px solid ${C.border}` }}>
              <div style={{ display: "flex", gap: 5 }}>
                {["#EF4444", "#F59E0B", "#22C55E"].map(col => <div key={col} style={{ width: 8, height: 8, borderRadius: "50%", background: col, opacity: 0.5 }} />)}
              </div>
              <div style={{ flex: 1, background: "rgba(255,255,255,0.04)", borderRadius: 4, padding: "4px 10px", fontSize: 10, color: C.textDim }}>
                kovra.site/{displayName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}
              </div>
            </div>
            <div style={{ padding: 22 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{displayName}</span>
                <div style={{ display: "flex", gap: 14 }}>
                  {["Services", "Work", "Book"].map(l => <span key={l} style={{ fontSize: 10, color: C.textSec }}>{l}</span>)}
                </div>
              </div>
              <h2 style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: isMobile ? 18 : 22, letterSpacing: "-0.03em", lineHeight: 1.15, marginBottom: 8 }}>
                {(tagline || TAGLINES[type] || "Professional services that deliver results.").split(".")[0] + "."}
              </h2>
              <p style={{ fontSize: 11, color: C.textSec, maxWidth: 260, marginBottom: 16 }}>
                Book a free discovery call. Get a proposal the same day.
              </p>
              <div style={{ display: "flex", gap: 8 }}>
                <div style={{ background: GRAD, color: C.bg, fontSize: 10, fontWeight: 700, padding: "7px 14px", borderRadius: 6 }}>Book a call</div>
                <div style={{ border: `1px solid ${C.border}`, fontSize: 10, color: C.textSec, padding: "7px 14px", borderRadius: 6 }}>See my work</div>
              </div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 18 }}>
            <button onClick={() => setStep(1)} style={{ flex: 1, padding: "13px 0", borderRadius: 9, background: "transparent", border: `1px solid ${C.border}`, color: C.textSec, fontSize: 13, fontWeight: 500, cursor: "pointer", fontFamily: SANS }}>Edit</button>
            <button
              onClick={() => setStep(3)}
              style={{
                flex: 3, display: "flex", alignItems: "center", gap: 8, justifyContent: "center",
                background: GRAD, color: C.bg,
                fontFamily: SANS, fontWeight: 700, fontSize: 14,
                padding: "13px 0", borderRadius: 9, cursor: "pointer", border: "none",
              }}
            >
              Looks good <ArrowRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Launch */}
      {step === 3 && (
        <div style={{ textAlign: "center" }}>
          <div style={{ width: 52, height: 52, borderRadius: "50%", background: C.goldDim, border: `1.5px solid ${C.goldBorder}`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
            <Logo size={22} />
          </div>
          <h3 style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 22, letterSpacing: "-0.03em", marginBottom: 10, lineHeight: 1.15 }}>
            {name.trim() ? `${name} is ready to launch.` : `Your ${selectedType?.label.toLowerCase() || "service"} business is ready.`}
          </h3>
          <p style={{ fontSize: 13, color: C.textSec, lineHeight: 1.65, marginBottom: 6, maxWidth: 380, margin: "0 auto 6px" }}>
            Website, booking link, proposals, contracts, invoicing — all set up, free to start.
          </p>
          <p style={{ fontSize: 12, color: C.textDim, marginBottom: 30 }}>No card required.</p>
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
            Create my free account <ArrowRight size={14} />
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

export default function StartPage() {
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
        .feat-card { transition: border-color 0.2s, background 0.2s; }
        .feat-card:hover { border-color: rgba(255,255,255,0.14) !important; background: rgba(255,255,255,0.03) !important; }

        @media (max-width: 768px) {
          .feats-grid { grid-template-columns: 1fr !important; }
          .ba-grid { grid-template-columns: 1fr !important; }
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
              {[["Features", "#features"], ["Pricing", "#pricing"]].map(([l, h]) => (
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
            }}>Get started</Link>
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
          {[["Features", "#features"], ["Pricing", "#pricing"], ["Sign in", "/auth/login"]].map(([l, h]) => (
            <a key={l} href={h} onClick={() => setMenuOpen(false)} style={{ fontFamily: DISPLAY, fontSize: 32, fontWeight: 700, color: C.text, letterSpacing: "-0.04em" }}>{l}</a>
          ))}
        </div>
      )}

      {/* ─── HERO ─── */}
      <section style={{ position: "relative", minHeight: "88vh", display: "flex", alignItems: "center", overflow: "hidden" }}>
        {/* Atmosphere */}
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
          <div style={{ position: "absolute", top: "-20%", left: "50%", transform: "translateX(-50%)", width: "130%", height: "80%", background: "radial-gradient(ellipse at 50% 0%, rgba(200,164,78,0.15) 0%, transparent 65%)", filter: "blur(60px)" }} />
          <div style={{ position: "absolute", top: "10%", left: "-20%", width: "60%", height: "100%", background: "radial-gradient(ellipse at center, rgba(139,92,246,0.09) 0%, transparent 65%)", filter: "blur(80px)" }} />
          <div style={{ position: "absolute", inset: 0, opacity: 0.025, backgroundImage: "linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)", backgroundSize: "80px 80px" }} />
        </div>

        <div style={{ position: "relative", zIndex: 1, maxWidth: 1160, margin: "0 auto", width: "100%", padding: "140px clamp(20px, 5vw, 56px) 80px" }}>
          {/* Badge */}
          <div className="a1" style={{ display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 36, background: C.goldDim, border: `1px solid ${C.goldBorder}`, borderRadius: 100, padding: "6px 16px" }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: C.gold, flexShrink: 0 }} />
            <span style={{ fontSize: 12, fontWeight: 500, color: C.gold, letterSpacing: "0.02em" }}>Built for people going independent</span>
          </div>

          {/* Headline */}
          <h1 className="a2" style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: isMobile ? "clamp(2.2rem, 9vw, 3.2rem)" : "clamp(2.8rem, 5vw, 4.4rem)", lineHeight: 1.0, letterSpacing: "-0.03em", maxWidth: 680, marginBottom: 24 }}>
            <span style={{ background: "linear-gradient(175deg, #F2F2F5 0%, rgba(242,242,245,0.55) 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              Your skills were always<br />worth more than{" "}
            </span>
            <span style={{ background: GRAD, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>a salary.</span>
          </h1>

          {/* Sub */}
          <p className="a3" style={{ fontSize: "clamp(1rem, 2vw, 1.15rem)", lineHeight: 1.7, color: C.textSec, maxWidth: 500, marginBottom: 44 }}>
            Kovra gives you everything to launch, run, and grow a solo service business — before you ever quit your 9-5.
          </p>

          {/* CTAs */}
          <div className="a4" style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <a href="#wizard" className="btn-cta" style={{
              display: "inline-flex", alignItems: "center", gap: 10,
              fontFamily: SANS, fontWeight: 700, fontSize: 14, color: "#07070A",
              background: GRAD, padding: "14px 28px", borderRadius: 9,
              boxShadow: "0 6px 28px rgba(200,164,78,0.30)",
            }}>
              Build my business <ArrowRight size={15} />
            </a>
            <a href="#features" className="btn-ghost" style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              fontWeight: 500, fontSize: 14, color: C.text,
              background: "rgba(255,255,255,0.04)", border: `1px solid ${C.border}`,
              padding: "14px 28px", borderRadius: 9,
            }}>
              See what&apos;s included
            </a>
          </div>
          <p className="a4" style={{ fontSize: 12, color: C.textDim, marginTop: 22 }}>15 free credits · No card required · Setup in 4 minutes</p>
        </div>
      </section>

      {/* ─── ROLE TICKER ─── */}
      <section style={{ borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}`, padding: "32px 0", overflow: "hidden" }}>
        <div style={{ display: "flex", alignItems: "center" }}>
          <div style={{ flexShrink: 0, padding: "0 clamp(20px, 4vw, 48px)", borderRight: `1px solid ${C.border}` }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: C.textDim, letterSpacing: "0.1em", textTransform: "uppercase", whiteSpace: "nowrap" }}>
              Built for
            </p>
          </div>
          <div style={{ flex: 1, overflow: "hidden", position: "relative" }}>
            <InfiniteSlider speed={32} gap={48}>
              {ROLES.map(r => (
                <span key={r} style={{ fontFamily: DISPLAY, fontSize: 14, fontWeight: 700, color: C.textDim, letterSpacing: "-0.02em", paddingRight: 8 }}>{r}</span>
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
            <span style={{ fontSize: 11, fontWeight: 700, color: C.gold, letterSpacing: "0.12em", textTransform: "uppercase" }}>Launch in 4 steps</span>
            <h2 style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: "clamp(1.8rem, 3vw, 2.6rem)", letterSpacing: "-0.03em", lineHeight: 1.08, marginTop: 10, marginBottom: 10 }}>
              Build it here. Run it on Kovra.
            </h2>
            <p style={{ fontSize: 15, color: C.textSec }}>Pick your work, name your business, get a preview — then sign up.</p>
          </div>
          <BuildWizard isMobile={isMobile} />
        </div>
      </section>

      {/* ─── FEATURES ─── */}
      <section id="features" style={{ padding: "100px clamp(20px, 5vw, 56px)", background: C.surface, borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}` }}>
        <div style={{ maxWidth: 1160, margin: "0 auto" }}>
          <div style={{ marginBottom: 56 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: C.gold, letterSpacing: "0.12em", textTransform: "uppercase" }}>What&apos;s included</span>
            <h2 style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: "clamp(1.8rem, 3vw, 2.6rem)", letterSpacing: "-0.03em", lineHeight: 1.08, marginTop: 10 }}>
              Everything a solo business needs.<br />
              <span style={{ color: C.textSec, fontWeight: 400 }}>Nothing you don&apos;t.</span>
            </h2>
          </div>
          <div className="feats-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
            {FEATURES.map(f => (
              <div key={f.title} className="feat-card" style={{
                background: "rgba(255,255,255,0.02)", border: `1px solid ${C.border}`,
                borderRadius: 12, padding: 24,
              }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: f.accent + "14", border: `1px solid ${f.accent}28`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: f.accent }} />
                </div>
                <h3 style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 16, letterSpacing: "-0.02em", marginBottom: 8 }}>{f.title}</h3>
                <p style={{ fontSize: 13, color: C.textSec, lineHeight: 1.6 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── BEFORE / AFTER ─── */}
      <section id="pricing" style={{ padding: "100px clamp(20px, 5vw, 56px)" }}>
        <div style={{ maxWidth: 1160, margin: "0 auto" }}>
          <div style={{ marginBottom: 56, textAlign: "center" }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: C.gold, letterSpacing: "0.12em", textTransform: "uppercase" }}>The difference</span>
            <h2 style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: "clamp(1.8rem, 3vw, 2.6rem)", letterSpacing: "-0.03em", lineHeight: 1.08, marginTop: 10 }}>
              Before Kovra vs. after.
            </h2>
          </div>
          <div className="ba-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, maxWidth: 840, margin: "0 auto" }}>
            {/* Before */}
            <div style={{ background: "rgba(239,68,68,0.04)", border: "1px solid rgba(239,68,68,0.12)", borderRadius: 14, padding: 28 }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: "#EF4444", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 20 }}>Before</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {BEFORE_AFTER.map(row => (
                  <div key={row.before} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                    <span style={{ color: "#EF4444", fontSize: 13, flexShrink: 0, marginTop: 2 }}>✕</span>
                    <span style={{ fontSize: 13, color: C.textSec, lineHeight: 1.5 }}>{row.before}</span>
                  </div>
                ))}
              </div>
            </div>
            {/* After */}
            <div style={{ background: C.goldDim, border: `1px solid ${C.goldBorder}`, borderRadius: 14, padding: 28 }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: C.gold, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 20 }}>After Kovra</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {BEFORE_AFTER.map(row => (
                  <div key={row.after} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                    <Check size={13} color={C.gold} strokeWidth={2.5} style={{ flexShrink: 0, marginTop: 2 }} />
                    <span style={{ fontSize: 13, color: C.text, lineHeight: 1.5 }}>{row.after}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Mini pricing note */}
          <div style={{ textAlign: "center", marginTop: 60 }}>
            <p style={{ fontSize: 14, color: C.textSec, marginBottom: 6 }}>
              Free to start. <span style={{ color: C.text }}>$79/mo</span> when you&apos;re ready for proposals, contracts, and payments.
            </p>
            <Link href="/#pricing" style={{ fontSize: 13, color: C.gold, fontWeight: 600 }}>
              See full pricing →
            </Link>
          </div>
        </div>
      </section>

      {/* ─── FINAL CTA ─── */}
      <section style={{ padding: "120px clamp(20px, 5vw, 56px)", position: "relative", overflow: "hidden", borderTop: `1px solid ${C.border}` }}>
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none", background: "radial-gradient(ellipse 80% 70% at 50% 50%, rgba(200,164,78,0.09) 0%, transparent 70%)" }} />
        <div style={{ position: "relative", maxWidth: 640, margin: "0 auto", textAlign: "center" }}>
          <h2 style={{ fontFamily: DISPLAY, fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1.08, fontSize: "clamp(1.8rem, 3.5vw, 3rem)", marginBottom: 20 }}>
            <span style={{ background: "linear-gradient(175deg, #F2F2F5 0%, rgba(242,242,245,0.55) 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>You built the skills. </span>
            <span style={{ background: GRAD, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>We built the business.</span>
          </h2>
          <p style={{ fontSize: 15, color: C.textSec, lineHeight: 1.7, marginBottom: 40 }}>
            Start free. Set up in 4 minutes. Your booking link, website, and first proposal ready before the day is over.
          </p>
          <a href="#wizard" className="btn-cta" style={{
            display: "inline-flex", alignItems: "center", gap: 10,
            fontFamily: SANS, fontWeight: 700, fontSize: 15, color: "#07070A",
            background: GRAD, padding: "16px 36px", borderRadius: 10,
            boxShadow: "0 8px 40px rgba(200,164,78,0.28)",
          }}>
            Build my business now <ArrowRight size={16} />
          </a>
          <p style={{ fontSize: 12, color: C.textDim, marginTop: 18 }}>15 free credits on signup. No card needed.</p>
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
