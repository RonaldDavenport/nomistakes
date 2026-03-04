import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import Stripe from "stripe";

// POST /api/invoices/pay — create Stripe checkout for invoice payment
export async function POST(req: NextRequest) {
  const { invoiceId, accessToken } = await req.json();

  if (!invoiceId || !accessToken) {
    return NextResponse.json({ error: "invoiceId and accessToken required" }, { status: 400 });
  }

  const db = createServerClient();

  const { data: invoice, error } = await db
    .from("invoices")
    .select("*, businesses:business_id(name, stripe_account_id)")
    .eq("id", invoiceId)
    .eq("access_token", accessToken)
    .single();

  if (error || !invoice) {
    return NextResponse.json({ error: "Invalid invoice or access token" }, { status: 404 });
  }

  if (invoice.status === "paid") {
    return NextResponse.json({ error: "Invoice already paid" }, { status: 400 });
  }

  if (invoice.total_cents <= 0) {
    return NextResponse.json({ error: "Invalid invoice amount" }, { status: 400 });
  }

  const business = invoice.businesses as { name: string; stripe_account_id: string | null } | null;
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeKey) {
    return NextResponse.json({ error: "Payment not configured" }, { status: 500 });
  }

  const stripe = new Stripe(stripeKey);
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];
  const items = invoice.line_items as { name: string; description?: string; quantity: number; unit_price_cents: number }[];

  if (items && items.length > 0) {
    for (const item of items) {
      lineItems.push({
        price_data: {
          currency: invoice.currency || "usd",
          product_data: {
            name: item.name,
            description: item.description || undefined,
          },
          unit_amount: item.unit_price_cents,
        },
        quantity: item.quantity,
      });
    }
  } else {
    lineItems.push({
      price_data: {
        currency: invoice.currency || "usd",
        product_data: { name: `Invoice ${invoice.invoice_number}` },
        unit_amount: invoice.total_cents,
      },
      quantity: 1,
    });
  }

  // Add tax as separate line item if applicable
  if (invoice.tax_cents > 0) {
    lineItems.push({
      price_data: {
        currency: invoice.currency || "usd",
        product_data: { name: "Tax" },
        unit_amount: invoice.tax_cents,
      },
      quantity: 1,
    });
  }

  const successUrl = `${baseUrl}/invoice/${invoiceId}?token=${accessToken}&paid=true`;
  const cancelUrl = `${baseUrl}/invoice/${invoiceId}?token=${accessToken}`;

  try {
    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      mode: "payment",
      line_items: lineItems,
      metadata: {
        type: "invoice",
        invoiceId: invoice.id,
        contactId: invoice.contact_id || "",
        businessId: invoice.business_id,
      },
      success_url: successUrl,
      cancel_url: cancelUrl,
    };

    const connectedAccountId = business?.stripe_account_id;
    let session: Stripe.Checkout.Session;

    if (connectedAccountId) {
      const platformFee = Math.round(invoice.total_cents * 0.05);
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
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error("[invoices/pay] Stripe error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
