import { createServerClient } from "@/lib/supabase";
import { getTheme, resolveVars, buildHero, ThemeVars, SiteTheme } from "@/lib/site-themes";

// ─── Types ───────────────────────────────────────────────────────────
interface SiteData {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  type: string;
  brand: {
    colors?: { primary?: string; secondary?: string; accent?: string; background?: string; text?: string };
    fonts?: { heading?: string; body?: string };
    values?: string[];
  };
  site_content: {
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
  };
  layout?: string;
  calendly_url?: string;
  video_url?: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────
function isLightColor(hex: string): boolean {
  const c = hex.replace("#", "");
  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 140;
}

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// ─── Compute base theme variables ────────────────────────────────────
function computeTheme(site: SiteData) {
  const primary = site.brand?.colors?.primary || "#6366f1";
  const accent = site.brand?.colors?.accent || "#a78bfa";
  const bg = site.brand?.colors?.background || "#09090b";
  const headingFont = site.brand?.fonts?.heading || "Inter";
  const bodyFont = site.brand?.fonts?.body || "Inter";
  const isServices = site.type === "services";
  const isLight = isLightColor(bg);
  const textColor = isLight ? "#111111" : "#fafafa";
  const tb = isLight ? "0,0,0" : "255,255,255";
  const shadowAlpha = isLight ? "0.08" : "0.3";
  const ctaText = isLightColor(primary) ? "#111" : "#fff";

  return { primary, accent, bg, headingFont, bodyFont, isServices, isLight, textColor, tb, shadowAlpha, ctaText };
}

// ─── Convert to ThemeVars ─────────────────────────────────────────────
function toThemeVars(site: SiteData): ThemeVars {
  const c = computeTheme(site);
  return {
    primary: c.primary,
    accent: c.accent,
    bg: c.bg,
    textColor: c.textColor,
    tb: c.tb,
    ctaText: c.ctaText,
    shadowAlpha: c.shadowAlpha,
    isLight: c.isLight,
    headingFont: c.headingFont,
    isServices: c.isServices,
  };
}

// ─── CSS (base styles + theme overrides appended) ────────────────────
function buildCSS(v: ThemeVars, bodyFont: string, extraCSS = ""): string {
  const { primary, accent, bg, headingFont, textColor, tb, shadowAlpha, ctaText } = v;

  return `
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

/* ── Entrance animations ────────────────────────────────────────────── */
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(28px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes fadeIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}
.hero-animate     { animation: fadeUp 0.7s cubic-bezier(0.22, 1, 0.36, 1) both; }
.hero-animate-sub { animation: fadeUp 0.7s cubic-bezier(0.22, 1, 0.36, 1) 0.12s both; }
.hero-animate-cta { animation: fadeUp 0.6s cubic-bezier(0.22, 1, 0.36, 1) 0.24s both; }
.hero-animate-img { animation: fadeUp 0.8s cubic-bezier(0.22, 1, 0.36, 1) 0.18s both; }

/* ── Scroll reveal ──────────────────────────────────────────────────── */
.reveal {
  opacity: 0;
  transform: translateY(24px);
  transition: opacity 0.55s cubic-bezier(0.22, 1, 0.36, 1), transform 0.55s cubic-bezier(0.22, 1, 0.36, 1);
}
.reveal.visible { opacity: 1; transform: translateY(0); }
.reveal-d1 { transition-delay: 0.08s; }
.reveal-d2 { transition-delay: 0.16s; }
.reveal-d3 { transition-delay: 0.24s; }
.reveal-d4 { transition-delay: 0.32s; }
.reveal-d5 { transition-delay: 0.40s; }
${extraCSS}`;
}

// ─── Nav Builder ─────────────────────────────────────────────────────
function buildNav(site: SiteData, v: ThemeVars): string {
  const { primary, bg, tb, ctaText, isServices } = v;

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/about", label: "About" },
    { href: isServices ? "/services" : "/products", label: isServices ? "Services" : "Products" },
    { href: "/blog", label: "Blog" },
    { href: "/contact", label: "Contact" },
  ];
  const ctaLabel = isServices ? "Book a Call" : "Get Started";

