"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { getAvatarScript } from "@/lib/avatar-scripts";

interface AvatarGuideProps {
  stepId: string;
  businessName: string;
}

export default function AvatarGuide({ stepId, businessName }: AvatarGuideProps) {
  const [displayedText, setDisplayedText] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showBubble, setShowBubble] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const typingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const prevStepRef = useRef(stepId);

  const script = getAvatarScript(stepId);

  // Load mute preference
  useEffect(() => {
    const saved = localStorage.getItem("nm-avatar-muted");
    if (saved === "true") setIsMuted(true);
  }, []);

  const startTyping = useCallback((text: string) => {
    if (typingRef.current) clearInterval(typingRef.current);
    setDisplayedText("");
    setShowBubble(true);
    let i = 0;
    typingRef.current = setInterval(() => {
      i++;
      setDisplayedText(text.slice(0, i));
      if (i >= text.length) {
        if (typingRef.current) clearInterval(typingRef.current);
        typingRef.current = null;
      }
    }, 35);
  }, []);

  const playStep = useCallback(() => {
    if (!script) return;
    setDismissed(false);
    setIsPlaying(true);

    // Replace {name} placeholder if needed
    const transcript = script.transcript.replace("{name}", businessName);
    startTyping(transcript);

    // Play video if available
    if (script.videoUrl && videoRef.current) {
      const video = videoRef.current;
      video.src = script.videoUrl;
      video.muted = isMuted;
      video.play().catch(() => {
        // Unmuted autoplay blocked — start muted then unmute once playing
        video.muted = true;
        video.play().then(() => {
          if (!isMuted) video.muted = false;
        }).catch(() => {});
      });
    } else {
      // No video — just show text for a duration, then stop "playing"
      setTimeout(() => setIsPlaying(false), transcript.length * 35 + 2000);
    }
  }, [script, businessName, isMuted, startTyping]);

  // Play on step change
  useEffect(() => {
    if (stepId !== prevStepRef.current) {
      prevStepRef.current = stepId;
      playStep();
    }
  }, [stepId, playStep]);

  // Initial play
  useEffect(() => {
    const timer = setTimeout(() => playStep(), 600);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function toggleMute() {
    const next = !isMuted;
    setIsMuted(next);
    localStorage.setItem("nm-avatar-muted", String(next));
    if (videoRef.current) videoRef.current.muted = next;
  }

  function handleVideoEnd() {
    setIsPlaying(false);
  }

  function replay() {
    playStep();
  }

  function dismiss() {
    setDismissed(true);
    setShowBubble(false);
    setIsPlaying(false);
    if (videoRef.current) videoRef.current.pause();
    if (typingRef.current) {
      clearInterval(typingRef.current);
      typingRef.current = null;
    }
  }

  if (!script) return null;

  const hasVideo = !!script.videoUrl;

  return (
    <>
      <style>{`
        .avatar-guide { position: fixed; bottom: 24px; right: 24px; z-index: 50; }
        .avatar-bubble { position: absolute; right: 0; }
        .avatar-bubble-arrow { right: 40px; }
        .avatar-video { width: 120px; height: 120px; }
        .avatar-fallback { width: 80px; height: 80px; }
        @media (max-width: 1023px) {
          .avatar-guide { right: auto; left: 16px; bottom: 16px; }
          .avatar-bubble { right: auto; left: 0; }
          .avatar-bubble-arrow { right: auto; left: 28px; }
          .avatar-video { width: 72px; height: 72px; }
          .avatar-fallback { width: 56px; height: 56px; }
        }
      `}</style>
      <div className="avatar-guide">
      {/* Speech bubble */}
      {showBubble && !dismissed && (
        <div
          className="animate-bubbleIn avatar-bubble"
          style={{
            position: "absolute",
            bottom: hasVideo ? 140 : 84,
            width: 300,
            maxWidth: "calc(100vw - 48px)",
            background: "#0A0A0F",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 16,
            padding: "14px 16px",
            boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
          }}
        >
          {/* Close button */}
          <button
            onClick={dismiss}
            style={{
              position: "absolute",
              top: 8,
              right: 10,
              background: "none",
              border: "none",
              color: "rgba(255,255,255,0.3)",
              cursor: "pointer",
              fontSize: 14,
              lineHeight: 1,
              padding: 2,
            }}
          >
            &#10005;
          </button>

          <p style={{ color: "#e4e4e7", fontSize: 13, lineHeight: 1.55, margin: 0, paddingRight: 16 }}>
            {displayedText}
            {typingRef.current && (
              <span style={{ opacity: 0.4 }}>|</span>
            )}
          </p>

          {/* Tip */}
          {displayedText.length === script.transcript.length && script.tip && (
            <p
              className="animate-fadeIn"
              style={{
                color: "#A855F7",
                fontSize: 11,
                marginTop: 10,
                marginBottom: 0,
                lineHeight: 1.4,
                fontWeight: 500,
              }}
            >
              {script.tip}
            </p>
          )}

          {/* Bubble arrow */}
          <div
            className="avatar-bubble-arrow"
            style={{
              position: "absolute",
              bottom: -6,
              width: 12,
              height: 12,
              background: "#0A0A0F",
              border: "1px solid rgba(255,255,255,0.08)",
              borderTop: "none",
              borderLeft: "none",
              transform: "rotate(45deg)",
            }}
          />
        </div>
      )}

      {/* Avatar circle */}
      <div style={{ position: "relative", cursor: "pointer" }} onClick={dismissed ? replay : undefined}>
        {/* Pulse ring while playing */}
        {isPlaying && (
          <div
            className="animate-pulseRing"
            style={{
              position: "absolute",
              inset: -6,
              borderRadius: "50%",
              border: "2px solid #7B39FC",
            }}
          />
        )}

        {hasVideo ? (
          <video
            ref={videoRef}
            className="avatar-video"
            playsInline
            onEnded={handleVideoEnd}
            style={{
              borderRadius: "50%",
              objectFit: "cover",
              border: `3px solid ${isPlaying ? "#7B39FC" : "rgba(255,255,255,0.1)"}`,
              transition: "border-color 0.3s",
            }}
          />
        ) : (
          /* Fallback: gradient circle with initial */
          <div
            className="avatar-fallback"
            style={{
              borderRadius: "50%",
              background: "linear-gradient(135deg, #7B39FC, #A855F7)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: `3px solid ${isPlaying ? "#A855F7" : "rgba(255,255,255,0.1)"}`,
              transition: "border-color 0.3s",
              boxShadow: "0 4px 20px rgba(123,57,252,0.3)",
            }}
          >
            <span style={{ color: "#fff", fontSize: 28, fontWeight: 800 }}>M</span>
          </div>
        )}

        {/* Mute button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleMute();
          }}
          style={{
            position: "absolute",
            bottom: -4,
            right: -4,
            width: 28,
            height: 28,
            borderRadius: "50%",
            background: "#0A0A0F",
            border: "1px solid rgba(255,255,255,0.1)",
            color: isMuted ? "rgba(255,255,255,0.3)" : "#A855F7",
            fontSize: 14,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          title={isMuted ? "Unmute" : "Mute"}
        >
          {isMuted ? "\u{1F507}" : "\u{1F50A}"}
        </button>
      </div>
    </div>
    </>
  );
}
