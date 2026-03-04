import React from "react";
import { Composition } from "remotion";
import { PromoVideo, type PromoVideoProps } from "../src/lib/video/compositions/PromoVideo";
import { SocialClip, type SocialClipProps } from "../src/lib/video/compositions/SocialClip";

const defaultPromoProps: PromoVideoProps = {
  scenes: [
    { text: "Your Business", narration: "Welcome", duration_s: 5, visual: "Title card" },
    { text: "The Problem", narration: "Here's the issue", duration_s: 10, visual: "Problem" },
    { text: "Get Started", narration: "Take action", duration_s: 5, visual: "CTA" },
  ],
  businessName: "Your Business",
  tagline: "Your tagline here",
  primaryColor: "#6366f1",
  accentColor: "#a78bfa",
  backgroundColor: "#09090b",
  textColor: "#fafafa",
  headingFont: "Inter",
  bodyFont: "Inter",
};

const defaultSocialProps: SocialClipProps = {
  scenes: [
    { text: "DID YOU KNOW?", narration: "Here's something", duration_s: 3, visual: "Hook" },
    { text: "The Secret", narration: "Here's the value", duration_s: 10, visual: "Value" },
    { text: "Try Now", narration: "Take action", duration_s: 3, visual: "CTA" },
  ],
  businessName: "Your Business",
  primaryColor: "#6366f1",
  accentColor: "#a78bfa",
  backgroundColor: "#09090b",
  textColor: "#fafafa",
  headingFont: "Inter",
};

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <Composition
        id="PromoVideo"
        component={PromoVideo as any}
        durationInFrames={90 * 30}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={defaultPromoProps as any}
        calculateMetadata={({ props }: { props: any }) => {
          const scenes = (props as PromoVideoProps).scenes;
          const totalFrames = scenes.reduce(
            (sum: number, s) => sum + Math.round(s.duration_s * 30),
            0
          );
          return { durationInFrames: totalFrames };
        }}
      />

      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <Composition
        id="SocialClip"
        component={SocialClip as any}
        durationInFrames={30 * 30}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={defaultSocialProps as any}
        calculateMetadata={({ props }: { props: any }) => {
          const scenes = (props as SocialClipProps).scenes;
          const totalFrames = scenes.reduce(
            (sum: number, s) => sum + Math.round(s.duration_s * 30),
            0
          );
          return { durationInFrames: totalFrames };
        }}
      />
    </>
  );
};
