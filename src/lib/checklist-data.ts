// Launch checklist task definitions for 4 service business subtypes
// Active-freelancer oriented: "I already have clients, I'm running my business on Kovra"

export interface ChecklistTask {
  id: string;
  phase: 1 | 2 | 3 | 4 | 5;
  phaseTitle: string;
  title: string;
  description: string;
  category: "foundation" | "proof" | "outreach" | "sales" | "growth" | "product" | "marketing" | "launch";
  aiCapability: "full" | "draft" | "strategy" | "manual";
  requiredPlan: "free" | "solo" | "scale";
  estimatedMinutes: number;
  autoCheck?: string;
  externalUrl?: string;
  partnerId?: string;
  order: number;
}

// ── FREELANCE ── active freelancer with existing clients

const FREELANCE_TASKS: ChecklistTask[] = [
  // Phase 1: Get Operational (Week 1)
  { id: "fl-import-clients", phase: 1, phaseTitle: "Get Operational", title: "Import your existing clients", description: "Add your current and past clients to the CRM. Go to Contacts in your sidebar and add anyone you've worked with — it takes 2 minutes per contact.", category: "foundation", aiCapability: "manual", requiredPlan: "free", estimatedMinutes: 15, order: 1 },
  { id: "fl-verify-stripe", phase: 1, phaseTitle: "Get Operational", title: "Connect Stripe payments", description: "Link your Stripe account so clients can pay invoices directly through Kovra. Takes 5 minutes if you already have a Stripe account.", category: "foundation", aiCapability: "manual", requiredPlan: "free", estimatedMinutes: 5, autoCheck: "has_stripe", order: 2 },
  { id: "fl-setup-booking", phase: 1, phaseTitle: "Get Operational", title: "Set up your booking calendar", description: "Go to Calls > Settings and set your available days, hours, and slot duration. This replaces Calendly — clients book directly through Kovra.", category: "foundation", aiCapability: "manual", requiredPlan: "free", estimatedMinutes: 5, order: 3 },
  { id: "fl-share-booking", phase: 1, phaseTitle: "Get Operational", title: "Share your booking link", description: "Copy your booking link from the Calls page. Add it to your email signature, LinkedIn bio, and anywhere prospects reach out.", category: "foundation", aiCapability: "manual", requiredPlan: "free", estimatedMinutes: 10, order: 4 },
  { id: "fl-setup-email", phase: 1, phaseTitle: "Get Operational", title: "Set up professional email", description: "Get you@yourbusiness.com through Google Workspace for $6/mo. Looks more credible than Gmail.", category: "foundation", aiCapability: "manual", requiredPlan: "free", estimatedMinutes: 10, partnerId: "google-workspace", order: 5 },

  // Phase 2: Portfolio & Proof
  { id: "fl-review-site", phase: 2, phaseTitle: "Portfolio & Proof", title: "Update your site copy", description: "Review your services, pricing, and bio. AI drafted this during setup — update anything that doesn't sound like you.", category: "foundation", aiCapability: "manual", requiredPlan: "free", estimatedMinutes: 20, order: 6 },
  { id: "fl-portfolio-pieces", phase: 2, phaseTitle: "Portfolio & Proof", title: "Document 3 recent projects", description: "Turn past client work into portfolio pieces. AI generates a case study brief for each one if you give it the basics — the challenge, your approach, and the result.", category: "proof", aiCapability: "draft", requiredPlan: "free", estimatedMinutes: 30, order: 7 },
  { id: "fl-case-studies", phase: 2, phaseTitle: "Portfolio & Proof", title: "Write case study narratives", description: "Problem → process → result format for each portfolio piece. AI writes them based on your notes.", category: "proof", aiCapability: "full", requiredPlan: "free", estimatedMinutes: 20, order: 8 },
  { id: "fl-testimonials", phase: 2, phaseTitle: "Portfolio & Proof", title: "Request testimonials from past clients", description: "AI drafts the request emails. You send them. Aim for 3-5 short testimonials that speak to specific results.", category: "proof", aiCapability: "strategy", requiredPlan: "free", estimatedMinutes: 15, order: 9 },
  { id: "fl-lead-magnet", phase: 2, phaseTitle: "Portfolio & Proof", title: "Create a lead magnet", description: "AI builds a checklist, audit template, or starter kit as a downloadable PDF for your target audience.", category: "proof", aiCapability: "full", requiredPlan: "solo", estimatedMinutes: 25, order: 10 },

  // Phase 3: Outreach Machine
  { id: "fl-first-proposal", phase: 3, phaseTitle: "Outreach Machine", title: "Send your first AI proposal", description: "After a discovery call, open the contact's profile and click 'Create Proposal'. AI generates scope, deliverables, and pricing from your call notes.", category: "sales", aiCapability: "full", requiredPlan: "solo", estimatedMinutes: 15, order: 11 },
  { id: "fl-prospect-list", phase: 3, phaseTitle: "Outreach Machine", title: "Build a prospect list of 50 targets", description: "AI generates a where-to-find guide specific to your niche — LinkedIn searches, communities, directories, and signals to look for.", category: "outreach", aiCapability: "strategy", requiredPlan: "free", estimatedMinutes: 30, order: 12 },
  { id: "fl-cold-emails", phase: 3, phaseTitle: "Outreach Machine", title: "Write 3 cold email templates", description: "Three approaches: audit-style (offer free value), milestone-congrats (reach out on triggers), and referral-based. Personalized to your niche.", category: "outreach", aiCapability: "full", requiredPlan: "solo", estimatedMinutes: 20, order: 13 },
  { id: "fl-linkedin-scripts", phase: 3, phaseTitle: "Outreach Machine", title: "Write LinkedIn connection + DM scripts", description: "Connection request template + 3-message DM sequence that moves from value to conversation to call.", category: "outreach", aiCapability: "full", requiredPlan: "solo", estimatedMinutes: 15, order: 14 },
  { id: "fl-platform-profiles", phase: 3, phaseTitle: "Outreach Machine", title: "Set up freelance platform profiles", description: "AI writes optimized bios for Upwork, Fiverr, or Toptal based on your skills and positioning.", category: "outreach", aiCapability: "draft", requiredPlan: "solo", estimatedMinutes: 25, order: 15 },
  { id: "fl-proposal-template", phase: 3, phaseTitle: "Outreach Machine", title: "Create proposal template", description: "3 pricing tiers, scope of work, timeline, deliverables, and a 'Why Me' section. Ready to customize per client.", category: "outreach", aiCapability: "full", requiredPlan: "solo", estimatedMinutes: 20, order: 16 },
  { id: "fl-followup-sequence", phase: 3, phaseTitle: "Outreach Machine", title: "Write 4-email follow-up sequence", description: "For leads who ghost: gentle bump, value-add, social proof, and final reach-out. Spaced over 2 weeks.", category: "outreach", aiCapability: "full", requiredPlan: "solo", estimatedMinutes: 15, order: 17 },

  // Phase 4: Convert & Close
  { id: "fl-review-pipeline", phase: 4, phaseTitle: "Convert & Close", title: "Review your sales pipeline", description: "Open the Pipeline page to see your deals by stage. Track total pipeline value and where leads are getting stuck.", category: "sales", aiCapability: "manual", requiredPlan: "solo", estimatedMinutes: 5, order: 18 },
  { id: "fl-discovery-script", phase: 4, phaseTitle: "Convert & Close", title: "Write discovery call script", description: "20-min structure: rapport building → pain discovery → solution positioning → next steps. Tailored to your services.", category: "sales", aiCapability: "full", requiredPlan: "solo", estimatedMinutes: 20, order: 19 },
  { id: "fl-contract", phase: 4, phaseTitle: "Convert & Close", title: "Create freelance contract template", description: "Scope, payment terms, IP ownership, revision limits, kill fee, and termination clause. Ready to use.", category: "sales", aiCapability: "full", requiredPlan: "scale", estimatedMinutes: 25, order: 20 },
  { id: "fl-onboarding-questionnaire", phase: 4, phaseTitle: "Convert & Close", title: "Build client onboarding questionnaire", description: "Covers brand assets, logins/access, stakeholders, timeline, communication preferences, and project goals.", category: "sales", aiCapability: "full", requiredPlan: "solo", estimatedMinutes: 15, order: 21 },
  { id: "fl-kickoff-email", phase: 4, phaseTitle: "Convert & Close", title: "Write project kickoff email template", description: "Welcome email with timeline, expectations, next steps, and links to shared resources.", category: "sales", aiCapability: "full", requiredPlan: "solo", estimatedMinutes: 10, order: 22 },

  // Phase 5: Grow & Retain
  { id: "fl-offboarding-referral", phase: 5, phaseTitle: "Grow & Retain", title: "Create offboarding + referral system", description: "Project delivery email, testimonial request, satisfaction survey, and referral incentive scripts.", category: "growth", aiCapability: "full", requiredPlan: "solo", estimatedMinutes: 20, order: 23 },
  { id: "fl-first-blog", phase: 5, phaseTitle: "Grow & Retain", title: "Publish first blog post or case study", description: "SEO-optimized article about a topic your audience searches for. Establishes expertise and drives organic traffic.", category: "growth", aiCapability: "full", requiredPlan: "solo", estimatedMinutes: 25, order: 24 },
  { id: "fl-social-calendar", phase: 5, phaseTitle: "Grow & Retain", title: "Create 30-day social media content calendar", description: "3 posts/week across LinkedIn, Twitter/X, or Instagram. Mix of tips, behind-the-scenes, and case study snippets.", category: "growth", aiCapability: "draft", requiredPlan: "solo", estimatedMinutes: 20, order: 25 },
];

