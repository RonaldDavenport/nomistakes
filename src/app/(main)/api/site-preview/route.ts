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
  };
  site_content: {
    hero?: { headline?: string; subheadline?: string };
    about?: { title?: string; text?: string; mission?: string };
    features?: { title: string; desc: string; icon?: string }[];
    products?: { name: string; desc: string; price: string; features?: string[] }[];
    testimonials?: { name: string; role: string; text: string; rating?: number }[];
    cta?: { headline?: string; subheadline?: string; button_text?: string };
    faq?: { question: string; answer: string }[];
  };
  layout?: string;
  calendly_url?: string;
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

// ─── CSS Generator ───────────────────────────────────────────────────
function buildCSS(site: SiteData): string {
  const colors = site.brand?.colors || {};
  const primary = colors.primary || "#7B39FC";
  const bg = colors.background || "#0c0a09";
  const textColor = colors.text || "#e4e4e7";
  const accent = colors.accent || "#A855F7";
  const secondary = colors.secondary || "#1e1b4b";
  const fonts = site.brand?.fonts || {};
  const light = isLightColor(bg);
  const base = light ? "0,0,0" : "255,255,255";

  return `
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html { scroll-behavior: smooth; }
    body {
      background: ${bg};
      color: ${textColor};
      font-family: ${fonts.body ? `"${fonts.body}", system-ui, sans-serif` : '"Inter", system-ui, sans-serif'};
      -webkit-font-smoothing: antialiased;
      overflow-x: hidden;
    }
    a { text-decoration: none; color: inherit; }
    img { max-width: 100%; height: auto; }

    :root {
      --site-primary: ${primary};
      --site-accent: ${accent};
      --site-secondary: ${secondary};
      --site-bg: ${bg};
      --site-text: ${textColor};
      --site-heading-font: ${fonts.heading ? `"${fonts.heading}"` : "inherit"};
      --base: ${base};
      --muted: rgba(${base}, 0.6);
      --faint: rgba(${base}, 0.5);
      --subtle: rgba(${base}, 0.4);
      --ghost: rgba(${base}, 0.25);
      --border: rgba(${base}, 0.08);
      --border-hover: rgba(${base}, 0.15);
      --card-bg: rgba(${base}, 0.03);
    }

    /* ── Animations ── */
    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(40px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes fadeInLeft {
      from { opacity: 0; transform: translateX(-40px); }
      to { opacity: 1; transform: translateX(0); }
    }
    @keyframes fadeInRight {
      from { opacity: 0; transform: translateX(40px); }
      to { opacity: 1; transform: translateX(0); }
    }
    @keyframes scaleIn {
      from { opacity: 0; transform: scale(0.92); }
      to { opacity: 1; transform: scale(1); }
    }
    @keyframes blurIn {
      from { opacity: 0; filter: blur(12px); }
      to { opacity: 1; filter: blur(0); }
    }
    @keyframes float {
      0%, 100% { transform: translateY(0px) rotate(0deg); }
      33% { transform: translateY(-20px) rotate(1deg); }
      66% { transform: translateY(10px) rotate(-1deg); }
    }
    @keyframes gradientShift {
      0% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
    }
    @keyframes shimmer {
      0% { background-position: -200% center; }
      100% { background-position: 200% center; }
    }
    @keyframes glowPulse {
      0%, 100% { opacity: 0.4; transform: scale(1); }
      50% { opacity: 0.7; transform: scale(1.05); }
    }
    @keyframes borderGlow {
      0%, 100% { border-color: ${primary}33; }
      50% { border-color: ${accent}66; }
    }
    @keyframes countUp {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes slideInStagger {
      from { opacity: 0; transform: translateY(30px) scale(0.97); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }
    @keyframes morphBlob {
      0%, 100% { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; }
      25% { border-radius: 30% 60% 70% 40% / 50% 60% 30% 60%; }
      50% { border-radius: 50% 60% 30% 60% / 40% 70% 60% 50%; }
      75% { border-radius: 60% 30% 60% 40% / 70% 50% 40% 60%; }
    }

    /* Scroll reveal */
    .reveal {
      opacity: 0;
      transform: translateY(40px);
      transition: opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1),
                  transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .reveal.from-left { transform: translateX(-40px); }
    .reveal.from-right { transform: translateX(40px); }
    .reveal.from-scale { transform: scale(0.92); }
    .reveal.visible { opacity: 1; transform: translateY(0) translateX(0) scale(1); }
    .reveal-delay-1 { transition-delay: 0.1s; }
    .reveal-delay-2 { transition-delay: 0.2s; }
    .reveal-delay-3 { transition-delay: 0.3s; }
    .reveal-delay-4 { transition-delay: 0.4s; }
    .reveal-delay-5 { transition-delay: 0.5s; }

    /* Gradient text */
    .gradient-text {
      background: linear-gradient(135deg, ${primary}, ${accent}, ${primary});
      background-size: 200% auto;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      animation: shimmer 4s ease-in-out infinite;
    }

    /* Blobs */
    .hero-blob {
      position: absolute;
      border-radius: 50%;
      filter: blur(80px);
      opacity: 0.3;
      pointer-events: none;
      animation: float 12s ease-in-out infinite, morphBlob 15s ease-in-out infinite;
    }
    .hero-blob-1 {
      width: 500px; height: 500px;
      background: ${primary};
      top: -200px; left: -100px;
      animation-delay: 0s;
    }
    .hero-blob-2 {
      width: 400px; height: 400px;
      background: ${accent};
      top: -150px; right: -80px;
      animation-delay: -4s;
    }
    .hero-blob-3 {
      width: 300px; height: 300px;
      background: ${secondary};
      bottom: -100px; left: 40%;
      animation-delay: -8s;
    }

    /* Glass card */
    .glass-card {
      padding: 28px;
      border-radius: 16px;
      border: 1px solid rgba(${base}, 0.06);
      background: rgba(${base}, 0.03);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      transition: border-color 0.3s, transform 0.3s, box-shadow 0.3s;
    }
    .glass-card:hover {
      border-color: ${primary}44;
      transform: translateY(-4px);
      box-shadow: 0 20px 60px ${primary}15, 0 0 0 1px ${primary}22;
    }
    .glass-card h3 { font-weight: 600; margin-bottom: 10px; font-family: var(--site-heading-font); }
    .glass-card p { color: var(--faint); font-size: 14px; line-height: 1.7; }

    /* Glow card */
    .glow-card {
      padding: 28px;
      border-radius: 16px;
      border: 1px solid ${primary}22;
      background: linear-gradient(135deg, ${primary}08, transparent, ${accent}05);
      position: relative;
      overflow: hidden;
      transition: transform 0.3s, box-shadow 0.3s;
    }
    .glow-card::before {
      content: '';
      position: absolute;
      inset: -1px;
      border-radius: 17px;
      background: linear-gradient(135deg, ${primary}33, ${accent}33, ${primary}33);
      background-size: 300% 300%;
      animation: gradientShift 6s ease infinite;
      z-index: -1;
      opacity: 0;
      transition: opacity 0.3s;
    }
    .glow-card:hover::before { opacity: 1; }
    .glow-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 20px 60px ${primary}18;
    }
    .glow-card h3 { font-weight: 700; margin-bottom: 6px; font-family: var(--site-heading-font); }
    .glow-card p { color: var(--faint); font-size: 14px; line-height: 1.7; }

    /* ── Nav ── */
    .site-nav {
      border-bottom: 1px solid var(--border);
      padding: 0 20px;
      position: sticky;
      top: 0;
      background: ${bg}dd;
      backdrop-filter: blur(20px) saturate(180%);
      -webkit-backdrop-filter: blur(20px) saturate(180%);
      z-index: 50;
      transition: background 0.3s;
    }
    .site-nav-inner {
      max-width: 1100px;
      margin: 0 auto;
      display: flex;
      justify-content: space-between;
      align-items: center;
      height: 64px;
    }
    .site-nav-brand {
      font-size: 20px;
      font-weight: 800;
      font-family: var(--site-heading-font);
      color: var(--site-text);
      transition: opacity 0.2s;
    }
    .site-nav-brand:hover { opacity: 0.8; }
    .site-nav-links {
      display: none;
      list-style: none;
      gap: 32px;
      align-items: center;
    }
    .site-nav-links a {
      font-size: 14px;
      color: var(--faint);
      transition: color 0.2s;
      position: relative;
    }
    .site-nav-links a::after {
      content: '';
      position: absolute;
      bottom: -4px;
      left: 0;
      width: 0;
      height: 2px;
      background: ${primary};
      transition: width 0.3s ease;
      border-radius: 1px;
    }
    .site-nav-links a:hover::after { width: 100%; }
    .site-nav-links a:hover { color: var(--site-text); }
    .site-nav-cta {
      background: ${primary};
      color: #fff;
      padding: 10px 24px;
      border-radius: 10px;
      font-size: 14px;
      font-weight: 600;
      transition: transform 0.2s, box-shadow 0.2s;
      display: none;
    }
    .site-nav-cta:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 20px ${primary}44;
    }

    /* Mobile hamburger */
    .site-nav-toggle {
      display: flex;
      flex-direction: column;
      gap: 5px;
      background: none;
      border: none;
      cursor: pointer;
      padding: 8px;
    }
    .site-nav-toggle span {
      display: block;
      width: 20px;
      height: 2px;
      background: var(--muted);
      transition: all 0.3s;
    }

    /* Mobile menu */
    .site-mobile-menu {
      display: none;
      position: fixed;
      inset: 0;
      background: ${bg}f8;
      backdrop-filter: blur(24px);
      -webkit-backdrop-filter: blur(24px);
      z-index: 100;
      flex-direction: column;
      padding: 80px 32px 32px;
    }
    .site-mobile-menu.open { display: flex; }
    .site-mobile-menu a {
      font-size: 24px;
      font-weight: 600;
      color: var(--muted);
      padding: 16px 0;
      border-bottom: 1px solid var(--border);
      transition: color 0.2s, padding-left 0.3s;
    }
    .site-mobile-menu a:hover { color: var(--site-text); padding-left: 8px; }
    .site-mobile-close {
      position: absolute;
      top: 20px;
      right: 20px;
      background: none;
      border: none;
      color: var(--faint);
      font-size: 28px;
      cursor: pointer;
      width: 44px;
      height: 44px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    /* ── Sections ── */
    .section {
      padding: 80px 20px;
      position: relative;
    }
    .section-inner { max-width: 1000px; margin: 0 auto; }
    .section-narrow { max-width: 800px; margin: 0 auto; }
    .section-title {
      font-size: clamp(1.5rem, 3.5vw, 2.25rem);
      font-weight: 700;
      margin-bottom: 16px;
      font-family: var(--site-heading-font);
    }
    .section-title-center { text-align: center; margin-bottom: 20px; }
    .section-subtitle {
      color: var(--faint);
      font-size: 16px;
      text-align: center;
      margin-bottom: 48px;
      max-width: 600px;
      margin-left: auto;
      margin-right: auto;
    }
    .section-divider {
      border: none;
      height: 1px;
      background: linear-gradient(90deg, transparent, var(--border), transparent);
      margin: 0;
    }

    .grid-cards {
      display: grid;
      grid-template-columns: 1fr;
      gap: 20px;
    }

    /* Legacy card */
    .card {
      padding: 24px;
      border-radius: 14px;
      border: 1px solid var(--border);
      background: var(--card-bg);
      transition: border-color 0.3s, transform 0.3s, box-shadow 0.3s;
    }
    .card:hover {
      border-color: ${primary}33;
      transform: translateY(-3px);
      box-shadow: 0 16px 50px rgba(0,0,0,0.12);
    }
    .card h3 { font-weight: 600; margin-bottom: 8px; font-family: var(--site-heading-font); }
    .card p { color: var(--faint); font-size: 14px; line-height: 1.6; }

    .product-card {
      padding: 28px;
      border-radius: 16px;
      border: 1px solid ${primary}22;
      background: linear-gradient(135deg, ${primary}06, transparent);
      transition: border-color 0.3s, transform 0.3s, box-shadow 0.3s;
      position: relative;
      overflow: hidden;
    }
    .product-card::after {
      content: '';
      position: absolute;
      top: 0; left: 0; right: 0;
      height: 3px;
      background: linear-gradient(90deg, ${primary}, ${accent});
      transform: scaleX(0);
      transform-origin: left;
      transition: transform 0.4s ease;
    }
    .product-card:hover::after { transform: scaleX(1); }
    .product-card:hover {
      border-color: ${primary}55;
      transform: translateY(-4px);
      box-shadow: 0 20px 60px ${primary}18;
    }
    .product-card h3 { font-weight: 700; margin-bottom: 4px; font-family: var(--site-heading-font); }
    .product-card .price { color: ${primary}; font-weight: 700; font-size: 20px; margin-bottom: 12px; }
    .product-card p { color: var(--faint); font-size: 14px; line-height: 1.6; }
    .product-card .product-features { list-style: none; margin-top: 16px; padding: 0; }
    .product-card .product-features li {
      padding: 8px 0; font-size: 13px; color: var(--faint);
      display: flex; align-items: center; gap: 10px;
    }
    .product-card .product-features li::before {
      content: "\\2713";
      color: ${primary};
      font-weight: 700;
      font-size: 14px;
    }
    .product-card .product-btn {
      display: block; width: 100%; text-align: center;
      margin-top: 24px; padding: 14px; border-radius: 12px;
      background: linear-gradient(135deg, ${primary}, ${accent});
      color: #fff; font-weight: 600; font-size: 14px;
      border: none; cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .product-card .product-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 30px ${primary}44;
    }

    /* ── Buttons ── */
    .cta-btn {
      display: inline-block;
      background: linear-gradient(135deg, ${primary}, ${accent});
      color: #fff;
      padding: 16px 40px;
      border-radius: 12px;
      font-size: 16px;
      font-weight: 700;
      transition: transform 0.3s, box-shadow 0.3s;
      border: none;
      cursor: pointer;
      position: relative;
      overflow: hidden;
    }
    .cta-btn::before {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(135deg, ${accent}, ${primary});
      opacity: 0;
      transition: opacity 0.3s;
    }
    .cta-btn:hover::before { opacity: 1; }
    .cta-btn:hover {
      transform: translateY(-3px);
      box-shadow: 0 12px 40px ${primary}55;
    }
    .cta-btn span { position: relative; z-index: 1; }
    .cta-btn-outline {
      display: inline-block;
      border: 1px solid var(--border-hover);
      color: var(--muted);
      padding: 16px 40px;
      border-radius: 12px;
      font-size: 16px;
      font-weight: 600;
      transition: border-color 0.3s, background 0.3s, color 0.3s;
    }
    .cta-btn-outline:hover {
      border-color: ${primary}66;
      background: ${primary}0a;
      color: var(--site-text);
    }

    /* Stat counter */
    .stat-number {
      font-size: clamp(1.5rem, 4vw, 2.5rem);
      font-weight: 800;
      background: linear-gradient(135deg, ${primary}, ${accent});
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    /* Feature icon */
    .feature-icon {
      width: 48px; height: 48px;
      border-radius: 12px;
      background: linear-gradient(135deg, ${primary}18, ${accent}12);
      display: flex; align-items: center; justify-content: center;
      font-size: 22px; margin-bottom: 16px;
      border: 1px solid ${primary}15;
    }

    /* Testimonial */
    .testimonial-card {
      padding: 28px;
      border-radius: 16px;
      border: 1px solid var(--border);
      background: var(--card-bg);
      transition: border-color 0.3s, transform 0.3s;
      position: relative;
    }
    .testimonial-card::before {
      content: '\\201C';
      font-size: 64px;
      font-family: Georgia, serif;
      color: ${primary}22;
      position: absolute;
      top: 12px; left: 20px;
      line-height: 1;
    }
    .testimonial-card:hover {
      border-color: ${primary}33;
      transform: translateY(-2px);
    }

    /* FAQ */
    .faq-item {
      padding: 24px;
      border-radius: 14px;
      border: 1px solid var(--border);
      background: var(--card-bg);
      transition: border-color 0.3s;
    }
    .faq-item:hover { border-color: ${primary}22; }

    /* ── Footer ── */
    .site-footer {
      border-top: 1px solid var(--border);
      padding: 60px 20px;
      position: relative;
    }
    .site-footer::before {
      content: '';
      position: absolute;
      top: 0; left: 50%; transform: translateX(-50%);
      width: 200px; height: 1px;
      background: linear-gradient(90deg, transparent, ${primary}44, transparent);
    }
    .site-footer-inner {
      max-width: 1000px; margin: 0 auto;
      display: grid; grid-template-columns: 1fr; gap: 32px;
    }
    .site-footer-brand { font-size: 18px; font-weight: 800; font-family: var(--site-heading-font); margin-bottom: 8px; }
    .site-footer-desc { color: var(--subtle); font-size: 13px; line-height: 1.6; max-width: 300px; }
    .site-footer-heading { font-weight: 600; font-size: 14px; margin-bottom: 12px; }
    .site-footer-links { list-style: none; padding: 0; }
    .site-footer-links li { padding: 4px 0; }
    .site-footer-links a { color: var(--subtle); font-size: 13px; transition: color 0.2s, padding-left 0.2s; }
    .site-footer-links a:hover { color: var(--site-text); padding-left: 4px; }
    .site-footer-bottom {
      border-top: 1px solid var(--border);
      padding-top: 24px; margin-top: 16px;
      display: flex; flex-direction: column; gap: 12px; align-items: center;
    }
    .site-footer-copy { color: var(--ghost); font-size: 12px; }
    .site-footer-copy a { color: ${primary}; transition: opacity 0.2s; }
    .site-footer-copy a:hover { opacity: 0.7; }

    /* ── Responsive ── */
    @media (min-width: 640px) {
      .section { padding: 100px 24px; }
      .grid-cards { grid-template-columns: repeat(2, 1fr); gap: 24px; }
      .site-footer-inner { grid-template-columns: 2fr 1fr 1fr; }
      .site-footer-bottom { flex-direction: row; justify-content: space-between; }
    }
    @media (min-width: 768px) {
      .site-nav-links { display: flex; }
      .site-nav-cta { display: inline-block; }
      .site-nav-toggle { display: none; }
    }
    @media (min-width: 960px) {
      .grid-cards { grid-template-columns: repeat(3, 1fr); }
      .site-footer-inner { grid-template-columns: 2fr 1fr 1fr 1fr; }
    }
  `;
}

