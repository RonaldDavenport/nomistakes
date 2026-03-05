import { NextResponse } from "next/server";

// GET /api/stripe/connect/refresh — Stripe redirects here if AccountLink expires
// We just send them back to the settings page to re-trigger the connect flow
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const businessId = searchParams.get("businessId");
  const origin = req.headers.get("origin") || "https://trynomistakes.com";

  const redirect = businessId
    ? `${origin}/dashboard/${businessId}/settings?tab=stripe`
    : `${origin}/dashboard`;

  return NextResponse.redirect(redirect);
}
