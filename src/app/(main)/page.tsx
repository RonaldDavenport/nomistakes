"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { InfiniteSlider } from "@/components/ui/infinite-slider";
import { FeaturesSectionWithHoverEffects } from "@/components/blocks/feature-section-with-hover-effects";
import { Calendar, FileText, FolderOpen, TrendingUp, ArrowRight } from "lucide-react";

// ─── tokens ───────────────────────────────────────────────────────────────────

const DISPLAY = "'DM Sans', -apple-system, sans-serif";
const SYNE = DISPLAY; // alias kept for compatibility
const SANS = "'DM Sans', -apple-system, sans-serif";
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

// ─── hooks ────────────────────────────────────────────────────────────────────

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

// ─── data ─────────────────────────────────────────────────────────────────────

const TOOLS = [
  "Calendly", "Dubsado", "HoneyBook", "DocuSign",
  "Toggl", "Dropbox", "Pipedrive", "Typeform",
  "ManyChat", "FreshBooks", "Acuity", "17hats",
];

const PILLARS = [
  {
    Icon: Calendar, tag: "BOOK", accent: "#C8A44E",
    title: "Booking & intake",
    items: ["Custom booking link", "Intake forms", "Auto reminders 24h + 1h", "ICS calendar feed"],
    img: "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?q=80&w=2068&auto=format&fit=crop",
  },
  {
    Icon: FileText, tag: "SELL", accent: "#3B82F6",
    title: "Proposals & contracts",
    items: ["AI-written proposals", "E-signatures", "Deposits + payment plans", "Recurring billing"],
    img: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?q=80&w=2070&auto=format&fit=crop",
  },
  {
    Icon: FolderOpen, tag: "DELIVER", accent: "#22C55E",
    title: "Projects & files",
    items: ["Deliverable boards", "Subtask checklists", "File sharing", "Time tracking"],
    img: "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?q=80&w=2087&auto=format&fit=crop",
  },
  {
    Icon: TrendingUp, tag: "GROW", accent: "#8B5CF6",
    title: "Retention & growth",
    items: ["Review requests", "Re-engagement flows", "Referral links", "Automations"],
    img: "https://images.unsplash.com/photo-1553484771-371a605b060b?q=80&w=2070&auto=format&fit=crop",
  },
];

// ─── page ─────────────────────────────────────────────────────────────────────

