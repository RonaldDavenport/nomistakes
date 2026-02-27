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

// Determine if a hex colour is "light" (returns true) or "dark"
function isLightColor(hex: string): boolean {
  const c = hex.replace("#", "");
  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);
  // Relative luminance formula
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
  const fonts = site.brand?.fonts || {};
  const cta = site.site_content?.cta || {};
  const calendlyUrl = site.calendly_url;
  const light = isLightColor(bg);
  // Adaptive colour tokens based on whether bg is light or dark
  const base = light ? "0,0,0" : "255,255,255"; // rgb base for text/borders
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

          /* ── Site Variables ── */
          :root {
            --site-primary: ${primary};
            --site-accent: ${accent};
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
            --overlay: ${light ? `${bg}ee` : `${bg}ee`};
          }

          /* ── Navigation ── */
          .site-nav {
            border-bottom: 1px solid var(--border);
            padding: 0 20px;
            position: sticky;
            top: 0;
            background: ${bg}ee;
            backdrop-filter: blur(16px);
            -webkit-backdrop-filter: blur(16px);
            z-index: 50;
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
          }
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
          }
          .site-nav-links a:hover,
          .site-nav-links a.active { color: var(--site-text); }
          .site-nav-cta {
            background: ${primary};
            color: ${light ? "#fff" : "#fff"};
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
            transition: all 0.2s;
          }

          /* Mobile menu */
          .site-mobile-menu {
            display: none;
            position: fixed;
            inset: 0;
            background: ${bg}f5;
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
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
            transition: color 0.2s;
          }
          .site-mobile-menu a:hover { color: var(--site-text); }
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

          /* ── Common Sections ── */
          .section {
            padding: 60px 20px;
            border-top: 1px solid var(--border);
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
            font-size: clamp(1.5rem, 3.5vw, 2rem);
            font-weight: 700;
            margin-bottom: 16px;
            font-family: var(--site-heading-font);
          }
          .section-title-center {
            text-align: center;
            margin-bottom: 40px;
          }
          .section-subtitle {
            color: var(--faint);
            font-size: 16px;
            text-align: center;
            margin-bottom: 40px;
            max-width: 600px;
            margin-left: auto;
            margin-right: auto;
          }

          .grid-cards {
            display: grid;
            grid-template-columns: 1fr;
            gap: 16px;
          }
          .card {
            padding: 20px;
            border-radius: 12px;
            border: 1px solid var(--border);
            background: var(--card-bg);
            transition: border-color 0.2s, transform 0.2s;
          }
          .card:hover {
            border-color: ${primary}33;
            transform: translateY(-2px);
          }
          .card h3 { font-weight: 600; margin-bottom: 8px; font-family: var(--site-heading-font); }
          .card p { color: var(--faint); font-size: 14px; line-height: 1.6; }

          .product-card {
            padding: 24px;
            border-radius: 12px;
            border: 1px solid ${primary}33;
            background: ${primary}08;
            transition: border-color 0.2s, transform 0.2s, box-shadow 0.2s;
          }
          .product-card:hover {
            border-color: ${primary}66;
            transform: translateY(-2px);
            box-shadow: 0 8px 30px ${primary}15;
          }
          .product-card h3 { font-weight: 700; margin-bottom: 4px; font-family: var(--site-heading-font); }
          .product-card .price { color: ${primary}; font-weight: 700; font-size: 18px; margin-bottom: 12px; }
          .product-card p { color: var(--faint); font-size: 14px; line-height: 1.6; }
          .product-card .product-features {
            list-style: none;
            margin-top: 16px;
            padding: 0;
          }
          .product-card .product-features li {
            padding: 6px 0;
            font-size: 13px;
            color: var(--faint);
            display: flex;
            align-items: center;
            gap: 8px;
          }
          .product-card .product-features li::before {
            content: "✓";
            color: ${primary};
            font-weight: 700;
          }
          .product-card .product-btn {
            display: block;
            width: 100%;
            text-align: center;
            margin-top: 20px;
            padding: 12px;
            border-radius: 10px;
            background: ${primary};
            color: #fff;
            font-weight: 600;
            font-size: 14px;
            border: none;
            cursor: pointer;
            transition: transform 0.2s, box-shadow 0.2s;
          }
          .product-card .product-btn:hover {
            transform: translateY(-1px);
            box-shadow: 0 4px 20px ${primary}44;
          }

          /* ── CTA Button ── */
          .cta-btn {
            display: inline-block;
            background: linear-gradient(135deg, ${primary}, ${accent});
            color: #fff;
            padding: 16px 40px;
            border-radius: 12px;
            font-size: 16px;
            font-weight: 700;
            transition: transform 0.2s, box-shadow 0.2s;
            border: none;
            cursor: pointer;
          }
          .cta-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 30px ${primary}44;
          }
          .cta-btn-outline {
            display: inline-block;
            border: 1px solid var(--border-hover);
            color: var(--muted);
            padding: 16px 40px;
            border-radius: 12px;
            font-size: 16px;
            font-weight: 600;
            transition: border-color 0.2s, background 0.2s;
          }
          .cta-btn-outline:hover {
            border-color: ${primary}66;
            background: ${primary}0a;
          }

          /* ── Footer ── */
          .site-footer {
            border-top: 1px solid var(--border);
            padding: 48px 20px;
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
          .site-footer-links a { color: var(--subtle); font-size: 13px; transition: color 0.2s; }
          .site-footer-links a:hover { color: var(--site-text); }
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
          .site-footer-copy a { color: ${primary}; }

          /* ── Responsive ── */
          @media (min-width: 640px) {
            .section { padding: 80px 24px; }
            .grid-cards {
              grid-template-columns: repeat(2, 1fr);
              gap: 20px;
            }
            .card, .product-card { padding: 24px; }
            .site-footer-inner { grid-template-columns: 2fr 1fr 1fr; }
            .site-footer-bottom { flex-direction: row; justify-content: space-between; }
          }

          @media (min-width: 768px) {
            .site-nav-links { display: flex; }
            .site-nav-cta { display: inline-block; }
            .site-nav-toggle { display: none; }
          }

          @media (min-width: 960px) {
            .grid-cards {
              grid-template-columns: repeat(3, 1fr);
            }
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

        {/* Mobile menu (needs client-side JS) */}
        <div id="mobile-menu" className="site-mobile-menu">
          <button className="site-mobile-close" aria-label="Close">×</button>
          {navLinks.map((link) => (
            <a key={link.href} href={link.href}>{link.label}</a>
          ))}
          <a href={`/site/${slug}/products`} className="cta-btn" style={{ marginTop: 24, textAlign: "center" }}>
            {cta.button_text || "Get Started"}
          </a>
        </div>

        {/* Page content */}
        {children}

        {/* Calendly widget (when URL is set) */}
        {calendlyUrl && (
          <section className="section" style={{ textAlign: "center" }}>
            <div style={{ maxWidth: 700, margin: "0 auto" }}>
              <h2 className="section-title" style={{ textAlign: "center", marginBottom: 8 }}>
                Book a Meeting
              </h2>
              <p style={{ color: "var(--faint)", marginBottom: 32, fontSize: 15 }}>
                Schedule a time that works for you
              </p>
              <div style={{ borderRadius: 12, overflow: "hidden", border: "1px solid var(--border)" }}>
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

        {/* Mobile menu toggle script */}
        <script dangerouslySetInnerHTML={{ __html: `
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
          })();
        `}} />
      </body>
    </html>
  );
}
