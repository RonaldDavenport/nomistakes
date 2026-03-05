import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { sendEmail } from "@/lib/email";

// GET /api/team?businessId=X
export async function GET(req: NextRequest) {
  const businessId = req.nextUrl.searchParams.get("businessId");
  if (!businessId) {
    return NextResponse.json({ error: "businessId required" }, { status: 400 });
  }

  const db = createServerClient();
  const { data: { user } } = await db.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: biz } = await db.from("businesses").select("id").eq("id", businessId).eq("user_id", user.id).maybeSingle();
  if (!biz) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { data, error } = await db
    .from("team_members")
    .select("*")
    .eq("business_id", businessId)
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ members: data || [] });
}

// POST /api/team — invite a team member
export async function POST(req: NextRequest) {
  const db = createServerClient();
  const { data: { user } } = await db.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { businessId, email, role } = await req.json();
  if (!businessId || !email) {
    return NextResponse.json({ error: "businessId and email required" }, { status: 400 });
  }

  // Validate email format
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
  }

  const { data: biz } = await db
    .from("businesses")
    .select("name, slug")
    .eq("id", businessId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!biz) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { data: member, error } = await db
    .from("team_members")
    .insert({
      business_id: businessId,
      invited_by: user.id,
      invited_email: email.toLowerCase(),
      role: role || "member",
    })
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json({ error: "This person has already been invited" }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Send invite email
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://kovra.app";
  const acceptUrl = `${appUrl}/team/accept?token=${member.invite_token}`;

  try {
    await sendEmail({
      businessSlug: biz.slug,
      businessName: biz.name,
      to: email,
      subject: `You've been invited to join ${biz.name} on Kovra`,
      html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:32px">
        <h2>You've been invited!</h2>
        <p>${biz.name} has invited you to join their team on Kovra.</p>
        <p style="margin:24px 0">
          <a href="${acceptUrl}" style="background:#C8A44E;color:#0A0A0A;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:600">Accept Invitation</a>
        </p>
        <p style="color:#71717A;font-size:13px">If you didn't expect this invitation, you can ignore this email.</p>
      </div>`,
    });
  } catch {
    // Email failure is non-fatal — member was already created
  }

  return NextResponse.json({ member }, { status: 201 });
}
