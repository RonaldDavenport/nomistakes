"use client";

/* ── SVG Charts ── */
function AreaChartSVG() {
  const data = [120, 180, 150, 280, 320, 290, 380, 420, 390, 510, 480, 560];
  const labels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const w = 600, h = 200, pad = 40;
  const maxVal = Math.max(...data);
  const xStep = (w - pad * 2) / (data.length - 1);

  const points = data.map((v, i) => ({
    x: pad + i * xStep,
    y: h - pad - (v / maxVal) * (h - pad * 2),
  }));

  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
  const areaPath = `${linePath} L${points[points.length - 1].x},${h - pad} L${points[0].x},${h - pad} Z`;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-auto">
      <defs>
        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4c6ef5" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#4c6ef5" stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* Grid lines */}
      {[0, 0.25, 0.5, 0.75, 1].map((pct) => {
        const y = h - pad - pct * (h - pad * 2);
        return <line key={pct} x1={pad} y1={y} x2={w - pad} y2={y} stroke="rgba(255,255,255,0.05)" />;
      })}
      <path d={areaPath} fill="url(#areaGrad)" />
      <path d={linePath} fill="none" stroke="#4c6ef5" strokeWidth="2" />
      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="3" fill="#4c6ef5" />
      ))}
      {/* X labels */}
      {labels.map((label, i) => (
        <text key={i} x={pad + i * xStep} y={h - 10} textAnchor="middle" fill="#71717a" fontSize="10">
          {label}
        </text>
      ))}
    </svg>
  );
}

function DonutChart({ value, label, color }: { value: number; label: string; color: string }) {
  const r = 40, c = 2 * Math.PI * r;
  const offset = c - (value / 100) * c;
  return (
    <div className="flex flex-col items-center gap-2">
      <svg width="100" height="100" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
        <circle
          cx="50" cy="50" r={r} fill="none" stroke={color} strokeWidth="8"
          strokeDasharray={c} strokeDashoffset={offset} strokeLinecap="round"
          transform="rotate(-90 50 50)"
        />
        <text x="50" y="54" textAnchor="middle" fill="white" fontSize="16" fontWeight="bold">{value}%</text>
      </svg>
      <span className="text-xs text-zinc-500">{label}</span>
    </div>
  );
}

/* ── Stat card ── */
function StatCard({ label, value, change, positive }: { label: string; value: string; change: string; positive: boolean }) {
  return (
    <div className="p-5 rounded-xl border border-white/5 bg-surface/50">
      <p className="text-zinc-500 text-xs font-medium mb-1">{label}</p>
      <p className="text-2xl font-bold text-white mb-1">{value}</p>
      <span className={`text-xs font-medium ${positive ? "text-emerald-400" : "text-red-400"}`}>
        {positive ? "+" : ""}{change} vs last month
      </span>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-1">Dashboard</h1>
        <p className="text-zinc-500 text-sm">Welcome back, Ron. Here&apos;s how your business is doing.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Revenue" value="$2,847" change="23%" positive />
        <StatCard label="Visitors" value="12,493" change="18%" positive />
        <StatCard label="Orders" value="64" change="12%" positive />
        <StatCard label="Conversion" value="3.2%" change="0.4%" positive />
      </div>

      {/* Chart + Donuts */}
      <div className="grid lg:grid-cols-3 gap-5 mb-8">
        <div className="lg:col-span-2 p-6 rounded-xl border border-white/5 bg-surface/50">
          <h3 className="text-white font-semibold mb-4">Revenue (12 months)</h3>
          <AreaChartSVG />
        </div>
        <div className="p-6 rounded-xl border border-white/5 bg-surface/50">
          <h3 className="text-white font-semibold mb-6">Traffic Sources</h3>
          <div className="grid grid-cols-2 gap-6">
            <DonutChart value={42} label="Organic" color="#4c6ef5" />
            <DonutChart value={28} label="Social" color="#9775fa" />
            <DonutChart value={18} label="Direct" color="#20c997" />
            <DonutChart value={12} label="Paid" color="#fcc419" />
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="p-6 rounded-xl border border-white/5 bg-surface/50">
        <h3 className="text-white font-semibold mb-4">Recent Activity</h3>
        <div className="space-y-4">
          {[
            { action: "New order", detail: "Order #1064 — $47.99", time: "2 hours ago", color: "bg-emerald-500" },
            { action: "Blog published", detail: '"5 Tips for First-Time Sellers"', time: "6 hours ago", color: "bg-brand-500" },
            { action: "Competitor alert", detail: "SimilarBiz dropped prices 15%", time: "1 day ago", color: "bg-amber-500" },
            { action: "New subscriber", detail: "alex@example.com joined waitlist", time: "1 day ago", color: "bg-purple-500" },
            { action: "SEO update", detail: "Page 1 ranking for 3 new keywords", time: "2 days ago", color: "bg-cyan-500" },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-4">
              <div className={`w-2 h-2 rounded-full shrink-0 ${item.color}`} />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white font-medium">{item.action}</p>
                <p className="text-xs text-zinc-500 truncate">{item.detail}</p>
              </div>
              <span className="text-xs text-zinc-600 shrink-0">{item.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
