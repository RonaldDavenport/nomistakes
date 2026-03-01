"use client";

import { useEffect, useState } from "react";
import { useBusinessContext } from "@/components/dashboard/BusinessProvider";
import { useParams, useRouter } from "next/navigation";
import { T, CTA_GRAD, glassCard } from "@/lib/design-tokens";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  meta_description: string;
  keywords: string[];
  status: "draft" | "published";
  published_at: string | null;
  word_count: number;
  created_at: string;
}

export default function ContentPage() {
  const params = useParams();
  const router = useRouter();
  const businessId = params.businessId as string;
  const { business } = useBusinessContext();

  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [editContent, setEditContent] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [businessId]);

  async function fetchPosts() {
    setLoading(true);
    try {
      const res = await fetch(`/api/blog?businessId=${businessId}`);
      if (res.ok) {
        const data = await res.json();
        setPosts(data.posts || []);
      }
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }

  async function togglePublish(post: BlogPost) {
    const newStatus = post.status === "published" ? "draft" : "published";
    const res = await fetch("/api/blog", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ postId: post.id, status: newStatus }),
    });
    if (res.ok) {
      setPosts((prev) =>
        prev.map((p) =>
          p.id === post.id ? { ...p, status: newStatus, published_at: newStatus === "published" ? new Date().toISOString() : p.published_at } : p
        )
      );
    }
  }

  async function deletePost(postId: string) {
    if (!confirm("Delete this post? This can't be undone.")) return;
    const res = await fetch("/api/blog", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ postId }),
    });
    if (res.ok) {
      setPosts((prev) => prev.filter((p) => p.id !== postId));
      if (editingPost?.id === postId) {
        setEditingPost(null);
        setEditContent("");
      }
    }
  }

  async function saveEdit() {
    if (!editingPost) return;
    setSaving(true);
    const res = await fetch("/api/blog", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ postId: editingPost.id, content: editContent }),
    });
    if (res.ok) {
      const { post } = await res.json();
      setPosts((prev) => prev.map((p) => (p.id === editingPost.id ? post : p)));
      setEditingPost(null);
      setEditContent("");
    }
    setSaving(false);
  }

  if (!business) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <div className="w-8 h-8 rounded-full animate-spin" style={{ border: `2px solid ${T.purple}`, borderTopColor: "transparent" }} />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold mb-1" style={{ color: T.text, fontFamily: T.h }}>Content</h1>
          <p className="text-sm" style={{ color: T.text3 }}>
            Manage blog posts for {business.name as string}. Create new posts from the AI Editor.
          </p>
        </div>
        <button
          onClick={() => router.push(`/dashboard/${businessId}/editor`)}
          className="px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 shrink-0"
          style={{ background: CTA_GRAD, color: "#fff" }}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
          </svg>
          Write with AI
        </button>
      </div>

      {/* Inline editor */}
      {editingPost && (
        <div className="mb-6 rounded-xl overflow-hidden" style={{ ...glassCard }}>
          <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: `1px solid ${T.border}` }}>
            <span className="text-sm font-medium" style={{ color: T.text }}>{editingPost.title}</span>
            <div className="flex items-center gap-2">
              <button
                onClick={saveEdit}
                disabled={saving}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold"
                style={{ background: CTA_GRAD, color: "#fff" }}
              >
                {saving ? "Saving..." : "Save"}
              </button>
              <button
                onClick={() => { setEditingPost(null); setEditContent(""); }}
                className="transition text-xs px-2 py-1.5"
                style={{ color: T.text3 }}
              >
                Cancel
              </button>
            </div>
          </div>
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            rows={20}
            className="w-full px-4 py-3 text-sm font-mono focus:outline-none resize-y"
            style={{ background: "rgba(0,0,0,0.20)", color: T.text }}
            placeholder="Markdown content..."
          />
        </div>
      )}

      {/* Posts list */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-6 h-6 rounded-full animate-spin" style={{ border: `2px solid ${T.purple}`, borderTopColor: "transparent" }} />
        </div>
      ) : posts.length === 0 ? (
        <div className="rounded-xl p-8 text-center" style={{ ...glassCard }}>
          <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4" style={{ background: "rgba(123,57,252,0.10)" }}>
            <svg className="w-6 h-6" style={{ color: T.purpleLight }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold mb-2" style={{ color: T.text, fontFamily: T.h }}>No blog posts yet</h2>
          <p className="text-sm max-w-md mx-auto leading-relaxed mb-4" style={{ color: T.text3 }}>
            Ask the AI Editor to &ldquo;write a blog post about...&rdquo; and it will generate SEO-optimized content
            tailored to your business.
          </p>
          <button
            onClick={() => router.push(`/dashboard/${businessId}/editor`)}
            className="px-4 py-2 rounded-lg text-sm font-semibold"
            style={{ background: CTA_GRAD, color: "#fff" }}
          >
            Go to Editor
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {posts.map((post) => (
            <div
              key={post.id}
              className="rounded-xl p-4 flex items-start gap-4 transition"
              style={{ ...glassCard }}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-sm font-semibold truncate" style={{ color: T.text }}>{post.title}</h3>
                  <span
                    className="text-[10px] font-medium px-2 py-0.5 rounded-full shrink-0"
                    style={{
                      backgroundColor: post.status === "published" ? "rgba(34,197,94,0.15)" : "rgba(245,158,11,0.15)",
                      color: post.status === "published" ? T.green : T.gold,
                    }}
                  >
                    {post.status}
                  </span>
                </div>
                <p className="text-xs truncate mb-1" style={{ color: T.text3 }}>
                  {post.meta_description || "No description"}
                </p>
                <div className="flex items-center gap-3 text-[10px]" style={{ color: T.text3 }}>
                  <span>{post.word_count} words</span>
                  <span>/{post.slug}</span>
                  <span>{new Date(post.created_at).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => { setEditingPost(post); setEditContent(post.content); }}
                  className="p-1.5 rounded-lg transition"
                  style={{ color: T.text3 }}
                  title="Edit content"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                  </svg>
                </button>
                <button
                  onClick={() => togglePublish(post)}
                  className="p-1.5 rounded-lg transition"
                  style={{ color: T.text3 }}
                  title={post.status === "published" ? "Unpublish" : "Publish"}
                >
                  {post.status === "published" ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  )}
                </button>
                <button
                  onClick={() => deletePost(post.id)}
                  className="p-1.5 rounded-lg transition"
                  style={{ color: T.text3 }}
                  title="Delete"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
