// Analytics event tracking — provider-agnostic layer
// Works with Mixpanel, GA4, PostHog, or any provider via the push pattern.
// Events are queued if no provider is initialized yet.

type EventProperties = Record<string, string | number | boolean | null | undefined>;

interface AnalyticsProvider {
  track: (event: string, properties?: EventProperties) => void;
  identify: (userId: string, traits?: EventProperties) => void;
  reset: () => void;
}

const providers: AnalyticsProvider[] = [];
const queue: Array<{ type: "track" | "identify" | "reset"; args: unknown[] }> = [];
let identified = false;

/** Register an analytics provider (Mixpanel, GA4, PostHog, etc.) */
export function registerProvider(provider: AnalyticsProvider) {
  providers.push(provider);
  // Flush queued events
  for (const item of queue) {
    if (item.type === "track") {
      const [event, props] = item.args as [string, EventProperties?];
      provider.track(event, props);
    } else if (item.type === "identify") {
      const [userId, traits] = item.args as [string, EventProperties?];
      provider.identify(userId, traits);
    } else if (item.type === "reset") {
      provider.reset();
    }
  }
  queue.length = 0;
}

/** Identify a user across all providers */
export function identify(userId: string, traits?: EventProperties) {
  identified = true;
  if (providers.length === 0) {
    queue.push({ type: "identify", args: [userId, traits] });
    return;
  }
  for (const p of providers) p.identify(userId, traits);
}

/** Reset identity (on logout) */
export function resetIdentity() {
  identified = false;
  if (providers.length === 0) {
    queue.push({ type: "reset", args: [] });
    return;
  }
  for (const p of providers) p.reset();
}

/** Track an event across all providers */
function track(event: string, properties?: EventProperties) {
  if (providers.length === 0) {
    queue.push({ type: "track", args: [event, properties] });
    return;
  }
  for (const p of providers) p.track(event, properties);
}

// ---------------------------------------------------------------------------
// Landing Page
// ---------------------------------------------------------------------------

export function trackLandingCTA(location: string) {
  track("landing_cta_clicked", { location });
}

export function trackLandingFeatureTab(tab: string) {
  track("landing_feature_tab_viewed", { tab });
}

export function trackLandingFAQOpen(question: string) {
  track("landing_faq_opened", { question });
}

export function trackLandingPricingView() {
  track("landing_pricing_viewed");
}

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------

export function trackSignupStart(method: "email" | "google") {
  track("signup_started", { method });
}

export function trackSignupComplete(method: "email" | "google") {
  track("signup_completed", { method });
}

export function trackSignupError(method: "email" | "google", error: string) {
  track("signup_error", { method, error });
}

export function trackLogin(method: "email" | "google") {
  track("login_completed", { method });
}

export function trackLoginError(method: "email" | "google", error: string) {
  track("login_error", { method, error });
}

export function trackLogout() {
  track("logout");
  resetIdentity();
}

export function trackForgotPassword() {
  track("forgot_password_requested");
}

// ---------------------------------------------------------------------------
// Wizard
// ---------------------------------------------------------------------------

export function trackWizardStep(step: string, data?: EventProperties) {
  track("wizard_step_viewed", { step, ...data });
}

export function trackWizardSkillToggle(skillId: string, selected: boolean) {
  track("wizard_skill_toggled", { skill_id: skillId, selected });
}

export function trackWizardTypeSelect(typeId: string) {
  track("wizard_type_selected", { type_id: typeId });
}

export function trackWizardSubtypeSelect(subtypeId: string) {
  track("wizard_subtype_selected", { subtype_id: subtypeId });
}

export function trackWizardBudgetSelect(budgetId: string) {
  track("wizard_budget_selected", { budget_id: budgetId });
}

export function trackWizardTimeSelect(timeId: string) {
  track("wizard_time_selected", { time_id: timeId });
}

export function trackWizardConceptsGenerated(count: number) {
  track("wizard_concepts_generated", { count });
}

export function trackWizardConceptPicked(conceptName: string) {
  track("wizard_concept_picked", { concept_name: conceptName });
}

