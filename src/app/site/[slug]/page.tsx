import { createServerClient } from "@/lib/supabase";
import { notFound } from "next/navigation";

interface SiteData {
  name: string;
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
    about?: { title?: string; text?: string };
    features?: { title: string; desc: string }[];
    products?: { name: string; desc: string; price: string }[];
    testimonials?: { name: string; role: string; text: string }[];
    cta?: { headline?: string; subheadline?: string; button_text?: string };
    seo?: { title?: string; description?: string };
  };
}

export default async function SitePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const db = createServerClient();

  const { data: business } = await db
    .from("businesses")
    .select("*")
    .eq("slug", slug)
    .eq("status", "live")
    .single();

  if (!business) {
    notFound();
  }

  const site = business as SiteData;
  const colors = site.brand?.colors || {};
  const primary = colors.primary || "#4c6ef5";
  const bg = colors.background || "#0a0a0f";
  const textColor = colors.text || "#e4e4e7";
  const accent = colors.accent || "#9775fa";
  const hero = site.site_content?.hero || {};
  const about = site.site_content?.about || {};
  const features = site.site_content?.features || [];
  const products = site.site_content?.products || [];
  const testimonials = site.site_content?.testimonials || [];
  const cta = site.site_content?.cta || {};
  const fonts = site.brand?.fonts || {};

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
          a { text-decoration: none; }
          img { max-width: 100%; height: auto; }

          .site-nav {
            border-bottom: 1px solid rgba(255,255,255,0.05);
            padding: 16px 24px;
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
          }
          .site-nav-brand {
            font-size: 20px;
            font-weight: 800;
            font-family: ${fonts.heading ? `"${fonts.heading}"` : "inherit"};
          }
          .site-nav-cta {
            background: ${primary};
            color: #fff;
            padding: 10px 24px;
            border-radius: 10px;
            font-size: 14px;
            font-weight: 600;
          }

          .hero-section {
            padding: 80px 20px 60px;
            text-align: center;
            position: relative;
          }
          .hero-glow {
            position: absolute;
            width: 500px;
            height: 500px;
            top: -200px;
            left: 50%;
            transform: translateX(-50%);
            background: radial-gradient(circle, ${primary}22 0%, transparent 70%);
            pointer-events: none;
          }
          .hero-inner {
            max-width: 700px;
            margin: 0 auto;
            position: relative;
            z-index: 1;
          }
          .hero-heading {
            font-size: clamp(1.75rem, 5vw, 3.5rem);
            font-weight: 800;
            line-height: 1.1;
            margin-bottom: 16px;
            font-family: ${fonts.heading ? `"${fonts.heading}"` : "inherit"};
          }
          .hero-sub {
            font-size: clamp(1rem, 2.5vw, 1.125rem);
            color: rgba(255,255,255,0.6);
            line-height: 1.6;
            margin-bottom: 32px;
          }
          .cta-btn {
            display: inline-block;
            background: linear-gradient(135deg, ${primary}, ${accent});
            color: #fff;
            padding: 16px 40px;
            border-radius: 12px;
            font-size: 16px;
            font-weight: 700;
            transition: transform 0.2s, box-shadow 0.2s;
          }
          .cta-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 30px ${primary}44;
          }

          .section {
            padding: 60px 20px;
            border-top: 1px solid rgba(255,255,255,0.05);
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
            margin-bottom: 32px;
            font-family: ${fonts.heading ? `"${fonts.heading}"` : "inherit"};
          }
          .section-title-center {
            text-align: center;
            margin-bottom: 40px;
          }

          .grid-cards {
            display: grid;
            grid-template-columns: 1fr;
            gap: 16px;
          }
          .card {
            padding: 20px;
            border-radius: 12px;
            border: 1px solid rgba(255,255,255,0.05);
            background: rgba(255,255,255,0.02);
          }
          .card h3 { font-weight: 600; margin-bottom: 8px; }
          .card p { color: rgba(255,255,255,0.5); font-size: 14px; line-height: 1.6; }

          .product-card {
            padding: 20px;
            border-radius: 12px;
            border: 1px solid ${primary}33;
            background: ${primary}08;
          }
          .product-card h3 { font-weight: 700; margin-bottom: 4px; }
          .product-card .price { color: ${primary}; font-weight: 600; font-size: 14px; margin-bottom: 12px; }
          .product-card p { color: rgba(255,255,255,0.5); font-size: 14px; line-height: 1.6; }

          .testimonial-card {
            padding: 20px;
            border-radius: 12px;
            border: 1px solid rgba(255,255,255,0.05);
            background: rgba(255,255,255,0.02);
          }
          .testimonial-card .quote {
            color: rgba(255,255,255,0.6);
            font-size: 14px;
            line-height: 1.6;
            margin-bottom: 16px;
            font-style: italic;
          }
          .testimonial-card .author { font-weight: 600; font-size: 14px; }
          .testimonial-card .role { color: rgba(255,255,255,0.4); font-size: 12px; }

          .cta-section {
            padding: 60px 20px;
            border-top: 1px solid rgba(255,255,255,0.05);
            text-align: center;
          }
          .cta-section-inner {
            max-width: 600px;
            margin: 0 auto;
          }
          .cta-heading {
            font-size: clamp(1.5rem, 4vw, 2.25rem);
            font-weight: 800;
            margin-bottom: 16px;
            font-family: ${fonts.heading ? `"${fonts.heading}"` : "inherit"};
          }
          .cta-sub {
            color: rgba(255,255,255,0.5);
            margin-bottom: 32px;
          }

          .site-footer {
            border-top: 1px solid rgba(255,255,255,0.05);
            padding: 40px 20px;
            text-align: center;
          }
          .site-footer p { color: rgba(255,255,255,0.3); font-size: 12px; }
          .site-footer a { color: ${primary}; }

          .about-text {
            color: rgba(255,255,255,0.6);
            line-height: 1.8;
            white-space: pre-wrap;
          }

          /* Tablet and up */
          @media (min-width: 640px) {
            .hero-section { padding: 100px 24px 80px; }
            .section { padding: 80px 24px; }
            .cta-section { padding: 80px 24px; }
            .site-footer { padding: 40px 24px; }
            .grid-cards {
              grid-template-columns: repeat(2, 1fr);
              gap: 20px;
            }
            .card, .product-card, .testimonial-card { padding: 24px; }
          }

          /* Desktop */
          @media (min-width: 960px) {
            .grid-cards {
              grid-template-columns: repeat(3, 1fr);
            }
          }
        `}} />
      </head>
      <body>
        {/* Nav */}
        <nav className="site-nav">
          <div className="site-nav-inner">
            <span className="site-nav-brand">{site.name}</span>
            <a href="#cta" className="site-nav-cta">Get Started</a>
          </div>
        </nav>

        {/* Hero */}
        <section className="hero-section">
          <div className="hero-glow" />
          <div className="hero-inner">
            <h1 className="hero-heading">{hero.headline || site.name}</h1>
            <p className="hero-sub">{hero.subheadline || site.tagline}</p>
            <a href="#cta" className="cta-btn">{cta.button_text || "Get Started"}</a>
          </div>
        </section>

        {/* About */}
        {about.text && (
          <section className="section">
            <div className="section-narrow">
              <h2 className="section-title">{about.title || "About"}</h2>
              <p className="about-text">{about.text}</p>
            </div>
          </section>
        )}

        {/* Features */}
        {features.length > 0 && (
          <section className="section">
            <div className="section-inner">
              <h2 className="section-title section-title-center">What We Offer</h2>
              <div className="grid-cards">
                {features.map((f, i) => (
                  <div key={i} className="card">
                    <h3>{f.title}</h3>
                    <p>{f.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Products */}
        {products.length > 0 && (
          <section className="section">
            <div className="section-inner">
              <h2 className="section-title section-title-center">
                {site.type === "services" ? "Our Services" : "Our Products"}
              </h2>
              <div className="grid-cards">
                {products.map((p, i) => (
                  <div key={i} className="product-card">
                    <h3>{p.name}</h3>
                    <p className="price">{p.price}</p>
                    <p>{p.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Testimonials */}
        {testimonials.length > 0 && (
          <section className="section">
            <div className="section-inner">
              <h2 className="section-title section-title-center">What People Say</h2>
              <div className="grid-cards">
                {testimonials.map((t, i) => (
                  <div key={i} className="testimonial-card">
                    <p className="quote">&ldquo;{t.text}&rdquo;</p>
                    <div>
                      <p className="author">{t.name}</p>
                      <p className="role">{t.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* CTA */}
        <section id="cta" className="cta-section">
          <div className="cta-section-inner">
            <h2 className="cta-heading">{cta.headline || `Ready to start with ${site.name}?`}</h2>
            <p className="cta-sub">{cta.subheadline || site.tagline}</p>
            <a href="#" className="cta-btn">{cta.button_text || "Get Started Now"}</a>
          </div>
        </section>

        {/* Footer */}
        <footer className="site-footer">
          <p>
            &copy; 2026 {site.name}. Built with <a href="https://nomistakes.vercel.app">No Mistakes</a>.
          </p>
        </footer>
      </body>
    </html>
  );
}
