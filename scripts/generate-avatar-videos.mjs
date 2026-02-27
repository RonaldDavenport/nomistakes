#!/usr/bin/env node

/**
 * Generate 8 avatar video clips via HeyGen API, upload to Supabase Storage,
 * and print the public URLs to update avatar-scripts.ts.
 *
 * Usage:
 *   HEYGEN_API_KEY=your_key node scripts/generate-avatar-videos.mjs
 *
 * Optional env vars:
 *   HEYGEN_AVATAR_ID  — avatar to use (default: first available)
 *   HEYGEN_VOICE_ID   — voice to use (default: first available)
 *   SUPABASE_URL      — from .env.local
 *   SUPABASE_SERVICE_KEY — from .env.local
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ── Config ──
const HEYGEN_API_KEY = process.env.HEYGEN_API_KEY;
if (!HEYGEN_API_KEY) {
  console.error("❌ Set HEYGEN_API_KEY environment variable");
  process.exit(1);
}

// Load env from .env.local if available
const envPath = path.join(__dirname, "..", ".env.local");
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf8");
  for (const line of envContent.split("\n")) {
    const match = line.match(/^([^#=]+)=(.*)$/);
    if (match && !process.env[match[1].trim()]) {
      process.env[match[1].trim()] = match[2].trim();
    }
  }
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const AVATAR_ID = process.env.HEYGEN_AVATAR_ID || null;
const VOICE_ID = process.env.HEYGEN_VOICE_ID || null;

const BASE = "https://api.heygen.com";

const SCRIPTS = [
  {
    stepId: "name",
    text: "Hey! I'm Max, and I'll be walking you through setting up your business step by step. So first things first — let's nail your business name. This is what people are going to Google, tell their friends about, and see on every page of your site. A great name is short, memorable, and easy to spell. If you're not feeling the AI-generated one, hit that button and we'll come up with five fresh alternatives for you. Take your time with this one — it matters.",
  },
  {
    stepId: "colors",
    text: "Alright, now we're getting into the fun stuff — your brand colors. Here's the thing most people don't realize: color is the first thing visitors notice, even before they read a single word on your site. The right palette builds instant trust and sets the mood. Pick a preset that feels right, or go with the custom palette our AI designed specifically for your business. You'll see the preview update in real time on the right, so you can see exactly how it looks.",
  },
  {
    stepId: "logo",
    text: "Next up — your logo. Now don't overthink this one. Some of the most successful brands started with just a clean text logo. Think Google, think Supreme. You can use the text mark we've already generated for you, upload your own if you have one, or get a professional one designed later. The important thing is to keep moving — you can always come back and upgrade your logo from your dashboard.",
  },
  {
    stepId: "layout",
    text: "Now let's choose how your website is structured. We've got three layouts that work great for different types of businesses. The Default layout is a solid all-rounder with a hero section, features, testimonials, and a call to action. Minimal is perfect if you're a consultant or coach — it's clean, personal, and puts your story front and center. And Creator is built for selling courses, templates, and digital products. Check the preview to see how each one looks with your colors.",
  },
  {
    stepId: "domain",
    text: "Your site is already live on a free URL, which is totally fine for getting started. But if you want to level up, a custom domain like your-business-dot-com makes a huge difference for credibility. You can grab one for less than ten dollars a year. If you already own a domain, just type it in and we'll walk you through connecting it. And if you're not ready yet, no worries — you can always add one later from your dashboard.",
  },
  {
    stepId: "scheduling",
    text: "If your business involves calls, consultations, or any kind of meetings, this step is a game-changer. By adding your Calendly link, visitors can book time with you directly from your website — no back and forth emails. It shows up as a beautiful booking widget right on your contact page. If you don't have Calendly yet, it's free to set up and takes about two minutes. Trust me, your future self will thank you for this one.",
  },
  {
    stepId: "payments",
    text: "Okay, this is the big one. Connecting Stripe means you can start accepting real payments on your site today. Credit cards, Apple Pay, Google Pay — all of it. There's no monthly fee, just a small percentage per transaction. The setup takes about two minutes, and once it's done, you're officially in business. If you're not ready to accept payments yet, you can skip this and come back to it anytime.",
  },
  {
    stepId: "email",
    text: "Last step — you made it! A professional email like hello at your-business dot com instantly builds trust with clients. It shows you're serious and established. You can set one up through Google Workspace, or just enter whatever email you want displayed on your site. Once you finish this step, you'll be taken to your dashboard where you can manage everything. Congratulations on setting up your business — let's go!",
  },
];

// ── Helpers ──

async function heygenFetch(endpoint, options = {}) {
  const res = await fetch(`${BASE}${endpoint}`, {
    ...options,
    headers: {
      "X-Api-Key": HEYGEN_API_KEY,
      "Content-Type": "application/json",
      ...options.headers,
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HeyGen ${endpoint} failed (${res.status}): ${text}`);
  }
  return res.json();
}

async function getDefaultAvatar() {
  if (AVATAR_ID) return { id: AVATAR_ID, gender: null };
  console.log("📋 Fetching available avatars...");
  const data = await heygenFetch("/v2/avatars");
  const avatars = data.data?.avatars || [];
  if (avatars.length === 0) throw new Error("No avatars found in your HeyGen account");
  const preferred = avatars.find((a) => a.avatar_type === "talking_photo") || avatars[0];
  const gender = preferred.gender || null;
  console.log(`   Using avatar: ${preferred.avatar_name || preferred.avatar_id} (${gender || "unknown gender"})`);
  return { id: preferred.avatar_id, gender };
}

async function getMatchingVoice(avatarGender) {
  if (VOICE_ID) return VOICE_ID;
  console.log("📋 Fetching available voices...");
  const data = await heygenFetch("/v2/voices");
  const voices = data.data?.voices || [];
  if (voices.length === 0) throw new Error("No voices found in your HeyGen account");
  // Filter to English voices
  const english = voices.filter((v) => v.language === "English" || v.language?.startsWith("en"));
  // Match voice gender to avatar gender
  let match;
  if (avatarGender) {
    match = english.find((v) => v.gender?.toLowerCase() === avatarGender.toLowerCase());
  }
  if (!match) match = english[0] || voices[0];
  console.log(`   Using voice: ${match.display_name || match.voice_id} (${match.gender || "unknown"})`);
  return match.voice_id;
}

async function createVideo(avatarId, voiceId, text, stepId) {
  console.log(`🎬 Creating video for step: ${stepId}...`);
  const body = {
    video_inputs: [
      {
        character: {
          type: "avatar",
          avatar_id: avatarId,
          avatar_style: "normal",
        },
        voice: {
          type: "text",
          input_text: text,
          voice_id: voiceId,
          speed: 0.95,
        },
        background: {
          type: "color",
          value: "#0a0a0f",
        },
      },
    ],
    dimension: {
      width: 512,
      height: 512,
    },
  };

  const data = await heygenFetch("/v2/video/generate", {
    method: "POST",
    body: JSON.stringify(body),
  });

  const videoId = data.data?.video_id;
  if (!videoId) throw new Error(`No video_id returned for step ${stepId}`);
  console.log(`   Video ID: ${videoId}`);
  return videoId;
}

async function pollVideoStatus(videoId, stepId) {
  const maxAttempts = 120; // 10 minutes max
  for (let i = 0; i < maxAttempts; i++) {
    await new Promise((r) => setTimeout(r, 5000)); // 5 second intervals
    const data = await heygenFetch(`/v1/video_status.get?video_id=${videoId}`);
    const status = data.data?.status;
    if (status === "completed") {
      const url = data.data?.video_url;
      console.log(`   ✅ ${stepId} complete: ${url}`);
      return url;
    } else if (status === "failed") {
      throw new Error(`Video generation failed for step ${stepId}: ${JSON.stringify(data.data?.error)}`);
    }
    if (i % 6 === 0) console.log(`   ⏳ ${stepId}: ${status}... (${Math.round((i * 5) / 60)}min)`);
  }
  throw new Error(`Timeout waiting for video ${videoId} (step: ${stepId})`);
}

async function downloadVideo(url, stepId) {
  const outputDir = path.join(__dirname, "..", "tmp-avatar-videos");
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
  const filePath = path.join(outputDir, `${stepId}.mp4`);

  console.log(`📥 Downloading ${stepId}.mp4...`);
  const res = await fetch(url);
  const buffer = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync(filePath, buffer);
  console.log(`   Saved: ${filePath}`);
  return filePath;
}

async function uploadToSupabase(filePath, stepId) {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.log(`   ⚠️  Supabase not configured — skipping upload for ${stepId}`);
    return null;
  }

  console.log(`📤 Uploading ${stepId}.mp4 to Supabase Storage...`);
  const fileBuffer = fs.readFileSync(filePath);

  const uploadUrl = `${SUPABASE_URL}/storage/v1/object/avatar-videos/${stepId}.mp4`;
  const res = await fetch(uploadUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
      "Content-Type": "video/mp4",
      "x-upsert": "true",
    },
    body: fileBuffer,
  });

  if (!res.ok) {
    const text = await res.text();
    console.log(`   ⚠️  Upload failed: ${text}`);
    // Try creating bucket first
    const createRes = await fetch(`${SUPABASE_URL}/storage/v1/bucket`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id: "avatar-videos", name: "avatar-videos", public: true }),
    });
    if (createRes.ok || createRes.status === 409) {
      // Retry upload
      const retryRes = await fetch(uploadUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
          "Content-Type": "video/mp4",
          "x-upsert": "true",
        },
        body: fileBuffer,
      });
      if (!retryRes.ok) {
        console.log(`   ⚠️  Retry upload failed`);
        return null;
      }
    } else {
      return null;
    }
  }

  const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/avatar-videos/${stepId}.mp4`;
  console.log(`   ✅ Public URL: ${publicUrl}`);
  return publicUrl;
}

// ── Main ──

async function main() {
  console.log("\n🎥 Generating avatar videos for onboarding...\n");

  const avatar = await getDefaultAvatar();
  const avatarId = avatar.id;
  const voiceId = await getMatchingVoice(avatar.gender);
  console.log("");

  // Step 1: Create all videos in parallel
  const videoIds = [];
  for (const script of SCRIPTS) {
    const videoId = await createVideo(avatarId, voiceId, script.text, script.stepId);
    videoIds.push({ stepId: script.stepId, videoId });
  }

  console.log("\n⏳ Waiting for all videos to render...\n");

  // Step 2: Poll for completion (parallel)
  const results = await Promise.all(
    videoIds.map(async ({ stepId, videoId }) => {
      const videoUrl = await pollVideoStatus(videoId, stepId);
      const filePath = await downloadVideo(videoUrl, stepId);
      const publicUrl = await uploadToSupabase(filePath, stepId);
      return { stepId, videoUrl, filePath, publicUrl };
    })
  );

  // Step 3: Print results
  console.log("\n\n═══════════════════════════════════════════════");
  console.log("  RESULTS — Update src/lib/avatar-scripts.ts");
  console.log("═══════════════════════════════════════════════\n");

  for (const r of results) {
    const url = r.publicUrl || r.videoUrl;
    console.log(`  ${r.stepId}: "${url}"`);
  }

  console.log("\n✅ Done! Videos saved to tmp-avatar-videos/");
  if (results.some((r) => r.publicUrl)) {
    console.log("✅ Uploaded to Supabase Storage (avatar-videos bucket)");
  }
  console.log("");
}

main().catch((err) => {
  console.error("\n❌ Error:", err.message);
  process.exit(1);
});
