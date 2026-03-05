// Satellite infrastructure provisioning: Cloudflare DNS, Google Workspace, MailReach email warming

// ── Cloudflare ──────────────────────────────────────────────

interface CloudflareDNSRecord {
  type: "A" | "CNAME";
  name: string;
  content: string;
  ttl: number;
  proxied: boolean;
}

interface CloudflareCreateResponse {
  success: boolean;
  errors?: { code: number; message: string }[];
  result?: { id: string; zone_id: string };
}

export async function provisionSubdomain(params: {
  subdomain: string;  // e.g. "acme-consulting" (no dots, no parent domain)
  targetIp?: string;  // A record IP, or leave undefined to use CNAME
  targetCname?: string; // CNAME target (e.g. cname.vercel-dns.com)
}): Promise<{ zoneId: string; recordId: string }> {
  const apiToken = process.env.CLOUDFLARE_API_TOKEN;
  const zoneId = process.env.CLOUDFLARE_ZONE_ID;
  if (!apiToken || !zoneId) throw new Error("CLOUDFLARE_API_TOKEN and CLOUDFLARE_ZONE_ID are required");

  const record: CloudflareDNSRecord = params.targetCname
    ? { type: "CNAME", name: params.subdomain, content: params.targetCname, ttl: 1, proxied: true }
    : { type: "A", name: params.subdomain, content: params.targetIp!, ttl: 1, proxied: true };

  const res = await fetch(`https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiToken}`,
    },
    body: JSON.stringify(record),
  });

  const data: CloudflareCreateResponse = await res.json();

  if (!data.success || !data.result) {
    const msg = data.errors?.map((e) => e.message).join(", ") ?? "Unknown Cloudflare error";
    throw new Error(`Cloudflare DNS provisioning failed: ${msg}`);
  }

  return { zoneId, recordId: data.result.id };
}

// ── Google Workspace Reseller ────────────────────────────────

export async function provisionWorkspaceEmail(params: {
  domain: string;        // e.g. "acme-consulting.kovra.io"
  firstName: string;
  lastName: string;
  primaryEmail: string;  // e.g. "ron@acme-consulting.kovra.io"
}): Promise<{ customerId: string; userEmail: string }> {
  const clientEmail = process.env.GOOGLE_RESELLER_CLIENT_EMAIL;
  const privateKey = process.env.GOOGLE_RESELLER_PRIVATE_KEY?.replace(/\\n/g, "\n");
  const resellerCustomerId = process.env.GOOGLE_RESELLER_CUSTOMER_ID;

  if (!clientEmail || !privateKey || !resellerCustomerId) {
    throw new Error("Google Workspace Reseller credentials are not configured");
  }

  // Get OAuth2 access token via JWT (service account flow)
  const token = await getGoogleServiceAccountToken(clientEmail, privateKey, [
    "https://www.googleapis.com/auth/apps.order",
    "https://www.googleapis.com/auth/admin.directory.user",
  ]);

  // Create customer for the domain under the reseller account
  const customerRes = await fetch("https://reseller.googleapis.com/apps/reseller/v1/customers", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      customerDomain: params.domain,
      postalAddress: { contactName: `${params.firstName} ${params.lastName}`, countryCode: "US" },
      alternateEmail: params.primaryEmail,
    }),
  });

  if (!customerRes.ok) {
    const text = await customerRes.text().catch(() => "");
    throw new Error(`Google Workspace customer creation failed: ${customerRes.status} ${text}`);
  }

  const customer = await customerRes.json();
  const customerId: string = customer.customerId ?? customer.id;

  return { customerId, userEmail: params.primaryEmail };
}

async function getGoogleServiceAccountToken(
  clientEmail: string,
  privateKey: string,
  scopes: string[]
): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: clientEmail,
    scope: scopes.join(" "),
    aud: "https://oauth2.googleapis.com/token",
    exp: now + 3600,
    iat: now,
  };

  // Build JWT manually (no external library needed)
  const header = { alg: "RS256", typ: "JWT" };
  const encHeader = btoa(JSON.stringify(header)).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
  const encPayload = btoa(JSON.stringify(payload)).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
  const signingInput = `${encHeader}.${encPayload}`;

  // Use Node.js crypto for RS256 signing
  const { createSign } = await import("crypto");
  const sign = createSign("RSA-SHA256");
  sign.update(signingInput);
  const signature = sign.sign(privateKey, "base64").replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");

  const jwt = `${signingInput}.${signature}`;

  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });

  if (!tokenRes.ok) {
    const text = await tokenRes.text().catch(() => "");
    throw new Error(`Google OAuth token failed: ${tokenRes.status} ${text}`);
  }

  const tokenData = await tokenRes.json();
  return tokenData.access_token as string;
}

// ── MailReach Domain Warming ─────────────────────────────────

interface MailReachResponse {
  id?: string;
  campaign_id?: string;
  error?: string;
}

export async function startDomainWarming(params: {
  email: string;  // The email address to warm
  domain: string;
}): Promise<{ campaignId: string }> {
  const apiKey = process.env.MAILREACH_API_KEY;
  if (!apiKey) throw new Error("MAILREACH_API_KEY is not configured");

  const res = await fetch("https://api.mailreach.co/api/v1/email-warmers", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      email: params.email,
      domain: params.domain,
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`MailReach warming failed: ${res.status} ${text}`);
  }

  const data: MailReachResponse = await res.json();
  const campaignId = data.campaign_id ?? data.id;

  if (!campaignId) {
    throw new Error("MailReach did not return a campaign ID");
  }

  return { campaignId };
}
