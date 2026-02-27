import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

// PATCH /api/onboarding — update business fields during onboarding
export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { businessId, step, data } = body;

    if (!businessId || !step) {
      return NextResponse.json({ error: "businessId and step required" }, { status: 400 });
    }

    const db = createServerClient();

    // Build the update object based on which step we're saving
    const update: Record<string, unknown> = {
      onboarding_step: stepIndex(step),
    };

    switch (step) {
      case "name": {
        if (data.name) update.name = data.name;
        if (data.slug) update.slug = data.slug;
        break;
      }
      case "colors": {
        if (data.colors) {
          // Merge into existing brand object
          const { data: biz } = await db
            .from("businesses")
            .select("brand")
            .eq("id", businessId)
            .single();
          update.brand = { ...(biz?.brand || {}), colors: data.colors };
        }
        break;
      }
      case "logo": {
        if (data.logoUrl) {
          const { data: biz } = await db
            .from("businesses")
            .select("brand")
            .eq("id", businessId)
            .single();
          update.brand = { ...(biz?.brand || {}), logo_url: data.logoUrl };
        }
        break;
      }
      case "layout": {
        if (data.layout) update.layout = data.layout;
        break;
      }
      case "domain": {
        if (data.customDomain) update.custom_domain = data.customDomain;
        break;
      }
      case "scheduling": {
        if (data.calendlyUrl) update.calendly_url = data.calendlyUrl;
        break;
      }
      case "payments": {
        if (data.stripeAccountId) update.stripe_account_id = data.stripeAccountId;
        break;
      }
      case "email": {
        if (data.businessEmail) update.business_email = data.businessEmail;
        update.onboarding_completed = true;
        break;
      }
      case "claim": {
        // Associate an unowned business with a user after auth gate
        if (!data.userId) return NextResponse.json({ error: "userId required" }, { status: 400 });
        update.user_id = data.userId;
        break;
      }
      default:
        return NextResponse.json({ error: "Invalid step" }, { status: 400 });
    }

    const { data: updated, error } = await db
      .from("businesses")
      .update(update)
      .eq("id", businessId)
      .select()
      .single();

    if (error) {
      console.error("[onboarding] DB error:", error);
      return NextResponse.json({ error: "Failed to update" }, { status: 500 });
    }

    return NextResponse.json({ business: updated });
  } catch (err) {
    console.error("[onboarding] Error:", err);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}

// GET /api/onboarding?businessId=xxx — fetch business for onboarding UI
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const businessId = searchParams.get("businessId");

  if (!businessId) {
    return NextResponse.json({ error: "businessId required" }, { status: 400 });
  }

  const db = createServerClient();
  const { data, error } = await db
    .from("businesses")
    .select("*")
    .eq("id", businessId)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Business not found" }, { status: 404 });
  }

  return NextResponse.json({ business: data });
}

function stepIndex(step: string): number {
  const steps = ["name", "colors", "logo", "layout", "domain", "scheduling", "payments", "email"];
  return steps.indexOf(step) + 1;
}
