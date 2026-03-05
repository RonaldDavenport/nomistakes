// Credit system — check, deduct, refill, purchase packs

import { createServerClient } from "@/lib/supabase";

// Credit costs per action
export const CREDIT_COSTS: Record<string, number> = {
  blog_post: 5,
  blog_seo_optimize: 1,
  ad_copy: 3,
  ad_image: 2,
  ad_image_set: 8,
  ugc_script: 3,
  ugc_video: 15,
  competitor_analysis: 5,
  product_research: 5,
  site_update_major: 5,
  site_update_minor: 1,
  email_sequence: 8,
  single_email: 2,
  weekly_report: 3,
  product_description: 1,
  product_description_batch: 5,
  logo_regen: 5,
  seo_audit: 5,
  push_campaign: 1,
  proposal_generation: 10,
  email_send: 1,
  email_template_generate: 3,
  // Active Business OS actions
  outreach: 1,       // per lead DM or cold email sent
  ad_variant: 5,     // image + copy combined (new ad generation)
  seo_cluster: 50,   // 10-post SEO cluster
};

// Monthly credit allocations per plan
export const PLAN_CREDITS: Record<string, number> = {
  free: 0,
  starter: 500,
  growth: 2500,
  pro: 1000,
};

// Credit packs available for purchase
export const CREDIT_PACKS = [
  { id: "small", credits: 50, priceCents: 499, label: "50 Credits" },
  { id: "medium", credits: 120, priceCents: 999, label: "120 Credits" },
  { id: "large", credits: 300, priceCents: 1999, label: "300 Credits" },
] as const;

export class InsufficientCreditsError extends Error {
  required: number;
  available: number;

  constructor(required: number, available: number) {
    super(`Insufficient credits: need ${required}, have ${available}`);
    this.name = "InsufficientCreditsError";
    this.required = required;
    this.available = available;
  }
}

// Get or create credit balance for a user + business
export async function getCredits(userId: string, businessId: string): Promise<number> {
  const db = createServerClient();

  const { data } = await db
    .from("credit_balances")
    .select("balance")
    .eq("user_id", userId)
    .eq("business_id", businessId)
    .maybeSingle();

  if (!data) {
    // Auto-create a balance row with 0 credits
    const { data: newRow } = await db
      .from("credit_balances")
      .insert({ user_id: userId, business_id: businessId, balance: 0 })
      .select("balance")
      .single();
    return newRow?.balance ?? 0;
  }

  return data.balance;
}

// Check if user has enough credits (throws InsufficientCreditsError if not)
export async function requireCredits(userId: string, businessId: string, cost: number): Promise<number> {
  const balance = await getCredits(userId, businessId);
  if (balance < cost) {
    throw new InsufficientCreditsError(cost, balance);
  }
  return balance;
}

// Deduct credits and log the transaction
export async function deductCredits(
  userId: string,
  businessId: string,
  amount: number,
  action: string,
  metadata: Record<string, unknown> = {}
): Promise<number> {
  const db = createServerClient();

  // Atomic decrement via RPC would be ideal, but for now we do read+write
  const balance = await requireCredits(userId, businessId, amount);
  const newBalance = balance - amount;

  await db
    .from("credit_balances")
    .update({
      balance: newBalance,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", userId)
    .eq("business_id", businessId);

  // Log the transaction
  await db.from("credit_transactions").insert({
    user_id: userId,
    business_id: businessId,
    amount: -amount,
    balance_after: newBalance,
    type: "action_spend",
    action,
    metadata,
  });

  return newBalance;
}

// Add credits (for refills, pack purchases, bonuses)
export async function addCredits(
  userId: string,
  businessId: string,
  amount: number,
  type: "subscription_refill" | "pack_purchase" | "bonus" | "refund",
  metadata: Record<string, unknown> = {}
): Promise<number> {
  const db = createServerClient();

  // Ensure balance row exists
  const current = await getCredits(userId, businessId);
  const newBalance = type === "subscription_refill" ? amount : current + amount; // refill resets, others add

  await db
    .from("credit_balances")
    .update({
      balance: newBalance,
      last_refill_at: type === "subscription_refill" ? new Date().toISOString() : undefined,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", userId)
    .eq("business_id", businessId);

  // Log transaction
  await db.from("credit_transactions").insert({
    user_id: userId,
    business_id: businessId,
    amount,
    balance_after: newBalance,
    type,
    metadata,
    stripe_payment_intent_id: (metadata.stripe_payment_intent_id as string) || null,
  });

  return newBalance;
}

// Grant one-time launch credits to a new free user (15 credits, never repeats).
// Guard: only fires when lifetime_earned is 0 on the balance row.
export async function grantLaunchCredits(userId: string, businessId: string): Promise<void> {
  const db = createServerClient();

  const { data: balance } = await db
    .from("credit_balances")
    .select("lifetime_earned")
    .eq("user_id", userId)
    .eq("business_id", businessId)
    .maybeSingle();

  // If no row yet or lifetime_earned is 0, grant the one-time 15-credit bonus
  if (!balance || balance.lifetime_earned === 0) {
    await addCredits(userId, businessId, 15, "bonus", { reason: "launch_grant" });
  }
}

// Refill credits for all businesses owned by a user (monthly subscription refill)
export async function refillCreditsForUser(userId: string, planId: string): Promise<void> {
  const credits = PLAN_CREDITS[planId] || 0;
  if (credits === 0) return;

  const db = createServerClient();

  // Get all businesses for this user
  const { data: businesses } = await db
    .from("businesses")
    .select("id")
    .eq("user_id", userId);

  if (!businesses || businesses.length === 0) return;

  for (const biz of businesses) {
    await addCredits(userId, biz.id, credits, "subscription_refill", { plan: planId });
  }
}

// Get recent transactions for display
export async function getTransactionHistory(
  userId: string,
  businessId: string,
  limit = 20
) {
  const db = createServerClient();

  const { data, error } = await db
    .from("credit_transactions")
    .select("*")
    .eq("user_id", userId)
    .eq("business_id", businessId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data || [];
}
