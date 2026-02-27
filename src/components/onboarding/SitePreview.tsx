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
}

export default function SitePreview({
  businessName,
  tagline,
  type,
  colors,
  layout,
  slug,
}: SitePreviewProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const p = colors.primary;
  const bg = colors.background;
  const tx = colors.text;

  const previewContent = (
    <div
      style={{
        width: "286%", // 1 / 0.35
        transform: "scale(0.35)",
        transformOrigin: "top left",
        background: bg,
        color: tx,
        fontFamily: "Inter, system-ui, sans-serif",
        minHeight: 1400,
        transition: "background 0.4s, color 0.4s",
      }}
    >
      {/* Nav */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px 32px",
          borderBottom: `1px solid ${tx}15`,
        }}
      >
        <span style={{ fontWeight: 800, fontSize: 18, color: p }}>{businessName}</span>
        <div style={{ display: "flex", gap: 24, fontSize: 13, opacity: 0.6 }}>
          <span>Home</span>
          <span>About</span>
          <span>{type === "services" ? "Services" : "Products"}</span>
          <span>Contact</span>
        </div>
      </div>

      {layout === "minimal" ? (
        <MinimalPreview name={businessName} tagline={tagline} primary={p} tx={tx} />
      ) : layout === "creator" ? (
        <CreatorPreview name={businessName} tagline={tagline} primary={p} tx={tx} type={type} />
      ) : (
        <DefaultPreview name={businessName} tagline={tagline} primary={p} tx={tx} type={type} />
      )}
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
            background: "#111118",
          }}
        >
          {/* Browser chrome */}
          <div
            style={{
              padding: "10px 14px",
              background: "#1a1a24",
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
          <div style={{ height: 500, overflow: "hidden", position: "relative" }}>
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
            background: "#111118",
            color: "#748ffc",
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
              background: "#111118",
            }}
          >
            <div style={{ height: 300, overflow: "hidden" }}>
              {previewContent}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

// ── Layout sub-previews ──

function DefaultPreview({ name, tagline, primary, tx, type }: { name: string; tagline: string; primary: string; tx: string; type: string }) {
  return (
    <>
      {/* Hero */}
      <div style={{ padding: "80px 32px 60px", textAlign: "center" }}>
        <h1 style={{ fontSize: 42, fontWeight: 800, lineHeight: 1.1, marginBottom: 12 }}>{name}</h1>
        <p style={{ fontSize: 18, opacity: 0.6, marginBottom: 32 }}>{tagline || "Your tagline goes here"}</p>
        <div style={{ display: "inline-block", padding: "14px 36px", borderRadius: 10, background: primary, color: "#fff", fontWeight: 700, fontSize: 15 }}>
          Get Started
        </div>
      </div>

      {/* Trust bar */}
      <div style={{ display: "flex", justifyContent: "center", gap: 48, padding: "28px 32px", borderTop: `1px solid ${tx}10`, borderBottom: `1px solid ${tx}10` }}>
        {["500+ Clients", "4.9/5 Rating", "100% Guaranteed"].map((s) => (
          <div key={s} style={{ textAlign: "center" }}>
            <p style={{ color: primary, fontWeight: 800, fontSize: 20 }}>{s.split(" ")[0]}</p>
            <p style={{ fontSize: 12, opacity: 0.4 }}>{s.split(" ").slice(1).join(" ")}</p>
          </div>
        ))}
      </div>

      {/* Features */}
      <div style={{ padding: "48px 32px" }}>
        <h2 style={{ fontSize: 24, fontWeight: 700, textAlign: "center", marginBottom: 32 }}>Why Choose {name}</h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
          {["Expert {type}", "Fast Results", "24/7 Support"].map((f) => (
            <div key={f} style={{ padding: 20, borderRadius: 12, border: `1px solid ${tx}10`, background: `${tx}05` }}>
              <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 8 }}>{f.replace("{type}", type === "services" ? "Service" : "Products")}</h3>
              <p style={{ fontSize: 13, opacity: 0.5, lineHeight: 1.5 }}>High quality solutions tailored to your specific needs.</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div style={{ padding: "48px 32px", textAlign: "center" }}>
        <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 12 }}>Ready to get started?</h2>
        <p style={{ opacity: 0.5, marginBottom: 28 }}>{tagline || "Join thousands of happy customers"}</p>
        <div style={{ display: "inline-block", padding: "14px 36px", borderRadius: 10, background: primary, color: "#fff", fontWeight: 700, fontSize: 15 }}>
          Get Started Now
        </div>
      </div>
    </>
  );
}

