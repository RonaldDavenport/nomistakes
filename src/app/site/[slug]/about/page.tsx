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
  const about = site.site_content?.about || {};
  const values = site.brand?.values || [];

  return (
    <>
      {/* Hero */}
      <section style={{ padding: "80px 20px 40px", textAlign: "center", position: "relative" }}>
        <div style={{
          position: "absolute", width: 400, height: 400, top: -150,
          left: "50%", transform: "translateX(-50%)",
          background: `radial-gradient(circle, ${primary}15 0%, transparent 70%)`,
          pointerEvents: "none"
        }} />
        <div style={{ maxWidth: 700, margin: "0 auto", position: "relative", zIndex: 1 }}>
          <p style={{ color: primary, fontWeight: 600, fontSize: 14, marginBottom: 12, textTransform: "uppercase", letterSpacing: 1 }}>
            About Us
          </p>
          <h1 style={{
            fontSize: "clamp(1.75rem, 4.5vw, 3rem)", fontWeight: 800,
            lineHeight: 1.1, marginBottom: 16,
            fontFamily: "var(--site-heading-font)"
          }}>
            {about.title || `The Story Behind ${site.name}`}
          </h1>
          <p style={{ fontSize: "clamp(1rem, 2vw, 1.125rem)", color: "var(--faint)", lineHeight: 1.6 }}>
            {site.tagline}
          </p>
        </div>
      </section>

      {/* Story */}
      <section className="section">
        <div className="section-narrow">
          <p style={{ color: "var(--muted)", lineHeight: 1.8, whiteSpace: "pre-wrap", fontSize: "clamp(0.9rem, 2vw, 1rem)" }}>
            {about.text || `${site.name} was born from a simple idea: make ${site.type === "services" ? "professional services" : "great products"} accessible to everyone. We believe in quality, transparency, and putting our customers first.`}
          </p>
        </div>
      </section>

      {/* Mission */}
      {about.mission && (
        <section className="section" style={{ textAlign: "center" }}>
          <div className="section-narrow">
            <h2 className="section-title" style={{ textAlign: "center" }}>Our Mission</h2>
            <p style={{ color: "var(--muted)", lineHeight: 1.8, fontSize: 18 }}>
              {about.mission}
            </p>
          </div>
        </section>
      )}

      {/* Values */}
      {values.length > 0 && (
        <section className="section">
          <div className="section-inner">
            <h2 className="section-title section-title-center">Our Values</h2>
            <div className="grid-cards" style={{ maxWidth: 800, margin: "0 auto" }}>
              {values.map((value, i) => (
                <div key={i} className="card" style={{ textAlign: "center", padding: 32 }}>
                  <div style={{
                    width: 48, height: 48, borderRadius: 12, margin: "0 auto 16px",
                    background: `${primary}15`, border: `1px solid ${primary}25`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 20, fontWeight: 800, color: primary
                  }}>
                    {i + 1}
                  </div>
                  <h3 style={{ fontFamily: "var(--site-heading-font)", fontWeight: 600, marginBottom: 4 }}>{value}</h3>
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
            fontSize: "clamp(1.5rem, 4vw, 2rem)", fontWeight: 800,
            marginBottom: 16, fontFamily: "var(--site-heading-font)"
          }}>
            Ready to work with us?
          </h2>
          <p style={{ color: "var(--faint)", marginBottom: 32 }}>
            See what {site.name} can do for you.
          </p>
          <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
            <a href={`/site/${slug}/products`} className="cta-btn">
              View {site.type === "services" ? "Services" : "Products"}
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
