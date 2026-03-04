export const SKILLS = [
  { id: "writing", label: "Writing" },
  { id: "design", label: "Design" },
  { id: "talking", label: "Talking to People" },
  { id: "organizing", label: "Organizing" },
  { id: "cooking", label: "Cooking" },
  { id: "fitness", label: "Fitness" },
  { id: "tech", label: "Tech / Coding" },
  { id: "crafts", label: "Crafts / DIY" },
  { id: "teaching", label: "Teaching" },
  { id: "sales", label: "Sales" },
  { id: "photography", label: "Photography" },
  { id: "music", label: "Music" },
  { id: "social_media", label: "Social Media" },
  { id: "finance", label: "Finance" },
  { id: "fashion", label: "Fashion" },
  { id: "gaming", label: "Gaming" },
  { id: "pets", label: "Pets / Animals" },
  { id: "travel", label: "Travel" },
];

export const TIME_OPTIONS = [
  { id: "minimal", label: "A few hours/week", desc: "Passive income focus", hours: "2-5 hrs/week" },
  { id: "side", label: "Side hustle", desc: "Evenings & weekends", hours: "5-15 hrs/week" },
  { id: "part", label: "Part-time", desc: "Serious commitment", hours: "15-30 hrs/week" },
  { id: "full", label: "Full-time", desc: "All in", hours: "40+ hrs/week" },
];

export const BUDGET_OPTIONS = [
  { id: "zero", label: "$0", desc: "Start completely free" },
  { id: "low", label: "$1 – $100", desc: "Minimal investment" },
  { id: "mid", label: "$100 – $1,000", desc: "Room to invest" },
  { id: "high", label: "$1,000+", desc: "Ready to move fast" },
];

export const TYPE_OPTIONS = [
  { id: "services", label: "Service Business", desc: "Freelance, consulting, coaching, agency" },
  { id: "digital", label: "Digital Products", desc: "Courses, templates, ebooks, memberships" },
  { id: "both", label: "Services + Digital", desc: "Combine services with digital products" },
  { id: "any", label: "Not sure yet", desc: "We'll recommend the best fit" },
];

export const SUBTYPE_OPTIONS: Record<string, { id: string; label: string }[]> = {
  services: [
    { id: "freelance", label: "Freelance" },
    { id: "consulting", label: "Consulting" },
    { id: "coaching", label: "Coaching" },
    { id: "agency", label: "Agency" },
  ],
  digital: [
    { id: "courses", label: "Courses" },
    { id: "templates", label: "Templates" },
    { id: "ebooks", label: "Ebooks" },
    { id: "memberships", label: "Memberships" },
  ],
};

export interface BusinessConcept {
  name: string;
  tagline: string;
  type: string;
  subtype?: string;
  desc: string;
  revenue: string;
  startup: string;
  audience: string;
  skills: string[];
  score?: number;
}

