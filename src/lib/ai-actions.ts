// Unified AI action executor — handles credit checks, business context, Claude calls, and logging

import { generate, type GenerationResult } from "@/lib/claude";
import { deductCredits, requireCredits, InsufficientCreditsError } from "@/lib/credits";
import { createServerClient } from "@/lib/supabase";

export { InsufficientCreditsError };

export interface AIActionParams {
  businessId: string;
  userId: string;
  action: string;
  creditCost: number;
  model: "claude-haiku-4-5-20251001" | "claude-sonnet-4-5-20250929";
  systemPrompt: string;
  userPrompt: string;
  maxTokens?: number;
}

export interface AIActionResult extends GenerationResult {
  creditsRemaining: number;
}

// Inject business context into system prompts
export async function getBusinessContext(businessId: string): Promise<string> {
  const db = createServerClient();
  const { data: biz } = await db
    .from("businesses")
    .select("name, type, subtype, tagline, audience, brand, site_content")
    .eq("id", businessId)
    .single();

  if (!biz) return "";

  const brand = biz.brand as Record<string, unknown> | null;
  const siteContent = biz.site_content as Record<string, unknown> | null;
  const products = (siteContent?.products as Array<{ name: string }>) || [];

  return `
Business: ${biz.name}
Type: ${biz.type}${biz.subtype ? ` (${biz.subtype})` : ""}
Tagline: ${biz.tagline}
Target audience: ${biz.audience}
Brand tone: ${(brand?.tone as string) || "professional"}
Brand colors: Primary ${(brand?.colors as Record<string, string>)?.primary || "N/A"}, Accent ${(brand?.colors as Record<string, string>)?.accent || "N/A"}
Products/Services: ${products.map((p) => p.name).join(", ") || "N/A"}
`.trim();
}

// Main executor — checks credits, calls AI, deducts credits, logs
export async function executeAIAction(params: AIActionParams): Promise<AIActionResult> {
  const { businessId, userId, action, creditCost, model, systemPrompt, userPrompt, maxTokens } = params;

  // 1. Check credits upfront
  await requireCredits(userId, businessId, creditCost);

  // 2. Inject business context
  const context = await getBusinessContext(businessId);
  const enrichedSystemPrompt = context
    ? `${systemPrompt}\n\n--- BUSINESS CONTEXT ---\n${context}`
    : systemPrompt;

  // 3. Call Claude
  const result = await generate(userPrompt, enrichedSystemPrompt, model, maxTokens || 4096);

  // 4. Deduct credits
  const creditsRemaining = await deductCredits(userId, businessId, creditCost, action, {
    model,
    inputTokens: result.inputTokens,
    outputTokens: result.outputTokens,
  });

  // 5. Log generation (fire-and-forget)
  const db = createServerClient();
  db.from("generations").insert({
    business_id: businessId,
    user_id: userId,
    type: action,
    model: result.model,
    input_tokens: result.inputTokens,
    output_tokens: result.outputTokens,
  }).then(({ error }) => {
    if (error) console.error(`[ai-actions] Generation log error:`, error.message);
  });

  return { ...result, creditsRemaining };
}

// Parse JSON from AI response (handles markdown code fences and partial matches)
export function parseAIJson<T>(content: string): T {
  // Try direct parse first
  try {
    return JSON.parse(content);
  } catch {
    // Strip markdown code fences
    const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    try {
      return JSON.parse(cleaned);
    } catch {
      // Try extracting JSON object or array
      const objMatch = cleaned.match(/\{[\s\S]*\}/);
      if (objMatch) return JSON.parse(objMatch[0]);
      const arrMatch = cleaned.match(/\[[\s\S]*\]/);
      if (arrMatch) return JSON.parse(arrMatch[0]);
      throw new Error("Could not parse AI response as JSON");
    }
  }
}
