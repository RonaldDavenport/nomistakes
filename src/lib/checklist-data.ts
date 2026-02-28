// Launch checklist task definitions for all 8 business subtypes
// ~150 tasks across 5 phases each, with AI capability metadata

export interface ChecklistTask {
  id: string;
  phase: 1 | 2 | 3 | 4 | 5;
  phaseTitle: string;
  title: string;
  description: string;
  category: "foundation" | "proof" | "outreach" | "sales" | "growth" | "product" | "marketing" | "launch";
  aiCapability: "full" | "draft" | "strategy" | "manual";
  requiredPlan: "free" | "starter" | "growth" | "pro";
  estimatedMinutes: number;
  autoCheck?: string;
  externalUrl?: string;
  partnerId?: string;
  order: number;
}

// ── FREELANCE ── 21 tasks

const FREELANCE_TASKS: ChecklistTask[] = [
  // Phase 1: Review & Refine (Day 1)
  { id: "fl-review-site", phase: 1, phaseTitle: "Review & Refine", title: "Review your live site", description: "Check all pages look right, fix any copy that feels off. Your bio, services, pricing, and testimonials were AI-generated — make sure they sound like you.", category: "foundation", aiCapability: "manual", requiredPlan: "free", estimatedMinutes: 20, order: 1 },
  { id: "fl-review-plan", phase: 1, phaseTitle: "Review & Refine", title: "Review your business plan", description: "Check your target market, marketing strategy, and competitive edge. AI drafted this during build — refine anything that doesn't fit.", category: "foundation", aiCapability: "manual", requiredPlan: "free", estimatedMinutes: 15, order: 2 },
  { id: "fl-verify-stripe", phase: 1, phaseTitle: "Review & Refine", title: "Connect payments (Stripe)", description: "Verify Stripe is connected so clients can pay you through your site.", category: "foundation", aiCapability: "manual", requiredPlan: "free", estimatedMinutes: 5, autoCheck: "has_stripe", order: 3 },
  { id: "fl-setup-email", phase: 1, phaseTitle: "Review & Refine", title: "Set up professional email", description: "Get you@yourbusiness.com through Google Workspace for $6/mo.", category: "foundation", aiCapability: "manual", requiredPlan: "free", estimatedMinutes: 10, partnerId: "google-workspace", order: 4 },

  // Phase 2: Portfolio & Proof (Days 2-5)
  { id: "fl-portfolio-pieces", phase: 2, phaseTitle: "Portfolio & Proof", title: "Create 3 portfolio pieces", description: "AI generates realistic mock project briefs based on your niche if you don't have real clients yet. Each includes the challenge, your approach, and deliverables.", category: "proof", aiCapability: "draft", requiredPlan: "free", estimatedMinutes: 30, order: 5 },
  { id: "fl-case-studies", phase: 2, phaseTitle: "Portfolio & Proof", title: "Write case study narratives", description: "Problem/process/result format for each portfolio piece. AI writes them using your actual services and target audience.", category: "proof", aiCapability: "full", requiredPlan: "free", estimatedMinutes: 20, order: 6 },
  { id: "fl-testimonials", phase: 2, phaseTitle: "Portfolio & Proof", title: "Collect or solicit testimonials", description: "AI drafts testimonial request emails and a pro-bono offer message to get your first real social proof.", category: "proof", aiCapability: "strategy", requiredPlan: "free", estimatedMinutes: 15, order: 7 },
  { id: "fl-lead-magnet", phase: 2, phaseTitle: "Portfolio & Proof", title: "Create a lead magnet", description: "AI builds a full checklist, audit template, or starter kit as a downloadable PDF for your target audience.", category: "proof", aiCapability: "full", requiredPlan: "starter", estimatedMinutes: 25, order: 8 },

  // Phase 3: Outreach Machine (Days 5-12)
  { id: "fl-prospect-list", phase: 3, phaseTitle: "Outreach Machine", title: "Build prospect list of 50 targets", description: "AI generates a where-to-find guide specific to your niche — LinkedIn searches, communities, directories, and signals to look for.", category: "outreach", aiCapability: "strategy", requiredPlan: "free", estimatedMinutes: 30, order: 9 },
  { id: "fl-cold-emails", phase: 3, phaseTitle: "Outreach Machine", title: "Write 3 cold email templates", description: "Three approaches: audit-style (offer free value), milestone-congrats (reach out on triggers), and referral-based. Personalized to your niche.", category: "outreach", aiCapability: "full", requiredPlan: "starter", estimatedMinutes: 20, order: 10 },
  { id: "fl-linkedin-scripts", phase: 3, phaseTitle: "Outreach Machine", title: "Write LinkedIn connection + DM scripts", description: "Connection request template + 3-message DM sequence that moves from value to conversation to call.", category: "outreach", aiCapability: "full", requiredPlan: "starter", estimatedMinutes: 15, order: 11 },
  { id: "fl-platform-profiles", phase: 3, phaseTitle: "Outreach Machine", title: "Set up freelance platform profiles", description: "AI writes optimized bios for Upwork, Fiverr, or Toptal based on your skills and positioning.", category: "outreach", aiCapability: "draft", requiredPlan: "starter", estimatedMinutes: 25, order: 12 },
  { id: "fl-proposal-template", phase: 3, phaseTitle: "Outreach Machine", title: "Create proposal template", description: "3 pricing tiers, scope of work, timeline, deliverables, and a 'Why Me' section. Ready to customize per client.", category: "outreach", aiCapability: "full", requiredPlan: "starter", estimatedMinutes: 20, order: 13 },
  { id: "fl-followup-sequence", phase: 3, phaseTitle: "Outreach Machine", title: "Write 4-email follow-up sequence", description: "For leads who ghost: gentle bump, value-add, social proof, and final reach-out. Spaced over 2 weeks.", category: "outreach", aiCapability: "full", requiredPlan: "starter", estimatedMinutes: 15, order: 14 },

  // Phase 4: Convert & Close (Days 12-20)
  { id: "fl-discovery-script", phase: 4, phaseTitle: "Convert & Close", title: "Write discovery call script", description: "20-min structure: rapport building → pain discovery → solution positioning → next steps. Tailored to your services.", category: "sales", aiCapability: "full", requiredPlan: "starter", estimatedMinutes: 20, order: 15 },
  { id: "fl-contract", phase: 4, phaseTitle: "Convert & Close", title: "Create freelance contract template", description: "Scope, payment terms, IP ownership, revision limits, kill fee, and termination clause. Ready to use.", category: "sales", aiCapability: "full", requiredPlan: "growth", estimatedMinutes: 25, order: 16 },
  { id: "fl-onboarding-questionnaire", phase: 4, phaseTitle: "Convert & Close", title: "Build client onboarding questionnaire", description: "Covers brand assets, logins/access, stakeholders, timeline, communication preferences, and project goals.", category: "sales", aiCapability: "full", requiredPlan: "starter", estimatedMinutes: 15, order: 17 },
  { id: "fl-kickoff-email", phase: 4, phaseTitle: "Convert & Close", title: "Write project kickoff email template", description: "Welcome email with timeline, expectations, next steps, and links to shared resources.", category: "sales", aiCapability: "full", requiredPlan: "starter", estimatedMinutes: 10, order: 18 },

  // Phase 5: Grow & Retain (Days 20-30)
  { id: "fl-offboarding-referral", phase: 5, phaseTitle: "Grow & Retain", title: "Create offboarding + referral system", description: "Project delivery email, testimonial request, satisfaction survey, and referral incentive scripts.", category: "growth", aiCapability: "full", requiredPlan: "starter", estimatedMinutes: 20, order: 19 },
  { id: "fl-first-blog", phase: 5, phaseTitle: "Grow & Retain", title: "Publish first blog post or case study", description: "SEO-optimized article about a topic your audience searches for. Establishes expertise and drives organic traffic.", category: "growth", aiCapability: "full", requiredPlan: "starter", estimatedMinutes: 25, order: 20 },
  { id: "fl-social-calendar", phase: 5, phaseTitle: "Grow & Retain", title: "Create 30-day social media content calendar", description: "3 posts/week across LinkedIn, Twitter/X, or Instagram. Mix of tips, behind-the-scenes, and case study snippets.", category: "growth", aiCapability: "draft", requiredPlan: "starter", estimatedMinutes: 20, order: 21 },
];

