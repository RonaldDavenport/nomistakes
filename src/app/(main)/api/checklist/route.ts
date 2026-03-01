import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { getChecklistForSubtype } from "@/lib/checklist-data";

// GET: fetch checklist (auto-init if needed)
export async function GET(req: NextRequest) {
  const businessId = req.nextUrl.searchParams.get("businessId");
  if (!businessId) {
    return NextResponse.json({ error: "businessId required" }, { status: 400 });
  }

  const supabase = createServerClient();

  // Fetch business
  const { data: business, error: bizError } = await supabase
    .from("businesses")
    .select("id, subtype, type, checklist_initialized, deployed_url, stripe_account_id, custom_domain, calendly_url, business_email")
    .eq("id", businessId)
    .single();

  if (bizError || !business) {
    return NextResponse.json({ error: "Business not found" }, { status: 404 });
  }

  // Auto-initialize checklist if needed
  if (!business.checklist_initialized) {
    const tasks = getChecklistForSubtype(business.subtype || "freelance");
    const rows = tasks.map((t) => ({
      business_id: businessId,
      task_id: t.id,
      status: "pending",
    }));

    await supabase.from("checklist_items").upsert(rows, { onConflict: "business_id,task_id" });
    await supabase
      .from("businesses")
      .update({ checklist_initialized: true })
      .eq("id", businessId);
  }

  // Fetch all checklist items
  const { data: items } = await supabase
    .from("checklist_items")
    .select("*")
    .eq("business_id", businessId)
    .order("created_at");

  // Auto-check tasks based on business state
  const autoChecks: Record<string, boolean> = {
    has_stripe: !!business.stripe_account_id,
    has_domain: !!business.custom_domain,
    has_calendly: !!business.calendly_url,
    has_email: !!business.business_email,
    site_deployed: !!business.deployed_url,
  };

  const taskDefs = getChecklistForSubtype(business.subtype || "freelance");
  const taskMap = new Map(taskDefs.map((t) => [t.id, t]));

  // Update auto-check items
  const updates: string[] = [];
  for (const item of items || []) {
    const def = taskMap.get(item.task_id);
    if (def?.autoCheck && autoChecks[def.autoCheck] && item.status !== "completed") {
      updates.push(item.task_id);
    }
  }

  if (updates.length > 0) {
    for (const taskId of updates) {
      await supabase
        .from("checklist_items")
        .update({ status: "completed", completed_at: new Date().toISOString() })
        .eq("business_id", businessId)
        .eq("task_id", taskId);
    }
  }

  // Re-fetch after updates
  const { data: finalItems } = await supabase
    .from("checklist_items")
    .select("*")
    .eq("business_id", businessId)
    .order("created_at");

  // Merge task definitions with DB status
  const merged = taskDefs.map((def) => {
    const item = finalItems?.find((i) => i.task_id === def.id);
    return {
      ...def,
      status: item?.status || "pending",
      completedAt: item?.completed_at || null,
      metadata: item?.metadata || {},
    };
  });

  return NextResponse.json({ tasks: merged });
}

// PATCH: update task status
export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const { businessId, taskId, status, metadata } = body;

  if (!businessId || !taskId || !status) {
    return NextResponse.json({ error: "businessId, taskId, and status required" }, { status: 400 });
  }

  const supabase = createServerClient();

  const updateData: Record<string, unknown> = { status };
  if (status === "completed") {
    updateData.completed_at = new Date().toISOString();
  }
  if (metadata) {
    updateData.metadata = metadata;
  }

  const { error } = await supabase
    .from("checklist_items")
    .update(updateData)
    .eq("business_id", businessId)
    .eq("task_id", taskId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
