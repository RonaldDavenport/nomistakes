import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

// 1x1 transparent GIF
const PIXEL = Buffer.from("R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7", "base64");

// GET /api/email/track/open?eid=X — open tracking pixel
export async function GET(req: NextRequest) {
  const emailId = req.nextUrl.searchParams.get("eid");

  if (emailId) {
    const db = createServerClient();

    // Update email open stats
    const { data: email } = await db
      .from("emails")
      .select("id, contact_id, business_id, open_count")
      .eq("id", emailId)
      .single();

    if (email) {
      const updates: Record<string, unknown> = {
        open_count: (email.open_count || 0) + 1,
      };
      if (email.open_count === 0) {
        updates.opened_at = new Date().toISOString();
      }

      await db.from("emails").update(updates).eq("id", emailId);

      // Log activity (fire-and-forget)
      if (email.contact_id) {
        db.from("contact_activity").insert({
          contact_id: email.contact_id,
          business_id: email.business_id,
          type: "email_opened",
          title: "Email opened",
          metadata: { email_id: emailId },
        }).then(({ error }) => {
          if (error) console.error("[email/track/open] Activity log error:", error.message);
        });
      }
    }
  }

  return new NextResponse(PIXEL, {
    headers: {
      "Content-Type": "image/gif",
      "Cache-Control": "no-store, no-cache, must-revalidate",
    },
  });
}