// ── CONSULTING ── 20 tasks

const CONSULTING_TASKS: ChecklistTask[] = [
  // Phase 1: Review & Refine
  { id: "cn-review-site", phase: 1, phaseTitle: "Review & Refine", title: "Review your live site", description: "Check all pages, refine positioning and services copy. AI generated your about page, services, and pricing — make sure they match your expertise.", category: "foundation", aiCapability: "manual", requiredPlan: "free", estimatedMinutes: 20, order: 1 },
  { id: "cn-methodology", phase: 1, phaseTitle: "Review & Refine", title: "Build a named methodology/framework", description: "AI helps you create a branded 4-6 step framework (e.g., 'The 4R Revenue System') that differentiates your consulting approach.", category: "foundation", aiCapability: "draft", requiredPlan: "free", estimatedMinutes: 25, order: 2 },
  { id: "cn-review-plan", phase: 1, phaseTitle: "Review & Refine", title: "Review your business plan", description: "Validate target market, competitive edge, and marketing strategy that AI drafted during build.", category: "foundation", aiCapability: "manual", requiredPlan: "free", estimatedMinutes: 15, order: 3 },
  { id: "cn-verify-integrations", phase: 1, phaseTitle: "Review & Refine", title: "Verify payments + scheduling are connected", description: "Ensure Stripe and Calendly are set up so prospects can book and pay.", category: "foundation", aiCapability: "manual", requiredPlan: "free", estimatedMinutes: 5, autoCheck: "has_stripe", order: 4 },

  // Phase 2: Thought Leadership (Days 2-7)
  { id: "cn-cornerstone-articles", phase: 2, phaseTitle: "Thought Leadership", title: "Write 3 cornerstone articles", description: "1,500-2,000 word SEO-optimized pieces that showcase your expertise. AI writes them based on your methodology and audience.", category: "proof", aiCapability: "full", requiredPlan: "starter", estimatedMinutes: 30, order: 5 },
  { id: "cn-self-assessment", phase: 2, phaseTitle: "Thought Leadership", title: "Create a free self-assessment/scorecard", description: "10-15 questions with scoring logic that diagnoses where prospects need help. Perfect lead magnet.", category: "proof", aiCapability: "full", requiredPlan: "starter", estimatedMinutes: 25, order: 6 },
  { id: "cn-industry-guide", phase: 2, phaseTitle: "Thought Leadership", title: "Write an industry guide/report", description: "10-15 page lead magnet covering state of the industry, trends, and your perspective. Positions you as the expert.", category: "proof", aiCapability: "full", requiredPlan: "starter", estimatedMinutes: 35, order: 7 },
  { id: "cn-linkedin-strategy", phase: 2, phaseTitle: "Thought Leadership", title: "Create 30-day LinkedIn content strategy", description: "5 posts/week mixing insights, frameworks, hot takes, and client wins. AI drafts the content calendar.", category: "proof", aiCapability: "draft", requiredPlan: "starter", estimatedMinutes: 20, order: 8 },

  // Phase 3: Network & Outreach (Days 7-14)
  { id: "cn-announcement-emails", phase: 3, phaseTitle: "Network & Outreach", title: "Write announcement emails", description: "3 versions of 'I've gone independent' emails: close contacts, former colleagues, and acquaintances.", category: "outreach", aiCapability: "full", requiredPlan: "starter", estimatedMinutes: 15, order: 9 },
  { id: "cn-cold-outreach", phase: 3, phaseTitle: "Network & Outreach", title: "Craft cold outreach for target accounts", description: "Personalized emails + 3 follow-ups for your ideal consulting clients. References their specific challenges.", category: "outreach", aiCapability: "full", requiredPlan: "starter", estimatedMinutes: 20, order: 10 },
  { id: "cn-partnership-outreach", phase: 3, phaseTitle: "Network & Outreach", title: "Create strategic partnership outreach", description: "Emails for complementary consultants proposing mutual referrals and collaboration.", category: "outreach", aiCapability: "full", requiredPlan: "starter", estimatedMinutes: 15, order: 11 },
  { id: "cn-multi-channel", phase: 3, phaseTitle: "Network & Outreach", title: "Create 21-day multi-channel sequence", description: "Coordinated outreach across email + LinkedIn + personalized video over 21 days.", category: "outreach", aiCapability: "full", requiredPlan: "growth", estimatedMinutes: 30, order: 12 },

  // Phase 4: Sales System (Days 14-22)
  { id: "cn-discovery-script", phase: 4, phaseTitle: "Sales System", title: "Build discovery call script", description: "30-min structure: pain discovery → impact quantification → methodology walkthrough → investment conversation → next steps.", category: "sales", aiCapability: "full", requiredPlan: "starter", estimatedMinutes: 20, order: 13 },
  { id: "cn-proposal-template", phase: 4, phaseTitle: "Sales System", title: "Create consulting proposal template", description: "Executive summary, methodology, timeline, 3 investment options (good/better/best), and ROI justification.", category: "sales", aiCapability: "full", requiredPlan: "starter", estimatedMinutes: 25, order: 14 },
  { id: "cn-sow-template", phase: 4, phaseTitle: "Sales System", title: "Write engagement letter/SOW template", description: "Scope, fees, payment schedule, IP, confidentiality, and termination clauses.", category: "sales", aiCapability: "full", requiredPlan: "growth", estimatedMinutes: 25, order: 15 },
  { id: "cn-objection-scripts", phase: 4, phaseTitle: "Sales System", title: "Build objection-handling scripts", description: "Top 10 consulting objections (price, timing, 'we can do it internally') with reframe responses.", category: "sales", aiCapability: "full", requiredPlan: "starter", estimatedMinutes: 15, order: 16 },
  { id: "cn-proposal-followup", phase: 4, phaseTitle: "Sales System", title: "Create proposal follow-up sequence", description: "5-touchpoint sequence after sending a proposal: same-day, 3-day, 7-day, 14-day, and final.", category: "sales", aiCapability: "full", requiredPlan: "starter", estimatedMinutes: 15, order: 17 },

  // Phase 5: Deliver & Scale (Days 22-30)
  { id: "cn-onboarding-docs", phase: 5, phaseTitle: "Deliver & Scale", title: "Create client onboarding docs", description: "Kickoff meeting agenda, data request checklist, and stakeholder interview guide.", category: "growth", aiCapability: "full", requiredPlan: "starter", estimatedMinutes: 20, order: 18 },
  { id: "cn-deliverable-templates", phase: 5, phaseTitle: "Deliver & Scale", title: "Build deliverable template library", description: "Audit report, strategy deck, and progress report templates you can reuse for every client.", category: "growth", aiCapability: "draft", requiredPlan: "growth", estimatedMinutes: 30, order: 19 },
  { id: "cn-sops", phase: 5, phaseTitle: "Deliver & Scale", title: "Create SOPs + case study pipeline", description: "Standard operating procedures for repeatable service delivery, plus a system for turning client wins into marketing.", category: "growth", aiCapability: "draft", requiredPlan: "growth", estimatedMinutes: 25, order: 20 },
];

