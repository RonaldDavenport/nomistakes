"use client";

function BarChart() {
  const data = [
    { label: "Mon", value: 65 },
    { label: "Tue", value: 82 },
    { label: "Wed", value: 71 },
    { label: "Thu", value: 94 },
    { label: "Fri", value: 88 },
    { label: "Sat", value: 43 },
    { label: "Sun", value: 37 },
  ];
  const max = Math.max(...data.map((d) => d.value));
  const w = 400, h = 180, pad = 30, barW = 32;
  const gap = (w - pad * 2 - barW * data.length) / (data.length - 1);

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-auto">
      {data.map((d, i) => {
        const x = pad + i * (barW + gap);
        const barH = (d.value / max) * (h - pad * 2);
        const y = h - pad - barH;
        return (
          <g key={i}>
            <rect x={x} y={y} width={barW} height={barH} rx="4" fill="#4c6ef5" fillOpacity="0.7" />
            <text x={x + barW / 2} y={h - 10} textAnchor="middle" fill="#71717a" fontSize="10">{d.label}</text>
            <text x={x + barW / 2} y={y - 6} textAnchor="middle" fill="#a1a1aa" fontSize="9">{d.value}</text>
          </g>
        );
      })}
    </svg>
  );
}

export default function AnalyticsPage() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-1">Analytics</h1>
        <p className="text-zinc-500 text-sm">Deep dive into your business performance.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Page Views", value: "34,291", change: "+14%" },
          { label: "Unique Visitors", value: "12,493", change: "+18%" },
          { label: "Bounce Rate", value: "38.2%", change: "-3.1%" },
          { label: "Avg Session", value: "4m 12s", change: "+22s" },
        ].map((s) => (
          <div key={s.label} className="p-5 rounded-xl border border-white/5 bg-surface/50">
            <p className="text-zinc-500 text-xs font-medium mb-1">{s.label}</p>
            <p className="text-2xl font-bold text-white mb-1">{s.value}</p>
            <span className="text-xs font-medium text-emerald-400">{s.change}</span>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-5 mb-8">
        <div className="p-6 rounded-xl border border-white/5 bg-surface/50">
          <h3 className="text-white font-semibold mb-4">Visitors This Week</h3>
          <BarChart />
        </div>
        <div className="p-6 rounded-xl border border-white/5 bg-surface/50">
          <h3 className="text-white font-semibold mb-4">Top Pages</h3>
          <div className="space-y-3">
            {[
              { page: "/", views: "8,241", pct: 65 },
              { page: "/products", views: "3,412", pct: 42 },
              { page: "/blog/5-tips", views: "2,103", pct: 28 },
              { page: "/about", views: "1,290", pct: 18 },
              { page: "/contact", views: "847", pct: 12 },
            ].map((p) => (
              <div key={p.page} className="flex items-center gap-4">
                <span className="text-sm text-white font-mono w-32 truncate">{p.page}</span>
                <div className="flex-1 h-2 rounded-full bg-white/5 overflow-hidden">
                  <div className="h-full rounded-full bg-brand-600/60" style={{ width: `${p.pct}%` }} />
                </div>
                <span className="text-xs text-zinc-500 w-16 text-right">{p.views}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="p-6 rounded-xl border border-white/5 bg-surface/50">
        <h3 className="text-white font-semibold mb-4">Top Keywords</h3>
        <div className="grid md:grid-cols-2 gap-3">
          {[
            { keyword: "best online store builder", position: 3, change: "+2" },
            { keyword: "start business with AI", position: 5, change: "+4" },
            { keyword: "automated ecommerce", position: 8, change: "+1" },
            { keyword: "AI business generator", position: 2, change: "new" },
            { keyword: "no code business", position: 11, change: "+6" },
            { keyword: "passive income AI", position: 14, change: "+3" },
          ].map((k) => (
            <div key={k.keyword} className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.02]">
              <span className="w-8 h-8 rounded-lg bg-brand-600/10 flex items-center justify-center text-brand-400 text-xs font-bold">#{k.position}</span>
              <span className="flex-1 text-sm text-zinc-300">{k.keyword}</span>
              <span className="text-xs font-medium text-emerald-400">{k.change}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
