import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { sendEmail } from "@/lib/email";
import { deductCredits, requireCredits, InsufficientCreditsError } from "@/lib/credits";

// POST /api/email/send — send an email to a contact
export async function POST(req: NextRequest) {
  const { businessId, userId, contactId, subject, bodyHtml, templateId } = await req.json();

  if (!businessId || !userId || !contactId || !subject || !bodyHtml) {
    return NextResponse.json({ error: "businessId, userId, contactId, subject, and bodyHtml are required" }, { status: 400 });
  }

  const db = createServerClient();

  // Fetch business
  const { data: business } = await db
    .from("businesses")
    .select("name, slug")
    .eq("id", businessId)
    .single();

  if (!business) {
    return NextResponse.json({ error: "Business not found" }, { status: 404 });
  }

  // Fetch contact
  const { data: contact } = await db
    .from("contacts")
    .select("id, email, name")
    .eq("id", contactId)
    .single();

  if (!contact) {
    return NextResponse.json({ error: "Contact not found" }, { status: 404 });
  }

  // Check credits
  try {
    await requireCredits(userId, businessId, 1);
  } catch (err) {
    if (err instanceof InsufficientCreditsError) {
      return NextResponse.json({ error: "Insufficient credits", required: err.required, available: err.available }, { status: 402 });
    }
    throw err;
  }

  // Create email record
  const fromAddress = `${business.name} <${business.slug}@${process.env.MAIL_DOMAIN || "mail.kovra.com"}>`;

  const { data: emailRow, error: insertErr } = await db
    .from("emails")
    .insert({
      business_id: businessId,
      user_id: userId,
      contact_id: contactId,
      template_id: templateId || null,
      from_address: fromAddress,
      to_address: contact.email,
      subject,
      body_html: bodyHtml,
      status: "sent",
    })
    .select()
    .single();

  if (insertErr || !emailRow) {
    return NextResponse.json({ error: insertErr?.message || "Failed to create email record" }, { status: 500 });
  }

  // Send via Resend
  try {
    const { resendId } = await sendEmail(
      {
        businessSlug: business.slug,
        businessName: business.name,
        to: contact.email,
        subject,
        html: bodyHtml,
        trackingEmailId: emailRow.id,
      },
      {
        name: contact.name || "",
        business_name: business.name,
      }
    );

    // Update with resend ID
    await db.from("emails").update({ resend_id: resendId, status: "delivered" }).eq("id", emailRow.id);

    // Deduct credits
    await deductCredits(userId, businessId, 1, "email_send", { emailId: emailRow.id });

    // Log activity
    db.from("contact_activity").insert({
      contact_id: contactId,
      business_id: businessId,
      type: "email_sent",
      title: `Email sent: ${subject}`,
      metadata: { email_id: emailRow.id },
    }).then(({ error }) => {
      if (error) console.error("[email/send] Activity log error:", error.message);
    });

    // Update contact last_contacted_at
    db.from("contacts").update({ last_contacted_at: new Date().toISOString() }).eq("id", contactId).then(({ error }) => {
      if (error) console.error("[email/send] Contact update error:", error.message);
    });

    return NextResponse.json({ email: { ...emailRow, resend_id: resendId } });
  } catch (err) {
    await db.from("emails").update({ status: "failed" }).eq("id", emailRow.id);
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
