export const SKILLS = [
  { id: "writing", label: "Writing", icon: "\u270D\uFE0F" },
  { id: "design", label: "Design", icon: "\uD83C\uDFA8" },
  { id: "talking", label: "Talking to People", icon: "\uD83D\uDDE3\uFE0F" },
  { id: "organizing", label: "Organizing", icon: "\uD83D\uDCCB" },
  { id: "cooking", label: "Cooking", icon: "\uD83C\uDF73" },
  { id: "fitness", label: "Fitness", icon: "\uD83D\uDCAA" },
  { id: "tech", label: "Tech / Coding", icon: "\uD83D\uDCBB" },
  { id: "crafts", label: "Crafts / DIY", icon: "\uD83D\uDEE0\uFE0F" },
  { id: "teaching", label: "Teaching", icon: "\uD83D\uDCDA" },
  { id: "sales", label: "Sales", icon: "\uD83E\uDD1D" },
  { id: "photography", label: "Photography", icon: "\uD83D\uDCF8" },
  { id: "music", label: "Music", icon: "\uD83C\uDFB5" },
  { id: "social_media", label: "Social Media", icon: "\uD83D\uDCF1" },
  { id: "finance", label: "Finance", icon: "\uD83D\uDCCA" },
  { id: "fashion", label: "Fashion", icon: "\uD83D\uDC57" },
  { id: "gaming", label: "Gaming", icon: "\uD83C\uDFAE" },
  { id: "pets", label: "Pets / Animals", icon: "\uD83D\uDC3E" },
  { id: "travel", label: "Travel", icon: "\u2708\uFE0F" },
];

export const TIME_OPTIONS = [
  { id: "minimal", label: "A few hours/week", desc: "Passive income focus", icon: "\u23F0", hours: "2-5 hrs/week" },
  { id: "side", label: "Side hustle", desc: "Evenings & weekends", icon: "\uD83C\uDF19", hours: "5-15 hrs/week" },
  { id: "part", label: "Part-time", desc: "Serious commitment", icon: "\uD83D\uDCC5", hours: "15-30 hrs/week" },
  { id: "full", label: "Full-time", desc: "All in", icon: "\uD83D\uDE80", hours: "40+ hrs/week" },
];

export const BUDGET_OPTIONS = [
  { id: "zero", label: "$0", desc: "Start completely free", icon: "\uD83C\uDD93" },
  { id: "low", label: "$1 \u2013 $100", desc: "Minimal investment", icon: "\uD83D\uDCB5" },
  { id: "mid", label: "$100 \u2013 $1,000", desc: "Room to invest", icon: "\uD83D\uDCB0" },
  { id: "high", label: "$1,000+", desc: "Ready to scale fast", icon: "\uD83C\uDFE6" },
];

export const TYPE_OPTIONS = [
  { id: "products", label: "Physical Products", desc: "E-commerce, dropshipping, handmade", icon: "\uD83D\uDCE6" },
  { id: "digital", label: "Digital Products", desc: "Courses, templates, ebooks, presets", icon: "\uD83D\uDC8E" },
  { id: "services", label: "Services", desc: "Freelance, consulting, coaching", icon: "\uD83C\uDFAF" },
  { id: "any", label: "Surprise Me", desc: "Let AI pick the best fit", icon: "\u2728" },
];

export interface BusinessConcept {
  name: string;
  tagline: string;
  type: string;
  desc: string;
  revenue: string;
  startup: string;
  audience: string;
  skills: string[];
  score?: number;
}

