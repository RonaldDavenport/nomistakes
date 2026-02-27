// Affiliate Marketing System for No Mistakes
// Two-sided: Platform earns from recommending tools to users,
// and generated business sites earn from embedded affiliate products

// ── Platform Affiliate Partners ──
// Tools and services we recommend to business owners (our affiliate links)
export interface AffiliatePartner {
  id: string;
  name: string;
  category: "email" | "payments" | "analytics" | "hosting" | "design" | "marketing" | "legal" | "shipping" | "ai" | "domains";
  description: string;
  commission: string; // e.g., "30% recurring" or "$50 per signup"
  affiliateUrl: string; // Our affiliate link
  logo?: string;
  relevantFor: ("products" | "digital" | "services")[]; // Which business types benefit
  tags: string[];
}

export const AFFILIATE_PARTNERS: AffiliatePartner[] = [
  // Email Marketing
  {
    id: "mailchimp",
    name: "Mailchimp",
    category: "email",
    description: "Email marketing platform. Build and grow your email list with automated campaigns.",
    commission: "Up to $300 per referral",
    affiliateUrl: "https://mailchimp.com/referral/?aid=PLACEHOLDER",
    relevantFor: ["products", "digital", "services"],
    tags: ["email", "newsletters", "automation"],
  },
  {
    id: "convertkit",
    name: "ConvertKit",
    category: "email",
    description: "Email marketing built for creators. Sell digital products and grow your audience.",
    commission: "30% recurring for 24 months",
    affiliateUrl: "https://convertkit.com/?lmref=PLACEHOLDER",
    relevantFor: ["digital", "services"],
    tags: ["email", "creators", "digital products"],
  },

  // Analytics
  {
    id: "plausible",
    name: "Plausible Analytics",
    category: "analytics",
    description: "Privacy-focused website analytics. No cookies, GDPR compliant.",
    commission: "60-day cookie, recurring",
    affiliateUrl: "https://plausible.io/?ref=PLACEHOLDER",
    relevantFor: ["products", "digital", "services"],
    tags: ["analytics", "privacy", "simple"],
  },

  // Design
  {
    id: "canva",
    name: "Canva Pro",
    category: "design",
    description: "Design tool for social media posts, ads, logos, and marketing materials.",
    commission: "Up to $36 per signup",
    affiliateUrl: "https://partner.canva.com/PLACEHOLDER",
    relevantFor: ["products", "digital", "services"],
    tags: ["design", "social media", "graphics"],
  },

  // Marketing
  {
    id: "semrush",
    name: "Semrush",
    category: "marketing",
    description: "SEO and digital marketing toolkit. Keyword research, competitor analysis, site audit.",
    commission: "$200 per subscription sale",
    affiliateUrl: "https://www.semrush.com/?ref=PLACEHOLDER",
    relevantFor: ["products", "digital", "services"],
    tags: ["seo", "marketing", "competitor analysis"],
  },

  // Shipping
  {
    id: "shipstation",
    name: "ShipStation",
    category: "shipping",
    description: "Shipping software for ecommerce. Automate labels, tracking, and returns.",
    commission: "Up to $150 per referral",
    affiliateUrl: "https://www.shipstation.com/partners/?ref=PLACEHOLDER",
    relevantFor: ["products"],
    tags: ["shipping", "ecommerce", "fulfillment"],
  },

  // Legal
  {
    id: "legalzoom",
    name: "LegalZoom",
    category: "legal",
    description: "Business formation, LLC setup, trademarks, and legal documents.",
    commission: "Up to 25% per sale",
    affiliateUrl: "https://www.legalzoom.com/?ref=PLACEHOLDER",
    relevantFor: ["products", "digital", "services"],
    tags: ["legal", "llc", "business formation"],
  },

  // Domains
  {
    id: "namecheap",
    name: "Namecheap",
    category: "domains",
    description: "Domain registration, hosting, and SSL certificates at great prices.",
    commission: "Up to 20% per sale",
    affiliateUrl: "https://www.namecheap.com/?aff=PLACEHOLDER",
    relevantFor: ["products", "digital", "services"],
    tags: ["domains", "hosting", "ssl"],
  },

  // AI Tools
  {
    id: "jasper",
    name: "Jasper AI",
    category: "ai",
    description: "AI writing assistant for marketing copy, blog posts, and social media.",
    commission: "30% recurring",
    affiliateUrl: "https://www.jasper.ai/?ref=PLACEHOLDER",
    relevantFor: ["products", "digital", "services"],
    tags: ["ai", "writing", "content"],
  },
];

