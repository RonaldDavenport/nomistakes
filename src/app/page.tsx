"use client";

import { useState } from "react";
import Link from "next/link";
import { T, CTA_GRAD } from "@/lib/design-tokens";

/* ═══════════════════════════════════════
   DATA
   ═══════════════════════════════════════ */
const SHOWCASE_SITES = [
  { name: "FitCoach Pro", type: "Coaching", time: "47s", img: "/landing/showcase-fitcoach.jpg" },
  { name: "Pixel & Co.", type: "Freelance", time: "51s", img: "/landing/showcase-pixelco.jpg" },
  { name: "ResumeEdge", type: "Consulting", time: "44s", img: "/landing/showcase-resumeedge.jpg" },
  { name: "PlannerVault", type: "Templates", time: "38s", img: "/landing/showcase-plannervault.jpg" },
  { name: "ShutterClass", type: "Courses", time: "52s", img: "/landing/showcase-shutterclass.jpg" },
  { name: "SocialPulse", type: "Agency", time: "49s", img: "/landing/showcase-socialpulse.jpg" },
  { name: "InnerPath", type: "Wellness", time: "41s", img: "/landing/showcase-innerpath.jpg" },
  { name: "DigitalShelf", type: "E-commerce", time: "55s", img: "/landing/showcase-digitalshelf.jpg" },
];

const FEATURE_TABS = [
  { id: "sites", label: "AI Sites" },
  { id: "editor", label: "Site Editor" },
  { id: "videos", label: "Videos & Ads" },
  { id: "branding", label: "Branding" },
  { id: "coach", label: "AI Coach" },
  { id: "content", label: "Content" },
  { id: "audits", label: "Audits" },
  { id: "payments", label: "Payments" },
  { id: "analytics", label: "Analytics" },
];

const FAQS = [
  { q: "How does No Mistakes work?", a: "Answer 4 questions about your skills, time, budget, and business type. AI generates 3 custom business concepts. Pick one, and AI builds your entire business \u2014 website, brand, products, checkout \u2014 in about 60 seconds." },
  { q: "Do I need any technical skills?", a: "None. No coding, no design, no business experience. If you can tap a button and type a sentence, you can launch a business." },
  { q: "What types of businesses can I create?", a: "Coaching, freelance services, e-commerce stores, consulting, online courses, digital templates, ebooks, and memberships. If you have a skill, we can build a business around it." },
  { q: "What are AI credits and how do they work?", a: "Credits power AI features like blog posts, ad copy, video scripts, and competitor analysis. Free plan includes 50 credits/month. Each action costs 1\u20135 credits depending on complexity." },
  { q: "Can I use my own custom domain?", a: "Yes. Connect any domain you own. We handle SSL and DNS guidance. Your site launches on a free subdomain immediately, and you can add a custom domain anytime." },
  { q: "How is this different from Wix or Shopify?", a: "They give you a blank canvas and say 'good luck.' We give you a finished business. Website, branding, products, copy, checkout \u2014 all done by AI in 60 seconds. Plus an AI coach that pushes you to your first customer." },
  { q: "Can I edit my site after it's generated?", a: "Absolutely. Use the visual editor or just tell the AI what to change in plain English. Swap images, rewrite copy, add pages \u2014 all without touching code." },
  { q: "What if I want to cancel?", a: "Cancel anytime. No contracts, no penalties. Your site stays live on the free plan. We don't hold your business hostage." },
];

