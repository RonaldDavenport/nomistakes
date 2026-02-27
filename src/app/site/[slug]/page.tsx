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
        <title>{site.site_content?.seo?.title || site.name}</title>
        <meta name="description" content={site.site_content?.seo?.description || site.tagline} />
        {fonts.heading && (
          <link
            href={`https://fonts.googleapis.com/css2?family=${encodeURIComponent(fonts.heading)}:wght@400;600;700;800&family=${encodeURIComponent(fonts.body || "Inter")}:wght@400;500;600&display=swap`}
            rel="stylesheet"
          />
        )}
      </head>
      <body style={{ background: bg, color: textColor, fontFamily: fonts.body ? `"${fonts.body}", system-ui, sans-serif` : '"Inter", system-ui, sans-serif' }}>
        {/* Nav */}
        <nav style={{ borderBottom: "1px solid rgba(255,255,255,0.05)", padding: "16px 24px", position: "sticky", top: 0, background: `${bg}ee`, backdropFilter: "blur(16px)", zIndex: 50 }}>
          <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 20, fontWeight: 800, fontFamily: fonts.heading ? `"${fonts.heading}"` : "inherit" }}>
              {site.name}
            </span>
            <a href="#cta" style={{ background: primary, color: "#fff", padding: "10px 24px", borderRadius: 10, fontSize: 14, fontWeight: 600, textDecoration: "none" }}>
              Get Started
            </a>
          </div>
        </nav>

        {/* Hero */}
        <section style={{ padding: "100px 24px 80px", textAlign: "center", position: "relative" }}>
          <div style={{ position: "absolute", width: 500, height: 500, top: -200, left: "50%", transform: "translateX(-50%)", background: `radial-gradient(circle, ${primary}22 0%, transparent 70%)`, pointerEvents: "none" }} />
          <div style={{ maxWidth: 700, margin: "0 auto", position: "relative", zIndex: 1 }}>
            <h1 style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)", fontWeight: 800, lineHeight: 1.1, marginBottom: 16, fontFamily: fonts.heading ? `"${fonts.heading}"` : "inherit" }}>
              {hero.headline || site.name}
            </h1>
            <p style={{ fontSize: 18, color: "rgba(255,255,255,0.6)", lineHeight: 1.6, marginBottom: 32 }}>
              {hero.subheadline || site.tagline}
            </p>
            <a href="#cta" style={{ display: "inline-block", background: `linear-gradient(135deg, ${primary}, ${accent})`, color: "#fff", padding: "16px 40px", borderRadius: 12, fontSize: 16, fontWeight: 700, textDecoration: "none" }}>
              {cta.button_text || "Get Started"}
            </a>
          </div>
        </section>

        {/* About */}
        {about.text && (
          <section style={{ padding: "80px 24px", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
            <div style={{ maxWidth: 800, margin: "0 auto" }}>
              <h2 style={{ fontSize: 32, fontWeight: 700, marginBottom: 16, fontFamily: fonts.heading ? `"${fonts.heading}"` : "inherit" }}>
                {about.title || "About"}
              </h2>
              <p style={{ color: "rgba(255,255,255,0.6)", lineHeight: 1.8, whiteSpace: "pre-wrap" }}>
                {about.text}
              </p>
            </div>
          </section>
        )}

        {/* Features */}
        {features.length > 0 && (
          <section style={{ padding: "80px 24px", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
            <div style={{ maxWidth: 1000, margin: "0 auto" }}>
              <h2 style={{ fontSize: 32, fontWeight: 700, marginBottom: 40, textAlign: "center", fontFamily: fonts.heading ? `"${fonts.heading}"` : "inherit" }}>
                What We Offer
              </h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 }}>
                {features.map((f, i) => (
                  <div key={i} style={{ padding: 24, borderRadius: 12, border: "1px solid rgba(255,255,255,0.05)", background: "rgba(255,255,255,0.02)" }}>
                    <h3 style={{ fontWeight: 600, marginBottom: 8 }}>{f.title}</h3>
                    <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 14, lineHeight: 1.6 }}>{f.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Products */}
        {products.length > 0 && (
          <section style={{ padding: "80px 24px", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
            <div style={{ maxWidth: 1000, margin: "0 auto" }}>
              <h2 style={{ fontSize: 32, fontWeight: 700, marginBottom: 40, textAlign: "center", fontFamily: fonts.heading ? `"${fonts.heading}"` : "inherit" }}>
                {site.type === "services" ? "Our Services" : "Our Products"}
              </h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 }}>
                {products.map((p, i) => (
                  <div key={i} style={{ padding: 24, borderRadius: 12, border: `1px solid ${primary}33`, background: `${primary}08` }}>
                    <h3 style={{ fontWeight: 700, marginBottom: 4 }}>{p.name}</h3>
                    <p style={{ color: primary, fontWeight: 600, fontSize: 14, marginBottom: 12 }}>{p.price}</p>
                    <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 14, lineHeight: 1.6 }}>{p.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Testimonials */}
        {testimonials.length > 0 && (
          <section style={{ padding: "80px 24px", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
            <div style={{ maxWidth: 1000, margin: "0 auto" }}>
              <h2 style={{ fontSize: 32, fontWeight: 700, marginBottom: 40, textAlign: "center", fontFamily: fonts.heading ? `"${fonts.heading}"` : "inherit" }}>
                What People Say
              </h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 }}>
                {testimonials.map((t, i) => (
                  <div key={i} style={{ padding: 24, borderRadius: 12, border: "1px solid rgba(255,255,255,0.05)", background: "rgba(255,255,255,0.02)" }}>
                    <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 14, lineHeight: 1.6, marginBottom: 16, fontStyle: "italic" }}>
                      &ldquo;{t.text}&rdquo;
                    </p>
                    <div>
                      <p style={{ fontWeight: 600, fontSize: 14 }}>{t.name}</p>
                      <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 12 }}>{t.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* CTA */}
        <section id="cta" style={{ padding: "80px 24px", borderTop: "1px solid rgba(255,255,255,0.05)", textAlign: "center" }}>
          <div style={{ maxWidth: 600, margin: "0 auto" }}>
            <h2 style={{ fontSize: 36, fontWeight: 800, marginBottom: 16, fontFamily: fonts.heading ? `"${fonts.heading}"` : "inherit" }}>
              {cta.headline || `Ready to start with ${site.name}?`}
            </h2>
            <p style={{ color: "rgba(255,255,255,0.5)", marginBottom: 32 }}>
              {cta.subheadline || site.tagline}
            </p>
            <a href="#" style={{ display: "inline-block", background: `linear-gradient(135deg, ${primary}, ${accent})`, color: "#fff", padding: "16px 48px", borderRadius: 12, fontSize: 16, fontWeight: 700, textDecoration: "none" }}>
              {cta.button_text || "Get Started Now"}
            </a>
          </div>
        </section>

        {/* Footer */}
        <footer style={{ borderTop: "1px solid rgba(255,255,255,0.05)", padding: "40px 24px", textAlign: "center" }}>
          <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 12 }}>
            &copy; 2026 {site.name}. Built with <a href="https://nomistakes.vercel.app" style={{ color: primary, textDecoration: "none" }}>No Mistakes</a>.
          </p>
        </footer>
      </body>
    </html>
  );
}
