import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

function escapeIcs(str: string): string {
  return str
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n");
}

function formatIcsDate(iso: string): string {
  return iso.replace(/[-:]/g, "").split(".")[0] + "Z";
}

// GET /api/calendar/[businessId]/feed.ics — public ICS feed
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ businessId: string }> }
) {
  const { businessId } = await params;
  const db = createServerClient();

  const { data: biz } = await db
    .from("businesses")
    .select("name")
    .eq("id", businessId)
    .maybeSingle();

  if (!biz) {
    return new NextResponse("Business not found", { status: 404 });
  }

  const { data: calls } = await db
    .from("discovery_calls")
    .select("id, name, email, scheduled_at, duration_minutes, status, notes")
    .eq("business_id", businessId)
    .in("status", ["scheduled", "confirmed"])
    .order("scheduled_at", { ascending: true })
    .limit(500);

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://kovra.app";
  const now = formatIcsDate(new Date().toISOString());

  const events = (calls || []).map((call) => {
    const start = formatIcsDate(call.scheduled_at);
    const endMs = new Date(call.scheduled_at).getTime() + (call.duration_minutes || 30) * 60000;
    const end = formatIcsDate(new Date(endMs).toISOString());
    const uid = `${call.id}@kovra.app`;
    const summary = escapeIcs(`${call.name} — Discovery Call`);
    const description = call.notes ? escapeIcs(call.notes) : "";

    return [
      "BEGIN:VEVENT",
      `UID:${uid}`,
      `DTSTAMP:${now}`,
      `DTSTART:${start}`,
      `DTEND:${end}`,
      `SUMMARY:${summary}`,
      description ? `DESCRIPTION:${description}` : null,
      `ORGANIZER:${appUrl}`,
      "END:VEVENT",
    ]
      .filter(Boolean)
      .join("\r\n");
  });

  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    `PRODID:-//Kovra//Booking Calendar//EN`,
    `X-WR-CALNAME:${escapeIcs(biz.name)} Bookings`,
    "X-WR-TIMEZONE:UTC",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    ...events,
    "END:VCALENDAR",
  ].join("\r\n");

  return new NextResponse(ics, {
    status: 200,
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="kovra-bookings.ics"`,
      "Cache-Control": "no-cache, no-store",
    },
  });
}