// ── CONSULTING ── active consultant with existing clients

const CONSULTING_TASKS: ChecklistTask[] = [
  // Phase 1: Get Operational
  { id: "cn-import-clients", phase: 1, phaseTitle: "Get Operational", title: "Import your existing clients", description: "Add current and past clients to the CRM. Go to Contacts and add each one — capture their company, contact, and what you worked on together.", category: "foundation", aiCapability: "manual", requiredPlan: "free", estimatedMinutes: 15, order: 1 },
  { id: "cn-verify-integrations", phase: 1, phaseTitle: "Get Operational", title: "Connect Stripe payments", description: "Link Stripe so clients can pay invoices through Kovra. Replaces whatever you're using now for billing.", category: "foundation", aiCapability: "manual", requiredPlan: "free", estimatedMinutes: 5, autoCheck: "has_stripe", order: 2 },
  { id: "cn-setup-booking", phase: 1, phaseTitle: "Get Operational", title: "Set up your booking calendar", description: "Configure your available days and hours in Calls > Settings. Share one link instead of the endless back-and-forth.", category: "foundation", aiCapability: "manual", requiredPlan: "free", estimatedMinutes: 5, order: 3 },
  { id: "cn-share-booking", phase: 1, phaseTitle: "Get Operational", title: "Share your booking link", description: "Copy your booking link from the Calls page. Add it to your email signature, LinkedIn, and website.", category: "foundation", aiCapability: "manual", requiredPlan: "free", estimatedMinutes: 10, order: 4 },
  { id: "cn-methodology", phase: 1, phaseTitle: "Get Operational", title: "Build a named methodology/framework", description: "AI helps you create a branded 4-6 step framework (e.g., 'The 4R Revenue System') that differentiates your consulting approach and gives you something concrete to sell.", category: "foundation", aiCapability: "draft", requiredPlan: "free", estimatedMinutes: 25, order: 5 },

  // Phase 2: Thought Leadership
  { id: "cn-review-site", phase: 2, phaseTitle: "Thought Leadership", title: "Update your positioning and services copy", description: "Review your site's about page, services, and pricing. AI drafted this during setup — refine it to match how you actually talk about your work.", category: "foundation", aiCapability: "manual", requiredPlan: "free", estimatedMinutes: 20, order: 6 },
  { id: "cn-cornerstone-articles", phase: 2, phaseTitle: "Thought Leadership", title: "Write 3 cornerstone articles", description: "1,500-2,000 word SEO-optimized pieces that showcase your expertise. AI writes them based on your methodology and audience.", category: "proof", aiCapability: "full", requiredPlan: "solo", estimatedMinutes: 30, order: 7 },
  { id: "cn-self-assessment", phase: 2, phaseTitle: "Thought Leadership", title: "Create a free self-assessment/scorecard", description: "10-15 questions with scoring logic that diagnoses where prospects need help. Perfect lead magnet.", category: "proof", aiCapability: "full", requiredPlan: "solo", estimatedMinutes: 25, order: 8 },
  { id: "cn-industry-guide", phase: 2, phaseTitle: "Thought Leadership", title: "Write an industry guide/report", description: "10-15 page lead magnet covering state of the industry, trends, and your perspective. Positions you as the expert.", category: "proof", aiCapability: "full", requiredPlan: "solo", estimatedMinutes: 35, order: 9 },
  { id: "cn-linkedin-strategy", phase: 2, phaseTitle: "Thought Leadership", title: "Create 30-day LinkedIn content strategy", description: "5 posts/week mixing insights, frameworks, hot takes, and client wins. AI drafts the content calendar.", category: "proof", aiCapability: "draft", requiredPlan: "solo", estimatedMinutes: 20, order: 10 },

  // Phase 3: Network & Outreach
  { id: "cn-first-proposal", phase: 3, phaseTitle: "Network & Outreach", title: "Send your first AI proposal", description: "Open a contact's profile and click 'Create Proposal'. AI generates a scope of work, engagement options, and pricing from your notes.", category: "sales", aiCapability: "full", requiredPlan: "solo", estimatedMinutes: 15, order: 11 },
  { id: "cn-announcement-emails", phase: 3, phaseTitle: "Network & Outreach", title: "Write announcement emails", description: "3 versions of 'I've gone independent' or 'I've expanded my practice' emails: close contacts, former colleagues, and acquaintances.", category: "outreach", aiCapability: "full", requiredPlan: "solo", estimatedMinutes: 15, order: 12 },
  { id: "cn-cold-outreach", phase: 3, phaseTitle: "Network & Outreach", title: "Craft cold outreach for target accounts", description: "Personalized emails + 3 follow-ups for your ideal consulting clients. References their specific challenges.", category: "outreach", aiCapability: "full", requiredPlan: "solo", estimatedMinutes: 20, order: 13 },
  { id: "cn-partnership-outreach", phase: 3, phaseTitle: "Network & Outreach", title: "Create strategic partnership outreach", description: "Emails for complementary consultants proposing mutual referrals and collaboration.", category: "outreach", aiCapability: "full", requiredPlan: "solo", estimatedMinutes: 15, order: 14 },
  { id: "cn-multi-channel", phase: 3, phaseTitle: "Network & Outreach", title: "Create 21-day multi-channel sequence", description: "Coordinated outreach across email + LinkedIn + personalized video over 21 days.", category: "outreach", aiCapability: "full", requiredPlan: "scale", estimatedMinutes: 30, order: 15 },
  { id: "cn-review-pipeline", phase: 3, phaseTitle: "Network & Outreach", title: "Review your sales pipeline", description: "Open the Pipeline page to track your deals by stage. See total pipeline value and where engagements stall.", category: "sales", aiCapability: "manual", requiredPlan: "solo", estimatedMinutes: 5, order: 16 },

  // Phase 4: Sales System
  { id: "cn-discovery-script", phase: 4, phaseTitle: "Sales System", title: "Build discovery call script", description: "30-min structure: pain discovery → impact quantification → methodology walkthrough → investment conversation → next steps.", category: "sales", aiCapability: "full", requiredPlan: "solo", estimatedMinutes: 20, order: 17 },
  { id: "cn-proposal-template", phase: 4, phaseTitle: "Sales System", title: "Create consulting proposal template", description: "Executive summary, methodology, timeline, 3 investment options (good/better/best), and ROI justification.", category: "sales", aiCapability: "full", requiredPlan: "solo", estimatedMinutes: 25, order: 18 },
  { id: "cn-sow-template", phase: 4, phaseTitle: "Sales System", title: "Write engagement letter/SOW template", description: "Scope, fees, payment schedule, IP, confidentiality, and termination clauses.", category: "sales", aiCapability: "full", requiredPlan: "scale", estimatedMinutes: 25, order: 19 },
  { id: "cn-objection-scripts", phase: 4, phaseTitle: "Sales System", title: "Build objection-handling scripts", description: "Top 10 consulting objections (price, timing, 'we can do it internally') with reframe responses.", category: "sales", aiCapability: "full", requiredPlan: "solo", estimatedMinutes: 15, order: 20 },
  { id: "cn-proposal-followup", phase: 4, phaseTitle: "Sales System", title: "Create proposal follow-up sequence", description: "5-touchpoint sequence after sending a proposal: same-day, 3-day, 7-day, 14-day, and final.", category: "sales", aiCapability: "full", requiredPlan: "solo", estimatedMinutes: 15, order: 21 },

  // Phase 5: Deliver & Scale
  { id: "cn-onboarding-docs", phase: 5, phaseTitle: "Deliver & Scale", title: "Create client onboarding docs", description: "Kickoff meeting agenda, data request checklist, and stakeholder interview guide.", category: "growth", aiCapability: "full", requiredPlan: "solo", estimatedMinutes: 20, order: 22 },
  { id: "cn-deliverable-templates", phase: 5, phaseTitle: "Deliver & Scale", title: "Build deliverable template library", description: "Audit report, strategy deck, and progress report templates you can reuse for every client.", category: "growth", aiCapability: "draft", requiredPlan: "scale", estimatedMinutes: 30, order: 23 },
  { id: "cn-sops", phase: 5, phaseTitle: "Deliver & Scale", title: "Create SOPs + case study pipeline", description: "Standard operating procedures for repeatable service delivery, plus a system for turning client wins into marketing.", category: "growth", aiCapability: "draft", requiredPlan: "scale", estimatedMinutes: 25, order: 24 },
];

