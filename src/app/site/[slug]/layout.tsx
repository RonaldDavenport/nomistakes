import { createServerClient } from "@/lib/supabase";
import { notFound } from "next/navigation";

export interface SiteData {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  type: string;
  audience: string;
  revenue_estimate: string;
  brand: {
    colors?: { primary?: string; secondary?: string; accent?: string; background?: string; text?: string };
    fonts?: { heading?: string; body?: string };
    tone?: string;
    values?: string[];
  };
  site_content: {
    hero?: { headline?: string; subheadline?: string };
    about?: { title?: string; text?: string; mission?: string };
    features?: { title: string; desc: string; icon?: string }[];
    products?: { name: string; desc: string; price: string; features?: string[] }[];
    testimonials?: { name: string; role: string; text: string; rating?: number }[];
    cta?: { headline?: string; subheadline?: string; button_text?: string };
    seo?: { title?: string; description?: string };
    contact?: { email?: string; phone?: string; address?: string; hours?: string };
    faq?: { question: string; answer: string }[];
  };
  layout?: string;
  calendly_url?: string;
}

function isLightColor(hex: string): boolean {
  const c = hex.replace("#", "");
  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 140;
}

async function getSiteData(slug: string): Promise<SiteData | null> {
  const db = createServerClient();
  const { data } = await db
    .from("businesses")
    .select("*")
    .eq("slug", slug)
    .eq("status", "live")
    .single();
  return data as SiteData | null;
}

