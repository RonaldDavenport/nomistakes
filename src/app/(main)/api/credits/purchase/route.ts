import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { CREDIT_PACKS } from "@/lib/credits";

// POST /api/credits/purchase — create a Stripe checkout for credit pack purchase
export async function POST(req: NextRequest) {
  const { packId, userId, businessId, email } = await req.json();

  if (!packId || !userId || !businessId) {
    return NextResponse.json({ error: "packId, userId, and businessId required" }, { status: 400 });
  }

  const pack = CREDIT_PACKS.find((p) => p.id === packId);
  if (!pack) {
    return NextResponse.json({ error: "Invalid pack" }, { status: 400 });
  }

  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 500 });
  }

  const stripe = new Stripe(key);

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: email || undefined,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `${pack.label} — Kovra AI Credits`,
              description: `${pack.credits} AI credits for content generation, ads, SEO, and more.`,
            },
            unit_amount: pack.priceCents,
          },
          quantity: 1,
        },
      ],
      metadata: {
        type: "credit_pack",
        userId,
        businessId,
        packId: pack.id,
        credits: String(pack.credits),
      },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/dashboard/${businessId}/settings?credits=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/dashboard/${businessId}/settings?credits=cancelled`,
    });

    return NextResponse.json({ url: session.url || "" });
  } catch (err) {
    console.error("[credits/purchase] Stripe error:", err);
    return NextResponse.json({ error: "Failed to create checkout" }, { status: 500 });
  }
}
