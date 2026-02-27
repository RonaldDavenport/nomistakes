// Generates deployable Next.js app files for a business site
// All content is fetched dynamically from Supabase — no hardcoded text

interface SiteBrand {
  colors?: { primary?: string; secondary?: string; accent?: string; background?: string; text?: string };
  fonts?: { heading?: string; body?: string };
  tone?: string;
  values?: string[];
}

interface SiteContent {
  hero?: { headline?: string; subheadline?: string };
  about?: { title?: string; text?: string; mission?: string };
  features?: { title: string; desc: string }[];
  products?: { name: string; desc: string; price: string; features?: string[] }[];
  testimonials?: { name: string; role: string; text: string; rating?: number }[];
  process?: { title?: string; steps?: { step: string; title: string; desc: string }[] };
  stats?: { value: string; label: string }[];
  cta?: { headline?: string; subheadline?: string; button_text?: string };
  seo?: { title?: string; description?: string };
  contact?: { email?: string; phone?: string; address?: string; hours?: string };
  faq?: { question: string; answer: string }[];
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
}

export function generateSiteFiles(config: BusinessConfig): { file: string; data: string }[] {
  const files: { file: string; data: string }[] = [];

  const primary = config.brand.colors?.primary || "#6366f1";
  const accent = config.brand.colors?.accent || "#a78bfa";
  const bg = config.brand.colors?.background || "#09090b";
  const textColor = config.brand.colors?.text || "#fafafa";
  const headingFont = config.brand.fonts?.heading || "Inter";
  const bodyFont = config.brand.fonts?.body || "Inter";
  const isServices = config.type === "services";

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
  color: #fff;
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
  border: 1px solid rgba(255,255,255,0.12);
  cursor: pointer;
  transition: all 0.2s ease-out;
}
.btn-secondary:hover {
  background: rgba(255,255,255,0.05);
  border-color: rgba(255,255,255,0.2);
}

/* Layout */
.container { max-width: 1100px; margin: 0 auto; padding: 0 24px; width: 100%; }
.section { padding: 80px 24px; }

/* Cards */
.card {
  padding: 32px 28px;
  border-radius: 16px;
  border: 1px solid rgba(255,255,255,0.06);
  background: rgba(255,255,255,0.02);
  transition: all 0.3s ease-out;
}
.card:hover {
  border-color: ${primary}33;
  background: rgba(255,255,255,0.04);
  transform: translateY(-2px);
  box-shadow: 0 8px 32px rgba(0,0,0,0.3);
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
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.08);
  color: inherit; font-size: 15px; font-family: inherit;
  transition: border-color 0.2s;
  outline: none;
}
.input:focus { border-color: ${primary}66; }
.input::placeholder { color: rgba(255,255,255,0.25); }

