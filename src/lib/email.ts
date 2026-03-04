// Resend email sending + open/click tracking

import { Resend } from "resend";

let _resend: Resend | null = null;
function getResend(): Resend {
  if (!_resend) {
    _resend = new Resend(process.env.RESEND_API_KEY);
  }
  return _resend;
}

const MAIL_DOMAIN = process.env.MAIL_DOMAIN || "mail.kovra.com";

interface SendEmailParams {
  businessSlug: string;
  businessName: string;
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
  trackingEmailId?: string;
}

// Replace template variables in subject + body
function replaceVariables(text: string, vars: Record<string, string>): string {
  let result = text;
  for (const [key, value] of Object.entries(vars)) {
    result = result.replace(new RegExp(`\\{\\{${key}\\}\\}`, "g"), value);
  }
  return result;
}

// Add open tracking pixel and click tracking to HTML
function addTracking(html: string, emailId: string, baseUrl: string): string {
  let tracked = html;

  // Rewrite links for click tracking
  tracked = tracked.replace(
    /href="(https?:\/\/[^"]+)"/g,
    (_, url) => `href="${baseUrl}/api/email/track/click?eid=${emailId}&url=${encodeURIComponent(url)}"`
  );

  // Add open tracking pixel before </body> or at end
  const pixel = `<img src="${baseUrl}/api/email/track/open?eid=${emailId}" width="1" height="1" style="display:none" alt="" />`;
  if (tracked.includes("</body>")) {
    tracked = tracked.replace("</body>", `${pixel}</body>`);
  } else {
    tracked += pixel;
  }

  return tracked;
}

export async function sendEmail(params: SendEmailParams, variables?: Record<string, string>) {
  const { businessSlug, businessName, to, subject, html, replyTo, trackingEmailId } = params;
  const from = `${businessName} <${businessSlug}@${MAIL_DOMAIN}>`;

  // Apply template variables
  let processedSubject = subject;
  let processedHtml = html;
  if (variables) {
    processedSubject = replaceVariables(processedSubject, variables);
    processedHtml = replaceVariables(processedHtml, variables);
  }

  // Add tracking if we have an email ID
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000";

  if (trackingEmailId) {
    processedHtml = addTracking(processedHtml, trackingEmailId, baseUrl);
  }

  const { data, error } = await getResend().emails.send({
    from,
    to: [to],
    subject: processedSubject,
    html: processedHtml,
    replyTo: replyTo || undefined,
  });

  if (error) {
    throw new Error(`Resend error: ${error.message}`);
  }

  return { resendId: data?.id || null };
}

// System email templates (seeded on first CRM access)
export const SYSTEM_TEMPLATES = [
  {
    name: "Booking Confirmation",
    subject: "Your call with {{business_name}} is confirmed",
    category: "booking",
    variables: ["name", "business_name", "date", "time", "duration"],
    body_html: `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 32px;">
  <h2 style="margin-bottom: 16px;">Your call is confirmed!</h2>
  <p>Hi {{name}},</p>
  <p>Your discovery call with <strong>{{business_name}}</strong> has been scheduled.</p>
  <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
    <p style="margin: 4px 0;"><strong>Date:</strong> {{date}}</p>
    <p style="margin: 4px 0;"><strong>Time:</strong> {{time}}</p>
    <p style="margin: 4px 0;"><strong>Duration:</strong> {{duration}} minutes</p>
  </div>
  <p>We look forward to speaking with you!</p>
</div>`,
  },
  {
    name: "24h Reminder",
    subject: "Reminder: Your call with {{business_name}} is tomorrow",
    category: "reminder",
    variables: ["name", "business_name", "date", "time"],
    body_html: `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 32px;">
  <h2 style="margin-bottom: 16px;">Reminder: Call Tomorrow</h2>
  <p>Hi {{name}},</p>
  <p>Just a friendly reminder that your discovery call with <strong>{{business_name}}</strong> is tomorrow.</p>
  <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
    <p style="margin: 4px 0;"><strong>Date:</strong> {{date}}</p>
    <p style="margin: 4px 0;"><strong>Time:</strong> {{time}}</p>
  </div>
  <p>See you then!</p>
</div>`,
  },
  {
    name: "1h Reminder",
    subject: "Starting soon: Your call with {{business_name}}",
    category: "reminder",
    variables: ["name", "business_name", "time"],
    body_html: `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 32px;">
  <h2 style="margin-bottom: 16px;">Your call starts in 1 hour</h2>
  <p>Hi {{name}},</p>
  <p>Your discovery call with <strong>{{business_name}}</strong> starts at <strong>{{time}}</strong>.</p>
  <p>Make sure you're ready!</p>
</div>`,
  },
  {
    name: "Proposal Sent",
    subject: "Your proposal from {{business_name}}",
    category: "proposal",
    variables: ["name", "business_name", "proposal_url"],
    body_html: `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 32px;">
  <h2 style="margin-bottom: 16px;">Your Proposal is Ready</h2>
  <p>Hi {{name}},</p>
  <p>Thank you for your time! We've prepared a proposal for you.</p>
  <p style="margin: 24px 0;">
    <a href="{{proposal_url}}" style="background: #C8A44E; color: #0A0A0A; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600;">View Proposal</a>
  </p>
  <p>If you have any questions, just reply to this email.</p>
  <p>Best,<br/>{{business_name}}</p>
</div>`,
  },
];
