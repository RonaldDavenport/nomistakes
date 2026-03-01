"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { T, CTA_GRAD } from "@/lib/design-tokens";

const SHOWCASE_SITES = [
  {
    name: "Fresh Threads Co.",
    type: "E-commerce",
    launched: "Launched 2 days ago",
    gradient: `linear-gradient(135deg, ${T.bg} 0%, #0D0A14 100%)`,
    accent: T.purpleLight,
    sections: ["Hero banner with tagline", "Product grid", "About story", "Checkout"],
  },
  {
    name: "Peak Performance Coaching",
    type: "Services",
    launched: "Launched 5 days ago",
    gradient: `linear-gradient(135deg, ${T.bg} 0%, #0A0D14 100%)`,
    accent: "#6D8CFC",
    sections: ["Video hero", "Services grid", "Testimonials", "Booking calendar"],
  },
  {
    name: "DesignFlow Academy",
    type: "Digital Products",
    launched: "Launched 1 week ago",
    gradient: `linear-gradient(135deg, ${T.bg} 0%, #10081A 100%)`,
    accent: T.purple,
    sections: ["Course catalog", "Student reviews", "Pricing tiers", "Free preview"],
  },
  {
    name: "Bloom & Root Studio",
    type: "Creative Agency",
    launched: "Launched 3 days ago",
    gradient: `linear-gradient(135deg, ${T.bg} 0%, #0F0A14 100%)`,
    accent: "#D485FC",
    sections: ["Portfolio gallery", "Process timeline", "Team bios", "Contact form"],
  },
];

const TESTIMONIALS = [
  { text: "Had my site live before I finished my coffee.", author: "Marcus T." },
  { text: "I didn\u2019t believe it until I saw the URL.", author: "Ava R." },
  { text: "The AI actually understood my business. Wild.", author: "Jordan P." },
  { text: "Went from idea to customers in one afternoon.", author: "Simone K." },
];

const BUILD_STEP_LABELS = [
  { at: 5, label: "Designing your brand identity..." },
  { at: 20, label: "Crafting your website copy..." },
  { at: 40, label: "Building your pages..." },
  { at: 60, label: "Setting up checkout..." },
  { at: 85, label: "Deploying to your live URL..." },
];

interface BuildingScreenProps {
  businessName: string;
  tagline: string;
  buildProgress: number;
  currentStepLabel: string;
  error: string;
  onRetry: () => void;
}

/* Generate random particle configs once */
function makeParticles(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: 3 + Math.random() * 4,
    duration: 6 + Math.random() * 8,
    delay: Math.random() * 4,
    color: Math.random() > 0.5 ? T.purple : "rgba(255,255,255,0.3)",
    opacity: 0.2 + Math.random() * 0.4,
  }));
}

