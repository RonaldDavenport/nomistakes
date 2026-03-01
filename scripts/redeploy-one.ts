/**
 * Redeploy a single business site with the latest template.
 * Run: npx tsx scripts/redeploy-one.ts petmoneycoach
 */
import { createClient } from "@supabase/supabase-js";
import { generateSiteFiles } from "../src/lib/site-template";
import { deploy } from "../src/lib/vercel";

const slug = process.argv[2];
if (!slug) {
  console.error("Usage: npx tsx scripts/redeploy-one.ts <slug>");
  process.exit(1);
}

const db = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function main() {
  const { data: biz, error } = await db
    .from("businesses")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error || !biz) {
    console.error("Business not found:", error?.message || "null");
    process.exit(1);
  }

  console.log(`Redeploying: ${biz.name} (${biz.slug})`);

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

  console.log(`Generated ${files.length} files`);

  const result = await deploy(biz.slug, files, {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    NEXT_PUBLIC_BUSINESS_ID: biz.id,
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY || "",
  });

  console.log(`Deployed: ${result.url} (${result.readyState})`);
}

main().catch(console.error);
