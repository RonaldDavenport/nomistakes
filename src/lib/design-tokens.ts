import type { CSSProperties } from "react";

export const T = {
  bg: "#000000",
  bgEl: "#0A0A0F",
  bgAlt: "#060609",
  glass: "rgba(255,255,255,0.04)",
  border: "rgba(255,255,255,0.08)",
  text: "#FAFAFA",
  text2: "rgba(255,255,255,0.65)",
  text3: "rgba(255,255,255,0.40)",
  purple: "#7B39FC",
  purpleLight: "#A855F7",
  gold: "#F59E0B",
  green: "#22C55E",
  h: "'Plus Jakarta Sans', 'Inter', sans-serif",
  mono: "'JetBrains Mono', monospace",
};

export const CTA_GRAD = "linear-gradient(135deg, #7B39FC, #A855F7)";

export const glassCard: CSSProperties = {
  background: T.glass,
  border: `1px solid ${T.border}`,
  borderRadius: 16,
  backdropFilter: "blur(12px)",
};