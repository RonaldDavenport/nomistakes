import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

// GET /api/automations?businessId=X
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
    .from("automations")
    .select("*")
    .eq("business_id", businessId)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ automations: data || [] });
}

// POST /api/automations
export async function POST(req: NextRequest) {
  const db = createServerClient();
  const { data: { user } } = await db.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { businessId, name, trigger, action, actionConfig } = await req.json();
  if (!businessId || !name || !trigger || !action) {
    return NextResponse.json({ error: "businessId, name, trigger, and action required" }, { status: 400 });
  }

  const { data: biz } = await db.from("businesses").select("id").eq("id", businessId).eq("user_id", user.id).maybeSingle();
  if (!biz) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const VALID_TRIGGERS = ["project_completed", "invoice_paid", "contact_inactive_30d", "booking_confirmed"];
  const VALID_ACTIONS = ["send_email", "send_review_request", "send_re_engagement"];

  if (!VALID_TRIGGERS.includes(trigger)) {
    return NextResponse.json({ error: "Invalid trigger" }, { status: 400 });
  }
  if (!VALID_ACTIONS.includes(action)) {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  const { data, error } = await db
    .from("automations")
    .insert({
      business_id: businessId,
      user_id: user.id,
      name,
      trigger,
      action,
      action_config: actionConfig || {},
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ automation: data }, { status: 201 });
}

// PATCH /api/automations
export async function PATCH(req: NextRequest) {
  const db = createServerClient();
  const { data: { user } } = await db.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { automationId, name, enabled, actionConfig } = await req.json();
  if (!automationId) {
    return NextResponse.json({ error: "automationId required" }, { status: 400 });
  }

  const patch: Record<string, unknown> = {};
  if (name !== undefined) patch.name = name;
  if (enabled !== undefined) patch.enabled = enabled;
  if (actionConfig !== undefined) patch.action_config = actionConfig;

  const { data, error } = await db
    .from("automations")
    .update(patch)
    .eq("id", automationId)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ automation: data });
}

// DELETE /api/automations
export async function DELETE(req: NextRequest) {
  const db = createServerClient();
  const { data: { user } } = await db.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { automationId } = await req.json();
  if (!automationId) {
    return NextResponse.json({ error: "automationId required" }, { status: 400 });
  }

  const { error } = await db
    .from("automations")
    .delete()
    .eq("id", automationId)
    .eq("user_id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
