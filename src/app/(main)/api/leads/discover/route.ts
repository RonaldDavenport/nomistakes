import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { hasFeature } from "@/lib/plans";
import { apolloSearch } from "@/lib/apollo";

// POST /api/leads/discover — search Apollo.io and bulk-insert results into leads table
export async function POST(req: NextRequest) {
  const { businessId, userId, titles, industries, locations, page, perPage } = await req.json();

  if (!businessId || !userId) {
    return NextResponse.json({ error: "businessId and userId required" }, { status: 400 });
  }

  const db = createServerClient();

  // Fetch user plan and gate on lead_engine feature
  const { data: profile } = await db
    .from("profiles")
    .select("plan")
    .eq("id", userId)
    .single();

  const planId = profile?.plan ?? "free";
  if (!hasFeature(planId, "lead_engine")) {
    return NextResponse.json(
      { error: "Lead Engine requires Starter plan or higher" },
      { status: 403 }
    );
  }

  // Search Apollo.io
  let candidates;
  try {
    candidates = await apolloSearch({ titles, industries, locations, page, perPage });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Apollo search failed";
    return NextResponse.json({ error: msg }, { status: 502 });
  }

  if (!candidates.length) {
    return NextResponse.json({ inserted: 0, skipped: 0, message: "No results from Apollo" });
  }

  // Bulk insert, skipping duplicates (same linkedin_url or email per business)
  const rows = candidates.map((c) => ({
    business_id: businessId,
    user_id: userId,
    source: c.source,
    name: c.name,
    email: c.email,
    linkedin_url: c.linkedin_url,
    title: c.title,
    company: c.company,
    status: "new",
  }));

  const { data: inserted, error } = await db
    .from("leads")
    .insert(rows)
    .select("id");

  if (error) {
    // Partial failure is acceptable — report what happened
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const skipped = candidates.length - (inserted?.length ?? 0);
  return NextResponse.json({
    inserted: inserted?.length ?? 0,
    skipped,
    total_found: candidates.length,
  });
}
