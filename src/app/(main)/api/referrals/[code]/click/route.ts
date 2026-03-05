import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

// GET /api/referrals/[code]/click — public, increments clicks and redirects
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  const db = createServerClient();

  const { data } = await db
    .from("referral_links")
    .select("id, target_url, clicks")
    .eq("code", code)
    .maybeSingle();

  if (!data) {
    return NextResponse.json({ error: "Link not found" }, { status: 404 });
  }

  // Increment clicks (fire-and-forget)
  db.from("referral_links")
    .update({ clicks: data.clicks + 1 })
    .eq("id", data.id)
    .then(() => {});

  return NextResponse.redirect(data.target_url, { status: 302 });
}