// ── COACHING ── 19 tasks

const COACHING_TASKS: ChecklistTask[] = [
  // Phase 1: Review & Refine
  { id: "co-review-site", phase: 1, phaseTitle: "Review & Refine", title: "Review your live site", description: "Check pages and refine transformation messaging. AI generated your packages, about page, pricing, and scheduling CTA.", category: "foundation", aiCapability: "manual", requiredPlan: "free", estimatedMinutes: 20, order: 1 },
  { id: "co-methodology", phase: 1, phaseTitle: "Review & Refine", title: "Create coaching methodology", description: "AI helps you build a named 4-6 phase framework that maps the journey from A (problem) → B (transformation).", category: "foundation", aiCapability: "draft", requiredPlan: "free", estimatedMinutes: 25, order: 2 },
  { id: "co-verify-integrations", phase: 1, phaseTitle: "Review & Refine", title: "Verify scheduling + payments are connected", description: "Ensure Calendly and Stripe are set up so clients can book and pay.", category: "foundation", aiCapability: "manual", requiredPlan: "free", estimatedMinutes: 5, autoCheck: "has_stripe", order: 3 },

  // Phase 2: Proof & Credibility (Days 2-6)
  { id: "co-beta-sessions", phase: 2, phaseTitle: "Proof & Credibility", title: "Offer 3-5 free beta sessions", description: "AI writes outreach messages and a testimonial request form. Get real results and social proof before charging.", category: "proof", aiCapability: "strategy", requiredPlan: "free", estimatedMinutes: 20, order: 4 },
  { id: "co-workshop-outline", phase: 2, phaseTitle: "Proof & Credibility", title: "Create a free workshop/masterclass outline", description: "45-60 minute workshop structure with a natural pitch at the end. AI outlines the content based on your methodology.", category: "proof", aiCapability: "draft", requiredPlan: "starter", estimatedMinutes: 25, order: 5 },
  { id: "co-lead-magnet", phase: 2, phaseTitle: "Proof & Credibility", title: "Create a lead magnet workbook", description: "Self-assessment or workbook for your coaching topic. AI generates the full content based on your methodology.", category: "proof", aiCapability: "full", requiredPlan: "starter", estimatedMinutes: 25, order: 6 },
  { id: "co-video-script", phase: 2, phaseTitle: "Proof & Credibility", title: "Script a coaching session preview video", description: "2-3 minute video outline that shows your coaching style and gives a taste of the transformation.", category: "proof", aiCapability: "full", requiredPlan: "starter", estimatedMinutes: 15, order: 7 },

  // Phase 3: Audience Building (Days 6-13)
  { id: "co-content-calendar", phase: 3, phaseTitle: "Audience Building", title: "Create 30-day content calendar", description: "Mix of tips, transformation stories, myth-busting, and personal insights. 3-5 posts/week.", category: "marketing", aiCapability: "draft", requiredPlan: "starter", estimatedMinutes: 20, order: 8 },
  { id: "co-nurture-sequence", phase: 3, phaseTitle: "Audience Building", title: "Write 5-email nurture sequence", description: "For lead magnet subscribers: welcome → quick win → your story → case study → invitation to call.", category: "marketing", aiCapability: "full", requiredPlan: "starter", estimatedMinutes: 20, order: 9 },
  { id: "co-micro-coaching", phase: 3, phaseTitle: "Audience Building", title: "Create 10-15 micro-coaching social posts", description: "One actionable tip per post. Demonstrates expertise and gives followers real value.", category: "marketing", aiCapability: "full", requiredPlan: "starter", estimatedMinutes: 15, order: 10 },
  { id: "co-referral-partnerships", phase: 3, phaseTitle: "Audience Building", title: "Set up referral partnerships", description: "AI writes outreach emails for complementary providers (therapists, trainers, mentors) proposing mutual referrals.", category: "marketing", aiCapability: "full", requiredPlan: "starter", estimatedMinutes: 15, order: 11 },

  // Phase 4: Discovery Call Machine (Days 13-20)
  { id: "co-booking-copy", phase: 4, phaseTitle: "Discovery Call Machine", title: "Write discovery call booking page copy", description: "Qualifying copy: 'This is for you if...' and 'This isn't for you if...' plus what to expect on the call.", category: "sales", aiCapability: "full", requiredPlan: "starter", estimatedMinutes: 15, order: 12 },
  { id: "co-pre-call-questionnaire", phase: 4, phaseTitle: "Discovery Call Machine", title: "Create pre-call questionnaire", description: "Goals, challenges, timeline, what they've tried, and investment readiness. Helps you prep and qualify.", category: "sales", aiCapability: "full", requiredPlan: "starter", estimatedMinutes: 15, order: 13 },
  { id: "co-discovery-script", phase: 4, phaseTitle: "Discovery Call Machine", title: "Build discovery call script", description: "Where are you now → Where do you want to be → What's in the way → How I help → Here's how we work together.", category: "sales", aiCapability: "full", requiredPlan: "starter", estimatedMinutes: 20, order: 14 },
  { id: "co-post-call-followup", phase: 4, phaseTitle: "Discovery Call Machine", title: "Create post-call follow-up sequence", description: "3 emails: session recap + resources, personal note, and final invitation to enroll.", category: "sales", aiCapability: "full", requiredPlan: "starter", estimatedMinutes: 15, order: 15 },

  // Phase 5: Retain & Scale (Days 20-30)
  { id: "co-welcome-packet", phase: 5, phaseTitle: "Retain & Scale", title: "Create client welcome packet", description: "Onboarding flow: what to expect, session prep guidelines, communication preferences, and goal-setting template.", category: "growth", aiCapability: "full", requiredPlan: "starter", estimatedMinutes: 20, order: 16 },
  { id: "co-session-templates", phase: 5, phaseTitle: "Retain & Scale", title: "Build session notes + progress templates", description: "Templates for tracking client progress, session notes, homework assignments, and milestone celebrations.", category: "growth", aiCapability: "full", requiredPlan: "growth", estimatedMinutes: 20, order: 17 },
  { id: "co-graduation", phase: 5, phaseTitle: "Retain & Scale", title: "Create graduation process", description: "Reflection exercise, testimonial request, referral ask, and alumni community/upsell invitation.", category: "growth", aiCapability: "full", requiredPlan: "starter", estimatedMinutes: 15, order: 18 },
  { id: "co-group-program", phase: 5, phaseTitle: "Retain & Scale", title: "Design group coaching program", description: "Structure, intake process, pricing, curriculum outline, and community guidelines for scaling beyond 1:1.", category: "growth", aiCapability: "draft", requiredPlan: "growth", estimatedMinutes: 25, order: 19 },
];

// ── AGENCY ── 20 tasks

