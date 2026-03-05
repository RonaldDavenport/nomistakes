import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

// GET /api/files?businessId=X&projectId=Y&contactId=Z&invoiceId=W
export async function GET(req: NextRequest) {
  const businessId = req.nextUrl.searchParams.get("businessId");
  if (!businessId) {
    return NextResponse.json({ error: "businessId required" }, { status: 400 });
  }

  const projectId = req.nextUrl.searchParams.get("projectId");
  const contactId = req.nextUrl.searchParams.get("contactId");
  const invoiceId = req.nextUrl.searchParams.get("invoiceId");

  const db = createServerClient();
  const { data: { user } } = await db.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: biz } = await db.from("businesses").select("id").eq("id", businessId).eq("user_id", user.id).maybeSingle();
  if (!biz) return NextResponse.json({ error: "Not found" }, { status: 404 });
  let query = db
    .from("file_attachments")
    .select("*")
    .eq("business_id", businessId)
    .order("created_at", { ascending: false });

  if (projectId) query = query.eq("project_id", projectId);
  if (contactId) query = query.eq("contact_id", contactId);
  if (invoiceId) query = query.eq("invoice_id", invoiceId);

  const { data, error } = await query;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Generate signed download URLs
  const bucket = process.env.SUPABASE_STORAGE_BUCKET || "attachments";
  const filesWithUrls = await Promise.all(
    (data || []).map(async (file) => {
      const { data: signed } = await db.storage
        .from(bucket)
        .createSignedUrl(file.storage_path, 86400);
      return { ...file, download_url: signed?.signedUrl || null };
    })
  );

  return NextResponse.json({ files: filesWithUrls });
}

// POST /api/files — register a file after upload
export async function POST(req: NextRequest) {
  const db = createServerClient();
  const { data: { user } } = await db.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { businessId, projectId, contactId, invoiceId, filename, storagePath, sizeBytes, mimeType } = await req.json();
  if (!businessId || !filename || !storagePath) {
    return NextResponse.json({ error: "businessId, filename, and storagePath required" }, { status: 400 });
  }

  const { data: biz } = await db.from("businesses").select("id").eq("id", businessId).eq("user_id", user.id).maybeSingle();
  if (!biz) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { data, error } = await db
    .from("file_attachments")
    .insert({
      business_id: businessId,
      user_id: user.id,
      project_id: projectId || null,
      contact_id: contactId || null,
      invoice_id: invoiceId || null,
      filename,
      storage_path: storagePath,
      size_bytes: sizeBytes || null,
      mime_type: mimeType || null,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ file: data }, { status: 201 });
}

// DELETE /api/files
export async function DELETE(req: NextRequest) {
  const db = createServerClient();
  const { data: { user } } = await db.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { fileId } = await req.json();
  if (!fileId) {
    return NextResponse.json({ error: "fileId required" }, { status: 400 });
  }

  // Get path before deleting record
  const { data: file } = await db
    .from("file_attachments")
    .select("storage_path")
    .eq("id", fileId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!file) {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }

  // Delete from storage
  const bucket = process.env.SUPABASE_STORAGE_BUCKET || "attachments";
  await db.storage.from(bucket).remove([file.storage_path]);

  // Delete record
  const { error } = await db
    .from("file_attachments")
    .delete()
    .eq("id", fileId)
    .eq("user_id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