  const desktopLinks = navLinks
    .map(
      (l) =>
        `<a href="${l.href}" style="font-size:14px;font-weight:500;color:rgba(${tb},0.5);transition:color 0.2s">${esc(l.label)}</a>`
    )
    .join("\n            ");

  return `
    <nav style="border-bottom:1px solid rgba(${tb},0.06);padding:0 24px;position:sticky;top:0;background:${bg}dd;backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);z-index:50">
      <div style="max-width:1100px;margin:0 auto;display:flex;justify-content:space-between;align-items:center;height:64px">
        <a href="/" style="font-size:18px;font-weight:700;letter-spacing:-0.02em;display:flex;align-items:center;gap:8px">
          <span class="gradient-text">${esc(site.name)}</span>
        </a>

        <!-- Desktop nav -->
        <div class="desktop-nav" style="display:flex;gap:28px;align-items:center">
          ${desktopLinks}
          <a href="/contact" class="cta-btn" style="padding:8px 20px;font-size:13px">
            ${esc(ctaLabel)}
          </a>
        </div>

        <!-- Mobile hamburger -->
        <button class="mobile-menu-btn" aria-label="Menu" style="display:none;background:none;border:none;color:rgba(${tb},0.7);font-size:24px;cursor:pointer;padding:8px;line-height:1">
          &#9776;
        </button>
      </div>
    </nav>
  `;
}

// ─── Footer Builder ───────────────────────────────────────────────────
function buildFooter(site: SiteData, v: ThemeVars): string {
  const { tb, isServices } = v;

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/about", label: "About" },
    { href: isServices ? "/services" : "/products", label: isServices ? "Services" : "Products" },
    { href: "/blog", label: "Blog" },
    { href: "/contact", label: "Contact" },
  ];

  const footerLinks = navLinks
    .map(
      (l) =>
        `<a href="${l.href}" style="font-size:13px;color:rgba(${tb},0.35);transition:color 0.2s">${esc(l.label)}</a>`
    )
    .join("\n              ");

  return `
    <footer style="border-top:1px solid rgba(${tb},0.06);padding:48px 24px">
      <div style="max-width:1100px;margin:0 auto;display:flex;flex-direction:column;align-items:center;gap:16px">
        <span class="gradient-text" style="font-size:16px;font-weight:700">
          ${esc(site.name)}
        </span>
        <div style="display:flex;gap:24px">
          ${footerLinks}
        </div>
        <p style="color:rgba(${tb},0.2);font-size:12px;margin-top:8px">
          &copy; 2026 ${esc(site.name)}. All rights reserved.
        </p>
      </div>
    </footer>
  `;
}