const AGENCY_TASKS: ChecklistTask[] = [
  // Phase 1: Review & Refine
  { id: "ag-review-site", phase: 1, phaseTitle: "Review & Refine", title: "Review your live site", description: "Refine positioning, service descriptions, and team page. AI generated all your site content during build.", category: "foundation", aiCapability: "manual", requiredPlan: "free", estimatedMinutes: 20, order: 1 },
  { id: "ag-case-studies", phase: 1, phaseTitle: "Review & Refine", title: "Create 3 portfolio case studies", description: "AI generates spec project briefs based on your services if you don't have real clients yet. Full problem/process/result format.", category: "foundation", aiCapability: "full", requiredPlan: "free", estimatedMinutes: 25, order: 2 },
  { id: "ag-verify-stripe", phase: 1, phaseTitle: "Review & Refine", title: "Verify payments are connected", description: "Ensure Stripe is set up for client payments and retainers.", category: "foundation", aiCapability: "manual", requiredPlan: "free", estimatedMinutes: 5, autoCheck: "has_stripe", order: 3 },

  // Phase 2: Portfolio & Proof (Days 2-7)
  { id: "ag-spec-audit", phase: 2, phaseTitle: "Portfolio & Proof", title: "Produce a free audit for a dream client", description: "AI helps you create a speculative audit/analysis for a target prospect. Shows what you can do before they hire you.", category: "proof", aiCapability: "draft", requiredPlan: "starter", estimatedMinutes: 35, order: 4 },
  { id: "ag-capabilities-deck", phase: 2, phaseTitle: "Portfolio & Proof", title: "Build a capabilities deck/PDF", description: "Slide-by-slide copy for a downloadable agency overview: who we are, what we do, case studies, process, team.", category: "proof", aiCapability: "draft", requiredPlan: "growth", estimatedMinutes: 30, order: 5 },
  { id: "ag-directory-profiles", phase: 2, phaseTitle: "Portfolio & Proof", title: "Set up agency directory profiles", description: "AI writes optimized profiles for Clutch, G2, DesignRush, and relevant industry directories.", category: "proof", aiCapability: "draft", requiredPlan: "starter", estimatedMinutes: 25, order: 6 },

  // Phase 3: Outreach & Pipeline (Days 7-14)
  { id: "ag-prospect-list", phase: 3, phaseTitle: "Outreach & Pipeline", title: "Build prospect list of 100 targets", description: "AI generates a prospecting playbook: where to find prospects, what signals to look for, and how to prioritize.", category: "outreach", aiCapability: "strategy", requiredPlan: "free", estimatedMinutes: 30, order: 7 },
  { id: "ag-cold-emails", phase: 3, phaseTitle: "Outreach & Pipeline", title: "Write cold outreach email templates", description: "3 email templates + 3 follow-ups each. Tailored to your agency's services and target market.", category: "outreach", aiCapability: "full", requiredPlan: "starter", estimatedMinutes: 20, order: 8 },
  { id: "ag-multi-channel", phase: 3, phaseTitle: "Outreach & Pipeline", title: "Create 21-day multi-channel sequence", description: "Coordinated email + LinkedIn + personalized video audit outreach over 21 days.", category: "outreach", aiCapability: "full", requiredPlan: "growth", estimatedMinutes: 30, order: 9 },
  { id: "ag-video-audits", phase: 3, phaseTitle: "Outreach & Pipeline", title: "Script personalized video audit pitches", description: "2-min video audit scripts you can record for individual prospects. AI customizes the structure per prospect type.", category: "outreach", aiCapability: "full", requiredPlan: "growth", estimatedMinutes: 20, order: 10 },
  { id: "ag-linkedin-content", phase: 3, phaseTitle: "Outreach & Pipeline", title: "Create LinkedIn authority content", description: "30-day content plan: insights, before/afters, hot takes, and agency wins. Builds credibility with prospects.", category: "outreach", aiCapability: "draft", requiredPlan: "starter", estimatedMinutes: 20, order: 11 },

  // Phase 4: Close & Deliver (Days 14-22)
  { id: "ag-discovery-script", phase: 4, phaseTitle: "Close & Deliver", title: "Build agency discovery call script", description: "Qualify budget, timeline, decision-makers, and current state. Map their needs to your service packages.", category: "sales", aiCapability: "full", requiredPlan: "starter", estimatedMinutes: 20, order: 12 },
  { id: "ag-proposal-template", phase: 4, phaseTitle: "Close & Deliver", title: "Create agency proposal template", description: "Strategy overview, scope of work, timeline, deliverables, and 3-tier pricing. Ready to customize per client.", category: "sales", aiCapability: "full", requiredPlan: "starter", estimatedMinutes: 25, order: 13 },
  { id: "ag-msa", phase: 4, phaseTitle: "Close & Deliver", title: "Write MSA (Master Service Agreement)", description: "Scope, fees, payment terms, IP ownership, confidentiality, liability, and termination clauses.", category: "sales", aiCapability: "full", requiredPlan: "growth", estimatedMinutes: 30, order: 14 },
  { id: "ag-onboarding-docs", phase: 4, phaseTitle: "Close & Deliver", title: "Create client onboarding docs", description: "Brand questionnaire, access/logins checklist, kickoff meeting agenda, and communication guidelines.", category: "sales", aiCapability: "full", requiredPlan: "starter", estimatedMinutes: 20, order: 15 },
  { id: "ag-objection-scripts", phase: 4, phaseTitle: "Close & Deliver", title: "Build objection-handling scripts", description: "Top objections for agencies (price, 'we'll do it in-house', timing) with proven reframe responses.", category: "sales", aiCapability: "full", requiredPlan: "starter", estimatedMinutes: 15, order: 16 },

  // Phase 5: Systems & Scale (Days 22-30)
  { id: "ag-sops", phase: 5, phaseTitle: "Systems & Scale", title: "Create SOPs for core service delivery", description: "Step-by-step processes with quality checkpoints for your agency's main offerings.", category: "growth", aiCapability: "draft", requiredPlan: "growth", estimatedMinutes: 30, order: 17 },
  { id: "ag-pm-workflows", phase: 5, phaseTitle: "Systems & Scale", title: "Set up project management workflows", description: "AI generates workflow templates for your services: task lists, milestones, and handoff points.", category: "growth", aiCapability: "strategy", requiredPlan: "growth", estimatedMinutes: 25, order: 18 },
  { id: "ag-case-study-pipeline", phase: 5, phaseTitle: "Systems & Scale", title: "Build case study creation pipeline", description: "Results collection template + narrative writing template. Turn every client win into marketing.", category: "growth", aiCapability: "full", requiredPlan: "starter", estimatedMinutes: 20, order: 19 },
  { id: "ag-referral-program", phase: 5, phaseTitle: "Systems & Scale", title: "Create referral program", description: "Structure, incentives, and announcement emails. AI designs the program based on your services and pricing.", category: "growth", aiCapability: "full", requiredPlan: "starter", estimatedMinutes: 15, order: 20 },
];

// ── COURSES ── 23 tasks

