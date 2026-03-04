import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import Stripe from "stripe";

// POST /api/proposals/accept — create Stripe checkout for proposal payment
export async function POST(req: NextRequest) {
  const { proposalId, accessToken } = await req.json();

  if (!proposalId || !accessToken) {
    return NextResponse.json({ error: "proposalId and accessToken required" }, { status: 400 });
  }

  const db = createServerClient();

  // Fetch proposal and validate token
  const { data: proposal, error } = await db
    .from("proposals")
    .select("*, businesses:business_id(name, stripe_account_id)")
    .eq("id", proposalId)
    .eq("access_token", accessToken)
    .single();

  if (error || !proposal) {
    return NextResponse.json({ error: "Invalid proposal or access token" }, { status: 404 });
  }

  if (proposal.status === "accepted") {
    return NextResponse.json({ error: "Proposal already accepted" }, { status: 400 });
  }

  if (proposal.status === "expired" || (proposal.valid_until && new Date(proposal.valid_until) < new Date())) {
    return NextResponse.json({ error: "Proposal has expired" }, { status: 400 });
  }

  const pricing = proposal.pricing as { line_items?: { name: string; description?: string; amount_cents: number }[]; total_cents?: number } | null;
  const totalCents = pricing?.total_cents || 0;

  if (totalCents <= 0) {
    return NextResponse.json({ error: "Invalid proposal pricing" }, { status: 400 });
  }

  const business = proposal.businesses as { name: string; stripe_account_id: string | null } | null;
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeKey) {
    return NextResponse.json({ error: "Payment not configured" }, { status: 500 });
  }

  const stripe = new Stripe(stripeKey);
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = (pricing?.line_items || []).map((item) => ({
    price_data: {
      currency: "usd",
      product_data: {
        name: item.name,
        description: item.description || undefined,
      },
      unit_amount: item.amount_cents,
    },
    quantity: 1,
  }));

  // If no line items, use total as single item
  if (lineItems.length === 0) {
    lineItems.push({
      price_data: {
        currency: "usd",
        product_data: { name: proposal.title },
        unit_amount: totalCents,
      },
      quantity: 1,
    });
  }

  const successUrl = `${baseUrl}/proposal/${proposalId}?token=${accessToken}&paid=true`;
  const cancelUrl = `${baseUrl}/proposal/${proposalId}?token=${accessToken}`;

  try {
    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      mode: "payment",
      line_items: lineItems,
      metadata: {
        type: "proposal",
        proposalId: proposal.id,
        contactId: proposal.contact_id,
        businessId: proposal.business_id,
      },
      success_url: successUrl,
      cancel_url: cancelUrl,
    };

    // If business has a connected Stripe account, route payment there with platform fee
    const connectedAccountId = business?.stripe_account_id;
    let session: Stripe.Checkout.Session;

    if (connectedAccountId) {
      const platformFee = Math.round(totalCents * 0.05);
      sessionParams.payment_intent_data = {
        application_fee_amount: platformFee,
      };
      session = await stripe.checkout.sessions.create(sessionParams, {
        stripeAccount: connectedAccountId,
      });
    } else {
      session = await stripe.checkout.sessions.create(sessionParams);
    }

    return NextResponse.json({ url: session.url || "" });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[proposals/accept] Stripe error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
