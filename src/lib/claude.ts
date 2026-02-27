import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

export interface GenerationResult {
  content: string;
  inputTokens: number;
  outputTokens: number;
  model: string;
}

export async function generate(
  prompt: string,
  systemPrompt: string,
  model: "claude-haiku-4-5-20251001" | "claude-sonnet-4-5-20250929" = "claude-haiku-4-5-20251001"
): Promise<GenerationResult> {
  const response = await anthropic.messages.create({
    model,
    max_tokens: 4096,
    system: systemPrompt,
    messages: [{ role: "user", content: prompt }],
  });

  const textBlock = response.content.find((b) => b.type === "text");

  return {
    content: textBlock?.text ?? "",
    inputTokens: response.usage.input_tokens,
    outputTokens: response.usage.output_tokens,
    model,
  };
}

// ── Concept Generation ──
export async function generateConcepts(skills: string[], time: string, budget: string, bizType: string) {
  const result = await generate(
    `Generate 3 unique, actionable business concepts for someone with these traits:
- Skills: ${skills.join(", ")}
- Time available: ${time}
- Starting budget: ${budget}
- Preferred type: ${bizType}

IMPORTANT: Only generate SERVICE BUSINESSES or DIGITAL PRODUCT businesses. NO physical products, no ecommerce, no dropshipping, no inventory.
- Service businesses: consulting, coaching, freelancing, agencies, retainers
- Digital products: online courses, templates, ebooks, memberships, digital downloads, SaaS

For each concept, return a JSON array with exactly 3 objects. Each object must have:
- name: A catchy, brandable business name (one word or two words max)
- tagline: One-line pitch (under 10 words)
- type: "digital" | "services" (NEVER "products")
- desc: 2-3 sentence description of the business model. Be specific about what they deliver and how they get paid.
- revenue: Realistic monthly revenue range (e.g. "$2,000 – $8,000/mo")
- startup: Startup cost range (e.g. "$0 – $100")
- audience: One sentence describing ideal customer

Return ONLY valid JSON array, no other text.`,
    "You are a business strategist AI specializing in service businesses and digital products. You generate practical, high-margin business ideas that require no inventory or shipping. Focus on businesses that leverage skills into recurring revenue through consulting, coaching, courses, templates, and memberships. Be creative but realistic.",
    "claude-haiku-4-5-20251001"
  );

  return result;
}

// ── Brand Generation ──
export async function generateBrand(businessName: string, tagline: string, type: string, audience: string) {
  const result = await generate(
    `Create a complete brand identity for this business:
- Name: ${businessName}
- Tagline: ${tagline}
- Type: ${type}
- Target audience: ${audience}

Return a JSON object with:
- colors: { primary: hex, secondary: hex, accent: hex, background: hex, text: hex }
- fonts: { heading: google font name, body: google font name }
- logo_desc: A description of what the logo should look like (we'll generate it later)
- tone: One word brand voice (e.g. "friendly", "bold", "luxurious")
- values: Array of 3 brand values (short phrases)

Return ONLY valid JSON, no other text.`,
    "You are a brand designer AI. Create cohesive, modern brand identities. Choose colors that work well together and match the business type. Pick Google Fonts that are readable and match the brand tone.",
    "claude-haiku-4-5-20251001"
  );

  return result;
}

