import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { deductCredits, requireCredits, InsufficientCreditsError } from "@/lib/credits";

export const maxDuration = 300;

const REGENERATE_VIDEO_COST = 12; // Cheaper than full generation since script already exists

interface ScriptScene {
  timestamp: string;
  visual: string;
  dialogue: string;
  direction: string;
}

interface UGCScript {
  title: string;
  hook: string;
  script: ScriptScene[];
  cta: string;
  music_suggestion: string;
  hashtags: string[];
  thumbnail_concept: string;
  estimated_duration_seconds: number;
}

// Build a video generation prompt from the parsed script
function buildVideoPrompt(
  script: UGCScript,
  videoStyle: string,
  platform: string,
  tone: string
): string {
  const sceneDescriptions = script.script
    .map((s) => `[${s.timestamp}] ${s.visual}. ${s.direction}`)
    .join("\n");

  return `Create a ${videoStyle} UGC video for ${platform}.
${sceneDescriptions}
The video should feel authentic and ${tone}.`;
}

// POST /api/ugc/generate-video — regenerate video from an existing script (retry / different style)
export async function POST(req: NextRequest) {
  const { videoId, userId, businessId, videoStyle, platform } = await req.json();

  if (!videoId || !userId || !businessId) {
    return NextResponse.json(
      { error: "videoId, userId, and businessId required" },
      { status: 400 }
    );
  }

  // Check that Replicate is configured
  const replicateToken = process.env.REPLICATE_API_TOKEN;
  if (!replicateToken) {
    return NextResponse.json(
      {
        error: "Video generation unavailable. REPLICATE_API_TOKEN not configured.",
      },
      { status: 503 }
    );
  }

  try {
    // 1. Check credits upfront
    await requireCredits(userId, businessId, REGENERATE_VIDEO_COST);

    // 2. Load existing video record
    const db = createServerClient();
    const { data: video, error: fetchError } = await db
      .from("ugc_videos")
      .select("*")
      .eq("id", videoId)
      .eq("business_id", businessId)
      .single();

    if (fetchError || !video) {
      return NextResponse.json(
        { error: "Video not found" },
        { status: 404 }
      );
    }

    const script = video.script as UGCScript;
    if (!script || !script.script || script.script.length === 0) {
      return NextResponse.json(
        { error: "No script found on this video record. Generate a full video first." },
        { status: 400 }
      );
    }

    // Allow overriding videoStyle and platform, fallback to existing values
    const resolvedStyle = videoStyle || video.video_style;
    const resolvedPlatform = platform || video.platform;
    const resolvedTone = video.tone || "authentic";

    // 3. Build video prompt from existing script
    const videoPrompt = buildVideoPrompt(
      script,
      resolvedStyle,
      resolvedPlatform,
      resolvedTone
    );

    // 4. Create Replicate prediction
    const repRes = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${replicateToken}`,
        "Content-Type": "application/json",
        Prefer: "respond-async",
      },
      body: JSON.stringify({
        model: "minimax/video-01-live",
        input: {
          prompt: videoPrompt,
          prompt_optimizer: true,
        },
      }),
    });

    if (!repRes.ok) {
      const errBody = await repRes.text();
      console.error(
        "[ugc/generate-video] Replicate API error:",
        repRes.status,
        errBody
      );
      return NextResponse.json(
        { error: "Failed to start video generation" },
        { status: 502 }
      );
    }

    const prediction = await repRes.json();

    // 5. Deduct credits
    const creditsRemaining = await deductCredits(
      userId,
      businessId,
      REGENERATE_VIDEO_COST,
      "ugc_video_regenerate",
      {
        video_id: videoId,
        replicate_prediction_id: prediction.id,
        video_style: resolvedStyle,
        platform: resolvedPlatform,
      }
    );

    // 6. Update record with new prediction ID and status
    const existingMetadata =
      (video.generation_metadata as Record<string, unknown>) || {};

    const { data: updated, error: updateError } = await db
      .from("ugc_videos")
      .update({
        status: "generating",
        video_url: null, // Clear previous video URL
        video_style: resolvedStyle,
        platform: resolvedPlatform,
        replicate_prediction_id: prediction.id,
        generation_metadata: {
          ...existingMetadata,
          regeneration: true,
          video_prompt: videoPrompt,
          replicate_model: "minimax/video-01-live",
          previous_prediction_id: video.replicate_prediction_id,
          previous_status: video.status,
        },
        updated_at: new Date().toISOString(),
      })
      .eq("id", videoId)
      .select()
      .single();

    if (updateError) {
      console.error("[ugc/generate-video] DB update error:", updateError);
      return NextResponse.json(
        { error: "Failed to update video record" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      video: updated,
      creditsRemaining,
      status: "generating",
      message:
        "Video regeneration started. Poll /api/ugc/{id}/status for progress.",
    });
  } catch (err) {
    if (err instanceof InsufficientCreditsError) {
      return NextResponse.json(
        {
          error: "insufficient_credits",
          required: err.required,
          available: err.available,
        },
        { status: 402 }
      );
    }
    console.error("[ugc/generate-video] Error:", err);
    return NextResponse.json(
      { error: "Video regeneration failed" },
      { status: 500 }
    );
  }
}