export const CONCEPT_POOL: BusinessConcept[] = [
  { skills: ["writing", "social_media"], name: "ContentForge", tagline: "Done-for-you social media content packs", type: "digital", desc: "Pre-written, customizable social media content bundles for small businesses. Each pack includes 30 days of posts, captions, hashtags, and a content calendar for a specific niche.", revenue: "$2,500 \u2013 $8,000/mo", startup: "$0 \u2013 $50", audience: "Small business owners who hate writing captions" },
  { skills: ["writing", "teaching"], name: "SkillScript", tagline: "Micro-courses that teach one thing really well", type: "digital", desc: "Bite-sized online courses (under 2 hours) teaching specific skills. Think \u201CEmail Marketing for Etsy Sellers\u201D or \u201CInstagram Reels for Restaurants.\u201D", revenue: "$3,000 \u2013 $12,000/mo", startup: "$0 \u2013 $100", audience: "Professionals wanting to level up fast" },
  { skills: ["fitness", "talking"], name: "FitCheck", tagline: "Personalized fitness plans with weekly video check-ins", type: "services", desc: "Online fitness coaching with AI-assisted workout plans and weekly 15-minute video accountability calls.", revenue: "$4,000 \u2013 $15,000/mo", startup: "$0", audience: "Busy professionals who need structure" },
  { skills: ["design", "tech"], name: "BrandDrop", tagline: "Premium brand kits for new businesses", type: "digital", desc: "Complete brand identity packages: logo, color palette, social media templates, business card design, and brand guidelines. Delivered in 48 hours.", revenue: "$5,000 \u2013 $20,000/mo", startup: "$0 \u2013 $100", audience: "New business owners who need to look professional" },
  { skills: ["cooking"], name: "MealMap", tagline: "Niche meal prep guides with grocery lists", type: "digital", desc: "Weekly meal prep guides for specific diets (keto, vegan, bodybuilding, budget). Each guide includes recipes, macro breakdowns, and prep-day timelines.", revenue: "$1,500 \u2013 $6,000/mo", startup: "$0 \u2013 $50", audience: "Health-conscious people who want structure" },
  { skills: ["crafts"], name: "CraftCrate", tagline: "Monthly DIY craft kits shipped to your door", type: "products", desc: "Subscription boxes with all materials and instructions for a unique craft project each month.", revenue: "$3,000 \u2013 $10,000/mo", startup: "$200 \u2013 $800", audience: "Craft lovers who want curated projects" },
  { skills: ["photography"], name: "SnapStock", tagline: "Niche stock photo packs that don't look like stock photos", type: "digital", desc: "Curated photo bundles for specific industries. Authentic, styled photos that brands actually want to use.", revenue: "$2,000 \u2013 $8,000/mo", startup: "$0 \u2013 $200", audience: "Marketers tired of generic stock photos" },
  { skills: ["finance"], name: "LedgerLite", tagline: "Bookkeeping templates + monthly financial reviews", type: "services", desc: "Spreadsheet templates for small business bookkeeping plus a monthly 30-minute financial review call.", revenue: "$3,000 \u2013 $12,000/mo", startup: "$0", audience: "Solo entrepreneurs drowning in receipts" },
  { skills: ["gaming"], name: "ProPath", tagline: "Gaming improvement guides and coaching", type: "digital", desc: "Game-specific improvement guides, VOD reviews, and coaching sessions for competitive gamers.", revenue: "$2,000 \u2013 $10,000/mo", startup: "$0 \u2013 $50", audience: "Competitive gamers who want to rank up" },
  { skills: ["pets"], name: "PawBox", tagline: "Custom pet treat boxes with local sourcing", type: "products", desc: "Monthly subscription boxes of artisan pet treats, toys, and accessories from local makers.", revenue: "$2,500 \u2013 $8,000/mo", startup: "$300 \u2013 $1,000", audience: "Pet parents who treat their fur babies like royalty" },
  { skills: ["social_media", "design"], name: "TemplateVault", tagline: "Canva template packs for specific niches", type: "digital", desc: "Pre-designed Canva template bundles: Instagram carousels, story templates, and highlight icons for specific industries.", revenue: "$3,000 \u2013 $15,000/mo", startup: "$0", audience: "Small business owners who want to look great on social" },
  { skills: ["music"], name: "BeatDrop", tagline: "Royalty-free music packs for content creators", type: "digital", desc: "Monthly drops of original, royalty-free music tracks and sound effects for YouTubers and TikTok creators.", revenue: "$2,000 \u2013 $10,000/mo", startup: "$0 \u2013 $200", audience: "Content creators who need affordable music" },
  { skills: ["fashion"], name: "StyleFile", tagline: "Personal styling lookbooks delivered digitally", type: "services", desc: "Digital personal styling service: clients get a curated lookbook with outfit ideas, shopping links, and seasonal updates.", revenue: "$3,000 \u2013 $12,000/mo", startup: "$0", audience: "People who want to dress better without the guesswork" },
  { skills: ["travel"], name: "RouteReady", tagline: "Custom travel itineraries for specific trip types", type: "digital", desc: "Detailed, day-by-day travel itineraries for popular destinations with restaurants, activities, and local tips.", revenue: "$1,500 \u2013 $6,000/mo", startup: "$0", audience: "Travelers who want a local experience without research" },
  { skills: ["organizing", "teaching"], name: "SystemSync", tagline: "Notion/productivity template packs + setup calls", type: "digital", desc: "Pre-built Notion and Google Sheets templates for specific workflows. Premium tier includes a setup call.", revenue: "$2,000 \u2013 $8,000/mo", startup: "$0", audience: "Entrepreneurs who need systems but can\u2019t build them" },
  { skills: ["sales", "talking"], name: "CloserKit", tagline: "Sales script templates + roleplay coaching", type: "services", desc: "Done-for-you sales scripts for common scenarios plus weekly group roleplay sessions.", revenue: "$4,000 \u2013 $15,000/mo", startup: "$0", audience: "Freelancers who struggle with selling" },
];

export function generateConcepts(
  skills: string[],
  time: string,
  budget: string,
  bizType: string
): BusinessConcept[] {
  const skillSet = new Set(skills);

  const scored = CONCEPT_POOL.map((c) => {
    let score = 0;
    c.skills.forEach((s) => { if (skillSet.has(s)) score += 2; });
    if (bizType === "any" || bizType === c.type) score += 1;
    if (bizType === c.type) score += 1;
    const startupNum = parseInt(c.startup.replace(/[^0-9]/g, "")) || 0;
    if (budget === "zero" && startupNum === 0) score += 1;
    if (budget === "low" && startupNum <= 100) score += 1;
    if (budget === "mid" && startupNum <= 1000) score += 1;
    if (budget === "high") score += 1;
    return { ...c, score };
  });

  scored.sort((a, b) => (b.score ?? 0) - (a.score ?? 0));

  const results: BusinessConcept[] = [];
  const seen = new Set<string>();
  for (const c of scored) {
    if (!seen.has(c.name) && results.length < 3) {
      seen.add(c.name);
      results.push(c);
    }
  }
  return results;
}
