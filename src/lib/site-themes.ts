// ─────────────────────────────────────────────────────────────────────────────
// Site Themes — 25 distinct visual identities for generated landing pages
// Each theme is selected deterministically from the business slug hash.
// ─────────────────────────────────────────────────────────────────────────────

export interface ThemeVars {
  primary: string;      // brand primary color
  accent: string;       // brand accent color
  bg: string;           // effective background (may be overridden by theme)
  textColor: string;    // effective text color
  tb: string;           // "0,0,0" or "255,255,255" for rgba()
  ctaText: string;      // text on CTA buttons
  shadowAlpha: string;  // shadow opacity string
  isLight: boolean;
  headingFont: string;
  isServices: boolean;
}

export type HeroVariant = "centered" | "left" | "oversized" | "split" | "editorial" | "minimal";

export interface SiteTheme {
  id: string;
  overrideBg?: string;
  overrideText?: string;
  overrideTb?: string; // "0,0,0" or "255,255,255"
  heroVariant: HeroVariant;
  heroFontSize: string;
  statsFirst: boolean;
  testimonialsEarly: boolean;
  noVideo: boolean;
  themeCSS: (v: ThemeVars) => string;
}

export function getTheme(slug: string): SiteTheme {
  let h = 5381;
  for (let i = 0; i < slug.length; i++) {
    h = ((h << 5) + h) ^ slug.charCodeAt(i);
    h = h | 0; // 32-bit int
  }
  return THEMES[Math.abs(h) % THEMES.length];
}

// ─── Theme Helpers ────────────────────────────────────────────────────────────

// Returns the effective ThemeVars after applying theme overrides
export function resolveVars(base: ThemeVars, theme: SiteTheme): ThemeVars {
  const bg = theme.overrideBg ?? base.bg;
  const textColor = theme.overrideText ?? base.textColor;
  const tb = theme.overrideTb ?? base.tb;
  const isLight = tb === "0,0,0";
  const shadowAlpha = isLight ? "0.08" : "0.3";
  return { ...base, bg, textColor, tb, isLight, shadowAlpha };
}

// ─── Hero HTML Builders ───────────────────────────────────────────────────────

interface HeroData {
  headline: string;
  subheadline: string;
  badge: string;
  ctaLabel: string;
  ctaHref: string;
  imageHtml: string; // pre-built hero image/visual HTML
}

