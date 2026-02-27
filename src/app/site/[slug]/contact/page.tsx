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
  const primary = colors.primary || "#4c6ef5";
  const contact = site.site_content?.contact || {};

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
            Contact
          </p>
          <h1 style={{
            fontSize: "clamp(1.75rem, 4.5vw, 3rem)", fontWeight: 800,
            lineHeight: 1.1, marginBottom: 16,
            fontFamily: "var(--site-heading-font)"
          }}>
            Get in Touch
          </h1>
          <p style={{ fontSize: "clamp(1rem, 2vw, 1.125rem)", color: "var(--faint)", lineHeight: 1.6 }}>
            We&apos;d love to hear from you. Send us a message and we&apos;ll respond as soon as possible.
          </p>
        </div>
      </section>

      {/* Contact form + info */}
      <section className="section">
        <div className="section-inner">
          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 40 }}>
            {/* Contact form */}
            <div style={{ maxWidth: 600, margin: "0 auto", width: "100%" }}>
              <form style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 16 }}>
                  <div>
                    <label style={{ display: "block", fontSize: 14, color: "var(--faint)", marginBottom: 6 }}>Name</label>
                    <input
                      type="text"
                      placeholder="Your name"
                      style={{
                        width: "100%", padding: "12px 16px", borderRadius: 10,
                        background: "var(--card-bg)", border: "1px solid var(--border)",
                        color: "inherit", fontSize: 14, outline: "none"
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: 14, color: "var(--faint)", marginBottom: 6 }}>Email</label>
                    <input
                      type="email"
                      placeholder="you@example.com"
                      style={{
                        width: "100%", padding: "12px 16px", borderRadius: 10,
                        background: "var(--card-bg)", border: "1px solid var(--border)",
                        color: "inherit", fontSize: 14, outline: "none"
                      }}
                    />
                  </div>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 14, color: "var(--faint)", marginBottom: 6 }}>Subject</label>
                  <input
                    type="text"
                    placeholder="How can we help?"
                    style={{
                      width: "100%", padding: "12px 16px", borderRadius: 10,
                      background: "var(--card-bg)", border: "1px solid var(--border)",
                      color: "inherit", fontSize: 14, outline: "none"
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 14, color: "var(--faint)", marginBottom: 6 }}>Message</label>
                  <textarea
                    rows={6}
                    placeholder="Tell us more..."
                    style={{
                      width: "100%", padding: "12px 16px", borderRadius: 10,
                      background: "var(--card-bg)", border: "1px solid var(--border)",
                      color: "inherit", fontSize: 14, outline: "none", resize: "vertical",
                      fontFamily: "inherit"
                    }}
                  />
                </div>
                <button
                  type="submit"
                  className="cta-btn"
                  style={{ width: "100%", textAlign: "center" }}
                >
                  Send Message
                </button>
              </form>
            </div>

            {/* Contact info cards */}
            <div style={{ maxWidth: 600, margin: "0 auto", width: "100%" }}>
              <div className="grid-cards" style={{ gridTemplateColumns: "1fr" }}>
                {contact.email && (
                  <div className="card" style={{ display: "flex", alignItems: "center", gap: 16 }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                      background: `${primary}15`, border: `1px solid ${primary}20`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: primary, fontSize: 18
                    }}>
                      @
                    </div>
                    <div>
                      <p style={{ fontWeight: 600, fontSize: 14, marginBottom: 2 }}>Email</p>
                      <p style={{ color: "var(--faint)", fontSize: 14 }}>{contact.email}</p>
                    </div>
                  </div>
                )}
                {contact.phone && (
                  <div className="card" style={{ display: "flex", alignItems: "center", gap: 16 }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                      background: `${primary}15`, border: `1px solid ${primary}20`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: primary, fontSize: 18
                    }}>
                      ☎
                    </div>
                    <div>
                      <p style={{ fontWeight: 600, fontSize: 14, marginBottom: 2 }}>Phone</p>
                      <p style={{ color: "var(--faint)", fontSize: 14 }}>{contact.phone}</p>
                    </div>
                  </div>
                )}
                {contact.hours && (
                  <div className="card" style={{ display: "flex", alignItems: "center", gap: 16 }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                      background: `${primary}15`, border: `1px solid ${primary}20`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: primary, fontSize: 18
                    }}>
                      ◷
                    </div>
                    <div>
                      <p style={{ fontWeight: 600, fontSize: 14, marginBottom: 2 }}>Hours</p>
                      <p style={{ color: "var(--faint)", fontSize: 14 }}>{contact.hours}</p>
                    </div>
                  </div>
                )}
                {!contact.email && !contact.phone && !contact.hours && (
                  <div className="card" style={{ textAlign: "center", padding: 32 }}>
                    <p style={{ color: "var(--faint)", fontSize: 14 }}>
                      Fill out the form above and we&apos;ll get back to you within 24 hours.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
