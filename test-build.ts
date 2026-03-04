import { createClient } from "@supabase/supabase-js";
import { generateSiteFiles } from "./src/lib/site-template";
import * as fs from "fs";
import * as path from "path";
import { execSync } from "child_process";

const db = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function main() {
  const { data: biz } = await db.from("businesses").select("*").eq("slug", "fitframe").single();
  if (biz === null) { console.error("not found"); return; }

  const files = generateSiteFiles({
    name: biz.name,
    slug: biz.slug,
    tagline: biz.tagline,
    type: biz.type,
    brand: biz.brand || {},
    siteContent: biz.site_content || {},
    supabaseUrl: "https://vmcdgynameujvljpqcfm.supabase.co",
    supabaseAnonKey: "fake",
    businessId: biz.id,
    appUrl: "https://kovra.com",
  });

  const outDir = "/tmp/test-site-build";
  fs.rmSync(outDir, { recursive: true, force: true });

  for (const f of files) {
    const fullPath = path.join(outDir, f.file);
    fs.mkdirSync(path.dirname(fullPath), { recursive: true });
    fs.writeFileSync(fullPath, f.data);
  }

  console.log("Generated", files.length, "files to", outDir);

  try {
    execSync("npm install 2>&1", { cwd: outDir, timeout: 60000 });
    console.log("npm install done");
    const result = execSync("npx next build 2>&1", { cwd: outDir, timeout: 120000 });
    console.log("BUILD SUCCESS");
    console.log(result.toString().slice(-500));
  } catch (e: unknown) {
    const err = e as { stdout?: Buffer; stderr?: Buffer };
    console.error("BUILD FAILED:");
    console.error(err.stdout?.toString().slice(-3000) || "");
    console.error(err.stderr?.toString().slice(-1000) || "");
  }
}

main();