export function trackWizardBuildStarted() {
  track("wizard_build_started");
}

export function trackWizardBuildComplete(businessId: string, buildTimeSec: number) {
  track("wizard_build_complete", { business_id: businessId, build_time_sec: buildTimeSec });
}

export function trackWizardBack(fromStep: string) {
  track("wizard_back_clicked", { from_step: fromStep });
}

// ---------------------------------------------------------------------------
// Onboarding
// ---------------------------------------------------------------------------

export function trackOnboardingStep(step: number, stepName: string) {
  track("onboarding_step_viewed", { step, step_name: stepName });
}

export function trackOnboardingStepComplete(step: number, stepName: string) {
  track("onboarding_step_completed", { step, step_name: stepName });
}

export function trackOnboardingSkip(step: number, stepName: string) {
  track("onboarding_step_skipped", { step, step_name: stepName });
}

export function trackOnboardingNameEdit(source: "manual" | "ai_suggestion") {
  track("onboarding_name_edited", { source });
}

export function trackOnboardingAINames() {
  track("onboarding_ai_names_requested");
}

export function trackOnboardingLayoutSelect(layout: string) {
  track("onboarding_layout_selected", { layout });
}

export function trackOnboardingColorSelect(colorPreset: string) {
  track("onboarding_color_selected", { color_preset: colorPreset });
}

export function trackOnboardingStripeConnect() {
  track("onboarding_stripe_connect_started");
}

export function trackOnboardingComplete(businessId: string) {
  track("onboarding_completed", { business_id: businessId });
}

// ---------------------------------------------------------------------------
// Dashboard
// ---------------------------------------------------------------------------

export function trackDashboardView(businessId: string) {
  track("dashboard_viewed", { business_id: businessId });
}

export function trackNavClick(page: string) {
  track("nav_clicked", { page });
}

export function trackTaskComplete(taskId: string, phase: number) {
  track("task_completed", { task_id: taskId, phase });
}

export function trackTaskSkip(taskId: string, phase: number) {
  track("task_skipped", { task_id: taskId, phase });
}

export function trackTaskUndo(taskId: string) {
  track("task_undo", { task_id: taskId });
}

export function trackPhaseComplete(phase: number) {
  track("phase_completed", { phase });
}

// ---------------------------------------------------------------------------
// AI Chat
// ---------------------------------------------------------------------------

export function trackChatMessageSent(businessId: string, messageLength: number) {
  track("chat_message_sent", { business_id: businessId, message_length: messageLength });
}

export function trackChatSuggestionClicked(suggestion: string) {
  track("chat_suggestion_clicked", { suggestion });
}

export function trackChatError(error: string) {
  track("chat_error", { error });
}

// ---------------------------------------------------------------------------
// Site Editor
// ---------------------------------------------------------------------------

export function trackEditorOpen(businessId: string) {
  track("editor_opened", { business_id: businessId });
}

export function trackEditorSectionSelect(section: string) {
  track("editor_section_selected", { section });
}

export function trackEditorFieldEdit(section: string, field: string) {
  track("editor_field_edited", { section, field });
}

export function trackEditorUndo() {
  track("editor_undo");
}

export function trackEditorViewLive(businessId: string) {
  track("editor_view_live", { business_id: businessId });
}

export function trackEditorAIEdit(prompt: string) {
  track("editor_ai_edit", { prompt_length: prompt.length });
}

// ---------------------------------------------------------------------------
// Content (Blog)
// ---------------------------------------------------------------------------

export function trackBlogGenerate(businessId: string) {
  track("blog_generate_started", { business_id: businessId });
}

export function trackBlogPublish(businessId: string, postId: string) {
  track("blog_post_published", { business_id: businessId, post_id: postId });
}

// ---------------------------------------------------------------------------
// Ads & UGC
// ---------------------------------------------------------------------------

export function trackAdGenerate(businessId: string, platform: string) {
  track("ad_generate_started", { business_id: businessId, platform });
}

export function trackUGCGenerate(businessId: string) {
  track("ugc_generate_started", { business_id: businessId });
}

// ---------------------------------------------------------------------------
// SEO
// ---------------------------------------------------------------------------