// ─── Nav Builder ─────────────────────────────────────────────────────
function buildNav(site: SiteData): string {
  const cta = site.site_content?.cta || {};
  const svcLabel = site.type === "services" ? "Services" : "Products";
  const navLinks = [
    { href: "#", label: "Home" },
    { href: "#about", label: "About" },
    { href: "#products", label: svcLabel },
    { href: "#contact", label: "Contact" },
  ];

  const linkItems = navLinks.map((l) => `<li><a href="${l.href}">${esc(l.label)}</a></li>`).join("");

  const mobileLinks = navLinks
    .map((l) => `<a href="${l.href}">${esc(l.label)}</a>`)
    .join("");

  return `
    <nav class="site-nav">
      <div class="site-nav-inner">
        <a href="#" class="site-nav-brand">${esc(site.name)}</a>
        <ul class="site-nav-links">${linkItems}</ul>
        <a href="#products" class="site-nav-cta">${esc(cta.button_text || "Get Started")}</a>
        <button class="site-nav-toggle" aria-label="Menu">
          <span></span><span></span><span></span>
        </button>
      </div>
    </nav>
    <div id="mobile-menu" class="site-mobile-menu">
      <button class="site-mobile-close" aria-label="Close">&times;</button>
      ${mobileLinks}
      <a href="#products" class="cta-btn" style="margin-top:24px;text-align:center">
        <span>${esc(cta.button_text || "Get Started")}</span>
      </a>
    </div>
  `;
}