// ─── Page Content Builder ─────────────────────────────────────────────
function buildPageContent(site: SiteData, theme: SiteTheme, v: ThemeVars): string {
  const { primary, accent, tb, shadowAlpha, ctaText, isServices } = v;

  const hero = site.site_content?.hero || {};
  const features = site.site_content?.features || [];
  const testimonials = site.site_content?.testimonials || [];
  const processData = site.site_content?.process || {} as { title?: string; steps?: { step: string; title: string; desc: string }[] };
  const stats = site.site_content?.stats || [];
  const faq = site.site_content?.faq || [];
  const cta = site.site_content?.cta || {};
  const socialProof = site.site_content?.social_proof || {};
  const products = site.site_content?.products || [];
  const images = site.site_content?.images || {};

  // ── Hero ──────────────────────────────────────────────────────────────────
  const heroImageHtml = images.hero
    ? `<div style="border-radius:16px;overflow:hidden;border:1px solid rgba(${tb},0.1);box-shadow:0 24px 80px rgba(0,0,0,${shadowAlpha}),0 0 120px ${primary}08">
            <img src="${esc(images.hero)}" alt="${esc(site.name)}" style="width:100%;height:auto;display:block" />
          </div>`
    : `<div style="height:340px;border-radius:16px;overflow:hidden;border:1px solid rgba(${tb},0.1);background:linear-gradient(135deg,${primary}18,${accent}12,rgba(${tb},0.03));box-shadow:0 24px 80px rgba(0,0,0,${shadowAlpha}),0 0 120px ${primary}08;display:flex;align-items:center;justify-content:center">
            <div style="font-size:clamp(3rem,8vw,6rem);font-weight:800;background:linear-gradient(135deg,${primary}44,${accent}33);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text">
              ${esc(site.name.charAt(0))}
            </div>
          </div>`;

  const heroSection = buildHero(
    theme.heroVariant,
    theme.heroFontSize,
    {
      headline: esc(hero.headline || site.name),
      subheadline: esc(hero.subheadline || site.tagline),
      badge: hero.badge ? esc(hero.badge) : "",
      ctaLabel: esc(cta.button_text || (isServices ? "Book a Strategy Call" : "View Products")),
      ctaHref: isServices ? "/contact" : "/products",
      imageHtml: heroImageHtml,
    },
    v
  );

  // ── Social Proof ──────────────────────────────────────────────────────────
  let socialProofSection = "";
  if ((socialProof as any).logos?.length > 0) {
    const logoSpans = (socialProof as any).logos
      .map(
        (name: string) =>
          `<span style="font-size:16px;font-weight:700;letter-spacing:-0.02em;color:rgba(${tb},0.2)">${esc(name)}</span>`
      )
      .join("\n                ");

    socialProofSection = `
      <section style="padding:40px 24px;border-top:1px solid rgba(${tb},0.05)">
        <div class="container" style="text-align:center">
          <p style="font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.1em;color:rgba(${tb},0.3);margin-bottom:24px">
            Trusted by leading companies
          </p>
          <div style="display:flex;justify-content:center;align-items:center;flex-wrap:wrap;gap:24px 48px">
            ${logoSpans}
          </div>
        </div>
      </section>`;
  }

  // ── Stats Bar ─────────────────────────────────────────────────────────────
  let statsSection = "";
  if (stats.length > 0) {
    const statItems = stats
      .map(
        (s: { value: string; label: string }) => `
              <div style="text-align:center">
                <p class="gradient-text" style="font-size:36px;font-weight:800;line-height:1;margin-bottom:4px">
                  ${esc(s.value)}
                </p>
                <p style="color:rgba(${tb},0.4);font-size:13px;font-weight:500">${esc(s.label)}</p>
              </div>`
      )
      .join("");

    statsSection = `
      <section style="border-top:1px solid rgba(${tb},0.05);border-bottom:1px solid rgba(${tb},0.05);padding:40px 24px">
        <div class="container" style="display:flex;justify-content:center;flex-wrap:wrap;gap:40px 64px">
          ${statItems}
        </div>
      </section>`;
  }

  // ── Features ──────────────────────────────────────────────────────────────
  let featuresSection = "";
  if (features.length > 0) {
    const featureEmojis = ["\u2728", "\u26A1", "\uD83D\uDE80", "\uD83C\uDFAF", "\uD83D\uDCA1", "\uD83D\uDD0D"];
    const featureCards = features
      .map(
        (f: { title: string; desc: string }, i: number) => `
              <div class="card reveal reveal-d${Math.min(i + 1, 5)}">
                <div style="width:40px;height:40px;border-radius:10px;background:${primary}12;display:flex;align-items:center;justify-content:center;margin-bottom:16px;font-size:18px">
                  ${featureEmojis[i % 6]}
                </div>
                <h3 style="font-weight:600;font-size:17px;margin-bottom:8px">${esc(f.title)}</h3>
                <p style="color:rgba(${tb},0.5);font-size:14px;line-height:1.7">${esc(f.desc)}</p>
              </div>`
      )
      .join("");

    featuresSection = `
      <section class="section" style="border-top:1px solid rgba(${tb},0.05)">
        <div class="container">
          <div class="reveal" style="text-align:center;margin-bottom:56px">
            <p style="font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;color:${primary};margin-bottom:12px">
              ${isServices ? "How we work" : "Features"}
            </p>
            <h2 style="font-size:clamp(1.75rem,4vw,2.75rem);font-weight:700;letter-spacing:-0.02em">
              ${isServices ? "What makes us different" : "Why it works"}
            </h2>
          </div>
          <div class="grid-3">
            ${featureCards}
          </div>
        </div>
      </section>`;
  }

  // ── Video ─────────────────────────────────────────────────────────────────
  let videoSection = "";
  if (!theme.noVideo) {
    const videoInner = site.video_url
      ? `<div style="position:relative;padding-bottom:56.25%;height:0;border-radius:16px;overflow:hidden;border:1px solid rgba(${tb},0.1);box-shadow:0 16px 64px rgba(0,0,0,${shadowAlpha})">
            <iframe
              src="${esc(site.video_url)}"
              style="position:absolute;top:0;left:0;width:100%;height:100%;border:none"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowfullscreen
            ></iframe>
          </div>`
      : `<div style="border-radius:16px;overflow:hidden;border:1px solid rgba(${tb},0.1);background:linear-gradient(135deg,${primary}08,${accent}06);padding:80px 32px;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;position:relative;box-shadow:0 16px 64px rgba(0,0,0,${shadowAlpha})">
            <div style="width:72px;height:72px;border-radius:50%;background:${primary};display:flex;align-items:center;justify-content:center;margin-bottom:24px;box-shadow:0 8px 32px ${primary}44;cursor:pointer">
              <div style="width:0;height:0;border-top:14px solid transparent;border-bottom:14px solid transparent;border-left:22px solid ${ctaText};margin-left:4px"></div>
            </div>
            <p style="font-size:18px;font-weight:600;margin-bottom:8px">
              ${isServices ? "See our process in action" : "Product walkthrough"}
            </p>
            <p style="color:rgba(${tb},0.4);font-size:14px">
              Video coming soon
            </p>
          </div>`;

    videoSection = `
      <section class="section" style="border-top:1px solid rgba(${tb},0.05)">
        <div class="container">
          <div class="reveal" style="text-align:center;margin-bottom:48px">
            <p style="font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;color:${primary};margin-bottom:12px">
              ${isServices ? "Results" : "In action"}
            </p>
            <h2 style="font-size:clamp(1.75rem,4vw,2.75rem);font-weight:700;letter-spacing:-0.02em">
              ${isServices ? "How we deliver" : "Watch how it works"}
            </h2>
          </div>
          <div class="reveal reveal-d1">
            ${videoInner}
          </div>
        </div>
      </section>`;
  }

  // ── Products/Services ─────────────────────────────────────────────────────
  let productsSection = "";
  if (products.length > 0) {
    const productCards = products
      .slice(0, 3)
      .map((p: any, i: number) => {
        const slug = p.slug || p.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-+$/g, "");
        const primaryHex = (15 + i * 8).toString(16).padStart(2, "0");
        const accentHex = (10 + i * 6).toString(16).padStart(2, "0");

        let imageSection: string;
        if (images.products && (images.products as string[])[i]) {
          imageSection = `<img src="${esc((images.products as string[])[i])}" alt="${esc(p.name)}" style="width:100%;height:100%;object-fit:cover;position:absolute;top:0;left:0" />`;
        } else {
          const emojis = ["\uD83C\uDFAF", "\uD83D\uDE80", "\uD83D\uDCA1"];
          imageSection = `<span style="font-size:48px;opacity:0.4">${emojis[i % 3]}</span>`;
        }

        const popularBadge =
          i === 0 && products.length > 1
            ? `<span style="position:absolute;top:12px;right:12px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;padding:4px 10px;border-radius:6px;background:${primary};color:${ctaText}">Most Popular</span>`
            : "";

        const taglineHtml =
          !isServices && p.tagline
            ? `<p style="color:rgba(${tb},0.5);font-size:13px;font-style:italic;margin-bottom:8px">${esc(p.tagline)}</p>`
            : "";

        const audienceHtml =
          !isServices && p.audience
            ? `<p style="color:rgba(${tb},0.45);font-size:12px;margin-bottom:12px">\uD83D\uDC64 ${esc(p.audience)}</p>`
            : "";

        return `
              <div style="border-radius:16px;overflow:hidden;border:1px solid rgba(${tb},0.08);transition:all 0.3s ease-out;display:flex;flex-direction:column">
                <div style="height:180px;position:relative;overflow:hidden;background:linear-gradient(135deg,${primary}${primaryHex},${accent}${accentHex});display:flex;align-items:center;justify-content:center">
                  ${imageSection}
                  ${popularBadge}
                </div>
                <div style="padding:24px 24px 28px;flex:1;display:flex;flex-direction:column">
                  <h3 style="font-weight:700;font-size:18px;margin-bottom:4px">${esc(p.name)}</h3>
                  ${taglineHtml}
                  <p class="gradient-text" style="font-weight:800;font-size:24px;margin-bottom:${isServices ? "12" : "8"}px">
                    ${esc(p.price)}
                  </p>
                  ${audienceHtml}
                  <p style="color:rgba(${tb},0.5);font-size:13px;line-height:1.7;flex:1;margin-bottom:20px">
                    ${esc(p.desc)}
                  </p>
                  <a href="${isServices ? "/contact" : "/products/" + slug}" class="cta-btn" style="width:100%;padding:12px;font-size:14px">
                    ${isServices ? "Get Started" : "Learn More \u2192"}
                  </a>
                </div>
              </div>`;
      })
      .join("");

    const viewAllBtn =
      products.length > 3
        ? `
            <div style="text-align:center;margin-top:32px">
              <a href="${isServices ? "/services" : "/products"}" class="btn-secondary" style="padding:12px 28px">
                View All ${isServices ? "Services" : "Products"} &rarr;
              </a>
            </div>`
        : "";

    productsSection = `
      <section class="section" style="border-top:1px solid rgba(${tb},0.05)">
        <div class="container">
          <div class="reveal" style="text-align:center;margin-bottom:48px">
            <p style="font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;color:${primary};margin-bottom:12px">
              ${isServices ? "Services" : "Products"}
            </p>
            <h2 style="font-size:clamp(1.75rem,4vw,2.75rem);font-weight:700;letter-spacing:-0.02em">
              ${isServices ? "Work with us" : "What we make"}
            </h2>
          </div>
          <div class="grid-3">
            ${productCards}
          </div>
          ${viewAllBtn}
        </div>
      </section>`;
  }

  // ── Testimonials ──────────────────────────────────────────────────────────
  let testimonialsSection = "";
  if (testimonials.length > 0) {
    const testimonialCards = testimonials
      .map(
        (t: any) => {
          const ratingHtml = t.rating
            ? `<div style="margin-bottom:12px;color:#facc15;font-size:14px;letter-spacing:2px">${"\u2605".repeat(t.rating)}${"\u2606".repeat(5 - t.rating)}</div>`
            : "";

          return `
              <div class="card reveal" style="display:flex;flex-direction:column">
                ${ratingHtml}
                <p style="color:rgba(${tb},0.6);font-size:14px;line-height:1.7;flex:1;margin-bottom:20px">
                  &ldquo;${esc(t.text)}&rdquo;
                </p>
                <div style="display:flex;align-items:center;gap:12px">
                  <div style="width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,${primary}44,${accent}44);display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:600">
                    ${esc(t.name?.charAt(0) || "")}
                  </div>
                  <div>
                    <p style="font-weight:600;font-size:14px">${esc(t.name)}</p>
                    <p style="color:rgba(${tb},0.4);font-size:12px">${esc(t.role)}</p>
                  </div>
                </div>
              </div>`;
        }
      )
      .join("");

    testimonialsSection = `
      <section class="section" style="border-top:1px solid rgba(${tb},0.05)">
        <div class="container">
          <div class="reveal" style="text-align:center;margin-bottom:56px">
            <p style="font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;color:${primary};margin-bottom:12px">
              Testimonials
            </p>
            <h2 style="font-size:clamp(1.75rem,4vw,2.75rem);font-weight:700;letter-spacing:-0.02em">
              ${isServices ? "What clients say" : "Real feedback"}
            </h2>
          </div>
          <div class="grid-3">
            ${testimonialCards}
          </div>
        </div>
      </section>`;
  }

  // ── Process / How It Works ────────────────────────────────────────────────
  let processSection = "";
  const processSteps = processData.steps || [];
  if (processSteps.length > 0) {
    const stepItems = processSteps
      .map(
        (s: any, i: number) => `
              <div style="display:flex;gap:24px;padding:32px 0;${i < processSteps.length - 1 ? "border-bottom:1px solid rgba(" + tb + ",0.06)" : ""}">
                <div style="width:48px;height:48px;min-width:48px;border-radius:14px;background:${primary}12;border:1px solid ${primary}22;display:flex;align-items:center;justify-content:center;font-size:20px;font-weight:800;color:${primary}">
                  ${esc(s.step)}
                </div>
                <div>
                  <h3 style="font-weight:700;font-size:18px;margin-bottom:6px">${esc(s.title)}</h3>
                  <p style="color:rgba(${tb},0.5);font-size:14px;line-height:1.7">${esc(s.desc)}</p>
                </div>
              </div>`
      )
      .join("");

    processSection = `
      <section class="section" style="border-top:1px solid rgba(${tb},0.05)">
        <div class="container">
          <div class="reveal" style="text-align:center;margin-bottom:56px">
            <p style="font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;color:${primary};margin-bottom:12px">
              How it works
            </p>
            <h2 style="font-size:clamp(1.75rem,4vw,2.75rem);font-weight:700;letter-spacing:-0.02em">
              ${esc(processData.title || "The process")}
            </h2>
          </div>
          <div style="display:flex;flex-direction:column;gap:0;max-width:700px;margin:0 auto">
            ${stepItems}
          </div>
        </div>
      </section>`;
  }

  // ── FAQ ───────────────────────────────────────────────────────────────────
  let faqSection = "";
  if (faq.length > 0) {
    const faqItems = faq
      .map(
        (f: { question: string; answer: string }) => `
              <div style="padding:24px 28px;border-radius:14px;border:1px solid rgba(${tb},0.06);background:rgba(${tb},0.02)">
                <h3 style="font-weight:600;font-size:16px;margin-bottom:10px">${esc(f.question)}</h3>
                <p style="color:rgba(${tb},0.5);font-size:14px;line-height:1.7">${esc(f.answer)}</p>
              </div>`
      )
      .join("");

    faqSection = `
      <section class="section" style="border-top:1px solid rgba(${tb},0.05)">
        <div style="max-width:700px;margin:0 auto;padding:0 24px">
          <div style="text-align:center;margin-bottom:48px">
            <p style="font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;color:${primary};margin-bottom:12px">
              FAQ
            </p>
            <h2 style="font-size:clamp(1.75rem,4vw,2.75rem);font-weight:700;letter-spacing:-0.02em">
              Common questions
            </h2>
          </div>
          <div style="display:flex;flex-direction:column;gap:16px">
            ${faqItems}
          </div>
        </div>
      </section>`;
  }

  // ── CTA ───────────────────────────────────────────────────────────────────
  const ctaSection = `
      <section style="padding:80px 24px;border-top:1px solid rgba(${tb},0.05);text-align:center;position:relative;overflow:hidden">
        <div style="position:absolute;bottom:-50%;left:50%;transform:translateX(-50%);width:90%;max-width:800px;height:400px;background:radial-gradient(ellipse,${primary}10 0%,transparent 70%);filter:blur(80px);pointer-events:none"></div>
        <div class="reveal" style="position:relative;max-width:550px;margin:0 auto">
          <h2 style="font-size:clamp(1.75rem,4vw,2.5rem);font-weight:700;letter-spacing:-0.02em;margin-bottom:16px">
            ${esc(cta.headline || (isServices ? "Let&apos;s work together." : "Start today."))}
          </h2>
          <p style="color:rgba(${tb},0.5);font-size:16px;line-height:1.7;margin-bottom:32px">
            ${esc(cta.subheadline || site.tagline)}
          </p>
          <a href="${isServices ? "/contact" : "/products"}" class="cta-btn">
            ${esc(cta.button_text || (isServices ? "Book a Strategy Call" : "Get Started"))}
            <span style="font-size:18px">&rarr;</span>
          </a>
        </div>
      </section>`;

  // ── Assemble with theme-aware ordering ────────────────────────────────────
  const parts: string[] = [heroSection, socialProofSection];
  if (theme.statsFirst) parts.push(statsSection);
  if (theme.testimonialsEarly) parts.push(testimonialsSection);
  parts.push(featuresSection);
  if (!theme.statsFirst) parts.push(statsSection);
  parts.push(videoSection);
  parts.push(productsSection);
  if (!theme.testimonialsEarly) parts.push(testimonialsSection);
  parts.push(processSection, faqSection, ctaSection);

  return parts.join("\n");
}