const COURSES_TASKS: ChecklistTask[] = [
  // Phase 1: Review & Plan
  { id: "cr-review-site", phase: 1, phaseTitle: "Review & Plan", title: "Review your live site", description: "Check sales pages, pricing, and product descriptions. AI generated your course listings and sales copy during build.", category: "foundation", aiCapability: "manual", requiredPlan: "free", estimatedMinutes: 20, order: 1 },
  { id: "cr-course-outline", phase: 1, phaseTitle: "Review & Plan", title: "Create full course outline/curriculum", description: "4-8 modules, 3-5 lessons each, with learning objectives per module. AI drafts based on your topic and audience.", category: "foundation", aiCapability: "draft", requiredPlan: "free", estimatedMinutes: 30, order: 2 },
  { id: "cr-validate-demand", phase: 1, phaseTitle: "Review & Plan", title: "Validate demand for your course", description: "AI generates a research plan: Google Trends analysis, Reddit/community validation, and competitor course review.", category: "foundation", aiCapability: "strategy", requiredPlan: "free", estimatedMinutes: 20, order: 3 },

  // Phase 2: Course Content Creation (GROWTH)
  { id: "cr-lesson-plans", phase: 2, phaseTitle: "Course Content Creation", title: "Write detailed lesson plans", description: "Talking points, examples, exercises, and key takeaways for every lesson in your curriculum.", category: "product", aiCapability: "full", requiredPlan: "growth", estimatedMinutes: 45, order: 4 },
  { id: "cr-worksheets", phase: 2, phaseTitle: "Course Content Creation", title: "Create worksheets and exercises per module", description: "Reflection questions, action templates, self-assessments, and practice exercises for each module.", category: "product", aiCapability: "full", requiredPlan: "growth", estimatedMinutes: 30, order: 5 },
  { id: "cr-quizzes", phase: 2, phaseTitle: "Course Content Creation", title: "Write quiz/assessment questions", description: "Multiple choice + short answer questions per module with answer keys. Tests comprehension and application.", category: "product", aiCapability: "full", requiredPlan: "growth", estimatedMinutes: 25, order: 6 },
  { id: "cr-video-scripts", phase: 2, phaseTitle: "Course Content Creation", title: "Write video scripts for each lesson", description: "Hook, content delivery, examples, transitions, and recap for each lesson video. 5-15 min per lesson.", category: "product", aiCapability: "full", requiredPlan: "growth", estimatedMinutes: 40, order: 7 },
  { id: "cr-slide-decks", phase: 2, phaseTitle: "Course Content Creation", title: "Create slide deck outlines per lesson", description: "Key points, visual suggestions, and speaker notes for presentation slides.", category: "product", aiCapability: "draft", requiredPlan: "growth", estimatedMinutes: 30, order: 8 },
  { id: "cr-record-lessons", phase: 2, phaseTitle: "Course Content Creation", title: "Record lessons", description: "AI provides an equipment checklist, recording tips, and quality standards for your video lessons.", category: "product", aiCapability: "manual", requiredPlan: "free", estimatedMinutes: 120, order: 9 },
  { id: "cr-cheat-sheets", phase: 2, phaseTitle: "Course Content Creation", title: "Write module summaries + cheat sheets", description: "One-page cheat sheets per module that students can reference quickly. Great for retention.", category: "product", aiCapability: "full", requiredPlan: "growth", estimatedMinutes: 20, order: 10 },

  // Phase 3: Platform & Infrastructure (Days 12-16)
  { id: "cr-choose-platform", phase: 3, phaseTitle: "Platform & Infrastructure", title: "Choose + set up course platform", description: "AI compares Teachable, Thinkific, Kajabi, and Podia based on your needs, budget, and features.", category: "foundation", aiCapability: "strategy", requiredPlan: "free", estimatedMinutes: 30, order: 11 },
  { id: "cr-welcome-guide", phase: 3, phaseTitle: "Platform & Infrastructure", title: "Create course welcome guide", description: "How the course works, time commitment, what to expect, tech requirements, and community access.", category: "foundation", aiCapability: "full", requiredPlan: "starter", estimatedMinutes: 15, order: 12 },
  { id: "cr-community", phase: 3, phaseTitle: "Platform & Infrastructure", title: "Design community/support structure", description: "Platform recommendations, community guidelines, weekly check-in templates, and moderation plan.", category: "foundation", aiCapability: "strategy", requiredPlan: "starter", estimatedMinutes: 20, order: 13 },

  // Phase 4: Marketing & Pre-Launch (Days 16-24)
  { id: "cr-waitlist", phase: 4, phaseTitle: "Marketing & Pre-Launch", title: "Build waitlist + lead magnet", description: "Free mini-lesson, cheat sheet, or preview module as a lead magnet. Includes landing page copy.", category: "marketing", aiCapability: "full", requiredPlan: "starter", estimatedMinutes: 20, order: 14 },
  { id: "cr-launch-emails", phase: 4, phaseTitle: "Marketing & Pre-Launch", title: "Create 7-email launch sequence", description: "Announce → story → preview → open cart → social proof → FAQ → last chance. Timed over 10 days.", category: "marketing", aiCapability: "full", requiredPlan: "starter", estimatedMinutes: 25, order: 15 },
  { id: "cr-social-content", phase: 4, phaseTitle: "Marketing & Pre-Launch", title: "Create social media launch content", description: "15-20 posts: behind-the-scenes, content reveals, countdown, and student/beta testimonials.", category: "marketing", aiCapability: "full", requiredPlan: "starter", estimatedMinutes: 20, order: 16 },
  { id: "cr-webinar-script", phase: 4, phaseTitle: "Marketing & Pre-Launch", title: "Write free webinar/workshop script", description: "30 min teach + 15 min pitch. AI writes the full script based on your course topic and methodology.", category: "marketing", aiCapability: "full", requiredPlan: "growth", estimatedMinutes: 25, order: 17 },
  { id: "cr-affiliate-outreach", phase: 4, phaseTitle: "Marketing & Pre-Launch", title: "Create affiliate/partner outreach", description: "Recruitment emails, swipe copy for affiliates, and program terms.", category: "marketing", aiCapability: "full", requiredPlan: "growth", estimatedMinutes: 20, order: 18 },
  { id: "cr-ad-copy", phase: 4, phaseTitle: "Marketing & Pre-Launch", title: "Generate ad copy + images for launch", description: "Meta and TikTok ad copy with AI-generated creative. Multiple angles and formats.", category: "marketing", aiCapability: "full", requiredPlan: "growth", estimatedMinutes: 25, order: 19 },

  // Phase 5: Launch & Evergreen (Days 24-30)
  { id: "cr-launch-calendar", phase: 5, phaseTitle: "Launch & Evergreen", title: "Execute launch — day-by-day calendar", description: "AI creates a detailed launch playbook: daily actions, email sends, social posts, and contingency plans.", category: "launch", aiCapability: "strategy", requiredPlan: "free", estimatedMinutes: 15, order: 20 },
  { id: "cr-student-onboarding", phase: 5, phaseTitle: "Launch & Evergreen", title: "Set up student onboarding", description: "3-email welcome sequence: account setup, community intro, and 'start here' guide.", category: "launch", aiCapability: "full", requiredPlan: "starter", estimatedMinutes: 15, order: 21 },
  { id: "cr-feedback-system", phase: 5, phaseTitle: "Launch & Evergreen", title: "Create feedback collection system", description: "Mid-course survey, completion survey, and testimonial request template with specific prompts.", category: "launch", aiCapability: "full", requiredPlan: "starter", estimatedMinutes: 15, order: 22 },
  { id: "cr-evergreen-funnel", phase: 5, phaseTitle: "Launch & Evergreen", title: "Plan evergreen sales funnel", description: "Lead magnet → nurture sequence → webinar → sales page → cart recovery. AI outlines the full funnel.", category: "launch", aiCapability: "draft", requiredPlan: "growth", estimatedMinutes: 25, order: 23 },
];

// ── TEMPLATES ── 21 tasks

