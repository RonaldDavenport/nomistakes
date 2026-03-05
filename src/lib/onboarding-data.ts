// Onboarding flow data: steps, color presets, layout options

export interface OnboardingStep {
  id: string;
  title: string;
  subtitle: string;
  skippable: boolean;
}

export const ONBOARDING_STEPS: OnboardingStep[] = [
  { id: "your-site",        title: "Your Site",        subtitle: "Name and URL for your workspace",         skippable: false },
  { id: "your-brand",       title: "Your Brand",       subtitle: "Colors and logo",                          skippable: false },
  { id: "payments",         title: "Payments",         subtitle: "Connect Stripe to send paid invoices",     skippable: true  },
  { id: "booking",          title: "Booking",          subtitle: "Add your scheduling link",                 skippable: true  },
  { id: "go-live",          title: "Go Live",          subtitle: "Business email and launch",                skippable: true  },
  { id: "lead-engine",      title: "Lead Engine",      subtitle: "Who are your ideal clients?",              skippable: true  },
  { id: "satellite-domain", title: "Outreach Domain",  subtitle: "Dedicated domain for cold outreach",       skippable: true  },
  { id: "inbox-connect",    title: "Connect Inbox",    subtitle: "Link LinkedIn and email for outreach",     skippable: true  },
  { id: "meet-your-coach",  title: "Meet Your Coach",  subtitle: "Your AI business coach is ready",          skippable: false },
];

/** Old step IDs mapped to current indices (for migration) */
export const OLD_STEP_TO_NEW: Record<string, number> = {
  name: 0, domain: 0, layout: 0,
  colors: 1, logo: 1,
  payments: 2,
  scheduling: 3,
  email: 4,
  "lead-engine": 5, "satellite-domain": 6, "inbox-connect": 7,
  "your-coach": 8, "day-1-launch": 4,
};

// ── Color Presets ──

export interface ColorPreset {
  id: string;
  name: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
}

export const COLOR_PRESETS: ColorPreset[] = [
  {
    id: "modern-dark",
    name: "Modern Dark",
    colors: { primary: "#6366f1", secondary: "#1e1b4b", accent: "#a78bfa", background: "#0f0d1a", text: "#f1f0f5" },
  },
  {
    id: "ocean",
    name: "Ocean",
    colors: { primary: "#0ea5e9", secondary: "#0c4a6e", accent: "#38bdf8", background: "#f0f9ff", text: "#0c4a6e" },
  },
  {
    id: "sunset",
    name: "Sunset",
    colors: { primary: "#f97316", secondary: "#7c2d12", accent: "#fbbf24", background: "#fffbeb", text: "#431407" },
  },
  {
    id: "forest",
    name: "Forest",
    colors: { primary: "#22c55e", secondary: "#14532d", accent: "#86efac", background: "#f0fdf4", text: "#14532d" },
  },
  {
    id: "minimal-light",
    name: "Minimal Light",
    colors: { primary: "#18181b", secondary: "#3f3f46", accent: "#a1a1aa", background: "#ffffff", text: "#18181b" },
  },
  {
    id: "bold",
    name: "Bold",
    colors: { primary: "#e11d48", secondary: "#4c0519", accent: "#fda4af", background: "#1a1a2e", text: "#fafafa" },
  },
];

// ── Layout Options ──

export interface LayoutOption {
  id: string;
  name: string;
  description: string;
  bestFor: string;
  sections: string[];
}

export const LAYOUT_OPTIONS: LayoutOption[] = [
  {
    id: "default",
    name: "Default",
    description: "Hero section, features grid, offerings, testimonials, and CTA. Great all-rounder.",
    bestFor: "Most businesses",
    sections: ["hero", "trust_bar", "features", "about", "offerings", "testimonials", "cta"],
  },
  {
    id: "minimal",
    name: "Minimal",
    description: "Single-column, large typography, about-focused. Clean and personal.",
    bestFor: "Consultants, coaches, personal brands",
    sections: ["hero", "about", "offerings", "cta"],
  },
  {
    id: "creator",
    name: "Creator",
    description: "Featured product hero, product grid, social proof, FAQ. Built to sell.",
    bestFor: "Course creators, template sellers, digital products",
    sections: ["hero", "featured_product", "product_grid", "social_proof", "faq", "cta"],
  },
];

// ── Affiliate cards shown during onboarding ──

export interface OnboardingAffiliate {
  partnerId: string; // matches affiliates.ts partner id
  step: string; // which onboarding step
  headline: string;
  pitch: string;
  ctaLabel: string;
  commission: string; // internal — not shown to user
}

export const ONBOARDING_AFFILIATES: OnboardingAffiliate[] = [
  {
    partnerId: "looka",
    step: "logo",
    headline: "Design a Professional Logo",
    pitch: "Use Looka's AI logo maker to create a stunning logo in minutes. Includes business cards, social media kits, and brand guidelines.",
    ctaLabel: "Design with Looka",
    commission: "25-35%",
  },
  {
    partnerId: "namecheap",
    step: "domain",
    headline: "Get Your Own Domain",
    pitch: "Register a .com, .co, or any domain starting at $5.98/year. Includes free privacy protection.",
    ctaLabel: "Browse Domains",
    commission: "Up to 20%",
  },
  {
    partnerId: "google-workspace",
    step: "email",
    headline: "Get a Professional Email",
    pitch: "Send emails from you@yourbusiness.com with Google Workspace. Includes Gmail, Drive, Docs, and Meet.",
    ctaLabel: "Start Free Trial",
    commission: "$9-27 per user",
  },
];

// Helper to get affiliate card for a given step
export function getStepAffiliate(step: string): OnboardingAffiliate | undefined {
  return ONBOARDING_AFFILIATES.find((a) => a.step === step);
}

export const STEP_MOTIVATION: Record<string, string> = {
  "your-site":        "Your URL is the address you'll put on everything.",
  "your-brand":       "Pick colors you'll actually want to look at.",
  payments:           "You'll need this to send invoices that clients can actually pay.",
  booking:            "A scheduling link means fewer back-and-forth emails.",
  "go-live":          "A business email makes you look like you mean it.",
  "lead-engine":      "Define your ideal client once. Kovra finds them for you.",
  "satellite-domain": "A dedicated outreach domain keeps your main domain clean.",
  "inbox-connect":    "All your LinkedIn and email replies in one place.",
  "meet-your-coach":  "Your AI coach is available any time you have a question.",
};