// ─── Footer Builder ──────────────────────────────────────────────────
function buildFooter(site: SiteData): string {
  const svcLabel = site.type === "services" ? "Services" : "Products";
  const navLinks = [
    { href: "#", label: "Home" },
    { href: "#about", label: "About" },
    { href: "#products", label: svcLabel },
    { href: "#contact", label: "Contact" },
  ];

  const pageLinks = navLinks.map((l) => `<li><a href="${l.href}">${esc(l.label)}</a></li>`).join("");

  return `
    <footer class="site-footer">
      <div class="site-footer-inner">
        <div>
          <p class="site-footer-brand">${esc(site.name)}</p>
          <p class="site-footer-desc">${esc(site.tagline)}</p>
        </div>
        <div>
          <p class="site-footer-heading">Pages</p>
          <ul class="site-footer-links">${pageLinks}</ul>
        </div>
        <div>
          <p class="site-footer-heading">Company</p>
          <ul class="site-footer-links">
            <li><a href="#about">About Us</a></li>
            <li><a href="#contact">Contact</a></li>
            <li><a href="#">Privacy Policy</a></li>
            <li><a href="#">Terms of Service</a></li>
          </ul>
        </div>
        <div>
          <p class="site-footer-heading">Connect</p>
          <ul class="site-footer-links">
            <li><a href="#">Twitter</a></li>
            <li><a href="#">Instagram</a></li>
            <li><a href="#">LinkedIn</a></li>
          </ul>
        </div>
      </div>
      <div class="site-footer-bottom">
        <p class="site-footer-copy">&copy; 2026 ${esc(site.name)}. All rights reserved.</p>
        <p class="site-footer-copy">Built with <a href="https://nomistakes.vercel.app">No Mistakes</a></p>
      </div>
    </footer>
  `;
}

