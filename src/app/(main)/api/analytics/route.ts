import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

// GET /api/analytics?businessId=xxx&days=30
export async function GET(req: NextRequest) {
  const businessId = req.nextUrl.searchParams.get("businessId");
  const days = Math.min(parseInt(req.nextUrl.searchParams.get("days") || "30", 10), 90);

  if (!businessId) {
    return NextResponse.json({ error: "businessId required" }, { status: 400 });
  }

  const db = createServerClient();

  const { data: biz } = await db
    .from("businesses")
    .select("id")
    .eq("id", businessId)
    .maybeSingle();

  if (!biz) {
    return NextResponse.json({ error: "Business not found" }, { status: 404 });
  }

  const since = new Date(Date.now() - days * 86_400_000).toISOString();

  // Fetch all rows in window — aggregate in JS (avoids Supabase aggregate API complexity)
  const { data: rows, error } = await db
    .from("site_analytics")
    .select("session_id, page_path, referrer, event_name, event_props, created_at")
    .eq("business_id", businessId)
    .gte("created_at", since)
    .order("created_at", { ascending: false })
    .limit(10_000);

  if (error) {
    return NextResponse.json({ error: "Query failed" }, { status: 500 });
  }

  const data = rows || [];

  const pageviews = data.filter((r) => !r.event_name);
  const events = data.filter((r) => r.event_name);
  const uniqueSessions = new Set(pageviews.map((r) => r.session_id)).size;

  // Top pages
  const pageCounts: Record<string, number> = {};
  for (const r of pageviews) {
    pageCounts[r.page_path] = (pageCounts[r.page_path] || 0) + 1;
  }
  const topPages = Object.entries(pageCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([path, count]) => ({ path, count }));

  // Top referrers
  const refCounts: Record<string, number> = {};
  for (const r of pageviews) {
    if (r.referrer) {
      try {
        const host = new URL(r.referrer).hostname.replace(/^www\./, "");
        refCounts[host] = (refCounts[host] || 0) + 1;
      } catch {
        // ignore malformed referrers
      }
    }
  }
  const topReferrers = Object.entries(refCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([source, count]) => ({ source, count }));

  // Pageviews by day (last 30 days)
  const dailyCounts: Record<string, number> = {};
  for (const r of pageviews) {
    const day = r.created_at.slice(0, 10); // "YYYY-MM-DD"
    dailyCounts[day] = (dailyCounts[day] || 0) + 1;
  }

  // Fill in zeros for missing days
  const dailyData: { date: string; count: number }[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86_400_000);
    const key = d.toISOString().slice(0, 10);
    dailyData.push({ date: key, count: dailyCounts[key] || 0 });
  }

  // Recent custom events
  const recentEvents = events.slice(0, 50).map((r) => ({
    event_name: r.event_name,
    event_props: r.event_props,
    created_at: r.created_at,
  }));

  return NextResponse.json({
    summary: {
      uniqueVisitors: uniqueSessions,
      pageviews: pageviews.length,
      events: events.length,
      days,
    },
    topPages,
    topReferrers,
    dailyData,
    recentEvents,
  });
}
