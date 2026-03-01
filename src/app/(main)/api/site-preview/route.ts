import { createServerClient } from "@/lib/supabase";

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

// ─── Compute theme variables (same logic as site-template.ts) ────────
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

// ─── CSS (exact copy from site-template.ts globals.css) ──────────────
function buildCSS(site: SiteData): string {
  const { primary, accent, bg, headingFont, bodyFont, textColor, tb, shadowAlpha, ctaText } = computeTheme(site);

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
`;
}

// ─── Nav Builder (matches Nav component from site-template.ts) ───────
function buildNav(site: SiteData): string {
  const { primary, bg, tb, ctaText, isServices } = computeTheme(site);

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

// ─── Footer Builder (matches layout.tsx footer from site-template.ts) ─
function buildFooter(site: SiteData): string {
  const { tb, isServices } = computeTheme(site);

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

// ─── Page Content Builder (matches page.tsx from site-template.ts) ───
function buildPageContent(site: SiteData): string {
  const { primary, accent, bg, tb, shadowAlpha, ctaText, isServices } = computeTheme(site);

  const hero = site.site_content?.hero || {};
  const features = site.site_content?.features || [];
  const testimonials = site.site_content?.testimonials || [];
  const processData = site.site_content?.process || {};
  const stats = site.site_content?.stats || [];
  const faq = site.site_content?.faq || [];
  const cta = site.site_content?.cta || {};
  const socialProof = site.site_content?.social_proof || {};
  const products = site.site_content?.products || [];
  const images = site.site_content?.images || {};

  let html = "";

  // ── Hero ──
  html += `
      <section style="min-height:90vh;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:80px 24px 40px;position:relative;overflow:hidden">
        <!-- Background glow -->
        <div style="position:absolute;top:-40%;left:50%;transform:translateX(-50%);width:80%;max-width:700px;height:500px;background:radial-gradient(ellipse,${primary}15 0%,transparent 70%);filter:blur(60px);pointer-events:none"></div>
        <div style="position:relative;max-width:720px;margin:0 auto">`;

  if (hero.badge) {
    html += `
          <div style="display:inline-flex;align-items:center;gap:8px;padding:6px 16px;border-radius:100px;border:1px solid rgba(${tb},0.1);background:rgba(${tb},0.04);font-size:13px;font-weight:500;color:rgba(${tb},0.6);margin-bottom:24px">
            <span class="glow-dot"></span>
            ${esc(hero.badge)}
          </div>`;
  } else {
    html += `
          <p style="font-size:13px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:${primary};margin-bottom:20px;display:flex;align-items:center;justify-content:center;gap:8px">
            <span class="glow-dot"></span>
            ${site.type === "services" ? "Professional Services" : "Digital Products"}
          </p>`;
  }

  html += `
          <h1 style="font-size:clamp(2.5rem,6vw,4.25rem);font-weight:800;line-height:1.08;letter-spacing:-0.03em;margin-bottom:24px">
            ${esc(hero.headline || site.name)}
          </h1>
          <p style="font-size:clamp(1rem,2.5vw,1.2rem);color:rgba(${tb},0.55);line-height:1.7;margin-bottom:40px;max-width:560px;margin:0 auto 40px">
            ${esc(hero.subheadline || site.tagline)}
          </p>
          <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap">
            <a href="${isServices ? "/contact" : "/" + (isServices ? "services" : "products")}" class="cta-btn">
              ${esc(cta.button_text || (isServices ? "Book a Strategy Call" : "View Products"))}
              <span style="font-size:18px">&rarr;</span>
            </a>
            <a href="/about" class="btn-secondary">Learn More</a>
          </div>
        </div>

        <!-- Hero Visual -->
        <div style="position:relative;max-width:900px;width:100%;margin:56px auto 0;padding:0 24px">`;

  if (images.hero) {
    html += `
          <div style="border-radius:16px;overflow:hidden;border:1px solid rgba(${tb},0.1);box-shadow:0 24px 80px rgba(0,0,0,${shadowAlpha}),0 0 120px ${primary}08">
            <img src="${esc(images.hero)}" alt="${esc(site.name)}" style="width:100%;height:auto;display:block" />
          </div>`;
  } else {
    html += `
          <div style="height:340px;border-radius:16px;overflow:hidden;border:1px solid rgba(${tb},0.1);background:linear-gradient(135deg,${primary}18,${accent}12,rgba(${tb},0.03));box-shadow:0 24px 80px rgba(0,0,0,${shadowAlpha}),0 0 120px ${primary}08;display:flex;align-items:center;justify-content:center">
            <div style="font-size:clamp(3rem,8vw,6rem);font-weight:800;background:linear-gradient(135deg,${primary}44,${accent}33);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text">
              ${esc(site.name.charAt(0))}
            </div>
          </div>`;
  }

  html += `
        </div>
      </section>`;

  // ── Social Proof / Trusted By ──
  if (socialProof.logos && socialProof.logos.length > 0) {
    const logoSpans = socialProof.logos
      .map(
        (name: string) =>
          `<span style="font-size:16px;font-weight:700;letter-spacing:-0.02em;color:rgba(${tb},0.2)">${esc(name)}</span>`
      )
      .join("\n                ");

    html += `
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

  // ── Stats Bar ──
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

    html += `
      <section style="border-top:1px solid rgba(${tb},0.05);border-bottom:1px solid rgba(${tb},0.05);padding:40px 24px">
        <div class="container" style="display:flex;justify-content:center;flex-wrap:wrap;gap:40px 64px">
          ${statItems}
        </div>
      </section>`;
  }

  // ── Features / Why Us ──
  if (features.length > 0) {
    const featureEmojis = ["\u2728", "\u26A1", "\uD83D\uDE80", "\uD83C\uDFAF", "\uD83D\uDCA1", "\uD83D\uDD0D"];
    const featureCards = features
      .map(
        (f: { title: string; desc: string }, i: number) => `
              <div class="card">
                <div style="width:40px;height:40px;border-radius:10px;background:${primary}12;display:flex;align-items:center;justify-content:center;margin-bottom:16px;font-size:18px">
                  ${featureEmojis[i % 6]}
                </div>
                <h3 style="font-weight:600;font-size:17px;margin-bottom:8px">${esc(f.title)}</h3>
                <p style="color:rgba(${tb},0.5);font-size:14px;line-height:1.7">${esc(f.desc)}</p>
              </div>`
      )
      .join("");

    html += `
      <section class="section" style="border-top:1px solid rgba(${tb},0.05)">
        <div class="container">
          <div style="text-align:center;margin-bottom:56px">
            <p style="font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;color:${primary};margin-bottom:12px">
              Why Choose Us
            </p>
            <h2 style="font-size:clamp(1.75rem,4vw,2.75rem);font-weight:700;letter-spacing:-0.02em">
              Built different.
            </h2>
          </div>
          <div class="grid-3">
            ${featureCards}
          </div>
        </div>
      </section>`;
  }

  // ── Video / Showcase Section ──
  html += `
      <section class="section" style="border-top:1px solid rgba(${tb},0.05)">
        <div class="container">
          <div style="text-align:center;margin-bottom:48px">
            <p style="font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;color:${primary};margin-bottom:12px">
              See It In Action
            </p>
            <h2 style="font-size:clamp(1.75rem,4vw,2.75rem);font-weight:700;letter-spacing:-0.02em">
              ${isServices ? "How we deliver results" : "Watch how it works"}
            </h2>
          </div>`;

  if (site.video_url) {
    html += `
          <div style="position:relative;padding-bottom:56.25%;height:0;border-radius:16px;overflow:hidden;border:1px solid rgba(${tb},0.1);box-shadow:0 16px 64px rgba(0,0,0,${shadowAlpha})">
            <iframe
              src="${esc(site.video_url)}"
              style="position:absolute;top:0;left:0;width:100%;height:100%;border:none"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowfullscreen
            ></iframe>
          </div>`;
  } else {
    html += `
          <div style="border-radius:16px;overflow:hidden;border:1px solid rgba(${tb},0.1);background:linear-gradient(135deg,${primary}08,${accent}06);padding:80px 32px;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;position:relative;box-shadow:0 16px 64px rgba(0,0,0,${shadowAlpha})">
            <!-- Play button placeholder -->
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
  }

  html += `
        </div>
      </section>`;

  // ── Featured Products/Services Preview ──
  if (products.length > 0) {
    const productCards = products
      .slice(0, 3)
      .map((p: any, i: number) => {
        const slug = p.slug || p.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-+$/g, "");
        // Compute gradient hex for card visual header
        const primaryHex = (15 + i * 8).toString(16).padStart(2, "0");
        const accentHex = (10 + i * 6).toString(16).padStart(2, "0");

        let imageSection: string;
        if (images.products && images.products[i]) {
          imageSection = `<img src="${esc(images.products[i])}" alt="${esc(p.name)}" style="width:100%;height:100%;object-fit:cover;position:absolute;top:0;left:0" />`;
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
                <!-- Card visual header -->
                <div style="height:180px;position:relative;overflow:hidden;background:linear-gradient(135deg,${primary}${primaryHex},${accent}${accentHex});display:flex;align-items:center;justify-content:center">
                  ${imageSection}
                  ${popularBadge}
                </div>
                <!-- Card body -->
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

    html += `
      <section class="section" style="border-top:1px solid rgba(${tb},0.05)">
        <div class="container">
          <div style="text-align:center;margin-bottom:48px">
            <p style="font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;color:${primary};margin-bottom:12px">
              ${isServices ? "Our Services" : "Featured Products"}
            </p>
            <h2 style="font-size:clamp(1.75rem,4vw,2.75rem);font-weight:700;letter-spacing:-0.02em">
              ${isServices ? "Choose your path" : "What we offer"}
            </h2>
          </div>
          <div class="grid-3">
            ${productCards}
          </div>
          ${viewAllBtn}
        </div>
      </section>`;
  }

  // ── Testimonials ──
  if (testimonials.length > 0) {
    const testimonialCards = testimonials
      .map(
        (t: any, i: number) => {
          const ratingHtml = t.rating
            ? `<div style="margin-bottom:12px;color:#facc15;font-size:14px;letter-spacing:2px">${"\u2605".repeat(t.rating)}${"\u2606".repeat(5 - t.rating)}</div>`
            : "";

          return `
              <div class="card" style="display:flex;flex-direction:column">
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

    html += `
      <section class="section" style="border-top:1px solid rgba(${tb},0.05)">
        <div class="container">
          <div style="text-align:center;margin-bottom:56px">
            <p style="font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;color:${primary};margin-bottom:12px">
              Testimonials
            </p>
            <h2 style="font-size:clamp(1.75rem,4vw,2.75rem);font-weight:700;letter-spacing:-0.02em">
              What people are saying
            </h2>
          </div>
          <div class="grid-3">
            ${testimonialCards}
          </div>
        </div>
      </section>`;
  }

  // ── Process / How It Works ──
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

    html += `
      <section class="section" style="border-top:1px solid rgba(${tb},0.05)">
        <div class="container">
          <div style="text-align:center;margin-bottom:56px">
            <p style="font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;color:${primary};margin-bottom:12px">
              How It Works
            </p>
            <h2 style="font-size:clamp(1.75rem,4vw,2.75rem);font-weight:700;letter-spacing:-0.02em">
              ${esc(processData.title || "Simple. Effective. Done.")}
            </h2>
          </div>
          <div style="display:flex;flex-direction:column;gap:0;max-width:700px;margin:0 auto">
            ${stepItems}
          </div>
        </div>
      </section>`;
  }

  // ── FAQ ──
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

    html += `
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

  // ── CTA Section ──
  html += `
      <section style="padding:80px 24px;border-top:1px solid rgba(${tb},0.05);text-align:center;position:relative;overflow:hidden">
        <div style="position:absolute;bottom:-50%;left:50%;transform:translateX(-50%);width:90%;max-width:800px;height:400px;background:radial-gradient(ellipse,${primary}10 0%,transparent 70%);filter:blur(80px);pointer-events:none"></div>
        <div style="position:relative;max-width:550px;margin:0 auto">
          <h2 style="font-size:clamp(1.75rem,4vw,2.5rem);font-weight:700;letter-spacing:-0.02em;margin-bottom:16px">
            ${esc(cta.headline || "Ready to get started?")}
          </h2>
          <p style="color:rgba(${tb},0.5);font-size:16px;line-height:1.7;margin-bottom:32px">
            ${esc(cta.subheadline || site.tagline)}
          </p>
          <a href="${isServices ? "/contact" : "/" + (isServices ? "services" : "products")}" class="cta-btn">
            ${esc(cta.button_text || (isServices ? "Book a Strategy Call" : "Get Started"))}
            <span style="font-size:18px">&rarr;</span>
          </a>
        </div>
      </section>`;

  return html;
}

// ─── Calendly Section ────────────────────────────────────────────────
function buildCalendly(site: SiteData): string {
  if (!site.calendly_url) return "";
  const { primary, bg, textColor, tb } = computeTheme(site);
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
  const { headingFont, bodyFont } = computeTheme(site);

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
  <style>${buildCSS(site)}</style>
</head>
<body>
  ${buildNav(site)}
  ${buildPageContent(site)}
  ${buildCalendly(site)}
  ${buildFooter(site)}
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
