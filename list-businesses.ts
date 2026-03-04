import { createClient } from "@supabase/supabase-js";
const db = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
async function main() {
  const { data } = await db.from("businesses").select("id, slug, name, type, deployed_url, status").order("created_at", { ascending: false });
  console.log(JSON.stringify(data, null, 2));
}
main();
