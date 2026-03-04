import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import Stripe from "stripe";

// POST /api/products/purchase — create Stripe checkout for product purchase
export async function POST(req: NextRequest) {
  const { productId, buyerEmail, buyerName } = await req.json();
  if (!productId || !buyerEmail) return NextResponse.json({ error: "productId and buyerEmail required" }, { status: 400 });

  const db = createServerClient();
  const { data: product, error } = await db
    .from("products")
    .select("*, businesses:business_id(name, stripe_account_id)")
    .eq("id", productId)
    .eq("status", "active")
    .single();

  if (error || !product) return NextResponse.json({ error: "Product not found" }, { status: 404 });
  if (product.price_cents <= 0) return NextResponse.json({ error: "Invalid price" }, { status: 400 });

  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeKey) return NextResponse.json({ error: "Payment not configured" }, { status: 500 });

  const stripe = new Stripe(stripeKey);
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const business = product.businesses as { name: string; stripe_account_id: string | null } | null;

  const sessionParams: Stripe.Checkout.SessionCreateParams = {
    mode: "payment",
    customer_email: buyerEmail,
    line_items: [{
      price_data: {
        currency: product.currency || "usd",
        product_data: { name: product.name, description: product.description || undefined },
        unit_amount: product.price_cents,
      },
      quantity: 1,
    }],
    metadata: {
      type: "product",
      productId: product.id,
      businessId: product.business_id,
      buyerEmail,
      buyerName: buyerName || "",
    },
    success_url: `${baseUrl}/purchase/success?product=${productId}`,
    cancel_url: `${baseUrl}/shop/${product.business_id}`,
  };

  try {
    const connectedAccountId = business?.stripe_account_id;
    let session: Stripe.Checkout.Session;

    if (connectedAccountId) {
      const platformFee = Math.round(product.price_cents * 0.05);
      sessionParams.payment_intent_data = { application_fee_amount: platformFee };
      session = await stripe.checkout.sessions.create(sessionParams, { stripeAccount: connectedAccountId });
    } else {
      session = await stripe.checkout.sessions.create(sessionParams);
    }

    return NextResponse.json({ url: session.url || "" });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