// Get relevant affiliate partners for a business type
export function getRelevantPartners(
  businessType: "products" | "digital" | "services",
  tags?: string[]
): AffiliatePartner[] {
  let partners = AFFILIATE_PARTNERS.filter((p) =>
    p.relevantFor.includes(businessType)
  );

  if (tags && tags.length > 0) {
    partners = partners.sort((a, b) => {
      const aRelevance = a.tags.filter((t) => tags.includes(t)).length;
      const bRelevance = b.tags.filter((t) => tags.includes(t)).length;
      return bRelevance - aRelevance;
    });
  }

  return partners;
}

// Get partners by category
export function getPartnersByCategory(category: AffiliatePartner["category"]): AffiliatePartner[] {
  return AFFILIATE_PARTNERS.filter((p) => p.category === category);
}

// ── Affiliate Tracking ──
// Track clicks and conversions for both platform and business affiliates

export interface AffiliateClick {
  partnerId: string;
  businessId?: string;
  userId?: string;
  source: "platform_recommendation" | "business_site" | "dashboard" | "email";
  timestamp: string;
}

// Generate a tracked affiliate URL
export function getTrackedUrl(
  partnerId: string,
  businessId?: string,
  source: AffiliateClick["source"] = "platform_recommendation"
): string {
  const partner = AFFILIATE_PARTNERS.find((p) => p.id === partnerId);
  if (!partner) return "#";

  // In production, this would go through our tracking redirect
  // /api/affiliate/click?partner=X&biz=Y&src=Z → redirect to partner URL
  const params = new URLSearchParams({
    partner: partnerId,
    ...(businessId && { biz: businessId }),
    src: source,
  });

  return `/api/affiliate/click?${params.toString()}`;
}

// ── Business Site Affiliate Recommendations ──
// AI uses these to embed relevant affiliate products into generated business sites

export interface AffiliateRecommendation {
  category: string;
  headline: string;
  description: string;
  partners: {
    name: string;
    pitch: string;
    url: string;
  }[];
}

// Generate affiliate recommendations for a business site
export function generateSiteRecommendations(
  businessType: "products" | "digital" | "services",
  businessName: string
): AffiliateRecommendation[] {
  const recommendations: AffiliateRecommendation[] = [];

  // Tools the business owner needs (shown in their dashboard)
  const relevant = getRelevantPartners(businessType);

  const categories = [...new Set(relevant.map((p) => p.category))];

  for (const cat of categories.slice(0, 4)) {
    const catPartners = relevant.filter((p) => p.category === cat);
    recommendations.push({
      category: cat,
      headline: getCategoryHeadline(cat),
      description: getCategoryDescription(cat, businessName),
      partners: catPartners.slice(0, 2).map((p) => ({
        name: p.name,
        pitch: p.description,
        url: getTrackedUrl(p.id, undefined, "dashboard"),
      })),
    });
  }

  return recommendations;
}

function getCategoryHeadline(category: string): string {
  const headlines: Record<string, string> = {
    email: "Grow Your Email List",
    payments: "Accept Payments Everywhere",
    analytics: "Track Your Growth",
    hosting: "Reliable Hosting",
    design: "Create Stunning Visuals",
    marketing: "Boost Your SEO & Marketing",
    legal: "Protect Your Business",
    shipping: "Ship Products Faster",
    ai: "AI-Powered Content",
    domains: "Claim Your Domain",
  };
  return headlines[category] || "Recommended Tools";
}

function getCategoryDescription(category: string, businessName: string): string {
  const descriptions: Record<string, string> = {
    email: `Build a loyal audience for ${businessName} with email marketing.`,
    payments: `Let customers pay however they want.`,
    analytics: `Know exactly how ${businessName} is performing.`,
    hosting: `Keep your site fast and reliable.`,
    design: `Create professional marketing materials for ${businessName}.`,
    marketing: `Get ${businessName} to the top of search results.`,
    legal: `Set up your LLC and protect ${businessName}.`,
    shipping: `Streamline shipping and fulfillment.`,
    ai: `Scale your content creation with AI.`,
    domains: `Get the perfect domain for ${businessName}.`,
  };
  return descriptions[category] || `Essential tools for ${businessName}.`;
}
