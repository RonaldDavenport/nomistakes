import React from "react";
import {
  AbsoluteFill,
  Audio,
  Img,
  interpolate,
  Sequence,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

interface Scene {
  text: string;
  narration: string;
  duration_s: number;
  visual: string;
}

export interface PromoVideoProps {
  scenes: Scene[];
  businessName: string;
  tagline: string;
  primaryColor: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
  headingFont: string;
  bodyFont: string;
  heroImageUrl?: string;
  aboutImageUrl?: string;
  voiceoverUrl?: string;
}

function SceneSlide({
  scene,
  index,
  totalScenes,
  props,
}: {
  scene: Scene;
  index: number;
  totalScenes: number;
  props: PromoVideoProps;
}) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const totalFrames = scene.duration_s * fps;

  // Fade in/out
  const opacity = interpolate(
    frame,
    [0, fps * 0.3, totalFrames - fps * 0.3, totalFrames],
    [0, 1, 1, 0],
    { extrapolateRight: "clamp", extrapolateLeft: "clamp" }
  );

  // Slide up text
  const textY = interpolate(frame, [0, fps * 0.4], [30, 0], {
    extrapolateRight: "clamp",
  });

  // Determine background image based on scene index
  const bgImage =
    index === 0
      ? props.heroImageUrl
      : index === totalScenes - 1
        ? props.heroImageUrl
        : props.aboutImageUrl;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: props.backgroundColor,
        fontFamily: `"${props.bodyFont}", sans-serif`,
        opacity,
      }}
    >
      {/* Background image with overlay */}
      {bgImage && (
        <>
          <Img
            src={bgImage}
            style={{
              position: "absolute",
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: `linear-gradient(135deg, ${props.backgroundColor}dd, ${props.backgroundColor}99)`,
            }}
          />
        </>
      )}

      {/* Gradient accent */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 6,
          background: `linear-gradient(90deg, ${props.primaryColor}, ${props.accentColor})`,
        }}
      />

      {/* Content */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          padding: "60px 100px",
          textAlign: "center",
          transform: `translateY(${textY}px)`,
        }}
      >
        {/* Scene number badge — first and last scene get special treatment */}
        {index > 0 && index < totalScenes - 1 && (
          <div
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: props.primaryColor,
              marginBottom: 20,
              letterSpacing: 3,
              textTransform: "uppercase",
            }}
          >
            {scene.visual.split(" ").slice(0, 3).join(" ")}
          </div>
        )}

        {/* Main text */}
        <h1
          style={{
            fontFamily: `"${props.headingFont}", sans-serif`,
            fontSize: index === 0 || index === totalScenes - 1 ? 72 : 56,
            fontWeight: 800,
            color: props.textColor,
            lineHeight: 1.1,
            letterSpacing: "-0.03em",
            maxWidth: 900,
          }}
        >
          {scene.text}
        </h1>

        {/* Narration subtitle for context */}
        {scene.narration && index > 0 && index < totalScenes - 1 && (
          <p
            style={{
              fontSize: 22,
              color: `${props.textColor}88`,
              marginTop: 24,
              maxWidth: 700,
              lineHeight: 1.5,
            }}
          >
            {scene.narration.slice(0, 100)}
            {scene.narration.length > 100 ? "..." : ""}
          </p>
        )}

        {/* Business name on first slide */}
        {index === 0 && (
          <div
            style={{
              marginTop: 32,
              fontSize: 18,
              fontWeight: 600,
              color: props.primaryColor,
            }}
          >
            {props.businessName}
          </div>
        )}

        {/* CTA on last slide */}
        {index === totalScenes - 1 && (
          <div
            style={{
              marginTop: 36,
              padding: "16px 48px",
              borderRadius: 12,
              background: props.primaryColor,
              color: isLightColor(props.primaryColor) ? "#111" : "#fff",
              fontSize: 20,
              fontWeight: 700,
            }}
          >
            Get Started
          </div>
        )}
      </div>

      {/* Lower-third business name */}
      <div
        style={{
          position: "absolute",
          bottom: 24,
          left: 40,
          display: "flex",
          alignItems: "center",
          gap: 10,
          opacity: 0.5,
        }}
      >
        <div
          style={{
            width: 4,
            height: 20,
            borderRadius: 2,
            background: props.primaryColor,
          }}
        />
        <span
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: props.textColor,
            letterSpacing: "-0.01em",
          }}
        >
          {props.businessName}
        </span>
      </div>
    </AbsoluteFill>
  );
}

export const PromoVideo: React.FC<PromoVideoProps> = (props) => {
  const { fps } = useVideoConfig();

  let frameOffset = 0;
  return (
    <AbsoluteFill style={{ backgroundColor: props.backgroundColor }}>
      {/* Voiceover audio */}
      {props.voiceoverUrl && (
        <Audio src={props.voiceoverUrl} />
      )}

      {props.scenes.map((scene, i) => {
        const durationInFrames = Math.round(scene.duration_s * fps);
        const from = frameOffset;
        frameOffset += durationInFrames;

        return (
          <Sequence key={i} from={from} durationInFrames={durationInFrames}>
            <SceneSlide
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
