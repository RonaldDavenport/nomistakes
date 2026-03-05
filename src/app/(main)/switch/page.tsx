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

const TYPES = [
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

const TOOLS = [
  "Calendly", "Dubsado", "HoneyBook", "DocuSign",
  "Apollo", "Lemlist", "Instantly", "LinkedIn Sales Nav",
  "Toggl", "FreshBooks", "Pipedrive", "Typeform",
  "ManyChat", "Acuity", "17hats",
];

const COMPARISON_ROWS = [
  { feature: "Booking link",          kovra: true,  calendly: true,  dubsado: true,       stack: true  },
  { feature: "CRM / pipeline",        kovra: true,  calendly: false, dubsado: true,       stack: true  },
  { feature: "Proposals",             kovra: true,  calendly: false, dubsado: true,       stack: true  },
  { feature: "E-signatures",          kovra: true,  calendly: false, dubsado: true,       stack: true  },
  { feature: "Invoicing",             kovra: true,  calendly: false, dubsado: "partial",  stack: true  },
  { feature: "Project management",    kovra: true,  calendly: false, dubsado: true,       stack: true  },
  { feature: "Lead discovery",        kovra: true,  calendly: false, dubsado: false,      stack: "partial" },
  { feature: "Cold email infra",      kovra: true,  calendly: false, dubsado: false,      stack: false },
  { feature: "Unified outreach inbox",kovra: true,  calendly: false, dubsado: false,      stack: false },
  { feature: "AI website",            kovra: true,  calendly: false, dubsado: false,      stack: false },
  { feature: "Monthly cost",          kovra: "$79", calendly: "$16+", dubsado: "$200+",   stack: "$450+" },
];

const TESTIMONIALS = [
  {
    quote: "I was paying $240/mo across five tools and still doing everything manually. Moved everything to Kovra in an afternoon and haven't touched any of those apps since.",
    name: "Morgan K.",
    role: "UX consultant, San Francisco",
  },
  {
    quote: "I had an $8K month followed by a $900 month because I had no system for staying visible between projects. The CRM and lead tools fixed that completely.",
    name: "Taylor R.",
    role: "Copywriter, New York",
  },
  {
    quote: "I used to spend every Sunday chasing invoices and scheduling calls. Now it's automated and I get paid on time. I genuinely don't think about billing anymore.",
    name: "Alex M.",
    role: "Brand designer, Seattle",
  },
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

function CompCell({ value }: { value: boolean | string }) {
  if (value === true) return <Check size={14} color={C.gold} strokeWidth={2.5} />;
  if (value === false) return <X size={14} color={C.textDim} strokeWidth={2} />;
  if (value === "partial") return <span style={{ fontSize: 10, color: "#F59E0B", fontWeight: 600 }}>Partial</span>;
  return <span style={{ fontSize: 12, fontWeight: 700, color: C.text }}>{value}</span>;
}

// ── Dashboard visual ───────────────────────────────────────────────────────
function DashboardMock({ isMobile }: { isMobile: boolean }) {
  return (
    <div style={{ borderRadius: 12, border: `1px solid ${C.border}`, overflow: "hidden", background: "#06060A" }}>
      {/* Chrome */}
      <div style={{ background: "#0A0A0E", padding: "8px 14px", display: "flex", alignItems: "center", gap: 10, borderBottom: `1px solid ${C.border}` }}>
        <div style={{ display: "flex", gap: 5 }}>
          {["#EF4444", "#F59E0B", "#22C55E"].map(col => <div key={col} style={{ width: 7, height: 7, borderRadius: "50%", background: col, opacity: 0.5 }} />)}
        </div>
        <div style={{ flex: 1, background: "rgba(255,255,255,0.04)", borderRadius: 4, padding: "3px 10px", fontSize: 10, color: C.textDim }}>trynomistakes.com/dashboard</div>
      </div>
      {/* Dashboard header */}
      <div style={{ padding: "14px 18px", borderBottom: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <p style={{ fontSize: 10, color: C.textDim, margin: "0 0 2px" }}>Good morning</p>
          <p style={{ fontSize: 13, fontWeight: 700, color: C.text, margin: 0 }}>Studio Park</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {["CRM", "Proposals", "Invoices", "Projects"].map(t => (
            <div key={t} style={{ fontSize: 9, color: C.textSec, padding: "4px 8px", borderRadius: 5, border: `1px solid ${C.border}` }}>{t}</div>
          ))}
        </div>
      </div>
      {/* Stats row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 1, borderBottom: `1px solid ${C.border}` }}>
        {[["$18,400", "This month"], ["4", "Active clients"], ["2", "Proposals out"], ["$4,500", "Outstanding"]].map(([v, l]) => (
          <div key={l} style={{ padding: "12px 14px" }}>
            <p style={{ fontSize: 14, fontWeight: 800, color: C.text, margin: "0 0 2px", letterSpacing: "-0.02em" }}>{v}</p>
            <p style={{ fontSize: 9, color: C.textSec, margin: 0 }}>{l}</p>
          </div>
        ))}
      </div>
      {/* Recent activity */}
      <div style={{ padding: 16 }}>
        <p style={{ fontSize: 10, fontWeight: 600, color: C.textDim, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 10 }}>Recent activity</p>
        {[
          { label: "Brand Identity — Proposal accepted", tag: "Proposal", color: "#22C55E" },
          { label: "Website Redesign — Invoice paid $4,500", tag: "Invoice", color: C.gold },
          { label: "Jordan Lee — Discovery call booked", tag: "Booking", color: "#3B82F6" },
          { label: "Contract signed — Studio Noir", tag: "Contract", color: "#8B5CF6" },
        ].map(item => (
          <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: `1px solid ${C.border}` }}>
            <div style={{ width: 5, height: 5, borderRadius: "50%", background: item.color, flexShrink: 0 }} />
            <span style={{ fontSize: 11, color: C.textSec, flex: 1 }}>{item.label}</span>
            <span style={{ fontSize: 9, color: item.color, fontWeight: 600, background: item.color + "14", padding: "2px 6px", borderRadius: 4 }}>{item.tag}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Cost breakdown panels ──────────────────────────────────────────────────
function CostPanels() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10, flex: 1 }}>
      {/* What you're paying now */}
      <div style={{ background: C.surface, border: "1px solid rgba(239,68,68,0.15)", borderRadius: 10, padding: 16 }}>
        <p style={{ fontSize: 10, fontWeight: 700, color: "#EF4444", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 12 }}>What you pay now</p>
        {[
          ["Apollo", "$49/mo"],
          ["Lemlist", "$99/mo"],
          ["Calendly", "$16/mo"],
          ["Dubsado", "$200/mo"],
          ["DocuSign", "$25/mo"],
          ["Pipedrive", "$15/mo"],
        ].map(([tool, cost]) => (
          <div key={tool} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: `1px solid ${C.border}` }}>
            <span style={{ fontSize: 12, color: C.textSec }}>{tool}</span>
            <span style={{ fontSize: 12, color: "#EF4444", fontWeight: 600, textDecoration: "line-through" }}>{cost}</span>
          </div>
        ))}
        <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0 0" }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: C.text }}>Total</span>
          <span style={{ fontSize: 14, fontWeight: 800, color: "#EF4444" }}>$404/mo</span>
        </div>
      </div>

      {/* What you pay with Kovra */}
      <div style={{ background: C.goldDim, border: `1px solid ${C.goldBorder}`, borderRadius: 10, padding: 16 }}>
        <p style={{ fontSize: 10, fontWeight: 700, color: C.gold, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 12 }}>With Kovra</p>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <span style={{ fontSize: 13, color: C.text }}>Everything above, replaced</span>
          <span style={{ fontSize: 22, fontWeight: 800, color: C.gold }}>$79<span style={{ fontSize: 11, fontWeight: 400, color: C.textSec }}>/mo</span></span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 10px", borderRadius: 7, background: "rgba(200,164,78,0.08)" }}>
          <Check size={12} color={C.gold} strokeWidth={2.5} />
          <span style={{ fontSize: 11, color: C.gold, fontWeight: 600 }}>Save $325/mo — $3,900 per year</span>
        </div>
      </div>

      {/* Plus what you gain */}
      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: 16 }}>
        <p style={{ fontSize: 10, fontWeight: 700, color: C.textSec, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 10 }}>Plus you gain</p>
        {[
          "Lead engine (2,500 prospects/mo)",
          "Cold email infra, built and warmed",
          "Unified inbox — email, LinkedIn, social",
          "AI website + custom domain",
          "AI-written proposals",
          "Client portal + automations",
        ].map(f => (
          <div key={f} style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 0" }}>
            <Check size={11} color={C.gold} strokeWidth={2.5} />
            <span style={{ fontSize: 11, color: C.textSec }}>{f}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Type picker ────────────────────────────────────────────────────────────
function TypePicker() {
  const [selected, setSelected] = useState("");
  const selectedType = TYPES.find(t => t.label === selected);
  const href = selectedType
    ? `/wizard/switch?fill=${encodeURIComponent(selectedType.fill)}`
    : "/wizard/switch";

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
        {selected ? `Switch my ${selected.toLowerCase()} business` : "Switch to Kovra"} <ArrowRight size={15} />
      </Link>
      <p style={{ fontSize: 12, color: C.textDim, marginTop: 14 }}>15 free credits · No card required · 4-min setup</p>
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
        .comp-row:hover { background: rgba(255,255,255,0.025) !important; }

        @media (max-width: 768px) {
          .visuals-row { flex-direction: column !important; }
          .comp-col-hide { display: none !important; }
          .pain-grid { grid-template-columns: 1fr !important; }
          .testi-grid { grid-template-columns: 1fr !important; }
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
              {[["Compare", "#compare"], ["Pricing", "#pricing"]].map(([l, h]) => (
                <a key={l} href={h} className="nav-item" style={{ fontFamily: SANS, fontSize: 13, fontWeight: 500, color: C.textSec }}>{l}</a>
              ))}
            </div>
          )}
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {!isMobile && (
              <Link href="/auth/login" className="btn-ghost" style={{ fontSize: 13, fontWeight: 500, color: C.textSec, padding: "7px 14px", borderRadius: 7, border: "1px solid transparent" }}>Sign in</Link>
            )}
            <Link href="/wizard/switch" className="btn-cta" style={{ fontFamily: SANS, fontSize: 13, fontWeight: 700, color: "#07070A", background: GRAD, borderRadius: 7, padding: "8px 18px", boxShadow: "0 4px 20px rgba(200,164,78,0.25)" }}>Switch now</Link>
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
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: C.gold }} />
            <span style={{ fontSize: 12, fontWeight: 500, color: C.gold, letterSpacing: "0.02em" }}>Replace your entire stack</span>
          </div>
          <h1 className="a2" style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: isMobile ? "clamp(2.2rem, 9vw, 3.2rem)" : "clamp(2.6rem, 4.8vw, 4.2rem)", lineHeight: 1.0, letterSpacing: "-0.03em", maxWidth: 700, marginBottom: 24 }}>
            <span style={{ background: "linear-gradient(175deg, #F2F2F5 0%, rgba(242,242,245,0.55) 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>You&apos;re already good at what you do.{" "}</span>
            <span style={{ background: GRAD, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>Your tools aren&apos;t.</span>
          </h1>
          <p className="a3" style={{ fontSize: "clamp(1rem, 2vw, 1.15rem)", lineHeight: 1.7, color: C.textSec, maxWidth: 500, marginBottom: 44 }}>
            Replace Apollo, Lemlist, Calendly, Dubsado, and 8 more with one platform. Find clients, close them, and run the whole engagement — $79/mo.
          </p>
          <div className="a4" style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <Link href="/wizard/switch" className="btn-cta" style={{ display: "inline-flex", alignItems: "center", gap: 10, fontFamily: SANS, fontWeight: 700, fontSize: 14, color: "#07070A", background: GRAD, padding: "14px 28px", borderRadius: 9, boxShadow: "0 6px 28px rgba(200,164,78,0.30)" }}>
              Switch to Kovra <ArrowRight size={15} />
            </Link>
            <a href="#compare" className="btn-ghost" style={{ display: "inline-flex", alignItems: "center", gap: 8, fontWeight: 500, fontSize: 14, color: C.text, background: "rgba(255,255,255,0.04)", border: `1px solid ${C.border}`, padding: "14px 28px", borderRadius: 9 }}>
              See the comparison
            </a>
          </div>
          <p className="a4" style={{ fontSize: 12, color: C.textDim, marginTop: 22 }}>15 free credits · No card required · Setup in 4 minutes</p>
        </div>
      </section>

      {/* ─── TOOLS REPLACED ─── */}
      <section style={{ borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}`, padding: "32px 0", overflow: "hidden" }}>
        <div style={{ display: "flex", alignItems: "center" }}>
          <div style={{ flexShrink: 0, padding: "0 clamp(20px, 4vw, 48px)", borderRight: `1px solid ${C.border}` }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: C.textDim, letterSpacing: "0.1em", textTransform: "uppercase", whiteSpace: "nowrap" }}>Replaces all of</p>
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

      {/* ─── PAIN ─── */}
      <section style={{ padding: "100px clamp(20px, 5vw, 56px)", background: C.surface, borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}` }}>
        <div style={{ maxWidth: 1160, margin: "0 auto" }}>
          <div style={{ marginBottom: 56 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#EF4444", letterSpacing: "0.12em", textTransform: "uppercase" }}>Sound familiar?</span>
            <h2 style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: "clamp(1.8rem, 3vw, 2.6rem)", letterSpacing: "-0.03em", lineHeight: 1.08, marginTop: 10 }}>
              The work is great.<br />
              <span style={{ color: C.textSec, fontWeight: 400 }}>The backend is a mess.</span>
            </h2>
          </div>
          <div className="pain-grid" style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }}>
            {[
              {
                label: "Great month, dead month",
                desc: "You land 2-3 clients, deliver the work, and realize you stopped prospecting. Revenue swings $2K–$8K because there's no system keeping your pipeline moving while you're heads-down on work.",
              },
              {
                label: "Weekends on admin",
                desc: "You charge $150/hr on client work, then spend half your weekend scheduling calls, chasing invoices, and updating spreadsheets.",
              },
              {
                label: "Five apps that don't talk",
                desc: "Calendly for booking, PayPal for invoices, Notion for projects, Google Docs for proposals. You copy-paste client names between all of them.",
              },
              {
                label: "Proposals you're embarrassed to send",
                desc: "Your work is excellent. You're sending a Word doc or a Google Slides deck to prospects who expect to deal with a real business.",
              },
            ].map(p => (
              <div key={p.label} style={{ background: "rgba(239,68,68,0.03)", border: "1px solid rgba(239,68,68,0.1)", borderRadius: 14, padding: 28 }}>
                <h3 style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 16, letterSpacing: "-0.02em", color: C.text, marginBottom: 8 }}>{p.label}</h3>
                <p style={{ fontSize: 13, color: C.textSec, lineHeight: 1.7 }}>{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── OUTREACH ─── */}
      <section style={{ padding: "100px clamp(20px, 5vw, 56px)" }}>
        <div style={{ maxWidth: 1160, margin: "0 auto" }}>
          <div style={{ marginBottom: 56 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: C.gold, letterSpacing: "0.12em", textTransform: "uppercase" }}>Full-cycle</span>
            <h2 style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: "clamp(1.8rem, 3vw, 2.6rem)", letterSpacing: "-0.03em", lineHeight: 1.08, marginTop: 10 }}>
              You can&apos;t manage clients<br />
              <span style={{ color: C.textSec, fontWeight: 400 }}>you haven&apos;t landed yet.</span>
            </h2>
            <p style={{ fontSize: 15, color: C.textSec, marginTop: 10, maxWidth: 520 }}>
              Most tools help you run existing clients. Kovra also finds you new ones — and keeps your pipeline moving while you deliver.
            </p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
            {[
              {
                icon: "◎",
                title: "Lead Engine",
                desc: "Find 2,500 verified prospects per month — filtered by industry, location, and company size. Push them straight into your CRM with one click. No Apollo subscription.",
                color: C.gold,
              },
              {
                icon: "⟶",
                title: "Cold email infra, done for you",
                desc: "Kovra sets up your sending domain, connects Google Workspace, and runs MailReach warm-up automatically. Real deliverability without paying for Lemlist or Instantly.",
                color: "#3B82F6",
              },
              {
                icon: "⌁",
                title: "One inbox for all of it",
                desc: "Cold email replies, LinkedIn DMs, inbound leads — everything threads into one place. You see the full conversation, not just the last message. No tab-switching.",
                color: "#22C55E",
              },
            ].map(f => (
              <div key={f.title} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: 28 }}>
                <div style={{ fontSize: 22, color: f.color, marginBottom: 16, lineHeight: 1 }}>{f.icon}</div>
                <h3 style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 16, letterSpacing: "-0.02em", color: C.text, marginBottom: 8 }}>{f.title}</h3>
                <p style={{ fontSize: 13, color: C.textSec, lineHeight: 1.7 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── VISUALS ─── */}
      <section style={{ padding: "100px clamp(20px, 5vw, 56px)" }}>
        <div style={{ maxWidth: 1160, margin: "0 auto" }}>
          <div style={{ marginBottom: 56 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: C.gold, letterSpacing: "0.12em", textTransform: "uppercase" }}>One platform</span>
            <h2 style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: "clamp(1.8rem, 3vw, 2.6rem)", letterSpacing: "-0.03em", lineHeight: 1.08, marginTop: 10 }}>
              Everything in one place.
            </h2>
            <p style={{ fontSize: 15, color: C.textSec, marginTop: 10, maxWidth: 480 }}>
              Bookings, proposals, contracts, invoices, projects — your whole business runs from one dashboard.
            </p>
          </div>
          <div className="visuals-row" style={{ display: "flex", gap: 32, alignItems: "flex-start" }}>
            {/* Left — dashboard */}
            <div style={{ flex: isMobile ? "none" : "0 0 52%", width: isMobile ? "100%" : undefined }}>
              <div style={{ marginBottom: 16 }}>
                <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: C.goldDim, border: `1px solid ${C.goldBorder}`, borderRadius: 100, padding: "4px 12px", marginBottom: 10 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: C.gold, letterSpacing: "0.08em", textTransform: "uppercase" }}>Kovra dashboard</span>
                </div>
                <h3 style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 18, letterSpacing: "-0.02em", color: C.text, marginBottom: 6 }}>Your whole business in one view</h3>
                <p style={{ fontSize: 13, color: C.textSec, lineHeight: 1.6 }}>Revenue, active clients, proposals out, outstanding invoices — all in one place, without switching between 5 tabs.</p>
              </div>
              <DashboardMock isMobile={isMobile} />
            </div>
            {/* Right — cost breakdown */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ marginBottom: 16 }}>
                <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.18)", borderRadius: 100, padding: "4px 12px", marginBottom: 10 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: "#EF4444", letterSpacing: "0.08em", textTransform: "uppercase" }}>The math</span>
                </div>
                <h3 style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 18, letterSpacing: "-0.02em", color: C.text, marginBottom: 6 }}>Stop paying for 5 tools</h3>
                <p style={{ fontSize: 13, color: C.textSec, lineHeight: 1.6 }}>Most freelancers cobble together $266/mo across separate subscriptions. Kovra replaces all of them at $79/mo.</p>
              </div>
              <CostPanels />
            </div>
          </div>
        </div>
      </section>

      {/* ─── TYPE PICKER ─── */}
      <section id="switch" style={{ padding: "80px clamp(20px, 5vw, 56px)", background: C.surface, borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}` }}>
        <div style={{ maxWidth: 1160, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: C.gold, letterSpacing: "0.12em", textTransform: "uppercase" }}>Switch in 4 minutes</span>
            <h2 style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: "clamp(1.6rem, 2.8vw, 2.2rem)", letterSpacing: "-0.03em", lineHeight: 1.08, marginTop: 10, marginBottom: 8 }}>
              Tell us about your business.
            </h2>
            <p style={{ fontSize: 14, color: C.textSec }}>Pick your service and we&apos;ll configure Kovra for how you already work.</p>
          </div>
          <TypePicker />
        </div>
      </section>

      {/* ─── COMPARISON TABLE ─── */}
      <section id="compare" style={{ padding: "100px clamp(20px, 5vw, 56px)" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div style={{ marginBottom: 48 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: C.gold, letterSpacing: "0.12em", textTransform: "uppercase" }}>The numbers</span>
            <h2 style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: "clamp(1.8rem, 3vw, 2.6rem)", letterSpacing: "-0.03em", lineHeight: 1.08, marginTop: 10 }}>
              One tool.<br /><span style={{ color: C.textSec, fontWeight: 400 }}>Versus the rest.</span>
            </h2>
          </div>
          <div style={{ fontSize: 13, border: `1px solid ${C.border}`, borderRadius: 14, overflow: "hidden" }}>
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
                  <div key={ci} style={{ padding: "13px 16px", display: "flex", alignItems: "center", justifyContent: "center", background: ci === 0 ? "rgba(200,164,78,0.04)" : "transparent" }}>
                    <CompCell value={val as boolean | string} />
                  </div>
                ))}
              </div>
            ))}
          </div>
          <p style={{ fontSize: 12, color: C.textDim, marginTop: 16, textAlign: "center" }}>
            Apollo $49+/mo · Lemlist $99+/mo · Dubsado $200+/mo · full stack $450+/mo. Kovra replaces all of them for $79/mo.
          </p>
        </div>
      </section>

      {/* ─── TESTIMONIALS ─── */}
      <section style={{ padding: "100px clamp(20px, 5vw, 56px)", background: C.surface, borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}` }}>
        <div style={{ maxWidth: 1160, margin: "0 auto" }}>
          <div style={{ marginBottom: 56, textAlign: "center" }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: C.gold, letterSpacing: "0.12em", textTransform: "uppercase" }}>From the community</span>
            <h2 style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: "clamp(1.8rem, 3vw, 2.6rem)", letterSpacing: "-0.03em", lineHeight: 1.08, marginTop: 10 }}>
              People who made the switch.
            </h2>
          </div>
          <div className="testi-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
            {TESTIMONIALS.map(t => (
              <div key={t.name} style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 14, padding: 28, display: "flex", flexDirection: "column" }}>
                <div style={{ display: "flex", gap: 3, marginBottom: 20 }}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span key={i} style={{ color: C.gold, fontSize: 13 }}>★</span>
                  ))}
                </div>
                <p style={{ fontSize: 14, color: C.text, lineHeight: 1.75, flex: 1, marginBottom: 24 }}>
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 18 }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: C.text, margin: "0 0 3px" }}>{t.name}</p>
                  <p style={{ fontSize: 11, color: C.textSec, margin: 0 }}>{t.role}</p>
                </div>
              </div>
            ))}
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
            You&apos;re already doing the work. Kovra just stops charging you $300/mo to prove it.
          </p>
          <Link href="/wizard/switch" className="btn-cta" style={{ display: "inline-flex", alignItems: "center", gap: 10, fontFamily: SANS, fontWeight: 700, fontSize: 15, color: "#07070A", background: GRAD, padding: "16px 36px", borderRadius: 10, boxShadow: "0 8px 40px rgba(200,164,78,0.28)" }}>
            Switch to Kovra <ArrowRight size={16} />
          </Link>
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
