// Plan tier definitions, feature gates, and limits

export interface PlanDefinition {
  id: string;
  name: string;
  price: number; // cents
  limits: {
    businesses: number;
    chatMessagesPerDay: number;
    blogPostsPerMonth: number;
    aiImagesPerBusiness: number;
  };
  features: string[];
}

const FREE_FEATURES = [
  "ai_chat",
  "launch_checklist",
  "affiliate_tools",
  "site_generation",
  "stripe_connect",
  "scheduling",
];

const STARTER_FEATURES = [
  ...FREE_FEATURES,
  "custom_domain",
  "remove_branding",
  "seo_tools",
  "cold_email",
  "linkedin_scripts",
  "followup_sequences",
  "discovery_scripts",
  "proposal_templates",
  "lead_magnets",
  "email_sequences",
  "social_calendars",
  "client_onboarding",
  "referral_templates",
  "case_studies",
  "blog_generator",
];

const GROWTH_FEATURES = [
  ...STARTER_FEATURES,
  "course_content",
  "video_scripts",
  "ebook_chapters",
  "membership_content",
  "contracts_legal",
  "sops",
  "multi_channel_outreach",
  "capabilities_deck",
  "ad_copy",
  "ad_images",
  "ugc_creation",
  "extra_product_images",
  "webinar_scripts",
  "evergreen_funnels",
  "advanced_analytics",
  "priority_support",
];

const PRO_FEATURES = [
  ...GROWTH_FEATURES,
  "white_label",
  "api_access",
  "dedicated_support",
  "custom_integrations",
];

export const PLANS: Record<string, PlanDefinition> = {
  free: {
    id: "free",
    name: "Free",
    price: 0,
    limits: {
      businesses: 1,
      chatMessagesPerDay: 10,
      blogPostsPerMonth: 0,
      aiImagesPerBusiness: 5,
    },
    features: FREE_FEATURES,
  },
  starter: {
    id: "starter",
    name: "Starter",
    price: 1999,
    limits: {
      businesses: 3,
      chatMessagesPerDay: 50,
      blogPostsPerMonth: 10,
      aiImagesPerBusiness: 5,
    },
    features: STARTER_FEATURES,
  },
  growth: {
    id: "growth",
    name: "Growth",
    price: 4999,
    limits: {
      businesses: 10,
      chatMessagesPerDay: 200,
      blogPostsPerMonth: 50,
      aiImagesPerBusiness: 10,
    },
    features: GROWTH_FEATURES,
  },
  pro: {
    id: "pro",
    name: "Pro",
    price: 24999,
    limits: {
      businesses: Infinity,
      chatMessagesPerDay: Infinity,
      blogPostsPerMonth: Infinity,
      aiImagesPerBusiness: Infinity,
    },
    features: PRO_FEATURES,
  },
};

export function getPlan(planId: string): PlanDefinition {
  return PLANS[planId] || PLANS.free;
}

export function hasFeature(planId: string, feature: string): boolean {
  const plan = getPlan(planId);
  return plan.features.includes(feature);
}

export function getLimit(planId: string, key: keyof PlanDefinition["limits"]): number {
  const plan = getPlan(planId);
  return plan.limits[key];
}

// Check if a plan can access a required plan level
const PLAN_HIERARCHY = ["free", "starter", "growth", "pro"];

export function meetsRequiredPlan(userPlan: string, requiredPlan: string): boolean {
  const userIdx = PLAN_HIERARCHY.indexOf(userPlan);
  const reqIdx = PLAN_HIERARCHY.indexOf(requiredPlan);
  return userIdx >= reqIdx;
}

export function getUpgradePlan(requiredPlan: string): PlanDefinition {
  return PLANS[requiredPlan] || PLANS.starter;
}
