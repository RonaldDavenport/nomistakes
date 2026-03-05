import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

// GET /api/sign/[token] — public, no auth
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const db = createServerClient();

  const { data, error } = await db
    .from("contracts")
    .select("id, title, body, signed_at, signer_name, created_at, businesses(name)")
    .eq("sign_token", token)
    .maybeSingle();

  if (error || !data) {
    return NextResponse.json({ error: "Contract not found" }, { status: 404 });
  }

  return NextResponse.json({ contract: data });
}

// POST /api/sign/[token] — public, records signature
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const db = createServerClient();

  const { signerName } = await req.json();
  if (!signerName || typeof signerName !== "string" || signerName.trim().length < 2) {
    return NextResponse.json({ error: "Full name required to sign" }, { status: 400 });
  }

  // Check contract exists and isn't already signed
  const { data: existing } = await db
    .from("contracts")
    .select("id, signed_at")
    .eq("sign_token", token)
    .maybeSingle();

  if (!existing) {
    return NextResponse.json({ error: "Contract not found" }, { status: 404 });
  }

  if (existing.signed_at) {
    return NextResponse.json({ error: "Contract already signed" }, { status: 409 });
  }

  // Get IP from headers (Vercel/Cloudflare)
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown";

  const { data, error } = await db
    .from("contracts")
    .update({
      signed_at: new Date().toISOString(),
      signer_name: signerName.trim(),
      signer_ip: ip,
    })
    .eq("sign_token", token)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ contract: data });
}