@media (min-width: 640px) {
  .grid-2 { grid-template-columns: repeat(2, 1fr); }
}
@media (min-width: 768px) {
  .grid-3 { grid-template-columns: repeat(3, 1fr); }
  .section { padding: 100px 24px; }
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
    { href: "/contact", label: "Contact" },
  ];

  files.push({
    file: "src/app/layout.tsx",
    data: `import "./globals.css";
import type { Metadata } from "next";

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
        <nav style={{
          borderBottom: "1px solid rgba(255,255,255,0.06)",
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
            <div style={{ display: "flex", gap: 28, alignItems: "center" }}>
              ${navLinks.map(l => `<a href="${l.href}" style={{ fontSize: 14, fontWeight: 500, color: "rgba(255,255,255,0.5)", transition: "color 0.2s" }}>${l.label}</a>`).join("\n              ")}
              <a href="/contact" className="cta-btn" style={{ padding: "8px 20px", fontSize: 13 }}>
                ${isServices ? "Book a Call" : "Get Started"}
              </a>
            </div>
          </div>
        </nav>
        {children}
        <footer style={{
          borderTop: "1px solid rgba(255,255,255,0.06)",
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
              ${navLinks.map(l => `<a href="${l.href}" style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", transition: "color 0.2s" }}>${l.label}</a>`).join("\n              ")}
            </div>
            <p style={{ color: "rgba(255,255,255,0.2)", fontSize: 12, marginTop: 8 }}>
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
  if (!biz) return <div style={{ padding: 80, textAlign: "center", color: "rgba(255,255,255,0.4)" }}>Loading...</div>;

  const hero = biz.site_content?.hero || {};
  const features = biz.site_content?.features || [];
  const testimonials = biz.site_content?.testimonials || [];
  const process = biz.site_content?.process || {};
  const stats = biz.site_content?.stats || [];
  const faq = biz.site_content?.faq || [];
  const cta = biz.site_content?.cta || {};
  const isServices = biz.type === "services";

  return (
    <>
      {/* ── Hero ── */}
      <section style={{
        minHeight: "85vh",
        display: "flex", alignItems: "center", justifyContent: "center",
        textAlign: "center", padding: "80px 24px 60px",
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
          <p style={{
            fontSize: 13, fontWeight: 600, letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "${primary}", marginBottom: 20,
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          }}>
            <span className="glow-dot" />
            {biz.type === "services" ? "Professional Services" : "Digital Products"}
          </p>
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
            color: "rgba(255,255,255,0.55)",
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
      </section>

      {/* ── Stats Bar ── */}
      {stats.length > 0 && (
        <section style={{
          borderTop: "1px solid rgba(255,255,255,0.05)",
          borderBottom: "1px solid rgba(255,255,255,0.05)",
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
                <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, fontWeight: 500 }}>{s.label}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Features / Why Us ── */}
      {features.length > 0 && (
        <section className="section" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
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
                  <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 14, lineHeight: 1.7 }}>{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Testimonials ── */}
      {testimonials.length > 0 && (
        <section className="section" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
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
                  <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 14, lineHeight: 1.7, flex: 1, marginBottom: 20 }}>
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
                      <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 12 }}>{t.role}</p>
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
        <section className="section" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
          <div className="container">
            <div style={{ textAlign: "center", marginBottom: 56 }}>
              <p style={{ fontSize: 13, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "${primary}", marginBottom: 12 }}>
                How It Works
              </p>
              <h2 style={{ fontSize: "clamp(1.75rem, 4vw, 2.75rem)", fontWeight: 700, letterSpacing: "-0.02em" }}>
                {process.title || "Simple. Effective. Done."}
              </h2>
            </div>
            <div className="grid-3">
              {process.steps.map((s: any, i: number) => (
                <div key={i} style={{ textAlign: "center", padding: "32px 24px" }}>
                  <div style={{
                    width: 56, height: 56, borderRadius: 16,
                    background: "${primary}12", border: "1px solid ${primary}22",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    margin: "0 auto 20px",
                    fontSize: 22, fontWeight: 800, color: "${primary}",
                  }}>
                    {s.step}
                  </div>
                  <h3 style={{ fontWeight: 700, fontSize: 18, marginBottom: 10 }}>{s.title}</h3>
                  <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 14, lineHeight: 1.7 }}>{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── FAQ ── */}
      {faq.length > 0 && (
        <section className="section" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
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
                  border: "1px solid rgba(255,255,255,0.06)",
                  background: "rgba(255,255,255,0.02)",
                }}>
                  <h3 style={{ fontWeight: 600, fontSize: 16, marginBottom: 10 }}>{f.question}</h3>
                  <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 14, lineHeight: 1.7 }}>{f.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── CTA Section ── */}
      <section style={{
        padding: "80px 24px",
        borderTop: "1px solid rgba(255,255,255,0.05)",
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
            color: "rgba(255,255,255,0.5)", fontSize: 16, lineHeight: 1.7, marginBottom: 32,
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
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 16, lineHeight: 1.7 }}>
            {biz.tagline}
          </p>
        </div>
      </section>

      <section className="section">
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          {about.text && (
            <p style={{
              color: "rgba(255,255,255,0.65)", fontSize: 17, lineHeight: 1.85,
              whiteSpace: "pre-wrap",
            }}>
              {about.text}
            </p>
          )}

          {about.mission && (
            <div style={{
              marginTop: 56, padding: "36px 32px", borderRadius: 16,
              border: "1px solid rgba(255,255,255,0.06)",
              background: "rgba(255,255,255,0.02)",
              textAlign: "center",
            }}>
              <p style={{ fontSize: 13, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "${primary}", marginBottom: 12 }}>
                Our Mission
              </p>
              <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 18, lineHeight: 1.6, fontWeight: 500 }}>
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
                    border: "1px solid rgba(255,255,255,0.06)",
                    background: "rgba(255,255,255,0.02)",
                    display: "flex", alignItems: "center", gap: 12,
                  }}>
                    <span className="glow-dot" />
                    <span style={{ color: "rgba(255,255,255,0.7)", fontSize: 15 }}>{v}</span>
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
  files.push({
    file: `src/app/${productsPath}/page.tsx`,
    data: `import { getBusiness } from "@/lib/data";

export const revalidate = 60;

export default async function ProductsPage() {
  const biz = await getBusiness();
  if (!biz) return null;

  const products = biz.site_content?.products || [];
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
        <div style={{ position: "relative" }}>
          <p style={{ fontSize: 13, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "${primary}", marginBottom: 16 }}>
            {isServices ? "What We Offer" : "Our Products"}
          </p>
          <h1 style={{
            fontSize: "clamp(2rem, 5vw, 3.25rem)",
            fontWeight: 800, letterSpacing: "-0.02em", lineHeight: 1.1,
          }}>
            {isServices ? "Services & Pricing" : "Our Products"}
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
                <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 14, lineHeight: 1.7, marginBottom: 20, flex: 1 }}>
                  {p.desc}
                </p>
                {p.features && p.features.length > 0 && (
                  <ul style={{ listStyle: "none", padding: 0, marginBottom: 24 }}>
                    {p.features.map((feat: string, fi: number) => (
                      <li key={fi} style={{
                        padding: "6px 0", fontSize: 13,
                        color: "rgba(255,255,255,0.55)",
                        display: "flex", alignItems: "center", gap: 8,
                      }}>
                        <span style={{ color: "${primary}", fontSize: 14 }}>\\u2713</span>
                        {feat}
                      </li>
                    ))}
                  </ul>
                )}
                <a href="/contact" className="cta-btn" style={{ width: "100%", padding: "12px", fontSize: 14 }}>
                  {isServices ? "Get Started" : "Buy Now"}
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
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 16, lineHeight: 1.7 }}>
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
                margin: "24px 0", color: "rgba(255,255,255,0.2)", fontSize: 13,
              }}>
                <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.08)" }} />
                or send a message
                <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.08)" }} />
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
              border: "1px solid rgba(255,255,255,0.06)",
              background: "rgba(255,255,255,0.02)",
              display: "flex", flexDirection: "column", gap: 10,
            }}>
              {contact.email && (
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ color: "${primary}", fontSize: 16 }}>\\u2709</span>
                  <span style={{ color: "rgba(255,255,255,0.6)", fontSize: 14 }}>{contact.email}</span>
                </div>
              )}
              {contact.phone && (
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ color: "${primary}", fontSize: 16 }}>\\u260E</span>
                  <span style={{ color: "rgba(255,255,255,0.6)", fontSize: 14 }}>{contact.phone}</span>
                </div>
              )}
              {contact.hours && (
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ color: "${primary}", fontSize: 16 }}>\\u{1F552}</span>
                  <span style={{ color: "rgba(255,255,255,0.6)", fontSize: 14 }}>{contact.hours}</span>
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

  return files;
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
