import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import {
  createConnectedAccount,
  getAccountStatus,
  createCheckoutSession,
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
        return NextResponse.json({ error: "Use embedded components instead" }, { status: 410 });
      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (err: unknown) {
    const message = err && typeof err === "object" && "message" in err
      ? String((err as { message: unknown }).message)
      : "Stripe operation failed";
    console.error("[stripe] Error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
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

  if (!business) {
    return NextResponse.json({ error: "Business not found" }, { status: 404 });
  }

  // Only enforce ownership if business is already claimed
  if (userId && business.user_id && business.user_id !== userId) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
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
    // Account exists but onboarding not complete — return it so embedded component can continue
    return NextResponse.json({ accountId: business.stripe_account_id });
  }

  // Get user email (try from profiles, fallback to empty)
  let email = "";
  if (business.user_id) {
    const { data: profile } = await db
      .from("profiles")
      .select("email")
      .eq("id", business.user_id)
      .single();
    email = profile?.email || "";
  }

  const result = await createConnectedAccount(
    business.name,
    email
  );

  // Save account ID to business
  await db
    .from("businesses")
    .update({ stripe_account_id: result.accountId })
    .eq("id", businessId);

  return NextResponse.json({
    accountId: result.accountId,
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

