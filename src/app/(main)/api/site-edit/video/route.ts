import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { generateVideoScript } from "@/lib/video/script";
import { generateVoiceover } from "@/lib/video/voiceover";
import { renderVideo } from "@/lib/video/render";

export const maxDuration = 300; // 5 min — video rendering takes 1-3 min

export async function POST(req: NextRequest) {
  const { businessId, style, topic, talking_points } = await req.json();

  if (!businessId || !style || !topic) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  const db = createServerClient();
  const { data: business, error: bizErr } = await db
    .from("businesses")
    .select("*")
    .eq("id", businessId)
    .single();

  if (bizErr || !business) {
    return NextResponse.json({ error: "Business not found" }, { status: 404 });
  }

  const brand = (business.brand || {}) as Record<string, unknown>;
  const colors = (brand.colors || {}) as Record<string, string>;
  const fonts = (brand.fonts || {}) as Record<string, string>;
  const siteContent = (business.site_content || {}) as Record<string, unknown>;
  const products = Array.isArray(siteContent.products)
    ? (siteContent.products as { name: string; desc: string }[]).slice(0, 3)
    : [];
  const images = (siteContent.images || {}) as Record<string, unknown>;

  try {
    // 1. Generate script
    console.log(`[video] Generating script for ${business.name}...`);
    const script = await generateVideoScript({
      businessName: business.name as string,
      tagline: business.tagline as string,
      type: business.type as string,
      products,
      tone: (brand.tone as string) || "professional",
      style,
      topic,
      talking_points: talking_points || [],
    });

    // 2. Generate voiceover
    let voiceoverUrl: string | undefined;
    if (process.env.ELEVENLABS_API_KEY) {
      console.log(`[video] Generating voiceover...`);
      try {
        const voiceover = await generateVoiceover(
          businessId,
          script.voiceover_text,
          (business as Record<string, unknown>).elevenlabs_voice_id as string | undefined
        );
        voiceoverUrl = voiceover.audioUrl;
      } catch (err) {
        console.error("[video] Voiceover failed, proceeding without:", err);
      }
    }

    // 3. Render video
    const compositionId = style === "promo" ? "PromoVideo" : "SocialClip";
    const inputProps =
      style === "promo"
        ? {
            scenes: script.scenes,
            businessName: business.name,
            tagline: business.tagline,
            primaryColor: colors.primary || "#6366f1",
            accentColor: colors.accent || "#a78bfa",
            backgroundColor: colors.background || "#09090b",
            textColor: colors.text || "#fafafa",
            headingFont: fonts.heading || "Inter",
            bodyFont: fonts.body || "Inter",
            heroImageUrl: images.hero || undefined,
            aboutImageUrl: images.about || undefined,
            voiceoverUrl,
          }
        : {
            scenes: script.scenes,
            businessName: business.name,
            primaryColor: colors.primary || "#6366f1",
            accentColor: colors.accent || "#a78bfa",
            backgroundColor: colors.background || "#09090b",
            textColor: colors.text || "#fafafa",
            headingFont: fonts.heading || "Inter",
            voiceoverUrl,
          };

    // Check if Remotion Lambda is configured
    if (!process.env.REMOTION_SERVE_URL) {
      // No Lambda configured — return script + voiceover only
      console.log("[video] Remotion Lambda not configured, returning script only");
      return NextResponse.json({
        success: true,
        partial: true,
        script,
        voiceoverUrl,
        message:
          "Video script and voiceover generated. Remotion Lambda is not configured for rendering. Set REMOTION_SERVE_URL and REMOTION_FUNCTION_NAME to enable video rendering.",
      });
    }

    console.log(`[video] Rendering ${compositionId}...`);
    const result = await renderVideo({
      compositionId,
      inputProps,
      businessId,
      style,
    });

    // 4. Update business with video URL
    await db
      .from("businesses")
      .update({ video_url: result.url })
      .eq("id", businessId);

    console.log(`[video] Complete: ${result.url}`);

    return NextResponse.json({
      success: true,
      url: result.url,
      duration_s: result.duration_s,
      style: result.style,
      script,
    });
  } catch (err) {
    console.error("[video] Generation failed:", err);
    return NextResponse.json(
      { error: "Video generation failed. Please try again." },
      { status: 500 }
    );
  }
}
