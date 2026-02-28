"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useBusinessContext } from "@/components/dashboard/BusinessProvider";

export default function SettingsPage() {
  const router = useRouter();
  const { business, refreshBusiness } = useBusinessContext();

  const [name, setName] = useState(business?.name || "");
  const [tagline, setTagline] = useState(business?.tagline || "");
  const [coachName, setCoachName] = useState(business?.coach_name || "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [removingDomain, setRemovingDomain] = useState(false);

  if (!business) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const primaryColor =
    (business.brand as { colors?: { primary?: string } })?.colors?.primary ||
    "#6366f1";

  async function handleSave() {
    setSaving(true);
    setSaved(false);

    try {
      const res = await fetch(`/api/business/${business!.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          tagline: tagline.trim(),
          coach_name: coachName.trim() || null,
        }),
      });

      if (res.ok) {
        setSaved(true);
        await refreshBusiness();
        setTimeout(() => setSaved(false), 3000);
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (deleteConfirm !== business!.name) return;
    setDeleting(true);

    const res = await fetch(`/api/business/${business!.id}`, {
      method: "DELETE",
    });

    if (res.ok) {
      router.push("/dashboard");
    } else {
      setDeleting(false);
    }
  }

  async function handleRemoveDomain() {
    setRemovingDomain(true);
    try {
      const res = await fetch(`/api/business/${business!.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ custom_domain: null }),
      });
      if (res.ok) await refreshBusiness();
    } finally {
      setRemovingDomain(false);
    }
  }

  function getSiteUrl(): string {
    if (business!.custom_domain) return `https://${business!.custom_domain}`;
    if (business!.deployed_url) return business!.deployed_url;
    return `/site/${business!.slug}`;
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-3xl">
      <h1 className="text-xl sm:text-2xl font-bold text-white mb-1">
        Settings
      </h1>
      <p className="text-zinc-500 text-sm mb-8">
        Manage your business details and integrations.
      </p>

      {/* General */}
      <section className="mb-10">
        <h2 className="text-lg font-semibold text-white mb-4">General</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-zinc-400 mb-1.5">
              Business Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg bg-surface-light border border-white/10 text-white text-sm focus:outline-none focus:border-brand-500 transition"
            />
          </div>
          <div>
            <label className="block text-sm text-zinc-400 mb-1.5">
              Tagline
            </label>
            <input
              type="text"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg bg-surface-light border border-white/10 text-white text-sm focus:outline-none focus:border-brand-500 transition"
            />
          </div>
          <div>
            <label className="block text-sm text-zinc-400 mb-1.5">
              AI Coach Name{" "}
              <span className="text-zinc-600">(optional)</span>
            </label>
            <input
              type="text"
              value={coachName}
              onChange={(e) => setCoachName(e.target.value)}
              placeholder="Give your AI coach a name..."
              className="w-full px-4 py-2.5 rounded-lg bg-surface-light border border-white/10 text-white text-sm focus:outline-none focus:border-brand-500 transition placeholder-zinc-600"
            />
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-primary px-6 py-2.5 rounded-lg text-sm font-semibold text-white disabled:opacity-50"
          >
            {saving ? "Saving..." : saved ? "Saved!" : "Save Changes"}
          </button>
        </div>
      </section>

      {/* Brand */}
      <section className="mb-10">
        <h2 className="text-lg font-semibold text-white mb-4">Brand</h2>
        <div className="p-4 rounded-xl border border-white/5 bg-surface/50">
          <div className="flex items-center gap-4 mb-3">
            <div
              className="w-10 h-10 rounded-lg"
              style={{ backgroundColor: primaryColor }}
            />
            <div>
              <p className="text-sm text-white font-medium">Primary Color</p>
              <p className="text-xs text-zinc-500">{primaryColor}</p>
            </div>
          </div>
          <p className="text-xs text-zinc-600">
            Brand colors were set during site generation. Full brand editor
            coming soon.
          </p>
        </div>
      </section>

      {/* Site */}
      <section className="mb-10">
        <h2 className="text-lg font-semibold text-white mb-4">Site</h2>
        <div className="p-4 rounded-xl border border-white/5 bg-surface/50 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-white font-medium">Deployed URL</p>
              <p className="text-xs text-zinc-500 break-all">
                {business.deployed_url || "Not deployed yet"}
              </p>
            </div>
            {business.deployed_url && (
              <a
                href={getSiteUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-300"
              >
                Visit
              </a>
            )}
          </div>
          {business.custom_domain && (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white font-medium">Custom Domain</p>
                <p className="text-xs text-zinc-500">{business.custom_domain}</p>
              </div>
              <button
                onClick={handleRemoveDomain}
                disabled={removingDomain}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-red-500/20 transition disabled:opacity-50"
              >
                {removingDomain ? "Removing..." : "Remove"}
              </button>
            </div>
          )}
          {business.custom_domain && (
            <div className="mt-4 p-4 rounded-lg border border-amber-500/20 bg-amber-500/5">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                </svg>
                <div>
                  <p className="text-sm font-semibold text-amber-300 mb-2">DNS Setup Required</p>
                  <p className="text-xs text-zinc-400 leading-relaxed mb-3">
                    To connect <strong className="text-white">{business.custom_domain}</strong> to your site, add these DNS records with your domain registrar (GoDaddy, Namecheap, Cloudflare, etc.):
                  </p>
                  <div className="space-y-2 mb-3">
                    <div className="p-2.5 rounded-lg bg-black/40 border border-white/5">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-semibold">CNAME Record</span>
                      </div>
                      <div className="grid grid-cols-[60px_1fr] gap-x-3 text-xs">
                        <span className="text-zinc-500">Name</span>
                        <span className="text-white font-mono">
                          {business.custom_domain.startsWith("www.") ? "www" : "@"}
                        </span>
                        <span className="text-zinc-500">Value</span>
                        <span className="text-white font-mono">cname.vercel-dns.com</span>
                      </div>
                    </div>
                    {!business.custom_domain.startsWith("www.") && (
                      <div className="p-2.5 rounded-lg bg-black/40 border border-white/5">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-semibold">A Record (if CNAME not supported for root)</span>
                        </div>
                        <div className="grid grid-cols-[60px_1fr] gap-x-3 text-xs">
                          <span className="text-zinc-500">Name</span>
                          <span className="text-white font-mono">@</span>
                          <span className="text-zinc-500">Value</span>
                          <span className="text-white font-mono">76.76.21.21</span>
                        </div>
                      </div>
                    )}
                  </div>
                  <p className="text-[11px] text-zinc-500 leading-relaxed">
                    DNS changes can take up to 48 hours to propagate. Once set, your site will be available at{" "}
                    <strong className="text-zinc-300">https://{business.custom_domain}</strong>.
                    SSL is provisioned automatically.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Integrations */}
      <section className="mb-10">
        <h2 className="text-lg font-semibold text-white mb-4">Integrations</h2>
        <div className="space-y-3">
          <div className="p-4 rounded-xl border border-white/5 bg-surface/50 flex items-center justify-between">
            <div>
              <p className="text-sm text-white font-medium">Stripe Payments</p>
              <p className="text-xs text-zinc-500">
                {business.stripe_account_id
                  ? "Connected"
                  : "Accept payments from customers"}
              </p>
            </div>
            <span
              className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                business.stripe_account_id
                  ? "bg-emerald-500/10 text-emerald-400"
                  : "bg-zinc-500/10 text-zinc-400"
              }`}
            >
              {business.stripe_account_id ? "Connected" : "Not connected"}
            </span>
          </div>
          <div className="p-4 rounded-xl border border-white/5 bg-surface/50 flex items-center justify-between">
            <div>
              <p className="text-sm text-white font-medium">Calendly</p>
              <p className="text-xs text-zinc-500">
                {business.calendly_url || "Schedule meetings with clients"}
              </p>
            </div>
            <span
              className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                business.calendly_url
                  ? "bg-emerald-500/10 text-emerald-400"
                  : "bg-zinc-500/10 text-zinc-400"
              }`}
            >
              {business.calendly_url ? "Connected" : "Not set"}
            </span>
          </div>
          <div className="p-4 rounded-xl border border-white/5 bg-surface/50 flex items-center justify-between">
            <div>
              <p className="text-sm text-white font-medium">Business Email</p>
              <p className="text-xs text-zinc-500">
                {business.business_email || "Professional email address"}
              </p>
            </div>
            <span
              className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                business.business_email
                  ? "bg-emerald-500/10 text-emerald-400"
                  : "bg-zinc-500/10 text-zinc-400"
              }`}
            >
              {business.business_email ? "Set" : "Not set"}
            </span>
          </div>
        </div>
      </section>

      {/* Danger Zone */}
      <section>
        <h2 className="text-lg font-semibold text-red-400 mb-4">
          Danger Zone
        </h2>
        <div className="p-4 rounded-xl border border-red-500/20 bg-red-500/5">
          <p className="text-sm text-white font-medium mb-1">
            Delete this business
          </p>
          <p className="text-xs text-zinc-500 mb-4">
            This will permanently delete{" "}
            <strong className="text-zinc-300">{business.name}</strong>, including
            all checklist progress, chat history, and generated content. This
            action cannot be undone.
          </p>
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-zinc-500 mb-1.5">
                Type <strong className="text-zinc-300">{business.name}</strong>{" "}
                to confirm
              </label>
              <input
                type="text"
                value={deleteConfirm}
                onChange={(e) => setDeleteConfirm(e.target.value)}
                placeholder={business.name}
                className="w-full px-4 py-2.5 rounded-lg bg-surface-light border border-red-500/20 text-white text-sm focus:outline-none focus:border-red-500 transition placeholder-zinc-700"
              />
            </div>
            <button
              onClick={handleDelete}
              disabled={deleteConfirm !== business.name || deleting}
              className="px-6 py-2.5 rounded-lg text-sm font-semibold bg-red-600 text-white hover:bg-red-700 transition disabled:opacity-30 disabled:cursor-not-allowed"
            >
              {deleting
                ? "Deleting..."
                : "Permanently Delete Business"}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