// ─── Content Builders (per layout) ──────────────────────────────────

function buildDefaultContent(site: SiteData): string {
  const colors = site.brand?.colors || {};
  const primary = colors.primary || "#7B39FC";
  const accent = colors.accent || "#A855F7";
  const hero = site.site_content?.hero || {};
  const about = site.site_content?.about || {};
  const features = site.site_content?.features || [];
  const products = site.site_content?.products || [];
  const testimonials = site.site_content?.testimonials || [];
  const cta = site.site_content?.cta || {};
  const featureIcons = ["\u2726", "\u25C6", "\u25B2", "\u25CF", "\u2605", "\u25C9"];

  let html = "";

  // Hero
  html += `
    <section style="padding:100px 20px 80px;text-align:center;position:relative;overflow:hidden">
      <div class="hero-blob hero-blob-1"></div>
      <div class="hero-blob hero-blob-2"></div>
      <div style="max-width:740px;margin:0 auto;position:relative;z-index:1">
        <h1 class="reveal" style="font-size:clamp(2.25rem,6vw,4rem);font-weight:800;line-height:1.08;margin-bottom:20px;font-family:var(--site-heading-font);letter-spacing:-0.01em">
          ${esc(hero.headline || site.name)}
        </h1>
        <p class="reveal reveal-delay-1" style="font-size:clamp(1rem,2.5vw,1.15rem);color:var(--muted);line-height:1.7;margin-bottom:40px;max-width:560px;margin:0 auto 40px">
          ${esc(hero.subheadline || site.tagline)}
        </p>
        <div class="reveal reveal-delay-2" style="display:flex;gap:16px;justify-content:center;flex-wrap:wrap">
          <a href="#products" class="cta-btn"><span>${esc(cta.button_text || "Get Started")}</span></a>
          <a href="#about" class="cta-btn-outline">Learn More</a>
        </div>
      </div>
    </section>
  `;

  // Trust bar
  html += `
    <section class="reveal" style="padding:48px 20px;text-align:center">
      <div style="display:flex;justify-content:center;gap:clamp(32px,6vw,64px);flex-wrap:wrap">
        <div class="reveal" style="text-align:center">
          <p class="stat-number" data-count="500" data-suffix="+">0+</p>
          <p style="font-size:13px;color:var(--subtle);margin-top:4px">Happy Customers</p>
        </div>
        <div class="reveal" style="text-align:center">
          <p class="stat-number" data-count="4.9" data-suffix="/5">0/5</p>
          <p style="font-size:13px;color:var(--subtle);margin-top:4px">5-Star Reviews</p>
        </div>
        <div class="reveal" style="text-align:center">
          <p class="stat-number" data-count="100" data-suffix="%">0%</p>
          <p style="font-size:13px;color:var(--subtle);margin-top:4px">Satisfaction</p>
        </div>
      </div>
    </section>
    <hr class="section-divider" />
  `;

  // Features
  if (features.length > 0) {
    const featureCards = features.slice(0, 6).map((f, i) => `
      <div class="reveal glass-card reveal-delay-${Math.min(i + 1, 5)}">
        <div class="feature-icon">${featureIcons[i % featureIcons.length]}</div>
        <h3>${esc(f.title)}</h3>
        <p>${esc(f.desc)}</p>
      </div>
    `).join("");

    html += `
      <section class="section">
        <div class="section-inner">
          <h2 class="reveal section-title section-title-center">Why Choose ${esc(site.name)}</h2>
          <p class="reveal reveal-delay-1 section-subtitle">Everything you need, nothing you don&apos;t.</p>
          <div class="grid-cards">${featureCards}</div>
        </div>
      </section>
    `;
  }

  // About
  if (about.text) {
    const aboutText = about.text.length > 300 ? about.text.slice(0, 300) + "..." : about.text;
    html += `
      <section id="about" class="section">
        <div class="section-narrow" style="text-align:center">
          <h2 class="reveal section-title" style="text-align:center">${esc(about.title || `About ${site.name}`)}</h2>
          <p class="reveal reveal-delay-1" style="color:var(--muted);line-height:1.8;margin-bottom:28px;font-size:15px">
            ${esc(aboutText)}
          </p>
          <div class="reveal reveal-delay-2">
            <a href="#about" style="color:${primary};font-weight:600;font-size:14px;display:inline-flex;align-items:center;gap:6px">
              Read our full story <span style="display:inline-block">&rarr;</span>
            </a>
          </div>
        </div>
      </section>
    `;
  }

  // Testimonials
  if (testimonials.length > 0) {
    const testimonialCards = testimonials.map((t, i) => {
      const stars = Array.from({ length: 5 }).map(() =>
        `<span style="color:${primary};font-size:14px;margin-right:2px">&#9733;</span>`
      ).join("");
      return `
        <div class="reveal testimonial-card reveal-delay-${Math.min(i + 1, 5)}">
          <div style="margin-bottom:14px;padding-left:32px">${stars}</div>
          <p style="color:var(--muted);font-size:14px;line-height:1.7;margin-bottom:18px;padding-left:32px;font-style:italic">
            &ldquo;${esc(t.text)}&rdquo;
          </p>
          <div style="display:flex;align-items:center;gap:12px">
            <div style="width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,${primary}33,${accent}33);display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:700">
              ${esc(t.name[0])}
            </div>
            <div>
              <p style="font-weight:600;font-size:14px">${esc(t.name)}</p>
              <p style="color:var(--subtle);font-size:12px">${esc(t.role)}</p>
            </div>
          </div>
        </div>
      `;
    }).join("");

    html += `
      <section class="section">
        <div class="section-inner">
          <h2 class="reveal section-title section-title-center">What People Say</h2>
          <div class="grid-cards">${testimonialCards}</div>
        </div>
      </section>
    `;
  }

  // CTA
  html += `
    <section class="section" style="text-align:center;position:relative;overflow:hidden">
      <div class="hero-blob hero-blob-3" style="bottom:auto;top:-100px;opacity:0.2"></div>
      <div style="max-width:600px;margin:0 auto;position:relative;z-index:1">
        <h2 class="reveal" style="font-size:clamp(1.75rem,4vw,2.75rem);font-weight:800;margin-bottom:16px;font-family:var(--site-heading-font)">
          ${esc(cta.headline || `Ready to get started with ${site.name}?`)}
        </h2>
        <p class="reveal reveal-delay-1" style="color:var(--faint);margin-bottom:40px;line-height:1.6">
          ${esc(cta.subheadline || site.tagline)}
        </p>
        <div class="reveal reveal-delay-2">
          <a href="#products" class="cta-btn"><span>${esc(cta.button_text || "Get Started Now")}</span></a>
        </div>
      </div>
    </section>
  `;

  return html;
}