export function buildHero(
  variant: HeroVariant,
  heroFontSize: string,
  data: HeroData,
  v: ThemeVars
): string {
  const { headline, subheadline, badge, ctaLabel, ctaHref, imageHtml } = data;

  const badgeHtml = badge
    ? `<div style="display:inline-flex;align-items:center;gap:8px;padding:6px 16px;border-radius:100px;border:1px solid rgba(${v.tb},0.12);background:rgba(${v.tb},0.04);font-size:13px;font-weight:500;color:rgba(${v.tb},0.55);margin-bottom:28px">
        <span style="width:7px;height:7px;border-radius:50%;background:${v.primary};display:inline-block"></span>
        ${badge}
      </div>`
    : "";

  const ctaBtns = `
    <div style="display:flex;gap:12px;flex-wrap:wrap">
      <a href="${ctaHref}" class="cta-btn">
        ${ctaLabel} <span style="font-size:16px">&rarr;</span>
      </a>
      <a href="/about" class="btn-secondary">Learn More</a>
    </div>`;

  const ctaBtnSingle = `
    <a href="${ctaHref}" class="cta-btn">
      ${ctaLabel} <span style="font-size:16px">&rarr;</span>
    </a>`;

  if (variant === "centered") {
    return `
      <section style="min-height:90vh;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:80px 24px 40px;position:relative;overflow:hidden">
        <div style="position:absolute;top:-40%;left:50%;transform:translateX(-50%);width:80%;max-width:700px;height:500px;background:radial-gradient(ellipse,${v.primary}15 0%,transparent 70%);filter:blur(60px);pointer-events:none"></div>
        <div style="position:relative;max-width:720px;margin:0 auto">
          ${badgeHtml}
          <h1 class="hero-animate" style="font-size:${heroFontSize};font-weight:800;line-height:1.08;letter-spacing:-0.03em;margin-bottom:24px">${headline}</h1>
          <p class="hero-animate-sub" style="font-size:clamp(1rem,2.5vw,1.2rem);color:rgba(${v.tb},0.5);line-height:1.7;margin-bottom:40px;max-width:560px;margin-left:auto;margin-right:auto">${subheadline}</p>
          <div class="hero-animate-cta" style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap;margin-bottom:64px">
            <a href="${ctaHref}" class="cta-btn">${ctaLabel} <span style="font-size:16px">&rarr;</span></a>
            <a href="/about" class="btn-secondary">Learn More</a>
          </div>
        </div>
        <div class="hero-animate-img" style="position:relative;max-width:900px;width:100%;margin:0 auto;padding:0 24px">
          ${imageHtml}
        </div>
      </section>`;
  }

  if (variant === "left") {
    return `
      <section style="min-height:88vh;display:flex;align-items:center;padding:80px 24px;position:relative;overflow:hidden">
        <div style="position:absolute;top:10%;left:-10%;width:600px;height:600px;background:radial-gradient(ellipse,${v.primary}10 0%,transparent 65%);filter:blur(80px);pointer-events:none"></div>
        <div style="position:relative;max-width:1100px;margin:0 auto;width:100%">
          ${badgeHtml}
          <h1 class="hero-animate" style="font-size:${heroFontSize};font-weight:800;line-height:1.08;letter-spacing:-0.03em;margin-bottom:28px;max-width:800px">${headline}</h1>
          <p class="hero-animate-sub" style="font-size:clamp(1rem,2.5vw,1.15rem);color:rgba(${v.tb},0.5);line-height:1.7;margin-bottom:40px;max-width:520px">${subheadline}</p>
          <div class="hero-animate-cta">${ctaBtns}</div>
          <div class="hero-animate-img" style="margin-top:72px;max-width:900px">${imageHtml}</div>
        </div>
      </section>`;
  }

  if (variant === "oversized") {
    return `
      <section style="min-height:100vh;display:flex;flex-direction:column;justify-content:flex-end;padding:80px 48px 80px;position:relative;overflow:hidden">
        <div style="position:absolute;top:0;left:0;right:0;bottom:0;background:radial-gradient(ellipse at 20% 50%,${v.primary}0A 0%,transparent 60%);pointer-events:none"></div>
        <div style="position:relative;max-width:1200px;margin:0 auto;width:100%">
          ${badgeHtml}
          <h1 class="hero-animate" style="font-size:${heroFontSize};font-weight:900;line-height:0.95;letter-spacing:-0.045em;margin-bottom:48px;max-width:1100px">${headline}</h1>
          <div class="hero-animate-cta" style="display:flex;align-items:flex-start;gap:64px;flex-wrap:wrap">
            <div>
              ${ctaBtns}
            </div>
            <p class="hero-animate-sub" style="font-size:1rem;color:rgba(${v.tb},0.45);line-height:1.8;max-width:380px;border-left:2px solid ${v.primary}44;padding-left:20px">${subheadline}</p>
          </div>
        </div>
      </section>`;
  }

  if (variant === "split") {
    return `
      <section style="min-height:88vh;display:flex;align-items:center;padding:80px 24px;position:relative;overflow:hidden">
        <div style="max-width:1100px;margin:0 auto;width:100%;display:grid;grid-template-columns:1fr 1fr;gap:80px;align-items:center">
          <div>
            ${badgeHtml}
            <h1 class="hero-animate" style="font-size:${heroFontSize};font-weight:800;line-height:1.08;letter-spacing:-0.03em;margin-bottom:24px">${headline}</h1>
            <p class="hero-animate-sub" style="font-size:1.1rem;color:rgba(${v.tb},0.5);line-height:1.7;margin-bottom:40px">${subheadline}</p>
            <div class="hero-animate-cta">${ctaBtns}</div>
          </div>
          <div class="hero-animate-img" style="position:relative">
            ${imageHtml}
          </div>
        </div>
        <style>@media(max-width:767px){.hero-split-grid{grid-template-columns:1fr !important;gap:40px !important}}</style>
      </section>`;
  }

  if (variant === "editorial") {
    return `
      <section style="padding:120px 24px 80px;position:relative;border-bottom:1px solid rgba(${v.tb},0.08)">
        <div style="max-width:960px;margin:0 auto">
          <p class="hero-animate" style="font-size:12px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:${v.primary};margin-bottom:20px">${badge || (v.isServices ? "Professional Services" : "Digital Products")}</p>
          <h1 class="hero-animate" style="font-size:${heroFontSize};font-weight:800;line-height:1.08;letter-spacing:-0.03em;margin-bottom:0">${headline}</h1>
          <div class="hero-animate-sub" style="display:grid;grid-template-columns:1fr auto;gap:40px;align-items:center;border-top:1px solid rgba(${v.tb},0.1);border-bottom:1px solid rgba(${v.tb},0.1);padding:24px 0;margin:32px 0">
            <p style="font-size:1.05rem;color:rgba(${v.tb},0.5);line-height:1.7;max-width:520px">${subheadline}</p>
            <div class="hero-animate-cta">${ctaBtns}</div>
          </div>
        </div>
        <div class="hero-animate-img" style="max-width:960px;margin:0 auto">${imageHtml}</div>
      </section>`;
  }

  // minimal
  return `
    <section style="min-height:85vh;display:flex;align-items:center;padding:80px 24px">
      <div style="max-width:680px;margin:0 auto;text-align:center">
        ${badgeHtml}
        <h1 class="hero-animate" style="font-size:${heroFontSize};font-weight:700;line-height:1.1;letter-spacing:-0.025em;margin-bottom:24px">${headline}</h1>
        <p class="hero-animate-sub" style="font-size:1.1rem;color:rgba(${v.tb},0.5);line-height:1.7;margin-bottom:36px">${subheadline}</p>
        <div class="hero-animate-cta">${ctaBtnSingle}</div>
      </div>
    </section>`;
}

// ─── 25 Themes ────────────────────────────────────────────────────────────────

