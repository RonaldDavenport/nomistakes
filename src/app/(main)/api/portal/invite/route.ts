import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { sendEmail } from "@/lib/email";

// POST /api/portal/invite — send portal access link to a contact
export async function POST(req: NextRequest) {
  const { contactId, businessId } = await req.json();
  if (!contactId || !businessId) return NextResponse.json({ error: "contactId and businessId required" }, { status: 400 });

  const db = createServerClient();

  const { data: contact, error: contactErr } = await db
    .from("contacts")
    .select("id, name, email, portal_token")
    .eq("id", contactId)
    .single();

  if (contactErr || !contact) return NextResponse.json({ error: "Contact not found" }, { status: 404 });

  const { data: business } = await db
    .from("businesses")
    .select("name, slug")
    .eq("id", businessId)
    .single();

  if (!business) return NextResponse.json({ error: "Business not found" }, { status: 404 });

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const portalUrl = `${baseUrl}/portal/${businessId}?token=${contact.portal_token}`;

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 560px; margin: 0 auto;">
      <h2 style="color: #fafafa; font-size: 20px;">Your Client Portal</h2>
      <p style="color: #a1a1aa; font-size: 14px; line-height: 1.6;">
        Hi ${contact.name || "there"},<br><br>
        ${business.name} has invited you to your client portal where you can view your proposals, invoices, and project progress.
      </p>
      <a href="${portalUrl}" style="display: inline-block; margin: 20px 0; padding: 12px 28px; background: linear-gradient(135deg, #C8A44E 0%, #E8C868 100%); color: #09090B; font-weight: 600; font-size: 14px; border-radius: 8px; text-decoration: none;">
        View Your Portal
      </a>
      <p style="color: #71717a; font-size: 12px;">
        This is a private link — do not share it with others.
      </p>
    </div>
  `;

  try {
    await sendEmail({
      businessSlug: business.slug,
      businessName: business.name,
      to: contact.email,
      subject: `Your client portal — ${business.name}`,
      html,
    });

    // Log activity
    await db.from("contact_activity").insert({
      contact_id: contactId,
      business_id: businessId,
      type: "email_sent",
      title: "Portal invite sent",
      description: `Portal access link sent to ${contact.email}`,
    });

    return NextResponse.json({ success: true, portalUrl });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to send";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