function buildMinimalContent(site: SiteData): string {
  const colors = site.brand?.colors || {};
  const primary = colors.primary || "#7B39FC";
  const accent = colors.accent || "#A855F7";
  const hero = site.site_content?.hero || {};
  const about = site.site_content?.about || {};
  const products = site.site_content?.products || [];
  const testimonials = site.site_content?.testimonials || [];
  const cta = site.site_content?.cta || {};

  let html = "";

  // Hero
  html += `
    <section style="padding:120px 20px 80px;max-width:720px;margin:0 auto;position:relative">
      <div class="reveal" style="margin-bottom:20px">
        <span style="display:inline-block;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:0.15em;color:${primary};margin-bottom:24px">
          ${site.type === "services" ? "Professional Services" : "Digital Products"}
        </span>
      </div>
      <h1 class="reveal reveal-delay-1" style="font-size:clamp(3rem,8vw,5rem);font-weight:800;line-height:1.0;margin-bottom:28px;font-family:var(--site-heading-font);letter-spacing:-0.02em">
        ${esc(hero.headline || site.name)}
      </h1>
      <p class="reveal reveal-delay-2" style="font-size:clamp(1.1rem,2.5vw,1.35rem);color:var(--muted);line-height:1.8;margin-bottom:48px;max-width:560px">
        ${esc(hero.subheadline || site.tagline)}
      </p>
      <div class="reveal reveal-delay-3" style="display:flex;gap:16px;flex-wrap:wrap">
        <a href="#products" class="cta-btn"><span>${esc(cta.button_text || "Work With Me")}</span></a>
        <a href="#about" class="cta-btn-outline">Learn More</a>
      </div>
    </section>
    <hr class="section-divider" />
  `;

  // About
  if (about.text) {
    const paragraphs = about.text.split("\n").map((p: string) => `<p style="margin-bottom:20px">${esc(p)}</p>`).join("");
    let missionBlock = "";
    if (about.mission) {
      missionBlock = `
        <div class="reveal reveal-delay-2" style="margin-top:32px;padding:24px 28px;border-left:3px solid ${primary};background:${primary}08;border-radius:0 12px 12px 0">
          <p style="color:${primary};font-weight:600;font-style:italic;line-height:1.6">${esc(about.mission)}</p>
        </div>
      `;
    }
    html += `
      <section id="about" style="padding:80px 20px;max-width:720px;margin:0 auto">
        <div class="reveal">
          <h2 style="font-size:clamp(1.5rem,3.5vw,2.25rem);font-weight:700;margin-bottom:24px;font-family:var(--site-heading-font)">
            ${esc(about.title || `About ${site.name}`)}
          </h2>
        </div>
        <div class="reveal reveal-delay-1" style="color:var(--muted);line-height:2;font-size:1.05rem">
          ${paragraphs}
        </div>
        ${missionBlock}
      </section>
      <hr class="section-divider" />
    `;
  }

  // Products
  if (products.length > 0) {
    const productRows = products.map((p, i) => `
      <div class="reveal reveal-delay-${Math.min(i + 1, 5)}" style="padding:28px 0;${i < products.length - 1 ? "border-bottom:1px solid var(--border);" : ""}display:grid;grid-template-columns:1fr auto;gap:20px;align-items:start">
        <div>
          <h3 style="font-size:1.2rem;font-weight:600;margin-bottom:8px;font-family:var(--site-heading-font)">${esc(p.name)}</h3>
          <p style="color:var(--muted);line-height:1.7;font-size:14px">${esc(p.desc)}</p>
        </div>
        <span class="stat-number" style="font-size:1.25rem;white-space:nowrap">${esc(p.price)}</span>
      </div>
    `).join("");

    html += `
      <section id="products" style="padding:80px 20px;max-width:720px;margin:0 auto">
        <h2 class="reveal" style="font-size:clamp(1.5rem,3.5vw,2.25rem);font-weight:700;margin-bottom:40px;font-family:var(--site-heading-font)">
          How I Can Help
        </h2>
        <div style="display:flex;flex-direction:column;gap:0">${productRows}</div>
      </section>
    `;
  }

  // Testimonials
  if (testimonials.length > 0) {
    const testimonialCards = testimonials.map((t, i) => `
      <div class="reveal testimonial-card reveal-delay-${Math.min(i + 1, 5)}">
        <p style="color:var(--muted);font-size:15px;line-height:1.8;margin-bottom:16px;padding-left:32px;font-style:italic">
          ${esc(t.text)}
        </p>
        <div style="display:flex;align-items:center;gap:12px;padding-left:32px">
          <div style="width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,${primary}33,${accent}33);display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:700">
            ${esc(t.name[0])}
          </div>
          <div>
            <p style="font-weight:600;font-size:14px">${esc(t.name)}</p>
            <p style="color:var(--subtle);font-size:12px">${esc(t.role)}</p>
          </div>
        </div>
      </div>
    `).join("");

    html += `
      <hr class="section-divider" />
      <section style="padding:80px 20px;max-width:720px;margin:0 auto">
        <h2 class="reveal" style="font-size:clamp(1.5rem,3.5vw,2.25rem);font-weight:700;margin-bottom:40px;font-family:var(--site-heading-font)">
          What Clients Say
        </h2>
        <div style="display:flex;flex-direction:column;gap:24px">${testimonialCards}</div>
      </section>
    `;
  }

  // CTA
  html += `
    <hr class="section-divider" />
    <section id="contact" style="padding:100px 20px;max-width:720px;margin:0 auto;text-align:center">
      <h2 class="reveal" style="font-size:clamp(1.75rem,4vw,2.75rem);font-weight:800;margin-bottom:20px;font-family:var(--site-heading-font)">
        ${esc(cta.headline || "Let\u2019s work together")}
      </h2>
      <p class="reveal reveal-delay-1" style="color:var(--muted);margin-bottom:40px;font-size:16px;line-height:1.6">
        ${esc(cta.subheadline || site.tagline)}
      </p>
      <div class="reveal reveal-delay-2">
        <a href="#contact" class="cta-btn"><span>${esc(cta.button_text || "Get In Touch")}</span></a>
      </div>
    </section>
  `;

  return html;
}