export default async function SiteLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const site = await getSiteData(slug);

  if (!site) {
    notFound();
  }

  const colors = site.brand?.colors || {};
  const primary = colors.primary || "#4c6ef5";
  const bg = colors.background || "#0a0a0f";
  const textColor = colors.text || "#e4e4e7";
  const accent = colors.accent || "#9775fa";
  const secondary = colors.secondary || "#1e1b4b";
  const fonts = site.brand?.fonts || {};
  const cta = site.site_content?.cta || {};
  const calendlyUrl = site.calendly_url;
  const light = isLightColor(bg);
  const base = light ? "0,0,0" : "255,255,255";
  const navLinks = [
    { href: `/site/${slug}`, label: "Home" },
    { href: `/site/${slug}/about`, label: "About" },
    { href: `/site/${slug}/products`, label: site.type === "services" ? "Services" : "Products" },
    { href: `/site/${slug}/contact`, label: "Contact" },
  ];

  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>{site.site_content?.seo?.title || site.name}</title>
        <meta name="description" content={site.site_content?.seo?.description || site.tagline} />
        {fonts.heading && (
          <link
            href={`https://fonts.googleapis.com/css2?family=${encodeURIComponent(fonts.heading)}:wght@400;600;700;800&family=${encodeURIComponent(fonts.body || "Inter")}:wght@400;500;600&display=swap`}
            rel="stylesheet"
          />
        )}
        <style dangerouslySetInnerHTML={{ __html: `
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

          /* ── Variables ── */
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

          /* ═══════════════════════════════════════
             ANIMATION SYSTEM
             ═══════════════════════════════════════ */

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

          /* Scroll reveal system */
          .reveal {
            opacity: 0;
            transform: translateY(40px);
            transition: opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1),
                        transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);
          }
          .reveal.from-left {
            transform: translateX(-40px);
          }
          .reveal.from-right {
            transform: translateX(40px);
          }
          .reveal.from-scale {
            transform: scale(0.92);
          }
          .reveal.visible {
            opacity: 1;
            transform: translateY(0) translateX(0) scale(1);
          }
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

          /* Animated background blobs */
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

          /* Glow border card */
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

          /* ── Navigation ── */
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
          .section-inner {
            max-width: 1000px;
            margin: 0 auto;
          }
          .section-narrow {
            max-width: 800px;
            margin: 0 auto;
          }
          .section-title {
            font-size: clamp(1.5rem, 3.5vw, 2.25rem);
            font-weight: 700;
            margin-bottom: 16px;
            font-family: var(--site-heading-font);
          }
          .section-title-center {
            text-align: center;
            margin-bottom: 20px;
          }
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

          /* Legacy card class (backwards compat) */
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
            top: 0;
            left: 0;
            right: 0;
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
          .product-card .product-features {
            list-style: none;
            margin-top: 16px;
            padding: 0;
          }
          .product-card .product-features li {
            padding: 8px 0;
            font-size: 13px;
            color: var(--faint);
            display: flex;
            align-items: center;
            gap: 10px;
          }
          .product-card .product-features li::before {
            content: "✓";
            color: ${primary};
            font-weight: 700;
            font-size: 14px;
          }
          .product-card .product-btn {
            display: block;
            width: 100%;
            text-align: center;
            margin-top: 24px;
            padding: 14px;
            border-radius: 12px;
            background: linear-gradient(135deg, ${primary}, ${accent});
            color: #fff;
            font-weight: 600;
            font-size: 14px;
            border: none;
            cursor: pointer;
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
            width: 48px;
            height: 48px;
            border-radius: 12px;
            background: linear-gradient(135deg, ${primary}18, ${accent}12);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 22px;
            margin-bottom: 16px;
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
            content: '"';
            font-size: 64px;
            font-family: Georgia, serif;
            color: ${primary}22;
            position: absolute;
            top: 12px;
            left: 20px;
            line-height: 1;
          }
          .testimonial-card:hover {
            border-color: ${primary}33;
            transform: translateY(-2px);
          }

          /* FAQ accordion */
          .faq-item {
            padding: 24px;
            border-radius: 14px;
            border: 1px solid var(--border);
            background: var(--card-bg);
            transition: border-color 0.3s;
          }
          .faq-item:hover {
            border-color: ${primary}22;
          }

          /* ── Footer ── */
          .site-footer {
            border-top: 1px solid var(--border);
            padding: 60px 20px;
            position: relative;
          }
          .site-footer::before {
            content: '';
            position: absolute;
            top: 0;
            left: 50%;
            transform: translateX(-50%);
            width: 200px;
            height: 1px;
            background: linear-gradient(90deg, transparent, ${primary}44, transparent);
          }
          .site-footer-inner {
            max-width: 1000px;
            margin: 0 auto;
            display: grid;
            grid-template-columns: 1fr;
            gap: 32px;
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
            padding-top: 24px;
            margin-top: 16px;
            display: flex;
            flex-direction: column;
            gap: 12px;
            align-items: center;
          }
          .site-footer-copy { color: var(--ghost); font-size: 12px; }
          .site-footer-copy a { color: ${primary}; transition: opacity 0.2s; }
          .site-footer-copy a:hover { opacity: 0.7; }

          /* ── Responsive ── */
          @media (min-width: 640px) {
            .section { padding: 100px 24px; }
            .grid-cards {
              grid-template-columns: repeat(2, 1fr);
              gap: 24px;
            }
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
        `}} />
      </head>
      <body>
        {/* Navigation */}
        <nav className="site-nav">
          <div className="site-nav-inner">
            <a href={`/site/${slug}`} className="site-nav-brand">{site.name}</a>
            <ul className="site-nav-links">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <a href={link.href}>{link.label}</a>
                </li>
              ))}
            </ul>
            <a href={`/site/${slug}/products`} className="site-nav-cta">
              {cta.button_text || "Get Started"}
            </a>
            <button className="site-nav-toggle" aria-label="Menu" onClick={undefined}>
              <span /><span /><span />
            </button>
          </div>
        </nav>

        {/* Mobile menu */}
        <div id="mobile-menu" className="site-mobile-menu">
          <button className="site-mobile-close" aria-label="Close">&times;</button>
          {navLinks.map((link) => (
            <a key={link.href} href={link.href}>{link.label}</a>
          ))}
          <a href={`/site/${slug}/products`} className="cta-btn" style={{ marginTop: 24, textAlign: "center" }}>
            <span>{cta.button_text || "Get Started"}</span>
          </a>
        </div>

        {/* Page content */}
        {children}

        {/* Calendly widget */}
        {calendlyUrl && (
          <section className="section reveal" style={{ textAlign: "center" }}>
            <div style={{ maxWidth: 700, margin: "0 auto" }}>
              <h2 className="section-title" style={{ textAlign: "center", marginBottom: 8 }}>
                Book a Meeting
              </h2>
              <p style={{ color: "var(--faint)", marginBottom: 32, fontSize: 15 }}>
                Schedule a time that works for you
              </p>
              <div style={{ borderRadius: 16, overflow: "hidden", border: "1px solid var(--border)" }}>
                <iframe
                  src={`${calendlyUrl}?hide_gdpr_banner=1&background_color=${bg.replace("#", "")}&text_color=${textColor.replace("#", "")}&primary_color=${primary.replace("#", "")}`}
                  style={{ width: "100%", height: 630, border: "none" }}
                  title="Schedule a meeting"
                />
              </div>
            </div>
          </section>
        )}

        {/* Footer */}
        <footer className="site-footer">
          <div className="site-footer-inner">
            <div>
              <p className="site-footer-brand">{site.name}</p>
              <p className="site-footer-desc">{site.tagline}</p>
            </div>
            <div>
              <p className="site-footer-heading">Pages</p>
              <ul className="site-footer-links">
                {navLinks.map((link) => (
                  <li key={link.href}><a href={link.href}>{link.label}</a></li>
                ))}
              </ul>
            </div>
            <div>
              <p className="site-footer-heading">Company</p>
              <ul className="site-footer-links">
                <li><a href={`/site/${slug}/about`}>About Us</a></li>
                <li><a href={`/site/${slug}/contact`}>Contact</a></li>
                <li><a href="#">Privacy Policy</a></li>
                <li><a href="#">Terms of Service</a></li>
              </ul>
            </div>
            <div>
              <p className="site-footer-heading">Connect</p>
              <ul className="site-footer-links">
                <li><a href="#">Twitter</a></li>
                <li><a href="#">Instagram</a></li>
                <li><a href="#">LinkedIn</a></li>
              </ul>
            </div>
          </div>
          <div className="site-footer-bottom">
            <p className="site-footer-copy">&copy; 2026 {site.name}. All rights reserved.</p>
            <p className="site-footer-copy">Built with <a href="https://nomistakes.vercel.app">No Mistakes</a></p>
          </div>
        </footer>

        {/* Mobile menu + Scroll reveal scripts */}
        <script dangerouslySetInnerHTML={{ __html: `
          (function() {
            // Mobile menu
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

            // Scroll reveal with Intersection Observer
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
              // Fallback: show all immediately
              reveals.forEach(function(el) { el.classList.add('visible'); });
            }

            // Animated counters
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
                    var start = 0;
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
        `}} />
      </body>
    </html>
  );
}
