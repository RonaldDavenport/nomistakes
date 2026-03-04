import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

// GET /api/email/track/click?eid=X&url=Y — click tracking redirect
export async function GET(req: NextRequest) {
  const emailId = req.nextUrl.searchParams.get("eid");
  const targetUrl = req.nextUrl.searchParams.get("url");

  if (!targetUrl) {
    return NextResponse.json({ error: "url required" }, { status: 400 });
  }

  if (emailId) {
    const db = createServerClient();

    const { data: email } = await db
      .from("emails")
      .select("id, contact_id, business_id, click_count")
      .eq("id", emailId)
      .single();

    if (email) {
      const updates: Record<string, unknown> = {
        click_count: (email.click_count || 0) + 1,
      };
      if (email.click_count === 0) {
        updates.clicked_at = new Date().toISOString();
      }

      await db.from("emails").update(updates).eq("id", emailId);

      // Log activity (fire-and-forget)
      if (email.contact_id) {
        db.from("contact_activity").insert({
          contact_id: email.contact_id,
          business_id: email.business_id,
          type: "email_clicked",
          title: "Email link clicked",
          metadata: { email_id: emailId, url: targetUrl },
        }).then(({ error }) => {
          if (error) console.error("[email/track/click] Activity log error:", error.message);
        });
      }
    }
  }

  return NextResponse.redirect(decodeURIComponent(targetUrl), 302);
}
