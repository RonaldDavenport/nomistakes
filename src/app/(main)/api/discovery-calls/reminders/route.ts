import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { sendEmail, SYSTEM_TEMPLATES } from "@/lib/email";

// GET /api/discovery-calls/reminders — Vercel Cron (every 15 min)
// Sends 24h and 1h reminders for upcoming calls
export async function GET() {
  const db = createServerClient();
  const now = new Date();

  // 24h window: calls between 23h45m and 24h15m from now
  const h24Start = new Date(now.getTime() + 23 * 60 * 60000 + 45 * 60000);
  const h24End = new Date(now.getTime() + 24 * 60 * 60000 + 15 * 60000);

  // 1h window: calls between 45m and 1h15m from now
  const h1Start = new Date(now.getTime() + 45 * 60000);
  const h1End = new Date(now.getTime() + 75 * 60000);

  let sent24 = 0;
  let sent1 = 0;

  // 24h reminders
  const { data: calls24 } = await db
    .from("discovery_calls")
    .select("*, businesses!inner(name, slug)")
    .in("status", ["scheduled", "confirmed"])
    .eq("reminder_24h_sent", false)
    .gte("scheduled_at", h24Start.toISOString())
    .lte("scheduled_at", h24End.toISOString());

  if (calls24) {
    const template = SYSTEM_TEMPLATES.find((t) => t.name === "24h Reminder");
    for (const call of calls24) {
      const biz = call.businesses as { name: string; slug: string };
      try {
        if (template) {
          await sendEmail(
            {
              businessSlug: biz.slug,
              businessName: biz.name,
              to: call.email,
              subject: template.subject,
              html: template.body_html,
            },
            {
              name: call.name,
              business_name: biz.name,
              date: new Date(call.scheduled_at).toLocaleDateString(),
              time: new Date(call.scheduled_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            }
          );
        }
        await db.from("discovery_calls").update({ reminder_24h_sent: true }).eq("id", call.id);
        sent24++;
      } catch (err) {
        console.error(`[reminders] 24h reminder failed for call ${call.id}:`, (err as Error).message);
      }
    }
  }

  // 1h reminders
  const { data: calls1 } = await db
    .from("discovery_calls")
    .select("*, businesses!inner(name, slug)")
    .in("status", ["scheduled", "confirmed"])
    .eq("reminder_1h_sent", false)
    .gte("scheduled_at", h1Start.toISOString())
    .lte("scheduled_at", h1End.toISOString());

  if (calls1) {
    const template = SYSTEM_TEMPLATES.find((t) => t.name === "1h Reminder");
    for (const call of calls1) {
      const biz = call.businesses as { name: string; slug: string };
      try {
        if (template) {
          await sendEmail(
            {
              businessSlug: biz.slug,
              businessName: biz.name,
              to: call.email,
              subject: template.subject,
              html: template.body_html,
            },
            {
              name: call.name,
              business_name: biz.name,
              time: new Date(call.scheduled_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            }
          );
        }
        await db.from("discovery_calls").update({ reminder_1h_sent: true }).eq("id", call.id);
        sent1++;
      } catch (err) {
        console.error(`[reminders] 1h reminder failed for call ${call.id}:`, (err as Error).message);
      }
    }
  }

  return NextResponse.json({ sent24h: sent24, sent1h: sent1 });
}
