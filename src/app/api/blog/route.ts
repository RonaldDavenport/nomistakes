import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

// GET — list blog posts for a business
export async function GET(req: NextRequest) {
  const businessId = req.nextUrl.searchParams.get("businessId");

  if (!businessId) {
    return NextResponse.json(
      { error: "businessId is required" },
      { status: 400 }
    );
  }

  const db = createServerClient();
  const { data: posts, error } = await db
    .from("blog_posts")
    .select("*")
    .eq("business_id", businessId)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ posts });
}

// POST — create a blog post
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { businessId, title, slug, content, meta_description, keywords } = body;

  if (!businessId || !title || !slug || !content) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  const db = createServerClient();

  // Verify business exists
  const { data: business, error: bizErr } = await db
    .from("businesses")
    .select("id")
    .eq("id", businessId)
    .single();

  if (bizErr || !business) {
    return NextResponse.json({ error: "Business not found" }, { status: 404 });
  }

  const wordCount = content.split(/\s+/).filter(Boolean).length;

  const { data: post, error } = await db
    .from("blog_posts")
    .insert({
      business_id: businessId,
      title,
      slug,
      content,
      meta_description: meta_description || "",
      keywords: keywords || [],
      word_count: wordCount,
      status: "draft",
    })
    .select()
    .single();

  if (error) {
    // Handle duplicate slug
    if (error.code === "23505") {
      return NextResponse.json(
        { error: "A post with that slug already exists" },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ post }, { status: 201 });
}

// PATCH — update a blog post (publish/unpublish, edit content)
export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const { postId, ...updates } = body;

  if (!postId) {
    return NextResponse.json({ error: "postId is required" }, { status: 400 });
  }

  const allowed = ["title", "slug", "content", "meta_description", "keywords", "status"];
  const patch: Record<string, unknown> = {};
  for (const key of allowed) {
    if (key in updates) patch[key] = updates[key];
  }

  // Set published_at when publishing
  if (patch.status === "published") {
    patch.published_at = new Date().toISOString();
  }

  // Recalculate word count if content changed
  if (typeof patch.content === "string") {
    patch.word_count = (patch.content as string).split(/\s+/).filter(Boolean).length;
  }

  const db = createServerClient();
  const { data: post, error } = await db
    .from("blog_posts")
    .update(patch)
    .eq("id", postId)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ post });
}

// DELETE — delete a blog post
export async function DELETE(req: NextRequest) {
  const { postId } = await req.json();

  if (!postId) {
    return NextResponse.json({ error: "postId is required" }, { status: 400 });
  }

  const db = createServerClient();
  const { error } = await db.from("blog_posts").delete().eq("id", postId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
