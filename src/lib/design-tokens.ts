import type { CSSProperties } from "react";

export const T = {
  // Backgrounds
  bg: "#09090B",
  bgEl: "#111113",       // surface — cards, sidebar
  bgAlt: "#18181B",      // surfaceRaised — nested elevated
  bgHover: "#1F1F23",    // surfaceHover
  // Borders
  border: "#27272A",
  borderLight: "#3F3F46",
  // Text
  text: "#FAFAFA",
  text2: "#A1A1AA",      // textSecondary
  text3: "#52525B",      // textDim
  // Brand colors
  gold: "#C8A44E",
  goldLight: "#D4B65E",
  goldDim: "rgba(200,164,78,0.08)",
  green: "#22C55E",
  greenDim: "rgba(34,197,94,0.08)",
  blue: "#3B82F6",
  blueDim: "rgba(59,130,246,0.08)",
  purple: "#8B5CF6",
  purpleDim: "rgba(139,92,246,0.08)",
  purpleLight: "#8B5CF6",
  orange: "#F97316",
  orangeDim: "rgba(249,115,22,0.08)",
  red: "#EF4444",
  redDim: "rgba(239,68,68,0.08)",
  accent: "#C8A44E",
  // Typography
  h: "'DM Sans', sans-serif",
  mono: "'JetBrains Mono', monospace",
  // Compat aliases
  glass: "rgba(255,255,255,0.03)",
};

export const CTA_GRAD = "linear-gradient(135deg, #C8A44E, #D4B65E)";

export const glassCard: CSSProperties = {
  background: T.bgEl,
  border: `1px solid ${T.border}`,
  borderRadius: 12,
};