export const CONCEPT_POOL: BusinessConcept[] = [
  // Service Businesses
  { skills: ["fitness", "talking"], name: "FitCheck", tagline: "Personalized fitness plans with weekly video check-ins", type: "services", subtype: "coaching", desc: "Online fitness coaching with AI-assisted workout plans and weekly 15-minute video accountability calls.", revenue: "$4,000 – $15,000/mo", startup: "$0", audience: "Busy professionals who need structure" },
  { skills: ["finance"], name: "LedgerLite", tagline: "Bookkeeping templates + monthly financial reviews", type: "services", subtype: "freelance", desc: "Spreadsheet templates for small business bookkeeping plus a monthly 30-minute financial review call.", revenue: "$3,000 – $12,000/mo", startup: "$0", audience: "Solo entrepreneurs drowning in receipts" },
  { skills: ["fashion"], name: "StyleFile", tagline: "Personal styling lookbooks delivered digitally", type: "services", subtype: "freelance", desc: "Digital personal styling service: clients get a curated lookbook with outfit ideas, shopping links, and seasonal updates.", revenue: "$3,000 – $12,000/mo", startup: "$0", audience: "People who want to dress better without the guesswork" },
  { skills: ["sales", "talking"], name: "CloserKit", tagline: "Sales coaching and script writing for freelancers", type: "services", subtype: "coaching", desc: "Done-for-you sales scripts for common scenarios plus weekly group roleplay sessions and 1-on-1 deal coaching.", revenue: "$4,000 – $15,000/mo", startup: "$0", audience: "Freelancers who struggle with selling" },
  { skills: ["tech", "teaching"], name: "CodeMentor", tagline: "1-on-1 coding mentorship for career changers", type: "services", subtype: "coaching", desc: "Personalized coding mentorship with weekly calls, code reviews, portfolio feedback, and job search coaching.", revenue: "$5,000 – $20,000/mo", startup: "$0", audience: "Career changers breaking into tech" },
  { skills: ["writing", "social_media"], name: "GhostPen", tagline: "Ghostwriting and content strategy for founders", type: "services", subtype: "freelance", desc: "LinkedIn and Twitter ghostwriting, content calendars, and personal brand strategy for startup founders and executives.", revenue: "$5,000 – $25,000/mo", startup: "$0", audience: "Founders who want to build a personal brand but don't have time" },
  { skills: ["design", "social_media"], name: "StudioFlow", tagline: "Social media design retainer for growing brands", type: "services", subtype: "agency", desc: "Monthly design retainer: unlimited social media graphics, ad creatives, and brand collateral for one flat fee.", revenue: "$4,000 – $18,000/mo", startup: "$0 – $50", audience: "DTC brands spending $5K+/mo on ads" },
  { skills: ["pets", "talking"], name: "PawCoach", tagline: "Virtual dog training and behavior consulting", type: "services", subtype: "consulting", desc: "Virtual dog training sessions via video call, personalized training plans, and ongoing behavior support.", revenue: "$3,000 – $10,000/mo", startup: "$0", audience: "New dog owners struggling with behavior" },

  // Digital Products & Courses
  { skills: ["writing", "social_media"], name: "ContentForge", tagline: "Done-for-you social media content packs", type: "digital", subtype: "templates", desc: "Pre-written, customizable social media content bundles for small businesses. Each pack includes 30 days of posts, captions, hashtags, and a content calendar for a specific niche.", revenue: "$2,500 – $8,000/mo", startup: "$0 – $50", audience: "Small business owners who hate writing captions" },
  { skills: ["writing", "teaching"], name: "SkillScript", tagline: "Micro-courses that teach one thing really well", type: "digital", subtype: "courses", desc: "Bite-sized online courses (under 2 hours) teaching specific skills. Think 'Email Marketing for Etsy Sellers' or 'Instagram Reels for Restaurants.'", revenue: "$3,000 – $12,000/mo", startup: "$0 – $100", audience: "Professionals wanting to level up fast" },
  { skills: ["design", "tech"], name: "BrandDrop", tagline: "Premium brand kits for new businesses", type: "digital", subtype: "templates", desc: "Complete brand identity packages: logo, color palette, social media templates, business card design, and brand guidelines. Delivered digitally.", revenue: "$5,000 – $20,000/mo", startup: "$0 – $100", audience: "New business owners who need to look professional" },
  { skills: ["cooking"], name: "MealMap", tagline: "Niche meal prep guides with grocery lists", type: "digital", subtype: "ebooks", desc: "Weekly meal prep guides for specific diets (keto, vegan, bodybuilding, budget). Each guide includes recipes, macro breakdowns, and prep-day timelines.", revenue: "$1,500 – $6,000/mo", startup: "$0 – $50", audience: "Health-conscious people who want structure" },
  { skills: ["photography"], name: "SnapStock", tagline: "Niche stock photo packs that don't look like stock photos", type: "digital", subtype: "templates", desc: "Curated photo bundles for specific industries. Authentic, styled photos that brands actually want to use.", revenue: "$2,000 – $8,000/mo", startup: "$0 – $200", audience: "Marketers tired of generic stock photos" },
  { skills: ["gaming"], name: "ProPath", tagline: "Gaming improvement courses and VOD review packs", type: "digital", subtype: "courses", desc: "Game-specific improvement courses, pre-recorded VOD review breakdowns, and rank-up guides for competitive gamers.", revenue: "$2,000 – $10,000/mo", startup: "$0 – $50", audience: "Competitive gamers who want to rank up" },
  { skills: ["social_media", "design"], name: "TemplateVault", tagline: "Canva template packs for specific niches", type: "digital", subtype: "templates", desc: "Pre-designed Canva template bundles: Instagram carousels, story templates, and highlight icons for specific industries.", revenue: "$3,000 – $15,000/mo", startup: "$0", audience: "Small business owners who want to look great on social" },
  { skills: ["music"], name: "BeatDrop", tagline: "Royalty-free music packs for content creators", type: "digital", subtype: "memberships", desc: "Monthly drops of original, royalty-free music tracks and sound effects for YouTubers and TikTok creators.", revenue: "$2,000 – $10,000/mo", startup: "$0 – $200", audience: "Content creators who need affordable music" },
  { skills: ["travel"], name: "RouteReady", tagline: "Premium travel guides and itinerary templates", type: "digital", subtype: "ebooks", desc: "Detailed, day-by-day travel itineraries for popular destinations with restaurants, activities, and local tips. Sold as digital downloads.", revenue: "$1,500 – $6,000/mo", startup: "$0", audience: "Travelers who want a local experience without research" },
  { skills: ["organizing", "teaching"], name: "SystemSync", tagline: "Notion templates and productivity courses", type: "digital", subtype: "templates", desc: "Pre-built Notion and Google Sheets templates for specific workflows, plus a mini-course on building systems that stick.", revenue: "$2,000 – $8,000/mo", startup: "$0", audience: "Entrepreneurs who need systems but can't build them" },
  { skills: ["fitness", "teaching"], name: "FlexAcademy", tagline: "Self-paced fitness programs with meal plans", type: "digital", subtype: "courses", desc: "Complete digital fitness programs: workout videos, progressive overload plans, meal templates, and progress tracking sheets.", revenue: "$3,000 – $15,000/mo", startup: "$0 – $100", audience: "Beginners who want a structured home workout program" },
  { skills: ["crafts", "teaching"], name: "MakerClass", tagline: "DIY craft courses with downloadable patterns", type: "digital", subtype: "courses", desc: "Step-by-step video courses for crafts (knitting, woodworking, pottery) with downloadable patterns, supply lists, and community access.", revenue: "$2,000 – $8,000/mo", startup: "$0 – $100", audience: "Craft enthusiasts who want to learn new skills from home" },
];

export function generateConcepts(
  skills: string[],
  time: string,
  budget: string,
  bizType: string,
  subtype?: string
): BusinessConcept[] {
  const skillSet = new Set(skills);

  const scored = CONCEPT_POOL.map((c) => {
    let score = 0;
    c.skills.forEach((s) => { if (skillSet.has(s)) score += 2; });
    if (bizType === "any" || bizType === "both" || bizType === c.type) score += 1;
    if (bizType === c.type) score += 1;
    if (subtype && c.subtype === subtype) score += 3;
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
