import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createServerClient } from "@/lib/supabase";

export const runtime = "nodejs";

const PRICE_TO_PLAN: Record<string, string> = {
  [process.env.STRIPE_STARTER_PRICE_ID as string]: "starter",
  [process.env.STRIPE_GROWTH_PRICE_ID as string]: "growth",
  [process.env.STRIPE_PRO_PRICE_ID as string]: "pro",
};

/**
 * POST /api/stripe/sync
 * Called after checkout success to verify subscription and update plan.
 * Fallback for when the webhook hasn't fired yet.
 */
export async function POST(req: NextRequest) {
  try {
    const { userId, email } = (await req.json()) as {
      userId: string;
      email: string;
    };

    if (!userId || !email) {
      return NextResponse.json(
        { error: "Missing userId or email" },
        { status: 400 },
      );
    }

    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
      return NextResponse.json(
        { error: "Stripe not configured" },
        { status: 500 },
      );
    }

    const stripe = new Stripe(key);

    // Find the customer by email
    const customers = await stripe.customers.list({ email, limit: 1 });
    if (customers.data.length === 0) {
      return NextResponse.json({ synced: false, reason: "no_customer" });
    }

    const customer = customers.data[0];

    // Get their active subscriptions
    const subscriptions = await stripe.subscriptions.list({
      customer: customer.id,
      status: "active",
      limit: 1,
    });

    if (subscriptions.data.length === 0) {
      // Also check trialing
      const trialing = await stripe.subscriptions.list({
        customer: customer.id,
        status: "trialing",
        limit: 1,
      });
      if (trialing.data.length === 0) {
        return NextResponse.json({ synced: false, reason: "no_subscription" });
      }
      subscriptions.data.push(trialing.data[0]);
    }

    const sub = subscriptions.data[0];
    const priceId = sub.items.data[0]?.price?.id;
    const plan = priceId ? PRICE_TO_PLAN[priceId] : null;

    if (!plan) {
      return NextResponse.json({
        synced: false,
        reason: "unknown_price",
        priceId,
      });
    }

    // Update the profile
    const supabase = createServerClient();
    const { error } = await supabase
      .from("profiles")
      .update({ plan, stripe_customer_id: customer.id })
      .eq("id", userId);

    if (error) {
      console.error("Stripe sync: failed to update profile:", error.message);
      return NextResponse.json(
        { error: "Failed to update profile" },
        { status: 500 },
      );
    }

    console.log(
      `Stripe sync: updated user ${userId} to plan=${plan}, customer=${customer.id}`,
    );
    return NextResponse.json({ synced: true, plan });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Stripe sync error:", message);
    return NextResponse.json(
      { error: `Sync failed: ${message}` },
      { status: 500 },
    );
  }
}