// ── COACHING ── active coach with existing clients

const COACHING_TASKS: ChecklistTask[] = [
  // Phase 1: Get Operational
  { id: "co-import-clients", phase: 1, phaseTitle: "Get Operational", title: "Import your existing clients", description: "Add current and past coaching clients to the CRM. Go to Contacts — capture their name, what they're working on, and current status.", category: "foundation", aiCapability: "manual", requiredPlan: "free", estimatedMinutes: 15, order: 1 },
  { id: "co-verify-integrations", phase: 1, phaseTitle: "Get Operational", title: "Connect Stripe payments", description: "Link Stripe so clients can pay for packages and sessions directly through Kovra.", category: "foundation", aiCapability: "manual", requiredPlan: "free", estimatedMinutes: 5, autoCheck: "has_stripe", order: 2 },
  { id: "co-setup-booking", phase: 1, phaseTitle: "Get Operational", title: "Set up your booking calendar", description: "Configure your available days, hours, and session length in Calls > Settings. One link replaces all the scheduling tools.", category: "foundation", aiCapability: "manual", requiredPlan: "free", estimatedMinutes: 5, order: 3 },
  { id: "co-share-booking", phase: 1, phaseTitle: "Get Operational", title: "Share your booking link", description: "Copy your booking link from the Calls page. Add it to your email signature, social bios, and anywhere new clients find you.", category: "foundation", aiCapability: "manual", requiredPlan: "free", estimatedMinutes: 10, order: 4 },
  { id: "co-methodology", phase: 1, phaseTitle: "Get Operational", title: "Build your coaching framework", description: "AI helps you create a named 4-6 phase framework that maps the client journey from problem to transformation. Makes it easier to sell and deliver.", category: "foundation", aiCapability: "draft", requiredPlan: "free", estimatedMinutes: 25, order: 5 },

  // Phase 2: Proof & Credibility
  { id: "co-review-site", phase: 2, phaseTitle: "Proof & Credibility", title: "Update your site and packages", description: "Review your coaching packages, about page, and transformation messaging. AI drafted this during setup — make sure your voice and results come through.", category: "foundation", aiCapability: "manual", requiredPlan: "free", estimatedMinutes: 20, order: 6 },
  { id: "co-beta-sessions", phase: 2, phaseTitle: "Proof & Credibility", title: "Collect 3-5 client testimonials", description: "AI drafts the testimonial request messages. If you're newer, offer 3-5 comp sessions in exchange for honest feedback. Get specific results in writing.", category: "proof", aiCapability: "strategy", requiredPlan: "free", estimatedMinutes: 20, order: 7 },
  { id: "co-workshop-outline", phase: 2, phaseTitle: "Proof & Credibility", title: "Create a free workshop/masterclass outline", description: "45-60 minute workshop structure with a natural pitch at the end. AI outlines the content based on your methodology.", category: "proof", aiCapability: "draft", requiredPlan: "solo", estimatedMinutes: 25, order: 8 },
  { id: "co-lead-magnet", phase: 2, phaseTitle: "Proof & Credibility", title: "Create a lead magnet workbook", description: "Self-assessment or workbook for your coaching topic. AI generates the full content based on your framework.", category: "proof", aiCapability: "full", requiredPlan: "solo", estimatedMinutes: 25, order: 9 },
  { id: "co-video-script", phase: 2, phaseTitle: "Proof & Credibility", title: "Script a coaching session preview video", description: "2-3 minute video outline that shows your coaching style and gives a taste of the transformation.", category: "proof", aiCapability: "full", requiredPlan: "solo", estimatedMinutes: 15, order: 10 },

  // Phase 3: Audience Building
  { id: "co-first-proposal", phase: 3, phaseTitle: "Audience Building", title: "Send your first AI proposal", description: "After a discovery call, open the contact's profile and click 'Create Proposal'. AI generates a coaching package, timeline, and investment options.", category: "sales", aiCapability: "full", requiredPlan: "solo", estimatedMinutes: 15, order: 11 },
  { id: "co-content-calendar", phase: 3, phaseTitle: "Audience Building", title: "Create 30-day content calendar", description: "Mix of tips, transformation stories, myth-busting, and personal insights. 3-5 posts/week.", category: "marketing", aiCapability: "draft", requiredPlan: "solo", estimatedMinutes: 20, order: 12 },
  { id: "co-nurture-sequence", phase: 3, phaseTitle: "Audience Building", title: "Write 5-email nurture sequence", description: "For lead magnet subscribers: welcome → quick win → your story → case study → invitation to call.", category: "marketing", aiCapability: "full", requiredPlan: "solo", estimatedMinutes: 20, order: 13 },
  { id: "co-micro-coaching", phase: 3, phaseTitle: "Audience Building", title: "Create 10-15 micro-coaching social posts", description: "One actionable tip per post. Demonstrates expertise and gives followers real value.", category: "marketing", aiCapability: "full", requiredPlan: "solo", estimatedMinutes: 15, order: 14 },
  { id: "co-referral-partnerships", phase: 3, phaseTitle: "Audience Building", title: "Set up referral partnerships", description: "AI writes outreach emails for complementary providers (therapists, trainers, mentors) proposing mutual referrals.", category: "marketing", aiCapability: "full", requiredPlan: "solo", estimatedMinutes: 15, order: 15 },
  { id: "co-review-pipeline", phase: 3, phaseTitle: "Audience Building", title: "Review your sales pipeline", description: "Check the Pipeline page to see where discovery calls are turning into paid clients — and where they're not.", category: "sales", aiCapability: "manual", requiredPlan: "solo", estimatedMinutes: 5, order: 16 },

  // Phase 4: Discovery Call Machine
  { id: "co-booking-copy", phase: 4, phaseTitle: "Discovery Call Machine", title: "Write discovery call booking page copy", description: "Qualifying copy: 'This is for you if...' and 'This isn't for you if...' plus what to expect on the call.", category: "sales", aiCapability: "full", requiredPlan: "solo", estimatedMinutes: 15, order: 17 },
  { id: "co-pre-call-questionnaire", phase: 4, phaseTitle: "Discovery Call Machine", title: "Create pre-call questionnaire", description: "Goals, challenges, timeline, what they've tried, and investment readiness. Helps you prep and qualify.", category: "sales", aiCapability: "full", requiredPlan: "solo", estimatedMinutes: 15, order: 18 },
  { id: "co-discovery-script", phase: 4, phaseTitle: "Discovery Call Machine", title: "Build discovery call script", description: "Where are you now → Where do you want to be → What's in the way → How I help → Here's how we work together.", category: "sales", aiCapability: "full", requiredPlan: "solo", estimatedMinutes: 20, order: 19 },
  { id: "co-post-call-followup", phase: 4, phaseTitle: "Discovery Call Machine", title: "Create post-call follow-up sequence", description: "3 emails: session recap + resources, personal note, and final invitation to enroll.", category: "sales", aiCapability: "full", requiredPlan: "solo", estimatedMinutes: 15, order: 20 },

  // Phase 5: Retain & Scale
  { id: "co-welcome-packet", phase: 5, phaseTitle: "Retain & Scale", title: "Create client welcome packet", description: "Onboarding flow: what to expect, session prep guidelines, communication preferences, and goal-setting template.", category: "growth", aiCapability: "full", requiredPlan: "solo", estimatedMinutes: 20, order: 21 },
  { id: "co-session-templates", phase: 5, phaseTitle: "Retain & Scale", title: "Build session notes + progress templates", description: "Templates for tracking client progress, session notes, homework assignments, and milestone celebrations.", category: "growth", aiCapability: "full", requiredPlan: "scale", estimatedMinutes: 20, order: 22 },
  { id: "co-graduation", phase: 5, phaseTitle: "Retain & Scale", title: "Create graduation process", description: "Reflection exercise, testimonial request, referral ask, and alumni community/upsell invitation.", category: "growth", aiCapability: "full", requiredPlan: "solo", estimatedMinutes: 15, order: 23 },
  { id: "co-group-program", phase: 5, phaseTitle: "Retain & Scale", title: "Design group coaching program", description: "Structure, intake process, pricing, curriculum outline, and community guidelines for scaling beyond 1:1.", category: "growth", aiCapability: "draft", requiredPlan: "scale", estimatedMinutes: 25, order: 24 },
];

