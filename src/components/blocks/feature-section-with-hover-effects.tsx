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
  { title: "Built for service businesses", description: "Built for freelancers, consultants, coaches, and agencies — anyone who sells their time.", icon: <IconTerminal2 /> },
  { title: "Set up in minutes", description: "Answer a few questions. Kovra builds your website, sets up your workspace, and you're live.", icon: <IconEaseInOut /> },
  { title: "Transparent pricing", description: "Free to start, then flat monthly. No per-seat fees, no feature gating, no surprises.", icon: <IconCurrencyDollar /> },
  { title: "Always on", description: "Your booking link, client portal, and invoices work 24/7 — whether you're working or not.", icon: <IconCloud /> },
  { title: "Full client lifecycle", description: "CRM, booking, proposals, invoicing, and project management all in one place.", icon: <IconRouteAltLeft /> },
  { title: "AI-powered", description: "AI writes your website, blog posts, proposals, and ad copy — all from your business context.", icon: <IconHelp /> },
  { title: "Lead engine included", description: "Find prospects, send outreach, and track replies — without leaving Kovra.", icon: <IconAdjustmentsBolt /> },
  { title: "Everything else", description: "Site analytics, multi-channel inbox, satellite email infra, AI coach, and custom domain.", icon: <IconHeart /> },
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