export function trackSEOAuditRun(businessId: string) {
  track("seo_audit_started", { business_id: businessId });
}

export function trackSEOAuditComplete(businessId: string, score: number) {
  track("seo_audit_completed", { business_id: businessId, score });
}

// ---------------------------------------------------------------------------
// Email Sequences
// ---------------------------------------------------------------------------

export function trackEmailSequenceGenerate(businessId: string) {
  track("email_sequence_generate_started", { business_id: businessId });
}

// ---------------------------------------------------------------------------
// Competitors
// ---------------------------------------------------------------------------

export function trackCompetitorAnalyze(businessId: string, competitorUrl: string) {
  track("competitor_analyze_started", { business_id: businessId, competitor_url: competitorUrl });
}

// ---------------------------------------------------------------------------
// Reports
// ---------------------------------------------------------------------------

export function trackReportGenerate(businessId: string) {
  track("report_generate_started", { business_id: businessId });
}

// ---------------------------------------------------------------------------
// Paywall & Upgrades
// ---------------------------------------------------------------------------

export function trackPaywallView(requiredPlan: string, page: string) {
  track("paywall_viewed", { required_plan: requiredPlan, page });
}

export function trackUpgradeClick(plan: string, source: string) {
  track("upgrade_clicked", { plan, source });
}

export function trackUpgradeComplete(plan: string) {
  track("upgrade_completed", { plan });
}

export function trackUpgradeError(plan: string, error: string) {
  track("upgrade_error", { plan, error });
}

// ---------------------------------------------------------------------------
// Credits
// ---------------------------------------------------------------------------

export function trackCreditPurchase(amount: number) {
  track("credit_purchase_started", { amount });
}

export function trackCreditUsed(action: string, cost: number) {
  track("credit_used", { action, cost });
}

// ---------------------------------------------------------------------------
// Site Deploy
// ---------------------------------------------------------------------------

export function trackSiteDeploy(businessId: string) {
  track("site_deploy_started", { business_id: businessId });
}

export function trackSiteDeployComplete(businessId: string, url: string) {
  track("site_deploy_completed", { business_id: businessId, url });
}

// ---------------------------------------------------------------------------
// Settings
// ---------------------------------------------------------------------------

export function trackDomainConnect(businessId: string) {
  track("domain_connect_started", { business_id: businessId });
}

// ---------------------------------------------------------------------------
// GA4 provider (using gtag)
// ---------------------------------------------------------------------------

export function createGA4Provider(): AnalyticsProvider | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as { gtag?: (...args: unknown[]) => void };
  if (!w.gtag) return null;
  return {
    track: (event, properties) => w.gtag!("event", event, properties),
    identify: (userId) => w.gtag!("config", "GA_MEASUREMENT_ID", { user_id: userId }),
    reset: () => {},
  };
}

// ---------------------------------------------------------------------------
// Mixpanel provider
// ---------------------------------------------------------------------------

export function createMixpanelProvider(): AnalyticsProvider | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as { mixpanel?: { track: (e: string, p?: EventProperties) => void; identify: (id: string) => void; people: { set: (t: EventProperties) => void }; reset: () => void } };
  if (!w.mixpanel) return null;
  return {
    track: (event, properties) => w.mixpanel!.track(event, properties),
    identify: (userId, traits) => {
      w.mixpanel!.identify(userId);
      if (traits) w.mixpanel!.people.set(traits);
    },
    reset: () => w.mixpanel!.reset(),
  };
}

// ---------------------------------------------------------------------------
// Console provider (dev mode logging)
// ---------------------------------------------------------------------------

export function createConsoleProvider(): AnalyticsProvider {
  return {
    track: (event, properties) => {
      if (process.env.NODE_ENV === "development") {
        console.log(`[Analytics] ${event}`, properties || "");
      }
    },
    identify: (userId, traits) => {
      if (process.env.NODE_ENV === "development") {
        console.log(`[Analytics] identify: ${userId}`, traits || "");
      }
    },
    reset: () => {
      if (process.env.NODE_ENV === "development") {
        console.log("[Analytics] reset");
      }
    },
  };
}