export default function LandingPage() {
  const scrolled = useScrolled();
  const isMobile = useIsMobile();
  const [menuOpen, setMenuOpen] = useState(false);
  const [activePillar, setActivePillar] = useState(0);

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
        .pill-tab { cursor: pointer; transition: all 0.18s; }
        .price-card { transition: border-color 0.2s, transform 0.2s; }
        .price-card:hover { transform: translateY(-3px); }

        @media (max-width: 768px) {
          .stats-grid { grid-template-columns: 1fr 1fr !important; }
          .price-grid { grid-template-columns: 1fr !important; }
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
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <svg width="24" height="26" viewBox="0 0 80 88" fill="none">
              <path d="M40 4C40 4 14 16 14 38C14 54 26 62 32 65.5C34.5 67 36 69 36 72V80C36 82.5 37.5 84 40 84C42.5 84 44 82.5 44 80V72C44 69 45.5 67 48 65.5C54 62 66 54 66 38C66 16 40 4 40 4Z" fill="#C8A44E" />
              <circle cx="33" cy="35" r="3.5" fill="#07070A" />
              <circle cx="47" cy="35" r="3.5" fill="#07070A" />
            </svg>
            <span style={{ fontFamily: DISPLAY, fontSize: 16, fontWeight: 700, letterSpacing: "-0.03em" }}>kovra</span>
          </div>

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
              fontFamily: SYNE, fontSize: 13, fontWeight: 700, color: "#07070A",
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
            <a key={l} href={h} onClick={() => setMenuOpen(false)} style={{ fontFamily: SYNE, fontSize: 32, fontWeight: 700, color: C.text, letterSpacing: "-0.04em" }}>{l}</a>
          ))}
        </div>
      )}

      {/* ─── HERO ─── */}
      <section style={{ position: "relative", minHeight: "100vh", display: "flex", alignItems: "center", overflow: "hidden" }}>
        {/* Atmosphere */}
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
          <div style={{ position: "absolute", top: "-20%", left: "50%", transform: "translateX(-50%)", width: "130%", height: "80%", background: "radial-gradient(ellipse at 50% 0%, rgba(200,164,78,0.18) 0%, transparent 65%)", filter: "blur(60px)" }} />
          <div style={{ position: "absolute", top: "10%", left: "-20%", width: "60%", height: "100%", background: "radial-gradient(ellipse at center, rgba(139,92,246,0.10) 0%, transparent 65%)", filter: "blur(80px)" }} />
          <div style={{ position: "absolute", top: "0%", right: "-18%", width: "55%", height: "90%", background: "radial-gradient(ellipse at center, rgba(59,130,246,0.09) 0%, transparent 65%)", filter: "blur(80px)" }} />
          {/* Grid */}
          <div style={{ position: "absolute", inset: 0, opacity: 0.025, backgroundImage: "linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)", backgroundSize: "80px 80px" }} />
          {/* Noise */}
          <div style={{ position: "absolute", inset: 0, opacity: 0.025, backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`, backgroundSize: "256px 256px" }} />
        </div>

        <div style={{ position: "relative", zIndex: 1, maxWidth: 1160, margin: "0 auto", width: "100%", padding: "140px clamp(20px, 5vw, 56px) 100px" }}>
          {/* Badge */}
          <div className="a1" style={{ display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 40, background: C.goldDim, border: `1px solid ${C.goldBorder}`, borderRadius: 100, padding: "6px 16px" }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: C.gold, flexShrink: 0 }} />
            <span style={{ fontSize: 12, fontWeight: 500, color: C.gold, letterSpacing: "0.02em" }}>Team accounts, contracts + time tracking — now live</span>
          </div>

          {/* Headline */}
          <h1 className="a2" style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: isMobile ? "clamp(2.4rem, 10vw, 3.6rem)" : "clamp(2.8rem, 5vw, 4.8rem)", lineHeight: 1.0, letterSpacing: "-0.03em", maxWidth: 720, marginBottom: 28 }}>
            <span style={{ background: "linear-gradient(175deg, #F2F2F5 0%, rgba(242,242,245,0.55) 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              The OS for<br />service{" "}
            </span>
            <span style={{ background: GRAD, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>businesses.</span>
          </h1>

          {/* Sub */}
          <p className="a3" style={{ fontSize: "clamp(1rem, 2vw, 1.2rem)", lineHeight: 1.7, color: C.textSec, maxWidth: 520, marginBottom: 48 }}>
            Kovra replaces Calendly, Dubsado, HoneyBook, DocuSign, and six other tools
            with one platform built for people who sell their time.
          </p>

          {/* CTAs */}
          <div className="a4" style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <Link href="/auth/signup" className="btn-cta" style={{
              display: "inline-flex", alignItems: "center", gap: 10,
              fontFamily: SYNE, fontWeight: 700, fontSize: 14, color: "#07070A",
              background: GRAD, padding: "14px 28px", borderRadius: 9,
              boxShadow: "0 6px 28px rgba(200,164,78,0.30)",
            }}>
              Start free <ArrowRight size={15} />
            </Link>
            <a href="#features" className="btn-ghost" style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              fontWeight: 500, fontSize: 14, color: C.text,
              background: "rgba(255,255,255,0.04)", border: `1px solid ${C.border}`,
              padding: "14px 28px", borderRadius: 9,
            }}>
              See how it works
            </a>
          </div>
          <p className="a4" style={{ fontSize: 12, color: C.textDim, marginTop: 24 }}>15 free credits · No card required · Setup in 4 minutes</p>
        </div>
      </section>

      {/* ─── TOOLS REPLACED (InfiniteSlider) ─── */}
      <section style={{ borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}`, padding: "36px 0", overflow: "hidden" }}>
        <div style={{ display: "flex", alignItems: "center" }}>
          <div style={{ flexShrink: 0, padding: "0 clamp(20px, 4vw, 48px)", borderRight: `1px solid ${C.border}` }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: C.textDim, letterSpacing: "0.1em", textTransform: "uppercase", whiteSpace: "nowrap" }}>
              Replaces all of these
            </p>
          </div>
          <div style={{ flex: 1, overflow: "hidden", position: "relative" }}>
            <InfiniteSlider speed={28} gap={56}>
              {TOOLS.map((t) => (
                <div key={t} style={{ display: "flex", alignItems: "center", paddingRight: 8 }}>
                  <span style={{ fontFamily: SYNE, fontSize: 14, fontWeight: 700, color: C.textDim, letterSpacing: "-0.02em", textDecoration: "line-through", textDecorationColor: "rgba(255,255,255,0.12)" }}>
                    {t}
                  </span>
                </div>
              ))}
            </InfiniteSlider>
            <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 80, background: `linear-gradient(to right, ${C.bg}, transparent)`, pointerEvents: "none" }} />
            <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: 80, background: `linear-gradient(to left, ${C.bg}, transparent)`, pointerEvents: "none" }} />
          </div>
        </div>
      </section>

      {/* ─── STATS ─── */}
      <section style={{ padding: "100px clamp(20px, 5vw, 56px)" }}>
        <div style={{ maxWidth: 1160, margin: "0 auto" }}>
          <div className="stats-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "40px 60px", textAlign: "center" }}>
            {[["2,400+", "Businesses on Kovra"], ["$4.2M+", "Revenue processed"], ["11×", "Tools replaced"], ["4 min", "Avg setup time"]].map(([n, l]) => (
              <div key={l}>
                <p style={{ fontFamily: DISPLAY, fontWeight: 800, lineHeight: 1, fontSize: "clamp(1.8rem, 4vw, 2.8rem)", letterSpacing: "-0.03em", background: GRAD, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>{n}</p>
                <p style={{ fontSize: 13, color: C.textSec, marginTop: 10 }}>{l}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PILLARS (tabbed) ─── */}
      <section id="features" style={{ padding: "80px clamp(20px, 5vw, 56px) 120px", borderTop: `1px solid ${C.border}` }}>
        <div style={{ maxWidth: 1160, margin: "0 auto" }}>
          <div style={{ marginBottom: 56 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: C.gold, letterSpacing: "0.12em", textTransform: "uppercase" }}>Four phases. One tool.</span>
            <h2 style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: "clamp(1.8rem, 3.5vw, 3rem)", letterSpacing: "-0.03em", lineHeight: 1.05, maxWidth: 600, marginTop: 12 }}>
              From first inquiry<br />
              <span style={{ color: C.textSec, fontWeight: 400 }}>to repeat client.</span>
            </h2>
          </div>

          {/* Tab pills */}
          <div style={{ display: "flex", gap: 8, marginBottom: 48, flexWrap: "wrap" }}>
            {PILLARS.map((p, i) => (
              <button key={p.tag} className="pill-tab" onClick={() => setActivePillar(i)} style={{
                display: "flex", alignItems: "center", gap: 7, padding: "9px 16px", borderRadius: 8,
                fontFamily: SANS, fontSize: 13, fontWeight: 600,
                background: activePillar === i ? p.accent + "18" : "rgba(255,255,255,0.04)",
                border: `1px solid ${activePillar === i ? p.accent + "44" : C.border}`,
                color: activePillar === i ? p.accent : C.textSec,
              }}>
                <p.Icon size={13} />
                {p.tag}
              </button>
            ))}
          </div>

          {/* Active panel */}
          {PILLARS.map((p, i) => (
            <div key={p.tag} style={{ display: activePillar === i ? "grid" : "none", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 48, alignItems: "center" }}>
              <div>
                <div style={{ display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 20, padding: "5px 12px", borderRadius: 6, background: p.accent + "15", border: `1px solid ${p.accent}30` }}>
                  <p.Icon size={12} color={p.accent} />
                  <span style={{ fontSize: 11, fontWeight: 700, color: p.accent, letterSpacing: "0.1em" }}>{p.tag}</span>
                </div>
                <h3 style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: "clamp(1.4rem, 2.5vw, 2rem)", letterSpacing: "-0.025em", lineHeight: 1.1, marginBottom: 28 }}>{p.title}</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  {p.items.map((item) => (
                    <div key={item} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ width: 22, height: 22, borderRadius: 6, background: p.accent + "15", border: `1px solid ${p.accent}30`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <span style={{ color: p.accent, fontSize: 11, fontWeight: 700 }}>✓</span>
                      </div>
                      <span style={{ fontSize: 14, color: C.text }}>{item}</span>
                    </div>
                  ))}
                </div>
                <Link href="/auth/signup" style={{ display: "inline-flex", alignItems: "center", gap: 6, marginTop: 36, fontSize: 13, fontWeight: 600, color: p.accent }}>
                  Get started <ArrowRight size={13} />
                </Link>
              </div>
              <div style={{ borderRadius: 16, overflow: "hidden", aspectRatio: "4/3", border: `1px solid ${C.border}` }}>
                <img src={p.img} alt={p.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── FEATURE HOVER GRID ─── */}
      <section style={{ background: C.surface, borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}`, overflow: "hidden", padding: "0 clamp(20px, 5vw, 56px)" }}>
        <div style={{ textAlign: "center", padding: "80px clamp(20px, 5vw, 56px) 0" }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: C.gold, letterSpacing: "0.12em", textTransform: "uppercase" }}>Everything included</span>
          <h2 style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: "clamp(1.6rem, 2.8vw, 2.4rem)", letterSpacing: "-0.03em", marginTop: 12 }}>No feature gating. No upsells.</h2>
        </div>
        <FeaturesSectionWithHoverEffects />
      </section>

      {/* ─── PRICING ─── */}
      <section id="pricing" style={{ padding: "120px clamp(20px, 5vw, 56px)" }}>
        <div style={{ maxWidth: 1160, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: C.gold, letterSpacing: "0.12em", textTransform: "uppercase" }}>Pricing</span>
            <h2 style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: "clamp(1.8rem, 3vw, 2.8rem)", letterSpacing: "-0.03em", lineHeight: 1.05, marginTop: 12, marginBottom: 12 }}>
              One price.<br />Everything included.
            </h2>
            <p style={{ fontSize: 15, color: C.textSec }}>No per-seat fees. No feature gating.</p>
          </div>
          <div className="price-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, maxWidth: 860, margin: "0 auto" }}>
            {[
              { name: "Free", price: "$0", per: "forever", desc: "Start building.", features: ["15 one-time credits", "AI website generation", "Basic CRM", "1 booking link"], hi: false },
              { name: "Starter", price: "$79", per: "/mo", desc: "For solo service providers.", features: ["500 credits/mo", "Proposals + contracts", "Invoicing + payments", "Project management", "Automations + referrals"], hi: true },
              { name: "Growth", price: "$199", per: "/mo", desc: "For agencies and teams.", features: ["2,500 credits/mo", "Everything in Starter", "Team accounts", "Time tracking", "Lead engine + outreach"], hi: false },
            ].map((p) => (
              <div key={p.name} className="price-card" style={{
                position: "relative", background: p.hi ? "rgba(200,164,78,0.06)" : C.surface,
                border: `1px solid ${p.hi ? "rgba(200,164,78,0.28)" : C.border}`,
                borderRadius: 16, padding: "28px 24px",
              }}>
                {p.hi && (
                  <div style={{ position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)", background: GRAD, color: "#07070A", fontFamily: SANS, fontSize: 10, fontWeight: 800, letterSpacing: "0.08em", padding: "4px 14px", borderRadius: 100, whiteSpace: "nowrap" }}>MOST POPULAR</div>
                )}
                <p style={{ fontSize: 11, fontWeight: 700, color: C.textSec, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>{p.name}</p>
                <div style={{ display: "flex", alignItems: "baseline", gap: 3, marginBottom: 6 }}>
                  <span style={{ fontFamily: DISPLAY, fontSize: 44, fontWeight: 800, letterSpacing: "-0.05em", lineHeight: 1 }}>{p.price}</span>
                  <span style={{ fontSize: 13, color: C.textSec }}>{p.per}</span>
                </div>
                <p style={{ fontSize: 13, color: C.textSec, marginBottom: 22 }}>{p.desc}</p>
                <Link href="/auth/signup" style={{
                  display: "block", textAlign: "center",
                  fontFamily: SYNE, fontWeight: 700, fontSize: 13,
                  background: p.hi ? GRAD : "rgba(255,255,255,0.06)",
                  border: p.hi ? "none" : `1px solid ${C.border}`,
                  color: p.hi ? "#07070A" : C.text,
                  borderRadius: 8, padding: "11px 0", marginBottom: 22,
                }}>
                  {p.price === "$0" ? "Get started free" : "Start free trial"}
                </Link>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {p.features.map((f) => (
                    <div key={f} style={{ display: "flex", gap: 9, alignItems: "flex-start" }}>
                      <span style={{ color: C.gold, fontSize: 11, flexShrink: 0, marginTop: 2 }}>✓</span>
                      <span style={{ fontSize: 12, color: C.textSec, lineHeight: 1.5 }}>{f}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section style={{ padding: "120px clamp(20px, 5vw, 56px)", position: "relative", overflow: "hidden", borderTop: `1px solid ${C.border}` }}>
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none", background: "radial-gradient(ellipse 80% 70% at 50% 50%, rgba(200,164,78,0.10) 0%, transparent 70%)" }} />
        <div style={{ position: "relative", maxWidth: 680, margin: "0 auto", textAlign: "center" }}>
          <h2 style={{ fontFamily: DISPLAY, fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1.08, fontSize: "clamp(2rem, 3.5vw, 3.2rem)", marginBottom: 24 }}>
            <span style={{ background: "linear-gradient(175deg, #F2F2F5 0%, rgba(242,242,245,0.55) 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>Stop duct-taping your business </span>
            <span style={{ background: GRAD, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>together.</span>
          </h2>
          <p style={{ fontSize: 16, color: C.textSec, lineHeight: 1.7, marginBottom: 44 }}>Kovra gives you every tool a service business needs — in one place, from day one.</p>
          <Link href="/auth/signup" className="btn-cta" style={{
            display: "inline-flex", alignItems: "center", gap: 10,
            fontFamily: SYNE, fontWeight: 700, fontSize: 15, color: "#07070A",
            background: GRAD, padding: "17px 36px", borderRadius: 10,
            boxShadow: "0 8px 40px rgba(200,164,78,0.30)",
          }}>
            Start free — no card needed <ArrowRight size={16} />
          </Link>
          <p style={{ fontSize: 12, color: C.textDim, marginTop: 18 }}>15 free credits on signup. Takes 4 minutes to set up.</p>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer style={{ padding: "40px clamp(20px, 5vw, 56px)", borderTop: `1px solid ${C.border}` }}>
        <div style={{ maxWidth: 1160, margin: "0 auto", display: "flex", flexWrap: "wrap", gap: 20, alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <svg width="20" height="22" viewBox="0 0 80 88" fill="none">
              <path d="M40 4C40 4 14 16 14 38C14 54 26 62 32 65.5C34.5 67 36 69 36 72V80C36 82.5 37.5 84 40 84C42.5 84 44 82.5 44 80V72C44 69 45.5 67 48 65.5C54 62 66 54 66 38C66 16 40 4 40 4Z" fill="rgba(200,164,78,0.5)" />
              <circle cx="33" cy="35" r="3.5" fill="#07070A" />
              <circle cx="47" cy="35" r="3.5" fill="#07070A" />
            </svg>
            <span style={{ fontFamily: DISPLAY, fontSize: 14, fontWeight: 600, color: C.textSec }}>kovra</span>
          </div>
          <p style={{ fontSize: 12, color: C.textDim }}>© 2026 Kovra. All rights reserved.</p>
          <div style={{ display: "flex", gap: 24 }}>
            {["Privacy", "Terms", "Contact"].map((l) => (
              <a key={l} href="#" className="nav-item" style={{ fontSize: 12, color: C.textDim }}>{l}</a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