// ── AGENCY ── active agency with existing clients

const AGENCY_TASKS: ChecklistTask[] = [
  // Phase 1: Get Operational
  { id: "ag-import-clients", phase: 1, phaseTitle: "Get Operational", title: "Import your existing clients", description: "Add current and past clients to the CRM. Go to Contacts — capture the company, main contact, and what services you provide them.", category: "foundation", aiCapability: "manual", requiredPlan: "free", estimatedMinutes: 15, order: 1 },
  { id: "ag-verify-stripe", phase: 1, phaseTitle: "Get Operational", title: "Connect Stripe payments", description: "Link Stripe so you can send and collect invoices through Kovra. Handles one-time and retainer billing.", category: "foundation", aiCapability: "manual", requiredPlan: "free", estimatedMinutes: 5, autoCheck: "has_stripe", order: 2 },
  { id: "ag-setup-booking", phase: 1, phaseTitle: "Get Operational", title: "Set up your booking calendar", description: "Configure availability in Calls > Settings. Share one link for new business calls instead of the back-and-forth.", category: "foundation", aiCapability: "manual", requiredPlan: "free", estimatedMinutes: 5, order: 3 },
  { id: "ag-share-booking", phase: 1, phaseTitle: "Get Operational", title: "Share your agency booking link", description: "Copy your booking link from the Calls page. Add it to your site, email signature, and anywhere prospects reach you.", category: "foundation", aiCapability: "manual", requiredPlan: "free", estimatedMinutes: 10, order: 4 },
  { id: "ag-case-studies", phase: 1, phaseTitle: "Get Operational", title: "Document 3 client case studies", description: "Turn past work into portfolio proof. AI generates the brief — just give it the client's problem, your approach, and the result. Takes about 10 minutes per case study.", category: "foundation", aiCapability: "full", requiredPlan: "free", estimatedMinutes: 25, order: 5 },

  // Phase 2: Portfolio & Proof
  { id: "ag-review-site", phase: 2, phaseTitle: "Portfolio & Proof", title: "Update your site and positioning", description: "Review your service descriptions, team page, and case studies. AI drafted this during setup — refine it to match how you actually pitch.", category: "foundation", aiCapability: "manual", requiredPlan: "free", estimatedMinutes: 20, order: 6 },
  { id: "ag-spec-audit", phase: 2, phaseTitle: "Portfolio & Proof", title: "Produce a free audit for a dream client", description: "AI helps you create a speculative audit/analysis for a target prospect. Shows what you can do before they hire you.", category: "proof", aiCapability: "draft", requiredPlan: "solo", estimatedMinutes: 35, order: 7 },
  { id: "ag-capabilities-deck", phase: 2, phaseTitle: "Portfolio & Proof", title: "Build a capabilities deck/PDF", description: "Slide-by-slide copy for a downloadable agency overview: who we are, what we do, case studies, process, team.", category: "proof", aiCapability: "draft", requiredPlan: "scale", estimatedMinutes: 30, order: 8 },
  { id: "ag-directory-profiles", phase: 2, phaseTitle: "Portfolio & Proof", title: "Set up agency directory profiles", description: "AI writes optimized profiles for Clutch, G2, DesignRush, and relevant industry directories.", category: "proof", aiCapability: "draft", requiredPlan: "solo", estimatedMinutes: 25, order: 9 },

  // Phase 3: Outreach & Pipeline
  { id: "ag-first-proposal", phase: 3, phaseTitle: "Outreach & Pipeline", title: "Send your first AI proposal", description: "Open a contact's profile and click 'Create Proposal'. AI generates scope of work, deliverables, timeline, and pricing from your notes.", category: "sales", aiCapability: "full", requiredPlan: "solo", estimatedMinutes: 15, order: 10 },
  { id: "ag-prospect-list", phase: 3, phaseTitle: "Outreach & Pipeline", title: "Build prospect list of 100 targets", description: "AI generates a prospecting playbook: where to find prospects, what signals to look for, and how to prioritize.", category: "outreach", aiCapability: "strategy", requiredPlan: "free", estimatedMinutes: 30, order: 11 },
  { id: "ag-cold-emails", phase: 3, phaseTitle: "Outreach & Pipeline", title: "Write cold outreach email templates", description: "3 email templates + 3 follow-ups each. Tailored to your agency's services and target market.", category: "outreach", aiCapability: "full", requiredPlan: "solo", estimatedMinutes: 20, order: 12 },
  { id: "ag-multi-channel", phase: 3, phaseTitle: "Outreach & Pipeline", title: "Create 21-day multi-channel sequence", description: "Coordinated email + LinkedIn + personalized video audit outreach over 21 days.", category: "outreach", aiCapability: "full", requiredPlan: "scale", estimatedMinutes: 30, order: 13 },
  { id: "ag-video-audits", phase: 3, phaseTitle: "Outreach & Pipeline", title: "Script personalized video audit pitches", description: "2-min video audit scripts you can record for individual prospects. AI customizes the structure per prospect type.", category: "outreach", aiCapability: "full", requiredPlan: "scale", estimatedMinutes: 20, order: 14 },
  { id: "ag-linkedin-content", phase: 3, phaseTitle: "Outreach & Pipeline", title: "Create LinkedIn authority content", description: "30-day content plan: insights, before/afters, hot takes, and agency wins. Builds credibility with prospects.", category: "outreach", aiCapability: "draft", requiredPlan: "solo", estimatedMinutes: 20, order: 15 },
  { id: "ag-review-pipeline", phase: 3, phaseTitle: "Outreach & Pipeline", title: "Review your sales pipeline", description: "Open the Pipeline page to see your deals by stage. Track total value in play and where proposals stall.", category: "sales", aiCapability: "manual", requiredPlan: "solo", estimatedMinutes: 5, order: 16 },

  // Phase 4: Close & Deliver
  { id: "ag-discovery-script", phase: 4, phaseTitle: "Close & Deliver", title: "Build agency discovery call script", description: "Qualify budget, timeline, decision-makers, and current state. Map their needs to your service packages.", category: "sales", aiCapability: "full", requiredPlan: "solo", estimatedMinutes: 20, order: 17 },
  { id: "ag-proposal-template", phase: 4, phaseTitle: "Close & Deliver", title: "Create agency proposal template", description: "Strategy overview, scope of work, timeline, deliverables, and 3-tier pricing. Ready to customize per client.", category: "sales", aiCapability: "full", requiredPlan: "solo", estimatedMinutes: 25, order: 18 },
  { id: "ag-msa", phase: 4, phaseTitle: "Close & Deliver", title: "Write MSA (Master Service Agreement)", description: "Scope, fees, payment terms, IP ownership, confidentiality, liability, and termination clauses.", category: "sales", aiCapability: "full", requiredPlan: "scale", estimatedMinutes: 30, order: 19 },
  { id: "ag-onboarding-docs", phase: 4, phaseTitle: "Close & Deliver", title: "Create client onboarding docs", description: "Brand questionnaire, access/logins checklist, kickoff meeting agenda, and communication guidelines.", category: "sales", aiCapability: "full", requiredPlan: "solo", estimatedMinutes: 20, order: 20 },
  { id: "ag-objection-scripts", phase: 4, phaseTitle: "Close & Deliver", title: "Build objection-handling scripts", description: "Top objections for agencies (price, 'we'll do it in-house', timing) with proven reframe responses.", category: "sales", aiCapability: "full", requiredPlan: "solo", estimatedMinutes: 15, order: 21 },

  // Phase 5: Systems & Scale
  { id: "ag-sops", phase: 5, phaseTitle: "Systems & Scale", title: "Create SOPs for core service delivery", description: "Step-by-step processes with quality checkpoints for your agency's main offerings.", category: "growth", aiCapability: "draft", requiredPlan: "scale", estimatedMinutes: 30, order: 22 },
  { id: "ag-pm-workflows", phase: 5, phaseTitle: "Systems & Scale", title: "Set up project management workflows", description: "AI generates workflow templates for your services: task lists, milestones, and handoff points.", category: "growth", aiCapability: "strategy", requiredPlan: "scale", estimatedMinutes: 25, order: 23 },
  { id: "ag-case-study-pipeline", phase: 5, phaseTitle: "Systems & Scale", title: "Build case study creation pipeline", description: "Results collection template + narrative writing template. Turn every client win into marketing.", category: "growth", aiCapability: "full", requiredPlan: "solo", estimatedMinutes: 20, order: 24 },
  { id: "ag-referral-program", phase: 5, phaseTitle: "Systems & Scale", title: "Create referral program", description: "Structure, incentives, and announcement emails. AI designs the program based on your services and pricing.", category: "growth", aiCapability: "full", requiredPlan: "solo", estimatedMinutes: 15, order: 25 },
];

