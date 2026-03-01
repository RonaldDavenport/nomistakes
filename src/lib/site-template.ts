// Generates deployable Next.js app files for a business site
// All content is fetched dynamically from Supabase — no hardcoded text

interface SiteBrand {
  colors?: { primary?: string; secondary?: string; accent?: string; background?: string; text?: string };
  fonts?: { heading?: string; body?: string };
  tone?: string;
  values?: string[];
}

interface SiteContent {
  hero?: { headline?: string; subheadline?: string; badge?: string };
  about?: { title?: string; text?: string; mission?: string };
  features?: { title: string; desc: string }[];
  products?: { name: string; slug?: string; tagline?: string; desc: string; long_desc?: string; price: string; audience?: string; what_you_get?: string[]; features?: string[]; guarantee?: string }[];
  testimonials?: { name: string; role: string; text: string; rating?: number }[];
  process?: { title?: string; steps?: { step: string; title: string; desc: string }[] };
  stats?: { value: string; label: string }[];
  social_proof?: { logos?: string[] };
  cta?: { headline?: string; subheadline?: string; button_text?: string };
  seo?: { title?: string; description?: string };
  contact?: { email?: string; phone?: string; address?: string; hours?: string };
  faq?: { question: string; answer: string }[];
  images?: { hero?: string; about?: string; products?: string[] };
}

interface BusinessConfig {
  name: string;
  slug: string;
  tagline: string;
  type: string;
  brand: SiteBrand;
  siteContent: SiteContent;
  supabaseUrl: string;
  supabaseAnonKey: string;
  stripePublishableKey?: string;
  businessId: string;
  appUrl: string; // NoMistakes platform URL for admin bar links
}

