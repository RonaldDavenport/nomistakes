// Generates deployable Next.js app files for a business site
// These files are sent to Vercel's deployment API

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

  const primary = config.brand.colors?.primary || "#4c6ef5";
  const accent = config.brand.colors?.accent || "#9775fa";
  const bg = config.brand.colors?.background || "#0a0a0f";
  const textColor = config.brand.colors?.text || "#e4e4e7";
  const headingFont = config.brand.fonts?.heading || "Inter";
  const bodyFont = config.brand.fonts?.body || "Inter";

  // ── package.json ──
  files.push({
    file: "package.json",
    data: JSON.stringify({
      name: `nm-${config.slug}`,
      version: "1.0.0",
      private: true,
      scripts: {
        dev: "next dev",
        build: "next build",
        start: "next start",
      },
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
        target: "es5",
        lib: ["dom", "dom.iterable", "esnext"],
        allowJs: true,
        skipLibCheck: true,
        strict: false,
        forceConsistentCasingInFileNames: true,
        noEmit: true,
        esModuleInterop: true,
        module: "esnext",
        moduleResolution: "bundler",
        resolveJsonModule: true,
        isolatedModules: true,
        jsx: "preserve",
        incremental: true,
        paths: { "@/*": ["./src/*"] },
      },
      include: ["next-env.d.ts", "**/*.ts", "**/*.tsx"],
      exclude: ["node_modules"],
    }, null, 2),
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
  font-family: "${bodyFont}", system-ui, sans-serif;
  -webkit-font-smoothing: antialiased;
}
a { text-decoration: none; color: inherit; }
h1, h2, h3, h4, h5, h6 { font-family: "${headingFont}", system-ui, sans-serif; }
.cta-btn {
  display: inline-block;
  background: linear-gradient(135deg, ${primary}, ${accent});
  color: #fff;
  padding: 16px 40px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 700;
  border: none;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}
.cta-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 30px ${primary}44; }
.section { padding: 60px 20px; border-top: 1px solid rgba(255,255,255,0.05); }
.section-inner { max-width: 1000px; margin: 0 auto; }
.grid { display: grid; grid-template-columns: 1fr; gap: 16px; }
.card {
  padding: 24px; border-radius: 12px;
  border: 1px solid rgba(255,255,255,0.05);
  background: rgba(255,255,255,0.02);
  transition: border-color 0.2s;
}
.card:hover { border-color: ${primary}33; }

