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
  { id: "services", label: "Service Business", desc: "Freelance, consulting, coaching, agency", icon: "\uD83C\uDFAF" },
  { id: "digital", label: "Digital Products", desc: "Courses, templates, ebooks, memberships", icon: "\uD83D\uDC8E" },
  { id: "both", label: "Services + Digital", desc: "Combine services with digital products", icon: "\uD83D\uDD25" },
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
  // Service Businesses
  { skills: ["fitness", "talking"], name: "FitCheck", tagline: "Personalized fitness plans with weekly video check-ins", type: "services", desc: "Online fitness coaching with AI-assisted workout plans and weekly 15-minute video accountability calls.", revenue: "$4,000 \u2013 $15,000/mo", startup: "$0", audience: "Busy professionals who need structure" },
  { skills: ["finance"], name: "LedgerLite", tagline: "Bookkeeping templates + monthly financial reviews", type: "services", desc: "Spreadsheet templates for small business bookkeeping plus a monthly 30-minute financial review call.", revenue: "$3,000 \u2013 $12,000/mo", startup: "$0", audience: "Solo entrepreneurs drowning in receipts" },
  { skills: ["fashion"], name: "StyleFile", tagline: "Personal styling lookbooks delivered digitally", type: "services", desc: "Digital personal styling service: clients get a curated lookbook with outfit ideas, shopping links, and seasonal updates.", revenue: "$3,000 \u2013 $12,000/mo", startup: "$0", audience: "People who want to dress better without the guesswork" },
  { skills: ["sales", "talking"], name: "CloserKit", tagline: "Sales coaching and script writing for freelancers", type: "services", desc: "Done-for-you sales scripts for common scenarios plus weekly group roleplay sessions and 1-on-1 deal coaching.", revenue: "$4,000 \u2013 $15,000/mo", startup: "$0", audience: "Freelancers who struggle with selling" },
  { skills: ["tech", "teaching"], name: "CodeMentor", tagline: "1-on-1 coding mentorship for career changers", type: "services", desc: "Personalized coding mentorship with weekly calls, code reviews, portfolio feedback, and job search coaching.", revenue: "$5,000 \u2013 $20,000/mo", startup: "$0", audience: "Career changers breaking into tech" },
  { skills: ["writing", "social_media"], name: "GhostPen", tagline: "Ghostwriting and content strategy for founders", type: "services", desc: "LinkedIn and Twitter ghostwriting, content calendars, and personal brand strategy for startup founders and executives.", revenue: "$5,000 \u2013 $25,000/mo", startup: "$0", audience: "Founders who want to build a personal brand but don\u2019t have time" },
  { skills: ["design", "social_media"], name: "StudioFlow", tagline: "Social media design retainer for growing brands", type: "services", desc: "Monthly design retainer: unlimited social media graphics, ad creatives, and brand collateral for one flat fee.", revenue: "$4,000 \u2013 $18,000/mo", startup: "$0 \u2013 $50", audience: "DTC brands spending $5K+/mo on ads" },
  { skills: ["pets", "talking"], name: "PawCoach", tagline: "Virtual dog training and behavior consulting", type: "services", desc: "Virtual dog training sessions via video call, personalized training plans, and ongoing behavior support.", revenue: "$3,000 \u2013 $10,000/mo", startup: "$0", audience: "New dog owners struggling with behavior" },

  // Digital Products & Courses
  { skills: ["writing", "social_media"], name: "ContentForge", tagline: "Done-for-you social media content packs", type: "digital", desc: "Pre-written, customizable social media content bundles for small businesses. Each pack includes 30 days of posts, captions, hashtags, and a content calendar for a specific niche.", revenue: "$2,500 \u2013 $8,000/mo", startup: "$0 \u2013 $50", audience: "Small business owners who hate writing captions" },
  { skills: ["writing", "teaching"], name: "SkillScript", tagline: "Micro-courses that teach one thing really well", type: "digital", desc: "Bite-sized online courses (under 2 hours) teaching specific skills. Think \u201CEmail Marketing for Etsy Sellers\u201D or \u201CInstagram Reels for Restaurants.\u201D", revenue: "$3,000 \u2013 $12,000/mo", startup: "$0 \u2013 $100", audience: "Professionals wanting to level up fast" },
  { skills: ["design", "tech"], name: "BrandDrop", tagline: "Premium brand kits for new businesses", type: "digital", desc: "Complete brand identity packages: logo, color palette, social media templates, business card design, and brand guidelines. Delivered digitally.", revenue: "$5,000 \u2013 $20,000/mo", startup: "$0 \u2013 $100", audience: "New business owners who need to look professional" },
  { skills: ["cooking"], name: "MealMap", tagline: "Niche meal prep guides with grocery lists", type: "digital", desc: "Weekly meal prep guides for specific diets (keto, vegan, bodybuilding, budget). Each guide includes recipes, macro breakdowns, and prep-day timelines.", revenue: "$1,500 \u2013 $6,000/mo", startup: "$0 \u2013 $50", audience: "Health-conscious people who want structure" },
  { skills: ["photography"], name: "SnapStock", tagline: "Niche stock photo packs that don't look like stock photos", type: "digital", desc: "Curated photo bundles for specific industries. Authentic, styled photos that brands actually want to use.", revenue: "$2,000 \u2013 $8,000/mo", startup: "$0 \u2013 $200", audience: "Marketers tired of generic stock photos" },
  { skills: ["gaming"], name: "ProPath", tagline: "Gaming improvement courses and VOD review packs", type: "digital", desc: "Game-specific improvement courses, pre-recorded VOD review breakdowns, and rank-up guides for competitive gamers.", revenue: "$2,000 \u2013 $10,000/mo", startup: "$0 \u2013 $50", audience: "Competitive gamers who want to rank up" },
  { skills: ["social_media", "design"], name: "TemplateVault", tagline: "Canva template packs for specific niches", type: "digital", desc: "Pre-designed Canva template bundles: Instagram carousels, story templates, and highlight icons for specific industries.", revenue: "$3,000 \u2013 $15,000/mo", startup: "$0", audience: "Small business owners who want to look great on social" },
  { skills: ["music"], name: "BeatDrop", tagline: "Royalty-free music packs for content creators", type: "digital", desc: "Monthly drops of original, royalty-free music tracks and sound effects for YouTubers and TikTok creators.", revenue: "$2,000 \u2013 $10,000/mo", startup: "$0 \u2013 $200", audience: "Content creators who need affordable music" },
  { skills: ["travel"], name: "RouteReady", tagline: "Premium travel guides and itinerary templates", type: "digital", desc: "Detailed, day-by-day travel itineraries for popular destinations with restaurants, activities, and local tips. Sold as digital downloads.", revenue: "$1,500 \u2013 $6,000/mo", startup: "$0", audience: "Travelers who want a local experience without research" },
  { skills: ["organizing", "teaching"], name: "SystemSync", tagline: "Notion templates and productivity courses", type: "digital", desc: "Pre-built Notion and Google Sheets templates for specific workflows, plus a mini-course on building systems that stick.", revenue: "$2,000 \u2013 $8,000/mo", startup: "$0", audience: "Entrepreneurs who need systems but can\u2019t build them" },
  { skills: ["fitness", "teaching"], name: "FlexAcademy", tagline: "Self-paced fitness programs with meal plans", type: "digital", desc: "Complete digital fitness programs: workout videos, progressive overload plans, meal templates, and progress tracking sheets.", revenue: "$3,000 \u2013 $15,000/mo", startup: "$0 \u2013 $100", audience: "Beginners who want a structured home workout program" },
  { skills: ["crafts", "teaching"], name: "MakerClass", tagline: "DIY craft courses with downloadable patterns", type: "digital", desc: "Step-by-step video courses for crafts (knitting, woodworking, pottery) with downloadable patterns, supply lists, and community access.", revenue: "$2,000 \u2013 $8,000/mo", startup: "$0 \u2013 $100", audience: "Craft enthusiasts who want to learn new skills from home" },
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
    if (bizType === "any" || bizType === "both" || bizType === c.type) score += 1;
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
