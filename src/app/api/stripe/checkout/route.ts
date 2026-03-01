import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

export const runtime = "nodejs";

const VALID_PLANS = ["starter", "growth", "pro"] as const;
type PaidPlan = (typeof VALID_PLANS)[number];

function getPriceId(planId: PaidPlan): string | undefined {
  const map: Record<PaidPlan, string | undefined> = {
    starter: process.env.STRIPE_STARTER_PRICE_ID,
    growth: process.env.STRIPE_GROWTH_PRICE_ID,
    pro: process.env.STRIPE_PRO_PRICE_ID,
  };
  return map[planId];
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { planId, userId, email } = body as {
      planId: string;
      userId: string;
      email: string;
    };

    // Validate inputs
    if (!planId || !userId || !email) {
      return NextResponse.json(
        { error: "Missing required fields: planId, userId, email" },
        { status: 400 },
      );
    }

    if (!VALID_PLANS.includes(planId as PaidPlan)) {
      return NextResponse.json(
        { error: `Invalid plan: ${planId}. Must be one of: ${VALID_PLANS.join(", ")}` },
        { status: 400 },
      );
    }

    const priceId = getPriceId(planId as PaidPlan);
    if (!priceId) {
      return NextResponse.json(
        { error: `No Stripe price configured for plan: ${planId}` },
        { status: 500 },
      );
    }

    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
      return NextResponse.json(
        { error: "Stripe is not configured" },
        { status: 500 },
      );
    }

    const stripe = new Stripe(key);

    // Determine the origin for redirect URLs
    const origin =
      req.headers.get("origin") ||
      process.env.NEXT_PUBLIC_APP_URL ||
      "https://trynomistakes.com";

    // Create checkout session on the PLATFORM account (not connected accounts)
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer_email: email,
      line_items: [{ price: priceId, quantity: 1 }],
      metadata: { userId, planId },
      success_url: `${origin}/dashboard?upgraded=true`,
      cancel_url: `${origin}/dashboard?upgrade=cancelled`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Checkout session creation failed:", message);
    return NextResponse.json(
      { error: `Failed to create checkout session: ${message}` },
      { status: 500 },
    );
  }
}
