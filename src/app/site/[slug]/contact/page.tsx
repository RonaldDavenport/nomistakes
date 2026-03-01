import { createServerClient } from "@/lib/supabase";
import { notFound } from "next/navigation";
import type { SiteData } from "../layout";

export default async function SiteContactPage({ params }: { params: Promise<{ slug: string }> }) {
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
  const contact = site.site_content?.contact || {};

  const inputStyle = {
    width: "100%",
    padding: "14px 18px",
    borderRadius: 12,
    background: "var(--card-bg)",
    border: "1px solid var(--border)",
    color: "inherit",
    fontSize: 14,
    outline: "none",
    fontFamily: "inherit",
    transition: "border-color 0.3s, box-shadow 0.3s",
  };

  return (
    <>
      {/* Hero */}
      <section style={{ padding: "100px 20px 60px", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div className="hero-blob" style={{ width: 400, height: 400, background: primary, top: -200, right: "20%", opacity: 0.12, filter: "blur(100px)" }} />
        <div style={{ maxWidth: 700, margin: "0 auto", position: "relative", zIndex: 1 }}>
          <p className="reveal" style={{
            display: "inline-block", padding: "8px 20px", borderRadius: 100,
            background: `${primary}12`, border: `1px solid ${primary}20`,
            color: primary, fontWeight: 600, fontSize: 13, marginBottom: 24,
            textTransform: "uppercase", letterSpacing: "0.08em",
          }}>
            Contact
          </p>
          <h1 className="reveal reveal-delay-1" style={{
            fontSize: "clamp(2rem, 5vw, 3.25rem)", fontWeight: 800,
            lineHeight: 1.08, marginBottom: 20,
            fontFamily: "var(--site-heading-font)"
          }}>
            Get in Touch
          </h1>
          <p className="reveal reveal-delay-2" style={{ fontSize: "clamp(1rem, 2vw, 1.125rem)", color: "var(--faint)", lineHeight: 1.6 }}>
            We&apos;d love to hear from you. Send us a message and we&apos;ll respond as soon as possible.
          </p>
        </div>
      </section>

      {/* Contact info cards */}
      {(contact.email || contact.phone || contact.hours) && (
        <section style={{ padding: "0 20px 40px" }}>
          <div style={{ maxWidth: 700, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
            {contact.email && (
              <div className="reveal glass-card" style={{ display: "flex", alignItems: "center", gap: 16, padding: 20 }}>
                <div className="feature-icon" style={{ width: 44, height: 44, fontSize: 18, marginBottom: 0, flexShrink: 0 }}>@</div>
                <div>
                  <p style={{ fontWeight: 600, fontSize: 13, marginBottom: 2 }}>Email</p>
                  <p style={{ color: "var(--faint)", fontSize: 13 }}>{contact.email}</p>
                </div>
              </div>
            )}
            {contact.phone && (
              <div className="reveal reveal-delay-1 glass-card" style={{ display: "flex", alignItems: "center", gap: 16, padding: 20 }}>
                <div className="feature-icon" style={{ width: 44, height: 44, fontSize: 18, marginBottom: 0, flexShrink: 0 }}>&#9742;</div>
                <div>
                  <p style={{ fontWeight: 600, fontSize: 13, marginBottom: 2 }}>Phone</p>
                  <p style={{ color: "var(--faint)", fontSize: 13 }}>{contact.phone}</p>
                </div>
              </div>
            )}
            {contact.hours && (
              <div className="reveal reveal-delay-2 glass-card" style={{ display: "flex", alignItems: "center", gap: 16, padding: 20 }}>
                <div className="feature-icon" style={{ width: 44, height: 44, fontSize: 18, marginBottom: 0, flexShrink: 0 }}>&#9719;</div>
                <div>
                  <p style={{ fontWeight: 600, fontSize: 13, marginBottom: 2 }}>Hours</p>
                  <p style={{ color: "var(--faint)", fontSize: 13 }}>{contact.hours}</p>
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Contact form */}
      <section className="section">
        <div style={{ maxWidth: 600, margin: "0 auto" }}>
          <div className="reveal">
            <form style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div>
                  <label style={{ display: "block", fontSize: 13, color: "var(--faint)", marginBottom: 8, fontWeight: 500 }}>Name</label>
                  <input type="text" placeholder="Your name" style={inputStyle} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 13, color: "var(--faint)", marginBottom: 8, fontWeight: 500 }}>Email</label>
                  <input type="email" placeholder="you@example.com" style={inputStyle} />
                </div>
              </div>
              <div>
                <label style={{ display: "block", fontSize: 13, color: "var(--faint)", marginBottom: 8, fontWeight: 500 }}>Subject</label>
                <input type="text" placeholder="How can we help?" style={inputStyle} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 13, color: "var(--faint)", marginBottom: 8, fontWeight: 500 }}>Message</label>
                <textarea
                  rows={6}
                  placeholder="Tell us more..."
                  style={{ ...inputStyle, resize: "vertical" }}
                />
              </div>
              <button type="submit" className="cta-btn" style={{ width: "100%", textAlign: "center" }}>
                <span>Send Message</span>
              </button>
            </form>
          </div>

          {!contact.email && !contact.phone && !contact.hours && (
            <div className="reveal reveal-delay-1" style={{ textAlign: "center", marginTop: 24 }}>
              <p style={{ color: "var(--subtle)", fontSize: 14 }}>
                Fill out the form above and we&apos;ll get back to you within 24 hours.
              </p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