// ── Lookup ──

const CHECKLIST_MAP: Record<string, ChecklistTask[]> = {
  freelance: FREELANCE_TASKS,
  consulting: CONSULTING_TASKS,
  coaching: COACHING_TASKS,
  agency: AGENCY_TASKS,
};

export function getChecklistForSubtype(
  subtype: string,
  opts: { hasExistingWebsite?: boolean; persona?: "grinder" | "operator" | "scaler" | null } = {}
): ChecklistTask[] {
  const base = CHECKLIST_MAP[subtype] || FREELANCE_TASKS;
  let tasks = [...base];

  // If user has an existing website, the site review task is irrelevant.
  if (opts.hasExistingWebsite) {
    tasks = tasks.filter((t) => !t.id.endsWith("-review-site"));
  }

  // Persona-aware Phase 1 reordering:
  // Grinder: hasn't built their pipeline yet — lead-gen tasks come first in Phase 1.
  // Operator / Scaler: already have clients — import + Stripe comes first (default order).
  if (opts.persona === "grinder") {
    tasks = tasks.map((t) => {
      if (t.phase !== 1) return t;
      // Deprioritize "import clients" (they don't have many yet) — move to order 4
      if (t.id.endsWith("-import-clients")) return { ...t, order: 4 };
      // Prioritize site review / update at order 1 (their site is their calling card)
      if (t.id.endsWith("-review-site")) return { ...t, order: 1 };
      // Stripe at 2, booking at 3
      if (t.autoCheck === "has_stripe") return { ...t, order: 2 };
      if (t.id.endsWith("-setup-booking")) return { ...t, order: 3 };
      if (t.id.endsWith("-share-booking")) return { ...t, order: 5 };
      return t;
    });
  }

  return tasks;
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
