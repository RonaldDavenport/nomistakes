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
  const primary = colors.primary || "#7B39FC";
  const accent = colors.accent || "#A855F7";
  const hero = site.site_content?.hero || {};
  const about = site.site_content?.about || {};
  const features = site.site_content?.features || [];
  const products = site.site_content?.products || [];
  const testimonials = site.site_content?.testimonials || [];
  const cta = site.site_content?.cta || {};
  const faq = site.site_content?.faq || [];

  const featureIcons = ["✦", "◆", "▲", "●", "★", "◉"];

  // ── Minimal Layout ── Editorial / magazine feel
  if (layout === "minimal") {
    return (
      <>
        {/* Hero — large editorial type */}
        <section style={{ padding: "120px 20px 80px", maxWidth: 720, margin: "0 auto", position: "relative" }}>
          <div className="reveal" style={{ marginBottom: 20 }}>
            <span style={{
              display: "inline-block",
              fontSize: 13,
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.15em",
              color: primary,
              marginBottom: 24,
            }}>
              {site.type === "services" ? "Professional Services" : "Digital Products"}
            </span>
          </div>
          <h1 className="reveal reveal-delay-1" style={{
            fontSize: "clamp(3rem, 8vw, 5rem)", fontWeight: 800,
            lineHeight: 1.0, marginBottom: 28,
            fontFamily: "var(--site-heading-font)",
            letterSpacing: "-0.02em",
          }}>
            {hero.headline || site.name}
          </h1>
          <p className="reveal reveal-delay-2" style={{
            fontSize: "clamp(1.1rem, 2.5vw, 1.35rem)",
            color: "var(--muted)", lineHeight: 1.8, marginBottom: 48,
            maxWidth: 560,
          }}>
            {hero.subheadline || site.tagline}
          </p>
          <div className="reveal reveal-delay-3" style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            <a href={"/products"} className="cta-btn">
              <span>{cta.button_text || "Work With Me"}</span>
            </a>
            <a href={"/about"} className="cta-btn-outline">
              Learn More
            </a>
          </div>
        </section>

        <hr className="section-divider" />

        {/* About */}
        {about.text && (
          <section style={{ padding: "80px 20px", maxWidth: 720, margin: "0 auto" }}>
            <div className="reveal">
              <h2 style={{
                fontSize: "clamp(1.5rem, 3.5vw, 2.25rem)", fontWeight: 700,
                marginBottom: 24, fontFamily: "var(--site-heading-font)"
              }}>
                {about.title || `About ${site.name}`}
              </h2>
            </div>
            <div className="reveal reveal-delay-1" style={{ color: "var(--muted)", lineHeight: 2, fontSize: "1.05rem" }}>
              {about.text.split("\n").map((p: string, i: number) => (
                <p key={i} style={{ marginBottom: 20 }}>{p}</p>
              ))}
            </div>
            {about.mission && (
              <div className="reveal reveal-delay-2" style={{
                marginTop: 32,
                padding: "24px 28px",
                borderLeft: `3px solid ${primary}`,
                background: `${primary}08`,
                borderRadius: "0 12px 12px 0",
              }}>
                <p style={{ color: primary, fontWeight: 600, fontStyle: "italic", lineHeight: 1.6 }}>
                  {about.mission}
                </p>
              </div>
            )}
          </section>
        )}

        <hr className="section-divider" />

        {/* Offerings */}
        {products.length > 0 && (
          <section style={{ padding: "80px 20px", maxWidth: 720, margin: "0 auto" }}>
            <h2 className="reveal" style={{
              fontSize: "clamp(1.5rem, 3.5vw, 2.25rem)", fontWeight: 700,
              marginBottom: 40, fontFamily: "var(--site-heading-font)"
            }}>
              How I Can Help
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              {products.map((p: { name: string; desc: string; price: string }, i: number) => (
                <div
                  key={i}
                  className={`reveal reveal-delay-${Math.min(i + 1, 5)}`}
                  style={{
                    padding: "28px 0",
                    borderBottom: i < products.length - 1 ? "1px solid var(--border)" : "none",
                    display: "grid",
                    gridTemplateColumns: "1fr auto",
                    gap: 20,
                    alignItems: "start",
                    transition: "padding-left 0.3s",
                  }}
                >
                  <div>
                    <h3 style={{ fontSize: "1.2rem", fontWeight: 600, marginBottom: 8, fontFamily: "var(--site-heading-font)" }}>{p.name}</h3>
                    <p style={{ color: "var(--muted)", lineHeight: 1.7, fontSize: 14 }}>{p.desc}</p>
                  </div>
                  <span className="stat-number" style={{ fontSize: "1.25rem", whiteSpace: "nowrap" }}>{p.price}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Testimonials */}
        {testimonials.length > 0 && (
          <>
            <hr className="section-divider" />
            <section style={{ padding: "80px 20px", maxWidth: 720, margin: "0 auto" }}>
              <h2 className="reveal" style={{
                fontSize: "clamp(1.5rem, 3.5vw, 2.25rem)", fontWeight: 700,
                marginBottom: 40, fontFamily: "var(--site-heading-font)"
              }}>
                What Clients Say
              </h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                {testimonials.map((t, i) => (
                  <div key={i} className={`reveal testimonial-card reveal-delay-${Math.min(i + 1, 5)}`}>
                    <p style={{ color: "var(--muted)", fontSize: 15, lineHeight: 1.8, marginBottom: 16, paddingLeft: 32, fontStyle: "italic" }}>
                      {t.text}
                    </p>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, paddingLeft: 32 }}>
                      <div style={{ width: 36, height: 36, borderRadius: "50%", background: `linear-gradient(135deg, ${primary}33, ${accent}33)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700 }}>
                        {t.name[0]}
                      </div>
                      <div>
                        <p style={{ fontWeight: 600, fontSize: 14 }}>{t.name}</p>
                        <p style={{ color: "var(--subtle)", fontSize: 12 }}>{t.role}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}

        <hr className="section-divider" />

        {/* CTA */}
        <section style={{ padding: "100px 20px", maxWidth: 720, margin: "0 auto", textAlign: "center" }}>
          <h2 className="reveal" style={{
            fontSize: "clamp(1.75rem, 4vw, 2.75rem)", fontWeight: 800,
            marginBottom: 20, fontFamily: "var(--site-heading-font)"
          }}>
            {cta.headline || "Let\u2019s work together"}
          </h2>
          <p className="reveal reveal-delay-1" style={{ color: "var(--muted)", marginBottom: 40, fontSize: 16, lineHeight: 1.6 }}>
            {cta.subheadline || site.tagline}
          </p>
          <div className="reveal reveal-delay-2">
            <a href={"/contact"} className="cta-btn">
              <span>{cta.button_text || "Get In Touch"}</span>
            </a>
          </div>
        </section>
      </>
    );
  }

  // ── Creator Layout ── Bold, energetic, product-focused
  if (layout === "creator") {
    const featured = products[0];
    const restProducts = products.slice(1);
    return (
      <>
        {/* Hero — gradient blobs, bold type */}
        <section style={{ padding: "100px 20px 80px", textAlign: "center", position: "relative", overflow: "hidden" }}>
          <div className="hero-blob hero-blob-1" />
          <div className="hero-blob hero-blob-2" />
          <div style={{ maxWidth: 760, margin: "0 auto", position: "relative", zIndex: 1 }}>
            <div className="reveal">
              <span style={{
                display: "inline-block",
                padding: "8px 20px",
                borderRadius: 100,
                background: `${primary}15`,
                border: `1px solid ${primary}25`,
                fontSize: 13,
                fontWeight: 600,
                color: primary,
                marginBottom: 28,
              }}>
                {site.type === "services" ? "Premium Services" : "Digital Products"}
              </span>
            </div>
            <h1 className="reveal reveal-delay-1 gradient-text" style={{
              fontSize: "clamp(2.5rem, 6vw, 4rem)", fontWeight: 800,
              lineHeight: 1.05, marginBottom: 20,
              fontFamily: "var(--site-heading-font)",
            }}>
              {hero.headline || site.name}
            </h1>
            <p className="reveal reveal-delay-2" style={{
              fontSize: "clamp(1rem, 2.5vw, 1.15rem)",
              color: "var(--muted)", lineHeight: 1.7, marginBottom: 40,
              maxWidth: 560, margin: "0 auto 40px",
            }}>
              {hero.subheadline || site.tagline}
            </p>
            <div className="reveal reveal-delay-3" style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
              <a href={"/products"} className="cta-btn">
                <span>{cta.button_text || "Browse Products"}</span>
              </a>
            </div>
          </div>
        </section>

        {/* Featured product — big hero card */}
        {featured && (
          <section className="section">
            <div style={{ maxWidth: 800, margin: "0 auto", padding: "0 20px" }}>
              <div className="reveal glow-card" style={{ padding: 36 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                  <span style={{
                    padding: "6px 16px", borderRadius: 100,
                    background: `linear-gradient(135deg, ${primary}, ${accent})`,
                    fontSize: 11, fontWeight: 700, color: "#fff",
                    textTransform: "uppercase", letterSpacing: "0.08em",
                  }}>
                    Featured
                  </span>
                  <span className="stat-number" style={{ fontSize: "1.5rem" }}>{featured.price}</span>
                </div>
                <h2 style={{ fontSize: "clamp(1.5rem, 3vw, 2.25rem)", fontWeight: 800, marginBottom: 14, fontFamily: "var(--site-heading-font)" }}>
                  {featured.name}
                </h2>
                <p style={{ color: "var(--muted)", lineHeight: 1.7, marginBottom: 24, fontSize: 15 }}>{featured.desc}</p>
                {featured.features && (
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 28 }}>
                    {featured.features.map((f: string, i: number) => (
                      <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14, color: "var(--muted)" }}>
                        <span style={{ color: primary, fontWeight: 700 }}>&#10003;</span> {f}
                      </div>
                    ))}
                  </div>
                )}
                <a href={"/products"} className="cta-btn" style={{ padding: "14px 36px", fontSize: 15 }}>
                  <span>Get Started</span>
                </a>
              </div>
            </div>
          </section>
        )}

        {/* Product grid */}
        {restProducts.length > 0 && (
          <section className="section">
            <div className="section-inner">
              <h2 className="reveal section-title section-title-center">
                More {site.type === "services" ? "Services" : "Products"}
              </h2>
              <div className="grid-cards">
                {restProducts.map((p: { name: string; desc: string; price: string; features?: string[] }, i: number) => (
                  <div key={i} className={`reveal glass-card reveal-delay-${Math.min(i + 1, 5)}`}>
                    <h3 style={{ marginBottom: 8 }}>{p.name}</h3>
                    <p style={{ color: "var(--muted)", fontSize: 14, lineHeight: 1.6, marginBottom: 16 }}>{p.desc}</p>
                    <span className="stat-number" style={{ fontSize: "1.125rem" }}>{p.price}</span>
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
              <h2 className="reveal section-title section-title-center">What Customers Say</h2>
              <div className="grid-cards">
                {testimonials.map((t, i) => (
                  <div key={i} className={`reveal testimonial-card reveal-delay-${Math.min(i + 1, 5)}`} style={{ textAlign: "left" }}>
                    <div style={{ marginBottom: 16, paddingLeft: 32 }}>
                      {Array.from({ length: 5 }).map((_, si) => (
                        <span key={si} style={{ color: primary, fontSize: 15 }}>&#9733;</span>
                      ))}
                    </div>
                    <p style={{ color: "var(--muted)", fontSize: 14, lineHeight: 1.7, marginBottom: 20, paddingLeft: 32, fontStyle: "italic" }}>
                      {t.text}
                    </p>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ width: 40, height: 40, borderRadius: "50%", background: `linear-gradient(135deg, ${primary}, ${accent})`, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 16, fontWeight: 700 }}>
                        {t.name[0]}
                      </div>
                      <div>
                        <p style={{ fontWeight: 600, fontSize: 14 }}>{t.name}</p>
                        <p style={{ color: "var(--subtle)", fontSize: 12 }}>{t.role}</p>
                      </div>
                    </div>
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
              <h2 className="reveal section-title section-title-center">Frequently Asked Questions</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {faq.map((item: { question: string; answer: string }, i: number) => (
                  <div key={i} className={`reveal faq-item reveal-delay-${Math.min(i + 1, 5)}`}>
                    <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 10, fontFamily: "var(--site-heading-font)" }}>{item.question}</h3>
                    <p style={{ color: "var(--muted)", fontSize: 14, lineHeight: 1.7 }}>{item.answer}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* CTA — gradient background */}
        <section className="section" style={{ textAlign: "center", position: "relative", overflow: "hidden" }}>
          <div className="hero-blob hero-blob-3" style={{ bottom: "auto", top: "-50%", left: "20%" }} />
          <div style={{ maxWidth: 600, margin: "0 auto", position: "relative", zIndex: 1 }}>
            <h2 className="reveal gradient-text" style={{
              fontSize: "clamp(1.75rem, 4vw, 2.75rem)", fontWeight: 800,
              marginBottom: 20, fontFamily: "var(--site-heading-font)"
            }}>
              {cta.headline || "Ready to get started?"}
            </h2>
            <p className="reveal reveal-delay-1" style={{ color: "var(--faint)", marginBottom: 40 }}>
              {cta.subheadline || site.tagline}
            </p>
            <div className="reveal reveal-delay-2">
              <a href={"/products"} className="cta-btn">
                <span>{cta.button_text || "Get Started Now"}</span>
              </a>
            </div>
          </div>
        </section>
      </>
    );
  }

  // ── Default Layout ── Professional, trust-building
  return (
    <>
      {/* Hero — animated gradient blobs */}
      <section style={{ padding: "100px 20px 80px", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div className="hero-blob hero-blob-1" />
        <div className="hero-blob hero-blob-2" />
        <div style={{ maxWidth: 740, margin: "0 auto", position: "relative", zIndex: 1 }}>
          <h1 className="reveal" style={{
            fontSize: "clamp(2.25rem, 6vw, 4rem)", fontWeight: 800,
            lineHeight: 1.08, marginBottom: 20,
            fontFamily: "var(--site-heading-font)",
            letterSpacing: "-0.01em",
          }}>
            {hero.headline || site.name}
          </h1>
          <p className="reveal reveal-delay-1" style={{
            fontSize: "clamp(1rem, 2.5vw, 1.15rem)",
            color: "var(--muted)", lineHeight: 1.7, marginBottom: 40,
            maxWidth: 560, margin: "0 auto 40px",
          }}>
            {hero.subheadline || site.tagline}
          </p>
          <div className="reveal reveal-delay-2" style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
            <a href={"/products"} className="cta-btn">
              <span>{cta.button_text || "Get Started"}</span>
            </a>
            <a href={"/about"} className="cta-btn-outline">
              Learn More
            </a>
          </div>
        </div>
      </section>

      {/* Trust bar — animated counters */}
      <section className="reveal" style={{ padding: "48px 20px", textAlign: "center" }}>
        <div style={{ display: "flex", justifyContent: "center", gap: "clamp(32px, 6vw, 64px)", flexWrap: "wrap" }}>
          {[
            { label: "Happy Customers", value: "500", suffix: "+" },
            { label: "5-Star Reviews", value: "4.9", suffix: "/5" },
            { label: "Satisfaction", value: "100", suffix: "%" },
          ].map((stat) => (
            <div key={stat.label} className="reveal" style={{ textAlign: "center" }}>
              <p className="stat-number" data-count={stat.value} data-suffix={stat.suffix}>0{stat.suffix}</p>
              <p style={{ fontSize: 13, color: "var(--subtle)", marginTop: 4 }}>{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      <hr className="section-divider" />

      {/* Features — glass cards with icons */}
      {features.length > 0 && (
        <section className="section">
          <div className="section-inner">
            <h2 className="reveal section-title section-title-center">Why Choose {site.name}</h2>
            <p className="reveal reveal-delay-1 section-subtitle">Everything you need, nothing you don&apos;t.</p>
            <div className="grid-cards">
              {features.slice(0, 6).map((f, i) => (
                <div key={i} className={`reveal glass-card reveal-delay-${Math.min(i + 1, 5)}`}>
                  <div className="feature-icon">{featureIcons[i % featureIcons.length]}</div>
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
            <h2 className="reveal section-title" style={{ textAlign: "center" }}>
              {about.title || `About ${site.name}`}
            </h2>
            <p className="reveal reveal-delay-1" style={{ color: "var(--muted)", lineHeight: 1.8, marginBottom: 28, fontSize: 15 }}>
              {about.text.length > 300 ? about.text.slice(0, 300) + "..." : about.text}
            </p>
            <div className="reveal reveal-delay-2">
              <a href={"/about"} style={{ color: primary, fontWeight: 600, fontSize: 14, display: "inline-flex", alignItems: "center", gap: 6 }}>
                Read our full story <span style={{ transition: "transform 0.2s", display: "inline-block" }}>&rarr;</span>
              </a>
            </div>
          </div>
        </section>
      )}

      {/* Testimonials */}
      {testimonials.length > 0 && (
        <section className="section">
          <div className="section-inner">
            <h2 className="reveal section-title section-title-center">What People Say</h2>
            <div className="grid-cards">
              {testimonials.map((t, i) => (
                <div key={i} className={`reveal testimonial-card reveal-delay-${Math.min(i + 1, 5)}`}>
                  <div style={{ marginBottom: 14, paddingLeft: 32 }}>
                    {Array.from({ length: 5 }).map((_, si) => (
                      <span key={si} style={{ color: primary, fontSize: 14, marginRight: 2 }}>&#9733;</span>
                    ))}
                  </div>
                  <p style={{ color: "var(--muted)", fontSize: 14, lineHeight: 1.7, marginBottom: 18, paddingLeft: 32, fontStyle: "italic" }}>
                    &ldquo;{t.text}&rdquo;
                  </p>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 36, height: 36, borderRadius: "50%", background: `linear-gradient(135deg, ${primary}33, ${accent}33)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700 }}>
                      {t.name[0]}
                    </div>
                    <div>
                      <p style={{ fontWeight: 600, fontSize: 14 }}>{t.name}</p>
                      <p style={{ color: "var(--subtle)", fontSize: 12 }}>{t.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA — with animated background */}
      <section className="section" style={{ textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div className="hero-blob hero-blob-3" style={{ bottom: "auto", top: "-100px", opacity: 0.2 }} />
        <div style={{ maxWidth: 600, margin: "0 auto", position: "relative", zIndex: 1 }}>
          <h2 className="reveal" style={{
            fontSize: "clamp(1.75rem, 4vw, 2.75rem)", fontWeight: 800,
            marginBottom: 16, fontFamily: "var(--site-heading-font)"
          }}>
            {cta.headline || `Ready to get started with ${site.name}?`}
          </h2>
          <p className="reveal reveal-delay-1" style={{ color: "var(--faint)", marginBottom: 40, lineHeight: 1.6 }}>
            {cta.subheadline || site.tagline}
          </p>
          <div className="reveal reveal-delay-2">
            <a href={"/products"} className="cta-btn">
              <span>{cta.button_text || "Get Started Now"}</span>
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
