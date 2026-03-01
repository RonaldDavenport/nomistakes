import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { executeAIAction, parseAIJson, InsufficientCreditsError } from "@/lib/ai-actions";
import { CREDIT_COSTS } from "@/lib/credits";

export const maxDuration = 300;

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

// Extract all dialogue from scenes for voiceover
function extractDialogue(scenes: ScriptScene[]): string {
  return scenes
    .map((s) => s.dialogue)
    .filter(Boolean)
    .join(" ");
}

// Create a Replicate prediction for AI video generation
async function createReplicatePrediction(videoPrompt: string): Promise<{
  id: string;
  status: string;
} | null> {
  const token = process.env.REPLICATE_API_TOKEN;
  if (!token) return null;

  const res = await fetch("https://api.replicate.com/v1/predictions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
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

  if (!res.ok) {
    const errBody = await res.text();
    console.error("[ugc/generate] Replicate API error:", res.status, errBody);
    return null;
  }

  const prediction = await res.json();
  return { id: prediction.id, status: prediction.status };
}

// Generate voiceover via ElevenLabs and upload to Supabase Storage
async function generateVoiceover(
  dialogueText: string,
  videoId: string
): Promise<string | null> {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) return null;

  if (!dialogueText.trim()) return null;

  const ttsRes = await fetch(
    "https://api.elevenlabs.io/v1/text-to-speech/21m00Tcm4TlvDq8ikWAM",
    {
      method: "POST",
      headers: {
        "xi-api-key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: dialogueText,
        model_id: "eleven_multilingual_v2",
        voice_settings: { stability: 0.5, similarity_boost: 0.75 },
      }),
    }
  );

  if (!ttsRes.ok) {
    const errBody = await ttsRes.text();
    console.error("[ugc/generate] ElevenLabs API error:", ttsRes.status, errBody);
    return null;
  }

  // Response body is audio/mpeg — upload to Supabase Storage
  const audioBuffer = Buffer.from(await ttsRes.arrayBuffer());
  const storagePath = `ugc-videos/${videoId}-voiceover.mp3`;
  const db = createServerClient();

  const { error: uploadError } = await db.storage
    .from("public")
    .upload(storagePath, audioBuffer, {
      contentType: "audio/mpeg",
      upsert: true,
    });

  if (uploadError) {
    console.error("[ugc/generate] Voiceover upload error:", uploadError);
    return null;
  }

  const { data: urlData } = db.storage.from("public").getPublicUrl(storagePath);
  return urlData.publicUrl;
}

// POST /api/ugc/generate — generate UGC video script + actual video via Replicate + voiceover via ElevenLabs
export async function POST(req: NextRequest) {
  const {
    businessId,
    userId,
    productOrService,
    videoStyle,
    platform,
    duration,
    tone,
  } = await req.json();

  if (!businessId || !userId || !videoStyle || !platform) {
    return NextResponse.json(
      { error: "businessId, userId, videoStyle, and platform required" },
      { status: 400 }
    );
  }

  const resolvedTone = tone || "authentic";
  const resolvedDuration = duration || 30;

  try {
    // 1. Generate script via Claude (costs ugc_video = 15 credits total)
    const scriptResult = await executeAIAction({
      businessId,
      userId,
      action: "ugc_video",
      creditCost: CREDIT_COSTS.ugc_video,
      model: "claude-sonnet-4-5-20250929",
      maxTokens: 4096,
      systemPrompt: `You are a UGC (User Generated Content) video scriptwriter who creates viral, authentic-feeling video ad scripts. You specialize in:

- Testimonial videos: Real-feeling customer stories with specific results
- Unboxing videos: Excited first impressions with genuine reactions
- Demo videos: Clear product/service walkthroughs
- Talking head: Direct-to-camera persuasive pitches
- Before/after: Transformation stories
- Tutorial: Educational content that sells

Rules:
- Hook in the first 2 seconds (question, bold claim, or pattern interrupt)
- Conversational language — NOT corporate speak
- Include pauses, "um"s, and natural speech patterns in the script
- End with a clear CTA
- Match platform conventions (TikTok = fast/trendy, Instagram = polished, YouTube = detailed)`,
      userPrompt: `Create a ${videoStyle} UGC video script for ${platform}.

${productOrService ? `Product/Service: ${productOrService}` : "Use the business's main offering"}
Duration: ${resolvedDuration} seconds
Tone: ${resolvedTone}

Return a JSON object:
{
  "title": "Video title / internal reference name",
  "hook": "Opening line (first 2 seconds — MUST stop the scroll)",
  "script": [
    {
      "timestamp": "0:00-0:02",
      "visual": "What's shown on screen",
      "dialogue": "What's said (or text overlay)",
      "direction": "Camera angle / movement / text placement"
    }
  ],
  "cta": "Final call to action",
  "music_suggestion": "Type of background music/sound",
  "hashtags": ["relevant", "hashtags", "for", "platform"],
  "thumbnail_concept": "Description of the thumbnail",
  "estimated_duration_seconds": number
}

Return ONLY valid JSON.`,
    });

    const script = parseAIJson<UGCScript>(scriptResult.content);

    // 2. Generate a temporary ID for storage paths before DB insert
    const tempId = crypto.randomUUID();

    // 3. Kick off Replicate video generation + ElevenLabs voiceover in parallel
    const videoPrompt = buildVideoPrompt(script, videoStyle, platform, resolvedTone);
    const dialogueText = extractDialogue(script.script);

    const [prediction, voiceoverUrl] = await Promise.all([
      createReplicatePrediction(videoPrompt),
      generateVoiceover(dialogueText, tempId),
    ]);

    // Determine status based on whether Replicate is available
    const hasReplicate = prediction !== null;
    const status = hasReplicate ? "generating" : "script_only";

    // 4. Save UGC video record
    const db = createServerClient();
    const { data: video, error: dbError } = await db
      .from("ugc_videos")
      .insert({
        id: tempId,
        business_id: businessId,
        user_id: userId,
        product_or_service: productOrService || null,
        video_style: videoStyle,
        platform,
        duration_seconds: script.estimated_duration_seconds || resolvedDuration,
        tone: resolvedTone,
        script: script,
        storyboard: script.script,
        status,
        voiceover_url: voiceoverUrl,
        replicate_prediction_id: prediction?.id || null,
        generation_metadata: {
          model: scriptResult.model,
          inputTokens: scriptResult.inputTokens,
          outputTokens: scriptResult.outputTokens,
          video_prompt: videoPrompt,
          replicate_model: "minimax/video-01-live",
          replicate_available: hasReplicate,
          elevenlabs_available: voiceoverUrl !== null,
        },
      })
      .select()
      .single();

    if (dbError) {
      console.error("[ugc/generate] DB error:", dbError);
      return NextResponse.json(
        { error: "Failed to save UGC video" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      video,
      script,
      creditsRemaining: scriptResult.creditsRemaining,
      status,
      message: hasReplicate
        ? "Video is generating. Poll /api/ugc/{id}/status for progress."
        : "Script generated successfully. Video generation unavailable (REPLICATE_API_TOKEN not configured).",
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
    console.error("[ugc/generate] Error:", err);
    return NextResponse.json(
      { error: "UGC generation failed" },
      { status: 500 }
    );
  }
}
