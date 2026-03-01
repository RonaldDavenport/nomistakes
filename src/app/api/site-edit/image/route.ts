import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { generateSingleImage } from "@/lib/images";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const { businessId, slot, imagePrompt } = await req.json();

  if (!businessId || !slot || !imagePrompt) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  const db = createServerClient();
  const { data: business, error: bizErr } = await db
    .from("businesses")
    .select("id, site_content")
    .eq("id", businessId)
    .single();

  if (bizErr || !business) {
    return NextResponse.json({ error: "Business not found" }, { status: 404 });
  }

  try {
    const url = await generateSingleImage(businessId, slot, imagePrompt);

    // Update site_content.images with the new URL
    const siteContent = (business.site_content as Record<string, unknown>) || {};
    const images = (siteContent.images as Record<string, unknown>) || {};

    if (slot.startsWith("product_")) {
      const idx = parseInt(slot.replace("product_", ""), 10);
      const products = Array.isArray(images.products)
        ? [...(images.products as string[])]
        : [];
      products[idx] = url;
      images.products = products;
    } else {
      images[slot] = url;
    }

    siteContent.images = images;

    await db
      .from("businesses")
      .update({ site_content: siteContent })
      .eq("id", businessId);

    return NextResponse.json({ success: true, slot, url });
  } catch (err) {
    console.error("[site-edit/image] Generation failed:", err);
    return NextResponse.json(
      { error: "Image generation failed" },
      { status: 500 }
    );
  }
}