// ─── Calendly Section ────────────────────────────────────────────────
function buildCalendly(site: SiteData, v: ThemeVars): string {
  if (!site.calendly_url) return "";
  const { primary, bg, textColor, tb } = v;
  return `
    <section style="padding:80px 24px;text-align:center">
      <div style="max-width:700px;margin:0 auto">
        <p style="font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;color:${primary};margin-bottom:12px">
          Schedule
        </p>
        <h2 style="font-size:clamp(1.75rem,4vw,2.75rem);font-weight:700;letter-spacing:-0.02em;margin-bottom:8px">Book a Meeting</h2>
        <p style="color:rgba(${tb},0.5);margin-bottom:32px;font-size:15px">Schedule a time that works for you</p>
        <div style="border-radius:16px;overflow:hidden;border:1px solid rgba(${tb},0.06)">
          <iframe
            src="${esc(site.calendly_url)}?hide_gdpr_banner=1&amp;background_color=${bg.replace("#", "")}&amp;text_color=${textColor.replace("#", "")}&amp;primary_color=${primary.replace("#", "")}"
            style="width:100%;height:630px;border:none"
            title="Schedule a meeting"
          ></iframe>
        </div>
      </div>
    </section>`;
}

// ─── Full HTML Document ──────────────────────────────────────────────
function buildFullHTML(site: SiteData): string {
  const computed = computeTheme(site);
  const baseVars = toThemeVars(site);
  const theme = getTheme(site.slug);
  const v = resolveVars(baseVars, theme);
  const { headingFont, bodyFont } = computed;

  const fontLink = `<link href="https://fonts.googleapis.com/css2?family=${encodeURIComponent(headingFont)}:wght@400;500;600;700;800&amp;family=${encodeURIComponent(bodyFont)}:wght@400;500;600&amp;display=swap" rel="stylesheet" />`;

  const seoTitle = site.site_content?.seo?.title || site.name;
  const seoDesc = site.site_content?.seo?.description || site.tagline;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${esc(seoTitle)}</title>
  <meta name="description" content="${esc(seoDesc)}" />
  ${fontLink}
  <style>${buildCSS(v, bodyFont, theme.themeCSS(v))}</style>
</head>
<body>
  ${buildNav(site, v)}
  ${buildPageContent(site, theme, v)}
  ${buildCalendly(site, v)}
  ${buildFooter(site, v)}
  <script>
    (function() {
      var els = document.querySelectorAll('.reveal');
      if (!els.length) return;
      var io = new IntersectionObserver(function(entries) {
        entries.forEach(function(e) {
          if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); }
        });
      }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
      els.forEach(function(el) { io.observe(el); });
    })();
  </script>
</body>
</html>`;
}

// ─── GET /api/site-preview?businessId=... ────────────────────────────
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const businessId = searchParams.get("businessId");

  if (!businessId) {
    return new Response("Missing businessId query parameter", { status: 400 });
  }

  const db = createServerClient();
  const { data, error } = await db
    .from("businesses")
    .select("*")
    .eq("id", businessId)
    .single();

  if (error || !data) {
    return new Response("Business not found", { status: 404 });
  }

  const site = data as SiteData;
  const html = buildFullHTML(site);

  return new Response(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