const TEMPLATES_TASKS: ChecklistTask[] = [
  // Phase 1: Review & Product Creation
  { id: "tp-review-site", phase: 1, phaseTitle: "Review & Product Creation", title: "Review your live site", description: "Check product pages and sales copy. AI generated your listings and pricing during build.", category: "foundation", aiCapability: "manual", requiredPlan: "free", estimatedMinutes: 15, order: 1 },
  { id: "tp-template-structure", phase: 1, phaseTitle: "Review & Product Creation", title: "Design template structure/blueprint", description: "AI helps map out every section, field, formula, and user flow for your template.", category: "product", aiCapability: "draft", requiredPlan: "growth", estimatedMinutes: 30, order: 2 },
  { id: "tp-build-template", phase: 1, phaseTitle: "Review & Product Creation", title: "Build the template in your tool", description: "Build it in Notion, Figma, Canva, or Google Sheets. AI provides best practices and quality checklist.", category: "product", aiCapability: "manual", requiredPlan: "free", estimatedMinutes: 120, order: 3 },
  { id: "tp-sample-data", phase: 1, phaseTitle: "Review & Product Creation", title: "Fill with realistic sample data", description: "AI generates believable demo entries so buyers can see the template in action.", category: "product", aiCapability: "draft", requiredPlan: "growth", estimatedMinutes: 20, order: 4 },
  { id: "tp-documentation", phase: 1, phaseTitle: "Review & Product Creation", title: "Write complete documentation", description: "Setup guide, customization walkthrough, feature explanation, and FAQ.", category: "product", aiCapability: "full", requiredPlan: "growth", estimatedMinutes: 25, order: 5 },
  { id: "tp-video-script", phase: 1, phaseTitle: "Review & Product Creation", title: "Create video walkthrough script", description: "3-5 min demo script: intro hook, feature tour, customization tips, and CTA.", category: "product", aiCapability: "full", requiredPlan: "growth", estimatedMinutes: 15, order: 6 },

  // Phase 2: Listing & Distribution
  { id: "tp-marketplace-listings", phase: 2, phaseTitle: "Listing & Distribution", title: "Write optimized marketplace listings", description: "Keyword-optimized descriptions for Gumroad, Etsy, and Notion Marketplace.", category: "marketing", aiCapability: "draft", requiredPlan: "starter", estimatedMinutes: 20, order: 7 },
  { id: "tp-lite-version", phase: 2, phaseTitle: "Listing & Distribution", title: "Create free 'lite' version as lead magnet", description: "AI advises what features to include in the free version vs. gate behind the paid version.", category: "marketing", aiCapability: "strategy", requiredPlan: "starter", estimatedMinutes: 15, order: 8 },
  { id: "tp-preview-copy", phase: 2, phaseTitle: "Listing & Distribution", title: "Create preview page copy", description: "'Peek inside' descriptions, feature highlights, and benefit-focused copy.", category: "marketing", aiCapability: "full", requiredPlan: "starter", estimatedMinutes: 15, order: 9 },
  { id: "tp-product-images", phase: 2, phaseTitle: "Listing & Distribution", title: "Generate additional product images", description: "AI-generated mockup screenshots and lifestyle images for your template listing.", category: "marketing", aiCapability: "full", requiredPlan: "growth", estimatedMinutes: 20, order: 10 },

  // Phase 3: Marketing & First Sales
  { id: "tp-build-in-public", phase: 3, phaseTitle: "Marketing & First Sales", title: "Create 'build in public' content", description: "10-15 posts documenting your creation process: decisions, progress, and behind-the-scenes.", category: "marketing", aiCapability: "full", requiredPlan: "starter", estimatedMinutes: 20, order: 11 },
  { id: "tp-seo-blogs", phase: 3, phaseTitle: "Marketing & First Sales", title: "Write 3 SEO blog posts", description: "Target '[niche] template' keyword searches. Drive organic traffic to your product page.", category: "marketing", aiCapability: "full", requiredPlan: "starter", estimatedMinutes: 25, order: 12 },
  { id: "tp-social-posts", phase: 3, phaseTitle: "Marketing & First Sales", title: "Create 20+ social media posts", description: "Feature highlights, before/after comparisons, demo clips, and user testimonials.", category: "marketing", aiCapability: "full", requiredPlan: "starter", estimatedMinutes: 20, order: 13 },
  { id: "tp-community-posts", phase: 3, phaseTitle: "Marketing & First Sales", title: "Share in communities", description: "Value-first posts for Reddit, Product Hunt, and niche communities. AI writes the posts.", category: "marketing", aiCapability: "full", requiredPlan: "starter", estimatedMinutes: 15, order: 14 },
  { id: "tp-video-scripts", phase: 3, phaseTitle: "Marketing & First Sales", title: "Script a TikTok/Reel + YouTube walkthrough", description: "60-sec short-form hook + 5-min YouTube deep dive. AI writes both scripts.", category: "marketing", aiCapability: "full", requiredPlan: "starter", estimatedMinutes: 15, order: 15 },
  { id: "tp-email-capture", phase: 3, phaseTitle: "Marketing & First Sales", title: "Set up email capture + nurture sequence", description: "3-email sequence: free resource delivery → value-add tip → product pitch.", category: "marketing", aiCapability: "full", requiredPlan: "starter", estimatedMinutes: 15, order: 16 },
  { id: "tp-ad-copy", phase: 3, phaseTitle: "Marketing & First Sales", title: "Generate ad copy + images for launch", description: "Meta and TikTok ad copy with AI-generated creative for template marketing.", category: "marketing", aiCapability: "full", requiredPlan: "growth", estimatedMinutes: 20, order: 17 },

  // Phase 4: Optimize & Expand
  { id: "tp-reviews", phase: 4, phaseTitle: "Optimize & Expand", title: "Collect and showcase reviews", description: "Review request emails, display strategy, and user spotlight templates.", category: "growth", aiCapability: "full", requiredPlan: "starter", estimatedMinutes: 15, order: 18 },
  { id: "tp-bundle", phase: 4, phaseTitle: "Optimize & Expand", title: "Create a template bundle", description: "AI recommends bundle combinations and writes bundle sales page copy.", category: "growth", aiCapability: "strategy", requiredPlan: "starter", estimatedMinutes: 15, order: 19 },
  { id: "tp-next-template", phase: 4, phaseTitle: "Optimize & Expand", title: "Plan next template", description: "AI analyzes demand signals and feedback to recommend your next product.", category: "growth", aiCapability: "strategy", requiredPlan: "free", estimatedMinutes: 15, order: 20 },
  { id: "tp-affiliate", phase: 4, phaseTitle: "Optimize & Expand", title: "Set up affiliate program", description: "Program terms, recruitment outreach emails, and swipe copy for affiliates.", category: "growth", aiCapability: "full", requiredPlan: "growth", estimatedMinutes: 20, order: 21 },
];

// ── EBOOKS ── 21 tasks

