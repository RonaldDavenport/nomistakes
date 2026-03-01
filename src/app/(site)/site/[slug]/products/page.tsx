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
  const primary = colors.primary || "#7B39FC";
  const accent = colors.accent || "#A855F7";
  const products = site.site_content?.products || [];
  const features = site.site_content?.features || [];
  const faq = site.site_content?.faq || [];
  const isServices = site.type === "services";

  return (
    <>
      {/* Hero */}
      <section style={{ padding: "100px 20px 60px", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div className="hero-blob" style={{ width: 400, height: 400, background: primary, top: -200, left: "30%", opacity: 0.15, filter: "blur(100px)" }} />
        <div style={{ maxWidth: 700, margin: "0 auto", position: "relative", zIndex: 1 }}>
          <p className="reveal" style={{
            display: "inline-block", padding: "8px 20px", borderRadius: 100,
            background: `${primary}12`, border: `1px solid ${primary}20`,
            color: primary, fontWeight: 600, fontSize: 13, marginBottom: 24,
            textTransform: "uppercase", letterSpacing: "0.08em",
          }}>
            {isServices ? "Our Services" : "Our Products"}
          </p>
          <h1 className="reveal reveal-delay-1" style={{
            fontSize: "clamp(2rem, 5vw, 3.25rem)", fontWeight: 800,
            lineHeight: 1.08, marginBottom: 20,
            fontFamily: "var(--site-heading-font)"
          }}>
            {isServices ? "What We Can Do For You" : "Browse Our Collection"}
          </h1>
          <p className="reveal reveal-delay-2" style={{ fontSize: "clamp(1rem, 2vw, 1.125rem)", color: "var(--faint)", lineHeight: 1.6 }}>
            {isServices
              ? "Professional services tailored to your needs. Quality and results guaranteed."
              : "Carefully curated products designed to deliver real value."}
          </p>
        </div>
      </section>

      {/* Products grid */}
      {products.length > 0 && (
        <section className="section">
          <div className="section-inner">
            <div className="grid-cards">
              {products.map((p, i) => (
                <div key={i} className={`reveal product-card reveal-delay-${Math.min(i + 1, 5)}`}>
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
            <h2 className="reveal section-title section-title-center">Why {site.name}?</h2>
            <div className="grid-cards">
              {features.slice(0, 6).map((f, i) => (
                <div key={i} className={`reveal glass-card reveal-delay-${Math.min(i + 1, 5)}`} style={{ textAlign: "center" }}>
                  <div className="feature-icon" style={{ margin: "0 auto 16px" }}>
                    {["✦", "◆", "▲", "●", "★", "◉"][i % 6]}
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
            <h2 className="reveal section-title section-title-center">Frequently Asked Questions</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {faq.map((item, i) => (
                <div key={i} className={`reveal faq-item reveal-delay-${Math.min(i + 1, 5)}`}>
                  <h3 style={{ marginBottom: 10, fontSize: 15, fontWeight: 600, fontFamily: "var(--site-heading-font)" }}>{item.question}</h3>
                  <p style={{ color: "var(--faint)", fontSize: 14, lineHeight: 1.7 }}>{item.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="section" style={{ textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div className="hero-blob" style={{ width: 300, height: 300, background: accent, bottom: -100, right: "20%", opacity: 0.15, filter: "blur(80px)" }} />
        <div style={{ maxWidth: 600, margin: "0 auto", position: "relative", zIndex: 1 }}>
          <h2 className="reveal" style={{
            fontSize: "clamp(1.5rem, 4vw, 2.25rem)", fontWeight: 800,
            marginBottom: 16, fontFamily: "var(--site-heading-font)"
          }}>
            Have questions?
          </h2>
          <p className="reveal reveal-delay-1" style={{ color: "var(--faint)", marginBottom: 36, lineHeight: 1.6 }}>
            We&apos;d love to hear from you. Reach out anytime.
          </p>
          <div className="reveal reveal-delay-2">
            <a href={"/contact"} className="cta-btn">
              <span>Contact Us</span>
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
