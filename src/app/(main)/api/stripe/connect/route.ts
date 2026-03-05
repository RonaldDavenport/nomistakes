import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import {
  createConnectedAccount,
  createAccountLink,
  getAccountStatus,
  isStripeConfigured,
} from "@/lib/stripe";

// POST /api/stripe/connect — Create or resume a Stripe Connect account and return onboarding URL
export async function POST(req: Request) {
  if (!isStripeConfigured()) {
    return NextResponse.json(
      { error: "Stripe not configured" },
      { status: 503 }
    );
  }

  try {
    const { businessId } = await req.json();
    if (!businessId) {
      return NextResponse.json({ error: "businessId required" }, { status: 400 });
    }

    const db = createServerClient();
    const { data: business } = await db
      .from("businesses")
      .select("id, name, user_id, stripe_account_id")
      .eq("id", businessId)
      .single();

    if (!business) {
      return NextResponse.json({ error: "Business not found" }, { status: 404 });
    }

    const origin = req.headers.get("origin") || "https://trynomistakes.com";
    const returnUrl = `${origin}/dashboard/${businessId}/settings?tab=stripe&stripe=connected`;
    const refreshUrl = `${origin}/api/stripe/connect/refresh?businessId=${businessId}`;

    let accountId = business.stripe_account_id;

    if (accountId) {
      // Check if already fully onboarded
      const status = await getAccountStatus(accountId);
      if (status.detailsSubmitted) {
        return NextResponse.json({ alreadyConnected: true, accountId });
      }
    } else {
      // Create new Express account
      let email = "";
      if (business.user_id) {
        const { data: profile } = await db
          .from("profiles")
          .select("email")
          .eq("id", business.user_id)
          .single();
        email = profile?.email || "";
      }

      const result = await createConnectedAccount(business.name, email);
      accountId = result.accountId;

      await db
        .from("businesses")
        .update({ stripe_account_id: accountId })
        .eq("id", businessId);
    }

    // Create AccountLink for hosted Stripe onboarding
    const { url } = await createAccountLink(accountId, refreshUrl, returnUrl);

    return NextResponse.json({ url });
  } catch (err: unknown) {
    const message =
      err && typeof err === "object" && "message" in err
        ? String((err as { message: unknown }).message)
        : "Failed to create Stripe connect link";
    console.error("[stripe/connect] Error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