// ── Site Content Generation ──
export async function generateSiteContent(
  businessName: string,
  tagline: string,
  type: string,
  desc: string,
  audience: string,
  brand: Record<string, unknown>
) {
  const result = await generate(
    `Write all website content for this ${type === "services" ? "service" : "digital product"} business:
- Name: ${businessName}
- Tagline: ${tagline}
- Type: ${type} (digital products/courses OR services/consulting — NOT physical products)
- Description: ${desc}
- Target audience: ${audience}
- Brand tone: ${JSON.stringify(brand)}

Return a JSON object with:
- hero: { headline: string (powerful, under 8 words), subheadline: string (1 sentence value prop) }
- about: { title: string, text: string (2-3 paragraphs about the business story and approach), mission: string (1 sentence mission statement) }
- features: array of 6 objects { title: string, desc: string (1-2 sentences) } — these are benefits/differentiators
- products: array of 3-5 objects representing ${type === "services" ? "service packages/tiers (e.g. Starter, Pro, VIP)" : "digital products/courses (e.g. courses, templates, memberships)"}. Each: { name: string, desc: string (2-3 sentences about what they get), price: string (realistic price with $ sign — services can be /mo or /session, digital products are one-time or /mo for memberships), features: array of 3-5 strings listing exactly what's included }
- testimonials: array of 3 objects { name: string (realistic full name), role: string (job title), text: string (1-2 natural sentences about specific results they got), rating: 5 }
- cta: { headline: string, subheadline: string, button_text: string (e.g. "${type === "services" ? "Book a Call" : "Get Started"}" )}
- seo: { title: string (under 60 chars), description: string (under 160 chars) }
- contact: { email: string (realistic contact email using the business name), phone: string (format: (555) 123-4567), hours: string (e.g. "Mon-Fri 9AM-6PM EST") }
- faq: array of 4-5 objects { question: string, answer: string (2-3 sentences) } — address pricing, results, process, and trust

Make each offering feel premium and distinct with clear value. Testimonials should mention specific outcomes. FAQ should overcome objections.

Return ONLY valid JSON, no other text.`,
    "You are a conversion-focused copywriter AI specializing in service businesses and digital products. Write compelling website copy that sells consulting, coaching, courses, templates, and memberships. Use power words, address pain points, and create urgency. Keep it concise and scannable. Make testimonials mention specific results (numbers, timeframes). Each piece of content should feel unique — never use generic template language like 'lorem ipsum' or 'your company'.",
    "claude-sonnet-4-5-20250929"
  );

  return result;
}

// ── Name Generation ──
export async function generateNames(currentName: string, type: string, audience: string, tagline: string) {
  const result = await generate(
    `The user has a ${type === "services" ? "service" : "digital product"} business currently named "${currentName}" with tagline "${tagline}" targeting ${audience}.

Generate 5 alternative business names. Each name should be:
- Catchy and brandable (1-2 words max)
- Easy to spell and pronounce
- Available as a .com domain (avoid common dictionary words)
- Fitting for a ${type} business

Return a JSON array of 5 objects, each with:
- name: The business name
- slug: URL-friendly version (lowercase, hyphens)
- why: One sentence explaining the name choice

Return ONLY valid JSON array, no other text.`,
    "You are a brand naming expert. Generate creative, memorable business names that feel premium and modern. Avoid generic names. Each name should feel distinct from the others.",
    "claude-haiku-4-5-20251001"
  );

  return result;
}

// ── Business Plan Generation ──
export async function generateBusinessPlan(
  businessName: string,
  tagline: string,
  type: string,
  desc: string,
  audience: string,
  revenue: string,
  startup: string
) {
  const result = await generate(
    `Create a concise business plan for:
- Name: ${businessName}
- Tagline: ${tagline}
- Type: ${type}
- Description: ${desc}
- Target audience: ${audience}
- Revenue estimate: ${revenue}
- Startup cost: ${startup}

Return a JSON object with:
- summary: 2-3 sentence executive summary
- target_market: Who the customers are and market size
- revenue_model: How the business makes money (pricing, upsells, etc.)
- marketing_strategy: Top 3 channels and tactics to get first customers
- competitive_edge: What makes this different from competitors
- first_week: Array of 5 action items for the first week
- first_month: Array of 5 milestones for the first month

Return ONLY valid JSON, no other text.`,
    "You are a startup advisor AI. Create actionable business plans focused on getting to revenue fast. Be specific with numbers and tactics, not generic advice.",
    "claude-haiku-4-5-20251001"
  );

  return result;
}