/* Simple confetti pieces */
function makeConfetti(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: 50 + (Math.random() - 0.5) * 60,
    color: ["#7B39FC", "#A855F7", "#D485FC", "#FAFAFA", "#22C55E", "#F59E0B"][i % 6],
    angle: Math.random() * 360,
    size: 4 + Math.random() * 6,
  }));
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
  const [testimonialIndex, setTestimonialIndex] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);

  const particles = useMemo(() => makeParticles(10), []);
  const confettiPieces = useMemo(() => makeConfetti(24), []);

  useEffect(() => {
    const interval = setInterval(() => {
      setShowcaseIndex((prev) => (prev + 1) % SHOWCASE_SITES.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setTestimonialIndex((prev) => (prev + 1) % TESTIMONIALS.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Confetti burst at 100%
  useEffect(() => {
    if (buildProgress >= 100 && !showConfetti) {
      setShowConfetti(true);
    }
  }, [buildProgress, showConfetti]);

  const site = SHOWCASE_SITES[showcaseIndex];

  // Current engaging step label based on progress
  const engagingLabel = BUILD_STEP_LABELS.filter((s) => buildProgress >= s.at).pop()?.label ?? currentStepLabel;

  // SVG ring dimensions
  const ringSize = 120;
  const strokeWidth = 6;
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
      position: "relative",
      overflow: "hidden",
    }}>

      {/* Floating particles */}
      {particles.map((p) => (
        <motion.div
          key={p.id}
          style={{
            position: "absolute",
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            borderRadius: "50%",
            background: p.color,
            opacity: 0,
            pointerEvents: "none",
          }}
          animate={{
            y: [0, -30, 10, -20, 0],
            x: [0, 15, -10, 20, 0],
            opacity: [0, p.opacity, p.opacity * 0.6, p.opacity, 0],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Confetti burst */}
      <AnimatePresence>
        {showConfetti && confettiPieces.map((c) => (
          <motion.div
            key={`confetti-${c.id}`}
            initial={{
              position: "absolute",
              left: "50%",
              top: "40%",
              opacity: 1,
              scale: 0,
            }}
            animate={{
              left: `${c.x}%`,
              top: `${-20 + Math.random() * 40}%`,
              opacity: [1, 1, 0],
              scale: [0, 1.2, 0.8],
              rotate: c.angle,
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.6 + Math.random() * 0.8, ease: "easeOut" }}
            style={{
              position: "absolute",
              width: c.size,
              height: c.size * 1.5,
              borderRadius: 2,
              background: c.color,
              pointerEvents: "none",
              zIndex: 20,
            }}
          />
        ))}
      </AnimatePresence>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={{ textAlign: "center", marginBottom: 40 }}
      >
        <h2 style={{
          fontFamily: T.h,
          fontSize: "2.5rem",
          fontWeight: 600,
          color: T.text,
          letterSpacing: "-0.02em",
          lineHeight: 1.1,
          marginBottom: 8,
        }}>
          Building {businessName}
        </h2>
        <p style={{ color: T.text2, fontSize: "1rem" }}>{tagline}</p>
      </motion.div>

      {/* Circular progress ring */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.15 }}
        style={{ position: "relative", width: ringSize, height: ringSize, marginBottom: 16 }}
      >
        <svg width={ringSize} height={ringSize} style={{ transform: "rotate(-90deg)" }}>
          {/* Track */}
          <circle
            cx={ringSize / 2}
            cy={ringSize / 2}
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth={strokeWidth}
          />
          {/* Progress arc */}
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
            style={{
              filter: "drop-shadow(0 0 6px rgba(123,57,252,0.4))",
            }}
          />
        </svg>
        {/* Percentage text in center */}
        <div style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
        }}>
          <span style={{
            fontFamily: T.h,
            fontSize: "1.6rem",
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
        transition={{ delay: 0.3 }}
        style={{ textAlign: "center", marginBottom: 48 }}
      >
        <AnimatePresence mode="wait">
          <motion.p
            key={engagingLabel}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.3 }}
            style={{
              color: T.purpleLight,
              fontSize: "0.9rem",
              fontFamily: T.h,
              fontWeight: 500,
            }}
          >
            {engagingLabel}
          </motion.p>
        </AnimatePresence>
      </motion.div>

      {/* Showcase carousel */}
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        style={{ width: "100%", maxWidth: 600, marginBottom: 48 }}
      >
        <p style={{
          color: T.text3,
          fontSize: "0.7rem",
          textTransform: "uppercase",
          letterSpacing: "0.12em",
          marginBottom: 12,
          fontWeight: 500,
          fontFamily: T.h,
        }}>
          Sites built with NoMistakes
        </p>

        <div style={{
          position: "relative",
          borderRadius: 16,
          border: `1px solid ${T.border}`,
          overflow: "hidden",
          height: 280,
          background: T.glass,
          backdropFilter: "blur(12px)",
        }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={showcaseIndex}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6 }}
              style={{
                position: "absolute",
                inset: 0,
                background: site.gradient,
                padding: 28,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              {/* Browser chrome */}
              <div>
                <div style={{ display: "flex", gap: 6, marginBottom: 20 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: "rgba(255,255,255,0.06)" }} />
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: "rgba(255,255,255,0.06)" }} />
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: "rgba(255,255,255,0.06)" }} />
                </div>

                <h3 style={{
                  fontFamily: T.h,
                  fontSize: "1.35rem",
                  fontWeight: 600,
                  color: T.text,
                  marginBottom: 6,
                }}>
                  {site.name}
                </h3>
                <span style={{
                  display: "inline-block",
                  fontSize: "0.65rem",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  color: site.accent,
                  fontFamily: T.h,
                  marginBottom: 18,
                }}>
                  {site.type}
                </span>

                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {site.sections.map((section) => (
                    <span key={section} style={{
                      padding: "5px 12px",
                      borderRadius: 100,
                      fontSize: "0.7rem",
                      color: T.text3,
                      background: T.glass,
                      border: `1px solid ${T.border}`,
                      fontFamily: T.h,
                    }}>
                      {section}
                    </span>
                  ))}
                </div>
              </div>

              <p style={{ color: T.text3, fontSize: "0.7rem", fontFamily: T.h }}>
                {site.launched}
              </p>
            </motion.div>
          </AnimatePresence>

          {/* Dots */}
          <div style={{ position: "absolute", bottom: 14, right: 14, display: "flex", gap: 5 }}>
            {SHOWCASE_SITES.map((_, i) => (
              <div key={i} style={{
                width: i === showcaseIndex ? 18 : 5,
                height: 5,
                borderRadius: 100,
                background: i === showcaseIndex ? T.purple : "rgba(255,255,255,0.1)",
                transition: "all 0.3s ease",
              }} />
            ))}
          </div>
        </div>
      </motion.div>

      {/* Error */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ textAlign: "center", marginBottom: 24 }}
        >
          <p style={{ color: "#ef4444", fontSize: "0.85rem", marginBottom: 16, fontFamily: T.h }}>{error}</p>
          <button
            onClick={onRetry}
            style={{
              padding: "12px 28px",
              borderRadius: 100,
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

      {/* Social proof */}
      {!error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}
        >
          <div style={{ display: "flex", gap: 24, alignItems: "center", flexWrap: "wrap", justifyContent: "center" }}>
            <span style={{ color: T.text3, fontSize: "0.75rem", fontFamily: T.h }}>
              <strong style={{ color: T.text2 }}>12,847</strong> businesses launched
            </span>
            <span style={{ color: T.text3, fontSize: "0.75rem", fontFamily: T.h }}>
              <strong style={{ color: T.text2 }}>52s</strong> avg build time
            </span>
          </div>

          <AnimatePresence mode="wait">
            <motion.p
              key={testimonialIndex}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.4 }}
              style={{ color: T.text3, fontSize: "0.75rem", fontStyle: "italic", fontFamily: T.h }}
            >
              &ldquo;{TESTIMONIALS[testimonialIndex].text}&rdquo;
              <span style={{ color: T.text3, marginLeft: 8, fontStyle: "normal" }}>
                &mdash; {TESTIMONIALS[testimonialIndex].author}
              </span>
            </motion.p>
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}
