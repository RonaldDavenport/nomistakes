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

const TYPES = [
  { label: "Web design",       fill: "I design and build websites. Been doing it on the side and want to turn it into something real" },
  { label: "Consulting",       fill: "I give advice on business and strategy. People pay me to help them figure things out" },
  { label: "Coaching",         fill: "I'm good at helping people work through their goals and get unstuck" },
  { label: "Marketing",        fill: "I do marketing: content, social, ads. I know how to get attention and drive results" },
  { label: "Photography",      fill: "I take photos: portraits, events, brands. Been shooting on the side for years" },
  { label: "Copywriting",      fill: "I write ads, emails, and websites. Good at making words actually work" },
  { label: "Bookkeeping",      fill: "I do bookkeeping. I've been handling finances for years and want to go out on my own" },
  { label: "Fitness training", fill: "I train people. Been doing it informally for years and want to do it properly" },
  { label: "IT & tech",        fill: "I fix and set up tech for people. Computers, networks, software. I figure it out" },
  { label: "Legal services",   fill: "I have a law background and want to offer consulting and advisory work independently" },
  { label: "Interior design",  fill: "I have a good eye for spaces and have been helping friends with their homes" },
  { label: "HR consulting",    fill: "I have an HR background and want to help small companies hire and manage people better" },
];

const ROLES = [
  "Designer", "Developer", "Photographer", "Copywriter",
  "Consultant", "Coach", "Social Media Manager", "Videographer",
  "VA", "Brand Strategist", "Web Designer", "Content Creator",
];

const FEATURES = [
  { title: "Your own booking link", desc: "Clients book directly. No back-and-forth, no Calendly subscription.", accent: C.gold },
  { title: "AI-written proposals", desc: "Describe the project. Kovra writes the proposal — deliverables, timeline, pricing.", accent: "#3B82F6" },
  { title: "E-signed contracts", desc: "Legally binding. Client signs from any device. Auto-stored.", accent: "#22C55E" },
  { title: "Online invoicing", desc: "Send invoices, collect payment via card or bank. Deposits and payment plans built in.", accent: "#8B5CF6" },
  { title: "Client portal", desc: "Clients see their projects, files, and invoices in one clean place.", accent: "#F97316" },
  { title: "AI website", desc: "A full professional site in 4 minutes. Custom domain included.", accent: C.gold },
];

