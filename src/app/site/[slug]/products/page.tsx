import { createServerClient } from "@/lib/supabase";
import { notFound } from "next/navigation";
import type { SiteData } from "../layout";

export default async function SiteProductsPage({ params }: { params: Promise<{ slug: string }> }) {
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
  const products = site.site_content?.products || [];
  const features = site.site_content?.features || [];
  const faq = site.site_content?.faq || [];
  const isServices = site.type === "services";

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
            {isServices ? "Our Services" : "Our Products"}
          </p>
          <h1 style={{
            fontSize: "clamp(1.75rem, 4.5vw, 3rem)", fontWeight: 800,
            lineHeight: 1.1, marginBottom: 16,
            fontFamily: "var(--site-heading-font)"
          }}>
            {isServices ? "What We Can Do For You" : "Browse Our Collection"}
          </h1>
          <p style={{ fontSize: "clamp(1rem, 2vw, 1.125rem)", color: "rgba(255,255,255,0.5)", lineHeight: 1.6 }}>
            {isServices
              ? "Professional services tailored to your needs. Quality and results guaranteed."
              : "Carefully curated products designed to deliver real value."}
          </p>
        </div>
      </section>

      {/* Products / Services grid */}
      {products.length > 0 && (
        <section className="section">
          <div className="section-inner">
            <div className="grid-cards">
              {products.map((p, i) => (
                <div key={i} className="product-card">
                  <h3>{p.name}</h3>
                  <p className="price">{p.price}</p>
                  <p>{p.desc}</p>
                  {p.features && p.features.length > 0 && (
                    <ul className="product-features">
                      {p.features.map((feat, fi) => (
                        <li key={fi}>{feat}</li>
                      ))}
                    </ul>
                  )}
                  <button className="product-btn">
                    {isServices ? "Book Now" : "Buy Now"}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Why choose us */}
      {features.length > 0 && (
        <section className="section">
          <div className="section-inner">
            <h2 className="section-title section-title-center">Why {site.name}?</h2>
            <div className="grid-cards">
              {features.slice(0, 6).map((f, i) => (
                <div key={i} className="card" style={{ textAlign: "center" }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: 10, margin: "0 auto 12px",
                    background: `${primary}15`, border: `1px solid ${primary}20`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontWeight: 700, color: primary, fontSize: 16
                  }}>
                    {i + 1}
                  </div>
                  <h3>{f.title}</h3>
                  <p>{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FAQ */}
      {faq.length > 0 && (
        <section className="section">
          <div className="section-narrow">
            <h2 className="section-title section-title-center">Frequently Asked Questions</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {faq.map((item, i) => (
                <div key={i} className="card">
                  <h3 style={{ marginBottom: 8, fontSize: 15 }}>{item.question}</h3>
                  <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 14, lineHeight: 1.6 }}>{item.answer}</p>
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
            Have questions?
          </h2>
          <p style={{ color: "rgba(255,255,255,0.5)", marginBottom: 32 }}>
            We&apos;d love to hear from you. Reach out anytime.
          </p>
          <a href={`/site/${slug}/contact`} className="cta-btn">
            Contact Us
          </a>
        </div>
      </section>
    </>
  );
}
