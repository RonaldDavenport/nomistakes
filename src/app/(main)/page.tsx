"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const C = {
  bg: "#0A0A0A",
  surface: "#111111",
  surfaceHover: "#1A1A1A",
  card: "#141414",
  border: "#1E1E1E",
  borderLight: "#2A2A2A",
  text: "#FAFAFA",
  textSec: "#A0A0A0",
  textDim: "#5A5A5A",
  gold: "#C8A44E",
  goldLight: "#D4B65E",
  goldDim: "rgba(200,164,78,0.10)",
  goldBorder: "rgba(200,164,78,0.2)",
  green: "#34D399",
  greenDim: "rgba(52,211,153,0.10)",
  blue: "#60A5FA",
  blueDim: "rgba(96,165,250,0.10)",
  purple: "#A78BFA",
  purpleDim: "rgba(167,139,250,0.10)",
  orange: "#FB923C",
  orangeDim: "rgba(251,146,60,0.10)",
};

const font = "'DM Sans', sans-serif";

const CobraMark = ({ size = 28, color = C.gold }: { size?: number; color?: string }) => (
  <svg width={size} height={size * 1.1} viewBox="0 0 80 88" fill="none">
    <path
      d="M40 4C40 4 14 16 14 38C14 54 26 62 32 65.5C34.5 67 36 69 36 72V80C36 82.5 37.5 84 40 84C42.5 84 44 82.5 44 80V72C44 69 45.5 67 48 65.5C54 62 66 54 66 38C66 16 40 4 40 4Z"
      fill={color}
    />
    <circle cx="33" cy="35" r="3.5" fill="#0A0A0A" />
    <circle cx="47" cy="35" r="3.5" fill="#0A0A0A" />
  </svg>
);

const Logo = ({ size = "default" }: { size?: string }) => (
  <div style={{ display: "flex", alignItems: "center", gap: size === "large" ? 12 : 8 }}>
    <CobraMark size={size === "large" ? 32 : 24} />
    <span
      style={{
        fontFamily: font,
        fontWeight: 700,
        fontSize: size === "large" ? 26 : 20,
        color: C.text,
        letterSpacing: "-0.03em",
      }}
    >
      kovra
    </span>
  </div>
);

/* ─── NAV ─── */
const Nav = () => {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);
  return (
    <nav
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        padding: "0 32px",
        height: 60,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: scrolled ? "rgba(10,10,10,0.95)" : "transparent",
        backdropFilter: scrolled ? "blur(24px)" : "none",
        borderBottom: scrolled ? `1px solid ${C.border}` : "1px solid transparent",
        transition: "all 0.35s ease",
      }}
    >
      <Logo />
      <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
        {[
          { label: "Features", href: "#pillars" },
          { label: "Pricing", href: "#pricing" },
        ].map((t) => (
          <a
            key={t.label}
            href={t.href}
            style={{
              color: C.textDim,
              textDecoration: "none",
              fontSize: 13.5,
              fontFamily: font,
              fontWeight: 500,
              transition: "color 0.2s",
            }}
            onMouseEnter={(e) => { (e.target as HTMLElement).style.color = C.text; }}
            onMouseLeave={(e) => { (e.target as HTMLElement).style.color = C.textDim; }}
          >
            {t.label}
          </a>
        ))}
        <div style={{ width: 1, height: 20, background: C.border, margin: "0 4px" }} />
        <Link href="/auth/login" style={{ color: C.textSec, textDecoration: "none", fontSize: 13.5, fontFamily: font, fontWeight: 500 }}>
          Log in
        </Link>
        <Link
          href="/wizard"
          style={{
            background: C.gold,
            color: "#0A0A0A",
            border: "none",
            borderRadius: 8,
            padding: "8px 18px",
            fontSize: 13.5,
            fontWeight: 600,
            fontFamily: font,
            cursor: "pointer",
            transition: "all 0.2s",
            textDecoration: "none",
            display: "inline-block",
          }}
        >
          Get started free
        </Link>
      </div>
    </nav>
  );
};

