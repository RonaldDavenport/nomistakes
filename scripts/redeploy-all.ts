/**
 * Redeploy all deployed businesses with the latest site template.
 * Run: npx tsx scripts/redeploy-all.ts
 */
import { createClient } from "@supabase/supabase-js";
import { generateSiteFiles } from "../src/lib/site-template";
import { deploy } from "../src/lib/vercel";

const db = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function main() {
  const { data: businesses } = await db
    .from("businesses")
    .select("*")
    .not("deployed_url", "is", null)
    .order("created_at", { ascending: false });

  if (!businesses?.length) {
    console.log("No deployed businesses found");
    return;
  }

  console.log(`Redeploying ${businesses.length} businesses...`);

  for (const biz of businesses) {
    console.log(`\n=== ${biz.name} (${biz.slug}) ===`);

    try {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL
        || (process.env.NEXT_PUBLIC_APP_DOMAIN ? `https://${process.env.NEXT_PUBLIC_APP_DOMAIN}` : "");

      const files = generateSiteFiles({
        name: biz.name,
        slug: biz.slug,
        tagline: biz.tagline,
        type: biz.type,
        brand: biz.brand || {},
        siteContent: biz.site_content || {},
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
        supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        businessId: biz.id,
        appUrl,
      });

      const result = await deploy(biz.slug, files, {
        NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL!,
        NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        NEXT_PUBLIC_BUSINESS_ID: biz.id,
        STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY || "",
      });

      console.log(`  Deployed: ${result.url} (${result.readyState})`);
    } catch (err) {
      console.error(`  Deploy failed:`, err);
    }
  }

  console.log("\nAll deployments initiated!");
}

main().catch(console.error);