function buildCreatorContent(site: SiteData): string {
  const colors = site.brand?.colors || {};
  const primary = colors.primary || "#7B39FC";
  const accent = colors.accent || "#A855F7";
  const secondary = colors.secondary || "#1e1b4b";
  const hero = site.site_content?.hero || {};
  const products = site.site_content?.products || [];
  const testimonials = site.site_content?.testimonials || [];
  const cta = site.site_content?.cta || {};
  const faq = site.site_content?.faq || [];
  const featured = products[0];
  const restProducts = products.slice(1);

  let html = "";

  // Hero
  html += `
    <section style="padding:100px 20px 80px;text-align:center;position:relative;overflow:hidden">
      <div class="hero-blob hero-blob-1"></div>
      <div class="hero-blob hero-blob-2"></div>
      <div style="max-width:760px;margin:0 auto;position:relative;z-index:1">
        <div class="reveal">
          <span style="display:inline-block;padding:8px 20px;border-radius:100px;background:${primary}15;border:1px solid ${primary}25;font-size:13px;font-weight:600;color:${primary};margin-bottom:28px">
            ${site.type === "services" ? "Premium Services" : "Digital Products"}
          </span>
        </div>
        <h1 class="reveal reveal-delay-1 gradient-text" style="font-size:clamp(2.5rem,6vw,4rem);font-weight:800;line-height:1.05;margin-bottom:20px;font-family:var(--site-heading-font)">
          ${esc(hero.headline || site.name)}
        </h1>
        <p class="reveal reveal-delay-2" style="font-size:clamp(1rem,2.5vw,1.15rem);color:var(--muted);line-height:1.7;margin-bottom:40px;max-width:560px;margin:0 auto 40px">
          ${esc(hero.subheadline || site.tagline)}
        </p>
        <div class="reveal reveal-delay-3" style="display:flex;gap:16px;justify-content:center;flex-wrap:wrap">
          <a href="#products" class="cta-btn"><span>${esc(cta.button_text || "Browse Products")}</span></a>
        </div>
      </div>
    </section>
  `;

  // Featured product
  if (featured) {
    let featuresGrid = "";
    if (featured.features) {
      const featureItems = featured.features.map((f: string) =>
        `<div style="display:flex;align-items:center;gap:10px;font-size:14px;color:var(--muted)"><span style="color:${primary};font-weight:700">&#10003;</span> ${esc(f)}</div>`
      ).join("");
      featuresGrid = `<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:28px">${featureItems}</div>`;
    }
    html += `
      <section id="products" class="section">
        <div style="max-width:800px;margin:0 auto;padding:0 20px">
          <div class="reveal glow-card" style="padding:36px">
            <div style="display:flex;align-items:center;gap:12px;margin-bottom:16px">
              <span style="padding:6px 16px;border-radius:100px;background:linear-gradient(135deg,${primary},${accent});font-size:11px;font-weight:700;color:#fff;text-transform:uppercase;letter-spacing:0.08em">
                Featured
              </span>
              <span class="stat-number" style="font-size:1.5rem">${esc(featured.price)}</span>
            </div>
            <h2 style="font-size:clamp(1.5rem,3vw,2.25rem);font-weight:800;margin-bottom:14px;font-family:var(--site-heading-font)">
              ${esc(featured.name)}
            </h2>
            <p style="color:var(--muted);line-height:1.7;margin-bottom:24px;font-size:15px">${esc(featured.desc)}</p>
            ${featuresGrid}
            <a href="#products" class="cta-btn" style="padding:14px 36px;font-size:15px"><span>Get Started</span></a>
          </div>
        </div>
      </section>
    `;
  }

  // Rest products
  if (restProducts.length > 0) {
    const productCards = restProducts.map((p, i) => `
      <div class="reveal glass-card reveal-delay-${Math.min(i + 1, 5)}">
        <h3 style="margin-bottom:8px">${esc(p.name)}</h3>
        <p style="color:var(--muted);font-size:14px;line-height:1.6;margin-bottom:16px">${esc(p.desc)}</p>
        <span class="stat-number" style="font-size:1.125rem">${esc(p.price)}</span>
      </div>
    `).join("");

    html += `
      <section class="section">
        <div class="section-inner">
          <h2 class="reveal section-title section-title-center">More ${site.type === "services" ? "Services" : "Products"}</h2>
          <div class="grid-cards">${productCards}</div>
        </div>
      </section>
    `;
  }

  // Testimonials
  if (testimonials.length > 0) {
    const testimonialCards = testimonials.map((t, i) => {
      const stars = Array.from({ length: 5 }).map(() =>
        `<span style="color:${primary};font-size:15px">&#9733;</span>`
      ).join("");
      return `
        <div class="reveal testimonial-card reveal-delay-${Math.min(i + 1, 5)}" style="text-align:left">
          <div style="margin-bottom:16px;padding-left:32px">${stars}</div>
          <p style="color:var(--muted);font-size:14px;line-height:1.7;margin-bottom:20px;padding-left:32px;font-style:italic">
            ${esc(t.text)}
          </p>
          <div style="display:flex;align-items:center;gap:12px">
            <div style="width:40px;height:40px;border-radius:50%;background:linear-gradient(135deg,${primary},${accent});display:flex;align-items:center;justify-content:center;color:#fff;font-size:16px;font-weight:700">
              ${esc(t.name[0])}
            </div>
            <div>
              <p style="font-weight:600;font-size:14px">${esc(t.name)}</p>
              <p style="color:var(--subtle);font-size:12px">${esc(t.role)}</p>
            </div>
          </div>
        </div>
      `;
    }).join("");

    html += `
      <section class="section" style="text-align:center">
        <div class="section-inner">
          <h2 class="reveal section-title section-title-center">What Customers Say</h2>
          <div class="grid-cards">${testimonialCards}</div>
        </div>
      </section>
    `;
  }

  // FAQ
  if (faq.length > 0) {
    const faqItems = faq.map((item, i) => `
      <div class="reveal faq-item reveal-delay-${Math.min(i + 1, 5)}">
        <h3 style="font-size:15px;font-weight:600;margin-bottom:10px;font-family:var(--site-heading-font)">${esc(item.question)}</h3>
        <p style="color:var(--muted);font-size:14px;line-height:1.7">${esc(item.answer)}</p>
      </div>
    `).join("");

    html += `
      <section class="section">
        <div style="max-width:680px;margin:0 auto;padding:0 20px">
          <h2 class="reveal section-title section-title-center">Frequently Asked Questions</h2>
          <div style="display:flex;flex-direction:column;gap:16px">${faqItems}</div>
        </div>
      </section>
    `;
  }

  // CTA
  html += `
    <section class="section" style="text-align:center;position:relative;overflow:hidden">
      <div class="hero-blob hero-blob-3" style="bottom:auto;top:-50%;left:20%"></div>
      <div style="max-width:600px;margin:0 auto;position:relative;z-index:1">
        <h2 class="reveal gradient-text" style="font-size:clamp(1.75rem,4vw,2.75rem);font-weight:800;margin-bottom:20px;font-family:var(--site-heading-font)">
          ${esc(cta.headline || "Ready to get started?")}
        </h2>
        <p class="reveal reveal-delay-1" style="color:var(--faint);margin-bottom:40px">
          ${esc(cta.subheadline || site.tagline)}
        </p>
        <div class="reveal reveal-delay-2">
          <a href="#products" class="cta-btn"><span>${esc(cta.button_text || "Get Started Now")}</span></a>
        </div>
      </div>
    </section>
  `;

  return html;
}

