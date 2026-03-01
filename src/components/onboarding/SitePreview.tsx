"use client";

import { useState } from "react";

interface SitePreviewProps {
  businessName: string;
  tagline: string;
  type: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
  layout: "default" | "minimal" | "creator";
  slug: string;
  siteContent?: {
    hero?: { headline?: string; subheadline?: string; badge?: string };
    features?: { title: string; desc: string }[];
    stats?: { value: string; label: string }[];
    testimonials?: { name: string; role: string; text: string; rating?: number }[];
    cta?: { headline?: string; subheadline?: string; button_text?: string };
    images?: { hero?: string; about?: string; products?: string[] };
    [key: string]: unknown;
  };
}

export default function SitePreview({
  businessName,
  tagline,
  type,
  colors,
  layout,
  slug,
  siteContent,
}: SitePreviewProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const p = colors.primary;
  const ac = colors.accent;
  const sec = colors.secondary;
  const bg = colors.background;
  const tx = colors.text;

  const previewContent = (
    <div
      style={{
        width: "167%",
        transform: "scale(0.6)",
        transformOrigin: "top left",
        background: bg,
        color: tx,
        fontFamily: "Inter, system-ui, sans-serif",
        minHeight: 1400,
        transition: "background 0.4s, color 0.4s",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Nav */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 24px",
          height: 64,
          borderBottom: `1px solid ${tx}06`,
          background: `${bg}dd`,
          backdropFilter: "blur(20px)",
          position: "sticky",
          top: 0,
          zIndex: 10,
        }}
      >
        <span style={{
          fontWeight: 700, fontSize: 18, letterSpacing: "-0.02em",
          background: `linear-gradient(135deg, ${p}, ${ac})`,
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
        }}>{businessName}</span>
        <div style={{ display: "flex", gap: 28, fontSize: 14, alignItems: "center" }}>
          <span style={{ color: `${tx}80`, fontWeight: 500 }}>Home</span>
          <span style={{ color: `${tx}80`, fontWeight: 500 }}>About</span>
          <span style={{ color: `${tx}80`, fontWeight: 500 }}>{type === "services" ? "Services" : "Products"}</span>
          <span style={{ color: `${tx}80`, fontWeight: 500 }}>Blog</span>
          <span style={{ color: `${tx}80`, fontWeight: 500 }}>Contact</span>
          <span style={{
            padding: "8px 20px",
            borderRadius: 10,
            background: p,
            color: "#fff",
            fontWeight: 600,
            fontSize: 13,
            boxShadow: `0 4px 16px ${p}33`,
          }}>
            {type === "services" ? "Book a Call" : "Get Started"}
          </span>
        </div>
      </div>

      {layout === "minimal" ? (
        <MinimalPreview name={businessName} tagline={tagline} primary={p} accent={ac} secondary={sec} tx={tx} type={type} siteContent={siteContent} />
      ) : layout === "creator" ? (
        <CreatorPreview name={businessName} tagline={tagline} primary={p} accent={ac} secondary={sec} tx={tx} type={type} siteContent={siteContent} />
      ) : (
        <DefaultPreview name={businessName} tagline={tagline} primary={p} accent={ac} secondary={sec} tx={tx} type={type} siteContent={siteContent} />
      )}

      {/* Footer */}
      <div style={{
        borderTop: `1px solid ${tx}06`,
        padding: "48px 24px",
      }}>
        <div style={{
          maxWidth: 1100, margin: "0 auto",
          display: "flex", flexDirection: "column", alignItems: "center", gap: 16,
        }}>
          <span style={{
            fontSize: 16, fontWeight: 700,
            background: `linear-gradient(135deg, ${p}, ${ac})`,
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
          }}>
            {businessName}
          </span>
          <div style={{ display: "flex", gap: 24 }}>
            {["Home", "About", type === "services" ? "Services" : "Products", "Blog", "Contact"].map(l => (
              <span key={l} style={{ fontSize: 13, color: `${tx}59` }}>{l}</span>
            ))}
          </div>
          <p style={{ color: `${tx}33`, fontSize: 12, marginTop: 8 }}>
            &copy; 2026 {businessName}. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop preview */}
      <div className="hidden lg:block animate-scaleIn">
        <div
          style={{
            borderRadius: 16,
            border: "1px solid rgba(255,255,255,0.08)",
            overflow: "hidden",
            background: "#0A0A0F",
          }}
        >
          {/* Browser chrome */}
          <div
            style={{
              padding: "10px 14px",
              background: "#111118",
              borderBottom: "1px solid rgba(255,255,255,0.06)",
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <div style={{ display: "flex", gap: 6 }}>
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#ff5f57" }} />
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#febc2e" }} />
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#28c840" }} />
            </div>
            <div
              style={{
                flex: 1,
                background: "rgba(255,255,255,0.06)",
                borderRadius: 6,
                padding: "4px 10px",
                fontSize: 11,
                color: "rgba(255,255,255,0.4)",
                fontFamily: "monospace",
              }}
            >
              nm-{slug || "your-site"}.vercel.app
            </div>
          </div>

          {/* Scaled site content */}
          <div style={{ height: 580, overflow: "hidden", position: "relative" }}>
            {previewContent}
          </div>
        </div>

        <p
          style={{
            textAlign: "center",
            fontSize: 11,
            color: "rgba(255,255,255,0.25)",
            marginTop: 8,
          }}
        >
          Live preview &middot; Updates as you customize
        </p>
      </div>

      {/* Mobile toggle */}
      <div className="lg:hidden">
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          style={{
            width: "100%",
            padding: "12px 16px",
            borderRadius: 12,
            border: "1px solid rgba(255,255,255,0.08)",
            background: "#0A0A0F",
            color: "#A855F7",
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            marginBottom: 16,
          }}
        >
          {mobileOpen ? "Hide Preview" : "Preview Your Site"}
          <span style={{ fontSize: 10, transform: mobileOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>
            &#9660;
          </span>
        </button>

        {mobileOpen && (
          <div
            className="animate-scaleIn"
            style={{
              borderRadius: 12,
              border: "1px solid rgba(255,255,255,0.08)",
              overflow: "hidden",
              marginBottom: 16,
              background: "#0A0A0F",
            }}
          >
            <div style={{ height: 380, overflow: "hidden" }}>
              {previewContent}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

// ── Shared helpers ──

function Blob({ color, size, top, left, right, bottom, opacity = 0.2 }: {
  color: string; size: number; top?: number | string; left?: number | string;
  right?: number | string; bottom?: number | string; opacity?: number;
}) {
  return (
    <div style={{
      position: "absolute",
      width: size, height: size,
      borderRadius: "50%",
      background: color,
      filter: "blur(80px)",
      opacity,
      top, left, right, bottom,
      pointerEvents: "none",
    }} />
  );
}

function GradientButton({ primary, accent, children, style }: {
  primary: string; accent: string; children: React.ReactNode; style?: React.CSSProperties;
}) {
  return (
    <div style={{
      display: "inline-block",
      padding: "14px 36px",
      borderRadius: 12,
      background: `linear-gradient(135deg, ${primary}, ${accent})`,
      color: "#fff",
      fontWeight: 700,
      fontSize: 15,
      ...style,
    }}>
      {children}
    </div>
  );
}

function OutlineButton({ tx, children }: { tx: string; children: React.ReactNode }) {
  return (
    <div style={{
      display: "inline-block",
      padding: "14px 36px",
      borderRadius: 12,
      border: `1px solid ${tx}18`,
      color: tx,
      fontWeight: 600,
      fontSize: 15,
      opacity: 0.7,
    }}>
      {children}
    </div>
  );
}

function GlassCard({ tx, primary, children, style }: {
  tx: string; primary: string; children: React.ReactNode; style?: React.CSSProperties;
}) {
  return (
    <div style={{
      padding: 24,
      borderRadius: 16,
      border: `1px solid ${tx}08`,
      background: `${tx}03`,
      backdropFilter: "blur(12px)",
      ...style,
    }}>
      {children}
    </div>
  );
}

function FeatureIcon({ primary, accent, icon }: { primary: string; accent: string; icon: string }) {
  return (
    <div style={{
      width: 44, height: 44,
      borderRadius: 12,
      background: `linear-gradient(135deg, ${primary}20, ${accent}15)`,
      border: `1px solid ${primary}18`,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: 20,
      marginBottom: 14,
    }}>
      {icon}
    </div>
  );
}

function GradientText({ primary, accent, children, style }: {
  primary: string; accent: string; children: React.ReactNode; style?: React.CSSProperties;
}) {
  return (
    <span style={{
      background: `linear-gradient(135deg, ${primary}, ${accent}, ${primary})`,
      backgroundSize: "200% auto",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      backgroundClip: "text",
      ...style,
    }}>
      {children}
    </span>
  );
}

function StatNumber({ primary, accent, children }: { primary: string; accent: string; children: React.ReactNode }) {
  return (
    <GradientText primary={primary} accent={accent} style={{ fontWeight: 800 }}>
      {children}
    </GradientText>
  );
}

function Divider({ tx }: { tx: string }) {
  return (
    <div style={{
      height: 1,
      background: `linear-gradient(90deg, transparent, ${tx}10, transparent)`,
      margin: 0,
    }} />
  );
}

// ── Layout sub-previews ──

interface PreviewProps {
  name: string; tagline: string; primary: string; accent: string;
  secondary: string; tx: string; type: string;
  siteContent?: SitePreviewProps["siteContent"];
}

function DefaultPreview({ name, tagline, primary, accent, secondary, tx, type, siteContent }: PreviewProps) {
  const hero = siteContent?.hero;
  const aiFeatures = siteContent?.features;
  const aiStats = siteContent?.stats;
  const aiTestimonials = siteContent?.testimonials;
  const aiCta = siteContent?.cta;
  const heroImage = siteContent?.images?.hero;
  const isServices = type === "services";

  const features = aiFeatures && aiFeatures.length >= 3
    ? aiFeatures.slice(0, 3).map((f, i) => ({ icon: ["\u2728", "\u26A1", "\u{1F680}"][i], title: f.title, desc: f.desc }))
    : [
        { icon: "\u2728", title: `Expert ${isServices ? "Service" : "Products"}`, desc: "Tailored solutions built around your specific needs and goals." },
        { icon: "\u26A1", title: "Fast Results", desc: "See measurable improvements from day one with our proven approach." },
        { icon: "\u{1F680}", title: "24/7 Support", desc: "Round-the-clock assistance whenever you need help or guidance." },
      ];

  const stats = aiStats && aiStats.length >= 3
    ? aiStats.slice(0, 3).map((s) => ({ num: s.value, label: s.label }))
    : [
        { num: "500+", label: "Happy Customers" },
        { num: "4.9/5", label: "Star Reviews" },
        { num: "100%", label: "Satisfaction" },
      ];

  const testimonials = aiTestimonials && aiTestimonials.length >= 2
    ? aiTestimonials.slice(0, 3)
    : [
        { name: "Sarah M.", role: "Business Owner", text: "Transformed our online presence. Couldn\u2019t be happier with the results.", rating: 5 },
        { name: "James R.", role: "Startup Founder", text: "The best investment we made this year. Professional and fast.", rating: 5 },
        { name: "Lisa K.", role: "Freelancer", text: "Incredible quality and attention to detail. Highly recommend.", rating: 5 },
      ];

  return (
    <>
      {/* Hero — matches deployed template */}
      <div style={{
        minHeight: "90vh",
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        textAlign: "center", padding: "80px 24px 40px",
        position: "relative", overflow: "hidden",
      }}>
        {/* Radial gradient glow (matches deployed) */}
        <div style={{
          position: "absolute", top: "-40%", left: "50%", transform: "translateX(-50%)",
          width: "80%", maxWidth: 700, height: 500,
          background: `radial-gradient(ellipse, ${primary}15 0%, transparent 70%)`,
          filter: "blur(60px)", pointerEvents: "none",
        }} />
        <div style={{ position: "relative", maxWidth: 720, margin: "0 auto" }}>
          {hero?.badge ? (
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "6px 16px", borderRadius: 100,
              border: `1px solid ${tx}1a`, background: `${tx}0a`,
              fontSize: 13, fontWeight: 500, color: `${tx}99`,
              marginBottom: 24,
            }}>
              <span style={{
                width: 8, height: 8, borderRadius: "50%",
                background: primary, boxShadow: `0 0 12px ${primary}66`,
                display: "inline-block",
              }} />
              {hero.badge}
            </div>
          ) : (
            <p style={{
              fontSize: 13, fontWeight: 600, letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: primary, marginBottom: 20,
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            }}>
              <span style={{
                width: 8, height: 8, borderRadius: "50%",
                background: primary, boxShadow: `0 0 12px ${primary}66`,
                display: "inline-block",
              }} />
              {isServices ? "Professional Services" : "Digital Products"}
            </p>
          )}
          <h1 style={{
            fontSize: 48, fontWeight: 800, lineHeight: 1.08,
            letterSpacing: "-0.03em", marginBottom: 24,
          }}>
            {hero?.headline || name}
          </h1>
          <p style={{
            fontSize: 17, color: `${tx}8c`,
            lineHeight: 1.7, marginBottom: 40,
            maxWidth: 560, margin: "0 auto 40px",
          }}>
            {hero?.subheadline || tagline || "Your tagline goes here"}
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "14px 32px", borderRadius: 10,
              background: primary, color: "#fff",
              fontWeight: 600, fontSize: 15,
              boxShadow: `0 4px 16px ${primary}33`,
            }}>
              {aiCta?.button_text || (isServices ? "Book a Strategy Call" : "View Products")}
              <span style={{ fontSize: 18 }}>&rarr;</span>
            </div>
            <OutlineButton tx={tx}>Learn More</OutlineButton>
          </div>
        </div>

        {/* Hero image */}
        <div style={{
          position: "relative", maxWidth: 900, width: "100%",
          margin: "56px auto 0", padding: "0 24px",
        }}>
          {heroImage ? (
            <div style={{
              borderRadius: 16, overflow: "hidden",
              border: `1px solid ${tx}1a`,
              boxShadow: `0 24px 80px rgba(0,0,0,0.3), 0 0 120px ${primary}08`,
            }}>
              <img src={heroImage} alt={name} style={{ width: "100%", height: "auto", display: "block" }} />
            </div>
          ) : (
            <div style={{
              height: 340, borderRadius: 16, overflow: "hidden",
              border: `1px solid ${tx}1a`,
              background: `linear-gradient(135deg, ${primary}18, ${accent}12, ${tx}08)`,
              boxShadow: `0 24px 80px rgba(0,0,0,0.3), 0 0 120px ${primary}08`,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <span style={{
                fontSize: 96, fontWeight: 800,
                background: `linear-gradient(135deg, ${primary}44, ${accent}33)`,
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
              }}>
                {name.charAt(0)}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Stats bar */}
      {stats.length > 0 && (
        <div style={{
          borderTop: `1px solid ${tx}0d`,
          borderBottom: `1px solid ${tx}0d`,
          padding: "40px 24px",
        }}>
          <div style={{
            display: "flex", justifyContent: "center", flexWrap: "wrap",
            gap: "40px 64px",
          }}>
            {stats.map((s) => (
              <div key={s.label} style={{ textAlign: "center" }}>
                <GradientText primary={primary} accent={accent} style={{ fontSize: 36, fontWeight: 800, lineHeight: 1 }}>
                  {s.num}
                </GradientText>
                <p style={{ color: `${tx}66`, fontSize: 13, fontWeight: 500, marginTop: 4 }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Features — matches deployed */}
      <div style={{ padding: "80px 24px", borderTop: `1px solid ${tx}0d` }}>
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <p style={{
            fontSize: 13, fontWeight: 600, textTransform: "uppercase",
            letterSpacing: "0.08em", color: primary, marginBottom: 12,
          }}>
            Why Choose Us
          </p>
          <h2 style={{ fontSize: 32, fontWeight: 700, letterSpacing: "-0.02em" }}>
            Built different.
          </h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 20 }}>
          {features.map((f) => (
            <div key={f.title} style={{
              padding: "32px 28px", borderRadius: 16,
              border: `1px solid ${tx}0f`, background: `${tx}05`,
              transition: "all 0.3s",
            }}>
              <div style={{
                width: 40, height: 40, borderRadius: 10,
                background: `${primary}12`,
                display: "flex", alignItems: "center", justifyContent: "center",
                marginBottom: 16, fontSize: 18,
              }}>
                {f.icon}
              </div>
              <h3 style={{ fontWeight: 600, fontSize: 17, marginBottom: 8 }}>{f.title}</h3>
              <p style={{ color: `${tx}80`, fontSize: 14, lineHeight: 1.7 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Testimonials — matches deployed (3 col, yellow stars) */}
      <div style={{ padding: "80px 24px", borderTop: `1px solid ${tx}0d` }}>
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <p style={{
            fontSize: 13, fontWeight: 600, textTransform: "uppercase",
            letterSpacing: "0.08em", color: primary, marginBottom: 12,
          }}>
            Testimonials
          </p>
          <h2 style={{ fontSize: 32, fontWeight: 700, letterSpacing: "-0.02em" }}>
            What people are saying
          </h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 20 }}>
          {testimonials.map((t) => (
            <div key={t.name} style={{
              padding: "32px 28px", borderRadius: 16,
              border: `1px solid ${tx}0f`, background: `${tx}05`,
              display: "flex", flexDirection: "column",
            }}>
              {(t.rating || 5) > 0 && (
                <div style={{ marginBottom: 12, color: "#facc15", fontSize: 14, letterSpacing: 2 }}>
                  {"★".repeat(t.rating || 5)}{"☆".repeat(5 - (t.rating || 5))}
                </div>
              )}
              <p style={{ color: `${tx}99`, fontSize: 14, lineHeight: 1.7, flex: 1, marginBottom: 20 }}>
                &ldquo;{t.text}&rdquo;
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: "50%",
                  background: `linear-gradient(135deg, ${primary}44, ${accent}44)`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 14, fontWeight: 600,
                }}>
                  {t.name[0]}
                </div>
                <div>
                  <p style={{ fontWeight: 600, fontSize: 14 }}>{t.name}</p>
                  <p style={{ color: `${tx}66`, fontSize: 12 }}>{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA — matches deployed (radial glow, not blob) */}
      <div style={{
        padding: "80px 24px", textAlign: "center",
        borderTop: `1px solid ${tx}0d`,
        position: "relative", overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", bottom: "-50%", left: "50%", transform: "translateX(-50%)",
          width: "90%", maxWidth: 800, height: 400,
          background: `radial-gradient(ellipse, ${primary}10 0%, transparent 70%)`,
          filter: "blur(80px)", pointerEvents: "none",
        }} />
        <div style={{ position: "relative", maxWidth: 550, margin: "0 auto" }}>
          <h2 style={{ fontSize: 30, fontWeight: 700, letterSpacing: "-0.02em", marginBottom: 16 }}>
            {aiCta?.headline || "Ready to get started?"}
          </h2>
          <p style={{ color: `${tx}80`, fontSize: 16, lineHeight: 1.7, marginBottom: 32 }}>
            {aiCta?.subheadline || tagline || "Join thousands of happy customers"}
          </p>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "14px 32px", borderRadius: 10,
            background: primary, color: "#fff",
            fontWeight: 600, fontSize: 15,
            boxShadow: `0 4px 16px ${primary}33`,
          }}>
            {aiCta?.button_text || (isServices ? "Book a Strategy Call" : "Get Started")}
            <span style={{ fontSize: 18 }}>&rarr;</span>
          </div>
        </div>
      </div>
    </>
  );
}

function MinimalPreview({ name, tagline, primary, accent, secondary, tx, type, siteContent }: PreviewProps) {
  return (
    <>
      {/* Hero — editorial style */}
      <div style={{ padding: "100px 48px 70px", maxWidth: 680, margin: "0 auto" }}>
        <span style={{
          display: "inline-block", fontSize: 12, fontWeight: 600,
          textTransform: "uppercase", letterSpacing: "0.15em",
          color: primary, marginBottom: 24,
        }}>
          {type === "services" ? "Professional Services" : "Digital Products"}
        </span>
        <h1 style={{ fontSize: 56, fontWeight: 800, lineHeight: 1.0, marginBottom: 24, letterSpacing: "-0.02em" }}>
          {name}
        </h1>
        <p style={{ fontSize: 19, opacity: 0.55, lineHeight: 1.8, marginBottom: 44, maxWidth: 520 }}>
          {tagline || "A clean, personal approach to everything we do."}
        </p>
        <div style={{ display: "flex", gap: 14 }}>
          <GradientButton primary={primary} accent={accent}>Work With Me</GradientButton>
          <OutlineButton tx={tx}>Learn More</OutlineButton>
        </div>
      </div>

      <Divider tx={tx} />

      {/* About */}
      <div style={{ padding: "56px 48px", maxWidth: 680, margin: "0 auto" }}>
        <h2 style={{ fontSize: 26, fontWeight: 700, marginBottom: 18 }}>About</h2>
        <p style={{ opacity: 0.45, lineHeight: 2.0, fontSize: 15, marginBottom: 28 }}>
          We believe in a thoughtful, personalized approach. Every client gets dedicated attention and a strategy built just for them. Quality over quantity, always.
        </p>
        {/* Mission quote */}
        <div style={{
          padding: "22px 24px",
          borderLeft: `3px solid ${primary}`,
          background: `${primary}08`,
          borderRadius: "0 12px 12px 0",
        }}>
          <p style={{ color: primary, fontWeight: 600, fontStyle: "italic", lineHeight: 1.6, fontSize: 14 }}>
            &ldquo;Our mission is to deliver exceptional results through authentic partnership and deep expertise.&rdquo;
          </p>
        </div>
      </div>

      <Divider tx={tx} />

      {/* Offerings — list style */}
      <div style={{ padding: "56px 48px", maxWidth: 680, margin: "0 auto" }}>
        <h2 style={{ fontSize: 26, fontWeight: 700, marginBottom: 32 }}>How I Can Help</h2>
        {["Starter Package", "Pro Package", "VIP Package"].map((pkg, i) => (
          <div key={pkg} style={{
            padding: "24px 0",
            borderBottom: i < 2 ? `1px solid ${tx}08` : "none",
            display: "grid",
            gridTemplateColumns: "1fr auto",
            gap: 20,
            alignItems: "start",
          }}>
            <div>
              <h3 style={{ fontWeight: 600, fontSize: 17, marginBottom: 6 }}>{pkg}</h3>
              <p style={{ opacity: 0.4, fontSize: 13, lineHeight: 1.6 }}>
                Comprehensive solutions tailored to your unique goals.
              </p>
            </div>
            <StatNumber primary={primary} accent={accent}>
              <span style={{ fontSize: 20, whiteSpace: "nowrap" }}>${(i + 1) * 299}/mo</span>
            </StatNumber>
          </div>
        ))}
      </div>

      {/* Testimonial */}
      <Divider tx={tx} />
      <div style={{ padding: "56px 48px", maxWidth: 680, margin: "0 auto" }}>
        <h2 style={{ fontSize: 26, fontWeight: 700, marginBottom: 28 }}>What Clients Say</h2>
        <div style={{
          padding: 24, borderRadius: 16,
          border: `1px solid ${tx}08`, background: `${tx}03`,
          position: "relative",
        }}>
          <span style={{
            fontSize: 52, fontFamily: "Georgia, serif", color: `${primary}22`,
            position: "absolute", top: 8, left: 18, lineHeight: 1,
          }}>&ldquo;</span>
          <p style={{ opacity: 0.5, fontSize: 14, lineHeight: 1.8, marginBottom: 16, paddingLeft: 28, fontStyle: "italic" }}>
            &ldquo;A truly personal experience. They understood exactly what we needed and delivered beyond expectations.&rdquo;
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: 10, paddingLeft: 28 }}>
            <div style={{
              width: 32, height: 32, borderRadius: "50%",
              background: `linear-gradient(135deg, ${primary}33, ${accent}33)`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 13, fontWeight: 700,
            }}>
              A
            </div>
            <div>
              <p style={{ fontWeight: 600, fontSize: 13 }}>Alex K.</p>
              <p style={{ opacity: 0.35, fontSize: 11 }}>CEO, TechStart</p>
            </div>
          </div>
        </div>
      </div>

      <Divider tx={tx} />

      {/* CTA */}
      <div style={{ padding: "72px 48px", maxWidth: 680, margin: "0 auto", textAlign: "center" }}>
        <h2 style={{ fontSize: 32, fontWeight: 800, marginBottom: 16 }}>
          Let&apos;s work together
        </h2>
        <p style={{ opacity: 0.4, marginBottom: 36, fontSize: 15 }}>
          {tagline || "See what we can do for you"}
        </p>
        <GradientButton primary={primary} accent={accent}>Get In Touch</GradientButton>
      </div>
    </>
  );
}

function CreatorPreview({ name, tagline, primary, accent, secondary, tx, type, siteContent }: PreviewProps) {
  return (
    <>
      {/* Hero with blobs + gradient text */}
      <div style={{ padding: "80px 32px 56px", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <Blob color={primary} size={420} top={-200} left={-80} opacity={0.25} />
        <Blob color={accent} size={340} top={-140} right={-60} opacity={0.18} />
        <div style={{ position: "relative", zIndex: 1, maxWidth: 700, margin: "0 auto" }}>
          {/* Pill badge */}
          <span style={{
            display: "inline-block",
            padding: "8px 20px",
            borderRadius: 100,
            background: `${primary}15`,
            border: `1px solid ${primary}25`,
            fontSize: 12,
            fontWeight: 600,
            color: primary,
            marginBottom: 24,
          }}>
            {type === "services" ? "Premium Services" : "Digital Products"}
          </span>
          <h1 style={{ fontSize: 46, fontWeight: 800, lineHeight: 1.05, marginBottom: 16 }}>
            <GradientText primary={primary} accent={accent}>
              {name}
            </GradientText>
          </h1>
          <p style={{ fontSize: 16, opacity: 0.5, marginBottom: 36, lineHeight: 1.7, maxWidth: 520, margin: "0 auto 36px" }}>
            {tagline || `The best ${type === "services" ? "service" : "digital products"} for your needs`}
          </p>
          <GradientButton primary={primary} accent={accent}>
            Browse {type === "services" ? "Services" : "Products"}
          </GradientButton>
        </div>
      </div>

      {/* Featured product — glow card */}
      <div style={{ padding: "0 32px 48px", maxWidth: 720, margin: "0 auto" }}>
        <div style={{
          padding: 32,
          borderRadius: 16,
          border: `1px solid ${primary}22`,
          background: `linear-gradient(135deg, ${primary}08, transparent, ${accent}05)`,
          position: "relative",
          overflow: "hidden",
        }}>
          {/* Glow border accent */}
          <div style={{
            position: "absolute", top: 0, left: 0, right: 0, height: 3,
            background: `linear-gradient(90deg, ${primary}, ${accent})`,
          }} />
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
            <span style={{
              padding: "6px 16px", borderRadius: 100,
              background: `linear-gradient(135deg, ${primary}, ${accent})`,
              fontSize: 10, fontWeight: 700, color: "#fff",
              textTransform: "uppercase", letterSpacing: "0.08em",
            }}>
              Featured
            </span>
            <StatNumber primary={primary} accent={accent}>
              <span style={{ fontSize: 22 }}>$497</span>
            </StatNumber>
          </div>
          <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 12 }}>
            Flagship {type === "services" ? "Package" : "Course"}
          </h2>
          <p style={{ opacity: 0.45, fontSize: 14, lineHeight: 1.7, marginBottom: 24 }}>
            Everything you need to get started. Includes lifetime access, community, and 1-on-1 support.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 24 }}>
            {["Lifetime access", "1-on-1 support", "Community access", "Monthly updates"].map(f => (
              <div key={f} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, opacity: 0.5 }}>
                <span style={{ color: primary, fontWeight: 700 }}>&#10003;</span> {f}
              </div>
            ))}
          </div>
          <GradientButton primary={primary} accent={accent} style={{ fontSize: 14, padding: "12px 28px" }}>
            Get Started
          </GradientButton>
        </div>
      </div>

      {/* Product grid — glass cards */}
      <div style={{ padding: "0 32px 48px" }}>
        <h2 style={{ fontSize: 24, fontWeight: 700, textAlign: "center", marginBottom: 24 }}>
          More {type === "services" ? "Services" : "Products"}
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          {[
            { name: "Starter Kit", price: "$197", desc: "Perfect for beginners. Get the essentials to start strong." },
            { name: "Pro Bundle", price: "$347", desc: "Advanced strategies and tools for serious growth." },
          ].map((prod) => (
            <GlassCard key={prod.name} tx={tx} primary={primary}>
              <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 6 }}>{prod.name}</h3>
              <p style={{ fontSize: 12, opacity: 0.45, marginBottom: 14, lineHeight: 1.6 }}>{prod.desc}</p>
              <StatNumber primary={primary} accent={accent}>
                <span style={{ fontSize: 16 }}>{prod.price}</span>
              </StatNumber>
            </GlassCard>
          ))}
        </div>
      </div>

      {/* Testimonials with stars */}
      <div style={{ padding: "0 32px 48px", textAlign: "center" }}>
        <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24 }}>What Customers Say</h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, textAlign: "left" }}>
          {[
            { name: "Chris D.", role: "Entrepreneur", text: "This changed everything for my business. Worth every penny." },
            { name: "Maya L.", role: "Creator", text: "The quality is incredible. I recommend it to everyone I know." },
          ].map((t) => (
            <div key={t.name} style={{
              padding: 22, borderRadius: 16,
              border: `1px solid ${tx}08`, background: `${tx}03`,
              position: "relative",
            }}>
              <span style={{
                fontSize: 48, fontFamily: "Georgia, serif", color: `${primary}20`,
                position: "absolute", top: 6, left: 16, lineHeight: 1,
              }}>&ldquo;</span>
              <div style={{ marginBottom: 10, paddingLeft: 24 }}>
                {[1,2,3,4,5].map(i => (
                  <span key={i} style={{ color: primary, fontSize: 13 }}>&#9733;</span>
                ))}
              </div>
              <p style={{ opacity: 0.5, fontSize: 13, lineHeight: 1.7, marginBottom: 14, paddingLeft: 24, fontStyle: "italic" }}>
                &ldquo;{t.text}&rdquo;
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: "50%",
                  background: `linear-gradient(135deg, ${primary}, ${accent})`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "#fff", fontSize: 14, fontWeight: 700,
                }}>
                  {t.name[0]}
                </div>
                <div>
                  <p style={{ fontWeight: 600, fontSize: 13 }}>{t.name}</p>
                  <p style={{ opacity: 0.35, fontSize: 11 }}>{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA with gradient blob */}
      <div style={{ padding: "56px 32px", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <Blob color={secondary} size={250} top={-60} left="25%" opacity={0.2} />
        <div style={{ position: "relative", zIndex: 1 }}>
          <h2 style={{ fontSize: 30, fontWeight: 800, marginBottom: 14 }}>
            <GradientText primary={primary} accent={accent}>
              Ready to get started?
            </GradientText>
          </h2>
          <p style={{ opacity: 0.4, marginBottom: 32, fontSize: 14 }}>
            {tagline || "Join thousands of happy customers"}
          </p>
          <GradientButton primary={primary} accent={accent}>Get Started Now</GradientButton>
        </div>
      </div>
    </>
  );
}