export function generateSiteFiles(config: BusinessConfig): { file: string; data: string }[] {
  const files: { file: string; data: string }[] = [];

  const primary = config.brand.colors?.primary || "#6366f1";
  const accent = config.brand.colors?.accent || "#a78bfa";
  const bg = config.brand.colors?.background || "#09090b";
  const headingFont = config.brand.fonts?.heading || "Inter";
  const bodyFont = config.brand.fonts?.body || "Inter";
  const isServices = config.type === "services";

  // Adaptive light/dark — compute ALL colors from background luminance
  // NEVER trust AI-generated text color — compute it to guarantee contrast
  const isLight = isLightColor(bg);
  const textColor = isLight ? "#111111" : "#fafafa";
  const tb = isLight ? "0,0,0" : "255,255,255"; // text & border base for rgba()
  const shadowAlpha = isLight ? "0.08" : "0.3";
  const ctaText = isLightColor(primary) ? "#111" : "#fff";

  // ── package.json ──
  files.push({
    file: "package.json",
    data: JSON.stringify({
      name: `nm-${config.slug}`,
      version: "1.0.0",
      private: true,
      scripts: { dev: "next dev", build: "next build", start: "next start" },
      dependencies: {
        next: "^15.1.0",
        react: "^19.0.0",
        "react-dom": "^19.0.0",
        "@supabase/supabase-js": "^2.49.0",
        stripe: "^17.5.0",
      },
      devDependencies: {
        typescript: "^5.0.0",
        "@types/node": "^20.0.0",
        "@types/react": "^19.0.0",
      },
    }, null, 2),
  });

  // ── next.config.js ──
  files.push({
    file: "next.config.js",
    data: `/** @type {import('next').NextConfig} */\nmodule.exports = {};\n`,
  });

  // ── tsconfig.json ──
  files.push({
    file: "tsconfig.json",
    data: JSON.stringify({
      compilerOptions: {
        target: "es5", lib: ["dom", "dom.iterable", "esnext"],
        allowJs: true, skipLibCheck: true, strict: false,
        forceConsistentCasingInFileNames: true, noEmit: true,
        esModuleInterop: true, module: "esnext", moduleResolution: "bundler",
        resolveJsonModule: true, isolatedModules: true, jsx: "preserve",
        incremental: true, paths: { "@/*": ["./src/*"] },
      },
      include: ["next-env.d.ts", "**/*.ts", "**/*.tsx"],
      exclude: ["node_modules"],
    }, null, 2),
  });

  // ── Supabase client ──
  files.push({
    file: "src/lib/supabase.ts",
    data: `import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(url, key);
export const BUSINESS_ID = process.env.NEXT_PUBLIC_BUSINESS_ID!;
`,
  });

  // ── Data fetcher ──
  files.push({
    file: "src/lib/data.ts",
    data: `import { supabase, BUSINESS_ID } from "./supabase";

export interface Business {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  type: string;
  brand: any;
  site_content: any;
  calendly_url?: string;
  business_email?: string;
  stripe_account_id?: string;
  deployed_url?: string;
  video_url?: string;
}

let _cache: Business | null = null;
let _cacheTime = 0;
const CACHE_TTL = 60_000; // 1 minute

export async function getBusiness(): Promise<Business | null> {
  if (_cache && Date.now() - _cacheTime < CACHE_TTL) return _cache;
  const { data } = await supabase
    .from("businesses")
    .select("*")
    .eq("id", BUSINESS_ID)
    .single();
  if (data) { _cache = data; _cacheTime = Date.now(); }
  return data;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  meta_description: string;
  keywords: string[];
  status: string;
  published_at: string | null;
  word_count: number;
  created_at: string;
}

export async function getBlogPosts(): Promise<BlogPost[]> {
  const { data } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("business_id", BUSINESS_ID)
    .eq("status", "published")
    .order("published_at", { ascending: false });
  return data || [];
}

export async function getBlogPost(slug: string): Promise<BlogPost | null> {
  const { data } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("business_id", BUSINESS_ID)
    .eq("slug", slug)
    .eq("status", "published")
    .single();
  return data;
}
`,
  });

  // ── Global CSS ──
  files.push({
    file: "src/app/globals.css",
    data: `
* { box-sizing: border-box; margin: 0; padding: 0; }
html { scroll-behavior: smooth; }
body {
  background: ${bg};
  color: ${textColor};
  font-family: "${bodyFont}", system-ui, -apple-system, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
a { text-decoration: none; color: inherit; }
h1, h2, h3, h4, h5, h6 { font-family: "${headingFont}", system-ui, sans-serif; }

/* Gradient text utility */
.gradient-text {
  background: linear-gradient(135deg, ${primary}, ${accent});
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* Primary CTA button */
.cta-btn {
  display: inline-flex; align-items: center; justify-content: center; gap: 8px;
  background: ${primary};
  color: ${ctaText};
  padding: 14px 32px;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease-out;
  box-shadow: 0 4px 16px ${primary}33;
}
.cta-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px ${primary}44;
  filter: brightness(1.1);
}

/* Secondary button */
.btn-secondary {
  display: inline-flex; align-items: center; justify-content: center; gap: 8px;
  background: transparent;
  color: ${textColor};
  padding: 14px 32px;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 600;
  border: 1px solid rgba(${tb},0.12);
  cursor: pointer;
  transition: all 0.2s ease-out;
}
.btn-secondary:hover {
  background: rgba(${tb},0.05);
  border-color: rgba(${tb},0.2);
}

/* Layout */
.container { max-width: 1100px; margin: 0 auto; padding: 0 24px; width: 100%; }
.section { padding: 80px 24px; }

/* Cards */
.card {
  padding: 32px 28px;
  border-radius: 16px;
  border: 1px solid rgba(${tb},0.06);
  background: rgba(${tb},0.02);
  transition: all 0.3s ease-out;
}
.card:hover {
  border-color: ${primary}33;
  background: rgba(${tb},0.04);
  transform: translateY(-2px);
  box-shadow: 0 8px 32px rgba(0,0,0,${shadowAlpha});
}

/* Grid */
.grid-2 { display: grid; grid-template-columns: 1fr; gap: 20px; }
.grid-3 { display: grid; grid-template-columns: 1fr; gap: 20px; }

/* Glow dot */
.glow-dot {
  width: 8px; height: 8px; border-radius: 50%;
  background: ${primary};
  box-shadow: 0 0 12px ${primary}66;
  display: inline-block;
}

/* Form inputs */
.input {
  width: 100%; padding: 14px 18px;
  border-radius: 12px;
  background: rgba(${tb},0.04);
  border: 1px solid rgba(${tb},0.08);
  color: inherit; font-size: 15px; font-family: inherit;
  transition: border-color 0.2s;
  outline: none;
}
.input:focus { border-color: ${primary}66; }
.input::placeholder { color: rgba(${tb},0.25); }

/* Mobile nav */
.mobile-menu-btn { display: none !important; }
.desktop-nav { display: flex !important; }

@media (max-width: 767px) {
  .mobile-menu-btn { display: block !important; }
  .desktop-nav { display: none !important; }
}

/* Two-column product layout */
.product-two-col {
  display: grid;
  grid-template-columns: 1fr;
  gap: 40px;
  align-items: start;
}

@media (min-width: 640px) {
  .grid-2 { grid-template-columns: repeat(2, 1fr); }
}
@media (min-width: 768px) {
  .grid-3 { grid-template-columns: repeat(3, 1fr); }
  .section { padding: 100px 24px; }
  .product-two-col { grid-template-columns: 1fr 1fr; }
}
@media (min-width: 960px) {
  .grid-2 { gap: 24px; }
  .grid-3 { gap: 24px; }
}
`,
  });

  // ── Layout (dynamic nav) ──
  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/about", label: "About" },
    { href: isServices ? "/services" : "/products", label: isServices ? "Services" : "Products" },
    { href: "/blog", label: "Blog" },
    { href: "/contact", label: "Contact" },
  ];
  const ctaLabel = isServices ? "Book a Call" : "Get Started";

  // ── Nav component (client — needs useState for mobile menu) ──
  files.push({
    file: "src/components/Nav.tsx",
    data: `"use client";
import { useState } from "react";

const links = ${JSON.stringify(navLinks)};

export default function Nav() {
  const [open, setOpen] = useState(false);

  return (
    <nav style={{
      borderBottom: "1px solid rgba(${tb},0.06)",
      padding: "0 24px",
      position: "sticky",
      top: 0,
      background: "${bg}dd",
      backdropFilter: "blur(20px)",
      WebkitBackdropFilter: "blur(20px)",
      zIndex: 50,
    }}>
      <div style={{
        maxWidth: 1100, margin: "0 auto",
        display: "flex", justifyContent: "space-between", alignItems: "center",
        height: 64,
      }}>
        <a href="/" style={{
          fontSize: 18, fontWeight: 700, letterSpacing: "-0.02em",
          display: "flex", alignItems: "center", gap: 8,
        }}>
          <span className="gradient-text">${esc(config.name)}</span>
        </a>

        {/* Desktop nav */}
        <div className="desktop-nav" style={{ display: "flex", gap: 28, alignItems: "center" }}>
          {links.map((l) => (
            <a key={l.href} href={l.href} style={{ fontSize: 14, fontWeight: 500, color: "rgba(${tb},0.5)", transition: "color 0.2s" }}>
              {l.label}
            </a>
          ))}
          <a href="/contact" className="cta-btn" style={{ padding: "8px 20px", fontSize: 13 }}>
            ${esc(ctaLabel)}
          </a>
        </div>

        {/* Mobile hamburger */}
        <button
          className="mobile-menu-btn"
          onClick={() => setOpen(!open)}
          aria-label="Menu"
          style={{
            display: "none", background: "none", border: "none",
            color: "rgba(${tb},0.7)", fontSize: 24, cursor: "pointer",
            padding: 8, lineHeight: 1,
          }}
        >
          {open ? "\\u2715" : "\\u2630"}
        </button>
      </div>

      {/* Mobile overlay */}
      {open && (
        <div style={{
          position: "fixed", inset: 0, top: 64,
          background: "${bg}f5",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          zIndex: 49,
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center", gap: 8,
          padding: "40px 24px",
        }}>
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              style={{
                fontSize: 20, fontWeight: 600, padding: "14px 0",
                color: "rgba(${tb},0.7)", transition: "color 0.2s",
              }}
            >
              {l.label}
            </a>
          ))}
          <a
            href="/contact"
            onClick={() => setOpen(false)}
            className="cta-btn"
            style={{ marginTop: 16, padding: "14px 36px", fontSize: 16 }}
          >
            ${esc(ctaLabel)}
          </a>
        </div>
      )}
    </nav>
  );
}
`,
  });

  // ── Admin Bar (sessionStorage-based, shows when owner visits from dashboard) ──
  const appUrl = config.appUrl || "";
  const bId = config.businessId || "";
  files.push({
    file: "src/components/AdminBar.tsx",
    data: `"use client";
import { useEffect, useState } from "react";

const APP_URL = "${esc(appUrl)}";
const BIZ_ID = process.env.NEXT_PUBLIC_BUSINESS_ID || "${esc(bId)}";

export default function AdminBar({ businessName }: { businessName: string }) {
  const [show, setShow] = useState(false);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    // Check URL for ?nm_admin=true — set by dashboard "View Site" link
    const params = new URLSearchParams(window.location.search);
    if (params.get("nm_admin") === "true") {
      sessionStorage.setItem("nm_admin", "1");
      // Clean URL
      params.delete("nm_admin");
      const clean = params.toString();
      const newUrl = window.location.pathname + (clean ? "?" + clean : "") + window.location.hash;
      window.history.replaceState({}, "", newUrl);
    }
    if (sessionStorage.getItem("nm_admin") === "1") {
      setShow(true);
    }
  }, []);

  // Push site content down when bar is visible
  useEffect(() => {
    if (show && !hidden) {
      document.body.style.paddingTop = "44px";
    } else {
      document.body.style.paddingTop = "0px";
    }
    return () => { document.body.style.paddingTop = "0px"; };
  }, [show, hidden]);

  if (!show) return null;

  const dashUrl = APP_URL + "/dashboard/" + BIZ_ID;

  // "View as visitor" — show small re-show pill
  if (hidden) {
    return (
      <button
        onClick={() => setHidden(false)}
        style={{
          position: "fixed", top: 8, right: 8, zIndex: 9999,
          background: "#1e1e2e", color: "#a1a1aa",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 20, padding: "6px 14px", fontSize: 12,
          fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
          cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
          boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
        }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
          <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
        </svg>
        Admin
      </button>
    );
  }

  const linkStyle = {
    color: "#d4d4d8", textDecoration: "none" as const, fontSize: 13,
    padding: "4px 10px", borderRadius: 4, transition: "background 0.15s",
    whiteSpace: "nowrap" as const,
  };

  return (
    <>
      <style>{\`
        @media (max-width: 639px) {
          .nm-admin-label { display: none !important; }
          .nm-admin-link { padding: 6px !important; }
        }
      \`}</style>
      <div style={{
        position: "fixed", top: 0, left: 0, right: 0, height: 44, zIndex: 9999,
        background: "#1e1e2e", borderBottom: "1px solid rgba(255,255,255,0.08)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 16px",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        fontSize: 13, color: "#e4e4e7",
        boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
          <a href={dashUrl} style={{
            background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
            color: "#fff", fontWeight: 700, fontSize: 11,
            padding: "3px 8px", borderRadius: 4, textDecoration: "none",
            letterSpacing: 0.5, flexShrink: 0,
          }}>NM</a>
          <span style={{ color: "#a1a1aa", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 140 }}>
            {businessName}
          </span>
          <div style={{ width: 1, height: 20, background: "rgba(255,255,255,0.08)", flexShrink: 0 }} />
          <a href={dashUrl + "/editor"} className="nm-admin-link" style={linkStyle}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
              <span className="nm-admin-label">Edit Site</span>
            </span>
          </a>
          <a href={dashUrl} className="nm-admin-link" style={linkStyle}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
                <rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
              </svg>
              <span className="nm-admin-label">Dashboard</span>
            </span>
          </a>
          <a href={dashUrl + "/settings"} className="nm-admin-link" style={linkStyle}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
              </svg>
              <span className="nm-admin-label">Settings</span>
            </span>
          </a>
        </div>
        <button
          onClick={() => setHidden(true)}
          style={{
            color: "#71717a", background: "transparent",
            border: "1px solid rgba(255,255,255,0.08)", borderRadius: 4,
            padding: "4px 10px", fontSize: 12, cursor: "pointer",
            whiteSpace: "nowrap", transition: "all 0.15s", flexShrink: 0,
          }}
        >
          <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            <span className="nm-admin-label">View as Visitor</span>
          </span>
        </button>
      </div>
    </>
  );
}
`,
  });

  files.push({
    file: "src/app/layout.tsx",
    data: `import "./globals.css";
import type { Metadata } from "next";
import Nav from "@/components/Nav";
import AdminBar from "@/components/AdminBar";

export const metadata: Metadata = {
  title: "${esc(config.siteContent.seo?.title || config.name)}",
  description: "${esc(config.siteContent.seo?.description || config.tagline)}",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=${encodeURIComponent(headingFont)}:wght@400;500;600;700;800&family=${encodeURIComponent(bodyFont)}:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <AdminBar businessName="${esc(config.name)}" />
        <Nav />
        {children}
        <footer style={{
          borderTop: "1px solid rgba(${tb},0.06)",
          padding: "48px 24px",
        }}>
          <div style={{
            maxWidth: 1100, margin: "0 auto",
            display: "flex", flexDirection: "column", alignItems: "center", gap: 16,
          }}>
            <span className="gradient-text" style={{ fontSize: 16, fontWeight: 700 }}>
              ${esc(config.name)}
            </span>
            <div style={{ display: "flex", gap: 24 }}>
              ${navLinks.map(l => `<a href="${l.href}" style={{ fontSize: 13, color: "rgba(${tb},0.35)", transition: "color 0.2s" }}>${l.label}</a>`).join("\n              ")}
            </div>
            <p style={{ color: "rgba(${tb},0.2)", fontSize: 12, marginTop: 8 }}>
              &copy; 2026 ${esc(config.name)}. All rights reserved.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
`,
  });

  // ── Home Page (dynamic) ──
  files.push({
    file: "src/app/page.tsx",
    data: `import { getBusiness } from "@/lib/data";

export const revalidate = 60;

export default async function Home() {
  const biz = await getBusiness();
  if (!biz) return <div style={{ padding: 80, textAlign: "center", color: "rgba(${tb},0.4)" }}>Loading...</div>;

  const hero = biz.site_content?.hero || {};
  const features = biz.site_content?.features || [];
  const testimonials = biz.site_content?.testimonials || [];
  const process = biz.site_content?.process || {};
  const stats = biz.site_content?.stats || [];
  const faq = biz.site_content?.faq || [];
  const cta = biz.site_content?.cta || {};
  const socialProof = biz.site_content?.social_proof || {};
  const products = biz.site_content?.products || [];
  const images = biz.site_content?.images || {};
  const isServices = biz.type === "services";

  return (
    <>
      {/* ── Hero ── */}
      <section style={{
        minHeight: "90vh",
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        textAlign: "center", padding: "80px 24px 40px",
        position: "relative", overflow: "hidden",
      }}>
        {/* Background glow */}
        <div style={{
          position: "absolute", top: "-40%", left: "50%", transform: "translateX(-50%)",
          width: "80%", maxWidth: 700, height: 500,
          background: "radial-gradient(ellipse, ${primary}15 0%, transparent 70%)",
          filter: "blur(60px)", pointerEvents: "none",
        }} />
        <div style={{ position: "relative", maxWidth: 720, margin: "0 auto" }}>
          {hero.badge && (
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "6px 16px", borderRadius: 100,
              border: "1px solid rgba(${tb},0.1)",
              background: "rgba(${tb},0.04)",
              fontSize: 13, fontWeight: 500, color: "rgba(${tb},0.6)",
              marginBottom: 24,
            }}>
              <span className="glow-dot" />
              {hero.badge}
            </div>
          )}
          {!hero.badge && (
            <p style={{
              fontSize: 13, fontWeight: 600, letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "${primary}", marginBottom: 20,
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            }}>
              <span className="glow-dot" />
              {biz.type === "services" ? "Professional Services" : "Digital Products"}
            </p>
          )}
          <h1 style={{
            fontSize: "clamp(2.5rem, 6vw, 4.25rem)",
            fontWeight: 800, lineHeight: 1.08,
            letterSpacing: "-0.03em",
            marginBottom: 24,
          }}>
            {hero.headline || biz.name}
          </h1>
          <p style={{
            fontSize: "clamp(1rem, 2.5vw, 1.2rem)",
            color: "rgba(${tb},0.55)",
            lineHeight: 1.7, marginBottom: 40,
            maxWidth: 560, margin: "0 auto 40px",
          }}>
            {hero.subheadline || biz.tagline}
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <a href={isServices ? "/contact" : "/${isServices ? "services" : "products"}"} className="cta-btn">
              {cta.button_text || (isServices ? "Book a Strategy Call" : "View Products")}
              <span style={{ fontSize: 18 }}>&rarr;</span>
            </a>
            <a href="/about" className="btn-secondary">Learn More</a>
          </div>
        </div>

        {/* ── Hero Visual ── */}
        <div style={{
          position: "relative", maxWidth: 900, width: "100%",
          margin: "56px auto 0", padding: "0 24px",
        }}>
          {images.hero ? (
            <div style={{
              borderRadius: 16, overflow: "hidden",
              border: "1px solid rgba(${tb},0.1)",
              boxShadow: "0 24px 80px rgba(0,0,0,${shadowAlpha}), 0 0 120px ${primary}08",
            }}>
              <img src={images.hero} alt={biz.name} style={{ width: "100%", height: "auto", display: "block" }} />
            </div>
          ) : (
            <div style={{
              height: 340, borderRadius: 16, overflow: "hidden",
              border: "1px solid rgba(${tb},0.1)",
              background: "linear-gradient(135deg, ${primary}18, ${accent}12, rgba(${tb},0.03))",
              boxShadow: "0 24px 80px rgba(0,0,0,${shadowAlpha}), 0 0 120px ${primary}08",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <div style={{
                fontSize: "clamp(3rem, 8vw, 6rem)", fontWeight: 800,
                background: "linear-gradient(135deg, ${primary}44, ${accent}33)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}>
                {biz.name.charAt(0)}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── Social Proof / Trusted By ── */}
      {socialProof.logos && socialProof.logos.length > 0 && (
        <section style={{
          padding: "40px 24px",
          borderTop: "1px solid rgba(${tb},0.05)",
        }}>
          <div className="container" style={{ textAlign: "center" }}>
            <p style={{ fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", color: "rgba(${tb},0.3)", marginBottom: 24 }}>
              Trusted by leading companies
            </p>
            <div style={{
              display: "flex", justifyContent: "center", alignItems: "center",
              flexWrap: "wrap", gap: "24px 48px",
            }}>
              {socialProof.logos.map((name: string, i: number) => (
                <span key={i} style={{
                  fontSize: 16, fontWeight: 700, letterSpacing: "-0.02em",
                  color: "rgba(${tb},0.2)",
                }}>
                  {name}
                </span>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Stats Bar ── */}
      {stats.length > 0 && (
        <section style={{
          borderTop: "1px solid rgba(${tb},0.05)",
          borderBottom: "1px solid rgba(${tb},0.05)",
          padding: "40px 24px",
        }}>
          <div className="container" style={{
            display: "flex", justifyContent: "center", flexWrap: "wrap",
            gap: "40px 64px",
          }}>
            {stats.map((s: any, i: number) => (
              <div key={i} style={{ textAlign: "center" }}>
                <p className="gradient-text" style={{ fontSize: 36, fontWeight: 800, lineHeight: 1, marginBottom: 4 }}>
                  {s.value}
                </p>
                <p style={{ color: "rgba(${tb},0.4)", fontSize: 13, fontWeight: 500 }}>{s.label}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Features / Why Us ── */}
      {features.length > 0 && (
        <section className="section" style={{ borderTop: "1px solid rgba(${tb},0.05)" }}>
          <div className="container">
            <div style={{ textAlign: "center", marginBottom: 56 }}>
              <p style={{ fontSize: 13, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "${primary}", marginBottom: 12 }}>
                Why Choose Us
              </p>
              <h2 style={{
                fontSize: "clamp(1.75rem, 4vw, 2.75rem)",
                fontWeight: 700, letterSpacing: "-0.02em",
              }}>
                Built different.
              </h2>
            </div>
            <div className="grid-3">
              {features.map((f: any, i: number) => (
                <div key={i} className="card">
                  <div style={{
                    width: 40, height: 40, borderRadius: 10,
                    background: "${primary}12",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    marginBottom: 16, fontSize: 18,
                  }}>
                    {["\\u2728", "\\u26A1", "\\u{1F680}", "\\u{1F3AF}", "\\u{1F4A1}", "\\u{1F50D}"][i % 6]}
                  </div>
                  <h3 style={{ fontWeight: 600, fontSize: 17, marginBottom: 8 }}>{f.title}</h3>
                  <p style={{ color: "rgba(${tb},0.5)", fontSize: 14, lineHeight: 1.7 }}>{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Video / Showcase Section ── */}
      <section className="section" style={{ borderTop: "1px solid rgba(${tb},0.05)" }}>
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <p style={{ fontSize: 13, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "${primary}", marginBottom: 12 }}>
              See It In Action
            </p>
            <h2 style={{ fontSize: "clamp(1.75rem, 4vw, 2.75rem)", fontWeight: 700, letterSpacing: "-0.02em" }}>
              {isServices ? "How we deliver results" : "Watch how it works"}
            </h2>
          </div>
          {biz.video_url ? (
            <div style={{
              position: "relative", paddingBottom: "56.25%", height: 0,
              borderRadius: 16, overflow: "hidden",
              border: "1px solid rgba(${tb},0.1)",
              boxShadow: "0 16px 64px rgba(0,0,0,${shadowAlpha})",
            }}>
              <iframe
                src={biz.video_url}
                style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", border: "none" }}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          ) : (
            <div style={{
              borderRadius: 16, overflow: "hidden",
              border: "1px solid rgba(${tb},0.1)",
              background: "linear-gradient(135deg, ${primary}08, ${accent}06)",
              padding: "80px 32px",
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
              textAlign: "center", position: "relative",
              boxShadow: "0 16px 64px rgba(0,0,0,${shadowAlpha})",
            }}>
              {/* Play button placeholder */}
              <div style={{
                width: 72, height: 72, borderRadius: "50%",
                background: "${primary}",
                display: "flex", alignItems: "center", justifyContent: "center",
                marginBottom: 24,
                boxShadow: "0 8px 32px ${primary}44",
                cursor: "pointer",
              }}>
                <div style={{
                  width: 0, height: 0,
                  borderTop: "14px solid transparent",
                  borderBottom: "14px solid transparent",
                  borderLeft: "22px solid ${ctaText}",
                  marginLeft: 4,
                }} />
              </div>
              <p style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>
                {isServices ? "See our process in action" : "Product walkthrough"}
              </p>
              <p style={{ color: "rgba(${tb},0.4)", fontSize: 14 }}>
                Video coming soon
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ── Featured Products/Services Preview ── */}
      {products.length > 0 && (
        <section className="section" style={{ borderTop: "1px solid rgba(${tb},0.05)" }}>
          <div className="container">
            <div style={{ textAlign: "center", marginBottom: 48 }}>
              <p style={{ fontSize: 13, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "${primary}", marginBottom: 12 }}>
                {isServices ? "Our Services" : "Featured Products"}
              </p>
              <h2 style={{ fontSize: "clamp(1.75rem, 4vw, 2.75rem)", fontWeight: 700, letterSpacing: "-0.02em" }}>
                {isServices ? "Choose your path" : "What we offer"}
              </h2>
            </div>
            <div className="grid-3">
              {products.slice(0, 3).map((p: any, i: number) => {
                const slug = p.slug || p.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-+$/g, "");
                return (
                <div key={i} style={{
                  borderRadius: 16, overflow: "hidden",
                  border: "1px solid rgba(${tb},0.08)",
                  transition: "all 0.3s ease-out",
                  display: "flex", flexDirection: "column",
                }}>
                  {/* Card visual header */}
                  <div style={{
                    height: 180, position: "relative", overflow: "hidden",
                    background: "linear-gradient(135deg, ${primary}" + (15 + i * 8).toString(16).padStart(2, "0") + ", ${accent}" + (10 + i * 6).toString(16).padStart(2, "0") + ")",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    {images.products && images.products[i] ? (
                      <img src={images.products[i]} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover", position: "absolute", top: 0, left: 0 }} />
                    ) : (
                      <span style={{ fontSize: 48, opacity: 0.4 }}>
                        {["\\u{1F3AF}", "\\u{1F680}", "\\u{1F4A1}"][i % 3]}
                      </span>
                    )}
                    {i === 0 && products.length > 1 && (
                      <span style={{
                        position: "absolute", top: 12, right: 12,
                        fontSize: 11, fontWeight: 700, textTransform: "uppercase",
                        letterSpacing: "0.06em",
                        padding: "4px 10px", borderRadius: 6,
                        background: "${primary}", color: "${ctaText}",
                      }}>
                        Most Popular
                      </span>
                    )}
                  </div>
                  {/* Card body */}
                  <div style={{ padding: "24px 24px 28px", flex: 1, display: "flex", flexDirection: "column" }}>
                    <h3 style={{ fontWeight: 700, fontSize: 18, marginBottom: 4 }}>{p.name}</h3>
                    {!isServices && p.tagline && (
                      <p style={{ color: "rgba(${tb},0.5)", fontSize: 13, fontStyle: "italic", marginBottom: 8 }}>{p.tagline}</p>
                    )}
                    <p className="gradient-text" style={{ fontWeight: 800, fontSize: 24, marginBottom: isServices ? 12 : 8 }}>
                      {p.price}
                    </p>
                    {!isServices && p.audience && (
                      <p style={{ color: "rgba(${tb},0.45)", fontSize: 12, marginBottom: 12 }}>
                        {String.fromCodePoint(0x1F464)} {p.audience}
                      </p>
                    )}
                    <p style={{ color: "rgba(${tb},0.5)", fontSize: 13, lineHeight: 1.7, flex: 1, marginBottom: 20 }}>
                      {p.desc}
                    </p>
                    <a href={isServices ? "/contact" : \`/products/\${slug}\`} className="cta-btn" style={{ width: "100%", padding: "12px", fontSize: 14 }}>
                      {isServices ? "Get Started" : "Learn More \\u2192"}
                    </a>
                  </div>
                </div>
                );
              })}
            </div>
            {products.length > 3 && (
              <div style={{ textAlign: "center", marginTop: 32 }}>
                <a href={isServices ? "/services" : "/products"} className="btn-secondary" style={{ padding: "12px 28px" }}>
                  View All {isServices ? "Services" : "Products"} &rarr;
                </a>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── Testimonials ── */}
      {testimonials.length > 0 && (
        <section className="section" style={{ borderTop: "1px solid rgba(${tb},0.05)" }}>
          <div className="container">
            <div style={{ textAlign: "center", marginBottom: 56 }}>
              <p style={{ fontSize: 13, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "${primary}", marginBottom: 12 }}>
                Testimonials
              </p>
              <h2 style={{ fontSize: "clamp(1.75rem, 4vw, 2.75rem)", fontWeight: 700, letterSpacing: "-0.02em" }}>
                What people are saying
              </h2>
            </div>
            <div className="grid-3">
              {testimonials.map((t: any, i: number) => (
                <div key={i} className="card" style={{ display: "flex", flexDirection: "column" }}>
                  {t.rating && (
                    <div style={{ marginBottom: 12, color: "#facc15", fontSize: 14, letterSpacing: 2 }}>
                      {"\\u2605".repeat(t.rating)}{"\\u2606".repeat(5 - t.rating)}
                    </div>
                  )}
                  <p style={{ color: "rgba(${tb},0.6)", fontSize: 14, lineHeight: 1.7, flex: 1, marginBottom: 20 }}>
                    &ldquo;{t.text}&rdquo;
                  </p>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: "50%",
                      background: "linear-gradient(135deg, ${primary}44, ${accent}44)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 14, fontWeight: 600,
                    }}>
                      {t.name?.charAt(0)}
                    </div>
                    <div>
                      <p style={{ fontWeight: 600, fontSize: 14 }}>{t.name}</p>
                      <p style={{ color: "rgba(${tb},0.4)", fontSize: 12 }}>{t.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Process / How It Works ── */}
      {process.steps && process.steps.length > 0 && (
        <section className="section" style={{ borderTop: "1px solid rgba(${tb},0.05)" }}>
          <div className="container">
            <div style={{ textAlign: "center", marginBottom: 56 }}>
              <p style={{ fontSize: 13, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "${primary}", marginBottom: 12 }}>
                How It Works
              </p>
              <h2 style={{ fontSize: "clamp(1.75rem, 4vw, 2.75rem)", fontWeight: 700, letterSpacing: "-0.02em" }}>
                {process.title || "Simple. Effective. Done."}
              </h2>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 0, maxWidth: 700, margin: "0 auto" }}>
              {process.steps.map((s: any, i: number) => (
                <div key={i} style={{
                  display: "flex", gap: 24, padding: "32px 0",
                  borderBottom: i < (process.steps?.length || 0) - 1 ? "1px solid rgba(${tb},0.06)" : "none",
                }}>
                  <div style={{
                    width: 48, height: 48, minWidth: 48, borderRadius: 14,
                    background: "${primary}12", border: "1px solid ${primary}22",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 20, fontWeight: 800, color: "${primary}",
                  }}>
                    {s.step}
                  </div>
                  <div>
                    <h3 style={{ fontWeight: 700, fontSize: 18, marginBottom: 6 }}>{s.title}</h3>
                    <p style={{ color: "rgba(${tb},0.5)", fontSize: 14, lineHeight: 1.7 }}>{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── FAQ ── */}
      {faq.length > 0 && (
        <section className="section" style={{ borderTop: "1px solid rgba(${tb},0.05)" }}>
          <div style={{ maxWidth: 700, margin: "0 auto", padding: "0 24px" }}>
            <div style={{ textAlign: "center", marginBottom: 48 }}>
              <p style={{ fontSize: 13, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "${primary}", marginBottom: 12 }}>
                FAQ
              </p>
              <h2 style={{ fontSize: "clamp(1.75rem, 4vw, 2.75rem)", fontWeight: 700, letterSpacing: "-0.02em" }}>
                Common questions
              </h2>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {faq.map((f: any, i: number) => (
                <div key={i} style={{
                  padding: "24px 28px", borderRadius: 14,
                  border: "1px solid rgba(${tb},0.06)",
                  background: "rgba(${tb},0.02)",
                }}>
                  <h3 style={{ fontWeight: 600, fontSize: 16, marginBottom: 10 }}>{f.question}</h3>
                  <p style={{ color: "rgba(${tb},0.5)", fontSize: 14, lineHeight: 1.7 }}>{f.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── CTA Section ── */}
      <section style={{
        padding: "80px 24px",
        borderTop: "1px solid rgba(${tb},0.05)",
        textAlign: "center",
        position: "relative", overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", bottom: "-50%", left: "50%", transform: "translateX(-50%)",
          width: "90%", maxWidth: 800, height: 400,
          background: "radial-gradient(ellipse, ${primary}10 0%, transparent 70%)",
          filter: "blur(80px)", pointerEvents: "none",
        }} />
        <div style={{ position: "relative", maxWidth: 550, margin: "0 auto" }}>
          <h2 style={{
            fontSize: "clamp(1.75rem, 4vw, 2.5rem)",
            fontWeight: 700, letterSpacing: "-0.02em", marginBottom: 16,
          }}>
            {cta.headline || "Ready to get started?"}
          </h2>
          <p style={{
            color: "rgba(${tb},0.5)", fontSize: 16, lineHeight: 1.7, marginBottom: 32,
          }}>
            {cta.subheadline || biz.tagline}
          </p>
          <a href={isServices ? "/contact" : "/${isServices ? "services" : "products"}"} className="cta-btn">
            {cta.button_text || (isServices ? "Book a Strategy Call" : "Get Started")}
            <span style={{ fontSize: 18 }}>&rarr;</span>
          </a>
        </div>
      </section>
    </>
  );
}
`,
  });

  // ── About Page (dynamic) ──
  files.push({
    file: "src/app/about/page.tsx",
    data: `import { getBusiness } from "@/lib/data";

export const revalidate = 60;

export default async function About() {
  const biz = await getBusiness();
  if (!biz) return null;

  const about = biz.site_content?.about || {};
  const values = biz.brand?.values || [];
  const images = biz.site_content?.images || {};

  return (
    <>
      <section style={{
        padding: "80px 24px 40px", textAlign: "center",
        position: "relative", overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", top: "-30%", left: "50%", transform: "translateX(-50%)",
          width: "60%", height: 300,
          background: "radial-gradient(ellipse, ${primary}10 0%, transparent 70%)",
          filter: "blur(60px)", pointerEvents: "none",
        }} />
        <div style={{ position: "relative", maxWidth: 650, margin: "0 auto" }}>
          <p style={{ fontSize: 13, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "${primary}", marginBottom: 16 }}>
            About Us
          </p>
          <h1 style={{
            fontSize: "clamp(2rem, 5vw, 3.25rem)",
            fontWeight: 800, letterSpacing: "-0.02em", lineHeight: 1.1, marginBottom: 20,
          }}>
            {about.title || "About " + biz.name}
          </h1>
          <p style={{ color: "rgba(${tb},0.5)", fontSize: 16, lineHeight: 1.7 }}>
            {biz.tagline}
          </p>
        </div>
      </section>

      {/* About image */}
      {images.about && (
        <div style={{ maxWidth: 800, margin: "0 auto", padding: "0 24px" }}>
          <div style={{
            borderRadius: 16, overflow: "hidden",
            border: "1px solid rgba(${tb},0.08)",
            boxShadow: "0 16px 64px rgba(0,0,0,${shadowAlpha})",
          }}>
            <img src={images.about} alt={"About " + biz.name} style={{ width: "100%", height: "auto", display: "block" }} />
          </div>
        </div>
      )}

      <section className="section">
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          {about.text && (
            <p style={{
              color: "rgba(${tb},0.65)", fontSize: 17, lineHeight: 1.85,
              whiteSpace: "pre-wrap",
            }}>
              {about.text}
            </p>
          )}

          {about.mission && (
            <div style={{
              marginTop: 56, padding: "36px 32px", borderRadius: 16,
              border: "1px solid rgba(${tb},0.06)",
              background: "rgba(${tb},0.02)",
              textAlign: "center",
            }}>
              <p style={{ fontSize: 13, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "${primary}", marginBottom: 12 }}>
                Our Mission
              </p>
              <p style={{ color: "rgba(${tb},0.6)", fontSize: 18, lineHeight: 1.6, fontWeight: 500 }}>
                {about.mission}
              </p>
            </div>
          )}

          {values.length > 0 && (
            <div style={{ marginTop: 56 }}>
              <h2 style={{ fontSize: 22, fontWeight: 700, textAlign: "center", marginBottom: 28 }}>Our Values</h2>
              <div className="grid-2">
                {values.map((v: string, i: number) => (
                  <div key={i} style={{
                    padding: "20px 24px", borderRadius: 12,
                    border: "1px solid rgba(${tb},0.06)",
                    background: "rgba(${tb},0.02)",
                    display: "flex", alignItems: "center", gap: 12,
                  }}>
                    <span className="glow-dot" />
                    <span style={{ color: "rgba(${tb},0.7)", fontSize: 15 }}>{v}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
`,
  });

  // ── Products/Services Page (dynamic) ──
  const productsPath = isServices ? "services" : "products";

  if (isServices) {
    // Services: pricing grid with "Get Started" → /contact
    files.push({
      file: `src/app/${productsPath}/page.tsx`,
      data: `import { getBusiness } from "@/lib/data";

export const revalidate = 60;

export default async function ServicesPage() {
  const biz = await getBusiness();
  if (!biz) return null;

  const products = biz.site_content?.products || [];

  return (
    <>
      <section style={{
        padding: "80px 24px 40px", textAlign: "center",
        position: "relative", overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", top: "-30%", left: "50%", transform: "translateX(-50%)",
          width: "60%", height: 300,
          background: "radial-gradient(ellipse, ${primary}10 0%, transparent 70%)",
          filter: "blur(60px)", pointerEvents: "none",
        }} />
        <div style={{ position: "relative" }}>
          <p style={{ fontSize: 13, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "${primary}", marginBottom: 16 }}>
            What We Offer
          </p>
          <h1 style={{
            fontSize: "clamp(2rem, 5vw, 3.25rem)",
            fontWeight: 800, letterSpacing: "-0.02em", lineHeight: 1.1,
          }}>
            Services & Pricing
          </h1>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="grid-3">
            {products.map((p: any, i: number) => (
              <div key={i} style={{
                padding: "36px 28px", borderRadius: 16,
                border: "1px solid ${primary}22",
                background: "${primary}06",
                display: "flex", flexDirection: "column",
                transition: "all 0.3s ease-out",
              }}>
                {i === 0 && products.length > 1 && (
                  <span style={{
                    fontSize: 11, fontWeight: 700, textTransform: "uppercase",
                    letterSpacing: "0.08em", color: "${primary}",
                    marginBottom: 12,
                  }}>
                    Most Popular
                  </span>
                )}
                <h3 style={{ fontWeight: 700, fontSize: 20, marginBottom: 8 }}>{p.name}</h3>
                <p className="gradient-text" style={{ fontWeight: 800, fontSize: 28, marginBottom: 16 }}>
                  {p.price}
                </p>
                <p style={{ color: "rgba(${tb},0.5)", fontSize: 14, lineHeight: 1.7, marginBottom: 20, flex: 1 }}>
                  {p.desc}
                </p>
                {p.features && p.features.length > 0 && (
                  <ul style={{ listStyle: "none", padding: 0, marginBottom: 24 }}>
                    {p.features.map((feat: string, fi: number) => (
                      <li key={fi} style={{
                        padding: "6px 0", fontSize: 13,
                        color: "rgba(${tb},0.55)",
                        display: "flex", alignItems: "center", gap: 8,
                      }}>
                        <span style={{ color: "${primary}", fontSize: 14 }}>{"\\u2713"}</span>
                        {feat}
                      </li>
                    ))}
                  </ul>
                )}
                <a href="/contact" className="cta-btn" style={{ width: "100%", padding: "12px", fontSize: 14 }}>
                  Get Started
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
`,
    });
  } else {
    // Digital products: catalog page with links to individual product pages
    files.push({
      file: "src/app/products/page.tsx",
      data: `import { getBusiness } from "@/lib/data";

export const revalidate = 60;

function getSlug(p: any): string {
  return p.slug || p.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-+$/g, "");
}

export default async function ProductsPage() {
  const biz = await getBusiness();
  if (!biz) return null;

  const products = biz.site_content?.products || [];
  const images = biz.site_content?.images || {};

  return (
    <>
      <section style={{
        padding: "80px 24px 40px", textAlign: "center",
        position: "relative", overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", top: "-30%", left: "50%", transform: "translateX(-50%)",
          width: "60%", height: 300,
          background: "radial-gradient(ellipse, ${primary}10 0%, transparent 70%)",
          filter: "blur(60px)", pointerEvents: "none",
        }} />
        <div style={{ position: "relative", maxWidth: 600, margin: "0 auto" }}>
          <p style={{ fontSize: 13, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "${primary}", marginBottom: 16 }}>
            Our Products
          </p>
          <h1 style={{
            fontSize: "clamp(2rem, 5vw, 3.25rem)",
            fontWeight: 800, letterSpacing: "-0.02em", lineHeight: 1.1, marginBottom: 16,
          }}>
            Everything you need to succeed
          </h1>
          <p style={{ color: "rgba(${tb},0.5)", fontSize: 16, lineHeight: 1.7 }}>
            Courses, templates, and resources built from real experience.
          </p>
        </div>
      </section>

      <section className="section">
        <div style={{ maxWidth: 800, margin: "0 auto", padding: "0 24px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            {products.map((p: any, i: number) => {
              const slug = getSlug(p);
              return (
                <a key={i} href={"/products/" + slug} style={{
                  display: "flex", flexDirection: "column", overflow: "hidden",
                  borderRadius: 16, border: "1px solid rgba(${tb},0.08)",
                  transition: "all 0.3s ease-out", textDecoration: "none", color: "inherit",
                }}>
                  {/* Visual header */}
                  <div style={{
                    height: 200, position: "relative", overflow: "hidden",
                    background: "linear-gradient(135deg, ${primary}" + (15 + i * 8).toString(16).padStart(2, "0") + ", ${accent}" + (10 + i * 6).toString(16).padStart(2, "0") + ")",
                  }}>
                    {images.products && images.products[i] ? (
                      <img src={images.products[i]} alt={p.name} style={{
                        width: "100%", height: "100%", objectFit: "cover",
                        position: "absolute", top: 0, left: 0,
                      }} />
                    ) : null}
                    <div style={{
                      position: "absolute", bottom: 0, left: 0, right: 0,
                      padding: "48px 28px 20px",
                      background: "linear-gradient(transparent, rgba(0,0,0,0.7))",
                      display: "flex", alignItems: "flex-end", justifyContent: "space-between",
                    }}>
                      <div>
                        <h2 style={{ fontWeight: 800, fontSize: 22, marginBottom: 4, color: "#fff" }}>{p.name}</h2>
                        {p.tagline && <p style={{ fontSize: 14, color: "rgba(255,255,255,0.7)" }}>{p.tagline}</p>}
                      </div>
                      <span style={{
                        fontSize: 28, fontWeight: 800, color: "#fff",
                      }}>
                        {p.price}
                      </span>
                    </div>
                  </div>
                  {/* Card body */}
                  <div style={{ padding: "24px 28px" }}>
                    {p.audience && (
                      <p style={{ fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: "${primary}", marginBottom: 10 }}>
                        {p.audience}
                      </p>
                    )}
                    <p style={{ color: "rgba(${tb},0.55)", fontSize: 14, lineHeight: 1.7, marginBottom: 16 }}>
                      {p.desc}
                    </p>
                    <span style={{ fontSize: 14, fontWeight: 600, color: "${primary}", display: "inline-flex", alignItems: "center", gap: 6 }}>
                      Learn more <span style={{ fontSize: 16 }}>&rarr;</span>
                    </span>
                  </div>
                </a>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
`,
    });

    // ── Individual Product Page (Shopify-style) ──
    files.push({
      file: "src/app/products/[slug]/page.tsx",
      data: `import { getBusiness } from "@/lib/data";
import { notFound } from "next/navigation";

export const revalidate = 60;

function getSlug(p: any): string {
  return p.slug || p.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-+$/g, "");
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const biz = await getBusiness();
  if (!biz) return notFound();

  const products = biz.site_content?.products || [];
  const product = products.find((p: any) => getSlug(p) === slug);
  if (!product) return notFound();

  const productIndex = products.indexOf(product);
  const images = biz.site_content?.images || {};
  const productImage = images.products && images.products[productIndex];
  const testimonials = (biz.site_content?.testimonials || []).slice(0, 2);

  return (
    <>
      {/* ── Product Hero: Image + Buy Box ── */}
      <section style={{ padding: "40px 24px 60px" }}>
        <div style={{ maxWidth: 1060, margin: "0 auto" }}>
          <div className="product-two-col" style={{ gap: 48 }}>

            {/* Left — Product image */}
            <div>
              {productImage ? (
                <div style={{
                  borderRadius: 12, overflow: "hidden",
                  border: "1px solid rgba(${tb},0.08)",
                  boxShadow: "0 8px 40px rgba(0,0,0,${shadowAlpha})",
                  aspectRatio: "4/3",
                }}>
                  <img src={productImage} alt={product.name} style={{
                    width: "100%", height: "100%", objectFit: "cover", display: "block",
                  }} />
                </div>
              ) : (
                <div style={{
                  aspectRatio: "4/3", borderRadius: 12,
                  border: "1px solid rgba(${tb},0.08)",
                  background: "linear-gradient(135deg, ${primary}08, ${accent}06)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <span style={{ fontSize: 72, fontWeight: 800, opacity: 0.15 }}>
                    {product.name.charAt(0)}
                  </span>
                </div>
              )}
            </div>

            {/* Right — Buy box */}
            <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
              {product.audience && (
                <p style={{
                  fontSize: 12, fontWeight: 600, textTransform: "uppercase",
                  letterSpacing: "0.06em", color: "${primary}", marginBottom: 12,
                }}>
                  {product.audience}
                </p>
              )}

              <h1 style={{
                fontSize: "clamp(1.75rem, 4vw, 2.5rem)",
                fontWeight: 800, letterSpacing: "-0.02em", lineHeight: 1.15, marginBottom: 12,
              }}>
                {product.name}
              </h1>

              {product.tagline && (
                <p style={{ color: "rgba(${tb},0.5)", fontSize: 15, lineHeight: 1.6, marginBottom: 20 }}>
                  {product.tagline}
                </p>
              )}

              <p style={{ fontSize: 32, fontWeight: 800, marginBottom: 24, color: "inherit" }}>
                {product.price}
              </p>

              <a href={\`/api/checkout?product=\${slug}\`} className="cta-btn" style={{
                padding: "16px 32px", fontSize: 16, textAlign: "center", width: "100%",
              }}>
                Add to Cart
              </a>

              {/* Trust signals */}
              <div style={{
                display: "flex", flexWrap: "wrap", gap: 16, marginTop: 20,
                paddingTop: 20, borderTop: "1px solid rgba(${tb},0.06)",
              }}>
                {product.guarantee && (
                  <span style={{ fontSize: 13, color: "rgba(${tb},0.45)", display: "flex", alignItems: "center", gap: 6 }}>
                    {"\\u{1F6E1}"} {product.guarantee}
                  </span>
                )}
                <span style={{ fontSize: 13, color: "rgba(${tb},0.45)", display: "flex", alignItems: "center", gap: 6 }}>
                  {"\\u26A1"} Instant access
                </span>
              </div>

              {/* Short description */}
              {product.desc && (
                <p style={{
                  color: "rgba(${tb},0.5)", fontSize: 14, lineHeight: 1.7,
                  marginTop: 24, paddingTop: 20, borderTop: "1px solid rgba(${tb},0.06)",
                }}>
                  {product.desc}
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── What's Included ── */}
      {product.what_you_get && product.what_you_get.length > 0 && (
        <section style={{ padding: "60px 24px", borderTop: "1px solid rgba(${tb},0.05)" }}>
          <div style={{ maxWidth: 800, margin: "0 auto" }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 24, textAlign: "center" }}>
              What&apos;s included
            </h2>
            <div className="grid-2" style={{ gap: 12 }}>
              {product.what_you_get.map((item: string, i: number) => (
                <div key={i} style={{
                  display: "flex", alignItems: "flex-start", gap: 10,
                  padding: "14px 16px", borderRadius: 10,
                  border: "1px solid rgba(${tb},0.06)",
                }}>
                  <span style={{ color: "${primary}", fontSize: 14, fontWeight: 700, marginTop: 1, flexShrink: 0 }}>{"\\u2713"}</span>
                  <span style={{ color: "rgba(${tb},0.6)", fontSize: 14, lineHeight: 1.5 }}>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Features (fallback if no what_you_get) ── */}
      {(!product.what_you_get || product.what_you_get.length === 0) && product.features && product.features.length > 0 && (
        <section style={{ padding: "60px 24px", borderTop: "1px solid rgba(${tb},0.05)" }}>
          <div style={{ maxWidth: 800, margin: "0 auto" }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 24, textAlign: "center" }}>
              Features
            </h2>
            <div className="grid-2" style={{ gap: 12 }}>
              {product.features.map((feat: string, i: number) => (
                <div key={i} style={{
                  display: "flex", alignItems: "flex-start", gap: 10,
                  padding: "14px 16px", borderRadius: 10,
                  border: "1px solid rgba(${tb},0.06)",
                }}>
                  <span style={{ color: "${primary}", fontSize: 14, fontWeight: 700, marginTop: 1, flexShrink: 0 }}>{"\\u2713"}</span>
                  <span style={{ color: "rgba(${tb},0.6)", fontSize: 14, lineHeight: 1.5 }}>{feat}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Social proof (max 2 reviews) ── */}
      {testimonials.length > 0 && (
        <section style={{ padding: "48px 24px", borderTop: "1px solid rgba(${tb},0.05)" }}>
          <div style={{ maxWidth: 700, margin: "0 auto" }}>
            <div className="grid-2" style={{ gap: 16 }}>
              {testimonials.map((t: any, i: number) => (
                <div key={i} style={{
                  padding: "20px", borderRadius: 12,
                  border: "1px solid rgba(${tb},0.06)",
                }}>
                  {t.rating && (
                    <div style={{ marginBottom: 8, color: "#facc15", fontSize: 12, letterSpacing: 2 }}>
                      {"\\u2605".repeat(t.rating)}
                    </div>
                  )}
                  <p style={{ color: "rgba(${tb},0.6)", fontSize: 13, lineHeight: 1.6, marginBottom: 10 }}>
                    &ldquo;{t.text}&rdquo;
                  </p>
                  <p style={{ fontWeight: 600, fontSize: 12, color: "rgba(${tb},0.4)" }}>
                    {t.name}{t.role ? " \\u2014 " + t.role : ""}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
`,
    });
  }

  // ── Contact Page (dynamic) ──
  files.push({
    file: "src/app/contact/page.tsx",
    data: `import { getBusiness } from "@/lib/data";

export const revalidate = 60;

export default async function Contact() {
  const biz = await getBusiness();
  if (!biz) return null;

  const contact = biz.site_content?.contact || {};
  const isServices = biz.type === "services";

  return (
    <>
      <section style={{
        padding: "80px 24px 40px", textAlign: "center",
        position: "relative", overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", top: "-30%", left: "50%", transform: "translateX(-50%)",
          width: "60%", height: 300,
          background: "radial-gradient(ellipse, ${primary}10 0%, transparent 70%)",
          filter: "blur(60px)", pointerEvents: "none",
        }} />
        <div style={{ position: "relative", maxWidth: 550, margin: "0 auto" }}>
          <p style={{ fontSize: 13, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "${primary}", marginBottom: 16 }}>
            Get in Touch
          </p>
          <h1 style={{
            fontSize: "clamp(2rem, 5vw, 3.25rem)",
            fontWeight: 800, letterSpacing: "-0.02em", lineHeight: 1.1, marginBottom: 16,
          }}>
            {isServices ? "Book a Call" : "Contact Us"}
          </h1>
          <p style={{ color: "rgba(${tb},0.5)", fontSize: 16, lineHeight: 1.7 }}>
            {isServices
              ? "Ready to discuss your project? Let\\u2019s find a time that works."
              : "Have a question? We\\u2019d love to hear from you."}
          </p>
        </div>
      </section>

      <section className="section">
        <div style={{ maxWidth: 560, margin: "0 auto" }}>
          {biz.calendly_url && (
            <div style={{ marginBottom: 32, textAlign: "center" }}>
              <a href={biz.calendly_url} target="_blank" rel="noopener noreferrer" className="cta-btn" style={{ width: "100%", padding: 16 }}>
                Schedule a Call &rarr;
              </a>
              <div style={{
                display: "flex", alignItems: "center", gap: 16,
                margin: "24px 0", color: "rgba(${tb},0.2)", fontSize: 13,
              }}>
                <div style={{ flex: 1, height: 1, background: "rgba(${tb},0.08)" }} />
                or send a message
                <div style={{ flex: 1, height: 1, background: "rgba(${tb},0.08)" }} />
              </div>
            </div>
          )}

          <form style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <input type="text" placeholder="Your name" className="input" />
              <input type="email" placeholder="Email" className="input" />
            </div>
            <input type="text" placeholder="Subject" className="input" />
            <textarea rows={5} placeholder="Your message" className="input" style={{ resize: "vertical" }} />
            <button type="submit" className="cta-btn" style={{ width: "100%" }}>Send Message</button>
          </form>

          {(contact.email || contact.phone) && (
            <div style={{
              marginTop: 40, padding: "24px 28px", borderRadius: 14,
              border: "1px solid rgba(${tb},0.06)",
              background: "rgba(${tb},0.02)",
              display: "flex", flexDirection: "column", gap: 10,
            }}>
              {contact.email && (
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ color: "${primary}", fontSize: 16 }}>{"\\u2709"}</span>
                  <span style={{ color: "rgba(${tb},0.6)", fontSize: 14 }}>{contact.email}</span>
                </div>
              )}
              {contact.phone && (
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ color: "${primary}", fontSize: 16 }}>{"\\u260E"}</span>
                  <span style={{ color: "rgba(${tb},0.6)", fontSize: 14 }}>{contact.phone}</span>
                </div>
              )}
              {contact.hours && (
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ color: "${primary}", fontSize: 16 }}>{"\\u{1F552}"}</span>
                  <span style={{ color: "rgba(${tb},0.6)", fontSize: 14 }}>{contact.hours}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
`,
  });

  // ── FAQ Page (only if faq content exists, rendered on home or about) ──
  // FAQ is included via the about page or we can add it to the home page later

  // ── Checkout API Route (digital products only) ──
  if (!isServices) {
    files.push({
      file: "src/app/api/checkout/route.ts",
      data: `import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import Stripe from "stripe";

const BUSINESS_ID = process.env.NEXT_PUBLIC_BUSINESS_ID!;
const PLATFORM_FEE_PERCENT = 0.05;

function parsePrice(priceStr: string): { cents: number; recurring: null | "month" | "year" } {
  const lower = priceStr.toLowerCase().trim();
  const isMonthly = lower.includes("/mo");
  const isYearly = lower.includes("/y") && !lower.includes("/mo");
  let numPart = lower.replace(/\\/mo|\\/year|\\/yr|\\/y/g, "").replace(/[^0-9.k]/g, "");
  let num = 0;
  if (numPart.endsWith("k")) {
    num = parseFloat(numPart.slice(0, -1)) * 1000;
  } else {
    num = parseFloat(numPart) || 0;
  }
  return { cents: Math.round(num * 100), recurring: isMonthly ? "month" : isYearly ? "year" : null };
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const productSlug = url.searchParams.get("product");
  if (!productSlug) {
    return NextResponse.json({ error: "Missing product" }, { status: 400 });
  }

  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeKey) {
    return NextResponse.redirect(new URL("/contact", url.origin));
  }

  const db = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data: business } = await db
    .from("businesses")
    .select("stripe_account_id, site_content")
    .eq("id", BUSINESS_ID)
    .single();

  if (!business?.stripe_account_id) {
    return NextResponse.redirect(new URL("/contact", url.origin));
  }

  const products = business.site_content?.products || [];
  const product = products.find((p: any) => {
    const s = p.slug || p.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-+$/g, "");
    return s === productSlug;
  });

  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  const { cents, recurring } = parsePrice(product.price);
  if (cents <= 0) {
    return NextResponse.redirect(new URL("/contact", url.origin));
  }

  const stripe = new Stripe(stripeKey);
  const origin = url.origin;

  try {
    if (recurring) {
      const session = await stripe.checkout.sessions.create({
        mode: "subscription",
        line_items: [{
          price_data: {
            currency: "usd",
            product_data: { name: product.name, description: product.desc || undefined },
            unit_amount: cents,
            recurring: { interval: recurring },
          },
          quantity: 1,
        }],
        subscription_data: {
          application_fee_percent: PLATFORM_FEE_PERCENT * 100,
        },
        success_url: origin + "/checkout/success?session_id={CHECKOUT_SESSION_ID}",
        cancel_url: origin + "/products/" + productSlug,
      }, { stripeAccount: business.stripe_account_id });

      return NextResponse.redirect(session.url!);
    } else {
      const platformFee = Math.round(cents * PLATFORM_FEE_PERCENT);
      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        line_items: [{
          price_data: {
            currency: "usd",
            product_data: { name: product.name, description: product.desc || undefined },
            unit_amount: cents,
          },
          quantity: 1,
        }],
        payment_intent_data: {
          application_fee_amount: platformFee,
        },
        success_url: origin + "/checkout/success?session_id={CHECKOUT_SESSION_ID}",
        cancel_url: origin + "/products/" + productSlug,
      }, { stripeAccount: business.stripe_account_id });

      return NextResponse.redirect(session.url!);
    }
  } catch (err: any) {
    console.error("[checkout] Stripe error:", err);
    return NextResponse.redirect(new URL("/contact", url.origin));
  }
}
`,
    });

    // ── Checkout Success Page ──
    files.push({
      file: "src/app/checkout/success/page.tsx",
      data: `import { getBusiness } from "@/lib/data";

export const revalidate = 60;

export default async function CheckoutSuccess() {
  const biz = await getBusiness();
  if (!biz) return null;

  return (
    <section style={{
      minHeight: "70vh",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      textAlign: "center", padding: "80px 24px",
      position: "relative", overflow: "hidden",
    }}>
      <div style={{
        position: "absolute", top: "-30%", left: "50%", transform: "translateX(-50%)",
        width: "60%", height: 400,
        background: "radial-gradient(ellipse, ${primary}15 0%, transparent 70%)",
        filter: "blur(60px)", pointerEvents: "none",
      }} />
      <div style={{ position: "relative", maxWidth: 520, margin: "0 auto" }}>
        <div style={{
          width: 80, height: 80, borderRadius: "50%",
          background: "${primary}18", border: "2px solid ${primary}44",
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 28px", fontSize: 36,
        }}>
          {"\\u2713"}
        </div>
        <h1 style={{
          fontSize: "clamp(1.75rem, 4vw, 2.5rem)",
          fontWeight: 800, letterSpacing: "-0.02em", marginBottom: 16,
        }}>
          Thank you for your purchase!
        </h1>
        <p style={{
          color: "rgba(${tb},0.55)", fontSize: 16, lineHeight: 1.7, marginBottom: 12,
        }}>
          Your order has been confirmed. You'll receive an email with your receipt and access details shortly.
        </p>
        <p style={{
          color: "rgba(${tb},0.35)", fontSize: 14, marginBottom: 36,
        }}>
          If you have any questions, don't hesitate to reach out.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <a href="/" className="cta-btn">
            Back to Home <span style={{ fontSize: 18 }}>&rarr;</span>
          </a>
          <a href="/contact" className="btn-secondary">
            Contact Us
          </a>
        </div>
      </div>
    </section>
  );
}
`,
    });
  }

  // ── Blog List Page ──
  files.push({
    file: "src/app/blog/page.tsx",
    data: `import { getBusiness, getBlogPosts } from "@/lib/data";
import Nav from "@/components/Nav";

export const revalidate = 60;

export async function generateMetadata() {
  const biz = await getBusiness();
  return {
    title: biz ? \`Blog | \${biz.name}\` : "Blog",
    description: biz ? \`Latest articles from \${biz.name}\` : "Blog",
  };
}

export default async function BlogPage() {
  const biz = await getBusiness();
  const posts = await getBlogPosts();
  if (!biz) return null;

  return (
    <>
      <Nav />
      <main style={{ maxWidth: 800, margin: "0 auto", padding: "80px 24px 60px" }}>
        <h1 style={{
          fontSize: "clamp(2rem, 5vw, 3rem)",
          fontWeight: 800, letterSpacing: "-0.03em",
          marginBottom: 12,
        }}>Blog</h1>
        <p style={{
          color: "rgba(${tb},0.5)", fontSize: 16,
          marginBottom: 48, lineHeight: 1.6,
        }}>
          Insights and updates from ${esc(config.name)}
        </p>

        {posts.length === 0 ? (
          <p style={{ color: "rgba(${tb},0.35)", fontSize: 15, textAlign: "center", padding: "60px 0" }}>
            No posts yet. Check back soon!
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
            {posts.map((post: any) => (
              <a
                key={post.id}
                href={\`/blog/\${post.slug}\`}
                style={{
                  display: "block",
                  padding: 28,
                  borderRadius: 16,
                  border: "1px solid rgba(${tb},0.06)",
                  background: "rgba(${tb},0.02)",
                  transition: "all 0.2s",
                }}
              >
                <h2 style={{
                  fontSize: 22, fontWeight: 700,
                  letterSpacing: "-0.01em", marginBottom: 8,
                }}>
                  {post.title}
                </h2>
                {post.meta_description && (
                  <p style={{
                    color: "rgba(${tb},0.5)", fontSize: 15,
                    lineHeight: 1.6, marginBottom: 12,
                  }}>
                    {post.meta_description}
                  </p>
                )}
                <div style={{
                  display: "flex", gap: 16, alignItems: "center",
                  color: "rgba(${tb},0.3)", fontSize: 13,
                }}>
                  <span>{post.word_count} words</span>
                  <span>{new Date(post.published_at || post.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                </div>
              </a>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
`,
  });

  // ── Blog Post Page ──
  files.push({
    file: "src/app/blog/[slug]/page.tsx",
    data: `import { getBusiness, getBlogPost, getBlogPosts } from "@/lib/data";
import Nav from "@/components/Nav";
import { notFound } from "next/navigation";

export const revalidate = 60;

export async function generateStaticParams() {
  const posts = await getBlogPosts();
  return posts.map((p: any) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getBlogPost(slug);
  if (!post) return { title: "Not Found" };
  return {
    title: post.title,
    description: post.meta_description || "",
    keywords: post.keywords?.join(", ") || "",
  };
}

// Simple markdown-to-HTML (handles headers, paragraphs, bold, italic, lists, links)
function renderMarkdown(md: string): string {
  return md
    .replace(/^### (.+)$/gm, '<h3 style="font-size:20px;font-weight:700;margin:32px 0 12px;letter-spacing:-0.01em">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 style="font-size:24px;font-weight:700;margin:36px 0 14px;letter-spacing:-0.02em">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 style="font-size:32px;font-weight:800;margin:40px 0 16px;letter-spacing:-0.03em">$1</h1>')
    .replace(/\\*\\*(.+?)\\*\\*/g, '<strong>$1</strong>')
    .replace(/\\*(.+?)\\*/g, '<em>$1</em>')
    .replace(/\\[(.+?)\\]\\((.+?)\\)/g, '<a href="$2" style="color:${primary};text-decoration:underline">$1</a>')
    .replace(/^- (.+)$/gm, '<li style="margin-left:20px;margin-bottom:6px;list-style:disc">$1</li>')
    .replace(/^(?!<[hlu]|<li)(\\S.*)$/gm, '<p style="margin-bottom:16px;line-height:1.8;color:rgba(${tb},0.7)">$1</p>');
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [biz, post] = await Promise.all([getBusiness(), getBlogPost(slug)]);
  if (!biz || !post) notFound();

  return (
    <>
      <Nav />
      <main style={{ maxWidth: 720, margin: "0 auto", padding: "80px 24px 60px" }}>
        <a href="/blog" style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          color: "rgba(${tb},0.4)", fontSize: 14, marginBottom: 32,
          transition: "color 0.2s",
        }}>
          &larr; Back to Blog
        </a>

        <h1 style={{
          fontSize: "clamp(1.75rem, 5vw, 2.75rem)",
          fontWeight: 800, letterSpacing: "-0.03em",
          marginBottom: 16, lineHeight: 1.15,
        }}>
          {post.title}
        </h1>

        <div style={{
          display: "flex", gap: 16, alignItems: "center",
          color: "rgba(${tb},0.35)", fontSize: 14,
          marginBottom: 48, paddingBottom: 32,
          borderBottom: "1px solid rgba(${tb},0.06)",
        }}>
          <span>{post.word_count} words</span>
          <span>&middot;</span>
          <span>{Math.ceil(post.word_count / 200)} min read</span>
          <span>&middot;</span>
          <span>{new Date(post.published_at || post.created_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</span>
        </div>

        <article
          style={{ fontSize: 17, lineHeight: 1.8 }}
          dangerouslySetInnerHTML={{ __html: renderMarkdown(post.content) }}
        />

        {post.keywords && post.keywords.length > 0 && (
          <div style={{
            marginTop: 48, paddingTop: 24,
            borderTop: "1px solid rgba(${tb},0.06)",
            display: "flex", gap: 8, flexWrap: "wrap",
          }}>
            {post.keywords.map((kw: string) => (
              <span key={kw} style={{
                padding: "4px 12px", borderRadius: 20,
                background: "rgba(${tb},0.05)", fontSize: 12,
                color: "rgba(${tb},0.4)",
              }}>
                {kw}
              </span>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
`,
  });

  return files;
}

function isLightColor(hex: string): boolean {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.5;
}

function esc(str: string): string {
  return str
    .replace(/\\/g, "\\\\")
    .replace(/"/g, '\\"')
    .replace(/'/g, "\\'")
    .replace(/`/g, "\\`")
    .replace(/\$/g, "\\$")
    .replace(/\n/g, "\\n");
}