// ─── Calendly Section ────────────────────────────────────────────────
function buildCalendly(site: SiteData): string {
  if (!site.calendly_url) return "";
  const colors = site.brand?.colors || {};
  const primary = colors.primary || "#7B39FC";
  const bg = colors.background || "#0c0a09";
  const textColor = colors.text || "#e4e4e7";
  return `
    <section class="section reveal" style="text-align:center">
      <div style="max-width:700px;margin:0 auto">
        <h2 class="section-title" style="text-align:center;margin-bottom:8px">Book a Meeting</h2>
        <p style="color:var(--faint);margin-bottom:32px;font-size:15px">Schedule a time that works for you</p>
        <div style="border-radius:16px;overflow:hidden;border:1px solid var(--border)">
          <iframe
            src="${site.calendly_url}?hide_gdpr_banner=1&background_color=${bg.replace("#", "")}&text_color=${textColor.replace("#", "")}&primary_color=${primary.replace("#", "")}"
            style="width:100%;height:630px;border:none"
            title="Schedule a meeting"
          ></iframe>
        </div>
      </div>
    </section>
  `;
}

// ─── Script (mobile menu + scroll reveal + counters) ─────────────────
function buildScript(): string {
  return `
    <script>
      (function() {
        var toggle = document.querySelector('.site-nav-toggle');
        var menu = document.getElementById('mobile-menu');
        var close = document.querySelector('.site-mobile-close');
        if (toggle && menu) {
          toggle.addEventListener('click', function() { menu.classList.add('open'); });
          close.addEventListener('click', function() { menu.classList.remove('open'); });
          menu.querySelectorAll('a').forEach(function(a) {
            a.addEventListener('click', function() { menu.classList.remove('open'); });
          });
        }

        var reveals = document.querySelectorAll('.reveal');
        if (reveals.length > 0 && 'IntersectionObserver' in window) {
          var observer = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
              if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
              }
            });
          }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
          reveals.forEach(function(el) { observer.observe(el); });
        } else {
          reveals.forEach(function(el) { el.classList.add('visible'); });
        }

        var counters = document.querySelectorAll('[data-count]');
        if (counters.length > 0 && 'IntersectionObserver' in window) {
          var cObserver = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
              if (entry.isIntersecting) {
                var el = entry.target;
                var target = el.getAttribute('data-count');
                var suffix = el.getAttribute('data-suffix') || '';
                var prefix = el.getAttribute('data-prefix') || '';
                var num = parseInt(target);
                if (isNaN(num)) { el.textContent = prefix + target + suffix; cObserver.unobserve(el); return; }
                var duration = 1500;
                var startTime = null;
                function step(ts) {
                  if (!startTime) startTime = ts;
                  var progress = Math.min((ts - startTime) / duration, 1);
                  var ease = 1 - Math.pow(1 - progress, 3);
                  el.textContent = prefix + Math.floor(ease * num) + suffix;
                  if (progress < 1) requestAnimationFrame(step);
                  else el.textContent = prefix + target + suffix;
                }
                requestAnimationFrame(step);
                cObserver.unobserve(el);
              }
            });
          }, { threshold: 0.5 });
          counters.forEach(function(el) { cObserver.observe(el); });
        }
      })();
    </script>
  `;
}

// ─── Full HTML Document ──────────────────────────────────────────────
function buildFullHTML(site: SiteData): string {
  const fonts = site.brand?.fonts || {};
  const headingFont = fonts.heading || "";
  const bodyFont = fonts.body || "Inter";

  const fontLink = headingFont
    ? `<link href="https://fonts.googleapis.com/css2?family=${encodeURIComponent(headingFont)}:wght@400;600;700;800&family=${encodeURIComponent(bodyFont)}:wght@400;500;600&display=swap" rel="stylesheet" />`
    : `<link href="https://fonts.googleapis.com/css2?family=${encodeURIComponent(bodyFont)}:wght@400;500;600&display=swap" rel="stylesheet" />`;

  const layout = (site.layout as string) || "default";
  let content: string;
  if (layout === "minimal") {
    content = buildMinimalContent(site);
  } else if (layout === "creator") {
    content = buildCreatorContent(site);
  } else {
    content = buildDefaultContent(site);
  }

  const seoTitle = site.site_content?.cta?.headline || site.name;
  const seoDesc = site.site_content?.hero?.subheadline || site.tagline;

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
  ${content}
  ${buildCalendly(site)}
  ${buildFooter(site)}
  ${buildScript()}
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
