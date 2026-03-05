import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

// DELETE /api/team/[id]
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const db = createServerClient();
  const { data: { user } } = await db.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Only the person who invited can remove (invited_by = current user)
  const { error } = await db
    .from("team_members")
    .delete()
    .eq("id", id)
    .eq("invited_by", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