/* ═══════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════ */
function Glass({ children, style, ...p }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div {...p} style={{ background: T.glass, border: `1px solid ${T.border}`, borderRadius: 20, backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", ...style }}>
      {children}
    </div>
  );
}

function MockBrowser({ children, height = 200, grad }: { children?: React.ReactNode; height?: number; grad?: string }) {
  return (
    <div style={{ borderRadius: 14, overflow: "hidden", border: `1px solid ${T.border}`, background: T.bgEl }}>
      <div style={{ display: "flex", gap: 5, padding: "8px 12px", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
        <span style={{ width: 6, height: 6, borderRadius: "50%", background: "rgba(255,255,255,0.08)" }} />
        <span style={{ width: 6, height: 6, borderRadius: "50%", background: "rgba(255,255,255,0.08)" }} />
        <span style={{ width: 6, height: 6, borderRadius: "50%", background: "rgba(255,255,255,0.08)" }} />
      </div>
      <div style={{ height, background: grad || "linear-gradient(135deg,#08081A,#14082A)", padding: 16, position: "relative" }}>
        {children || (
          <>
            <div style={{ height: 10, width: "45%", borderRadius: 5, background: "rgba(255,255,255,0.06)", marginBottom: 8 }} />
            <div style={{ height: 7, width: "28%", borderRadius: 4, background: "rgba(123,57,252,0.15)", marginBottom: 16 }} />
            <div style={{ display: "flex", gap: 8 }}>
              <div style={{ flex: 1, height: 50, borderRadius: 8, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)" }} />
              <div style={{ flex: 1, height: 50, borderRadius: 8, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)" }} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function SiteCard({ name, type, time, img }: { name: string; type: string; time: string; img: string }) {
  return (
    <div style={{ borderRadius: 16, overflow: "hidden", border: `1px solid ${T.border}`, background: T.bgEl, cursor: "pointer", transition: "transform 0.2s, box-shadow 0.2s" }}
      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 12px 40px rgba(123,57,252,0.15)"; }}
      onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; }}
    >
      <div style={{ height: 200, position: "relative", overflow: "hidden" }}>
        <img src={img} alt={name} loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </div>
      <div style={{ padding: "14px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <p style={{ fontWeight: 600, fontSize: "0.85rem", color: T.text, marginBottom: 2 }}>{name}</p>
          <span style={{ fontSize: "0.7rem", color: T.purpleLight, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>{type}</span>
        </div>
        <span style={{ fontSize: "0.7rem", color: T.text3 }}>Built in {time}</span>
      </div>
    </div>
  );
}

function Stat({ value, label, color }: { value: string; label: string; color?: string }) {
  return (
    <div style={{ textAlign: "center" }}>
      <p style={{ fontFamily: T.mono, fontSize: "clamp(32px, 5vw, 56px)", fontWeight: 700, color: color || T.text, letterSpacing: "-1px" }}>{value}</p>
      <p style={{ fontSize: "0.8rem", color: T.text3, marginTop: 4 }}>{label}</p>
    </div>
  );
}

function Check() {
  return (
    <svg width="16" height="16" viewBox="0 0 20 20" fill="#22C55E" style={{ flexShrink: 0, marginTop: 2 }}>
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
    </svg>
  );
}

/* ═══════════════════════════════════════
   PAGE
   ═══════════════════════════════════════ */
export default function Home() {
  const [featureTab, setFeatureTab] = useState("sites");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div style={{ background: T.bg, color: T.text, fontFamily: "'Inter', sans-serif" }}>

      {/* ─── NAV ─── */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        background: "rgba(0,0,0,0.7)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)",
        borderBottom: `1px solid ${T.border}`,
      }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 24px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link href="/" style={{ textDecoration: "none", fontSize: "1.1rem", fontWeight: 800, fontFamily: T.h, color: T.text, letterSpacing: "-0.5px" }}>
            No Mistakes
          </Link>
          <div className="hidden md:flex" style={{ gap: 32, alignItems: "center" }}>
            {["Features", "Showcase", "Pricing", "FAQ"].map(l => (
              <a key={l} href={`#${l.toLowerCase()}`} style={{ fontSize: "0.85rem", color: T.text3, textDecoration: "none", transition: "color 0.15s" }}
                onMouseEnter={e => e.currentTarget.style.color = T.text}
                onMouseLeave={e => e.currentTarget.style.color = T.text3 as string}
              >{l}</a>
            ))}
          </div>
          <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
            <Link href="/auth/login" className="hidden sm:block" style={{ fontSize: "0.85rem", color: T.text3, textDecoration: "none" }}>Log In</Link>
            <Link href="/wizard" style={{
              fontSize: "0.85rem", fontWeight: 600, color: "#fff",
              background: CTA_GRAD, padding: "10px 22px", borderRadius: 100, textDecoration: "none",
            }}>Start Building</Link>
          </div>
        </div>
      </nav>

      {/* ═══════════ SECTION 1: HERO ═══════════ */}
      <section style={{ minHeight: "100vh", paddingTop: 120, paddingBottom: 60, position: "relative", overflow: "hidden" }}>
        {/* Hero background image */}
        <div style={{ position: "absolute", inset: 0, zIndex: 0 }}>
          <img src="/landing/hero-bg.jpg" alt="" style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.35 }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.85) 60%, #000000 100%)" }} />
        </div>
        <div style={{ position: "absolute", top: -200, left: "50%", transform: "translateX(-50%)", width: 800, height: 800, background: "radial-gradient(circle, rgba(123,57,252,0.15), transparent 70%)", pointerEvents: "none", zIndex: 1 }} />

        <div style={{ maxWidth: 900, margin: "0 auto", textAlign: "center", padding: "0 24px", position: "relative", zIndex: 2 }}>
          <Glass style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 20px", borderRadius: 100, marginBottom: 32, opacity: 0, animation: "fadeIn 0.5s ease 0.1s forwards" }}>
            <span style={{ color: T.gold }}>&#10022;</span>
            <span style={{ fontSize: "0.8rem", color: T.text2 }}>Over 2,000 Businesses Launched</span>
          </Glass>

          <h1 style={{
            fontFamily: T.h, fontSize: "clamp(40px, 6vw, 72px)", fontWeight: 800,
            lineHeight: 1.05, letterSpacing: "-2px", marginBottom: 24,
            opacity: 0, animation: "fadeIn 0.6s ease 0.2s forwards",
          }}>
            Your Business. Built by AI.<br />Launched in 60 Seconds.
          </h1>

          <p style={{ fontSize: "1.15rem", color: T.text2, maxWidth: 540, margin: "0 auto 40px", lineHeight: 1.7, opacity: 0, animation: "fadeIn 0.6s ease 0.35s forwards" }}>
            Tell us what you&apos;re good at. AI creates your website, brand, products, and checkout. You start selling today.
          </p>

          <div style={{ opacity: 0, animation: "fadeIn 0.6s ease 0.5s forwards" }}>
            <Link href="/wizard" style={{
              display: "inline-block", padding: "18px 44px", borderRadius: 12,
              background: CTA_GRAD, color: "#fff", fontWeight: 700, fontSize: "1rem",
              textDecoration: "none", boxShadow: "0 0 60px rgba(123,57,252,0.3)",
            }}>
              Start Building &mdash; It&apos;s Free
            </Link>
            <p style={{ fontSize: "0.8rem", color: T.text3, marginTop: 16 }}>No credit card required</p>
          </div>
        </div>

        {/* Hero image mosaic */}
        <div style={{ maxWidth: 1200, margin: "64px auto 0", padding: "0 24px", opacity: 0, animation: "fadeIn 0.8s ease 0.7s forwards", position: "relative", zIndex: 2 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
            {[
              { l: "BoldStudio", img: "/landing/hero-boldstudio.jpg" },
              { l: "NomadKit", img: "/landing/hero-nomadkit.jpg" },
              { l: "CraftHaus", img: "/landing/hero-crafthaus.jpg" },
              { l: "LaunchPad", img: "/landing/hero-launchpad.jpg" },
            ].map(item => (
              <div key={item.l} style={{ borderRadius: 14, overflow: "hidden", border: `1px solid ${T.border}`, background: T.bgEl }}>
                <div style={{ display: "flex", gap: 5, padding: "8px 12px", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: "rgba(255,255,255,0.08)" }} />
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: "rgba(255,255,255,0.08)" }} />
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: "rgba(255,255,255,0.08)" }} />
                </div>
                <div style={{ height: 140, position: "relative" }}>
                  <img src={item.img} alt={item.l} loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(10,10,15,0.6), transparent 40%)" }} />
                  <div style={{ position: "absolute", bottom: 8, left: 12 }}>
                    <span style={{ fontSize: 10, color: "rgba(255,255,255,0.55)", fontWeight: 500 }}>{item.l}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ SECTION 2: TRUST BAR ═══════════ */}
      <section style={{ padding: "36px 24px", borderTop: `1px solid ${T.border}`, borderBottom: `1px solid ${T.border}` }}>
        <div style={{ maxWidth: 900, margin: "0 auto", textAlign: "center" }}>
          <p style={{ fontSize: "0.75rem", color: T.text3, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 20 }}>
            Trusted by entrepreneurs. Powered by world-class tools.
          </p>
          <div style={{ display: "flex", justifyContent: "center", gap: 48, flexWrap: "wrap", alignItems: "center" }}>
            {[
              { src: "/landing/logos/stripe.svg", alt: "Stripe", h: 28 },
              { src: "/landing/logos/openai.svg", alt: "OpenAI", h: 26 },
              { src: "/landing/logos/vercel.svg", alt: "Vercel", h: 22 },
              { src: "/landing/logos/supabase.svg", alt: "Supabase", h: 26 },
            ].map(logo => (
              <img key={logo.alt} src={logo.src} alt={logo.alt} style={{ height: logo.h, opacity: 0.3, filter: "brightness(0) invert(1)" }} />
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ SECTION 3: DASHBOARD PREVIEW ═══════════ */}
      <section style={{ padding: "100px 24px", background: T.bgAlt }}>
        <div style={{ maxWidth: 1080, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <h2 style={{ fontFamily: T.h, fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 800, letterSpacing: "-1px", marginBottom: 16 }}>
              You bring the idea. We build the business.
            </h2>
            <p style={{ fontSize: "1rem", color: T.text2, maxWidth: 520, margin: "0 auto" }}>
              Join 2,000+ entrepreneurs who stopped planning and started launching.
            </p>
          </div>
          <div style={{ borderRadius: 14, overflow: "hidden", border: `1px solid ${T.border}`, background: T.bgEl, boxShadow: "0 24px 80px rgba(123,57,252,0.08)" }}>
            <div style={{ display: "flex", gap: 5, padding: "10px 14px", borderBottom: "1px solid rgba(255,255,255,0.04)", background: "rgba(255,255,255,0.02)" }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#FF5F57" }} />
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#FEBC2E" }} />
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#28C840" }} />
              <span style={{ flex: 1, marginLeft: 12, height: 20, borderRadius: 6, background: "rgba(255,255,255,0.04)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontSize: 10, color: T.text3 }}>nomistakes.ai/dashboard</span>
              </span>
            </div>
            <div style={{ position: "relative", height: 400 }}>
              <img src="/landing/dashboard-viz.jpg" alt="NoMistakes Dashboard" loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(6,6,26,0.4), transparent 30%)" }} />
              {/* Floating overlay stats */}
              <div style={{ position: "absolute", bottom: 20, left: 20, right: 20, display: "flex", gap: 12 }}>
                <Glass style={{ flex: 1, padding: "14px 16px" }}>
                  <p style={{ fontSize: 9, color: T.text3, marginBottom: 4 }}>Site Visitors</p>
                  <p style={{ fontFamily: T.mono, fontSize: 20, fontWeight: 700, color: T.text }}>128</p>
                </Glass>
                <Glass style={{ flex: 1, padding: "14px 16px" }}>
                  <p style={{ fontSize: 9, color: T.text3, marginBottom: 4 }}>Revenue</p>
                  <p style={{ fontFamily: T.mono, fontSize: 20, fontWeight: 700, color: T.gold }}>$247</p>
                </Glass>
                <Glass style={{ flex: 1, padding: "14px 16px" }}>
                  <p style={{ fontSize: 9, color: T.text3, marginBottom: 4 }}>AI Coach</p>
                  <p style={{ fontSize: 11, color: T.purpleLight, fontWeight: 500 }}>Day 8 &middot; Active</p>
                </Glass>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ SECTION 4: FEATURES (TABS) ═══════════ */}
      <section id="features" style={{ padding: "100px 24px" }}>
        <div style={{ maxWidth: 1080, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <p style={{ fontSize: "0.75rem", fontWeight: 600, color: T.purple, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 12 }}>Features</p>
            <h2 style={{ fontFamily: T.h, fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 800, letterSpacing: "-1px" }}>
              The features you need, the simplicity you want.
            </h2>
          </div>

          {/* Tab row */}
          <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap", marginBottom: 40 }}>
            {FEATURE_TABS.map(tab => (
              <button key={tab.id} onClick={() => setFeatureTab(tab.id)} style={{
                padding: "10px 22px", borderRadius: 100, border: "none", cursor: "pointer",
                fontSize: "0.85rem", fontWeight: 600, transition: "all 0.15s",
                background: featureTab === tab.id ? CTA_GRAD : T.glass,
                color: featureTab === tab.id ? "#fff" : T.text3,
              }}>{tab.label}</button>
            ))}
          </div>

          {/* Tab content */}
          <div>
            {featureTab === "sites" && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 12 }}>
                {[
                  { label: "Coaching Website", img: "/landing/feature-site-coaching.jpg" },
                  { label: "Agency Portfolio", img: "/landing/feature-site-agency.jpg" },
                  { label: "Digital Store", img: "/landing/feature-site-store.jpg" },
                  { label: "Consulting Site", img: "/landing/feature-site-consulting.jpg" },
                  { label: "Online Courses", img: "/landing/feature-site-courses.jpg" },
                  { label: "SaaS Dashboard", img: "/landing/feature-site-saas.jpg" },
                ].map(site => (
                  <div key={site.label} style={{ borderRadius: 14, overflow: "hidden", border: `1px solid ${T.border}`, background: T.bgEl }}>
                    <div style={{ display: "flex", gap: 5, padding: "8px 12px", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                      <span style={{ width: 6, height: 6, borderRadius: "50%", background: "rgba(255,255,255,0.08)" }} />
                      <span style={{ width: 6, height: 6, borderRadius: "50%", background: "rgba(255,255,255,0.08)" }} />
                      <span style={{ width: 6, height: 6, borderRadius: "50%", background: "rgba(255,255,255,0.08)" }} />
                    </div>
                    <div style={{ height: 200, position: "relative" }}>
                      <img src={site.img} alt={site.label} loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(10,10,15,0.6), transparent 30%)" }} />
                      <div style={{ position: "absolute", bottom: 8, left: 12 }}><span style={{ fontSize: 10, color: "rgba(255,255,255,0.55)" }}>{site.label}</span></div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {featureTab === "editor" && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                {/* Editor hero */}
                <div style={{ gridColumn: "1 / -1", borderRadius: 14, overflow: "hidden", border: `1px solid ${T.border}`, position: "relative", height: 280, background: T.bgEl }}>
                  {/* Mock editor UI */}
                  <div style={{ display: "flex", height: "100%" }}>
                    {/* Sidebar */}
                    <div style={{ width: 200, borderRight: `1px solid ${T.border}`, padding: 16, display: "flex", flexDirection: "column", gap: 6 }}>
                      <p style={{ fontSize: 10, fontWeight: 600, color: T.text3, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>Sections</p>
                      {["Hero", "About", "Features", "Products", "Testimonials", "FAQ", "Contact"].map((s, i) => (
                        <div key={s} style={{ padding: "8px 10px", borderRadius: 8, background: i === 0 ? "rgba(123,57,252,0.1)" : "transparent", border: i === 0 ? "1px solid rgba(123,57,252,0.2)" : "1px solid transparent" }}>
                          <span style={{ fontSize: 11, color: i === 0 ? T.purpleLight : T.text3, fontWeight: i === 0 ? 600 : 400 }}>{s}</span>
                        </div>
                      ))}
                    </div>
                    {/* Main area */}
                    <div style={{ flex: 1, padding: 20 }}>
                      <div style={{ display: "flex", gap: 8, marginBottom: 16, alignItems: "center" }}>
                        <div style={{ flex: 1, padding: "10px 14px", borderRadius: 10, background: "rgba(123,57,252,0.06)", border: "1px solid rgba(123,57,252,0.15)" }}>
                          <span style={{ fontSize: 12, color: T.text2 }}>&quot;Make the headline bolder and add a customer count&quot;</span>
                        </div>
                        <div style={{ padding: "10px 16px", borderRadius: 10, background: CTA_GRAD }}>
                          <span style={{ fontSize: 11, color: "#fff", fontWeight: 600 }}>Send</span>
                        </div>
                      </div>
                      <div style={{ padding: 16, borderRadius: 12, background: "rgba(123,57,252,0.04)", border: "1px solid rgba(123,57,252,0.1)" }}>
                        <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 8 }}>
                          <div style={{ width: 8, height: 8, borderRadius: "50%", background: T.purple }} />
                          <span style={{ fontSize: 10, color: T.purpleLight, fontWeight: 500 }}>AI Editor</span>
                        </div>
                        <p style={{ fontSize: 11, color: T.text2, lineHeight: 1.5 }}>Done! I&apos;ve updated the hero headline to &quot;Trusted by 2,000+ entrepreneurs&quot; and increased the font weight. I also regenerated the hero image to match the new direction.</p>
                      </div>
                    </div>
                  </div>
                </div>
                {/* AI-powered editing */}
                <Glass style={{ padding: 20 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                    <div style={{ width: 28, height: 28, borderRadius: 8, background: CTA_GRAD, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <span style={{ fontSize: 13 }}>&#9998;</span>
                    </div>
                    <p style={{ fontSize: "0.85rem", fontWeight: 600, color: T.text }}>Edit With Plain English</p>
                  </div>
                  <p style={{ fontSize: "0.78rem", color: T.text3, lineHeight: 1.5, marginBottom: 14 }}>Type what you want changed. AI rewrites copy, swaps images, adds sections, and updates your live site instantly.</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {["\"Change the hero image to something warmer\"", "\"Add a pricing section with 3 tiers\"", "\"Rewrite the about page to sound more confident\""].map(ex => (
                      <div key={ex} style={{ padding: "6px 10px", borderRadius: 6, background: "rgba(123,57,252,0.06)", border: "1px solid rgba(123,57,252,0.08)" }}>
                        <span style={{ fontSize: 10, color: T.purpleLight, fontStyle: "italic" }}>{ex}</span>
                      </div>
                    ))}
                  </div>
                </Glass>
                {/* Live preview */}
                <Glass style={{ padding: 20 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                    <div style={{ width: 28, height: 28, borderRadius: 8, background: CTA_GRAD, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <span style={{ fontSize: 13 }}>&#128187;</span>
                    </div>
                    <p style={{ fontSize: "0.85rem", fontWeight: 600, color: T.text }}>Live Preview</p>
                  </div>
                  <p style={{ fontSize: "0.78rem", color: T.text3, lineHeight: 1.5, marginBottom: 14 }}>See every change in real-time. Toggle between desktop and mobile views. Auto-save with full undo history.</p>
                  <div style={{ display: "flex", gap: 8 }}>
                    <div style={{ flex: 1, padding: "8px 10px", borderRadius: 8, background: "rgba(123,57,252,0.1)", border: "1px solid rgba(123,57,252,0.15)", textAlign: "center" }}>
                      <span style={{ fontSize: 10, color: T.purpleLight, fontWeight: 600 }}>Desktop</span>
                    </div>
                    <div style={{ flex: 1, padding: "8px 10px", borderRadius: 8, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)", textAlign: "center" }}>
                      <span style={{ fontSize: 10, color: T.text3 }}>Mobile</span>
                    </div>
                  </div>
                </Glass>
                {/* 11 editable sections */}
                <Glass style={{ padding: 20, gridColumn: "1 / -1" }}>
                  <p style={{ fontSize: "0.85rem", fontWeight: 600, color: T.text, marginBottom: 14 }}>11 Editable Sections — Zero Code</p>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {["Hero","About","Features","Products","Testimonials","Process","FAQ","CTA","Contact","SEO","Brand"].map(s => (
                      <span key={s} style={{ padding: "6px 14px", borderRadius: 100, background: "rgba(123,57,252,0.08)", border: "1px solid rgba(123,57,252,0.15)", fontSize: "0.72rem", color: T.purpleLight, fontWeight: 500 }}>{s}</span>
                    ))}
                  </div>
                </Glass>
              </div>
            )}

            {featureTab === "videos" && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                {/* Video generation hero */}
                <div style={{ gridColumn: "1 / -1", borderRadius: 14, overflow: "hidden", border: `1px solid ${T.border}`, position: "relative", height: 280, background: T.bgEl }}>
                  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(123,57,252,0.08), rgba(168,85,247,0.04))" }} />
                  <div style={{ position: "relative", height: "100%", display: "flex", alignItems: "center", padding: "0 40px", gap: 32 }}>
                    {/* Video player mockup */}
                    <div style={{ flex: "0 0 320px", height: 200, borderRadius: 12, background: "#0a0a12", border: `1px solid ${T.border}`, overflow: "hidden", position: "relative" }}>
                      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(123,57,252,0.15), rgba(245,158,11,0.1))" }} />
                      <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: 48, height: 48, borderRadius: "50%", background: "rgba(255,255,255,0.15)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <span style={{ fontSize: 20, marginLeft: 3 }}>&#9654;</span>
                      </div>
                      <div style={{ position: "absolute", bottom: 8, left: 8, right: 8, display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ flex: 1, height: 3, borderRadius: 2, background: "rgba(255,255,255,0.1)" }}>
                          <div style={{ width: "35%", height: "100%", borderRadius: 2, background: T.purple }} />
                        </div>
                        <span style={{ fontSize: 9, color: T.text3 }}>0:15</span>
                      </div>
                    </div>
                    <div>
                      <p style={{ fontFamily: T.h, fontSize: "1.3rem", fontWeight: 700, color: T.text, marginBottom: 8 }}>AI-Generated Video & Image Ads</p>
                      <p style={{ fontSize: "0.85rem", color: T.text2, lineHeight: 1.6, maxWidth: 340 }}>Promo videos, UGC-style clips, and scroll-stopping image ads — generated from your business data. Ready for Meta, TikTok, and Twitter.</p>
                    </div>
                  </div>
                </div>
                {/* Promo videos */}
                <Glass style={{ padding: 20 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                    <div style={{ width: 28, height: 28, borderRadius: 8, background: CTA_GRAD, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <span style={{ fontSize: 13 }}>&#127909;</span>
                    </div>
                    <p style={{ fontSize: "0.85rem", fontWeight: 600, color: T.text }}>Promo Videos</p>
                  </div>
                  <p style={{ fontSize: "0.78rem", color: T.text3, lineHeight: 1.5, marginBottom: 14 }}>Full product showcase videos with AI voiceover. Script, narration, and visuals — generated automatically from your brand.</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {[{ s: "Script", c: T.green }, { s: "Voiceover", c: T.green }, { s: "Rendering", c: T.purple }].map(step => (
                      <div key={step.s} style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        <div style={{ width: 6, height: 6, borderRadius: "50%", background: step.c }} />
                        <span style={{ fontSize: 11, color: T.text2 }}>{step.s}</span>
                      </div>
                    ))}
                  </div>
                </Glass>
                {/* UGC & social clips */}
                <Glass style={{ padding: 20 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                    <div style={{ width: 28, height: 28, borderRadius: 8, background: "linear-gradient(135deg, #F59E0B, #EF4444)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <span style={{ fontSize: 13 }}>&#128248;</span>
                    </div>
                    <p style={{ fontSize: "0.85rem", fontWeight: 600, color: T.text }}>UGC-Style Ads</p>
                  </div>
                  <p style={{ fontSize: "0.78rem", color: T.text3, lineHeight: 1.5, marginBottom: 14 }}>Short-form video clips designed for social feeds. Authentic, scroll-stopping content that converts — no filming needed.</p>
                  <div style={{ display: "flex", gap: 8 }}>
                    {["Meta", "TikTok", "Twitter"].map(p => (
                      <span key={p} style={{ padding: "5px 12px", borderRadius: 100, background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.15)", fontSize: "0.7rem", color: T.gold, fontWeight: 500 }}>{p}</span>
                    ))}
                  </div>
                </Glass>
                {/* Image ads */}
                <Glass style={{ padding: 20, gridColumn: "1 / -1" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                    <div style={{ width: 28, height: 28, borderRadius: 8, background: CTA_GRAD, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <span style={{ fontSize: 13 }}>&#128444;</span>
                    </div>
                    <p style={{ fontSize: "0.85rem", fontWeight: 600, color: T.text }}>AI Image Generation</p>
                  </div>
                  <p style={{ fontSize: "0.78rem", color: T.text3, lineHeight: 1.5, marginBottom: 14 }}>Hero images, product shots, and ad creatives — generated to match your brand. Swap any image on your site with one prompt.</p>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
                    {["Hero Image", "Product Shots", "Ad Creatives", "Social Graphics"].map(t => (
                      <div key={t} style={{ padding: 12, borderRadius: 8, background: "rgba(123,57,252,0.06)", border: "1px solid rgba(123,57,252,0.1)", textAlign: "center" }}>
                        <span style={{ fontSize: 11, color: T.purpleLight, fontWeight: 500 }}>{t}</span>
                      </div>
                    ))}
                  </div>
                </Glass>
              </div>
            )}

            {featureTab === "branding" && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                {/* Large brand identity image */}
                <div style={{ gridColumn: "1 / -1", borderRadius: 14, overflow: "hidden", border: `1px solid ${T.border}`, position: "relative", height: 280 }}>
                  <img src="/landing/showcase-branding.jpg" alt="Brand Identity Kit" loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(10,10,15,0.9) 0%, rgba(10,10,15,0.3) 40%, transparent 70%)" }} />
                  <div style={{ position: "absolute", bottom: 20, left: 20, right: 20 }}>
                    <p style={{ fontFamily: T.h, fontSize: "1.3rem", fontWeight: 700, color: T.text, marginBottom: 6 }}>Complete Brand Identity</p>
                    <p style={{ fontSize: "0.8rem", color: T.text2, lineHeight: 1.5 }}>Logo, colors, fonts, tone of voice — generated instantly from your business description.</p>
                  </div>
                </div>
                {/* Color palette card */}
                <Glass style={{ padding: 20 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                    <div style={{ width: 28, height: 28, borderRadius: 8, background: CTA_GRAD, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <span style={{ fontSize: 13 }}>&#127912;</span>
                    </div>
                    <p style={{ fontSize: "0.85rem", fontWeight: 600, color: T.text }}>Auto Color Palettes</p>
                  </div>
                  <p style={{ fontSize: "0.78rem", color: T.text3, lineHeight: 1.5, marginBottom: 14 }}>AI picks a primary, secondary, accent, and neutral palette that fits your industry and vibe.</p>
                  <div style={{ display: "flex", gap: 4 }}>
                    {["#7B39FC","#A855F7","#E9D5FF","#1E1B4B","#0F172A"].map(c => <div key={c} style={{ flex: 1, height: 28, borderRadius: 6, background: c }} />)}
                  </div>
                </Glass>
                {/* Font pairing card */}
                <Glass style={{ padding: 20 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                    <div style={{ width: 28, height: 28, borderRadius: 8, background: CTA_GRAD, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <span style={{ fontSize: 13 }}>&#9998;</span>
                    </div>
                    <p style={{ fontSize: "0.85rem", fontWeight: 600, color: T.text }}>Smart Font Pairing</p>
                  </div>
                  <p style={{ fontSize: "0.78rem", color: T.text3, lineHeight: 1.5, marginBottom: 14 }}>Headlines, body, and accents matched for readability and brand personality.</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                      <span style={{ fontFamily: T.h, fontSize: "1.1rem", fontWeight: 700, color: T.text }}>Headline</span>
                      <span style={{ fontSize: 10, color: T.text3 }}>Plus Jakarta Sans</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                      <span style={{ fontSize: "0.85rem", color: T.text2 }}>Body text goes here</span>
                      <span style={{ fontSize: 10, color: T.text3 }}>Inter</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                      <span style={{ fontFamily: T.mono, fontSize: "0.75rem", color: T.purpleLight }}>$2,499 /mo</span>
                      <span style={{ fontSize: 10, color: T.text3 }}>JetBrains Mono</span>
                    </div>
                  </div>
                </Glass>
                {/* Tone card — full width */}
                <Glass style={{ padding: 20, gridColumn: "1 / -1" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                    <div style={{ width: 28, height: 28, borderRadius: 8, background: CTA_GRAD, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <span style={{ fontSize: 13 }}>&#128172;</span>
                    </div>
                    <p style={{ fontSize: "0.85rem", fontWeight: 600, color: T.text }}>Brand Voice & Tone</p>
                  </div>
                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    {["Professional","Confident","Approachable","Bold","Trustworthy"].map(t => (
                      <span key={t} style={{ padding: "6px 14px", borderRadius: 100, background: "rgba(123,57,252,0.1)", border: "1px solid rgba(123,57,252,0.2)", fontSize: "0.75rem", color: T.purpleLight, fontWeight: 500 }}>{t}</span>
                    ))}
                  </div>
                </Glass>
              </div>
            )}

            {featureTab === "coach" && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                {/* Large coach image */}
                <div style={{ gridColumn: "1 / -1", borderRadius: 14, overflow: "hidden", border: `1px solid ${T.border}`, position: "relative", height: 260 }}>
                  <img src="/landing/feature-coach.jpg" alt="AI Business Coach" loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, rgba(10,10,15,0.95) 0%, rgba(10,10,15,0.6) 50%, transparent 100%)" }} />
                  <div style={{ position: "absolute", top: 24, left: 24, maxWidth: 340 }}>
                    <p style={{ fontFamily: T.h, fontSize: "1.3rem", fontWeight: 700, color: T.text, marginBottom: 8 }}>Your 24/7 Business Coach</p>
                    <p style={{ fontSize: "0.8rem", color: T.text2, lineHeight: 1.55 }}>Not generic advice — a 30-day action plan tailored to your niche. Daily assignments. Real accountability. It tells you what to do and checks if you did it.</p>
                  </div>
                </div>
                {/* Day-by-day timeline */}
                <Glass style={{ padding: 20 }}>
                  <p style={{ fontSize: "0.85rem", fontWeight: 600, color: T.text, marginBottom: 16 }}>30-Day Action Plan</p>
                  {[
                    { day: "Day 1", task: "Welcome + profile your ideal customer", color: T.green, done: true },
                    { day: "Day 5", task: "Write & publish your first offer post", color: T.green, done: true },
                    { day: "Day 12", task: "Cold outreach — DM 10 prospects", color: T.purple, done: false },
                    { day: "Day 21", task: "Launch a paid ad with $20 budget", color: T.text3, done: false },
                    { day: "Day 30", task: "Revenue review + next quarter plan", color: T.text3, done: false },
                  ].map((step, i) => (
                    <div key={step.day} style={{ display: "flex", gap: 12, alignItems: "flex-start", marginBottom: i < 4 ? 14 : 0 }}>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                        <div style={{ width: 10, height: 10, borderRadius: "50%", background: step.done ? T.green : "rgba(255,255,255,0.1)", border: !step.done ? `2px solid ${step.color}` : "none", flexShrink: 0 }} />
                        {i < 4 && <div style={{ width: 1, height: 20, background: "rgba(255,255,255,0.06)" }} />}
                      </div>
                      <div style={{ paddingBottom: 2 }}>
                        <p style={{ fontSize: "0.7rem", fontWeight: 600, color: step.color, marginBottom: 2 }}>{step.day}</p>
                        <p style={{ fontSize: "0.78rem", color: T.text2, lineHeight: 1.4 }}>{step.task}</p>
                      </div>
                    </div>
                  ))}
                </Glass>
                {/* Coach features list */}
                <Glass style={{ padding: 20 }}>
                  <p style={{ fontSize: "0.85rem", fontWeight: 600, color: T.text, marginBottom: 16 }}>What Your Coach Does</p>
                  {[
                    { icon: "&#9889;", title: "Daily Assignments", desc: "Specific, actionable tasks — not vague tips" },
                    { icon: "&#128200;", title: "Progress Tracking", desc: "Marks milestones, adjusts pace to your speed" },
                    { icon: "&#128172;", title: "Real Accountability", desc: "Checks in if you miss a day. No ghosting." },
                    { icon: "&#127919;", title: "Revenue Focus", desc: "Every task maps back to getting your first sale" },
                  ].map(f => (
                    <div key={f.title} style={{ display: "flex", gap: 12, marginBottom: 16 }}>
                      <div style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(123,57,252,0.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <span style={{ fontSize: 14 }} dangerouslySetInnerHTML={{ __html: f.icon }} />
                      </div>
                      <div>
                        <p style={{ fontSize: "0.8rem", fontWeight: 600, color: T.text, marginBottom: 2 }}>{f.title}</p>
                        <p style={{ fontSize: "0.75rem", color: T.text3, lineHeight: 1.4 }}>{f.desc}</p>
                      </div>
                    </div>
                  ))}
                </Glass>
              </div>
            )}

            {featureTab === "content" && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                {/* Content workspace image */}
                <div style={{ gridColumn: "1 / -1", borderRadius: 14, overflow: "hidden", border: `1px solid ${T.border}`, position: "relative", height: 260 }}>
                  <img src="/landing/feature-content.jpg" alt="Content Creation" loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(10,10,15,0.9) 0%, rgba(10,10,15,0.3) 40%, transparent 70%)" }} />
                  <div style={{ position: "absolute", bottom: 20, left: 20, right: 20 }}>
                    <p style={{ fontFamily: T.h, fontSize: "1.3rem", fontWeight: 700, color: T.text, marginBottom: 6 }}>AI-Written Content That Sells</p>
                    <p style={{ fontSize: "0.8rem", color: T.text2, lineHeight: 1.5 }}>Blog posts, ad copy, social captions, email sequences — generated and published automatically.</p>
                  </div>
                </div>
                {/* Blog post preview */}
                <Glass style={{ padding: 20 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                    <div style={{ width: 28, height: 28, borderRadius: 8, background: "rgba(123,57,252,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <span style={{ fontSize: 13 }}>&#128221;</span>
                    </div>
                    <p style={{ fontSize: "0.85rem", fontWeight: 600, color: T.text }}>Blog Post Generator</p>
                  </div>
                  <div style={{ padding: 14, borderRadius: 10, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)" }}>
                    <p style={{ fontSize: "0.75rem", fontWeight: 600, color: T.text, marginBottom: 6 }}>5 Things Every New Freelancer Gets Wrong</p>
                    <p style={{ fontSize: "0.72rem", color: T.text3, lineHeight: 1.5, marginBottom: 8 }}>Starting freelance? Most people focus on the portfolio. But your first $1,000 comes from outreach, not aesthetics. Here&apos;s what actually works...</p>
                    <div style={{ display: "flex", gap: 8 }}>
                      <span style={{ padding: "3px 8px", borderRadius: 4, background: "rgba(34,197,94,0.1)", fontSize: 10, color: T.green }}>1,200 words</span>
                      <span style={{ padding: "3px 8px", borderRadius: 4, background: "rgba(123,57,252,0.1)", fontSize: 10, color: T.purpleLight }}>SEO optimized</span>
                    </div>
                  </div>
                </Glass>
                {/* Social captions */}
                <Glass style={{ padding: 20 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                    <div style={{ width: 28, height: 28, borderRadius: 8, background: "rgba(123,57,252,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <span style={{ fontSize: 13 }}>&#128247;</span>
                    </div>
                    <p style={{ fontSize: "0.85rem", fontWeight: 600, color: T.text }}>Social Media Captions</p>
                  </div>
                  {["Instagram","X / Twitter","LinkedIn"].map((platform, i) => (
                    <div key={platform} style={{ padding: 10, borderRadius: 8, background: "rgba(255,255,255,0.02)", marginBottom: i < 2 ? 8 : 0, border: "1px solid rgba(255,255,255,0.03)" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                        <span style={{ fontSize: "0.7rem", fontWeight: 600, color: T.text2 }}>{platform}</span>
                        <span style={{ fontSize: 9, color: T.green }}>&#10003; Ready</span>
                      </div>
                      <p style={{ fontSize: "0.7rem", color: T.text3, lineHeight: 1.4 }}>
                        {i === 0 && "Stop overthinking your first product. Ship ugly. Fix later. Your v1 just needs to solve ONE problem..."}
                        {i === 1 && "Hot take: You don't need a perfect website to make $5K/mo. You need 10 conversations."}
                        {i === 2 && "After 6 months of freelancing, here's what moved the needle most: not my portfolio — my DMs."}
                      </p>
                    </div>
                  ))}
                </Glass>
                {/* Ad copy + email */}
                <Glass style={{ padding: 20, gridColumn: "1 / -1" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                    <div style={{ width: 28, height: 28, borderRadius: 8, background: "rgba(123,57,252,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <span style={{ fontSize: 13 }}>&#128231;</span>
                    </div>
                    <p style={{ fontSize: "0.85rem", fontWeight: 600, color: T.text }}>Email Sequences & Ad Copy</p>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    <div style={{ padding: 12, borderRadius: 8, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.03)" }}>
                      <p style={{ fontSize: "0.72rem", fontWeight: 600, color: T.text2, marginBottom: 4 }}>Welcome Sequence (5 emails)</p>
                      <p style={{ fontSize: "0.68rem", color: T.text3, lineHeight: 1.4 }}>Day 0: Welcome + free resource &bull; Day 1: Your story &bull; Day 3: Case study &bull; Day 5: Soft offer &bull; Day 7: Last chance</p>
                    </div>
                    <div style={{ padding: 12, borderRadius: 8, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.03)" }}>
                      <p style={{ fontSize: "0.72rem", fontWeight: 600, color: T.text2, marginBottom: 4 }}>Facebook Ad Variations (3x)</p>
                      <p style={{ fontSize: "0.68rem", color: T.text3, lineHeight: 1.4 }}>Pain-point hook &bull; Testimonial hook &bull; Curiosity hook — each with headline, body, and CTA pre-written</p>
                    </div>
                  </div>
                </Glass>
              </div>
            )}

            {featureTab === "audits" && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                {/* Audit overview */}
                <div style={{ gridColumn: "1 / -1", borderRadius: 14, overflow: "hidden", border: `1px solid ${T.border}`, background: T.bgEl, padding: 24 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
                    <div>
                      <p style={{ fontFamily: T.h, fontSize: "1.3rem", fontWeight: 700, color: T.text, marginBottom: 6 }}>AI Site Audits</p>
                      <p style={{ fontSize: "0.85rem", color: T.text2, lineHeight: 1.5 }}>Get a full quality report on your site — SEO, conversions, accessibility, content, and brand consistency. AI finds the issues and tells you exactly how to fix them.</p>
                    </div>
                    <div style={{ padding: "12px 20px", borderRadius: 12, background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.15)", textAlign: "center", flexShrink: 0 }}>
                      <p style={{ fontFamily: T.mono, fontSize: "1.8rem", fontWeight: 700, color: T.green }}>87</p>
                      <p style={{ fontSize: 9, color: T.text3 }}>Score</p>
                    </div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 8 }}>
                    {[
                      { cat: "SEO", score: 92, color: T.green },
                      { cat: "Content", score: 88, color: T.green },
                      { cat: "Conversion", score: 79, color: T.gold },
                      { cat: "Accessibility", score: 85, color: T.green },
                      { cat: "Brand", score: 91, color: T.green },
                    ].map(c => (
                      <div key={c.cat} style={{ padding: 10, borderRadius: 8, background: "rgba(255,255,255,0.02)", textAlign: "center" }}>
                        <p style={{ fontFamily: T.mono, fontSize: "1rem", fontWeight: 700, color: c.color }}>{c.score}</p>
                        <p style={{ fontSize: 9, color: T.text3 }}>{c.cat}</p>
                      </div>
                    ))}
                  </div>
                </div>
                {/* Findings list */}
                <Glass style={{ padding: 20 }}>
                  <p style={{ fontSize: "0.85rem", fontWeight: 600, color: T.text, marginBottom: 14 }}>Findings</p>
                  {[
                    { sev: "Critical", title: "Missing meta description on 2 pages", color: "#EF4444" },
                    { sev: "Important", title: "Hero CTA below the fold on mobile", color: T.gold },
                    { sev: "Suggestion", title: "Add social proof near pricing section", color: T.purple },
                    { sev: "Suggestion", title: "Compress hero image for faster loading", color: T.purple },
                  ].map((f, i) => (
                    <div key={f.title} style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: i < 3 ? 12 : 0 }}>
                      <span style={{ fontSize: 9, fontWeight: 700, color: f.color, padding: "2px 6px", borderRadius: 4, background: `${f.color}15`, flexShrink: 0, marginTop: 2 }}>{f.sev}</span>
                      <p style={{ fontSize: "0.78rem", color: T.text2, lineHeight: 1.4 }}>{f.title}</p>
                    </div>
                  ))}
                </Glass>
                {/* One-click fixes */}
                <Glass style={{ padding: 20 }}>
                  <p style={{ fontSize: "0.85rem", fontWeight: 600, color: T.text, marginBottom: 14 }}>One-Prompt Fixes</p>
                  <p style={{ fontSize: "0.78rem", color: T.text3, lineHeight: 1.5, marginBottom: 14 }}>Every finding comes with an actionable recommendation. Tell the AI editor to fix it and it&apos;s done — no manual work needed.</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {["\"Fix the SEO issues from my audit\"", "\"Move the CTA above the fold\"", "\"Add testimonials near pricing\""].map(ex => (
                      <div key={ex} style={{ padding: "8px 12px", borderRadius: 8, background: "rgba(123,57,252,0.06)", border: "1px solid rgba(123,57,252,0.1)" }}>
                        <span style={{ fontSize: 11, color: T.purpleLight, fontStyle: "italic" }}>{ex}</span>
                      </div>
                    ))}
                  </div>
                </Glass>
              </div>
            )}

            {featureTab === "payments" && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                {/* Checkout image */}
                <div style={{ gridColumn: "1 / -1", borderRadius: 14, overflow: "hidden", border: `1px solid ${T.border}`, position: "relative", height: 260 }}>
                  <img src="/landing/feature-checkout.jpg" alt="Stripe Checkout" loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(10,10,15,0.9) 0%, rgba(10,10,15,0.3) 40%, transparent 70%)" }} />
                  <div style={{ position: "absolute", bottom: 20, left: 20, right: 20 }}>
                    <p style={{ fontFamily: T.h, fontSize: "1.3rem", fontWeight: 700, color: T.text, marginBottom: 6 }}>Get Paid Instantly</p>
                    <p style={{ fontSize: "0.8rem", color: T.text2, lineHeight: 1.5 }}>Stripe checkout, subscriptions, and invoicing — set up automatically with your business.</p>
                  </div>
                </div>
                {/* Checkout mockup */}
                <Glass style={{ padding: 20 }}>
                  <p style={{ fontSize: "0.85rem", fontWeight: 600, color: T.text, marginBottom: 14 }}>One-Click Checkout</p>
                  <div style={{ padding: 16, borderRadius: 12, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                      <span style={{ fontSize: "0.78rem", color: T.text2 }}>Starter Package</span>
                      <span style={{ fontFamily: T.mono, fontSize: "1rem", fontWeight: 700, color: T.text }}>$49.00</span>
                    </div>
                    <div style={{ height: 1, background: "rgba(255,255,255,0.04)", marginBottom: 12 }} />
                    <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                      <div style={{ flex: 1, padding: "8px 10px", borderRadius: 6, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                        <span style={{ fontSize: 10, color: T.text3 }}>4242 &bull;&bull;&bull;&bull; &bull;&bull;&bull;&bull; 4242</span>
                      </div>
                      <div style={{ padding: "8px 10px", borderRadius: 6, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                        <span style={{ fontSize: 10, color: T.text3 }}>12/28</span>
                      </div>
                    </div>
                    <div style={{ padding: "10px 0", borderRadius: 8, background: "#635BFF", textAlign: "center", cursor: "pointer" }}>
                      <span style={{ fontSize: "0.8rem", color: "#fff", fontWeight: 600 }}>Pay Now</span>
                    </div>
                  </div>
                </Glass>
                {/* Revenue chart */}
                <Glass style={{ padding: 20 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                    <p style={{ fontSize: "0.85rem", fontWeight: 600, color: T.text }}>Revenue</p>
                    <span style={{ fontFamily: T.mono, fontSize: "0.7rem", color: T.green }}>+127% &#8593;</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height: 80, marginBottom: 10 }}>
                    {[15,22,18,30,35,28,42,55,48,62,70,85].map((h,i) => (
                      <div key={i} style={{ flex: 1, height: `${h}%`, borderRadius: 3, background: i >= 9 ? "rgba(123,57,252,0.5)" : "rgba(123,57,252,0.2)", transition: "height 0.3s" }} />
                    ))}
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 9, color: T.text3 }}>Jan</span>
                    <span style={{ fontSize: 9, color: T.text3 }}>Jun</span>
                    <span style={{ fontSize: 9, color: T.text3 }}>Dec</span>
                  </div>
                </Glass>
                {/* Pricing tiers */}
                <Glass style={{ padding: 20, gridColumn: "1 / -1" }}>
                  <p style={{ fontSize: "0.85rem", fontWeight: 600, color: T.text, marginBottom: 14 }}>Your Pricing Page — Auto-Generated</p>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
                    {[
                      { tier: "Starter", price: "$29", features: ["1 project","Email support","Basic analytics"] },
                      { tier: "Pro", price: "$79", features: ["5 projects","Priority support","Advanced analytics","Custom domain"], popular: true },
                      { tier: "Agency", price: "$199", features: ["Unlimited","Dedicated manager","White-label","API access"] },
                    ].map(plan => (
                      <div key={plan.tier} style={{ padding: 14, borderRadius: 10, background: plan.popular ? "rgba(123,57,252,0.08)" : "rgba(255,255,255,0.02)", border: `1px solid ${plan.popular ? "rgba(123,57,252,0.3)" : "rgba(255,255,255,0.04)"}` }}>
                        {plan.popular && <span style={{ fontSize: 9, fontWeight: 600, color: T.purple, textTransform: "uppercase", letterSpacing: "0.08em" }}>Most Popular</span>}
                        <p style={{ fontFamily: T.mono, fontSize: "1.1rem", fontWeight: 700, color: T.text, margin: "4px 0 8px" }}>{plan.price}<span style={{ fontSize: "0.6rem", color: T.text3 }}>/mo</span></p>
                        {plan.features.map(f => (
                          <p key={f} style={{ fontSize: "0.68rem", color: T.text3, marginBottom: 3 }}>&#10003; {f}</p>
                        ))}
                      </div>
                    ))}
                  </div>
                </Glass>
              </div>
            )}

            {featureTab === "analytics" && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                {/* Analytics dashboard image */}
                <div style={{ gridColumn: "1 / -1", borderRadius: 14, overflow: "hidden", border: `1px solid ${T.border}`, position: "relative", height: 260 }}>
                  <img src="/landing/feature-analytics.jpg" alt="Analytics Dashboard" loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(10,10,15,0.9) 0%, rgba(10,10,15,0.3) 40%, transparent 70%)" }} />
                  <div style={{ position: "absolute", bottom: 20, left: 20, right: 20 }}>
                    <p style={{ fontFamily: T.h, fontSize: "1.3rem", fontWeight: 700, color: T.text, marginBottom: 6 }}>Know What&apos;s Working</p>
                    <p style={{ fontSize: "0.8rem", color: T.text2, lineHeight: 1.5 }}>Traffic, conversions, revenue — real-time dashboards that tell you exactly where to focus.</p>
                  </div>
                </div>
                {/* Stats overview */}
                <Glass style={{ padding: 20 }}>
                  <p style={{ fontSize: "0.85rem", fontWeight: 600, color: T.text, marginBottom: 16 }}>This Week</p>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    {[
                      { label: "Visitors", value: "2,847", change: "+18%", up: true },
                      { label: "Conversions", value: "127", change: "+24%", up: true },
                      { label: "Revenue", value: "$4,290", change: "+31%", up: true },
                      { label: "Avg. Order", value: "$33.78", change: "-2%", up: false },
                    ].map(stat => (
                      <div key={stat.label} style={{ padding: 10, borderRadius: 8, background: "rgba(255,255,255,0.02)" }}>
                        <p style={{ fontSize: 9, color: T.text3, marginBottom: 4 }}>{stat.label}</p>
                        <p style={{ fontFamily: T.mono, fontSize: "1rem", fontWeight: 700, color: T.text }}>{stat.value}</p>
                        <p style={{ fontSize: 10, color: stat.up ? T.green : "#EF4444", fontWeight: 500 }}>{stat.change}</p>
                      </div>
                    ))}
                  </div>
                </Glass>
                {/* Traffic sources */}
                <Glass style={{ padding: 20 }}>
                  <p style={{ fontSize: "0.85rem", fontWeight: 600, color: T.text, marginBottom: 16 }}>Traffic Sources</p>
                  {[
                    { source: "Organic Search", pct: 42, color: T.purple },
                    { source: "Social Media", pct: 28, color: T.purpleLight },
                    { source: "Direct", pct: 18, color: T.gold },
                    { source: "Referral", pct: 12, color: T.green },
                  ].map(s => (
                    <div key={s.source} style={{ marginBottom: 12 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                        <span style={{ fontSize: "0.75rem", color: T.text2 }}>{s.source}</span>
                        <span style={{ fontFamily: T.mono, fontSize: "0.7rem", color: T.text3 }}>{s.pct}%</span>
                      </div>
                      <div style={{ height: 4, borderRadius: 2, background: "rgba(255,255,255,0.04)" }}>
                        <div style={{ height: "100%", width: `${s.pct}%`, borderRadius: 2, background: s.color, transition: "width 0.5s" }} />
                      </div>
                    </div>
                  ))}
                </Glass>
                {/* Live activity feed */}
                <Glass style={{ padding: 20, gridColumn: "1 / -1" }}>
                  <p style={{ fontSize: "0.85rem", fontWeight: 600, color: T.text, marginBottom: 14 }}>Live Activity</p>
                  <div style={{ display: "flex", gap: 10, overflowX: "auto" }}>
                    {[
                      { icon: "&#128065;", text: "New visitor from Google", time: "2s ago", color: T.purple },
                      { icon: "&#128722;", text: "Purchase — $49.00", time: "1m ago", color: T.green },
                      { icon: "&#128231;", text: "Email signup", time: "3m ago", color: T.purpleLight },
                      { icon: "&#128065;", text: "Returning visitor", time: "5m ago", color: T.text3 },
                      { icon: "&#128722;", text: "Purchase — $79.00", time: "8m ago", color: T.green },
                    ].map((event, i) => (
                      <div key={i} style={{ padding: "10px 14px", borderRadius: 10, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)", minWidth: 160, flexShrink: 0 }}>
                        <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 4 }}>
                          <span style={{ fontSize: 12 }} dangerouslySetInnerHTML={{ __html: event.icon }} />
                          <span style={{ fontSize: "0.72rem", fontWeight: 500, color: event.color }}>{event.text}</span>
                        </div>
                        <span style={{ fontSize: 9, color: T.text3 }}>{event.time}</span>
                      </div>
                    ))}
                  </div>
                </Glass>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ═══════════ SECTION 5: SHOWCASE GALLERY ═══════════ */}
      <section id="showcase" style={{ padding: "100px 24px", background: T.bgAlt }}>
        <div style={{ maxWidth: 1080, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <p style={{ fontSize: "0.75rem", fontWeight: 600, color: T.purple, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 12 }}>Showcase</p>
            <h2 style={{ fontFamily: T.h, fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 800, letterSpacing: "-1px" }}>
              Real Businesses. Built in Seconds.
            </h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 16 }}>
            {SHOWCASE_SITES.map(s => <SiteCard key={s.name} {...s} />)}
          </div>
        </div>
      </section>

      {/* ═══════════ SECTION 6: AI COACH (split) ═══════════ */}
      <section style={{ padding: "100px 24px" }}>
        <div className="flex flex-col md:flex-row" style={{ maxWidth: 1080, margin: "0 auto", gap: 48, alignItems: "center" }}>
          {/* Chat mockup */}
          <div style={{ flex: "1 1 55%", minWidth: 0 }}>
            <Glass style={{ padding: 24 }}>
              <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 20 }}>
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: T.purple }} />
                <span style={{ fontSize: "0.8rem", fontWeight: 600, color: T.purpleLight }}>AI Coach &middot; Day 8</span>
              </div>
              {/* Coach message */}
              <div style={{ padding: 14, borderRadius: 12, background: "rgba(123,57,252,0.08)", marginBottom: 10, maxWidth: "85%" }}>
                <p style={{ fontSize: "0.85rem", color: T.text2, lineHeight: 1.55 }}>
                  Your site&apos;s getting traffic but no one&apos;s buying. Let&apos;s fix that today. DM 5 people who liked your last Instagram post. Here&apos;s your script. Copy it. Send it. Report back.
                </p>
              </div>
              {/* User reply */}
              <div style={{ padding: 14, borderRadius: 12, background: "rgba(255,255,255,0.04)", marginBottom: 10, maxWidth: "75%", marginLeft: "auto" }}>
                <p style={{ fontSize: "0.85rem", color: T.text2, lineHeight: 1.55 }}>
                  Sent all 5. Two responded asking about pricing!
                </p>
              </div>
              {/* Coach reply */}
              <div style={{ padding: 14, borderRadius: 12, background: "rgba(123,57,252,0.08)", maxWidth: "85%" }}>
                <p style={{ fontSize: "0.85rem", color: T.text2, lineHeight: 1.55 }}>
                  Two signals in one day. You&apos;re ahead of schedule. Tomorrow we close one of them. &#128640;
                </p>
              </div>
            </Glass>
          </div>
          {/* Text */}
          <div style={{ flex: "1 1 45%", minWidth: 0 }}>
            <p style={{ fontFamily: T.mono, fontSize: "0.7rem", fontWeight: 600, color: T.purple, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 16 }}>AI Business Coach</p>
            <h2 style={{ fontFamily: T.h, fontSize: "clamp(28px, 4vw, 40px)", fontWeight: 800, letterSpacing: "-1px", marginBottom: 16 }}>
              Not advice. Orders.
            </h2>
            <p style={{ color: T.text2, fontSize: "1rem", lineHeight: 1.7, marginBottom: 28 }}>
              Every other AI gives you a list of options and wishes you luck. Your No Mistakes coach gives you one task per day. No choices. No overthinking. Just do the thing and move on.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {[
                "Momentum Mode: Days 1\u201314, one action per day, zero strategy",
                "Signal Mode: Days 15\u201330, pure outreach until first customer",
                "Adapts to your business type, stage, and progress",
              ].map(f => (
                <div key={f} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                  <Check />
                  <p style={{ fontSize: "0.85rem", color: T.text2 }}>{f}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ SECTION 7: 60-SECOND GENERATION (split reversed) ═══════════ */}
      <section style={{ padding: "100px 24px", background: T.bgAlt }}>
        <div className="flex flex-col-reverse md:flex-row" style={{ maxWidth: 1080, margin: "0 auto", gap: 48, alignItems: "center" }}>
          {/* Text */}
          <div style={{ flex: "1 1 45%", minWidth: 0 }}>
            <p style={{ fontFamily: T.mono, fontSize: "0.7rem", fontWeight: 600, color: T.purple, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 16 }}>AI Generation</p>
            <h2 style={{ fontFamily: T.h, fontSize: "clamp(28px, 4vw, 40px)", fontWeight: 800, letterSpacing: "-1px", marginBottom: 16 }}>
              Idea to Income. Sixty Seconds.
            </h2>
            <p style={{ color: T.text2, fontSize: "1rem", lineHeight: 1.7, marginBottom: 28 }}>
              You answer 4 questions. AI generates 3 business concepts tailored to your skills. Pick one. AI builds everything &mdash; website, branding, products, checkout, business plan. You&apos;re live before your coffee gets cold.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 32 }}>
              {[
                "3 unique business concepts, personalized to you",
                "Full website with 3 layout options",
                "Stripe payments connected from day one",
                "Custom branding: colors, fonts, tone, images",
              ].map(f => (
                <div key={f} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                  <Check />
                  <p style={{ fontSize: "0.85rem", color: T.text2 }}>{f}</p>
                </div>
              ))}
            </div>
            <Link href="/wizard" style={{ color: T.purple, fontSize: "0.9rem", fontWeight: 600, textDecoration: "none" }}>Try it free &rarr;</Link>
          </div>
          {/* Concept cards mockup */}
          <div style={{ flex: "1 1 55%", minWidth: 0 }}>
            <Glass style={{ padding: 24 }}>
              <p style={{ fontSize: "0.75rem", color: T.text3, marginBottom: 16, fontWeight: 500 }}>Your AI-generated concepts</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {[
                  { name: "FitCoach Pro", tag: "Online coaching platform", rev: "$2K\u2013$5K/mo", hl: false },
                  { name: "DesignVault", tag: "Premium template store", rev: "$1K\u2013$3K/mo", hl: true },
                  { name: "ConsultEdge", tag: "B2B consulting service", rev: "$3K\u2013$8K/mo", hl: false },
                ].map(c => (
                  <div key={c.name} style={{
                    padding: 16, borderRadius: 12,
                    background: c.hl ? "rgba(123,57,252,0.08)" : "rgba(255,255,255,0.02)",
                    border: c.hl ? "1px solid rgba(123,57,252,0.25)" : "1px solid rgba(255,255,255,0.04)",
                    boxShadow: c.hl ? "0 0 30px rgba(123,57,252,0.08)" : "none",
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <p style={{ fontWeight: 700, color: T.text, fontSize: "0.9rem", marginBottom: 4 }}>{c.name}</p>
                        <p style={{ fontSize: "0.75rem", color: T.text3 }}>{c.tag}</p>
                      </div>
                      <span style={{ fontFamily: T.mono, fontSize: "0.75rem", color: T.green, fontWeight: 600 }}>{c.rev}</span>
                    </div>
                  </div>
                ))}
              </div>
            </Glass>
          </div>
        </div>
      </section>

      {/* ═══════════ SECTION 8: RESULTS (gold accents) ═══════════ */}
      <section style={{ padding: "100px 24px" }}>
        <div className="flex flex-col md:flex-row" style={{ maxWidth: 1080, margin: "0 auto", gap: 48, alignItems: "center" }}>
          {/* Revenue dashboard mockup */}
          <div style={{ flex: "1 1 55%", minWidth: 0 }}>
            <Glass style={{ padding: 24 }}>
              <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
                <div style={{ flex: 1, padding: 14, borderRadius: 10, background: "rgba(245,158,11,0.05)", border: "1px solid rgba(245,158,11,0.1)" }}>
                  <p style={{ fontSize: "0.7rem", color: T.gold, marginBottom: 4 }}>Revenue</p>
                  <p style={{ fontFamily: T.mono, fontSize: "1.2rem", fontWeight: 700, color: T.text }}>$847</p>
                </div>
                <div style={{ flex: 1, padding: 14, borderRadius: 10, background: "rgba(34,197,94,0.05)", border: "1px solid rgba(34,197,94,0.1)" }}>
                  <p style={{ fontSize: "0.7rem", color: T.green, marginBottom: 4 }}>Customers</p>
                  <p style={{ fontFamily: T.mono, fontSize: "1.2rem", fontWeight: 700, color: T.text }}>12</p>
                </div>
              </div>
              {/* Chart */}
              <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height: 80, marginBottom: 16 }}>
                {[15,25,20,35,45,40,55,65,60,75,85,100].map((h,i) => <div key={i} style={{ flex: 1, height: `${h}%`, borderRadius: 3, background: `rgba(245,158,11,${h > 60 ? 0.4 : 0.2})` }} />)}
              </div>
              {/* Milestone */}
              <div style={{ padding: 12, borderRadius: 10, background: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.1)", display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: "1.1rem" }}>&#127881;</span>
                <div>
                  <p style={{ fontSize: "0.8rem", fontWeight: 600, color: T.text }}>First $100 milestone reached!</p>
                  <p style={{ fontSize: "0.7rem", color: T.text3 }}>Day 12 &middot; Ahead of schedule</p>
                </div>
              </div>
            </Glass>
          </div>
          {/* Text */}
          <div style={{ flex: "1 1 45%", minWidth: 0 }}>
            <p style={{ fontFamily: T.mono, fontSize: "0.7rem", fontWeight: 600, color: T.gold, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 16 }}>Real Results</p>
            <h2 style={{ fontFamily: T.h, fontSize: "clamp(28px, 4vw, 40px)", fontWeight: 800, letterSpacing: "-1px", marginBottom: 16 }}>
              Your First Customer. Not Next Year. This Month.
            </h2>
            <p style={{ color: T.text2, fontSize: "1rem", lineHeight: 1.7, marginBottom: 28 }}>
              No Mistakes isn&apos;t a website builder. It&apos;s a 30-day system designed to get you from zero to first customer. The AI Coach doesn&apos;t let you hide behind &ldquo;getting ready.&rdquo; It pushes you to sell.
            </p>
            <div style={{ display: "flex", gap: 32, marginBottom: 20, flexWrap: "wrap" }}>
              <div><p style={{ fontFamily: T.mono, fontSize: "1.5rem", fontWeight: 700, color: T.gold }}>47 sec</p><p style={{ fontSize: "0.75rem", color: T.text3 }}>Avg build time</p></div>
              <div><p style={{ fontFamily: T.mono, fontSize: "1.5rem", fontWeight: 700, color: T.gold }}>Day 12</p><p style={{ fontSize: "0.75rem", color: T.text3 }}>Avg first signal</p></div>
              <div><p style={{ fontFamily: T.mono, fontSize: "1.5rem", fontWeight: 700, color: T.gold }}>83%</p><p style={{ fontSize: "0.75rem", color: T.text3 }}>Completion rate</p></div>
            </div>
            <p style={{ fontSize: "0.8rem", color: T.text3, fontStyle: "italic" }}>Targets the AI Coach drives you toward.</p>
          </div>
        </div>
      </section>

      {/* ═══════════ SECTION 9: 5-PHASE BLUEPRINT ═══════════ */}
      <section style={{ padding: "100px 24px", background: T.bgAlt }}>
        <div style={{ maxWidth: 1080, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <p style={{ fontFamily: T.mono, fontSize: "0.7rem", fontWeight: 600, color: T.purple, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 12 }}>The Blueprint</p>
            <h2 style={{ fontFamily: T.h, fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 800, letterSpacing: "-1px", marginBottom: 16 }}>
              A 5-Phase System to Your First Dollar
            </h2>
            <p style={{ fontSize: "1rem", color: T.text2, maxWidth: 560, margin: "0 auto" }}>
              Not a template. Not a course. A step-by-step execution engine with ~150 tasks personalized to your business type. AI completes most of them for you.
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 0, position: "relative" }}>
            {/* Vertical line */}
            <div style={{ position: "absolute", left: 24, top: 24, bottom: 24, width: 2, background: `linear-gradient(to bottom, ${T.purple}, ${T.gold}, ${T.green})`, borderRadius: 2 }} className="hidden md:block" />

            {[
              { phase: "1", title: "Foundation", desc: "AI builds your website, brand identity, and product pages. Stripe payments connected. You're live in 60 seconds.", tasks: "~30 tasks", ai: "90% AI-completed", color: T.purple, icon: "&#128640;" },
              { phase: "2", title: "Content Engine", desc: "AI writes your blog posts, social captions, email sequences, and ad copy. SEO-optimized and on-brand.", tasks: "~25 tasks", ai: "85% AI-completed", color: T.purpleLight, icon: "&#128221;" },
              { phase: "3", title: "Growth Launch", desc: "Cold outreach scripts, ad creatives, UGC video generation, and competitor analysis. Time to get in front of people.", tasks: "~35 tasks", ai: "70% AI-completed", color: T.gold, icon: "&#128200;" },
              { phase: "4", title: "Optimize & Convert", desc: "Site audits, A/B testing guidance, conversion optimization, and analytics setup. Turn visitors into customers.", tasks: "~30 tasks", ai: "75% AI-completed", color: "#F97316", icon: "&#9889;" },
              { phase: "5", title: "Scale & Systemize", desc: "Automation setup, upsell funnels, referral systems, and recurring revenue models. Build a real business, not a side project.", tasks: "~30 tasks", ai: "60% AI-completed", color: T.green, icon: "&#127775;" },
            ].map((p, i) => (
              <div key={p.phase} className="flex flex-col md:flex-row" style={{ gap: 20, alignItems: "flex-start", marginBottom: i < 4 ? 32 : 0, paddingLeft: 0 }}>
                {/* Phase marker */}
                <div className="hidden md:flex" style={{ width: 48, height: 48, borderRadius: 14, background: `${p.color}15`, border: `1px solid ${p.color}30`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, position: "relative", zIndex: 1 }}>
                  <span style={{ fontFamily: T.mono, fontSize: "0.85rem", fontWeight: 700, color: p.color }}>{p.phase}</span>
                </div>
                {/* Content */}
                <Glass style={{ flex: 1, padding: 24 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8, flexWrap: "wrap", gap: 8 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ fontSize: 18 }} dangerouslySetInnerHTML={{ __html: p.icon }} />
                      <div>
                        <p style={{ fontSize: "0.65rem", fontWeight: 600, color: p.color, textTransform: "uppercase", letterSpacing: "0.08em" }}>Phase {p.phase}</p>
                        <p style={{ fontFamily: T.h, fontSize: "1.1rem", fontWeight: 700, color: T.text }}>{p.title}</p>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <span style={{ padding: "4px 10px", borderRadius: 100, background: `${p.color}10`, fontSize: "0.7rem", color: p.color, fontWeight: 500 }}>{p.tasks}</span>
                      <span style={{ padding: "4px 10px", borderRadius: 100, background: "rgba(34,197,94,0.08)", fontSize: "0.7rem", color: T.green, fontWeight: 500 }}>{p.ai}</span>
                    </div>
                  </div>
                  <p style={{ fontSize: "0.85rem", color: T.text2, lineHeight: 1.6 }}>{p.desc}</p>
                </Glass>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ SECTION 10: AUTO-SCROLLING STRIP ═══════════ */}
      <section style={{ padding: "60px 0", overflow: "hidden", borderTop: `1px solid ${T.border}`, borderBottom: `1px solid ${T.border}` }}>
        <div style={{ display: "flex", animation: "autoScroll 40s linear infinite", width: "max-content" }}>
          {[...SHOWCASE_SITES, ...SHOWCASE_SITES].map((s, i) => (
            <div key={`${s.name}-${i}`} style={{ width: 280, flexShrink: 0, marginRight: 12, borderRadius: 14, overflow: "hidden", border: `1px solid ${T.border}` }}>
              <div style={{ display: "flex", gap: 5, padding: "8px 12px", borderBottom: "1px solid rgba(255,255,255,0.04)", background: T.bgEl }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "rgba(255,255,255,0.08)" }} />
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "rgba(255,255,255,0.08)" }} />
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "rgba(255,255,255,0.08)" }} />
              </div>
              <div style={{ height: 160 }}>
                <img src={s.img} alt={s.name} loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
            </div>
          ))}
        </div>
        <p style={{ textAlign: "center", color: T.text3, fontSize: "0.9rem", marginTop: 32, padding: "0 24px", maxWidth: 640, margin: "32px auto 0" }}>
          Coaching. Freelance. E-commerce. Consulting. Courses. Templates. Memberships. Whatever you&apos;re good at, AI builds the business around it.
        </p>
      </section>

      {/* ═══════════ SECTION 10.5: EVERYTHING YOU GET ═══════════ */}
      <section style={{ padding: "100px 24px" }}>
        <div style={{ maxWidth: 1080, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <p style={{ fontFamily: T.mono, fontSize: "0.7rem", fontWeight: 600, color: T.purple, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 12 }}>Everything Included</p>
            <h2 style={{ fontFamily: T.h, fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 800, letterSpacing: "-1px", marginBottom: 16 }}>
              A Complete Business. Not Just a Website.
            </h2>
            <p style={{ fontSize: "1rem", color: T.text2, maxWidth: 580, margin: "0 auto" }}>
              Other platforms sell you a blank canvas and charge extra for everything. We give you the entire toolkit from day one.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
            {[
              { icon: "&#127760;", title: "AI Website Builder", desc: "Full site generated in 60 seconds with 3 layout options", included: true },
              { icon: "&#9998;", title: "Visual Site Editor", desc: "Edit anything with plain English — no code needed", included: true },
              { icon: "&#127912;", title: "Brand Identity", desc: "Logo, colors, fonts, and tone of voice — all AI-generated", included: true },
              { icon: "&#128176;", title: "Stripe Payments", desc: "Accept cards, subscriptions, and invoices from day one", included: true },
              { icon: "&#128172;", title: "AI Business Coach", desc: "30-day action plan with daily tasks and accountability", included: true },
              { icon: "&#128221;", title: "Blog & SEO Content", desc: "AI-written blog posts, meta descriptions, and keywords", included: true },
              { icon: "&#127909;", title: "Promo Videos", desc: "AI-generated video ads with voiceover and branding", included: true },
              { icon: "&#128248;", title: "UGC-Style Ads", desc: "Short-form video clips for Meta, TikTok, and Twitter", included: true },
              { icon: "&#128444;", title: "AI Image Generation", desc: "Hero images, product shots, and ad creatives on demand", included: true },
              { icon: "&#128270;", title: "Site Audits", desc: "SEO, conversion, accessibility, and brand scoring", included: true },
              { icon: "&#128231;", title: "Email Sequences", desc: "Welcome series, nurture flows, and promotional emails", included: true },
              { icon: "&#128200;", title: "Launch Checklist", desc: "~150 personalized tasks across 5 phases to first revenue", included: true },
              { icon: "&#127919;", title: "Ad Copy Generator", desc: "Facebook, Instagram, and Google ad copy variations", included: true },
              { icon: "&#128247;", title: "Social Media Content", desc: "Platform-specific captions for Instagram, X, and LinkedIn", included: true },
              { icon: "&#128279;", title: "Custom Domain", desc: "Connect your own domain with free SSL and DNS guidance", included: true },
              { icon: "&#128197;", title: "Calendly Integration", desc: "Embedded scheduling for coaching and consulting businesses", included: true },
            ].map(tool => (
              <Glass key={tool.title} style={{ padding: 18 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  <span style={{ fontSize: 16 }} dangerouslySetInnerHTML={{ __html: tool.icon }} />
                  <p style={{ fontSize: "0.8rem", fontWeight: 600, color: T.text }}>{tool.title}</p>
                </div>
                <p style={{ fontSize: "0.72rem", color: T.text3, lineHeight: 1.45 }}>{tool.desc}</p>
              </Glass>
            ))}
          </div>

          <div style={{ textAlign: "center", marginTop: 40 }}>
            <p style={{ fontSize: "0.9rem", color: T.text2, marginBottom: 8 }}>All of this starting at <span style={{ fontFamily: T.mono, fontWeight: 700, color: T.text }}>$0/month</span></p>
            <p style={{ fontSize: "0.8rem", color: T.text3 }}>Most competitors charge $50\u2013$200/mo for half of this. We give you everything.</p>
          </div>
        </div>
      </section>

      {/* ═══════════ SECTION 11: INTEGRATIONS ═══════════ */}
      <section style={{ padding: "100px 24px", background: T.bgAlt }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <h2 style={{ fontFamily: T.h, fontSize: "clamp(28px, 4vw, 40px)", fontWeight: 800, letterSpacing: "-1px", marginBottom: 12 }}>
              Built on tools you can trust.
            </h2>
            <p style={{ color: T.text2, fontSize: "1rem" }}>No setup. No hassle. Everything connects.</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
            {[
              { name: "Stripe", desc: "Accept payments instantly. Cards, wallets, subscriptions.", color: "#635BFF" },
              { name: "Custom Domains", desc: "YourBusiness.com \u2014 connected with zero config.", color: T.text },
              { name: "Calendly", desc: "Book calls automatically from your generated site.", color: "#006BFF" },
              { name: "Claude & GPT", desc: "Powered by the best AI models for every generation task.", color: T.purple },
            ].map(tool => (
              <Glass key={tool.name} style={{ padding: 24 }}>
                <span style={{ fontSize: "0.7rem", fontWeight: 700, color: tool.color, letterSpacing: "0.06em", textTransform: "uppercase" }}>{tool.name}</span>
                <p style={{ fontSize: "0.9rem", color: T.text2, marginTop: 10, lineHeight: 1.6 }}>{tool.desc}</p>
              </Glass>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ SECTION 11: LEAVE YOUR 9-5 ═══════════ */}
      <section style={{ padding: "100px 24px", position: "relative", overflow: "hidden" }}>
        {/* Background lifestyle image */}
        <div style={{ position: "absolute", inset: 0, zIndex: 0 }}>
          <img src="/landing/lifestyle-aspire.jpg" alt="" style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.15 }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, #000000 0%, rgba(0,0,0,0.7) 40%, rgba(0,0,0,0.7) 60%, #000000 100%)" }} />
        </div>
        <div style={{ maxWidth: 900, margin: "0 auto", position: "relative", zIndex: 1 }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <h2 style={{ fontFamily: T.h, fontSize: "clamp(28px, 5vw, 48px)", fontWeight: 800, letterSpacing: "-1px", marginBottom: 16 }}>
              They told you to get a job.<br />You built a business instead.
            </h2>
            <p style={{ color: T.text2, fontSize: "1rem", maxWidth: 540, margin: "0 auto", lineHeight: 1.7 }}>
              No Mistakes exists for the person who&apos;s tired of making someone else rich. The one who knows they&apos;re capable but doesn&apos;t know where to start. Start here.
            </p>
          </div>

          {/* Testimonials */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16, marginBottom: 56 }}>
            {[
              { quote: "I launched a coaching business in my lunch break. Got my first client the same week.", name: "Marcus T.", role: "Fitness Coach", initials: "MT", color: "#7B39FC" },
              { quote: "I sell design templates now. Made $400 in my first month. That was my car payment.", name: "Priya S.", role: "Template Creator", initials: "PS", color: "#F59E0B" },
              { quote: "I was doom-scrolling every night after work. Now I spend that time building my consulting brand.", name: "Jordan K.", role: "Business Consultant", initials: "JK", color: "#22C55E" },
            ].map(t => (
              <Glass key={t.name} style={{ padding: 24 }}>
                <p style={{ fontSize: "0.9rem", color: T.text2, lineHeight: 1.6, marginBottom: 20, fontStyle: "italic" }}>
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <div style={{ width: 36, height: 36, borderRadius: "50%", background: t.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.7rem", fontWeight: 700, color: "#fff" }}>
                    {t.initials}
                  </div>
                  <div>
                    <p style={{ fontSize: "0.8rem", fontWeight: 600, color: T.text }}>{t.name}</p>
                    <p style={{ fontSize: "0.7rem", color: T.text3 }}>{t.role}</p>
                  </div>
                </div>
              </Glass>
            ))}
          </div>

          {/* Stats bar */}
          <div style={{ display: "flex", justifyContent: "center", gap: 64, flexWrap: "wrap" }}>
            <Stat value="2,000+" label="Businesses Launched" />
            <Stat value="8" label="Business Types" />
            <Stat value="60s" label="Average Build Time" />
          </div>
        </div>
      </section>

      {/* ═══════════ SECTION 12: PRICING ═══════════ */}
      <section id="pricing" style={{ padding: "100px 24px", background: T.bgAlt }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <p style={{ fontSize: "0.75rem", fontWeight: 600, color: T.purple, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 12 }}>Pricing</p>
            <h2 style={{ fontFamily: T.h, fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 800, letterSpacing: "-1px", marginBottom: 12 }}>
              Less than your morning coffee. More than most agencies deliver.
            </h2>
            <p style={{ fontSize: "1rem", color: T.text2, maxWidth: 560, margin: "0 auto" }}>
              Website + branding + AI coach + content + video ads + payments + launch checklist. Others charge $5K\u2013$15K for this. You get it all starting free.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3" style={{ gap: 16 }}>
            {[
              { name: "Free", price: "$0", sub: "", desc: "Launch Your First Business", features: ["1 business", "50 AI credits/month", "Full AI site generation", "Visual site editor", "AI business coach", "Stripe payments", "Custom domain"], popular: false },
              { name: "Starter", price: "$19.99", sub: "/mo", desc: "Grow With AI Power Tools", features: ["3 businesses", "200 AI credits/month", "Full AI coach (advanced)", "Blog posts & SEO content", "AI image generation", "Promo video creation", "Ad copy generator", "Site audits"], popular: true },
              { name: "Growth", price: "$49.99", sub: "/mo", desc: "Full Growth Engine", features: ["10 businesses", "500 AI credits/month", "UGC video ads", "Email sequences", "Competitor analysis", "Advanced analytics", "Priority support"], popular: false },
            ].map(tier => (
              <Glass key={tier.name} style={{
                padding: 28, display: "flex", flexDirection: "column", position: "relative",
                border: tier.popular ? "1px solid rgba(123,57,252,0.3)" : `1px solid ${T.border}`,
                boxShadow: tier.popular ? "0 0 60px rgba(123,57,252,0.1)" : "none",
              }}>
                {tier.popular && (
                  <div style={{ position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)", background: T.gold, color: "#000", fontSize: "0.65rem", fontWeight: 700, padding: "4px 14px", borderRadius: 100, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                    Most Popular
                  </div>
                )}
                <p style={{ fontSize: "0.8rem", fontWeight: 600, color: T.text3, marginBottom: 8 }}>{tier.desc}</p>
                <div style={{ marginBottom: 20 }}>
                  <span style={{ fontFamily: T.mono, fontSize: "2.5rem", fontWeight: 800, color: T.text }}>{tier.price}</span>
                  {tier.sub && <span style={{ color: T.text3, fontSize: "0.85rem" }}>{tier.sub}</span>}
                </div>
                <ul style={{ listStyle: "none", padding: 0, margin: 0, flex: 1, display: "flex", flexDirection: "column", gap: 12, marginBottom: 28 }}>
                  {tier.features.map(f => (
                    <li key={f} style={{ display: "flex", gap: 10, alignItems: "flex-start", fontSize: "0.8rem", color: T.text2 }}>
                      <Check />{f}
                    </li>
                  ))}
                </ul>
                <Link href="/wizard" style={{
                  display: "block", textAlign: "center", padding: "14px 0", borderRadius: 12,
                  fontSize: "0.85rem", fontWeight: 700, textDecoration: "none",
                  background: tier.popular ? CTA_GRAD : "transparent",
                  color: tier.popular ? "#fff" : T.text2,
                  border: tier.popular ? "none" : `1px solid ${T.border}`,
                }}>
                  {tier.name === "Free" ? "Get Started" : tier.name === "Starter" ? "Start Growing" : "Go Growth"}
                </Link>
              </Glass>
            ))}
          </div>

          {/* Value comparison */}
          <Glass style={{ padding: 24, marginTop: 24, textAlign: "center" }}>
            <p style={{ fontSize: "0.9rem", fontWeight: 600, color: T.text, marginBottom: 12 }}>What you&apos;d pay separately</p>
            <div style={{ display: "flex", justifyContent: "center", gap: 24, flexWrap: "wrap", marginBottom: 16 }}>
              {[
                { item: "Website Builder", cost: "$29/mo" },
                { item: "Brand Design", cost: "$2,000+" },
                { item: "AI Copywriting", cost: "$49/mo" },
                { item: "Video Ads", cost: "$500+" },
                { item: "Business Coach", cost: "$200/mo" },
                { item: "SEO Tools", cost: "$99/mo" },
              ].map(v => (
                <div key={v.item} style={{ textAlign: "center" }}>
                  <p style={{ fontSize: "0.7rem", color: T.text3 }}>{v.item}</p>
                  <p style={{ fontFamily: T.mono, fontSize: "0.8rem", fontWeight: 600, color: "#EF4444", textDecoration: "line-through" }}>{v.cost}</p>
                </div>
              ))}
            </div>
            <p style={{ fontSize: "0.85rem", color: T.text2 }}>
              Total: <span style={{ fontFamily: T.mono, fontWeight: 700, color: "#EF4444", textDecoration: "line-through" }}>$2,877+</span>{" "}
              &rarr; <span style={{ fontFamily: T.mono, fontWeight: 700, color: T.green, fontSize: "1rem" }}>$0 to start</span>
            </p>
          </Glass>
        </div>
      </section>

      {/* ═══════════ SECTION 13: FAQ ═══════════ */}
      <section id="faq" style={{ padding: "100px 24px" }}>
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <h2 style={{ fontFamily: T.h, fontSize: "clamp(28px, 4vw, 40px)", fontWeight: 800, letterSpacing: "-1px" }}>
              Frequently asked questions
            </h2>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {FAQS.map((faq, i) => (
              <Glass key={i} style={{ padding: 0, overflow: "hidden", cursor: "pointer" }} onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                <div style={{ padding: "18px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <p style={{ fontSize: "0.9rem", fontWeight: 600, color: T.text }}>{faq.q}</p>
                  <span style={{ color: T.purple, fontSize: "1.2rem", transition: "transform 0.2s", transform: openFaq === i ? "rotate(45deg)" : "none" }}>+</span>
                </div>
                {openFaq === i && (
                  <div style={{ padding: "0 24px 18px" }}>
                    <p style={{ fontSize: "0.85rem", color: T.text2, lineHeight: 1.65 }}>{faq.a}</p>
                  </div>
                )}
              </Glass>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ SECTION 14: FINAL CTA + STATS ═══════════ */}
      <section style={{ padding: "100px 24px", background: T.bgAlt, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 600, height: 600, background: "radial-gradient(circle, rgba(123,57,252,0.08), transparent 70%)", pointerEvents: "none" }} />
        <div style={{ maxWidth: 900, margin: "0 auto", textAlign: "center", position: "relative" }}>
          <div style={{ display: "flex", justifyContent: "center", gap: 64, flexWrap: "wrap", marginBottom: 64 }}>
            <Stat value="2,000+" label="Businesses Launched" color={T.purple} />
            <Stat value="8" label="Business Types" color={T.purple} />
            <Stat value="60s" label="Average Build Time" color={T.purple} />
          </div>
          <h2 style={{ fontFamily: T.h, fontSize: "clamp(32px, 5vw, 52px)", fontWeight: 800, letterSpacing: "-1px", marginBottom: 16 }}>
            Your vision, launched.
          </h2>
          <p style={{ color: T.text2, fontSize: "1rem", marginBottom: 40 }}>No credit card. No coding. No excuses.</p>
          <Link href="/wizard" style={{
            display: "inline-block", padding: "18px 48px", borderRadius: 12,
            background: CTA_GRAD, color: "#fff", fontWeight: 700, fontSize: "1.05rem",
            textDecoration: "none", boxShadow: "0 0 60px rgba(123,57,252,0.3)",
          }}>
            Start Building &mdash; Free
          </Link>
        </div>
      </section>

      {/* ═══════════ SECTION 15: FOOTER ═══════════ */}
      <footer style={{ padding: "48px 24px", borderTop: `1px solid ${T.border}`, background: "#050508" }}>
        <div style={{ maxWidth: 1080, margin: "0 auto" }}>
          <div className="flex flex-col md:flex-row" style={{ justifyContent: "space-between", gap: 32, marginBottom: 32 }}>
            <div>
              <p style={{ fontFamily: T.h, fontWeight: 800, fontSize: "1rem", marginBottom: 8 }}>No Mistakes</p>
              <p style={{ fontSize: "0.8rem", color: T.text3, maxWidth: 280, lineHeight: 1.6 }}>
                AI builds and runs your entire business. From zero to first customer in 30 days.
              </p>
            </div>
            <div style={{ display: "flex", gap: 48, flexWrap: "wrap" }}>
              <div>
                <p style={{ fontSize: "0.7rem", fontWeight: 600, color: T.text3, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 12 }}>Product</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {["Features", "Pricing", "Showcase", "FAQ"].map(l => (
                    <a key={l} href={`#${l.toLowerCase()}`} style={{ fontSize: "0.8rem", color: T.text2, textDecoration: "none" }}>{l}</a>
                  ))}
                </div>
              </div>
              <div>
                <p style={{ fontSize: "0.7rem", fontWeight: 600, color: T.text3, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 12 }}>Legal</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <Link href="/terms" style={{ fontSize: "0.8rem", color: T.text2, textDecoration: "none" }}>Terms</Link>
                  <Link href="/privacy" style={{ fontSize: "0.8rem", color: T.text2, textDecoration: "none" }}>Privacy</Link>
                  <a href="mailto:ronalddavenport08@gmail.com" style={{ fontSize: "0.8rem", color: T.text2, textDecoration: "none" }}>Contact</a>
                </div>
              </div>
            </div>
          </div>
          <div style={{ borderTop: `1px solid ${T.border}`, paddingTop: 24 }}>
            <p style={{ fontSize: "0.72rem", color: T.text3 }}>
              &copy; 2026 No Mistakes. Built with AI. Made for entrepreneurs.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
