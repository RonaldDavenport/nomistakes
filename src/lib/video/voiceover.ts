import { createServerClient } from "../supabase";

const ELEVENLABS_API_URL = "https://api.elevenlabs.io/v1";
// Default professional voice — Rachel (warm, clear, professional)
const DEFAULT_VOICE_ID = "21m00Tcm4TlvDq8ikWAM";

interface VoiceoverResult {
  audioUrl: string;
  voiceId: string;
}

/**
 * Generate voiceover audio using ElevenLabs text-to-speech.
 * Returns a public URL of the uploaded audio file.
 */
export async function generateVoiceover(
  businessId: string,
  text: string,
  voiceId?: string
): Promise<VoiceoverResult> {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    throw new Error("ELEVENLABS_API_KEY is not set");
  }

  const vid = voiceId || DEFAULT_VOICE_ID;

  const response = await fetch(`${ELEVENLABS_API_URL}/text-to-speech/${vid}`, {
    method: "POST",
    headers: {
      "xi-api-key": apiKey,
      "Content-Type": "application/json",
      Accept: "audio/mpeg",
    },
    body: JSON.stringify({
      text,
      model_id: "eleven_turbo_v2_5",
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.75,
        style: 0.3,
        use_speaker_boost: true,
      },
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`ElevenLabs API error (${response.status}): ${error}`);
  }

  const audioBuffer = Buffer.from(await response.arrayBuffer());
  const timestamp = Date.now();
  const path = `${businessId}/voiceover-${timestamp}.mp3`;

  const db = createServerClient();
  const { error: uploadError } = await db.storage
    .from("business-images")
    .upload(path, audioBuffer, {
      contentType: "audio/mpeg",
      upsert: true,
    });

  if (uploadError) throw uploadError;

  const { data: urlData } = db.storage
    .from("business-images")
    .getPublicUrl(path);

  return {
    audioUrl: urlData.publicUrl,
    voiceId: vid,
  };
}

/**
 * List available ElevenLabs voices for the account.
 * Useful for settings page where users pick their voice.
 */
export async function listVoices(): Promise<{ voice_id: string; name: string; preview_url: string }[]> {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) return [];

  const response = await fetch(`${ELEVENLABS_API_URL}/voices`, {
    headers: { "xi-api-key": apiKey },
  });

  if (!response.ok) return [];

  const data = await response.json();
  return (data.voices || []).map((v: { voice_id: string; name: string; preview_url: string }) => ({
    voice_id: v.voice_id,
    name: v.name,
    preview_url: v.preview_url,
  }));
}