/* ─── HERO ─── */
const Hero = () => (
  <section style={{ position: "relative", padding: "150px 32px 80px", textAlign: "center", overflow: "hidden" }}>
    <div
      style={{
        position: "absolute",
        top: -300,
        left: "50%",
        transform: "translateX(-50%)",
        width: 1100,
        height: 1100,
        background: "radial-gradient(ellipse at center, rgba(200,164,78,0.05) 0%, transparent 65%)",
        pointerEvents: "none",
      }}
    />
    <div style={{ position: "relative", maxWidth: 900, margin: "0 auto" }}>
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          background: C.goldDim,
          border: `1px solid ${C.goldBorder}`,
          borderRadius: 100,
          padding: "5px 14px 5px 10px",
          marginBottom: 28,
        }}
      >
        <div style={{ width: 6, height: 6, borderRadius: "50%", background: C.gold, animation: "pulse 2s infinite" }} />
        <span style={{ fontFamily: font, fontSize: 12.5, fontWeight: 500, color: C.gold }}>Early access — join the waitlist</span>
      </div>

      <h1
        style={{
          fontFamily: font,
          fontSize: "clamp(38px, 5.5vw, 68px)",
          fontWeight: 700,
          lineHeight: 1.06,
          letterSpacing: "-0.04em",
          color: C.text,
          margin: "0 0 20px",
        }}
      >
        The operating system for
        <br />
        <span style={{ color: C.gold }}>service businesses.</span>
      </h1>

      <p
        style={{
          fontFamily: font,
          fontSize: 17,
          lineHeight: 1.65,
          color: C.textSec,
          maxWidth: 520,
          margin: "0 auto 36px",
        }}
      >
        Build your website. Book clients. Send proposals. Get paid. Grow with
        marketing — all from one platform. Powered by AI. Built for people who
        are great at what they do.
      </p>

      <p style={{ fontFamily: font, fontSize: 13.5, color: C.textDim, marginBottom: 14 }}>I want to...</p>
      <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", maxWidth: 580, margin: "0 auto" }}>
        <Link
          href="/wizard"
          style={{
            flex: 1,
            minWidth: 250,
            background: C.goldDim,
            color: C.text,
            border: `1px solid ${C.goldBorder}`,
            borderRadius: 12,
            padding: "18px 24px",
            fontSize: 15,
            fontWeight: 600,
            fontFamily: font,
            cursor: "pointer",
            transition: "all 0.25s",
            textAlign: "left",
            position: "relative",
            overflow: "hidden",
            textDecoration: "none",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4, color: C.text }}>Start a new business</div>
              <div style={{ fontSize: 12.5, fontWeight: 400, color: C.textSec }}>I have a skill but no business yet</div>
            </div>
            <span style={{ fontSize: 20, color: C.gold }}>→</span>
          </div>
        </Link>
        <Link
          href="/wizard?existing=true"
          style={{
            flex: 1,
            minWidth: 250,
            background: C.greenDim,
            color: C.text,
            border: `1px solid rgba(52,211,153,0.2)`,
            borderRadius: 12,
            padding: "18px 24px",
            fontSize: 15,
            fontWeight: 600,
            fontFamily: font,
            cursor: "pointer",
            transition: "all 0.25s",
            textAlign: "left",
            position: "relative",
            overflow: "hidden",
            textDecoration: "none",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4, color: C.text }}>Move my business</div>
              <div style={{ fontSize: 12.5, fontWeight: 400, color: C.textSec }}>I already have clients & need better tools</div>
            </div>
            <span style={{ fontSize: 20, color: C.green }}>→</span>
          </div>
        </Link>
      </div>

      <p style={{ fontFamily: font, fontSize: 12, color: C.textDim, marginTop: 20 }}>
        Free plan available · No credit card required · 5% platform fee on transactions
      </p>
    </div>
  </section>
);

