import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

function generateCode(): string {
  const chars = "abcdefghijkmnpqrstuvwxyz23456789";
  const bytes = new Uint8Array(6);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => chars[b % chars.length]).join("");
}

// GET /api/referrals?businessId=X
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
    .from("referral_links")
    .select("*")
    .eq("business_id", businessId)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ referrals: data || [] });
}

// POST /api/referrals
export async function POST(req: NextRequest) {
  const db = createServerClient();
  const { data: { user } } = await db.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { businessId, label, targetUrl } = await req.json();
  if (!businessId || !targetUrl) {
    return NextResponse.json({ error: "businessId and targetUrl required" }, { status: 400 });
  }

  // Validate URL
  try {
    const url = new URL(targetUrl);
    if (!["http:", "https:"].includes(url.protocol)) throw new Error();
  } catch {
    return NextResponse.json({ error: "targetUrl must be a valid http/https URL" }, { status: 400 });
  }

  const { data: biz } = await db.from("businesses").select("id").eq("id", businessId).eq("user_id", user.id).maybeSingle();
  if (!biz) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Generate unique code with collision check
  let code = generateCode();
  let attempts = 0;
  while (attempts < 5) {
    const { data: existing } = await db
      .from("referral_links")
      .select("id")
      .eq("code", code)
      .maybeSingle();
    if (!existing) break;
    code = generateCode();
    attempts++;
  }

  const { data, error } = await db
    .from("referral_links")
    .insert({
      business_id: businessId,
      user_id: user.id,
      code,
      label: label || null,
      target_url: targetUrl,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ referral: data }, { status: 201 });
}

// PATCH /api/referrals
export async function PATCH(req: NextRequest) {
  const db = createServerClient();
  const { data: { user } } = await db.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { referralId, label, targetUrl } = await req.json();
  if (!referralId) {
    return NextResponse.json({ error: "referralId required" }, { status: 400 });
  }

  const patch: Record<string, unknown> = {};
  if (label !== undefined) patch.label = label;
  if (targetUrl !== undefined) patch.target_url = targetUrl;

  const { data, error } = await db
    .from("referral_links")
    .update(patch)
    .eq("id", referralId)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ referral: data });
}

// DELETE /api/referrals
export async function DELETE(req: NextRequest) {
  const db = createServerClient();
  const { data: { user } } = await db.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { referralId } = await req.json();
  if (!referralId) {
    return NextResponse.json({ error: "referralId required" }, { status: 400 });
  }

  const { error } = await db
    .from("referral_links")
    .delete()
    .eq("id", referralId)
    .eq("user_id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
