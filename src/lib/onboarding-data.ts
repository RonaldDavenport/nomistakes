// Onboarding flow data: steps, color presets, layout options

export interface OnboardingStep {
  id: string;
  title: string;
  subtitle: string;
  skippable: boolean;
}

export const ONBOARDING_STEPS: OnboardingStep[] = [
  { id: "your-site", title: "Your Site", subtitle: "Name, URL, and layout — all in one place", skippable: false },
  { id: "your-brand", title: "Your Brand", subtitle: "Colors and logo that set the vibe", skippable: false },
  { id: "payments", title: "Payments", subtitle: "Start getting paid through your site", skippable: true },
  { id: "booking", title: "Booking", subtitle: "Let clients book time with you", skippable: true },
  { id: "go-live", title: "Go Live", subtitle: "Business email and you're live", skippable: true },
  { id: "meet-your-coach", title: "Meet Your Coach", subtitle: "Your AI business coach is ready", skippable: false },
];

/** Old step IDs mapped to new 6-step indices (for migration) */
export const OLD_STEP_TO_NEW: Record<string, number> = {
  name: 0, domain: 0, layout: 0,
  colors: 1, logo: 1,
  payments: 2,
  scheduling: 3,
  email: 4,
  "your-coach": 3, "day-1-launch": 4,
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

// ── Social Proof ──

export const SOCIAL_PROOF_STATS = [
  { value: "12,847", label: "businesses built" },
  { value: "4 min", label: "avg setup time" },
  { value: "94%", label: "completion rate" },
];

export const STEP_MOTIVATION: Record<string, string> = {
  "your-site": "A memorable name and clean URL boost organic traffic by 40%",
  "your-brand": "Consistent brand colors increase recognition by 80%",
  payments: "Sites that accept payments earn 5x more in their first month",
  booking: "Online booking increases appointments by 3x",
  "go-live": "Professional emails improve open rates by 20%",
  "meet-your-coach": "Businesses with a coach grow 2.3x faster in their first 90 days",
};