/* ─── DASHBOARD MOCKUP ─── */
const DashboardMockup = () => (
  <section style={{ padding: "0 32px 60px" }}>
    <div
      style={{
        maxWidth: 960,
        margin: "0 auto",
        background: C.surface,
        border: `1px solid ${C.border}`,
        borderRadius: 14,
        overflow: "hidden",
        boxShadow: "0 60px 120px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.03)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 18px", borderBottom: `1px solid ${C.border}` }}>
        {["#FF5F57", "#FFBD2E", "#28CA41"].map((c) => (
          <div key={c} style={{ width: 11, height: 11, borderRadius: "50%", background: c }} />
        ))}
        <div style={{ flex: 1, textAlign: "center", fontFamily: font, fontSize: 11.5, color: C.textDim }}>app.kovra.com</div>
      </div>
      <div style={{ display: "flex", minHeight: 380 }}>
        {/* Sidebar */}
        <div style={{ width: 200, borderRight: `1px solid ${C.border}`, padding: "16px 0", flexShrink: 0 }}>
          <div style={{ padding: "0 14px", marginBottom: 20 }}>
            <Logo />
          </div>
          {[
            { n: "Dashboard", active: true },
            { n: "Clients" },
            { n: "Proposals" },
            { n: "Invoices" },
            { n: "Products" },
            { n: "Calendar" },
            { n: "Email" },
            { n: "Website" },
            { n: "Marketing" },
            { n: "Analytics" },
          ].map((item) => (
            <div
              key={item.n}
              style={{
                padding: "9px 18px",
                fontFamily: font,
                fontSize: 13,
                fontWeight: item.active ? 600 : 400,
                color: item.active ? C.text : C.textDim,
                background: item.active ? C.goldDim : "transparent",
                borderLeft: item.active ? `2px solid ${C.gold}` : "2px solid transparent",
              }}
            >
              {item.n}
            </div>
          ))}
        </div>
        {/* Main */}
        <div style={{ flex: 1, padding: 20, overflow: "hidden" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <div>
              <h3 style={{ fontFamily: font, fontSize: 18, fontWeight: 600, color: C.text, margin: 0 }}>Good afternoon, Maya</h3>
              <p style={{ fontFamily: font, fontSize: 12.5, color: C.textDim, margin: "3px 0 0" }}>
                Here&apos;s what&apos;s happening with your business today
              </p>
            </div>
            <button
              style={{
                background: C.gold,
                color: "#0A0A0A",
                border: "none",
                borderRadius: 7,
                padding: "7px 14px",
                fontSize: 12.5,
                fontWeight: 600,
                fontFamily: font,
              }}
            >
              + New client
            </button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 16 }}>
            {[
              { l: "Revenue (MTD)", v: "$12,480", d: "+18%", c: C.green },
              { l: "Active clients", v: "34", d: "+3 this week", c: C.green },
              { l: "Open proposals", v: "7", d: "$28.5K pipeline", c: C.gold },
              { l: "Pending invoices", v: "4", d: "$6,200 due", c: C.orange },
            ].map((s) => (
              <div
                key={s.l}
                style={{
                  background: C.bg,
                  border: `1px solid ${C.border}`,
                  borderRadius: 9,
                  padding: 14,
                }}
              >
                <div style={{ fontFamily: font, fontSize: 10.5, color: C.textDim, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>
                  {s.l}
                </div>
                <span style={{ fontFamily: font, fontSize: 20, fontWeight: 700, color: C.text }}>{s.v}</span>
                <span style={{ fontFamily: font, fontSize: 11, fontWeight: 500, color: s.c, marginLeft: 8 }}>{s.d}</span>
              </div>
            ))}
          </div>
          <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 9, padding: 14 }}>
            <div style={{ fontFamily: font, fontSize: 12.5, fontWeight: 600, color: C.text, marginBottom: 12 }}>Recent activity</div>
            {[
              { t: "Sarah Johnson accepted proposal — $4,500", time: "2m ago", c: C.green },
              { t: "New lead: Marcus Chen via website", time: "1h ago", c: C.gold },
              { t: "Invoice INV-0024 paid — $2,100", time: "3h ago", c: C.green },
              { t: "Blog post published: 5 Tips for New Clients", time: "5h ago", c: C.blue },
            ].map((item, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "9px 0",
                  borderTop: i > 0 ? `1px solid ${C.border}` : "none",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: item.c }} />
                  <span style={{ fontFamily: font, fontSize: 12.5, color: C.textSec }}>{item.t}</span>
                </div>
                <span style={{ fontFamily: font, fontSize: 11, color: C.textDim, whiteSpace: "nowrap" }}>{item.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </section>
);

/* ─── SOCIAL PROOF BAR ─── */
const SocialProof = () => (
  <section style={{ padding: "44px 32px", borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}` }}>
    <div style={{ maxWidth: 860, margin: "0 auto", display: "flex", justifyContent: "center", gap: 64, flexWrap: "wrap" }}>
      {[
        { v: "2,400+", l: "Businesses launched" },
        { v: "$8M+", l: "Revenue processed" },
        { v: "98%", l: "Client satisfaction" },
        { v: "4.9★", l: "Platform rating" },
      ].map((s, i) => (
        <div key={i} style={{ textAlign: "center" }}>
          <div style={{ fontFamily: font, fontSize: 28, fontWeight: 700, color: C.text, letterSpacing: "-0.02em" }}>{s.v}</div>
          <div style={{ fontFamily: font, fontSize: 12.5, color: C.textDim, marginTop: 3 }}>{s.l}</div>
        </div>
      ))}
    </div>
  </section>
);

/* ─── FOUR PILLARS ─── */
const FourPillars = () => {
  const pillars = [
    {
      tag: "Build",
      color: C.gold,
      dimColor: C.goldDim,
      title: "Launch a professional business in minutes.",
      desc: "Answer a few questions about your skill. Kovra\u2019s AI generates your website, sets up your booking system, and creates your business infrastructure \u2014 all customized to your industry.",
      features: [
        { name: "AI Website Builder", detail: "Professional site generated from your answers. Custom domain ready." },
        { name: "Business Setup Wizard", detail: "Guided onboarding that builds your business model, pricing, and positioning." },
        { name: "Custom Domain", detail: "Connect yourbrand.com or use a free kovra.com subdomain." },
        { name: "Mobile-Optimized", detail: "Every site looks perfect on any device, automatically." },
      ],
    },
    {
      tag: "Sell",
      color: C.green,
      dimColor: C.greenDim,
      title: "Services, products, memberships. One checkout.",
      desc: "Book discovery calls, send AI-generated proposals, invoice clients, sell digital products, and run membership subscriptions \u2014 all with Stripe-powered payments built in.",
      features: [
        { name: "Discovery Calls", detail: "Free consultation bookings with calendar sync and automated reminders." },
        { name: "Smart Proposals", detail: "AI generates branded proposals from your call notes. One-click accept & pay." },
        { name: "Invoicing & Payments", detail: "Professional invoices, deposits, payment links. Paid via Stripe." },
        { name: "Digital Products", detail: "Sell ebooks, templates, courses. Instant delivery on purchase." },
        { name: "Memberships", detail: "Recurring subscriptions with gated content and member portal." },
      ],
    },
    {
      tag: "Manage",
      color: C.blue,
      dimColor: C.blueDim,
      title: "Every client, every interaction. One timeline.",
      desc: "Track clients from first website visit to repeat customer. Automate follow-ups, manage support tickets, and run email sequences that nurture leads while you sleep.",
      features: [
        { name: "Built-in CRM", detail: "Contact lifecycle tracking from visitor \u2192 lead \u2192 customer \u2192 advocate." },
        { name: "Email Sequences", detail: "Automated nurture flows, follow-ups, broadcasts, and drip campaigns." },
        { name: "Support Inbox", detail: "Client tickets with AI-suggested replies. Every interaction logged." },
        { name: "Client Portal", detail: "Branded portal where clients view proposals, invoices, and deliverables." },
      ],
    },
    {
      tag: "Grow",
      color: C.purple,
      dimColor: C.purpleDim,
      title: "Marketing that runs itself.",
      desc: "AI writes your blog posts, optimizes your SEO, generates ad copy, monitors competitors, and delivers weekly reports on what\u2019s working \u2014 so you can focus on delivering great work.",
      features: [
        { name: "Blog Engine", detail: "AI-generated posts optimized for your niche. Publish with one click." },
        { name: "SEO Automation", detail: "Auto-generated meta tags, sitemaps, structured data. Rank without thinking." },
        { name: "AI Ad Copy", detail: "Facebook, Instagram, Google ad copy tailored to your business and audience." },
        { name: "Competitor Monitoring", detail: "Track competitor pricing, positioning, and reviews automatically." },
        { name: "Weekly AI Reports", detail: "What\u2019s working, what\u2019s not, and exactly what to do next." },
      ],
    },
  ];

  const [active, setActive] = useState(0);
  const p = pillars[active];

  return (
    <section id="pillars" style={{ padding: "100px 32px" }}>
      <div style={{ maxWidth: 940, margin: "0 auto" }}>
        <p style={{ fontFamily: font, fontSize: 13, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", color: C.gold, margin: "0 0 14px", textAlign: "center" }}>
          Everything you need
        </p>
        <h2
          style={{
            fontFamily: font,
            fontSize: "clamp(26px, 4vw, 42px)",
            fontWeight: 700,
            letterSpacing: "-0.03em",
            color: C.text,
            margin: "0 0 12px",
            lineHeight: 1.1,
            textAlign: "center",
          }}
        >
          One platform. Four superpowers.
        </h2>
        <p style={{ fontFamily: font, fontSize: 15.5, color: C.textSec, textAlign: "center", margin: "0 0 48px", maxWidth: 500, marginLeft: "auto", marginRight: "auto", lineHeight: 1.6 }}>
          Build your business, sell your services, manage your clients, and grow your revenue — without switching tabs.
        </p>

        {/* Tab bar */}
        <div
          style={{
            display: "flex",
            gap: 6,
            justifyContent: "center",
            marginBottom: 48,
            background: C.surface,
            border: `1px solid ${C.border}`,
            borderRadius: 12,
            padding: 5,
            maxWidth: 480,
            margin: "0 auto 48px",
          }}
        >
          {pillars.map((pl, i) => (
            <button
              key={pl.tag}
              onClick={() => setActive(i)}
              style={{
                flex: 1,
                background: active === i ? C.bg : "transparent",
                color: active === i ? pl.color : C.textDim,
                border: active === i ? `1px solid ${C.borderLight}` : "1px solid transparent",
                borderRadius: 8,
                padding: "10px 0",
                fontSize: 14,
                fontWeight: 600,
                fontFamily: font,
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              {pl.tag}
            </button>
          ))}
        </div>

        {/* Content */}
        <div key={active} style={{ animation: "fadeIn 0.3s ease" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, alignItems: "start" }}>
            <div>
              <div
                style={{
                  display: "inline-block",
                  fontFamily: font,
                  fontSize: 11,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  color: p.color,
                  background: p.dimColor,
                  padding: "4px 10px",
                  borderRadius: 5,
                  marginBottom: 16,
                }}
              >
                {p.tag}
              </div>
              <h3 style={{ fontFamily: font, fontSize: 26, fontWeight: 700, color: C.text, margin: "0 0 12px", lineHeight: 1.2, letterSpacing: "-0.02em" }}>
                {p.title}
              </h3>
              <p style={{ fontFamily: font, fontSize: 14.5, color: C.textSec, margin: 0, lineHeight: 1.65 }}>{p.desc}</p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {p.features.map((f, i) => (
                <div
                  key={i}
                  style={{
                    background: C.surface,
                    border: `1px solid ${C.border}`,
                    borderRadius: 10,
                    padding: "16px 18px",
                    transition: "all 0.2s",
                    cursor: "default",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = p.color;
                    (e.currentTarget as HTMLElement).style.transform = "translateX(4px)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = C.border;
                    (e.currentTarget as HTMLElement).style.transform = "translateX(0)";
                  }}
                >
                  <div style={{ fontFamily: font, fontSize: 14, fontWeight: 600, color: C.text, marginBottom: 4 }}>{f.name}</div>
                  <div style={{ fontFamily: font, fontSize: 12.5, color: C.textDim, lineHeight: 1.5 }}>{f.detail}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }`}</style>
    </section>
  );
};

/* ─── REPLACES STRIP ─── */
const ReplacesStrip = () => (
  <section style={{ padding: "60px 32px", background: C.surface, borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}` }}>
    <div style={{ maxWidth: 940, margin: "0 auto", textAlign: "center" }}>
      <p style={{ fontFamily: font, fontSize: 14, color: C.textSec, margin: "0 0 24px" }}>Kovra replaces your entire tool stack</p>
      <div style={{ display: "flex", justifyContent: "center", gap: 32, flexWrap: "wrap" }}>
        {[
          "Squarespace", "Calendly", "HoneyBook", "PandaDoc", "FreshBooks", "Mailchimp", "Gumroad",
        ].map((name) => (
          <span
            key={name}
            style={{
              fontFamily: font,
              fontSize: 14.5,
              fontWeight: 500,
              color: C.textDim,
              textDecoration: "line-through",
              textDecorationColor: C.textDim,
              transition: "color 0.2s",
            }}
          >
            {name}
          </span>
        ))}
      </div>
    </div>
  </section>
);

/* ─── HOW IT WORKS ─── */
const HowItWorks = () => (
  <section style={{ padding: "100px 32px" }}>
    <div style={{ maxWidth: 760, margin: "0 auto" }}>
      <p style={{ fontFamily: font, fontSize: 13, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", color: C.gold, margin: "0 0 14px", textAlign: "center" }}>
        How it works
      </p>
      <h2
        style={{
          fontFamily: font,
          fontSize: "clamp(26px, 4vw, 42px)",
          fontWeight: 700,
          letterSpacing: "-0.03em",
          color: C.text,
          margin: "0 0 56px",
          lineHeight: 1.1,
          textAlign: "center",
        }}
      >
        From zero to operating.
        <span style={{ color: C.textDim }}> Fifteen minutes.</span>
      </h2>

      {[
        { s: "01", t: "Tell us about your skill", d: "Coaching, design, consulting, fitness, photography — whatever you\u2019re great at. Our AI builds your entire business model around it." },
        { s: "02", t: "Launch your business", d: "Website, booking system, CRM, proposals, invoicing — everything generates in minutes, connected and customized to your industry." },
        { s: "03", t: "Get your first client", d: "Share your site. Leads book a free discovery call. You meet, Kovra generates the proposal. They accept and pay. That\u2019s it." },
        { s: "04", t: "Scale with AI", d: "Blog posts write themselves. SEO runs automatically. Ad copy generates on demand. Weekly reports tell you exactly what to do next." },
      ].map((item, i) => (
        <div
          key={i}
          style={{
            display: "flex",
            gap: 28,
            padding: "28px 0",
            borderTop: i === 0 ? "none" : `1px solid ${C.border}`,
            alignItems: "flex-start",
          }}
        >
          <span style={{ fontFamily: font, fontSize: 44, fontWeight: 700, color: "rgba(200,164,78,0.15)", lineHeight: 1, minWidth: 70 }}>
            {item.s}
          </span>
          <div>
            <h3 style={{ fontFamily: font, fontSize: 19, fontWeight: 600, color: C.text, margin: "0 0 6px" }}>{item.t}</h3>
            <p style={{ fontFamily: font, fontSize: 14.5, color: C.textSec, margin: 0, lineHeight: 1.6, maxWidth: 460 }}>{item.d}</p>
          </div>
        </div>
      ))}
    </div>
  </section>
);

/* ─── DUAL LANE ─── */
const DualLane = () => (
  <section style={{ padding: "80px 32px", background: C.surface, borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}` }}>
    <div style={{ maxWidth: 940, margin: "0 auto" }}>
      <p style={{ fontFamily: font, fontSize: 13, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", color: C.gold, margin: "0 0 14px", textAlign: "center" }}>
        Built for you
      </p>
      <h2 style={{ fontFamily: font, fontSize: "clamp(26px,4vw,38px)", fontWeight: 700, letterSpacing: "-0.03em", color: C.text, margin: "0 0 48px", lineHeight: 1.1, textAlign: "center" }}>
        Whether you&apos;re starting fresh or leveling up.
      </h2>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {[
          {
            label: "Starting from scratch",
            title: "You have a skill. You need a business.",
            points: [
              "AI builds your site, brand, and pricing strategy",
              "Guided setup \u2014 no business experience needed",
              "Built-in coaching that teaches you as you grow",
              "Everything connected from day one",
            ],
            color: C.gold,
            dim: C.goldDim,
          },
          {
            label: "Already running",
            title: "You have clients. You need one platform.",
            points: [
              "Replace 6-8 tools with a single workspace",
              "Import existing clients and data",
              "Professional proposals and invoicing from day one",
              "Marketing automation that scales with you",
            ],
            color: C.green,
            dim: C.greenDim,
          },
        ].map((lane) => (
          <div
            key={lane.label}
            style={{
              background: C.bg,
              border: `1px solid ${C.border}`,
              borderRadius: 14,
              padding: 32,
              transition: "border-color 0.2s",
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = lane.color; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = C.border; }}
          >
            <span
              style={{
                fontFamily: font,
                fontSize: 11,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                color: lane.color,
                background: lane.dim,
                padding: "4px 10px",
                borderRadius: 5,
                display: "inline-block",
                marginBottom: 16,
              }}
            >
              {lane.label}
            </span>
            <h3 style={{ fontFamily: font, fontSize: 20, fontWeight: 600, color: C.text, margin: "0 0 18px", lineHeight: 1.25 }}>
              {lane.title}
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {lane.points.map((pt, i) => (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                  <span style={{ color: lane.color, fontSize: 13, marginTop: 1 }}>✓</span>
                  <span style={{ fontFamily: font, fontSize: 13.5, color: C.textSec, lineHeight: 1.5 }}>{pt}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

/* ─── PRICING ─── */
const Pricing = () => {
  const plans = [
    {
      name: "Free",
      price: "$0",
      period: "",
      desc: "Try Kovra with basic features. Upgrade when you\u2019re ready.",
      features: ["AI-generated website", "Up to 10 clients", "3 proposals/month", "Basic invoicing", "Kovra subdomain", "Community support"],
      cta: "Get started",
      featured: false,
    },
    {
      name: "Starter",
      price: "$49",
      period: "/mo",
      desc: "Everything you need to look professional and land clients.",
      features: ["Everything in Free", "Up to 100 clients", "Unlimited proposals", "Custom domain", "Email sequences", "Blog engine", "Priority support"],
      cta: "Get started",
      featured: false,
    },
    {
      name: "Growth",
      price: "$99",
      period: "/mo",
      desc: "The full toolkit for growing service businesses.",
      features: ["Everything in Starter", "Unlimited clients", "Full CRM + lifecycle tracking", "Digital products & memberships", "SEO automation", "AI ad copy generator", "Competitor monitoring", "Weekly AI reports"],
      cta: "Get started",
      featured: true,
    },
    {
      name: "Scale",
      price: "$199",
      period: "/mo",
      desc: "For established businesses scaling operations.",
      features: ["Everything in Growth", "AI business coach", "Advanced analytics", "White-label proposals", "Member portal", "API access", "Dedicated account manager"],
      cta: "Contact sales",
      featured: false,
    },
  ];

  return (
    <section id="pricing" style={{ padding: "100px 32px" }}>
      <div style={{ maxWidth: 1040, margin: "0 auto" }}>
        <p style={{ fontFamily: font, fontSize: 13, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", color: C.gold, margin: "0 0 14px", textAlign: "center" }}>
          Pricing
        </p>
        <h2 style={{ fontFamily: font, fontSize: "clamp(26px,4vw,42px)", fontWeight: 700, letterSpacing: "-0.03em", color: C.text, margin: "0 0 10px", lineHeight: 1.1, textAlign: "center" }}>
          Less than what you&apos;re paying now.
        </h2>
        <p style={{ fontFamily: font, fontSize: 15, color: C.textSec, textAlign: "center", margin: "0 0 52px" }}>
          Cancel the 7 subscriptions. Keep the one that does it all.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
          {plans.map((plan) => (
            <div
              key={plan.name}
              style={{
                background: plan.featured ? C.surface : "transparent",
                border: `1px solid ${plan.featured ? C.gold : C.border}`,
                borderRadius: 13,
                padding: "28px 22px",
                position: "relative",
                transition: "all 0.2s",
              }}
            >
              {plan.featured && (
                <div
                  style={{
                    position: "absolute",
                    top: -11,
                    left: "50%",
                    transform: "translateX(-50%)",
                    background: C.gold,
                    color: "#0A0A0A",
                    fontFamily: font,
                    fontSize: 10.5,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    padding: "3px 14px",
                    borderRadius: 100,
                    whiteSpace: "nowrap",
                  }}
                >
                  Most popular
                </div>
              )}
              <h3 style={{ fontFamily: font, fontSize: 16, fontWeight: 600, color: C.text, margin: "0 0 6px" }}>{plan.name}</h3>
              <div style={{ display: "flex", alignItems: "baseline", gap: 1, marginBottom: 6 }}>
                <span style={{ fontFamily: font, fontSize: 34, fontWeight: 700, color: C.text, letterSpacing: "-0.03em" }}>{plan.price}</span>
                <span style={{ fontFamily: font, fontSize: 14, color: C.textDim }}>{plan.period}</span>
              </div>
              <p style={{ fontFamily: font, fontSize: 12.5, color: C.textSec, margin: "0 0 20px", lineHeight: 1.5, minHeight: 36 }}>{plan.desc}</p>
              <Link
                href={plan.name === "Scale" ? "/wizard" : "/wizard"}
                style={{
                  display: "block",
                  width: "100%",
                  textAlign: "center",
                  background: plan.featured ? C.gold : "transparent",
                  color: plan.featured ? "#0A0A0A" : C.text,
                  border: plan.featured ? "none" : `1px solid ${C.borderLight}`,
                  borderRadius: 8,
                  padding: "10px 0",
                  fontSize: 13,
                  fontWeight: 600,
                  fontFamily: font,
                  cursor: "pointer",
                  marginBottom: 20,
                  transition: "all 0.2s",
                  textDecoration: "none",
                }}
              >
                {plan.cta}
              </Link>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {plan.features.map((f, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: font, fontSize: 12.5, color: C.textSec }}>
                    <span style={{ color: C.green, fontSize: 12 }}>✓</span>
                    {f}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ─── CTA ─── */
const FinalCTA = () => (
  <section style={{ padding: "100px 32px", borderTop: `1px solid ${C.border}`, textAlign: "center" }}>
    <div style={{ maxWidth: 560, margin: "0 auto" }}>
      <CobraMark size={44} />
      <h2 style={{ fontFamily: font, fontSize: "clamp(26px,4vw,38px)", fontWeight: 700, letterSpacing: "-0.03em", color: C.text, margin: "24px 0 14px", lineHeight: 1.15 }}>
        You have the skill.
        <br />
        Kovra handles everything else.
      </h2>
      <p style={{ fontFamily: font, fontSize: 15.5, color: C.textSec, margin: "0 0 32px", lineHeight: 1.6 }}>
        Join thousands of service professionals who stopped juggling tools and started growing their business.
      </p>
      <Link
        href="/wizard"
        style={{
          background: C.gold,
          color: "#0A0A0A",
          border: "none",
          borderRadius: 10,
          padding: "14px 36px",
          fontSize: 15,
          fontWeight: 600,
          fontFamily: font,
          cursor: "pointer",
          transition: "all 0.2s",
          textDecoration: "none",
          display: "inline-block",
        }}
      >
        Start building for free →
      </Link>
      <p style={{ fontFamily: font, fontSize: 12, color: C.textDim, marginTop: 14 }}>
        Free plan available · No credit card required
      </p>
    </div>
  </section>
);

/* ─── FOOTER ─── */
const Footer = () => (
  <footer style={{ padding: "56px 32px 36px", borderTop: `1px solid ${C.border}` }}>
    <div style={{ maxWidth: 940, margin: "0 auto", display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr", gap: 32 }}>
      <div>
        <Logo />
        <p style={{ fontFamily: font, fontSize: 12.5, color: C.textDim, lineHeight: 1.6, marginTop: 14, maxWidth: 220 }}>
          The all-in-one operating system for service businesses. Build, sell, manage, grow.
        </p>
      </div>
      {[
        { t: "Product", l: [{ label: "Features", href: "#pillars" }, { label: "Pricing", href: "#pricing" }, { label: "Get Started", href: "/wizard" }] },
        { t: "Resources", l: [{ label: "Sign In", href: "/auth/login" }, { label: "Dashboard", href: "/dashboard" }] },
        { t: "Company", l: [{ label: "Contact", href: "mailto:support@kovra.com" }] },
        { t: "Legal", l: [{ label: "Terms", href: "/terms" }, { label: "Privacy", href: "/privacy" }] },
      ].map((col) => (
        <div key={col.t}>
          <h4 style={{ fontFamily: font, fontSize: 12.5, fontWeight: 600, color: C.text, margin: "0 0 14px" }}>{col.t}</h4>
          {col.l.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              style={{ display: "block", fontFamily: font, fontSize: 12.5, color: C.textDim, textDecoration: "none", marginBottom: 9 }}
            >
              {link.label}
            </Link>
          ))}
        </div>
      ))}
    </div>
    <div style={{ maxWidth: 940, margin: "36px auto 0", paddingTop: 20, borderTop: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <span style={{ fontFamily: font, fontSize: 11.5, color: C.textDim }}>© 2026 Kovra, Inc. All rights reserved.</span>
    </div>
  </footer>
);

/* ─── APP ─── */
export default function KovraLanding() {
  return (
    <div style={{ background: C.bg, minHeight: "100vh" }}>
      <style>{`
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        ::selection { background: rgba(200,164,78,0.3); color: #FAFAFA; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #0A0A0A; }
        ::-webkit-scrollbar-thumb { background: #333; border-radius: 3px; }
      `}</style>
      <Nav />
      <Hero />
      <DashboardMockup />
      <SocialProof />
      <FourPillars />
      <ReplacesStrip />
      <HowItWorks />
      <DualLane />
      <Pricing />
      <FinalCTA />
      <Footer />
    </div>
  );
}