const EBOOKS_TASKS: ChecklistTask[] = [
  // Phase 1: Review & Book Creation
  { id: "eb-review-site", phase: 1, phaseTitle: "Review & Book Creation", title: "Review your live site", description: "Check sales page and product descriptions. AI generated your sales copy and pricing during build.", category: "foundation", aiCapability: "manual", requiredPlan: "free", estimatedMinutes: 15, order: 1 },
  { id: "eb-chapter-outline", phase: 1, phaseTitle: "Review & Book Creation", title: "Create detailed chapter outline", description: "8-12 chapters with thesis statement, key points, and examples for each. AI drafts based on your topic.", category: "foundation", aiCapability: "draft", requiredPlan: "free", estimatedMinutes: 25, order: 2 },
  { id: "eb-chapter-drafts", phase: 1, phaseTitle: "Review & Book Creation", title: "Write chapter drafts", description: "2,000-4,000 words per chapter. AI writes first drafts — you revise for voice and personal stories.", category: "product", aiCapability: "draft", requiredPlan: "growth", estimatedMinutes: 60, order: 3 },
  { id: "eb-supporting-materials", phase: 1, phaseTitle: "Review & Book Creation", title: "Create supporting materials", description: "Worksheets, checklists, and action plans that complement each chapter.", category: "product", aiCapability: "full", requiredPlan: "growth", estimatedMinutes: 25, order: 4 },
  { id: "eb-intro-conclusion", phase: 1, phaseTitle: "Review & Book Creation", title: "Write introduction and conclusion", description: "Hook readers with a compelling intro and close with a clear call to action.", category: "product", aiCapability: "full", requiredPlan: "growth", estimatedMinutes: 20, order: 5 },
  { id: "eb-front-back-matter", phase: 1, phaseTitle: "Review & Book Creation", title: "Create front/back matter", description: "Copyright page, table of contents, about the author, resources section, and acknowledgments.", category: "product", aiCapability: "full", requiredPlan: "growth", estimatedMinutes: 15, order: 6 },
  { id: "eb-editing-pass", phase: 1, phaseTitle: "Review & Book Creation", title: "AI editing pass", description: "Tighten language, improve flow, catch inconsistencies, and strengthen arguments.", category: "product", aiCapability: "full", requiredPlan: "growth", estimatedMinutes: 30, order: 7 },

  // Phase 2: Distribution & Sales
  { id: "eb-marketplace-listings", phase: 2, phaseTitle: "Distribution & Sales", title: "Write marketplace listings", description: "Keyword-optimized descriptions for Amazon KDP and Gumroad.", category: "marketing", aiCapability: "full", requiredPlan: "starter", estimatedMinutes: 20, order: 8 },
  { id: "eb-cover-brief", phase: 2, phaseTitle: "Distribution & Sales", title: "Create book cover design brief", description: "Style references, color palette, mood, and 3 layout concepts for a professional cover.", category: "marketing", aiCapability: "full", requiredPlan: "starter", estimatedMinutes: 15, order: 9 },
  { id: "eb-sample-chapter", phase: 2, phaseTitle: "Distribution & Sales", title: "Create free sample/preview chapter", description: "Best excerpt with a 'want more?' CTA. Perfect for lead generation.", category: "marketing", aiCapability: "full", requiredPlan: "starter", estimatedMinutes: 15, order: 10 },
  { id: "eb-format", phase: 2, phaseTitle: "Distribution & Sales", title: "Format for distribution", description: "AI provides guides for PDF, ePub, and Kindle formatting.", category: "marketing", aiCapability: "strategy", requiredPlan: "free", estimatedMinutes: 20, order: 11 },

  // Phase 3: Launch
  { id: "eb-launch-emails", phase: 3, phaseTitle: "Launch", title: "Create email launch sequence", description: "5-7 emails: cover reveal → free chapter → behind the scenes → launch day → social proof → last chance.", category: "marketing", aiCapability: "full", requiredPlan: "starter", estimatedMinutes: 25, order: 12 },
  { id: "eb-social-posts", phase: 3, phaseTitle: "Launch", title: "Create 20+ social media launch posts", description: "Cover reveals, quote graphics, teasers, countdown, and reader testimonials.", category: "marketing", aiCapability: "full", requiredPlan: "starter", estimatedMinutes: 20, order: 13 },
  { id: "eb-podcast-pitch", phase: 3, phaseTitle: "Launch", title: "Create podcast/interview pitch", description: "Topic angles, talking points, bio, and host-specific customization template.", category: "marketing", aiCapability: "full", requiredPlan: "starter", estimatedMinutes: 15, order: 14 },
  { id: "eb-reviewer-outreach", phase: 3, phaseTitle: "Launch", title: "Reach out to book reviewers", description: "Review copy package: personalized pitch email, book summary, and advance reader copy.", category: "marketing", aiCapability: "full", requiredPlan: "starter", estimatedMinutes: 15, order: 15 },
  { id: "eb-ad-copy", phase: 3, phaseTitle: "Launch", title: "Generate ad copy + images for launch", description: "Meta and TikTok ad copy with AI-generated creative for book marketing.", category: "marketing", aiCapability: "full", requiredPlan: "growth", estimatedMinutes: 20, order: 16 },
  { id: "eb-guest-posts", phase: 3, phaseTitle: "Launch", title: "Write 3 guest post pitches + articles", description: "Full articles tying to your book topic, pitched to relevant publications.", category: "marketing", aiCapability: "full", requiredPlan: "growth", estimatedMinutes: 30, order: 17 },

  // Phase 4: Evergreen Sales
  { id: "eb-evergreen-funnel", phase: 4, phaseTitle: "Evergreen Sales", title: "Create evergreen email funnel", description: "Lead magnet → nurture sequence → sales emails → cart recovery. AI writes the full funnel.", category: "growth", aiCapability: "full", requiredPlan: "starter", estimatedMinutes: 25, order: 18 },
  { id: "eb-seo-blogs", phase: 4, phaseTitle: "Evergreen Sales", title: "Write 3-5 SEO blog posts", description: "Articles that rank for keywords related to your book topic and drive sales.", category: "growth", aiCapability: "full", requiredPlan: "starter", estimatedMinutes: 25, order: 19 },
  { id: "eb-bundle", phase: 4, phaseTitle: "Evergreen Sales", title: "Create 'book + bonus' bundle", description: "Pair the book with worksheets, templates, or a mini-course for a premium bundle.", category: "growth", aiCapability: "full", requiredPlan: "growth", estimatedMinutes: 20, order: 20 },
  { id: "eb-next-product", phase: 4, phaseTitle: "Evergreen Sales", title: "Plan next product", description: "AI helps plan book 2, a companion course, coaching program, or template bundle based on reader feedback.", category: "growth", aiCapability: "strategy", requiredPlan: "free", estimatedMinutes: 15, order: 21 },
];

// ── MEMBERSHIPS ── 22 tasks

