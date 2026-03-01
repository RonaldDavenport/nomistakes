import {
  renderMediaOnLambda,
  getRenderProgress,
  type RenderMediaOnLambdaOutput,
} from "@remotion/lambda/client";
import { createServerClient } from "../supabase";

const REMOTION_FUNCTION_NAME = process.env.REMOTION_FUNCTION_NAME || "remotion-render";
const REMOTION_SERVE_URL = process.env.REMOTION_SERVE_URL || "";
const AWS_REGION = (process.env.REMOTION_AWS_REGION || "us-east-1") as
  | "us-east-1"
  | "us-east-2"
  | "us-west-2"
  | "eu-west-1"
  | "ap-southeast-1";

interface RenderInput {
  compositionId: "PromoVideo" | "SocialClip";
  inputProps: Record<string, unknown>;
  businessId: string;
  style: "promo" | "social_clip";
}

interface RenderResult {
  url: string;
  duration_s: number;
  style: "promo" | "social_clip";
}

/**
 * Render a video using Remotion Lambda.
 * Polls for completion, then uploads the final video to Supabase Storage.
 */
export async function renderVideo(input: RenderInput): Promise<RenderResult> {
  // 1. Start render on Lambda
  const renderResponse: RenderMediaOnLambdaOutput = await renderMediaOnLambda({
    region: AWS_REGION,
    functionName: REMOTION_FUNCTION_NAME,
    serveUrl: REMOTION_SERVE_URL,
    composition: input.compositionId,
    inputProps: input.inputProps,
    codec: "h264",
    maxRetries: 1,
    framesPerLambda: 20,
    privacy: "public",
  });

  const { renderId, bucketName } = renderResponse;

  // 2. Poll for completion
  let progress = 0;
  let outputUrl = "";
  const maxAttempts = 120; // 120 * 2s = 4 min max
  let attempts = 0;

  while (progress < 1 && attempts < maxAttempts) {
    await new Promise((r) => setTimeout(r, 2000));
    attempts++;

    const status = await getRenderProgress({
      renderId,
      bucketName,
      functionName: REMOTION_FUNCTION_NAME,
      region: AWS_REGION,
    });

    progress = status.overallProgress;

    if (status.fatalErrorEncountered) {
      throw new Error(
        `Remotion render failed: ${status.errors?.[0]?.message || "Unknown error"}`
      );
    }

    if (status.done && status.outputFile) {
      outputUrl = status.outputFile;
      break;
    }
  }

  if (!outputUrl) {
    throw new Error("Render timed out after 4 minutes");
  }

  // 3. Download from S3 and upload to Supabase Storage
  const videoResponse = await fetch(outputUrl);
  const videoBuffer = Buffer.from(await videoResponse.arrayBuffer());

  const timestamp = Date.now();
  const path = `${input.businessId}/video-${input.style}-${timestamp}.mp4`;

  const db = createServerClient();
  const { error: uploadError } = await db.storage
    .from("business-images")
    .upload(path, videoBuffer, {
      contentType: "video/mp4",
      upsert: true,
    });

  if (uploadError) throw uploadError;

  const { data: urlData } = db.storage
    .from("business-images")
    .getPublicUrl(path);

  // Calculate duration from scenes
  const scenes = (input.inputProps.scenes || []) as { duration_s: number }[];
  const duration_s = scenes.reduce((sum, s) => sum + s.duration_s, 0);

  return {
    url: urlData.publicUrl,
    duration_s,
    style: input.style,
  };
}
