import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

// GET /api/team/accept?token=X — requires user to be logged in
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  if (!token) {
    return NextResponse.json({ error: "token required" }, { status: 400 });
  }

  const db = createServerClient();
  const { data: { user } } = await db.auth.getUser();
  if (!user) {
    // Return a redirect to login with return URL
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://kovra.app";
    return NextResponse.redirect(`${appUrl}/auth/login?next=/team/accept?token=${token}`);
  }

  const { data: member } = await db
    .from("team_members")
    .select("id, accepted_at, business_id, invited_email")
    .eq("invite_token", token)
    .maybeSingle();

  if (!member) {
    return NextResponse.json({ error: "Invite not found or expired" }, { status: 404 });
  }

  if (member.accepted_at) {
    return NextResponse.json({ message: "Already accepted", businessId: member.business_id });
  }

  // Verify the logged-in user's email matches the invite
  if (user.email?.toLowerCase() !== member.invited_email?.toLowerCase()) {
    return NextResponse.json({ error: "This invite was sent to a different email address" }, { status: 403 });
  }

  const { error } = await db
    .from("team_members")
    .update({
      user_id: user.id,
      accepted_at: new Date().toISOString(),
    })
    .eq("id", member.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, businessId: member.business_id });
}
