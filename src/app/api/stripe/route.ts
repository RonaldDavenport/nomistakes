import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import {
  createConnectedAccount,
  getAccountStatus,
  createCheckoutSession,
  getStripeDashboardLink,
  isStripeConfigured,
} from "@/lib/stripe";

// POST /api/stripe — Handle various Stripe operations
export async function POST(req: Request) {
  try {
    if (!isStripeConfigured()) {
      return NextResponse.json(
        { error: "Stripe not configured. Set STRIPE_SECRET_KEY env variable." },
        { status: 503 }
      );
    }

    const body = await req.json();
    const { action } = body;

    switch (action) {
      case "connect":
        return handleConnect(body);
      case "status":
        return handleStatus(body);
      case "checkout":
        return handleCheckout(body);
      case "dashboard":
        return handleDashboard(body);
      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (err) {
    console.error("[stripe] Error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Stripe operation failed" },
      { status: 500 }
    );
  }
}

// Create a Stripe Connect account for a business
async function handleConnect(body: { businessId: string; userId: string }) {
  const { businessId, userId } = body;
  const db = createServerClient();

  const { data: business } = await db
    .from("businesses")
    .select("*")
    .eq("id", businessId)
    .single();

  if (!business || (userId && business.user_id !== userId)) {
    return NextResponse.json({ error: "Business not found" }, { status: 404 });
  }

  // Check if already connected
  if (business.stripe_account_id) {
    const status = await getAccountStatus(business.stripe_account_id);
    if (status.detailsSubmitted) {
      return NextResponse.json({
        alreadyConnected: true,
        accountId: business.stripe_account_id,
        status,
      });
    }
  }

  // Get user email
  const { data: profile } = await db
    .from("profiles")
    .select("email")
    .eq("id", business.user_id)
    .single();

  const result = await createConnectedAccount(
    business.name,
    profile?.email || ""
  );

  // Save account ID to business
  await db
    .from("businesses")
    .update({ stripe_account_id: result.accountId })
    .eq("id", businessId);

  return NextResponse.json({
    accountId: result.accountId,
    url: result.onboardingUrl,
  });
}

// Check Stripe Connect account status
async function handleStatus(body: { businessId: string }) {
  const db = createServerClient();

  const { data: business } = await db
    .from("businesses")
    .select("stripe_account_id")
    .eq("id", body.businessId)
    .single();

  if (!business?.stripe_account_id) {
    return NextResponse.json({ connected: false });
  }

  const status = await getAccountStatus(business.stripe_account_id);
  return NextResponse.json({ connected: true, ...status });
}

// Create a checkout session for a product purchase
async function handleCheckout(body: {
  businessId: string;
  items: { name: string; description?: string; priceInCents: number; quantity: number }[];
  successUrl: string;
  cancelUrl: string;
}) {
  const db = createServerClient();

  const { data: business } = await db
    .from("businesses")
    .select("stripe_account_id")
    .eq("id", body.businessId)
    .single();

  if (!business?.stripe_account_id) {
    return NextResponse.json(
      { error: "Business has no Stripe account connected" },
      { status: 400 }
    );
  }

  const result = await createCheckoutSession(
    business.stripe_account_id,
    body.items,
    body.successUrl,
    body.cancelUrl
  );

  return NextResponse.json(result);
}

// Get Stripe dashboard link for the business owner
async function handleDashboard(body: { businessId: string; userId: string }) {
  const db = createServerClient();

  const { data: business } = await db
    .from("businesses")
    .select("stripe_account_id, user_id")
    .eq("id", body.businessId)
    .single();

  if (!business?.stripe_account_id) {
    return NextResponse.json({ error: "No Stripe account" }, { status: 400 });
  }

  if (body.userId && business.user_id !== body.userId) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  const url = await getStripeDashboardLink(business.stripe_account_id);
  return NextResponse.json({ url });
}
