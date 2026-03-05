import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { sendEmail } from "@/lib/email";

// GET /api/cron/automations — called by Vercel Cron daily at 8am UTC
export async function GET(req: NextRequest) {
  const secret = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!process.env.CRON_SECRET || secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = createServerClient();
  const results: { automationId: string; action: string; triggered: number; errors: number }[] = [];

  // Fetch all enabled automations
  const { data: automations } = await db
    .from("automations")
    .select("*, businesses(name, slug)")
    .eq("enabled", true);

  if (!automations || automations.length === 0) {
    return NextResponse.json({ ok: true, processed: 0 });
  }

  for (const auto of automations) {
    const result = { automationId: auto.id, action: auto.action, triggered: 0, errors: 0 };

    try {
      if (auto.trigger === "contact_inactive_30d") {
        // Find contacts with last_contacted_at older than 30 days or null and created > 30 days ago
        const cutoff = new Date(Date.now() - 30 * 86_400_000).toISOString();
        const { data: contacts } = await db
          .from("contacts")
          .select("id, name, email")
          .eq("business_id", auto.business_id)
          .or(`last_contacted_at.lt.${cutoff},last_contacted_at.is.null`)
          .lt("created_at", cutoff)
          .limit(50);

        for (const contact of contacts || []) {
          try {
            const config = auto.action_config as Record<string, string> || {};
            const subject = config.subject || `Checking in from ${auto.businesses?.name}`;
            const body = config.body || `<p>Hi ${contact.name?.split(" ")[0] || "there"},</p><p>Just checking in — we'd love to reconnect whenever you're ready.</p>`;

            await sendEmail({
              businessSlug: auto.businesses?.slug || "kovra",
              businessName: auto.businesses?.name || "Kovra",
              to: contact.email,
              subject,
              html: body,
            });

            // Update last_contacted_at
            await db.from("contacts").update({ last_contacted_at: new Date().toISOString() }).eq("id", contact.id);
            result.triggered++;
          } catch {
            result.errors++;
          }
        }
      } else if (auto.trigger === "project_completed") {
        // Find projects completed since last run (or last 24h if no last_run_at)
        const since = auto.last_run_at || new Date(Date.now() - 86_400_000).toISOString();
        const { data: projects } = await db
          .from("projects")
          .select("id, name, contact_id, contacts(name, email)")
          .eq("business_id", auto.business_id)
          .eq("status", "completed")
          .gte("completed_at", since)
          .limit(50);

        for (const project of projects || []) {
          const contactsRaw = project.contacts;
          const contact = (Array.isArray(contactsRaw) ? contactsRaw[0] : contactsRaw) as { name: string; email: string } | null;
          if (!contact?.email) continue;

          try {
            if (auto.action === "send_review_request") {
              const config = auto.action_config as Record<string, string> || {};
              const reviewUrl = config.google_review_url || "";
              await sendEmail({
                businessSlug: auto.businesses?.slug || "kovra",
                businessName: auto.businesses?.name || "Kovra",
                to: contact.email,
                subject: `How did we do, ${contact.name?.split(" ")[0] || "there"}?`,
                html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:32px">
                  <h2>Thank you for working with us!</h2>
                  <p>Hi ${contact.name?.split(" ")[0] || "there"}, we just wrapped up ${project.name} and we'd love to hear your feedback.</p>
                  ${reviewUrl ? `<p style="margin:24px 0"><a href="${reviewUrl}" style="background:#C8A44E;color:#0A0A0A;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:600">Leave a Review</a></p>` : ""}
                </div>`,
              });

              // Mark review_requested_at
              await db.from("contacts").update({ review_requested_at: new Date().toISOString() }).eq("id", project.contact_id);
            } else if (auto.action === "send_email") {
              const config = auto.action_config as Record<string, string> || {};
              await sendEmail({
                businessSlug: auto.businesses?.slug || "kovra",
                businessName: auto.businesses?.name || "Kovra",
                to: contact.email,
                subject: config.subject || `Your project is complete!`,
                html: config.body || `<p>Hi ${contact.name?.split(" ")[0] || "there"}, your project ${project.name} is now complete. Thank you!</p>`,
              });
            }
            result.triggered++;
          } catch {
            result.errors++;
          }
        }
      }

      // Update last_run_at
      await db.from("automations").update({ last_run_at: new Date().toISOString() }).eq("id", auto.id);
    } catch {
      result.errors++;
    }

    results.push(result);
  }

  return NextResponse.json({ ok: true, results });
}
