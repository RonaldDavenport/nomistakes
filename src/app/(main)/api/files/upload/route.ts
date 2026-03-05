import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

// POST /api/files/upload — returns a presigned upload URL
export async function POST(req: NextRequest) {
  const db = createServerClient();
  const { data: { user } } = await db.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { businessId, filename, mimeType } = await req.json();
  if (!businessId || !filename) {
    return NextResponse.json({ error: "businessId and filename required" }, { status: 400 });
  }

  const { data: biz } = await db.from("businesses").select("id").eq("id", businessId).eq("user_id", user.id).maybeSingle();
  if (!biz) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Validate file extension
  const allowedExtensions = [
    "pdf", "doc", "docx", "xls", "xlsx", "ppt", "pptx",
    "png", "jpg", "jpeg", "gif", "webp", "svg",
    "txt", "csv", "zip",
  ];
  const ext = filename.split(".").pop()?.toLowerCase() || "";
  if (!allowedExtensions.includes(ext)) {
    return NextResponse.json({ error: "File type not allowed" }, { status: 400 });
  }

  const sanitizedName = filename.replace(/[^a-zA-Z0-9._-]/g, "_");
  const storagePath = `${businessId}/${user.id}/${Date.now()}_${sanitizedName}`;
  const bucket = process.env.SUPABASE_STORAGE_BUCKET || "attachments";

  const { data, error } = await db.storage
    .from(bucket)
    .createSignedUploadUrl(storagePath);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    uploadUrl: data.signedUrl,
    storagePath,
    token: data.token,
  });
}