const BEFORE_AFTER = [
  { before: "5 separate tools for one client", after: "One platform, everything connected" },
  { before: "$280+/mo in subscriptions", after: "$79/mo, all features included" },
  { before: "No professional website", after: "Site live in 4 minutes" },
  { before: "Manual follow-up emails", after: "Automated reminders and re-engagement" },
  { before: "PDF invoices sent by email", after: "Online payment with auto-receipts" },
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

// ── Generated site mock ────────────────────────────────────────────────────
function SiteMock({ isMobile }: { isMobile: boolean }) {
  return (
    <div style={{ borderRadius: 12, border: `1px solid ${C.border}`, overflow: "hidden", background: "#06060A" }}>
      {/* Browser chrome */}
      <div style={{ background: "#0A0A0E", padding: "8px 14px", display: "flex", alignItems: "center", gap: 10, borderBottom: `1px solid ${C.border}` }}>
        <div style={{ display: "flex", gap: 5 }}>
          {["#EF4444", "#F59E0B", "#22C55E"].map(col => <div key={col} style={{ width: 7, height: 7, borderRadius: "50%", background: col, opacity: 0.5 }} />)}
        </div>
        <div style={{ flex: 1, background: "rgba(255,255,255,0.04)", borderRadius: 4, padding: "3px 10px", fontSize: 10, color: C.textDim }}>studiopark.com</div>
      </div>
      {/* Site nav */}
      <div style={{ padding: "12px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `1px solid ${C.border}` }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: C.text }}>Studio Park</span>
        <div style={{ display: "flex", gap: 16 }}>
          {["Work", "Services", "Contact"].map(l => <span key={l} style={{ fontSize: 10, color: C.textSec }}>{l}</span>)}
          <div style={{ background: GRAD, color: C.bg, fontSize: 9, fontWeight: 700, padding: "4px 10px", borderRadius: 5 }}>Book a call</div>
        </div>
      </div>
      {/* Hero */}
      <div style={{ padding: "28px 20px 20px" }}>
        <div style={{ display: "inline-block", background: C.goldDim, border: `1px solid ${C.goldBorder}`, borderRadius: 100, padding: "3px 10px", marginBottom: 12 }}>
          <span style={{ fontSize: 9, color: C.gold, fontWeight: 600 }}>Brand identity & web design</span>
        </div>
        <h3 style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: isMobile ? 18 : 22, letterSpacing: "-0.03em", lineHeight: 1.1, marginBottom: 8 }}>
          Design that makes your<br />brand impossible to ignore.
        </h3>
        <p style={{ fontSize: 11, color: C.textSec, marginBottom: 16, lineHeight: 1.6 }}>
          Brand identity, web design, and visual systems for startups and growing businesses.
        </p>
        <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
          <div style={{ background: GRAD, color: C.bg, fontSize: 10, fontWeight: 700, padding: "8px 16px", borderRadius: 7 }}>Book a free call</div>
          <div style={{ border: `1px solid ${C.border}`, color: C.textSec, fontSize: 10, padding: "8px 16px", borderRadius: 7 }}>See my work</div>
        </div>
        {/* Stats bar */}
        <div style={{ display: "flex", gap: 20, paddingTop: 16, borderTop: `1px solid ${C.border}` }}>
          {[["24", "clients"], ["$380K", "earned"], ["4.9★", "rating"]].map(([n, l]) => (
            <div key={l}>
              <p style={{ fontSize: 14, fontWeight: 800, color: C.text, margin: 0 }}>{n}</p>
              <p style={{ fontSize: 9, color: C.textSec, margin: 0 }}>{l}</p>
            </div>
          ))}
        </div>
      </div>
      {/* Services row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 1, borderTop: `1px solid ${C.border}` }}>
        {[["Brand Identity", "$3,500"], ["Web Design", "$4,500"], ["UI / UX", "$5,500"]].map(([name, price]) => (
          <div key={name} style={{ padding: "12px 14px", background: "rgba(255,255,255,0.01)" }}>
            <p style={{ fontSize: 10, fontWeight: 600, color: C.text, margin: "0 0 3px" }}>{name}</p>
            <p style={{ fontSize: 10, color: C.gold, fontWeight: 700, margin: 0 }}>{price}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── App tool panels ────────────────────────────────────────────────────────
function AppPanels() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10, flex: 1 }}>
      {/* Booking */}
      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: C.text }}>New booking</span>
          <span style={{ fontSize: 9, color: "#22C55E", fontWeight: 700, background: "rgba(34,197,94,0.1)", padding: "2px 7px", borderRadius: 4 }}>Confirmed</span>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {[["Mon", "10:00", false], ["Tue", "2:00", true], ["Wed", "11:00", false]].map(([d, t, sel]) => (
            <div key={String(d)} style={{ flex: 1, borderRadius: 7, border: `1px solid ${sel ? C.goldBorder : C.border}`, background: sel ? C.goldDim : "transparent", padding: "8px 6px", textAlign: "center" }}>
              <p style={{ fontSize: 9, color: sel ? C.gold : C.textDim, margin: "0 0 2px", fontWeight: sel ? 700 : 400 }}>{String(d)}</p>
              <p style={{ fontSize: 10, color: sel ? C.gold : C.textSec, fontWeight: sel ? 700 : 400, margin: 0 }}>{String(t)}</p>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 10, padding: "8px 10px", borderRadius: 7, background: "rgba(255,255,255,0.02)", border: `1px solid ${C.border}` }}>
          <span style={{ fontSize: 10, color: C.textSec }}>Intake form · 3 questions · </span>
          <span style={{ fontSize: 10, color: C.gold, fontWeight: 600 }}>Auto-reminder set</span>
        </div>
      </div>

      {/* Proposal */}
      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: C.text }}>Brand Identity Package</span>
          <span style={{ fontSize: 9, color: "#22C55E", fontWeight: 700, background: "rgba(34,197,94,0.1)", padding: "2px 7px", borderRadius: 4 }}>Accepted</span>
        </div>
        <p style={{ fontSize: 22, fontWeight: 800, color: C.text, margin: "0 0 10px", letterSpacing: "-0.03em" }}>$4,500</p>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          {["Draft", "Sent", "Viewed", "Accepted"].map((s, i) => (
            <div key={s} style={{ display: "flex", alignItems: "center", gap: 3 }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: i === 3 ? "#22C55E" : i === 2 ? C.gold : C.border }} />
              <span style={{ fontSize: 8, color: i === 3 ? "#22C55E" : i === 2 ? C.gold : C.textDim }}>{s}</span>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 8, padding: "7px 10px", borderRadius: 7, border: `1px solid ${C.border}` }}>
          <span style={{ fontSize: 9, color: C.textSec, flex: 1 }}>Contract · E-signature pending</span>
          <span style={{ fontSize: 9, color: C.gold, fontWeight: 600 }}>Send link</span>
        </div>
      </div>

      {/* Invoice */}
      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: C.text }}>INV-042</span>
          <span style={{ fontSize: 9, color: "#22C55E", fontWeight: 700, background: "rgba(34,197,94,0.1)", padding: "2px 7px", borderRadius: 4 }}>Paid</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <p style={{ fontSize: 18, fontWeight: 800, color: C.text, margin: "0 0 3px", letterSpacing: "-0.03em" }}>$4,500</p>
            <p style={{ fontSize: 9, color: C.textSec, margin: 0 }}>Stripe · Card ending 4242</p>
          </div>
          <div style={{ width: 36, height: 36, borderRadius: 9, background: "rgba(34,197,94,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Check size={16} color="#22C55E" strokeWidth={2.5} />
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Type picker ────────────────────────────────────────────────────────────
function TypePicker() {
  const [selected, setSelected] = useState("");
  const selectedType = TYPES.find(t => t.label === selected);
  const href = selectedType
    ? `/wizard?fill=${encodeURIComponent(selectedType.fill)}`
    : "/wizard";

  return (
    <div style={{ maxWidth: 680, margin: "0 auto", textAlign: "center" }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center", marginBottom: 28 }}>
        {TYPES.map(t => (
          <button
            key={t.label}
            onClick={() => setSelected(s => s === t.label ? "" : t.label)}
            style={{
              padding: "8px 16px", borderRadius: 100,
              border: `1.5px solid ${selected === t.label ? C.goldBorder : C.border}`,
              background: selected === t.label ? C.goldDim : "rgba(255,255,255,0.02)",
              color: selected === t.label ? C.gold : C.textSec,
              fontSize: 13, fontWeight: selected === t.label ? 600 : 400,
              cursor: "pointer", transition: "all 0.15s", fontFamily: SANS,
            }}
          >{t.label}</button>
        ))}
      </div>
      <Link
        href={href}
        className="btn-cta"
        style={{
          display: "inline-flex", alignItems: "center", gap: 10,
          fontFamily: SANS, fontWeight: 700, fontSize: 15, color: C.bg,
          background: GRAD, padding: "15px 36px", borderRadius: 10,
          boxShadow: "0 8px 40px rgba(200,164,78,0.28)",
        }}
      >
        {selected ? `Build my ${selected.toLowerCase()} business` : "Build my business"} <ArrowRight size={15} />
      </Link>
      <p style={{ fontSize: 12, color: C.textDim, marginTop: 14 }}>15 free credits · No card required · 4-min setup</p>
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
          .visuals-row { flex-direction: column !important; }
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
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8 }}>
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
              <Link href="/auth/login" className="btn-ghost" style={{ fontSize: 13, fontWeight: 500, color: C.textSec, padding: "7px 14px", borderRadius: 7, border: "1px solid transparent" }}>Sign in</Link>
            )}
            <Link href="/wizard" className="btn-cta" style={{ fontFamily: SANS, fontSize: 13, fontWeight: 700, color: "#07070A", background: GRAD, borderRadius: 7, padding: "8px 18px", boxShadow: "0 4px 20px rgba(200,164,78,0.25)" }}>Get started</Link>
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
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
          <div style={{ position: "absolute", top: "-20%", left: "50%", transform: "translateX(-50%)", width: "130%", height: "80%", background: "radial-gradient(ellipse at 50% 0%, rgba(200,164,78,0.15) 0%, transparent 65%)", filter: "blur(60px)" }} />
          <div style={{ position: "absolute", top: "10%", left: "-20%", width: "60%", height: "100%", background: "radial-gradient(ellipse at center, rgba(139,92,246,0.09) 0%, transparent 65%)", filter: "blur(80px)" }} />
          <div style={{ position: "absolute", inset: 0, opacity: 0.025, backgroundImage: "linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)", backgroundSize: "80px 80px" }} />
        </div>
        <div style={{ position: "relative", zIndex: 1, maxWidth: 1160, margin: "0 auto", width: "100%", padding: "140px clamp(20px, 5vw, 56px) 80px" }}>
          <div className="a1" style={{ display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 36, background: C.goldDim, border: `1px solid ${C.goldBorder}`, borderRadius: 100, padding: "6px 16px" }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: C.gold }} />
            <span style={{ fontSize: 12, fontWeight: 500, color: C.gold, letterSpacing: "0.02em" }}>Built for people going independent</span>
          </div>
          <h1 className="a2" style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: isMobile ? "clamp(2.2rem, 9vw, 3.2rem)" : "clamp(2.8rem, 5vw, 4.4rem)", lineHeight: 1.0, letterSpacing: "-0.03em", maxWidth: 680, marginBottom: 24 }}>
            <span style={{ background: "linear-gradient(175deg, #F2F2F5 0%, rgba(242,242,245,0.55) 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>Your skills were always<br />worth more than{" "}</span>
            <span style={{ background: GRAD, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>a salary.</span>
          </h1>
          <p className="a3" style={{ fontSize: "clamp(1rem, 2vw, 1.15rem)", lineHeight: 1.7, color: C.textSec, maxWidth: 500, marginBottom: 44 }}>
            Kovra gives you everything to launch, run, and grow a solo service business — before you ever quit your 9-5.
          </p>
          <div className="a4" style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <Link href="/wizard" className="btn-cta" style={{ display: "inline-flex", alignItems: "center", gap: 10, fontFamily: SANS, fontWeight: 700, fontSize: 14, color: "#07070A", background: GRAD, padding: "14px 28px", borderRadius: 9, boxShadow: "0 6px 28px rgba(200,164,78,0.30)" }}>
              Build my business <ArrowRight size={15} />
            </Link>
            <a href="#features" className="btn-ghost" style={{ display: "inline-flex", alignItems: "center", gap: 8, fontWeight: 500, fontSize: 14, color: C.text, background: "rgba(255,255,255,0.04)", border: `1px solid ${C.border}`, padding: "14px 28px", borderRadius: 9 }}>
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
            <p style={{ fontSize: 11, fontWeight: 600, color: C.textDim, letterSpacing: "0.1em", textTransform: "uppercase", whiteSpace: "nowrap" }}>Built for</p>
          </div>
          <div style={{ flex: 1, overflow: "hidden", position: "relative" }}>
            <InfiniteSlider speed={32} gap={48}>
              {ROLES.map(r => <span key={r} style={{ fontFamily: DISPLAY, fontSize: 14, fontWeight: 700, color: C.textDim, letterSpacing: "-0.02em", paddingRight: 8 }}>{r}</span>)}
            </InfiniteSlider>
            <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 80, background: `linear-gradient(to right, ${C.bg}, transparent)`, pointerEvents: "none" }} />
            <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: 80, background: `linear-gradient(to left, ${C.bg}, transparent)`, pointerEvents: "none" }} />
          </div>
        </div>
      </section>

      {/* ─── VISUALS ─── */}
      <section style={{ padding: "100px clamp(20px, 5vw, 56px)" }}>
        <div style={{ maxWidth: 1160, margin: "0 auto" }}>
          <div style={{ marginBottom: 56 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: C.gold, letterSpacing: "0.12em", textTransform: "uppercase" }}>What you get</span>
            <h2 style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: "clamp(1.8rem, 3vw, 2.6rem)", letterSpacing: "-0.03em", lineHeight: 1.08, marginTop: 10 }}>
              A business, ready on day one.
            </h2>
            <p style={{ fontSize: 15, color: C.textSec, marginTop: 10, maxWidth: 480 }}>
              Your site goes live. Booking link works. Proposals write themselves. Invoices get paid.
            </p>
          </div>
          <div className="visuals-row" style={{ display: "flex", gap: 32, alignItems: "flex-start" }}>
            {/* Left — website */}
            <div style={{ flex: isMobile ? "none" : "0 0 52%", width: isMobile ? "100%" : undefined }}>
              <div style={{ marginBottom: 16 }}>
                <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: C.goldDim, border: `1px solid ${C.goldBorder}`, borderRadius: 100, padding: "4px 12px", marginBottom: 10 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: C.gold, letterSpacing: "0.08em", textTransform: "uppercase" }}>AI website</span>
                </div>
                <h3 style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 18, letterSpacing: "-0.02em", color: C.text, marginBottom: 6 }}>Your site, live in 4 minutes</h3>
                <p style={{ fontSize: 13, color: C.textSec, lineHeight: 1.6 }}>Built from your business details — custom domain, portfolio, and booking button ready from day one. No design skills needed.</p>
              </div>
              <SiteMock isMobile={isMobile} />
            </div>
            {/* Right — tools */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ marginBottom: 16 }}>
                <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.04)", border: `1px solid ${C.border}`, borderRadius: 100, padding: "4px 12px", marginBottom: 10 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: C.textSec, letterSpacing: "0.08em", textTransform: "uppercase" }}>Business tools</span>
                </div>
                <h3 style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 18, letterSpacing: "-0.02em", color: C.text, marginBottom: 6 }}>From first booking to paid invoice</h3>
                <p style={{ fontSize: 13, color: C.textSec, lineHeight: 1.6 }}>Client books a call, you send a proposal, they sign the contract, you send the invoice — all without leaving Kovra.</p>
              </div>
              <AppPanels />
            </div>
          </div>
        </div>
      </section>

      {/* ─── TYPE PICKER ─── */}
      <section id="start" style={{ padding: "80px clamp(20px, 5vw, 56px)", background: C.surface, borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}` }}>
        <div style={{ maxWidth: 1160, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: C.gold, letterSpacing: "0.12em", textTransform: "uppercase" }}>Get started</span>
            <h2 style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: "clamp(1.6rem, 2.8vw, 2.2rem)", letterSpacing: "-0.03em", lineHeight: 1.08, marginTop: 10, marginBottom: 8 }}>
              What kind of work do you do?
            </h2>
            <p style={{ fontSize: 14, color: C.textSec }}>Pick your type and we&apos;ll set everything up for you.</p>
          </div>
          <TypePicker />
        </div>
      </section>

      {/* ─── FEATURES ─── */}
      <section id="features" style={{ padding: "100px clamp(20px, 5vw, 56px)" }}>
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
              <div key={f.title} className="feat-card" style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${C.border}`, borderRadius: 12, padding: 24 }}>
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
      <section id="pricing" style={{ padding: "100px clamp(20px, 5vw, 56px)", background: C.surface, borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}` }}>
        <div style={{ maxWidth: 1160, margin: "0 auto" }}>
          <div style={{ marginBottom: 56, textAlign: "center" }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: C.gold, letterSpacing: "0.12em", textTransform: "uppercase" }}>The difference</span>
            <h2 style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: "clamp(1.8rem, 3vw, 2.6rem)", letterSpacing: "-0.03em", lineHeight: 1.08, marginTop: 10 }}>Before Kovra vs. after.</h2>
          </div>
          <div className="ba-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, maxWidth: 840, margin: "0 auto" }}>
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
            <div style={{ background: C.goldDim, border: `1px solid ${C.goldBorder}`, borderRadius: 14, padding: 28 }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: C.gold, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 20 }}>After Kovra</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {BEFORE_AFTER.map(row => (
                  <div key={row.after} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                    <Check size={13} color={C.gold} strokeWidth={2.5} />
                    <span style={{ fontSize: 13, color: C.text, lineHeight: 1.5 }}>{row.after}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div style={{ textAlign: "center", marginTop: 60 }}>
            <p style={{ fontSize: 14, color: C.textSec, marginBottom: 6 }}>
              Free to start. <span style={{ color: C.text }}>$79/mo</span> when you&apos;re ready for proposals, contracts, and payments.
            </p>
            <Link href="/#pricing" style={{ fontSize: 13, color: C.gold, fontWeight: 600 }}>See full pricing →</Link>
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
          <Link href="/wizard" className="btn-cta" style={{ display: "inline-flex", alignItems: "center", gap: 10, fontFamily: SANS, fontWeight: 700, fontSize: 15, color: "#07070A", background: GRAD, padding: "16px 36px", borderRadius: 10, boxShadow: "0 8px 40px rgba(200,164,78,0.28)" }}>
            Build my business now <ArrowRight size={16} />
          </Link>
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