@media (min-width: 640px) {
  .section { padding: 80px 24px; }
  .grid { grid-template-columns: repeat(2, 1fr); gap: 20px; }
}
@media (min-width: 960px) {
  .grid { grid-template-columns: repeat(3, 1fr); }
}
`,
  });

  // ── Layout ──
  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/about", label: "About" },
    { href: config.type === "services" ? "/services" : "/products", label: config.type === "services" ? "Services" : "Products" },
    { href: "/contact", label: "Contact" },
  ];

  files.push({
    file: "src/app/layout.tsx",
    data: `import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "${config.siteContent.seo?.title || config.name}",
  description: "${config.siteContent.seo?.description || config.tagline}",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=${encodeURIComponent(headingFont)}:wght@400;600;700;800&family=${encodeURIComponent(bodyFont)}:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <nav style={{
          borderBottom: "1px solid rgba(255,255,255,0.05)",
          padding: "0 20px",
          position: "sticky",
          top: 0,
          background: "${bg}ee",
          backdropFilter: "blur(16px)",
          zIndex: 50
        }}>
          <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", height: 64 }}>
            <a href="/" style={{ fontSize: 20, fontWeight: 800 }}>${config.name}</a>
            <div style={{ display: "flex", gap: 32, alignItems: "center" }}>
              ${navLinks.map(l => `<a href="${l.href}" style={{ fontSize: 14, color: "rgba(255,255,255,0.5)" }}>${l.label}</a>`).join("\n              ")}
            </div>
          </div>
        </nav>
        {children}
        <footer style={{ borderTop: "1px solid rgba(255,255,255,0.05)", padding: "40px 20px", textAlign: "center" }}>
          <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 12 }}>
            &copy; 2026 ${config.name}. All rights reserved.
          </p>
        </footer>
      </body>
    </html>
  );
}
`,
  });

  // ── Home Page ──
  const hero = config.siteContent.hero || {};
  const cta = config.siteContent.cta || {};
  const features = config.siteContent.features || [];
  const testimonials = config.siteContent.testimonials || [];

  files.push({
    file: "src/app/page.tsx",
    data: `export default function Home() {
  return (
    <>
      <section style={{ padding: "80px 20px 60px", textAlign: "center", position: "relative" }}>
        <div style={{ maxWidth: 700, margin: "0 auto" }}>
          <h1 style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)", fontWeight: 800, lineHeight: 1.1, marginBottom: 16 }}>
            ${escapeJsx(hero.headline || config.name)}
          </h1>
          <p style={{ fontSize: "clamp(1rem, 2.5vw, 1.125rem)", color: "rgba(255,255,255,0.6)", lineHeight: 1.6, marginBottom: 32 }}>
            ${escapeJsx(hero.subheadline || config.tagline)}
          </p>
          <a href="/${config.type === "services" ? "services" : "products"}" className="cta-btn">
            ${escapeJsx(cta.button_text || "Get Started")}
          </a>
        </div>
      </section>
      ${features.length > 0 ? `
      <section className="section">
        <div className="section-inner">
          <h2 style={{ fontSize: "clamp(1.5rem, 3vw, 2rem)", fontWeight: 700, textAlign: "center", marginBottom: 40 }}>
            Why Choose ${escapeJsx(config.name)}
          </h2>
          <div className="grid">
            ${features.map(f => `<div className="card">
              <h3 style={{ fontWeight: 600, marginBottom: 8 }}>${escapeJsx(f.title)}</h3>
              <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 14, lineHeight: 1.6 }}>${escapeJsx(f.desc)}</p>
            </div>`).join("\n            ")}
          </div>
        </div>
      </section>` : ""}
      ${testimonials.length > 0 ? `
      <section className="section">
        <div className="section-inner">
          <h2 style={{ fontSize: "clamp(1.5rem, 3vw, 2rem)", fontWeight: 700, textAlign: "center", marginBottom: 40 }}>
            What People Say
          </h2>
          <div className="grid">
            ${testimonials.map(t => `<div className="card">
              <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 14, lineHeight: 1.6, marginBottom: 16, fontStyle: "italic" }}>
                &ldquo;${escapeJsx(t.text)}&rdquo;
              </p>
              <p style={{ fontWeight: 600, fontSize: 14 }}>${escapeJsx(t.name)}</p>
              <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 12 }}>${escapeJsx(t.role)}</p>
            </div>`).join("\n            ")}
          </div>
        </div>
      </section>` : ""}
    </>
  );
}
`,
  });

  // ── About Page ──
  const about = config.siteContent.about || {};
  files.push({
    file: "src/app/about/page.tsx",
    data: `export default function About() {
  return (
    <>
      <section style={{ padding: "80px 20px 40px", textAlign: "center" }}>
        <h1 style={{ fontSize: "clamp(1.75rem, 4.5vw, 3rem)", fontWeight: 800, lineHeight: 1.1, marginBottom: 16 }}>
          ${escapeJsx(about.title || `About ${config.name}`)}
        </h1>
        <p style={{ color: "rgba(255,255,255,0.5)", maxWidth: 600, margin: "0 auto" }}>
          ${escapeJsx(config.tagline)}
        </p>
      </section>
      <section className="section">
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <p style={{ color: "rgba(255,255,255,0.6)", lineHeight: 1.8, whiteSpace: "pre-wrap" }}>
            ${escapeJsx(about.text || "")}
          </p>
          ${about.mission ? `
          <div style={{ marginTop: 48, textAlign: "center" }}>
            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 16 }}>Our Mission</h2>
            <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 18, lineHeight: 1.6 }}>
              ${escapeJsx(about.mission)}
            </p>
          </div>` : ""}
        </div>
      </section>
    </>
  );
}
`,
  });

  // ── Products/Services Page ──
  const products = config.siteContent.products || [];
  const productsPath = config.type === "services" ? "services" : "products";
  files.push({
    file: `src/app/${productsPath}/page.tsx`,
    data: `export default function Products() {
  return (
    <>
      <section style={{ padding: "80px 20px 40px", textAlign: "center" }}>
        <h1 style={{ fontSize: "clamp(1.75rem, 4.5vw, 3rem)", fontWeight: 800, lineHeight: 1.1, marginBottom: 16 }}>
          ${config.type === "services" ? "Our Services" : "Our Products"}
        </h1>
      </section>
      <section className="section">
        <div className="section-inner">
          <div className="grid">
            ${products.map(p => `<div className="card" style={{ borderColor: "${primary}33", background: "${primary}08" }}>
              <h3 style={{ fontWeight: 700, marginBottom: 4 }}>${escapeJsx(p.name)}</h3>
              <p style={{ color: "${primary}", fontWeight: 700, fontSize: 18, marginBottom: 12 }}>${escapeJsx(p.price)}</p>
              <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 14, lineHeight: 1.6, marginBottom: 16 }}>${escapeJsx(p.desc)}</p>
              ${p.features ? `<ul style={{ listStyle: "none", padding: 0 }}>
                ${p.features.map(feat => `<li style={{ padding: "4px 0", fontSize: 13, color: "rgba(255,255,255,0.5)" }}>✓ ${escapeJsx(feat)}</li>`).join("\n                ")}
              </ul>` : ""}
              <button className="cta-btn" style={{ width: "100%", marginTop: 16, padding: "12px", fontSize: 14 }}>
                ${config.type === "services" ? "Book Now" : "Buy Now"}
              </button>
            </div>`).join("\n            ")}
          </div>
        </div>
      </section>
    </>
  );
}
`,
  });

  // ── Contact Page ──
  const contact = config.siteContent.contact || {};
  files.push({
    file: "src/app/contact/page.tsx",
    data: `export default function Contact() {
  return (
    <>
      <section style={{ padding: "80px 20px 40px", textAlign: "center" }}>
        <h1 style={{ fontSize: "clamp(1.75rem, 4.5vw, 3rem)", fontWeight: 800, lineHeight: 1.1, marginBottom: 16 }}>
          Get in Touch
        </h1>
        <p style={{ color: "rgba(255,255,255,0.5)", maxWidth: 500, margin: "0 auto" }}>
          We&apos;d love to hear from you. Send us a message and we&apos;ll respond as soon as possible.
        </p>
      </section>
      <section className="section">
        <div style={{ maxWidth: 600, margin: "0 auto" }}>
          <form style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <input type="text" placeholder="Your name" style={{ width: "100%", padding: "12px 16px", borderRadius: 10, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", color: "inherit", fontSize: 14 }} />
            <input type="email" placeholder="Email" style={{ width: "100%", padding: "12px 16px", borderRadius: 10, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", color: "inherit", fontSize: 14 }} />
            <textarea rows={6} placeholder="Your message" style={{ width: "100%", padding: "12px 16px", borderRadius: 10, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", color: "inherit", fontSize: 14, resize: "vertical", fontFamily: "inherit" }} />
            <button type="submit" className="cta-btn" style={{ width: "100%" }}>Send Message</button>
          </form>
          ${contact.email || contact.phone ? `
          <div style={{ marginTop: 40, display: "flex", flexDirection: "column", gap: 12 }}>
            ${contact.email ? `<p style={{ color: "rgba(255,255,255,0.5)", fontSize: 14 }}>Email: ${escapeJsx(contact.email)}</p>` : ""}
            ${contact.phone ? `<p style={{ color: "rgba(255,255,255,0.5)", fontSize: 14 }}>Phone: ${escapeJsx(contact.phone)}</p>` : ""}
            ${contact.hours ? `<p style={{ color: "rgba(255,255,255,0.5)", fontSize: 14 }}>Hours: ${escapeJsx(contact.hours)}</p>` : ""}
          </div>` : ""}
        </div>
      </section>
    </>
  );
}
`,
  });

  return files;
}

function escapeJsx(str: string): string {
  return str
    .replace(/\\/g, "\\\\")
    .replace(/"/g, '\\"')
    .replace(/'/g, "\\'")
    .replace(/`/g, "\\`")
    .replace(/\$/g, "\\$")
    .replace(/\n/g, "\\n");
}
