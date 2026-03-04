import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

// GET /api/portal?businessId=X&token=Y — fetch all client-facing data for a contact
export async function GET(req: NextRequest) {
  const businessId = req.nextUrl.searchParams.get("businessId");
  const token = req.nextUrl.searchParams.get("token");
  if (!businessId || !token) return NextResponse.json({ error: "businessId and token required" }, { status: 400 });

  const db = createServerClient();

  // Validate portal access via contact access_token
  const { data: contact, error: contactErr } = await db
    .from("contacts")
    .select("*")
    .eq("business_id", businessId)
    .eq("portal_token", token)
    .single();

  if (contactErr || !contact) return NextResponse.json({ error: "Invalid portal link" }, { status: 403 });

  // Fetch business info
  const { data: business } = await db
    .from("businesses")
    .select("name, slug, brand")
    .eq("id", businessId)
    .single();

  // Fetch proposals for this contact
  const { data: proposals } = await db
    .from("proposals")
    .select("id, title, status, pricing, valid_until, created_at, sent_at, viewed_at, accepted_at, paid_at")
    .eq("contact_id", contact.id)
    .in("status", ["sent", "viewed", "accepted", "declined"])
    .order("created_at", { ascending: false });

  // Fetch invoices for this contact
  const { data: invoices } = await db
    .from("invoices")
    .select("id, invoice_number, status, total_cents, due_date, access_token, created_at, sent_at, paid_at")
    .eq("contact_id", contact.id)
    .in("status", ["sent", "viewed", "paid", "overdue"])
    .order("created_at", { ascending: false });

  // Fetch projects for this contact
  const { data: projects } = await db
    .from("projects")
    .select("id, name, description, status, start_date, due_date, completed_at")
    .eq("contact_id", contact.id)
    .in("status", ["active", "completed"])
    .order("created_at", { ascending: false });

  // Fetch deliverables for those projects
  const projectIds = (projects || []).map((p) => p.id);
  let deliverables: Record<string, { id: string; name: string; status: string; due_date: string | null }[]> = {};
  if (projectIds.length > 0) {
    const { data: allDels } = await db
      .from("deliverables")
      .select("id, project_id, name, status, due_date")
      .in("project_id", projectIds)
      .order("sort_order", { ascending: true });

    for (const d of allDels || []) {
      if (!deliverables[d.project_id]) deliverables[d.project_id] = [];
      deliverables[d.project_id].push(d);
    }
  }

  return NextResponse.json({
    contact: { name: contact.name, email: contact.email, company: contact.company },
    business: business || { name: "Business", slug: "" },
    proposals: proposals || [],
    invoices: invoices || [],
    projects: (projects || []).map((p) => ({ ...p, deliverables: deliverables[p.id] || [] })),
  });
}
