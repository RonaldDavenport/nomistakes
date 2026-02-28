// Build business context prompt block for all AI features

export interface BusinessRecord {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  type: string; // 'services' | 'digital'
  subtype: string; // 'freelance' | 'consulting' | etc.
  status: string;
  audience: string;
  revenue_estimate: string;
  brand: {
    tone?: string;
    colors?: { primary: string; secondary: string; accent: string };
    values?: string[];
  };
  site_content: {
    hero?: { headline: string; subheadline: string };
    about?: { text: string; mission: string };
    products?: Array<{ name: string; price: string; desc: string }>;
    features?: Array<{ title: string; desc: string }>;
  };
  business_plan: {
    summary?: string;
    target_market?: string;
    revenue_model?: string;
    marketing_strategy?: string;
    competitive_edge?: string;
  };
  coach_name?: string;
}

export interface ChecklistProgress {
  currentPhase: number;
  phaseTitle: string;
  completedCount: number;
  totalCount: number;
  pctComplete: number;
  nextTaskTitle: string;
  blockedCount: number;
  blockedPlan: string;
}

export function buildContextPrompt(business: BusinessRecord): string {
  const products = business.site_content?.products || [];
  const productList = products
    .map((p) => `- ${p.name} (${p.price}): ${p.desc}`)
    .join("\n");

  const features = business.site_content?.features || [];
  const featureList = features.map((f) => `- ${f.title}`).join("\n");

  return `BUSINESS PROFILE:
- Name: ${business.name}
- Tagline: "${business.tagline}"
- Type: ${business.type} → ${business.subtype}
- Target Audience: ${business.audience}
- Revenue Target: ${business.revenue_estimate}
- Brand Tone: ${business.brand?.tone || "professional"}
${business.brand?.values ? `- Brand Values: ${business.brand.values.join(", ")}` : ""}

BUSINESS PLAN:
${business.business_plan?.summary || "No plan generated yet."}
- Target Market: ${business.business_plan?.target_market || "Not defined"}
- Revenue Model: ${business.business_plan?.revenue_model || "Not defined"}
- Marketing Strategy: ${business.business_plan?.marketing_strategy || "Not defined"}
- Competitive Edge: ${business.business_plan?.competitive_edge || "Not defined"}

${products.length > 0 ? `PRODUCTS/SERVICES:\n${productList}` : ""}
${features.length > 0 ? `KEY FEATURES:\n${featureList}` : ""}

SITE HEADLINE: "${business.site_content?.hero?.headline || ""}"
MISSION: "${business.site_content?.about?.mission || ""}"`;
}

export function buildCoachSystemPrompt(
  business: BusinessRecord,
  progress?: ChecklistProgress
): string {
  const coachIntro = business.coach_name
    ? `You are "${business.coach_name}", the AI business coach for "${business.name}".`
    : `You are the AI business coach for "${business.name}".`;

  const checklistBlock = progress
    ? `\nCHECKLIST CONTEXT:
- Current phase: Phase ${progress.currentPhase} (${progress.phaseTitle})
- Completed: ${progress.completedCount}/${progress.totalCount} tasks (${progress.pctComplete}%)
- Next recommended task: "${progress.nextTaskTitle}"
${progress.blockedCount > 0 ? `- ${progress.blockedCount} tasks require ${progress.blockedPlan} tier upgrade` : ""}`
    : "";

  return `${coachIntro}

${buildContextPrompt(business)}
${checklistBlock}

YOUR ROLE:
- You are a direct, action-oriented business coach — not a chatbot.
- Open with specific observations about THIS business, not generic greetings.
- Reference the launch checklist: suggest the next high-impact task.
- When asked to create content, use the brand voice (${business.brand?.tone || "professional"}) and reference actual products, pricing, and audience.
- Give specific numbers, examples, and templates — not vague advice.
- If the user is stuck, break the next task into 3 micro-steps.
- Celebrate progress: acknowledge completed phases and milestones.
- Never say "I'm just an AI" or "I don't have access to..." — you know this business inside out.`;
}
