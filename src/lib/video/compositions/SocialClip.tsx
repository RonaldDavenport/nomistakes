import React from "react";
import {
  AbsoluteFill,
  Audio,
  interpolate,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

interface Scene {
  text: string;
  narration: string;
  duration_s: number;
  visual: string;
}

export interface SocialClipProps {
  scenes: Scene[];
  businessName: string;
  primaryColor: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
  headingFont: string;
  voiceoverUrl?: string;
}

function ClipScene({
  scene,
  index,
  totalScenes,
  props,
}: {
  scene: Scene;
  index: number;
  totalScenes: number;
  props: SocialClipProps;
}) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const totalFrames = scene.duration_s * fps;

  // Quick cut transition — fast in, fast out
  const opacity = interpolate(
    frame,
    [0, fps * 0.15, totalFrames - fps * 0.15, totalFrames],
    [0, 1, 1, 0],
    { extrapolateRight: "clamp", extrapolateLeft: "clamp" }
  );

  // Scale pop effect
  const scale = interpolate(frame, [0, fps * 0.2], [0.9, 1], {
    extrapolateRight: "clamp",
  });

  // Determine visual style based on scene position
  const isHook = index === 0;
  const isCTA = index === totalScenes - 1;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: isHook
          ? props.primaryColor
          : isCTA
            ? props.backgroundColor
            : props.backgroundColor,
        opacity,
        transform: `scale(${scale})`,
      }}
    >
      {/* Animated gradient bg for hook */}
      {isHook && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `linear-gradient(160deg, ${props.primaryColor}, ${props.accentColor})`,
          }}
        />
      )}

      {/* Content */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          padding: "80px 48px",
          textAlign: "center",
        }}
      >
        {/* Bold centered text — TikTok style */}
        <h1
          style={{
            fontFamily: `"${props.headingFont}", sans-serif`,
            fontSize: isHook ? 64 : isCTA ? 52 : 56,
            fontWeight: 900,
            color: isHook
              ? isLightColor(props.primaryColor)
                ? "#111"
                : "#fff"
              : props.textColor,
            lineHeight: 1.05,
            letterSpacing: "-0.04em",
            textTransform: isHook ? "uppercase" : "none",
            maxWidth: 900,
          }}
        >
          {scene.text}
        </h1>

        {/* Narration as caption */}
        <p
          style={{
            fontSize: 24,
            fontWeight: 500,
            color: isHook
              ? `${isLightColor(props.primaryColor) ? "#111" : "#fff"}aa`
              : `${props.textColor}77`,
            marginTop: 28,
            maxWidth: 800,
            lineHeight: 1.4,
          }}
        >
          {scene.narration}
        </p>

        {/* CTA button on last slide */}
        {isCTA && (
          <div
            style={{
              marginTop: 48,
              padding: "18px 56px",
              borderRadius: 100,
              background: props.primaryColor,
              color: isLightColor(props.primaryColor) ? "#111" : "#fff",
              fontSize: 22,
              fontWeight: 800,
              letterSpacing: "-0.01em",
            }}
          >
            Try Now
          </div>
        )}
      </div>

      {/* Business name watermark */}
      <div
        style={{
          position: "absolute",
          bottom: 60,
          left: 0,
          right: 0,
          textAlign: "center",
          opacity: 0.3,
        }}
      >
        <span
          style={{
            fontSize: 16,
            fontWeight: 700,
            color: isHook
              ? isLightColor(props.primaryColor)
                ? "#111"
                : "#fff"
              : props.textColor,
            letterSpacing: 2,
            textTransform: "uppercase",
          }}
        >
          {props.businessName}
        </span>
      </div>
    </AbsoluteFill>
  );
}

export const SocialClip: React.FC<SocialClipProps> = (props) => {
  const { fps } = useVideoConfig();

  let frameOffset = 0;
  return (
    <AbsoluteFill style={{ backgroundColor: props.backgroundColor }}>
      {props.voiceoverUrl && <Audio src={props.voiceoverUrl} />}

      {props.scenes.map((scene, i) => {
        const durationInFrames = Math.round(scene.duration_s * fps);
        const from = frameOffset;
        frameOffset += durationInFrames;

        return (
          <Sequence key={i} from={from} durationInFrames={durationInFrames}>
            <ClipScene
              scene={scene}
              index={i}
              totalScenes={props.scenes.length}
              props={props}
            />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};

function isLightColor(hex: string): boolean {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.5;
}
