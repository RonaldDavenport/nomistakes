import { generate } from "../claude";

export interface VideoScene {
  text: string;
  narration: string;
  duration_s: number;
  visual: string;
}

export interface VideoScript {
  scenes: VideoScene[];
  total_duration_s: number;
  voiceover_text: string;
  title: string;
}

interface ScriptInput {
  businessName: string;
  tagline: string;
  type: string;
  products: { name: string; desc: string }[];
  tone: string;
  style: "promo" | "social_clip";
  topic: string;
  talking_points: string[];
}

export async function generateVideoScript(input: ScriptInput): Promise<VideoScript> {
  const isPromo = input.style === "promo";

  const result = await generate(
    `Create a ${isPromo ? "60-90 second landscape promo/explainer" : "15-30 second vertical TikTok/Reels"} video script for "${input.businessName}".

BUSINESS CONTEXT:
- Name: ${input.businessName}
- Tagline: "${input.tagline}"
- Type: ${input.type}
- Brand tone: ${input.tone}
- Products/Services: ${input.products.map((p) => `${p.name}: ${p.desc}`).join("; ")}
- Topic: ${input.topic}
- Talking points: ${input.talking_points.join(", ")}

${isPromo ? `PROMO VIDEO STRUCTURE (60-90s, 5-7 scenes):
1. HOOK (3-5s): Bold claim or question that stops scrolling
2. PROBLEM (8-12s): Paint the pain point vividly
3. SOLUTION (10-15s): Introduce the business as the answer
4. FEATURES (15-25s): Show 2-3 key benefits with specifics
5. SOCIAL PROOF (8-10s): Quote or stat that builds trust
6. CTA (5-8s): Clear next step with urgency` : `SOCIAL CLIP STRUCTURE (15-30s, 3-4 scenes):
1. HOOK (2-3s): Controversial take or surprising stat
2. VALUE (8-15s): One powerful insight or tip
3. CTA (3-5s): Quick, punchy call to action
Write for Gen Z / millennial attention spans. Punchy. Fast cuts.`}

Return a JSON object with:
- title: Short video title (5-8 words)
- scenes: Array of scene objects, each with:
  - text: On-screen text overlay (short, bold, max 8 words)
  - narration: What the voiceover says for this scene (natural, conversational)
  - duration_s: Duration in seconds
  - visual: Description of what's on screen (motion graphics, product shots, etc.)
- total_duration_s: Sum of all scene durations
- voiceover_text: All narration concatenated with natural pauses (use "..." for pauses)

Return ONLY valid JSON, no other text.`,
    `You are a professional video scriptwriter specializing in ${isPromo ? "business explainer videos" : "viral social media clips"}. Write scripts that are punchy, clear, and conversion-focused. Use ${input.tone} tone. Never be generic — every line should sell.`,
    "claude-haiku-4-5-20251001",
    2048
  );

  try {
    const script = JSON.parse(result.content) as VideoScript;
    return script;
  } catch {
    throw new Error("Failed to parse video script from AI response");
  }
}
