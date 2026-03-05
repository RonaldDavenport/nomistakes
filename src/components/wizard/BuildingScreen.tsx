"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { T, CTA_GRAD } from "@/lib/design-tokens";

const SHOWCASE_SITES = [
  {
    name: "Meridian Consulting",
    type: "Consulting",
    sections: ["Booking page", "Proposal system", "Client portal", "Invoicing"],
  },
  {
    name: "Carla Silva Coaching",
    type: "Coaching",
    sections: ["Website", "Discovery calls", "CRM", "Email sequences"],
  },
  {
    name: "Hartfield Creative",
    type: "Agency",
    sections: ["Portfolio site", "Proposal builder", "Project tracking", "Invoicing"],
  },
  {
    name: "Nova Finance Advisory",
    type: "Consulting",
    sections: ["Website", "Lead capture", "Proposals", "Client dashboard"],
  },
];


interface BuildingScreenProps {
  businessName: string;
  tagline: string;
  buildProgress: number;
  currentStepLabel: string;
  error: string;
  onRetry: () => void;
}

export default function BuildingScreen({
  businessName,
  tagline,
  buildProgress,
  currentStepLabel,
  error,
  onRetry,
}: BuildingScreenProps) {
  const [showcaseIndex, setShowcaseIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setShowcaseIndex((prev) => (prev + 1) % SHOWCASE_SITES.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const site = SHOWCASE_SITES[showcaseIndex];
  const engagingLabel = currentStepLabel;

  const ringSize = 96;
  const strokeWidth = 5;
  const radius = (ringSize - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (buildProgress / 100) * circumference;

  return (
    <div style={{
      minHeight: "80vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "40px 24px",
    }}>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ textAlign: "center", marginBottom: 36 }}
      >
        <h2 style={{
          fontFamily: T.h,
          fontSize: "2rem",
          fontWeight: 600,
          color: T.text,
          letterSpacing: "-0.02em",
          lineHeight: 1.1,
          marginBottom: 0,
        }}>
          Setting up {businessName}
        </h2>
      </motion.div>

      {/* Progress ring */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        style={{ position: "relative", width: ringSize, height: ringSize, marginBottom: 14 }}
      >
        <svg width={ringSize} height={ringSize} style={{ transform: "rotate(-90deg)" }}>
          <circle
            cx={ringSize / 2}
            cy={ringSize / 2}
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth={strokeWidth}
          />
          <motion.circle
            cx={ringSize / 2}
            cy={ringSize / 2}
            r={radius}
            fill="none"
            stroke={T.purple}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            animate={{ strokeDashoffset }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          />
        </svg>
        <div style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}>
          <span style={{
            fontFamily: T.h,
            fontSize: "1.4rem",
            fontWeight: 700,
            color: T.text,
            fontVariantNumeric: "tabular-nums",
          }}>
            {buildProgress}%
          </span>
        </div>
      </motion.div>

      {/* Step label */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        style={{ textAlign: "center", marginBottom: 44 }}
      >
        <AnimatePresence mode="wait">
          <motion.p
            key={engagingLabel}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.25 }}
            style={{
              color: T.text3,
              fontSize: "0.85rem",
              fontFamily: T.h,
            }}
          >
            {engagingLabel}
          </motion.p>
        </AnimatePresence>
      </motion.div>

      {/* Showcase */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        style={{ width: "100%", maxWidth: 520, marginBottom: 32 }}
      >
        <p style={{
          color: T.text3,
          fontSize: "0.7rem",
          textTransform: "uppercase",
          letterSpacing: "0.1em",
          marginBottom: 10,
          fontWeight: 500,
          fontFamily: T.h,
        }}>
          Recently set up on Kovra
        </p>

        <div style={{
          borderRadius: 12,
          border: `1px solid ${T.border}`,
          overflow: "hidden",
          background: T.glass,
          backdropFilter: "blur(12px)",
        }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={showcaseIndex}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              style={{ padding: "20px 22px" }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                <div>
                  <p style={{ fontFamily: T.h, fontSize: "0.95rem", fontWeight: 600, color: T.text, margin: 0 }}>{site.name}</p>
                  <p style={{ fontSize: "0.75rem", color: T.text3, margin: "2px 0 0" }}>{site.type}</p>
                </div>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: T.green }} />
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {site.sections.map((section) => (
                  <span key={section} style={{
                    padding: "4px 10px",
                    borderRadius: 100,
                    fontSize: "0.7rem",
                    color: T.text3,
                    background: "rgba(255,255,255,0.04)",
                    border: `1px solid ${T.border}`,
                    fontFamily: T.h,
                  }}>
                    {section}
                  </span>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Error */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ textAlign: "center" }}
        >
          <p style={{ color: "#ef4444", fontSize: "0.85rem", marginBottom: 16, fontFamily: T.h }}>{error}</p>
          <button
            onClick={onRetry}
            style={{
              padding: "12px 28px",
              borderRadius: 10,
              fontSize: "0.85rem",
              fontWeight: 600,
              fontFamily: T.h,
              border: "none",
              cursor: "pointer",
              background: CTA_GRAD,
              color: "#fff",
            }}
          >
            Try Again
          </button>
        </motion.div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
