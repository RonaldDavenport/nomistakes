"use client";

const POSTS = [
  { title: "5 Tips for First-Time Sellers", status: "Published", date: "Feb 25, 2026", views: "1,247" },
  { title: "How to Price Your Products Right", status: "Published", date: "Feb 18, 2026", views: "892" },
  { title: "Building Trust With Customers Online", status: "Draft", date: "—", views: "—" },
  { title: "The Power of User-Generated Content", status: "Scheduled", date: "Mar 1, 2026", views: "—" },
  { title: "SEO Basics: Getting Found on Google", status: "Published", date: "Feb 10, 2026", views: "2,103" },
];

export default function ContentPage() {
  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Content</h1>
          <p className="text-zinc-500 text-sm">AI-generated blog posts, optimized for SEO.</p>
        </div>
        <button className="btn-primary px-5 py-2.5 rounded-lg text-sm font-semibold text-white">
          + Generate Post
        </button>
      </div>

      <div className="rounded-xl border border-white/5 bg-surface/50 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/5 text-zinc-500">
              <th className="text-left p-4 font-medium">Title</th>
              <th className="text-left p-4 font-medium">Status</th>
              <th className="text-left p-4 font-medium">Date</th>
              <th className="text-right p-4 font-medium">Views</th>
            </tr>
          </thead>
          <tbody>
            {POSTS.map((post) => (
              <tr key={post.title} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition">
                <td className="p-4 text-white font-medium">{post.title}</td>
                <td className="p-4">
                  <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                    post.status === "Published" ? "bg-emerald-500/10 text-emerald-400" :
                    post.status === "Draft" ? "bg-zinc-500/10 text-zinc-400" :
                    "bg-amber-500/10 text-amber-400"
                  }`}>{post.status}</span>
                </td>
                <td className="p-4 text-zinc-500">{post.date}</td>
                <td className="p-4 text-zinc-400 text-right">{post.views}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
