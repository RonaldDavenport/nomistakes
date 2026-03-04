import { createClient } from "@supabase/supabase-js";
const db = createClient(
  "https://vmcdgynameujvljpqcfm.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZtY2RneW5hbWV1anZsanBxY2ZtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjE3MDMzOCwiZXhwIjoyMDg3NzQ2MzM4fQ.IX_QsC7ltam-a2eah5tF46gUKNHXnQJbDerzujbuNtk"
);
async function main() {
  const { data } = await db.from("businesses").select("id, slug, name, type, deployed_url, status").order("created_at", { ascending: false });
  console.log(JSON.stringify(data, null, 2));
}
main();
