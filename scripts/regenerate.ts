/**
 * Regenerate StyleScore site content + generate images for all deployed businesses.
 * Run: npx tsx scripts/regenerate.ts
 */
import { createClient } from "@supabase/supabase-js";
import { generateSiteContent } from "../src/lib/claude";
import { generateBusinessImages } from "../src/lib/images";

const db = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function main() {
  // Get all deployed businesses
  const { data: businesses } = await db
    .from("businesses")
    .select("*")
    .not("deployed_url", "is", null)
    .order("created_at", { ascending: false });

  if (!businesses?.length) {
    console.log("No deployed businesses found");
    return;
  }

  console.log(`Found ${businesses.length} deployed businesses`);

  for (let idx = 0; idx < businesses.length; idx++) {
    const biz = businesses[idx];
    console.log(`\n=== ${biz.name} (${biz.slug}) [${idx + 1}/${businesses.length}] ===`);

    // 1. Regenerate site content for StyleScore (needs new schema with slugs, long_desc, etc.)
    if (biz.slug === "stylescore") {
      console.log("Regenerating site content with new schema...");
      try {
        const siteResult = await generateSiteContent(
          biz.name,
          biz.tagline,
          biz.type,
          biz.audience || "Fashion-conscious gamers and musicians",
          biz.audience || "Fashion-conscious gamers and musicians",
          biz.brand || {}
        );
        let siteContent;
        try {
          siteContent = JSON.parse(siteResult.content);
        } catch {
          const match = siteResult.content.match(/\{[\s\S]*\}/);
          siteContent = match ? JSON.parse(match[0]) : {};
        }
        // Preserve existing images if any
        if (biz.site_content?.images) {
          siteContent.images = biz.site_content.images;
        }
        await db.from("businesses").update({ site_content: siteContent }).eq("id", biz.id);
        biz.site_content = siteContent;
        console.log("  Content regenerated with", siteContent.products?.length, "products");
      } catch (err) {
        console.error("  Content regeneration failed:", err);
      }
    }

    // 2. Generate images (if not already present)
    if (biz.site_content?.images?.hero) {
      console.log("  Images already exist, skipping");
      continue;
    }

    console.log("  Generating images...");
    try {
      const products = (biz.site_content?.products || []).slice(0, 3).map((p: { name: string; desc: string }) => ({
        name: p.name,
        desc: p.desc,
      }));

      const images = await generateBusinessImages(
        biz.slug,
        biz.name,
        biz.type,
        biz.tagline,
        biz.brand?.tone || "professional",
        products
      );

      // Update site_content with images
      const updatedContent = { ...(biz.site_content || {}), images };
      await db.from("businesses").update({ site_content: updatedContent }).eq("id", biz.id);
      console.log("  Images generated:", {
        hero: images.hero ? "yes" : "no",
        about: images.about ? "yes" : "no",
        products: images.products.length,
      });
    } catch (err) {
      console.error("  Image generation failed:", err);
    }
  }

  console.log("\nDone! Now redeploy all sites.");
}

main().catch(console.error);
