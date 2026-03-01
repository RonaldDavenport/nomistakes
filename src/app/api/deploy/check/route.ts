import { NextResponse } from "next/server";

// GET /api/deploy/check — Diagnostic endpoint to verify deploy prerequisites
export async function GET() {
  const checks: Record<string, { ok: boolean; detail: string }> = {};

  // 1. VERCEL_TOKEN
  const token = process.env.VERCEL_TOKEN || "";
  checks.vercel_token = {
    ok: token.length > 0,
    detail: token.length > 0
      ? `Set (${token.length} chars, starts with ${token.slice(0, 4)}...)`
      : "MISSING — set VERCEL_TOKEN env var",
  };

  // 2. VERCEL_TEAM_ID
  const teamId = process.env.VERCEL_TEAM_ID || "";
  checks.vercel_team_id = {
    ok: true, // optional
    detail: teamId ? `Set (${teamId.slice(0, 8)}...)` : "Not set (using personal scope)",
  };

  // 3. Supabase
  checks.supabase_url = {
    ok: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    detail: process.env.NEXT_PUBLIC_SUPABASE_URL || "MISSING",
  };
  checks.supabase_service_key = {
    ok: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    detail: process.env.SUPABASE_SERVICE_ROLE_KEY ? "Set" : "MISSING",
  };

  // 4. Test Vercel API connectivity
  if (token) {
    try {
      const teamParam = teamId ? `?teamId=${teamId}` : "";
      const res = await fetch(`https://api.vercel.com/v9/projects${teamParam}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const data = await res.json();
      if (res.ok) {
        const projectCount = data.projects?.length || 0;
        checks.vercel_api = {
          ok: true,
          detail: `Connected — ${projectCount} projects found`,
        };
      } else {
        checks.vercel_api = {
          ok: false,
          detail: `API error ${res.status}: ${JSON.stringify(data.error || data)}`,
        };
      }
    } catch (err) {
      checks.vercel_api = {
        ok: false,
        detail: `Network error: ${err instanceof Error ? err.message : String(err)}`,
      };
    }
  } else {
    checks.vercel_api = { ok: false, detail: "Skipped — no token" };
  }

  const allOk = Object.values(checks).every((c) => c.ok);

  return NextResponse.json({ allOk, checks });
}
