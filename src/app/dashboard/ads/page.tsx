"use client";

const ADS = [
  { name: "Summer Collection Launch", platform: "Meta", status: "Active", spend: "$124.50", roas: "3.2x", impressions: "14,200" },
  { name: "New Customer Welcome", platform: "TikTok", status: "Active", spend: "$87.00", roas: "2.8x", impressions: "22,500" },
  { name: "Retarget Cart Abandoners", platform: "Meta", status: "Paused", spend: "$45.20", roas: "4.1x", impressions: "5,800" },
  { name: "Brand Awareness Video", platform: "TikTok", status: "Draft", spend: "—", roas: "—", impressions: "—" },
];

export default function AdsPage() {
  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Ads</h1>
          <p className="text-zinc-500 text-sm">AI-generated UGC video ads and creatives.</p>
        </div>
        <button className="btn-primary px-5 py-2.5 rounded-lg text-sm font-semibold text-white">
          + Create Ad
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="p-5 rounded-xl border border-white/5 bg-surface/50">
          <p className="text-zinc-500 text-xs font-medium mb-1">Total Spend</p>
          <p className="text-2xl font-bold text-white">$256.70</p>
        </div>
        <div className="p-5 rounded-xl border border-white/5 bg-surface/50">
          <p className="text-zinc-500 text-xs font-medium mb-1">Avg ROAS</p>
          <p className="text-2xl font-bold text-white">3.4x</p>
        </div>
        <div className="p-5 rounded-xl border border-white/5 bg-surface/50">
          <p className="text-zinc-500 text-xs font-medium mb-1">Impressions</p>
          <p className="text-2xl font-bold text-white">42.5K</p>
        </div>
        <div className="p-5 rounded-xl border border-white/5 bg-surface/50">
          <p className="text-zinc-500 text-xs font-medium mb-1">Clicks</p>
          <p className="text-2xl font-bold text-white">1,892</p>
        </div>
      </div>

      <div className="rounded-xl border border-white/5 bg-surface/50 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/5 text-zinc-500">
              <th className="text-left p-4 font-medium">Campaign</th>
              <th className="text-left p-4 font-medium">Platform</th>
              <th className="text-left p-4 font-medium">Status</th>
              <th className="text-right p-4 font-medium">Spend</th>
              <th className="text-right p-4 font-medium">ROAS</th>
              <th className="text-right p-4 font-medium">Impressions</th>
            </tr>
          </thead>
          <tbody>
            {ADS.map((ad) => (
              <tr key={ad.name} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition">
                <td className="p-4 text-white font-medium">{ad.name}</td>
                <td className="p-4 text-zinc-400">{ad.platform}</td>
                <td className="p-4">
                  <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                    ad.status === "Active" ? "bg-emerald-500/10 text-emerald-400" :
                    ad.status === "Paused" ? "bg-amber-500/10 text-amber-400" :
                    "bg-zinc-500/10 text-zinc-400"
                  }`}>{ad.status}</span>
                </td>
                <td className="p-4 text-zinc-400 text-right">{ad.spend}</td>
                <td className="p-4 text-zinc-400 text-right">{ad.roas}</td>
                <td className="p-4 text-zinc-400 text-right">{ad.impressions}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
