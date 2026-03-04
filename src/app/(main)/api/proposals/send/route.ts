import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { sendEmail, SYSTEM_TEMPLATES } from "@/lib/email";

// POST /api/proposals/send — send proposal to contact
export async function POST(req: NextRequest) {
  const { proposalId, message } = await req.json();

  if (!proposalId) {
    return NextResponse.json({ error: "proposalId required" }, { status: 400 });
  }

  const db = createServerClient();

  // Fetch proposal with contact and business info
  const { data: proposal, error } = await db
    .from("proposals")
    .select("*, contacts(name, email), businesses:business_id(name, slug, brand)")
    .eq("id", proposalId)
    .single();

  if (error || !proposal) {
    return NextResponse.json({ error: "Proposal not found" }, { status: 404 });
  }

  const contact = proposal.contacts as { name: string; email: string } | null;
  const business = proposal.businesses as { name: string; slug: string; brand: Record<string, unknown> | null } | null;

  if (!contact?.email || !business) {
    return NextResponse.json({ error: "Missing contact email or business info" }, { status: 400 });
  }

  // Build proposal URL
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");
  const proposalUrl = `${baseUrl}/proposal/${proposalId}?token=${proposal.access_token}`;

  // Use "Proposal Sent" system template
  const template = SYSTEM_TEMPLATES.find((t) => t.name === "Proposal Sent");
  const subject = template?.subject || `Your proposal from ${business.name}`;
  const bodyHtml = template?.body_html || `<p>Hi ${contact.name}, your proposal is ready. <a href="${proposalUrl}">View Proposal</a></p>`;

  // Create email record
  const { data: emailRecord } = await db
    .from("emails")
    .insert({
      business_id: proposal.business_id,
      user_id: proposal.user_id,
      contact_id: proposal.contact_id,
      from_address: `${business.slug}@${process.env.MAIL_DOMAIN || "mail.kovra.com"}`,
      to_address: contact.email,
      subject,
      body_html: bodyHtml,
      status: "sent",
      metadata: { proposal_id: proposalId, message },
    })
    .select("id")
    .single();

  try {
    const { resendId } = await sendEmail(
      {
        businessSlug: business.slug,
        businessName: business.name,
        to: contact.email,
        subject,
        html: bodyHtml,
        trackingEmailId: emailRecord?.id,
      },
      {
        name: contact.name,
        business_name: business.name,
        proposal_url: proposalUrl,
      }
    );

    // Update email with resend ID
    if (emailRecord?.id && resendId) {
      await db.from("emails").update({ resend_id: resendId }).eq("id", emailRecord.id);
    }
  } catch (err) {
    console.error("[proposals/send] Email send error:", err);
    // Don't fail the whole request — proposal status still updates
  }

  // Update proposal status
  const now = new Date().toISOString();
  await db
    .from("proposals")
    .update({ status: "sent", sent_at: now, updated_at: now })
    .eq("id", proposalId);

  // Log activity
  db.from("contact_activity").insert({
    contact_id: proposal.contact_id,
    business_id: proposal.business_id,
    type: "proposal_sent",
    title: "Proposal sent",
    description: proposal.title,
    metadata: { proposal_id: proposalId },
  }).then(({ error: actErr }) => {
    if (actErr) console.error("[proposals/send] Activity log error:", actErr.message);
  });

  // Update contact last_contacted_at
  db.from("contacts")
    .update({ last_contacted_at: now })
    .eq("id", proposal.contact_id)
    .then(({ error: ctErr }) => {
      if (ctErr) console.error("[proposals/send] Contact update error:", ctErr.message);
    });

  return NextResponse.json({ success: true });
}
