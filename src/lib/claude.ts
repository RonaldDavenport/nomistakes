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
  model: "claude-haiku-4-5-20251001" | "claude-sonnet-4-5-20250929" = "claude-haiku-4-5-20251001",
  maxTokens = 4096
): Promise<GenerationResult> {
  const response = await anthropic.messages.create({
    model,
    max_tokens: maxTokens,
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
  const isServices = type === "services";

  const result = await generate(
    `You are building the website for "${businessName}" — a premium ${isServices ? "service-based" : "digital product"} business.

BUSINESS CONTEXT:
- Name: ${businessName}
- Tagline: "${tagline}"
- Type: ${type}
- What they do: ${desc}
- Target audience: ${audience}
- Brand tone: ${(brand as { tone?: string }).tone || "professional"}

RESEARCH CONTEXT — Study how top companies in similar niches position themselves:
- For consulting/coaching: Study how McKinsey, Bain, Tony Robbins, Alex Hormozi position their services. Use outcome-driven language. Lead with the transformation, not the process.
- For digital products/courses: Study how Masterclass, Coursera, Gumroad creators position offerings. Use social proof, specificity, and scarcity.
- For agencies/freelance: Study how Pentagram, IDEO, top Toptal freelancers position. Lead with portfolio results and client outcomes.
- For SaaS/tools: Study how Linear, Notion, Vercel position. Use crisp, technical but human copy.

WRITING RULES:
1. NEVER use generic filler like "We're passionate about...", "Our team of experts...", "Unlock your potential..."
2. Lead every headline with a specific outcome or transformation
3. Use concrete numbers in testimonials (revenue increases, time saved, % improvements)
4. Each product/service must have a clear "who it's for" and "what you get"
5. FAQ answers should directly address the #1 objection and turn it into a reason to buy
6. Hero headline: 4-8 words, punchy, outcome-focused. Think "Ship faster." or "Revenue on autopilot."
7. Subheadline: One sentence that explains the HOW behind the headline
8. Write like a human, not an AI. Short sentences. Sentence fragments are fine. Be direct.

Return a JSON object with ALL of these fields:

{
  "hero": {
    "headline": "4-8 word headline focused on the outcome/transformation the customer gets",
    "subheadline": "One clear sentence explaining how ${businessName} delivers that outcome. Be specific."
  },
  "about": {
    "title": "A compelling section title (not just 'About Us')",
    "text": "3-4 paragraphs. Start with the problem (what frustrated you about the industry). Then the insight (what you discovered). Then the approach (how ${businessName} does it differently). End with the promise. Write in first person plural (we). Make it feel like a real founder story, not corporate speak.",
    "mission": "One bold sentence. Not 'To empower...' — more like 'We exist to make [specific outcome] inevitable for [specific audience].'"
  },
  "features": [
    { "title": "Benefit-focused title (e.g., 'Results in 14 days, not 14 months')", "desc": "2 sentences. First sentence: the problem this solves. Second: how we solve it differently." }
  ],
  "products": [
    {
      "name": "Tier name that implies value (e.g., 'Growth Sprint' not 'Basic Plan')",
      "desc": "2-3 sentences. WHO this is for and WHAT transformation they get. Not just a feature list.",
      "price": "Realistic price with $ sign${isServices ? " (can be /mo, /session, or /engagement)" : " (one-time or /mo for memberships)"}",
      "features": ["Specific deliverable 1", "Specific deliverable 2", "Specific deliverable 3", "Specific deliverable 4"]
    }
  ],
  "testimonials": [
    {
      "name": "Realistic full name (diverse names)",
      "role": "Specific job title at a realistic company (e.g., 'Head of Growth at Airtable' not 'Business Owner')",
      "text": "1-2 sentences with a SPECIFIC metric or result. e.g., 'Went from 2K to 18K MRR in 3 months.' or 'Cut our onboarding time from 2 weeks to 2 days.' Never say 'highly recommend' or 'amazing experience.'",
      "rating": 5
    }
  ],
  "process": {
    "title": "How It Works section heading (e.g., 'From zero to launch in 3 steps')",
    "steps": [
      {
        "step": "1",
        "title": "Short action name (e.g., 'Discovery Call')",
        "desc": "2 sentences explaining this step and what the customer experiences"
      }
    ]
  },
  "stats": [
    { "value": "A big impressive number with + or % (e.g., '500+', '97%', '3x')", "label": "What this number represents (e.g., 'Clients Served', 'Satisfaction Rate')" }
  ],
  "cta": {
    "headline": "Action-oriented headline creating urgency (e.g., 'Stop leaving money on the table.')",
    "subheadline": "One sentence about what happens after they take action",
    "button_text": "${isServices ? "Book a Strategy Call" : "Get Started Now"}"
  },
  "seo": {
    "title": "Under 60 chars. Format: '${businessName} — [outcome in 3-5 words]'",
    "description": "Under 155 chars. Clear value prop with keywords the target audience would search."
  },
  "contact": {
    "email": "hello@${businessName.toLowerCase().replace(/[^a-z0-9]/g, "")}.com",
    "phone": "(555) XXX-XXXX format with realistic digits",
    "hours": "Mon-Fri 9AM-6PM EST"
  },
  "faq": [
    {
      "question": "The #1 objection buyers have (about price, results, trust, or process)",
      "answer": "2-3 sentences that acknowledge the concern, reframe it, and use social proof or a guarantee to overcome it."
    }
  ]
}

Generate exactly: 6 features, ${isServices ? "3" : "3-4"} products/services (with 4 included features each), 3 testimonials, 3 process steps, 4 stats, 5 FAQ items.

Return ONLY valid JSON, no other text.`,
    `You are a world-class direct response copywriter who has studied David Ogilvy, Eugene Schwartz, and modern SaaS copy from companies like Linear, Stripe, and Vercel. You write copy that SELLS — not copy that fills space.

Rules:
- Every line must earn its place. If it doesn't sell, cut it.
- Use specificity over superlatives. "47% faster" beats "much faster."
- Write at an 8th grade reading level. Short sentences. Active voice.
- Testimonials sound like real people, not marketing copy. Include specific numbers.
- Product descriptions answer: "What do I get, what does it cost, and why should I care?"
- Headlines are punchy. 4-8 words max. Lead with the outcome.
- Never use: "leverage", "synergy", "empower", "unlock", "passionate", "cutting-edge", "state-of-the-art", "revolutionize", "game-changer"
- Write for ${audience}. Use their language, reference their pain points, speak to their specific situation.`,
    "claude-sonnet-4-5-20250929",
    8192
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