const MEMBERSHIPS_TASKS: ChecklistTask[] = [
  // Phase 1: Review & Membership Design
  { id: "mb-review-site", phase: 1, phaseTitle: "Review & Membership Design", title: "Review your live site", description: "Check membership sales page and product descriptions. AI generated your sales copy during build.", category: "foundation", aiCapability: "manual", requiredPlan: "free", estimatedMinutes: 15, order: 1 },
  { id: "mb-content-calendar", phase: 1, phaseTitle: "Review & Membership Design", title: "Plan 3-month content calendar", description: "Weekly content types: tutorials, Q&As, resource drops, guest experts, and challenges.", category: "foundation", aiCapability: "draft", requiredPlan: "free", estimatedMinutes: 25, order: 2 },
  { id: "mb-community-structure", phase: 1, phaseTitle: "Review & Membership Design", title: "Design community structure", description: "Channels, rules, welcome messages, icebreaker prompts, and engagement guidelines.", category: "foundation", aiCapability: "full", requiredPlan: "starter", estimatedMinutes: 20, order: 3 },
  { id: "mb-verify-stripe", phase: 1, phaseTitle: "Review & Membership Design", title: "Verify recurring payments via Stripe", description: "Ensure Stripe is set up for recurring membership billing.", category: "foundation", aiCapability: "manual", requiredPlan: "free", estimatedMinutes: 5, autoCheck: "has_stripe", order: 4 },

  // Phase 2: Content & Experience Creation (GROWTH)
  { id: "mb-content-library", phase: 2, phaseTitle: "Content & Experience Creation", title: "Create founding content library", description: "AI writes or outlines 10-15 initial resources so members get instant value on day one.", category: "product", aiCapability: "full", requiredPlan: "growth", estimatedMinutes: 40, order: 5 },
  { id: "mb-onboarding-sequence", phase: 2, phaseTitle: "Content & Experience Creation", title: "Create 7-day member onboarding sequence", description: "Welcome → quick win → engage with community → deep dive resource → introduce all features.", category: "product", aiCapability: "full", requiredPlan: "growth", estimatedMinutes: 25, order: 6 },
  { id: "mb-engagement-loops", phase: 2, phaseTitle: "Content & Experience Creation", title: "Design engagement loops", description: "Daily, weekly, monthly, and quarterly hooks that keep members active and retained.", category: "product", aiCapability: "full", requiredPlan: "growth", estimatedMinutes: 25, order: 7 },
  { id: "mb-template-responses", phase: 2, phaseTitle: "Content & Experience Creation", title: "Write template responses", description: "Pre-written responses for common community interactions, questions, and welcome messages.", category: "product", aiCapability: "full", requiredPlan: "growth", estimatedMinutes: 15, order: 8 },
  { id: "mb-faq-hub", phase: 2, phaseTitle: "Content & Experience Creation", title: "Create member FAQ and resource hub", description: "Comprehensive FAQ covering platform access, billing, content schedule, and community guidelines.", category: "product", aiCapability: "full", requiredPlan: "starter", estimatedMinutes: 15, order: 9 },

  // Phase 3: Pre-Launch Marketing
  { id: "mb-waitlist", phase: 3, phaseTitle: "Pre-Launch Marketing", title: "Build waitlist", description: "Landing page copy + 3-email nurture sequence for waitlist subscribers.", category: "marketing", aiCapability: "full", requiredPlan: "starter", estimatedMinutes: 20, order: 10 },
  { id: "mb-founding-offer", phase: 3, phaseTitle: "Pre-Launch Marketing", title: "Create founding member offer", description: "Special pricing, exclusive perks, and locked-in rates for early members.", category: "marketing", aiCapability: "full", requiredPlan: "starter", estimatedMinutes: 15, order: 11 },
  { id: "mb-beta-outreach", phase: 3, phaseTitle: "Pre-Launch Marketing", title: "Recruit 10-20 beta members", description: "AI writes personal outreach messages for warm contacts who'd be perfect founding members.", category: "marketing", aiCapability: "full", requiredPlan: "starter", estimatedMinutes: 15, order: 12 },
  { id: "mb-launch-plan", phase: 3, phaseTitle: "Pre-Launch Marketing", title: "Create 2-week launch content plan", description: "Daily social posts + 5-email launch sequence building excitement and scarcity.", category: "marketing", aiCapability: "full", requiredPlan: "starter", estimatedMinutes: 20, order: 13 },
  { id: "mb-ad-copy", phase: 3, phaseTitle: "Pre-Launch Marketing", title: "Generate ad copy + images for launch", description: "Meta and TikTok ad copy with AI-generated creative for membership marketing.", category: "marketing", aiCapability: "full", requiredPlan: "growth", estimatedMinutes: 20, order: 14 },

  // Phase 4: Launch
  { id: "mb-launch-calendar", phase: 4, phaseTitle: "Launch", title: "Execute launch — day-by-day playbook", description: "AI creates detailed daily actions, posting schedule, and email send times.", category: "launch", aiCapability: "strategy", requiredPlan: "free", estimatedMinutes: 15, order: 15 },
  { id: "mb-launch-event", phase: 4, phaseTitle: "Launch", title: "Host free launch event", description: "Webinar/AMA script: teach valuable content → preview the membership → make the pitch.", category: "launch", aiCapability: "full", requiredPlan: "growth", estimatedMinutes: 25, order: 16 },
  { id: "mb-activate-founders", phase: 4, phaseTitle: "Launch", title: "Activate founding members", description: "Introduction prompts, discussion topics, and a collaborative challenge to build momentum.", category: "launch", aiCapability: "full", requiredPlan: "starter", estimatedMinutes: 15, order: 17 },
  { id: "mb-urgency-sequence", phase: 4, phaseTitle: "Launch", title: "Create 'doors closing' urgency sequence", description: "48-hour, 24-hour, and final-hours emails creating scarcity for the founding member offer.", category: "launch", aiCapability: "full", requiredPlan: "starter", estimatedMinutes: 15, order: 18 },

  // Phase 5: Retain & Grow
  { id: "mb-re-engagement", phase: 5, phaseTitle: "Retain & Grow", title: "Create re-engagement campaigns", description: "'We miss you' email sequence + survey for inactive members.", category: "growth", aiCapability: "full", requiredPlan: "starter", estimatedMinutes: 15, order: 19 },
  { id: "mb-referral-system", phase: 5, phaseTitle: "Retain & Grow", title: "Build referral/invite system", description: "Program announcement, invite templates, and reward structure for member referrals.", category: "growth", aiCapability: "full", requiredPlan: "starter", estimatedMinutes: 15, order: 20 },
  { id: "mb-ops-checklist", phase: 5, phaseTitle: "Retain & Grow", title: "Create monthly operations checklist", description: "Content schedule, community tasks, metrics review, and member outreach tasks.", category: "growth", aiCapability: "full", requiredPlan: "starter", estimatedMinutes: 15, order: 21 },
  { id: "mb-premium-upsells", phase: 5, phaseTitle: "Retain & Grow", title: "Plan premium upsells", description: "1:1 coaching, mastermind tiers, or VIP access. AI designs structure and pricing.", category: "growth", aiCapability: "strategy", requiredPlan: "growth", estimatedMinutes: 20, order: 22 },
];

// ── Lookup ──

const CHECKLIST_MAP: Record<string, ChecklistTask[]> = {
  freelance: FREELANCE_TASKS,
  consulting: CONSULTING_TASKS,
  coaching: COACHING_TASKS,
  agency: AGENCY_TASKS,
  courses: COURSES_TASKS,
  templates: TEMPLATES_TASKS,
  ebooks: EBOOKS_TASKS,
  memberships: MEMBERSHIPS_TASKS,
};

export function getChecklistForSubtype(subtype: string): ChecklistTask[] {
  return CHECKLIST_MAP[subtype] || FREELANCE_TASKS;
}

export function getPhases(tasks: ChecklistTask[]): { phase: number; title: string; tasks: ChecklistTask[] }[] {
  const phaseMap = new Map<number, { title: string; tasks: ChecklistTask[] }>();
  for (const task of tasks) {
    if (!phaseMap.has(task.phase)) {
      phaseMap.set(task.phase, { title: task.phaseTitle, tasks: [] });
    }
    phaseMap.get(task.phase)!.tasks.push(task);
  }
  return Array.from(phaseMap.entries())
    .sort(([a], [b]) => a - b)
    .map(([phase, data]) => ({ phase, ...data }));
}

export function getAllSubtypes(): string[] {
  return Object.keys(CHECKLIST_MAP);
}
