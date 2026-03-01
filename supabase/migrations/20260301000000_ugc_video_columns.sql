-- Add columns needed for Replicate video generation + ElevenLabs voiceover
ALTER TABLE ugc_videos ADD COLUMN IF NOT EXISTS replicate_prediction_id TEXT;
ALTER TABLE ugc_videos ADD COLUMN IF NOT EXISTS voiceover_url TEXT;
