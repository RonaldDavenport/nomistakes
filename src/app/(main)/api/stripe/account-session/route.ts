import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { createAccountSession, isStripeConfigured } from "@/lib/stripe";

export async function POST(req: Request) {
  try {
    if (!isStripeConfigured()) {
      return NextResponse.json({ error: "Stripe not configured" }, { status: 503 });
    }

    const { businessId } = await req.json();
    if (!businessId) {
      return NextResponse.json({ error: "businessId required" }, { status: 400 });
    }

    const db = createServerClient();
    const { data: business } = await db
      .from("businesses")
      .select("stripe_account_id")
      .eq("id", businessId)
      .single();

    if (!business?.stripe_account_id) {
      return NextResponse.json({ error: "No Stripe account connected" }, { status: 400 });
    }

    const clientSecret = await createAccountSession(business.stripe_account_id, {
      account_onboarding: { enabled: true },
      payments: { enabled: true, features: { refund_management: true, dispute_management: true, capture_payments: true } },
      payouts: { enabled: true },
      balances: { enabled: true },
      account_management: { enabled: true },
      notification_banner: { enabled: true },
    });

    return NextResponse.json({ clientSecret });
  } catch (err) {
    console.error("[stripe/account-session] Error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to create account session" },
      { status: 500 }
    );
  }
}