export const THEMES: SiteTheme[] = [

  // ── 1. OBSIDIAN — Pure black, ultra-minimal, oversized left ───────────────
  {
    id: "obsidian",
    overrideBg: "#000000",
    overrideText: "#FFFFFF",
    overrideTb: "255,255,255",
    heroVariant: "oversized",
    heroFontSize: "clamp(3.5rem, 8vw, 7rem)",
    statsFirst: true,
    testimonialsEarly: false,
    noVideo: false,
    themeCSS: (v) => `
body { background: #000 !important; color: #fff !important; }
.gradient-text { background: none !important; -webkit-text-fill-color: #fff !important; color: #fff !important; font-weight: 900; }
.cta-btn { background: #fff !important; color: #000 !important; border-radius: 4px !important; box-shadow: none !important; font-weight: 700; letter-spacing: -0.01em; }
.cta-btn:hover { background: #eee !important; transform: none !important; box-shadow: none !important; filter: none !important; }
.btn-secondary { border: 1px solid rgba(255,255,255,0.18) !important; border-radius: 4px !important; }
.card { background: transparent !important; border: 1px solid rgba(255,255,255,0.09) !important; border-radius: 6px !important; }
.card:hover { border-color: rgba(255,255,255,0.22) !important; background: rgba(255,255,255,0.015) !important; transform: none !important; box-shadow: none !important; }
.section { padding: 110px 24px !important; }
nav { background: #000 !important; }
footer { background: #000 !important; }
@keyframes obBreath { 0%, 100% { opacity: 1; } 50% { opacity: 0.7; } }
.hero-animate { animation: fadeUp 0.7s cubic-bezier(0.22, 1, 0.36, 1) both, obBreath 6s 0.7s ease-in-out infinite !important; }
`,
  },

  // ── 2. ONYX — Warm charcoal, amber accents, editorial left ───────────────
  {
    id: "onyx",
    overrideBg: "#0F0E0C",
    overrideText: "#F5F0E8",
    overrideTb: "255,255,255",
    heroVariant: "left",
    heroFontSize: "clamp(2.8rem, 6vw, 5.5rem)",
    statsFirst: false,
    testimonialsEarly: true,
    noVideo: false,
    themeCSS: (v) => `
body { background: #0F0E0C !important; color: #F5F0E8 !important; }
.gradient-text { background: linear-gradient(135deg, #C8A44E, #E8C876) !important; -webkit-background-clip: text !important; -webkit-text-fill-color: transparent !important; background-clip: text !important; }
.cta-btn { background: linear-gradient(135deg, #C8A44E, #D4B366) !important; color: #0F0E0C !important; border-radius: 8px !important; font-weight: 700 !important; box-shadow: 0 4px 20px rgba(200,164,78,0.22) !important; }
.cta-btn:hover { box-shadow: 0 8px 32px rgba(200,164,78,0.35) !important; }
.btn-secondary { border-color: rgba(245,240,232,0.14) !important; }
.card { background: rgba(245,240,232,0.025) !important; border: 1px solid rgba(245,240,232,0.07) !important; border-radius: 10px !important; }
.card:hover { border-color: rgba(200,164,78,0.28) !important; background: rgba(200,164,78,0.03) !important; transform: none !important; }
nav { background: #0F0E0C !important; }
`,
  },

  // ── 3. MIDNIGHT — Deep navy, blue glow, centered ──────────────────────────
  {
    id: "midnight",
    overrideBg: "#0A0E1A",
    overrideText: "#E8EDFF",
    overrideTb: "255,255,255",
    heroVariant: "centered",
    heroFontSize: "clamp(2.5rem, 6vw, 5rem)",
    statsFirst: true,
    testimonialsEarly: false,
    noVideo: false,
    themeCSS: (v) => `
body { background: #0A0E1A !important; color: #E8EDFF !important; }
.gradient-text { background: linear-gradient(135deg, ${v.primary}, #60A5FA) !important; -webkit-background-clip: text !important; -webkit-text-fill-color: transparent !important; background-clip: text !important; }
.cta-btn { background: linear-gradient(135deg, ${v.primary}, #60A5FA) !important; color: #fff !important; box-shadow: 0 4px 24px ${v.primary}44 !important; }
.card { background: rgba(255,255,255,0.03) !important; border: 1px solid rgba(99,149,255,0.12) !important; border-radius: 12px !important; }
.card:hover { border-color: rgba(99,149,255,0.28) !important; background: rgba(99,149,255,0.04) !important; transform: none !important; }
nav { background: #0A0E1A !important; border-bottom: 1px solid rgba(99,149,255,0.1) !important; }
.section { padding: 100px 24px !important; }
@keyframes midScan { 0% { top: -2px; opacity: 0; } 5% { opacity: 1; } 95% { opacity: 0.6; } 100% { top: 100vh; opacity: 0; } }
body::after { content: ''; position: fixed; left: 0; right: 0; height: 1px; background: linear-gradient(90deg, transparent, rgba(99,149,255,0.5), transparent); animation: midScan 10s ease-in-out infinite; pointer-events: none; z-index: 9998; }
`,
  },

  // ── 4. CARBON — Dark gray, CSS grid lines, technical ─────────────────────
  {
    id: "carbon",
    overrideBg: "#111111",
    overrideText: "#F0F0F0",
    overrideTb: "255,255,255",
    heroVariant: "centered",
    heroFontSize: "clamp(2.5rem, 5.5vw, 4.5rem)",
    statsFirst: false,
    testimonialsEarly: false,
    noVideo: false,
    themeCSS: (v) => `
body { background: #111 !important; color: #F0F0F0 !important; background-image: linear-gradient(rgba(255,255,255,0.02) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.02) 1px,transparent 1px) !important; background-size: 40px 40px !important; }
.gradient-text { background: linear-gradient(135deg, ${v.primary}, ${v.accent}) !important; -webkit-background-clip: text !important; -webkit-text-fill-color: transparent !important; background-clip: text !important; }
.cta-btn { border-radius: 4px !important; font-family: 'Courier New', monospace !important; font-size: 14px !important; letter-spacing: 0.02em !important; }
.card { background: rgba(17,17,17,0.9) !important; border: 1px solid rgba(255,255,255,0.08) !important; border-radius: 4px !important; border-top: 2px solid ${v.primary}66 !important; }
.card:hover { border-top-color: ${v.primary} !important; transform: none !important; }
.section { padding: 100px 24px !important; }
nav { background: #111 !important; }
@keyframes carScan { 0% { background-position: 0 0, 0 0; } 100% { background-position: 0 40px, 0 40px; } }
body { animation: carScan 3s linear infinite !important; }
`,
  },

  // ── 5. ECLIPSE — Deep purple, centered large, glow ────────────────────────
  {
    id: "eclipse",
    overrideBg: "#0C0818",
    overrideText: "#F0EEFF",
    overrideTb: "255,255,255",
    heroVariant: "centered",
    heroFontSize: "clamp(2.8rem, 6vw, 5rem)",
    statsFirst: false,
    testimonialsEarly: false,
    noVideo: true,
    themeCSS: (v) => `
body { background: #0C0818 !important; color: #F0EEFF !important; }
.gradient-text { background: linear-gradient(135deg, #B07EFF, #E0C8FF) !important; -webkit-background-clip: text !important; -webkit-text-fill-color: transparent !important; background-clip: text !important; }
.cta-btn { background: linear-gradient(135deg, #7B39FC, #A855F7) !important; color: #fff !important; box-shadow: 0 4px 28px rgba(123,57,252,0.4) !important; border-radius: 10px !important; }
.cta-btn:hover { box-shadow: 0 8px 40px rgba(123,57,252,0.55) !important; }
.card { background: rgba(123,57,252,0.04) !important; border: 1px solid rgba(168,85,247,0.15) !important; border-radius: 14px !important; }
.card:hover { border-color: rgba(168,85,247,0.35) !important; background: rgba(123,57,252,0.07) !important; transform: none !important; }
nav { background: #0C0818 !important; }
.section { padding: 100px 24px !important; }
@keyframes eclPulse { 0%, 100% { filter: brightness(1); } 50% { filter: brightness(1.18); } }
.cta-btn { animation: eclPulse 3s ease-in-out infinite !important; }
`,
  },

  // ── 6. VAULT — Warm dark, split hero, stat grid ───────────────────────────
  {
    id: "vault",
    overrideBg: "#0D0B07",
    overrideText: "#F0EAD6",
    overrideTb: "255,255,255",
    heroVariant: "split",
    heroFontSize: "clamp(2.5rem, 5vw, 4.5rem)",
    statsFirst: true,
    testimonialsEarly: true,
    noVideo: false,
    themeCSS: (v) => `
body { background: #0D0B07 !important; color: #F0EAD6 !important; }
.gradient-text { background: linear-gradient(135deg, #D4A843, #E8C876) !important; -webkit-background-clip: text !important; -webkit-text-fill-color: transparent !important; background-clip: text !important; }
.cta-btn { background: #D4A843 !important; color: #0D0B07 !important; font-weight: 700 !important; border-radius: 6px !important; box-shadow: 0 4px 16px rgba(212,168,67,0.25) !important; }
.cta-btn:hover { background: #E0B84E !important; }
.btn-secondary { border-color: rgba(240,234,214,0.15) !important; }
.card { background: rgba(240,234,214,0.03) !important; border: 1px solid rgba(240,234,214,0.08) !important; border-radius: 10px !important; }
.card:hover { border-color: rgba(212,168,67,0.25) !important; transform: none !important; }
nav { background: #0D0B07 !important; }
`,
  },

  // ── 7. NOIR — Pure dark, zero gradients, stark ────────────────────────────
  {
    id: "noir",
    overrideBg: "#050505",
    overrideText: "#FFFFFF",
    overrideTb: "255,255,255",
    heroVariant: "oversized",
    heroFontSize: "clamp(3rem, 8vw, 6.5rem)",
    statsFirst: true,
    testimonialsEarly: false,
    noVideo: false,
    themeCSS: (v) => `
body { background: #050505 !important; color: #fff !important; }
.gradient-text { background: none !important; -webkit-text-fill-color: ${v.primary} !important; color: ${v.primary} !important; }
.cta-btn { background: transparent !important; color: #fff !important; border: 1.5px solid rgba(255,255,255,0.6) !important; border-radius: 2px !important; box-shadow: none !important; letter-spacing: 0.04em !important; }
.cta-btn:hover { background: rgba(255,255,255,0.06) !important; transform: none !important; filter: none !important; box-shadow: none !important; }
.btn-secondary { border: 1.5px solid rgba(255,255,255,0.18) !important; border-radius: 2px !important; }
.card { background: transparent !important; border: none !important; border-top: 1px solid rgba(255,255,255,0.1) !important; border-radius: 0 !important; padding: 32px 0 !important; }
.card:hover { background: transparent !important; transform: none !important; box-shadow: none !important; border-top-color: ${v.primary} !important; }
.section { padding: 100px 24px !important; }
nav { background: #050505 !important; }
`,
  },

  // ── 8. GROVE — Dark forest green, organic, centered ──────────────────────
  {
    id: "grove",
    overrideBg: "#060F06",
    overrideText: "#E8F0E8",
    overrideTb: "255,255,255",
    heroVariant: "left",
    heroFontSize: "clamp(2.8rem, 5.5vw, 4.8rem)",
    statsFirst: false,
    testimonialsEarly: false,
    noVideo: false,
    themeCSS: (v) => `
body { background: #060F06 !important; color: #E8F0E8 !important; }
.gradient-text { background: linear-gradient(135deg, #4ADE80, #86EFAC) !important; -webkit-background-clip: text !important; -webkit-text-fill-color: transparent !important; background-clip: text !important; }
.cta-btn { background: linear-gradient(135deg, #16A34A, #22C55E) !important; color: #fff !important; box-shadow: 0 4px 20px rgba(34,197,94,0.25) !important; border-radius: 8px !important; }
.cta-btn:hover { box-shadow: 0 8px 32px rgba(34,197,94,0.4) !important; }
.card { background: rgba(74,222,128,0.03) !important; border: 1px solid rgba(74,222,128,0.1) !important; border-radius: 10px !important; }
.card:hover { border-color: rgba(74,222,128,0.25) !important; background: rgba(74,222,128,0.05) !important; transform: none !important; }
nav { background: #060F06 !important; border-bottom: 1px solid rgba(74,222,128,0.08) !important; }
`,
  },

  // ── 9. CRYPT — Dark teal, editorial, dramatic ────────────────────────────
  {
    id: "crypt",
    overrideBg: "#060E10",
    overrideText: "#D8F0F0",
    overrideTb: "255,255,255",
    heroVariant: "editorial",
    heroFontSize: "clamp(2.5rem, 5.5vw, 4.5rem)",
    statsFirst: false,
    testimonialsEarly: false,
    noVideo: true,
    themeCSS: (v) => `
body { background: #060E10 !important; color: #D8F0F0 !important; }
.gradient-text { background: linear-gradient(135deg, #2DD4BF, #67E8F9) !important; -webkit-background-clip: text !important; -webkit-text-fill-color: transparent !important; background-clip: text !important; }
.cta-btn { background: #0D9488 !important; color: #fff !important; border-radius: 6px !important; box-shadow: 0 4px 20px rgba(13,148,136,0.3) !important; }
.btn-secondary { border-color: rgba(45,212,191,0.2) !important; }
.card { background: rgba(45,212,191,0.03) !important; border: 1px solid rgba(45,212,191,0.1) !important; border-radius: 8px !important; }
.card:hover { border-color: rgba(45,212,191,0.28) !important; transform: none !important; }
nav { background: #060E10 !important; border-bottom: 1px solid rgba(45,212,191,0.08) !important; }
`,
  },

  // ── 10. ATLAS — Pure white, Harvey-inspired, ultra-minimal ───────────────
  {
    id: "atlas",
    overrideBg: "#FFFFFF",
    overrideText: "#0A0A0A",
    overrideTb: "0,0,0",
    heroVariant: "centered",
    heroFontSize: "clamp(2.8rem, 6.5vw, 5.5rem)",
    statsFirst: true,
    testimonialsEarly: false,
    noVideo: false,
    themeCSS: (v) => `
body { background: #fff !important; color: #0A0A0A !important; }
.gradient-text { background: linear-gradient(135deg, ${v.primary}, ${v.accent}) !important; -webkit-background-clip: text !important; -webkit-text-fill-color: transparent !important; background-clip: text !important; }
.cta-btn { border-radius: 6px !important; }
.btn-secondary { border-color: rgba(0,0,0,0.15) !important; color: #0A0A0A !important; }
.card { background: #FAFAFA !important; border: 1px solid rgba(0,0,0,0.06) !important; border-radius: 12px !important; }
.card:hover { border-color: ${v.primary}44 !important; background: #fff !important; box-shadow: 0 4px 24px rgba(0,0,0,0.06) !important; transform: none !important; }
.section { padding: 120px 24px !important; }
nav { background: rgba(255,255,255,0.92) !important; border-bottom: 1px solid rgba(0,0,0,0.06) !important; }
footer { background: #F8F8F8 !important; }
`,
  },

  // ── 11. BROADSHEET — Off-white editorial, newspaper feel ─────────────────
  {
    id: "broadsheet",
    overrideBg: "#F9F7F4",
    overrideText: "#111111",
    overrideTb: "0,0,0",
    heroVariant: "editorial",
    heroFontSize: "clamp(2.5rem, 6vw, 5rem)",
    statsFirst: false,
    testimonialsEarly: false,
    noVideo: false,
    themeCSS: (v) => `
body { background: #F9F7F4 !important; color: #111 !important; }
h1, h2, h3, h4 { font-weight: 800 !important; letter-spacing: -0.03em !important; }
.gradient-text { background: none !important; -webkit-text-fill-color: #111 !important; color: #111 !important; }
.cta-btn { background: #111 !important; color: #F9F7F4 !important; border-radius: 4px !important; box-shadow: none !important; }
.cta-btn:hover { background: #000 !important; transform: none !important; filter: none !important; box-shadow: none !important; }
.btn-secondary { border-color: rgba(0,0,0,0.18) !important; color: #111 !important; border-radius: 4px !important; }
.card { background: #fff !important; border: 1px solid rgba(0,0,0,0.08) !important; border-radius: 4px !important; box-shadow: 0 1px 4px rgba(0,0,0,0.05) !important; }
.card:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.08) !important; transform: none !important; border-color: rgba(0,0,0,0.12) !important; }
.section { padding: 96px 24px !important; }
nav { background: #F9F7F4 !important; border-bottom: 2px solid #111 !important; }
footer { background: #111 !important; color: #F9F7F4 !important; }
footer a, footer p, footer span { color: rgba(249,247,244,0.6) !important; }
`,
  },

  // ── 12. SOLAR — Warm cream, amber accents, left hero ─────────────────────
  {
    id: "solar",
    overrideBg: "#FBF7F0",
    overrideText: "#1A1410",
    overrideTb: "0,0,0",
    heroVariant: "left",
    heroFontSize: "clamp(2.5rem, 5.5vw, 5rem)",
    statsFirst: false,
    testimonialsEarly: true,
    noVideo: false,
    themeCSS: (v) => `
body { background: #FBF7F0 !important; color: #1A1410 !important; }
.gradient-text { background: linear-gradient(135deg, #B45309, #D97706) !important; -webkit-background-clip: text !important; -webkit-text-fill-color: transparent !important; background-clip: text !important; }
.cta-btn { background: linear-gradient(135deg, #B45309, #D97706) !important; color: #fff !important; border-radius: 8px !important; box-shadow: 0 4px 16px rgba(180,83,9,0.22) !important; }
.cta-btn:hover { box-shadow: 0 8px 28px rgba(180,83,9,0.32) !important; }
.btn-secondary { border-color: rgba(26,20,16,0.15) !important; }
.card { background: #fff !important; border: 1px solid rgba(26,20,16,0.08) !important; border-radius: 10px !important; box-shadow: 0 2px 8px rgba(26,20,16,0.04) !important; }
.card:hover { box-shadow: 0 6px 24px rgba(26,20,16,0.08) !important; transform: none !important; border-color: rgba(180,83,9,0.2) !important; }
nav { background: rgba(251,247,240,0.95) !important; border-bottom: 1px solid rgba(26,20,16,0.08) !important; }
footer { background: #F0EBE0 !important; }
`,
  },

  // ── 13. CHROME — White, silicon valley minimal ────────────────────────────
  {
    id: "chrome",
    overrideBg: "#FFFFFF",
    overrideText: "#09090B",
    overrideTb: "0,0,0",
    heroVariant: "centered",
    heroFontSize: "clamp(2.5rem, 6vw, 5.5rem)",
    statsFirst: true,
    testimonialsEarly: false,
    noVideo: false,
    themeCSS: (v) => `
body { background: #fff !important; color: #09090B !important; }
.gradient-text { background: linear-gradient(135deg, ${v.primary}, ${v.accent}) !important; -webkit-background-clip: text !important; -webkit-text-fill-color: transparent !important; background-clip: text !important; }
.cta-btn { border-radius: 8px !important; box-shadow: 0 1px 2px rgba(0,0,0,0.05), inset 0 0 0 1px rgba(0,0,0,0.06) !important; }
.btn-secondary { border-color: rgba(0,0,0,0.12) !important; }
.card { background: #FAFAFA !important; border: 1px solid #E5E7EB !important; border-radius: 10px !important; }
.card:hover { border-color: ${v.primary}55 !important; background: #fff !important; box-shadow: 0 1px 8px rgba(0,0,0,0.06) !important; transform: none !important; }
.section { padding: 96px 24px !important; }
nav { background: rgba(255,255,255,0.9) !important; border-bottom: 1px solid #E5E7EB !important; }
`,
  },

  // ── 14. PAPER — Vintage warm, sepia editorial ─────────────────────────────
  {
    id: "paper",
    overrideBg: "#F5EFE3",
    overrideText: "#2D2620",
    overrideTb: "0,0,0",
    heroVariant: "centered",
    heroFontSize: "clamp(2.5rem, 6vw, 5rem)",
    statsFirst: false,
    testimonialsEarly: true,
    noVideo: false,
    themeCSS: (v) => `
body { background: #F5EFE3 !important; color: #2D2620 !important; }
.gradient-text { background: linear-gradient(135deg, #92400E, #B45309) !important; -webkit-background-clip: text !important; -webkit-text-fill-color: transparent !important; background-clip: text !important; }
.cta-btn { background: #2D2620 !important; color: #F5EFE3 !important; border-radius: 6px !important; box-shadow: none !important; }
.cta-btn:hover { background: #1A1410 !important; transform: none !important; filter: none !important; box-shadow: none !important; }
.btn-secondary { border-color: rgba(45,38,32,0.2) !important; color: #2D2620 !important; border-radius: 6px !important; }
.card { background: rgba(255,255,255,0.6) !important; border: 1px solid rgba(45,38,32,0.1) !important; border-radius: 6px !important; box-shadow: 0 1px 4px rgba(45,38,32,0.06) !important; }
.card:hover { background: rgba(255,255,255,0.85) !important; box-shadow: 0 4px 16px rgba(45,38,32,0.1) !important; transform: none !important; }
nav { background: #F5EFE3 !important; border-bottom: 1px solid rgba(45,38,32,0.1) !important; }
footer { background: #2D2620 !important; color: #F5EFE3 !important; }
footer a, footer p, footer span { color: rgba(245,239,227,0.55) !important; }
`,
  },

  // ── 15. STUDIO — Near-white, creative agency, left hero ──────────────────
  {
    id: "studio",
    overrideBg: "#F0F0EC",
    overrideText: "#131310",
    overrideTb: "0,0,0",
    heroVariant: "left",
    heroFontSize: "clamp(2.5rem, 6vw, 5rem)",
    statsFirst: false,
    testimonialsEarly: false,
    noVideo: true,
    themeCSS: (v) => `
body { background: #F0F0EC !important; color: #131310 !important; }
.gradient-text { background: linear-gradient(135deg, ${v.primary}, ${v.accent}) !important; -webkit-background-clip: text !important; -webkit-text-fill-color: transparent !important; background-clip: text !important; }
.cta-btn { border-radius: 100px !important; padding: 14px 36px !important; }
.btn-secondary { border-radius: 100px !important; border-color: rgba(19,19,16,0.15) !important; }
.card { background: #fff !important; border: none !important; border-radius: 16px !important; box-shadow: 0 2px 12px rgba(19,19,16,0.06) !important; }
.card:hover { box-shadow: 0 8px 32px rgba(19,19,16,0.1) !important; transform: translateY(-3px) !important; }
nav { background: rgba(240,240,236,0.92) !important; border-bottom: 1px solid rgba(19,19,16,0.07) !important; }
footer { background: #131310 !important; color: #F0F0EC !important; }
footer a, footer p, footer span { color: rgba(240,240,236,0.5) !important; }
.section { padding: 110px 24px !important; }
`,
  },

  // ── 16. SIGNAL — White with brand-color alternating sections ─────────────
  {
    id: "signal",
    overrideBg: "#FFFFFF",
    overrideText: "#09090B",
    overrideTb: "0,0,0",
    heroVariant: "oversized",
    heroFontSize: "clamp(3rem, 7vw, 6rem)",
    statsFirst: true,
    testimonialsEarly: false,
    noVideo: false,
    themeCSS: (v) => `
body { background: #fff !important; color: #09090B !important; }
.gradient-text { background: none !important; -webkit-text-fill-color: #09090B !important; color: #09090B !important; font-weight: 900 !important; }
.cta-btn { background: #09090B !important; color: #fff !important; border-radius: 6px !important; box-shadow: none !important; }
.cta-btn:hover { background: #222 !important; transform: none !important; filter: none !important; box-shadow: none !important; }
.btn-secondary { border-color: rgba(0,0,0,0.15) !important; border-radius: 6px !important; }
.card { background: #F8F8F8 !important; border: 1px solid rgba(0,0,0,0.07) !important; border-radius: 8px !important; border-left: 3px solid ${v.primary} !important; }
.card:hover { background: #fff !important; border-color: rgba(0,0,0,0.1) !important; transform: none !important; box-shadow: 0 4px 16px rgba(0,0,0,0.06) !important; }
nav { background: #fff !important; border-bottom: 2px solid #09090B !important; }
.section { padding: 100px 24px !important; }
`,
  },

  // ── 17. GRIDLINES — Light gray, CSS grid lines ────────────────────────────
  {
    id: "gridlines",
    overrideBg: "#F8F8F6",
    overrideText: "#111",
    overrideTb: "0,0,0",
    heroVariant: "centered",
    heroFontSize: "clamp(2.5rem, 5.5vw, 4.8rem)",
    statsFirst: false,
    testimonialsEarly: false,
    noVideo: false,
    themeCSS: (v) => `
body { background: #F8F8F6 !important; color: #111 !important; background-image: linear-gradient(rgba(0,0,0,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(0,0,0,0.04) 1px,transparent 1px) !important; background-size: 48px 48px !important; }
.gradient-text { background: linear-gradient(135deg, ${v.primary}, ${v.accent}) !important; -webkit-background-clip: text !important; -webkit-text-fill-color: transparent !important; background-clip: text !important; }
.cta-btn { border-radius: 4px !important; }
.btn-secondary { border-color: rgba(0,0,0,0.15) !important; border-radius: 4px !important; }
.card { background: rgba(255,255,255,0.8) !important; border: 1px solid rgba(0,0,0,0.09) !important; border-radius: 4px !important; backdrop-filter: blur(8px) !important; }
.card:hover { background: #fff !important; border-color: ${v.primary}55 !important; transform: none !important; box-shadow: 0 4px 20px rgba(0,0,0,0.07) !important; }
nav { background: rgba(248,248,246,0.9) !important; border-bottom: 1px solid rgba(0,0,0,0.09) !important; }
`,
  },

  // ── 18. MANIFESTO — 9vw ALL CAPS hero, brutalist typographic ─────────────
  {
    id: "manifesto",
    heroVariant: "oversized",
    heroFontSize: "clamp(3rem, 9vw, 8.5rem)",
    statsFirst: true,
    testimonialsEarly: false,
    noVideo: true,
    themeCSS: (v) => `
body { letter-spacing: -0.02em; }
h1 { text-transform: uppercase !important; font-weight: 900 !important; line-height: 0.92 !important; letter-spacing: -0.04em !important; }
h2 { text-transform: uppercase !important; font-weight: 800 !important; letter-spacing: -0.03em !important; }
.gradient-text { background: none !important; -webkit-text-fill-color: ${v.primary} !important; color: ${v.primary} !important; }
.cta-btn { border-radius: 0 !important; text-transform: uppercase !important; letter-spacing: 0.06em !important; font-size: 13px !important; padding: 16px 40px !important; }
.btn-secondary { border-radius: 0 !important; text-transform: uppercase !important; letter-spacing: 0.06em !important; font-size: 13px !important; }
.card { border-radius: 0 !important; border: none !important; border-top: 2px solid rgba(${v.tb},0.12) !important; background: transparent !important; padding: 32px 0 !important; }
.card:hover { border-top-color: ${v.primary} !important; background: transparent !important; transform: none !important; box-shadow: none !important; }
nav { border-bottom: 2px solid rgba(${v.tb},0.1) !important; }
.section { padding: 80px 24px !important; }
`,
  },

  // ── 19. IMPACT — Brand-color filled hero, extremely bold ─────────────────
  {
    id: "impact",
    heroVariant: "centered",
    heroFontSize: "clamp(2.5rem, 6vw, 5rem)",
    statsFirst: true,
    testimonialsEarly: false,
    noVideo: false,
    themeCSS: (v) => {
      const ctaC = v.isLight ? "#fff" : v.textColor;
      return `
.gradient-text { background: none !important; -webkit-text-fill-color: ${v.isLight ? "#111" : "#fff"} !important; }
.cta-btn { background: ${v.isLight ? "#111" : "#fff"} !important; color: ${v.isLight ? "#fff" : "#111"} !important; box-shadow: none !important; border-radius: 6px !important; }
.cta-btn:hover { filter: brightness(0.9) !important; transform: none !important; box-shadow: none !important; }
.btn-secondary { border-color: rgba(${v.tb},0.2) !important; }
.card { border-radius: 10px !important; }
nav { border-bottom-width: 2px !important; }
.section { padding: 100px 24px !important; }
`;
    },
  },

  // ── 20. BROADCAST — Off-white, news dividers, horizontal rules ───────────
  {
    id: "broadcast",
    overrideBg: "#F4F4F0",
    overrideText: "#111",
    overrideTb: "0,0,0",
    heroVariant: "editorial",
    heroFontSize: "clamp(2.5rem, 6vw, 5rem)",
    statsFirst: false,
    testimonialsEarly: false,
    noVideo: false,
    themeCSS: (v) => `
body { background: #F4F4F0 !important; color: #111 !important; }
.gradient-text { background: none !important; -webkit-text-fill-color: ${v.primary} !important; color: ${v.primary} !important; }
.cta-btn { background: ${v.primary} !important; border-radius: 4px !important; box-shadow: none !important; }
.btn-secondary { border-color: rgba(0,0,0,0.2) !important; border-radius: 4px !important; }
.card { background: #fff !important; border: none !important; border-bottom: 1px solid rgba(0,0,0,0.1) !important; border-radius: 0 !important; padding: 28px 0 !important; }
.card:hover { background: rgba(${v.primary.replace('#','')},0.03) !important; transform: none !important; box-shadow: none !important; }
.section { padding: 80px 24px !important; border-top: 2px solid rgba(0,0,0,0.1) !important; }
nav { background: #F4F4F0 !important; border-bottom: 3px solid #111 !important; }
footer { background: #111 !important; color: #F4F4F0 !important; }
footer a, footer p, footer span { color: rgba(244,244,240,0.55) !important; }
`,
  },

  // ── 21. BILLBOARD — Huge sparse, anti-design, oversized ──────────────────
  {
    id: "billboard",
    heroVariant: "oversized",
    heroFontSize: "clamp(3.5rem, 10vw, 9.5rem)",
    statsFirst: true,
    testimonialsEarly: false,
    noVideo: true,
    themeCSS: (v) => `
h1 { font-weight: 900 !important; line-height: 0.9 !important; }
h2 { font-size: clamp(1.8rem, 4vw, 3rem) !important; }
.gradient-text { background: none !important; -webkit-text-fill-color: ${v.primary} !important; }
.cta-btn { border-radius: 2px !important; font-weight: 700 !important; padding: 16px 44px !important; }
.btn-secondary { border-radius: 2px !important; }
.card { background: transparent !important; border: 1px solid rgba(${v.tb},0.1) !important; border-radius: 2px !important; }
.card:hover { border-color: ${v.primary}66 !important; transform: none !important; box-shadow: none !important; }
.section { padding: 120px 24px !important; }
nav { border-bottom: 1px solid rgba(${v.tb},0.08) !important; }
`,
  },

  // ── 22. DISPATCH — Dark editorial, magazine dark ──────────────────────────
  {
    id: "dispatch",
    overrideBg: "#0A0A0A",
    overrideText: "#F5F5F5",
    overrideTb: "255,255,255",
    heroVariant: "editorial",
    heroFontSize: "clamp(2.8rem, 6vw, 5rem)",
    statsFirst: false,
    testimonialsEarly: true,
    noVideo: false,
    themeCSS: (v) => `
body { background: #0A0A0A !important; color: #F5F5F5 !important; }
.gradient-text { background: linear-gradient(135deg, ${v.primary}, ${v.accent}) !important; -webkit-background-clip: text !important; -webkit-text-fill-color: transparent !important; background-clip: text !important; }
.cta-btn { border-radius: 6px !important; }
.btn-secondary { border-color: rgba(255,255,255,0.12) !important; }
.card { background: #141414 !important; border: 1px solid rgba(255,255,255,0.06) !important; border-radius: 8px !important; }
.card:hover { border-color: ${v.primary}44 !important; background: #1A1A1A !important; transform: none !important; }
nav { background: #0A0A0A !important; border-bottom: 1px solid rgba(255,255,255,0.06) !important; }
.section { padding: 100px 24px !important; }
`,
  },

  // ── 23. MESH — Gradient mesh backgrounds, colorful, premium ──────────────
  {
    id: "mesh",
    heroVariant: "centered",
    heroFontSize: "clamp(2.5rem, 6vw, 5rem)",
    statsFirst: false,
    testimonialsEarly: false,
    noVideo: false,
    themeCSS: (v) => `
body { background: ${v.bg} !important; }
body::before { content: ''; position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: radial-gradient(ellipse at 20% 20%, ${v.primary}18 0%, transparent 50%), radial-gradient(ellipse at 80% 80%, ${v.accent}14 0%, transparent 50%), radial-gradient(ellipse at 50% 50%, ${v.primary}08 0%, transparent 70%); pointer-events: none; z-index: 0; }
body > * { position: relative; z-index: 1; }
.gradient-text { background: linear-gradient(135deg, ${v.primary}, ${v.accent}) !important; -webkit-background-clip: text !important; -webkit-text-fill-color: transparent !important; background-clip: text !important; }
.card { background: rgba(${v.tb},0.04) !important; border: 1px solid rgba(${v.tb},0.1) !important; border-radius: 14px !important; backdrop-filter: blur(12px) !important; }
.card:hover { border-color: ${v.primary}44 !important; background: rgba(${v.tb},0.06) !important; transform: none !important; }
nav { backdrop-filter: blur(24px) !important; }
@keyframes meshDrift { 0% { transform: scale(1) translate(0,0); } 33% { transform: scale(1.06) translate(1%,1.5%); } 66% { transform: scale(0.97) translate(-1%,-0.5%); } 100% { transform: scale(1) translate(0,0); } }
body::before { animation: meshDrift 14s ease-in-out infinite !important; }
`,
  },

  // ── 24. GRAIN — CSS noise texture, editorial character ────────────────────
  {
    id: "grain",
    heroVariant: "left",
    heroFontSize: "clamp(2.5rem, 5.5vw, 5rem)",
    statsFirst: false,
    testimonialsEarly: false,
    noVideo: false,
    themeCSS: (v) => `
body { background: ${v.bg} !important; }
body::after { content: ''; position: fixed; top: 0; left: 0; right: 0; bottom: 0; background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.08'/%3E%3C/svg%3E"); background-size: 200px 200px; pointer-events: none; z-index: 9999; opacity: 0.4; }
.gradient-text { background: linear-gradient(135deg, ${v.primary}, ${v.accent}) !important; -webkit-background-clip: text !important; -webkit-text-fill-color: transparent !important; background-clip: text !important; }
.card { border-radius: 8px !important; }
.cta-btn { border-radius: 6px !important; }
nav { border-bottom: 1px solid rgba(${v.tb},0.08) !important; }
@keyframes grainFlicker { 0%, 100% { opacity: 0.4; } 25% { opacity: 0.32; } 75% { opacity: 0.45; } }
body::after { animation: grainFlicker 7s ease-in-out infinite !important; }
`,
  },

  // ── 25. PRISM — White, rainbow gradient borders on cards ─────────────────
  {
    id: "prism",
    overrideBg: "#FFFFFF",
    overrideText: "#09090B",
    overrideTb: "0,0,0",
    heroVariant: "centered",
    heroFontSize: "clamp(2.5rem, 6vw, 5rem)",
    statsFirst: false,
    testimonialsEarly: true,
    noVideo: false,
    themeCSS: (v) => `
body { background: #fff !important; color: #09090B !important; }
.gradient-text { background: linear-gradient(135deg, ${v.primary}, ${v.accent}) !important; -webkit-background-clip: text !important; -webkit-text-fill-color: transparent !important; background-clip: text !important; }
.cta-btn { border-radius: 100px !important; }
.btn-secondary { border-radius: 100px !important; border-color: rgba(0,0,0,0.12) !important; }
.card { background: #fff !important; border: none !important; border-radius: 14px !important; box-shadow: 0 0 0 1px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.05) !important; position: relative !important; }
.card::before { content: ''; position: absolute; inset: -1px; border-radius: 15px; background: linear-gradient(135deg, ${v.primary}55, ${v.accent}44, ${v.primary}33, ${v.accent}55); background-size: 200% 200%; z-index: -1; opacity: 0; transition: opacity 0.3s; }
.card:hover::before { opacity: 1; animation: prismShimmer 2.5s ease infinite !important; }
.card:hover { box-shadow: 0 8px 32px rgba(0,0,0,0.08) !important; transform: none !important; }
nav { background: rgba(255,255,255,0.92) !important; border-bottom: 1px solid rgba(0,0,0,0.06) !important; }
.section { padding: 100px 24px !important; }
@keyframes prismShimmer { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
`,
  },

];