function MinimalPreview({ name, tagline, primary, tx }: { name: string; tagline: string; primary: string; tx: string }) {
  return (
    <>
      <div style={{ padding: "100px 48px 60px", maxWidth: 680, margin: "0 auto" }}>
        <h1 style={{ fontSize: 52, fontWeight: 800, lineHeight: 1.05, marginBottom: 20 }}>{name}</h1>
        <p style={{ fontSize: 20, opacity: 0.6, lineHeight: 1.7, marginBottom: 40 }}>
          {tagline || "A clean, personal approach to everything we do."}
        </p>
        <div style={{ display: "inline-block", padding: "14px 36px", borderRadius: 10, background: primary, color: "#fff", fontWeight: 700, fontSize: 15 }}>
          Work With Me
        </div>
      </div>

      <div style={{ padding: "48px 48px", maxWidth: 680, margin: "0 auto", borderTop: `1px solid ${tx}10` }}>
        <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 16 }}>About</h2>
        <p style={{ opacity: 0.5, lineHeight: 1.8 }}>
          We believe in a thoughtful, personalized approach. Every client gets dedicated attention and a strategy built just for them.
        </p>
      </div>

      <div style={{ padding: "48px 48px", maxWidth: 680, margin: "0 auto", borderTop: `1px solid ${tx}10` }}>
        {["Starter Package", "Pro Package", "VIP Package"].map((pkg, i) => (
          <div key={pkg} style={{ padding: "20px 0", borderBottom: i < 2 ? `1px solid ${tx}10` : "none", display: "flex", justifyContent: "space-between" }}>
            <span style={{ fontWeight: 600 }}>{pkg}</span>
            <span style={{ color: primary, fontWeight: 700 }}>${(i + 1) * 299}/mo</span>
          </div>
        ))}
      </div>
    </>
  );
}

function CreatorPreview({ name, tagline, primary, tx, type }: { name: string; tagline: string; primary: string; tx: string; type: string }) {
  return (
    <>
      {/* Hero */}
      <div style={{ padding: "80px 32px 48px", textAlign: "center" }}>
        <h1 style={{ fontSize: 40, fontWeight: 800, lineHeight: 1.1, marginBottom: 12 }}>{name}</h1>
        <p style={{ fontSize: 17, opacity: 0.6, marginBottom: 32 }}>
          {tagline || `The best ${type === "services" ? "service" : "digital products"} for your needs`}
        </p>
      </div>

      {/* Featured product */}
      <div style={{ padding: "0 32px 48px", maxWidth: 700, margin: "0 auto" }}>
        <div style={{ padding: 28, borderRadius: 14, border: `1px solid ${tx}10`, background: `${tx}05` }}>
          <span style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em", color: primary, fontWeight: 700 }}>Featured</span>
          <h2 style={{ fontSize: 26, fontWeight: 800, margin: "8px 0 12px" }}>Flagship {type === "services" ? "Package" : "Course"}</h2>
          <p style={{ opacity: 0.5, fontSize: 14, lineHeight: 1.6, marginBottom: 20 }}>
            Everything you need to get started. Includes lifetime access, community, and 1-on-1 support.
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ padding: "12px 28px", borderRadius: 10, background: primary, color: "#fff", fontWeight: 700, fontSize: 14 }}>
              Get Started
            </div>
            <span style={{ color: primary, fontWeight: 800, fontSize: 22 }}>$497</span>
          </div>
        </div>
      </div>

      {/* Product grid */}
      <div style={{ padding: "0 32px 48px" }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, textAlign: "center", marginBottom: 24 }}>More {type === "services" ? "Services" : "Products"}</h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          {["Starter Kit", "Pro Bundle"].map((p) => (
            <div key={p} style={{ padding: 20, borderRadius: 12, border: `1px solid ${tx}10`, background: `${tx}05` }}>
              <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>{p}</h3>
              <p style={{ fontSize: 12, opacity: 0.5, marginBottom: 12 }}>A great way to get started with proven strategies.</p>
              <span style={{ color: primary, fontWeight: 700, fontSize: 14 }}>$197</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
