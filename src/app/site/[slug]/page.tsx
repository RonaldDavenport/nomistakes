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
  const layout = (business.layout as string) || "default";
  const colors = site.brand?.colors || {};
  const primary = colors.primary || "#4c6ef5";
  const hero = site.site_content?.hero || {};
  const about = site.site_content?.about || {};
  const features = site.site_content?.features || [];
  const products = site.site_content?.products || [];
  const testimonials = site.site_content?.testimonials || [];
  const cta = site.site_content?.cta || {};
  const faq = site.site_content?.faq || [];

  // ── Minimal Layout ──
  if (layout === "minimal") {
    return (
      <>
        {/* Hero — large type, single column */}
        <section style={{ padding: "100px 20px 60px", maxWidth: 680, margin: "0 auto" }}>
          <h1 style={{
            fontSize: "clamp(2.5rem, 6vw, 4rem)", fontWeight: 800,
            lineHeight: 1.05, marginBottom: 24,
            fontFamily: "var(--site-heading-font)"
          }}>
            {hero.headline || site.name}
          </h1>
          <p style={{
            fontSize: "clamp(1.05rem, 2.5vw, 1.25rem)",
            color: "var(--muted)", lineHeight: 1.7, marginBottom: 40
          }}>
            {hero.subheadline || site.tagline}
          </p>
          <a href={`/site/${slug}/products`} className="cta-btn">
            {cta.button_text || "Work With Me"}
          </a>
        </section>

        {/* About — prominent */}
        {about.text && (
          <section style={{ padding: "60px 20px", maxWidth: 680, margin: "0 auto", borderTop: "1px solid var(--border)" }}>
            <h2 style={{
              fontSize: "clamp(1.5rem, 3.5vw, 2rem)", fontWeight: 700,
              marginBottom: 20, fontFamily: "var(--site-heading-font)"
            }}>
              {about.title || `About ${site.name}`}
            </h2>
            <div style={{ color: "var(--muted)", lineHeight: 1.85, fontSize: "1.05rem" }}>
              {about.text.split("\n").map((p: string, i: number) => (
                <p key={i} style={{ marginBottom: 16 }}>{p}</p>
              ))}
            </div>
            {about.mission && (
              <p style={{ marginTop: 24, color: primary, fontWeight: 600, fontStyle: "italic" }}>
                {about.mission}
              </p>
            )}
          </section>
        )}

        {/* Offerings — simple list */}
        {products.length > 0 && (
          <section style={{ padding: "60px 20px", maxWidth: 680, margin: "0 auto", borderTop: "1px solid var(--border)" }}>
            <h2 style={{
              fontSize: "clamp(1.5rem, 3.5vw, 2rem)", fontWeight: 700,
              marginBottom: 32, fontFamily: "var(--site-heading-font)"
            }}>
              How I Can Help
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              {products.map((p: { name: string; desc: string; price: string }, i: number) => (
                <div key={i} style={{ paddingBottom: 24, borderBottom: i < products.length - 1 ? "1px solid var(--border)" : "none" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
                    <h3 style={{ fontSize: "1.125rem", fontWeight: 600 }}>{p.name}</h3>
                    <span style={{ color: primary, fontWeight: 700, fontSize: 14 }}>{p.price}</span>
                  </div>
                  <p style={{ color: "var(--muted)", lineHeight: 1.7, fontSize: 14 }}>{p.desc}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* CTA */}
        <section style={{ padding: "60px 20px", maxWidth: 680, margin: "0 auto", textAlign: "center", borderTop: "1px solid var(--border)" }}>
          <h2 style={{
            fontSize: "clamp(1.5rem, 3.5vw, 2rem)", fontWeight: 800,
            marginBottom: 16, fontFamily: "var(--site-heading-font)"
          }}>
            {cta.headline || "Let\u2019s work together"}
          </h2>
          <p style={{ color: "var(--muted)", marginBottom: 32 }}>
            {cta.subheadline || site.tagline}
          </p>
          <a href={`/site/${slug}/contact`} className="cta-btn">
            {cta.button_text || "Get In Touch"}
          </a>
        </section>
      </>
    );
  }

  // ── Creator Layout ──
  if (layout === "creator") {
    const featured = products[0];
    const restProducts = products.slice(1);
    return (
      <>
        {/* Hero with featured product */}
        <section style={{ padding: "80px 20px 60px", textAlign: "center", position: "relative" }}>
          <div style={{
            position: "absolute", width: 600, height: 600, top: -250,
            left: "50%", transform: "translateX(-50%)",
            background: `radial-gradient(circle, ${primary}18 0%, transparent 70%)`,
            pointerEvents: "none"
          }} />
          <div style={{ maxWidth: 700, margin: "0 auto", position: "relative", zIndex: 1 }}>
            <h1 style={{
              fontSize: "clamp(2rem, 5vw, 3.25rem)", fontWeight: 800,
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
          </div>
        </section>

        {/* Featured product */}
        {featured && (
          <section className="section">
            <div style={{
              maxWidth: 800, margin: "0 auto", padding: "0 20px",
              display: "grid", gridTemplateColumns: "1fr", gap: 32
            }}>
              <div className="card" style={{ padding: 32 }}>
                <span style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "0.1em", color: primary, fontWeight: 700, marginBottom: 8, display: "block" }}>
                  Featured
                </span>
                <h2 style={{ fontSize: "clamp(1.5rem, 3vw, 2rem)", fontWeight: 800, marginBottom: 12, fontFamily: "var(--site-heading-font)" }}>
                  {featured.name}
                </h2>
                <p style={{ color: "var(--muted)", lineHeight: 1.7, marginBottom: 20 }}>{featured.desc}</p>
                {featured.features && (
                  <ul style={{ listStyle: "none", padding: 0, marginBottom: 24 }}>
                    {featured.features.map((f: string, i: number) => (
                      <li key={i} style={{ color: "var(--muted)", fontSize: 14, padding: "6px 0", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ color: primary }}>&#10003;</span> {f}
                      </li>
                    ))}
                  </ul>
                )}
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <a href={`/site/${slug}/products`} className="cta-btn">{cta.button_text || "Get Started"}</a>
                  <span style={{ fontSize: "1.5rem", fontWeight: 800, color: primary }}>{featured.price}</span>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Product grid */}
        {restProducts.length > 0 && (
          <section className="section">
            <div className="section-inner">
              <h2 className="section-title section-title-center">More Products</h2>
              <div className="grid-cards">
                {restProducts.map((p: { name: string; desc: string; price: string; features?: string[] }, i: number) => (
                  <div key={i} className="card">
                    <h3 style={{ marginBottom: 8 }}>{p.name}</h3>
                    <p style={{ color: "var(--muted)", fontSize: 14, lineHeight: 1.6, marginBottom: 16 }}>{p.desc}</p>
                    <p style={{ color: primary, fontWeight: 700 }}>{p.price}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Social proof */}
        {testimonials.length > 0 && (
          <section className="section" style={{ textAlign: "center" }}>
            <div className="section-inner">
              <h2 className="section-title section-title-center">What Customers Say</h2>
              <div className="grid-cards">
                {testimonials.map((t, i) => (
                  <div key={i} className="card" style={{ textAlign: "left" }}>
                    <div style={{ marginBottom: 12 }}>
                      {"★★★★★".split("").map((star, si) => (
                        <span key={si} style={{ color: primary, fontSize: 14 }}>{star}</span>
                      ))}
                    </div>
                    <p style={{ color: "var(--muted)", fontSize: 14, lineHeight: 1.6, marginBottom: 16, fontStyle: "italic" }}>
                      &ldquo;{t.text}&rdquo;
                    </p>
                    <p style={{ fontWeight: 600, fontSize: 14 }}>{t.name}</p>
                    <p style={{ color: "var(--subtle)", fontSize: 12 }}>{t.role}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* FAQ */}
        {faq.length > 0 && (
          <section className="section">
            <div style={{ maxWidth: 680, margin: "0 auto", padding: "0 20px" }}>
              <h2 className="section-title section-title-center">Frequently Asked Questions</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {faq.map((item: { question: string; answer: string }, i: number) => (
                  <div key={i} style={{ padding: 20, borderRadius: 12, border: "1px solid var(--border)", background: "var(--card-bg)" }}>
                    <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 8 }}>{item.question}</h3>
                    <p style={{ color: "var(--muted)", fontSize: 14, lineHeight: 1.7 }}>{item.answer}</p>
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
              {cta.headline || `Ready to get started?`}
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

  // ── Default Layout ──
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
