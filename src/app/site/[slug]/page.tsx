import { createServerClient } from "@/lib/supabase";
import { notFound } from "next/navigation";
import type { SiteData } from "./layout";

export default async function SiteHomePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const db = createServerClient();

  const { data: business } = await db
    .from("businesses")
    .select("*")
    .eq("slug", slug)
    .eq("status", "live")
    .single();

  if (!business) notFound();

  const site = business as SiteData;
  const colors = site.brand?.colors || {};
  const primary = colors.primary || "#4c6ef5";
  const accent = colors.accent || "#9775fa";
  const hero = site.site_content?.hero || {};
  const about = site.site_content?.about || {};
  const features = site.site_content?.features || [];
  const testimonials = site.site_content?.testimonials || [];
  const cta = site.site_content?.cta || {};

  return (
    <>
      {/* Hero */}
      <section style={{ padding: "80px 20px 60px", textAlign: "center", position: "relative" }}>
        <div style={{
          position: "absolute", width: 500, height: 500, top: -200,
          left: "50%", transform: "translateX(-50%)",
          background: `radial-gradient(circle, ${primary}22 0%, transparent 70%)`,
          pointerEvents: "none"
        }} />
        <div style={{ maxWidth: 700, margin: "0 auto", position: "relative", zIndex: 1 }}>
          <h1 style={{
            fontSize: "clamp(2rem, 5vw, 3.5rem)", fontWeight: 800,
            lineHeight: 1.1, marginBottom: 16,
            fontFamily: "var(--site-heading-font)"
          }}>
            {hero.headline || site.name}
          </h1>
          <p style={{
            fontSize: "clamp(1rem, 2.5vw, 1.125rem)",
            color: "var(--muted)", lineHeight: 1.6, marginBottom: 32
          }}>
            {hero.subheadline || site.tagline}
          </p>
          <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
            <a href={`/site/${slug}/products`} className="cta-btn">
              {cta.button_text || "Get Started"}
            </a>
            <a href={`/site/${slug}/about`} className="cta-btn-outline">
              Learn More
            </a>
          </div>
        </div>
      </section>

      {/* Trust bar */}
      <section style={{ padding: "40px 20px", borderTop: "1px solid var(--border)", textAlign: "center" }}>
        <div style={{ display: "flex", justifyContent: "center", gap: "clamp(24px, 5vw, 48px)", flexWrap: "wrap" }}>
          {[
            { label: "Trusted by customers", value: "500+" },
            { label: "5-star reviews", value: "4.9/5" },
            { label: "Satisfaction guaranteed", value: "100%" },
          ].map((stat) => (
            <div key={stat.label} style={{ textAlign: "center" }}>
              <p style={{ fontSize: "clamp(1.25rem, 3vw, 1.75rem)", fontWeight: 800, color: primary }}>{stat.value}</p>
              <p style={{ fontSize: 13, color: "var(--subtle)" }}>{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      {features.length > 0 && (
        <section className="section">
          <div className="section-inner">
            <h2 className="section-title section-title-center">Why Choose {site.name}</h2>
            <p className="section-subtitle">Everything you need, nothing you don&apos;t.</p>
            <div className="grid-cards">
              {features.slice(0, 6).map((f, i) => (
                <div key={i} className="card">
                  <h3>{f.title}</h3>
                  <p>{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* About preview */}
      {about.text && (
        <section className="section">
          <div className="section-narrow" style={{ textAlign: "center" }}>
            <h2 className="section-title" style={{ textAlign: "center" }}>
              {about.title || `About ${site.name}`}
            </h2>
            <p style={{ color: "var(--muted)", lineHeight: 1.8, marginBottom: 24 }}>
              {about.text.length > 300 ? about.text.slice(0, 300) + "..." : about.text}
            </p>
            <a href={`/site/${slug}/about`} style={{ color: primary, fontWeight: 600, fontSize: 14 }}>
              Read our full story →
            </a>
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
                <div key={i} className="card">
                  <div style={{ marginBottom: 12 }}>
                    {"★★★★★".split("").map((star, si) => (
                      <span key={si} style={{ color: primary, fontSize: 14 }}>{star}</span>
                    ))}
                  </div>
                  <p style={{ color: "var(--muted)", fontSize: 14, lineHeight: 1.6, marginBottom: 16, fontStyle: "italic" }}>
                    &ldquo;{t.text}&rdquo;
                  </p>
                  <div>
                    <p style={{ fontWeight: 600, fontSize: 14 }}>{t.name}</p>
                    <p style={{ color: "var(--subtle)", fontSize: 12 }}>{t.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="section" style={{ textAlign: "center" }}>
        <div style={{ maxWidth: 600, margin: "0 auto" }}>
          <h2 style={{
            fontSize: "clamp(1.5rem, 4vw, 2.25rem)", fontWeight: 800,
            marginBottom: 16, fontFamily: "var(--site-heading-font)"
          }}>
            {cta.headline || `Ready to get started with ${site.name}?`}
          </h2>
          <p style={{ color: "var(--faint)", marginBottom: 32 }}>
            {cta.subheadline || site.tagline}
          </p>
          <a href={`/site/${slug}/products`} className="cta-btn">
            {cta.button_text || "Get Started Now"}
          </a>
        </div>
      </section>
    </>
  );
}
