"use client";

import { useState, useEffect } from "react";
import {
  IconAdjustmentsBolt,
  IconCloud,
  IconCurrencyDollar,
  IconEaseInOut,
  IconHeart,
  IconHelp,
  IconRouteAltLeft,
  IconTerminal2,
} from "@tabler/icons-react";

const BORDER = "#27272A";
const MUTED = "#111113";
const GOLD = "#C8A44E";
const TEXT = "#FAFAFA";
const MUTED_FG = "#A1A1AA";

const FEATURES = [
  { title: "Built for service businesses", description: "Built for freelancers, agencies, consultants, and anyone who sells their time.", icon: <IconTerminal2 /> },
  { title: "Ease of use", description: "Set up in 4 minutes. No onboarding calls, no 50-page docs, no confusion.", icon: <IconEaseInOut /> },
  { title: "Transparent pricing", description: "One price. Everything included. No per-seat fees, no feature gating.", icon: <IconCurrencyDollar /> },
  { title: "Always available", description: "Your booking link, client portal, and contracts work 24/7.", icon: <IconCloud /> },
  { title: "Complete business OS", description: "CRM, booking, proposals, contracts, invoicing, projects — all in one place.", icon: <IconRouteAltLeft /> },
  { title: "AI-powered", description: "AI writes your proposals, your website, your blog posts, and your follow-up emails.", icon: <IconHelp /> },
  { title: "Replaces 11 tools", description: "Calendly, Dubsado, DocuSign, Toggl, Pipedrive, Typeform, and more.", icon: <IconAdjustmentsBolt /> },
  { title: "Everything else", description: "Referral links, team accounts, automations, analytics, client portal, and custom domain.", icon: <IconHeart /> },
];

function Feature({ title, description, icon, index, cols }: { title: string; description: string; icon: React.ReactNode; index: number; cols: number }) {
  const [hovered, setHovered] = useState(false);
  const isLeftEdge = cols === 4 ? (index === 0 || index === 4) : (index % cols === 0);
  const isTop = index < cols;

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex",
        flexDirection: "column",
        padding: "40px 0",
        position: "relative",
        borderRight: `1px solid ${BORDER}`,
        ...(isLeftEdge ? { borderLeft: `1px solid ${BORDER}` } : {}),
        ...(isTop ? { borderBottom: `1px solid ${BORDER}` } : {}),
      }}
    >
      {/* Hover gradient overlay */}
      <div style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        opacity: hovered ? 1 : 0,
        transition: "opacity 0.2s",
        background: isTop
          ? `linear-gradient(to top, ${MUTED}, transparent)`
          : `linear-gradient(to bottom, ${MUTED}, transparent)`,
      }} />

      {/* Icon */}
      <div style={{ marginBottom: 16, position: "relative", zIndex: 10, padding: "0 40px", color: MUTED_FG }}>
        {icon}
      </div>

      {/* Title with accent bar */}
      <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, position: "relative", zIndex: 10, padding: "0 40px" }}>
        <div style={{
          position: "absolute",
          left: 0,
          top: "50%",
          transform: "translateY(-50%)",
          height: hovered ? 32 : 24,
          width: 4,
          borderRadius: "0 4px 4px 0",
          background: hovered ? GOLD : BORDER,
          transition: "height 0.2s, background 0.2s",
        }} />
        <span style={{
          display: "inline-block",
          transform: hovered ? "translateX(8px)" : "translateX(0)",
          transition: "transform 0.2s",
          color: TEXT,
        }}>
          {title}
        </span>
      </div>

      {/* Description */}
      <p style={{ fontSize: 14, color: MUTED_FG, maxWidth: 280, position: "relative", zIndex: 10, padding: "0 40px", margin: 0, lineHeight: 1.5 }}>
        {description}
      </p>
    </div>
  );
}

export function FeaturesSectionWithHoverEffects() {
  const [cols, setCols] = useState(4);

  useEffect(() => {
    const update = () => setCols(window.innerWidth < 640 ? 1 : window.innerWidth < 1024 ? 2 : 4);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: `repeat(${cols}, 1fr)`,
      maxWidth: 1280,
      margin: "0 auto",
      position: "relative",
      zIndex: 10,
    }}>
      {FEATURES.map((f, i) => (
        <Feature key={f.title} {...f} index={i} cols={cols} />
      ))}
    </div>
  );
}
