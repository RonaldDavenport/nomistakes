// Stripe Connect integration for No Mistakes platform
// Each generated business gets a Stripe Connected Account
// We take a platform fee on every transaction

import Stripe from "stripe";

// Lazy-initialize Stripe so the build doesn't crash when the env var is missing
let _stripe: Stripe | null = null;
function getStripe(): Stripe {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) throw new Error("STRIPE_SECRET_KEY is not set");
    _stripe = new Stripe(key);
  }
  return _stripe;
}

// Platform fee percentage (e.g., 0.05 = 5%)
const PLATFORM_FEE_PERCENT = 0.05;

// Create a Stripe Connect account for a new business
export async function createConnectedAccount(
  businessName: string,
  email: string
): Promise<{ accountId: string; onboardingUrl: string }> {
  // Create Express connected account
  const account = await getStripe().accounts.create({
    type: "express",
    business_type: "individual",
    business_profile: {
      name: businessName,
    },
    capabilities: {
      card_payments: { requested: true },
      transfers: { requested: true },
    },
  });

  // Create onboarding link
  const accountLink = await getStripe().accountLinks.create({
    account: account.id,
    refresh_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?stripe=refresh`,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?stripe=success`,
    type: "account_onboarding",
  });

  return {
    accountId: account.id,
    onboardingUrl: accountLink.url,
  };
}

// Check if a connected account has completed onboarding
export async function getAccountStatus(accountId: string): Promise<{
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
  detailsSubmitted: boolean;
}> {
  const account = await getStripe().accounts.retrieve(accountId);
  return {
    chargesEnabled: account.charges_enabled,
    payoutsEnabled: account.payouts_enabled,
    detailsSubmitted: account.details_submitted,
  };
}

// Create a Stripe Checkout session for a product/service purchase
// Payment goes to the connected account, platform takes a fee
export async function createCheckoutSession(
  connectedAccountId: string,
  items: {
    name: string;
    description?: string;
    priceInCents: number;
    quantity: number;
  }[],
  successUrl: string,
  cancelUrl: string
): Promise<{ sessionId: string; url: string }> {
  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = items.map((item) => ({
    price_data: {
      currency: "usd",
      product_data: {
        name: item.name,
        description: item.description,
      },
      unit_amount: item.priceInCents,
    },
    quantity: item.quantity,
  }));

  const totalAmount = items.reduce((sum, item) => sum + item.priceInCents * item.quantity, 0);
  const platformFee = Math.round(totalAmount * PLATFORM_FEE_PERCENT);

  const session = await getStripe().checkout.sessions.create(
    {
      mode: "payment",
      line_items: lineItems,
      payment_intent_data: {
        application_fee_amount: platformFee,
      },
      success_url: successUrl,
      cancel_url: cancelUrl,
    },
    {
      stripeAccount: connectedAccountId,
    }
  );

  return {
    sessionId: session.id,
    url: session.url || "",
  };
}

// Create a subscription checkout (for recurring services)
export async function createSubscriptionCheckout(
  connectedAccountId: string,
  productName: string,
  priceInCents: number,
  interval: "month" | "year",
  successUrl: string,
  cancelUrl: string
): Promise<{ sessionId: string; url: string }> {
  const session = await getStripe().checkout.sessions.create(
    {
      mode: "subscription",
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: { name: productName },
            unit_amount: priceInCents,
            recurring: { interval },
          },
          quantity: 1,
        },
      ],
      subscription_data: {
        application_fee_percent: PLATFORM_FEE_PERCENT * 100,
      },
      success_url: successUrl,
      cancel_url: cancelUrl,
    },
    {
      stripeAccount: connectedAccountId,
    }
  );

  return {
    sessionId: session.id,
    url: session.url || "",
  };
}

// Get dashboard login link for a connected account
export async function getStripeDashboardLink(accountId: string): Promise<string> {
  const loginLink = await getStripe().accounts.createLoginLink(accountId);
  return loginLink.url;
}

// Check if Stripe is configured
export function isStripeConfigured(): boolean {
  return !!process.env.STRIPE_SECRET_KEY;
}
