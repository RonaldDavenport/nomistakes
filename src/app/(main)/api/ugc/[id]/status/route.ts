import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

export const maxDuration = 300;

interface ReplicatePrediction {
  id: string;
  status: "starting" | "processing" | "succeeded" | "failed" | "canceled";
  output: string | string[] | null;
  error: string | null;
  logs: string;
  metrics?: { predict_time?: number };
}

// Check Replicate prediction status
async function checkReplicatePrediction(
  predictionId: string
): Promise<ReplicatePrediction | null> {
  const token = process.env.REPLICATE_API_TOKEN;
  if (!token) return null;

  const res = await fetch(
    `https://api.replicate.com/v1/predictions/${predictionId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!res.ok) {
    console.error(
      "[ugc/status] Replicate status check failed:",
      res.status,
      await res.text()
    );
    return null;
  }

  return res.json();
}

// Download video from Replicate and upload to Supabase Storage
async function downloadAndUploadVideo(
  outputUrl: string,
  videoId: string
): Promise<string | null> {
  try {
    const videoRes = await fetch(outputUrl);
    if (!videoRes.ok) {
      console.error(
        "[ugc/status] Failed to download video from Replicate:",
        videoRes.status
      );
      return null;
    }

    const videoBuffer = Buffer.from(await videoRes.arrayBuffer());
    const storagePath = `ugc-videos/${videoId}.mp4`;
    const db = createServerClient();

    const { error: uploadError } = await db.storage
      .from("public")
      .upload(storagePath, videoBuffer, {
        contentType: "video/mp4",
        upsert: true,
      });

    if (uploadError) {
      console.error("[ugc/status] Video upload error:", uploadError);
      return null;
    }

    const { data: urlData } = db.storage
      .from("public")
      .getPublicUrl(storagePath);
    return urlData.publicUrl;
  } catch (err) {
    console.error("[ugc/status] Download/upload error:", err);
    return null;
  }
}

// Map Replicate status to a user-friendly progress indicator
function getProgress(status: string): string {
  switch (status) {
    case "starting":
      return "Initializing video generation...";
    case "processing":
      return "Generating video frames...";
    case "succeeded":
      return "Video ready!";
    case "failed":
      return "Video generation failed.";
    case "canceled":
      return "Video generation was canceled.";
    default:
      return "Checking status...";
  }
}

// GET /api/ugc/[id]/status — check video generation status, sync with Replicate
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: videoId } = await params;

  if (!videoId) {
    return NextResponse.json({ error: "Video ID required" }, { status: 400 });
  }

  const db = createServerClient();

  // 1. Load the ugc_video record
  const { data: video, error: dbError } = await db
    .from("ugc_videos")
    .select("*")
    .eq("id", videoId)
    .single();

  if (dbError || !video) {
    return NextResponse.json({ error: "Video not found" }, { status: 404 });
  }

  // 2. If status is "generating" and we have a prediction ID, check Replicate
  if (
    video.status === "generating" &&
    video.replicate_prediction_id
  ) {
    const prediction = await checkReplicatePrediction(
      video.replicate_prediction_id
    );

    if (prediction) {
      if (prediction.status === "succeeded" && prediction.output) {
        // Replicate output can be a string URL or an array of URLs
        const outputUrl = Array.isArray(prediction.output)
          ? prediction.output[0]
          : prediction.output;

        if (outputUrl) {
          // Download from Replicate and upload to Supabase Storage
          const videoUrl = await downloadAndUploadVideo(outputUrl, videoId);

          if (videoUrl) {
            // Update DB with final video URL
            const metadata = (video.generation_metadata as Record<string, unknown>) || {};
            await db
              .from("ugc_videos")
              .update({
                status: "ready",
                video_url: videoUrl,
                generation_metadata: {
                  ...metadata,
                  replicate_status: "succeeded",
                  replicate_predict_time: prediction.metrics?.predict_time,
                },
                updated_at: new Date().toISOString(),
              })
              .eq("id", videoId);

            return NextResponse.json({
              status: "ready",
              video_url: videoUrl,
              voiceover_url: video.voiceover_url,
              script: video.script,
              progress: "Video ready!",
            });
          } else {
            // Upload failed — mark as failed
            await db
              .from("ugc_videos")
              .update({
                status: "failed",
                generation_metadata: {
                  ...(video.generation_metadata as Record<string, unknown>),
                  replicate_status: "succeeded",
                  upload_failed: true,
                  error: "Failed to download/upload video from Replicate",
                },
                updated_at: new Date().toISOString(),
              })
              .eq("id", videoId);

            return NextResponse.json({
              status: "failed",
              script: video.script,
              voiceover_url: video.voiceover_url,
              progress: "Video generated but upload failed. Try regenerating.",
            });
          }
        }
      }

      if (prediction.status === "failed" || prediction.status === "canceled") {
        // Update DB with failure
        await db
          .from("ugc_videos")
          .update({
            status: "failed",
            generation_metadata: {
              ...(video.generation_metadata as Record<string, unknown>),
              replicate_status: prediction.status,
              replicate_error: prediction.error,
            },
            updated_at: new Date().toISOString(),
          })
          .eq("id", videoId);

        return NextResponse.json({
          status: "failed",
          script: video.script,
          voiceover_url: video.voiceover_url,
          progress: getProgress(prediction.status),
          error: prediction.error,
        });
      }

      // Still processing — return current Replicate status
      return NextResponse.json({
        status: "generating",
        replicate_status: prediction.status,
        script: video.script,
        voiceover_url: video.voiceover_url,
        progress: getProgress(prediction.status),
      });
    }

    // Couldn't reach Replicate — return what we have
    return NextResponse.json({
      status: "generating",
      script: video.script,
      voiceover_url: video.voiceover_url,
      progress: "Checking video generation status...",
    });
  }

  // 3. For any other status (ready, script_only, failed), return as-is
  return NextResponse.json({
    status: video.status,
    video_url: video.video_url || null,
    voiceover_url: video.voiceover_url || null,
    script: video.script,
    progress: video.status === "ready"
      ? "Video ready!"
      : video.status === "script_only"
        ? "Script generated. Video generation unavailable."
        : video.status === "failed"
          ? "Video generation failed."
          : video.status,
  });
}
