import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

// GET — fetch a single business
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ businessId: string }> }
) {
  const { businessId } = await params;
  const db = createServerClient();

  const { data: business, error } = await db
    .from("businesses")
    .select("*")
    .eq("id", businessId)
    .single();

  if (error || !business) {
    return NextResponse.json({ error: "Business not found" }, { status: 404 });
  }

  return NextResponse.json({ business });
}

// PATCH — update business fields
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ businessId: string }> }
) {
  const { businessId } = await params;
  const body = await req.json();

  // Allowlist of updatable fields
  const allowed = [
    "name",
    "tagline",
    "coach_name",
    "brand",
    "site_content",
    "business_plan",
    "audience",
    "revenue_estimate",
    "calendly_url",
    "business_email",
    "custom_domain",
    "video_url",
    "layout",
  ];

  const updates: Record<string, unknown> = {};
  for (const key of allowed) {
    if (key in body) {
      updates[key] = body[key];
    }
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
  }

  const db = createServerClient();
  const { data: business, error } = await db
    .from("businesses")
    .update(updates)
    .eq("id", businessId)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ business });
}

// DELETE — delete a business and all related data (cascades via FK)
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ businessId: string }> }
) {
  const { businessId } = await params;
  const db = createServerClient();
  const { userId } = await req.json().catch(() => ({ userId: null }));

  // Fetch the business to get user_id for profile update
  const { data: business } = await db
    .from("businesses")
    .select("id, user_id")
    .eq("id", businessId)
    .single();

  if (!business) {
    return NextResponse.json({ error: "Business not found" }, { status: 404 });
  }

  const { error } = await db.from("businesses").delete().eq("id", businessId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Decrement businesses_count on profile
  const ownerId = userId || business.user_id;
  if (ownerId) {
    const { data: profile } = await db
      .from("profiles")
      .select("businesses_count")
      .eq("id", ownerId)
      .single();

    if (profile && profile.businesses_count > 0) {
      await db
        .from("profiles")
        .update({ businesses_count: profile.businesses_count - 1 })
        .eq("id", ownerId);
    }
  }

  return NextResponse.json({ success: true });
}
