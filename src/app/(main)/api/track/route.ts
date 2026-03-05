import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

// CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}

// POST /api/track — public endpoint called from deployed client sites
// No auth required. businessId is validated against the businesses table.
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { businessId, sessionId, path, referrer, event, props } = body;

    if (!businessId || typeof businessId !== "string") {
      return NextResponse.json({ error: "businessId required" }, { status: 400, headers: CORS });
    }

    const db = createServerClient();

    // Verify business exists (prevents spam inserts for random IDs)
    const { data: biz, error: bizErr } = await db
      .from("businesses")
      .select("id")
      .eq("id", businessId)
      .maybeSingle();

    if (bizErr || !biz) {
      return NextResponse.json({ ok: true }, { status: 200, headers: CORS }); // silent drop
    }

    // Derive country from Vercel/Cloudflare headers when available
    const country =
      req.headers.get("x-vercel-ip-country") ||
      req.headers.get("cf-ipcountry") ||
      null;

    await db.from("site_analytics").insert({
      business_id: businessId,
      session_id: sessionId || "anon",
      page_path: typeof path === "string" ? path.slice(0, 500) : "/",
      referrer: typeof referrer === "string" ? referrer.slice(0, 500) : null,
      country,
      event_name: typeof event === "string" ? event.slice(0, 100) : null,
      event_props: props && typeof props === "object" ? props : null,
    });

    return NextResponse.json({ ok: true }, { status: 200, headers: CORS });
  } catch {
    return NextResponse.json({ ok: true }, { status: 200, headers: CORS }); // never 5xx to client sites
  }
}
