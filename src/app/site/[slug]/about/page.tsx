import { createServerClient } from "@/lib/supabase";
import { notFound } from "next/navigation";
import type { SiteData } from "../layout";

export default async function SiteAboutPage({ params }: { params: Promise<{ slug: string }> }) {
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
  const about = site.site_content?.about || {};
  const values = site.brand?.values || [];

  return (
    <>
      {/* Hero */}
      <section style={{ padding: "100px 20px 60px", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div className="hero-blob" style={{ width: 500, height: 500, background: primary, top: -250, left: "40%", opacity: 0.12, filter: "blur(120px)" }} />
        <div style={{ maxWidth: 700, margin: "0 auto", position: "relative", zIndex: 1 }}>
          <p className="reveal" style={{
            display: "inline-block", padding: "8px 20px", borderRadius: 100,
            background: `${primary}12`, border: `1px solid ${primary}20`,
            color: primary, fontWeight: 600, fontSize: 13, marginBottom: 24,
            textTransform: "uppercase", letterSpacing: "0.08em",
          }}>
            About Us
          </p>
          <h1 className="reveal reveal-delay-1" style={{
            fontSize: "clamp(2rem, 5vw, 3.25rem)", fontWeight: 800,
            lineHeight: 1.08, marginBottom: 20,
            fontFamily: "var(--site-heading-font)"
          }}>
            {about.title || `The Story Behind ${site.name}`}
          </h1>
          <p className="reveal reveal-delay-2" style={{ fontSize: "clamp(1rem, 2vw, 1.125rem)", color: "var(--faint)", lineHeight: 1.6 }}>
            {site.tagline}
          </p>
        </div>
      </section>

      {/* Story */}
      <section className="section">
        <div className="section-narrow">
          <div className="reveal" style={{ color: "var(--muted)", lineHeight: 2, fontSize: "clamp(0.95rem, 2vw, 1.05rem)" }}>
            {(about.text || `${site.name} was born from a simple idea: make ${site.type === "services" ? "professional services" : "great products"} accessible to everyone. We believe in quality, transparency, and putting our customers first.`).split("\n").map((p: string, i: number) => (
              <p key={i} style={{ marginBottom: 20 }}>{p}</p>
            ))}
          </div>
        </div>
      </section>

      {/* Mission */}
      {about.mission && (
        <section className="section" style={{ textAlign: "center" }}>
          <div className="section-narrow">
            <h2 className="reveal section-title" style={{ textAlign: "center" }}>Our Mission</h2>
            <div className="reveal reveal-delay-1" style={{
              padding: "32px 36px",
              borderRadius: 16,
              borderLeft: `4px solid ${primary}`,
              background: `${primary}06`,
              textAlign: "left",
            }}>
              <p style={{ color: "var(--muted)", lineHeight: 1.8, fontSize: 17, fontStyle: "italic" }}>
                {about.mission}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Values */}
      {values.length > 0 && (
        <section className="section">
          <div className="section-inner">
            <h2 className="reveal section-title section-title-center">Our Values</h2>
            <div className="grid-cards" style={{ maxWidth: 800, margin: "0 auto" }}>
              {values.map((value: string, i: number) => (
                <div key={i} className={`reveal glass-card reveal-delay-${Math.min(i + 1, 5)}`} style={{ textAlign: "center", padding: 32 }}>
                  <div className="feature-icon" style={{ margin: "0 auto 16px" }}>
                    {["✦", "◆", "▲", "●", "★", "◉"][i % 6]}
                  </div>
                  <h3 style={{ fontFamily: "var(--site-heading-font)", fontWeight: 600 }}>{value}</h3>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="section" style={{ textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div className="hero-blob" style={{ width: 300, height: 300, background: accent, bottom: -100, left: "20%", opacity: 0.15, filter: "blur(80px)" }} />
        <div style={{ maxWidth: 600, margin: "0 auto", position: "relative", zIndex: 1 }}>
          <h2 className="reveal" style={{
            fontSize: "clamp(1.5rem, 4vw, 2.25rem)", fontWeight: 800,
            marginBottom: 16, fontFamily: "var(--site-heading-font)"
          }}>
            Ready to work with us?
          </h2>
          <p className="reveal reveal-delay-1" style={{ color: "var(--faint)", marginBottom: 36 }}>
            See what {site.name} can do for you.
          </p>
          <div className="reveal reveal-delay-2" style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
            <a href={`/site/${slug}/products`} className="cta-btn">
              <span>View {site.type === "services" ? "Services" : "Products"}</span>
            </a>
            <a href={`/site/${slug}/contact`} className="cta-btn-outline">
              Get in Touch
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
