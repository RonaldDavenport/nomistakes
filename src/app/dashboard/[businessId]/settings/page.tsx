"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useBusinessContext } from "@/components/dashboard/BusinessProvider";
import { T, CTA_GRAD, glassCard } from "@/lib/design-tokens";

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
  const [deploying, setDeploying] = useState(false);
  const [deployMsg, setDeployMsg] = useState("");

  if (!business) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <div className="w-8 h-8 rounded-full animate-spin" style={{ border: `2px solid ${T.purple}`, borderTopColor: "transparent" }} />
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

  async function handleDeploy() {
    setDeploying(true);
    setDeployMsg("");
    try {
      const res = await fetch("/api/deploy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessId: business!.id }),
      });
      if (res.ok) {
        setDeployMsg("Deployed!");
        await refreshBusiness();
        setTimeout(() => setDeployMsg(""), 3000);
      } else {
        setDeployMsg("Deploy failed");
      }
    } catch {
      setDeployMsg("Deploy failed");
    } finally {
      setDeploying(false);
    }
  }

  function getSiteUrl(): string {
    if (business!.custom_domain) return `https://${business!.custom_domain}`;
    if (business!.deployed_url) return business!.deployed_url;
    return `/site/${business!.slug}`;
  }

  const inputStyle: React.CSSProperties = {
    background: T.glass,
    border: `1px solid ${T.border}`,
    color: T.text,
    backdropFilter: "blur(12px)",
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-3xl">
      <h1 className="text-xl sm:text-2xl font-bold mb-1" style={{ color: T.text, fontFamily: T.h }}>
        Settings
      </h1>
      <p className="text-sm mb-8" style={{ color: T.text3 }}>
        Manage your business details and integrations.
      </p>

      {/* General */}
      <section className="mb-10">
        <h2 className="text-lg font-semibold mb-4" style={{ color: T.text, fontFamily: T.h }}>General</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm mb-1.5" style={{ color: T.text2 }}>
              Business Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg text-sm focus:outline-none transition"
              style={inputStyle}
            />
          </div>
          <div>
            <label className="block text-sm mb-1.5" style={{ color: T.text2 }}>
              Tagline
            </label>
            <input
              type="text"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg text-sm focus:outline-none transition"
              style={inputStyle}
            />
          </div>
          <div>
            <label className="block text-sm mb-1.5" style={{ color: T.text2 }}>
              AI Coach Name{" "}
              <span style={{ color: T.text3 }}>(optional)</span>
            </label>
            <input
              type="text"
              value={coachName}
              onChange={(e) => setCoachName(e.target.value)}
              placeholder="Give your AI coach a name..."
              className="w-full px-4 py-2.5 rounded-lg text-sm focus:outline-none transition"
              style={inputStyle}
            />
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2.5 rounded-lg text-sm font-semibold disabled:opacity-50"
            style={{ background: CTA_GRAD, color: "#fff" }}
          >
            {saving ? "Saving..." : saved ? "Saved!" : "Save Changes"}
          </button>
        </div>
      </section>

      {/* Brand */}
      <section className="mb-10">
        <h2 className="text-lg font-semibold mb-4" style={{ color: T.text, fontFamily: T.h }}>Brand</h2>
        <div className="p-4 rounded-xl" style={{ ...glassCard }}>
          <div className="flex items-center gap-4 mb-3">
            <div
              className="w-10 h-10 rounded-lg"
              style={{ backgroundColor: primaryColor }}
            />
            <div>
              <p className="text-sm font-medium" style={{ color: T.text }}>Primary Color</p>
              <p className="text-xs" style={{ color: T.text3 }}>{primaryColor}</p>
            </div>
          </div>
          <p className="text-xs" style={{ color: T.text3 }}>
            Brand colors were set during site generation. Full brand editor
            coming soon.
          </p>
        </div>
      </section>

      {/* Site */}
      <section className="mb-10">
        <h2 className="text-lg font-semibold mb-4" style={{ color: T.text, fontFamily: T.h }}>Site</h2>
        <div className="p-4 rounded-xl space-y-3" style={{ ...glassCard }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium" style={{ color: T.text }}>Deployed URL</p>
              <p className="text-xs break-all" style={{ color: T.text3 }}>
                {business.deployed_url || "Not deployed yet"}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {deployMsg && (
                <span className="text-xs" style={{ color: deployMsg === "Deployed!" ? T.green : "#ef4444" }}>
                  {deployMsg}
                </span>
              )}
              <button
                onClick={handleDeploy}
                disabled={deploying}
                className="px-3 py-1.5 rounded-lg text-xs font-medium disabled:opacity-50"
                style={{ border: `1px solid ${T.border}`, color: T.text2 }}
              >
                {deploying ? "Deploying..." : business.deployed_url ? "Redeploy" : "Deploy"}
              </button>
              {business.deployed_url && (
                <a
                  href={getSiteUrl() + "?nm_admin=true"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-lg text-xs font-medium"
                  style={{ border: `1px solid ${T.border}`, color: T.text2 }}
                >
                  Visit
                </a>
              )}
            </div>
          </div>
          {business.custom_domain && (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium" style={{ color: T.text }}>Custom Domain</p>
                <p className="text-xs" style={{ color: T.text3 }}>{business.custom_domain}</p>
              </div>
              <button
                onClick={handleRemoveDomain}
                disabled={removingDomain}
                className="px-3 py-1.5 rounded-lg text-xs font-medium transition disabled:opacity-50"
                style={{ color: "#ef4444", border: "1px solid rgba(239,68,68,0.20)" }}
              >
                {removingDomain ? "Removing..." : "Remove"}
              </button>
            </div>
          )}
          {business.custom_domain && (
            <div className="mt-4 p-4 rounded-lg" style={{ border: "1px solid rgba(245,158,11,0.20)", background: "rgba(245,158,11,0.05)" }}>
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 shrink-0 mt-0.5" style={{ color: T.gold }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                </svg>
                <div>
                  <p className="text-sm font-semibold mb-2" style={{ color: T.gold }}>DNS Setup Required</p>
                  <p className="text-xs leading-relaxed mb-3" style={{ color: T.text2 }}>
                    To connect <strong style={{ color: T.text }}>{business.custom_domain}</strong> to your site, add these DNS records with your domain registrar (GoDaddy, Namecheap, Cloudflare, etc.):
                  </p>
                  <div className="space-y-2 mb-3">
                    <div className="p-2.5 rounded-lg" style={{ background: "rgba(0,0,0,0.40)", border: `1px solid ${T.border}` }}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: T.text3 }}>CNAME Record</span>
                      </div>
                      <div className="grid grid-cols-[60px_1fr] gap-x-3 text-xs">
                        <span style={{ color: T.text3 }}>Name</span>
                        <span className="font-mono" style={{ color: T.text }}>
                          {business.custom_domain.startsWith("www.") ? "www" : "@"}
                        </span>
                        <span style={{ color: T.text3 }}>Value</span>
                        <span className="font-mono" style={{ color: T.text }}>cname.vercel-dns.com</span>
                      </div>
                    </div>
                    {!business.custom_domain.startsWith("www.") && (
                      <div className="p-2.5 rounded-lg" style={{ background: "rgba(0,0,0,0.40)", border: `1px solid ${T.border}` }}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: T.text3 }}>A Record (if CNAME not supported for root)</span>
                        </div>
                        <div className="grid grid-cols-[60px_1fr] gap-x-3 text-xs">
                          <span style={{ color: T.text3 }}>Name</span>
                          <span className="font-mono" style={{ color: T.text }}>@</span>
                          <span style={{ color: T.text3 }}>Value</span>
                          <span className="font-mono" style={{ color: T.text }}>76.76.21.21</span>
                        </div>
                      </div>
                    )}
                  </div>
                  <p className="text-[11px] leading-relaxed" style={{ color: T.text3 }}>
                    DNS changes can take up to 48 hours to propagate. Once set, your site will be available at{" "}
                    <strong style={{ color: T.text2 }}>https://{business.custom_domain}</strong>.
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
        <h2 className="text-lg font-semibold mb-4" style={{ color: T.text, fontFamily: T.h }}>Integrations</h2>
        <div className="space-y-3">
          {[
            { label: "Stripe Payments", desc: business.stripe_account_id ? "Connected" : "Accept payments from customers", connected: !!business.stripe_account_id, status: business.stripe_account_id ? "Connected" : "Not connected" },
            { label: "Calendly", desc: business.calendly_url || "Schedule meetings with clients", connected: !!business.calendly_url, status: business.calendly_url ? "Connected" : "Not set" },
            { label: "Business Email", desc: business.business_email || "Professional email address", connected: !!business.business_email, status: business.business_email ? "Set" : "Not set" },
          ].map((item) => (
            <div key={item.label} className="p-4 rounded-xl flex items-center justify-between" style={{ ...glassCard }}>
              <div>
                <p className="text-sm font-medium" style={{ color: T.text }}>{item.label}</p>
                <p className="text-xs" style={{ color: T.text3 }}>{item.desc}</p>
              </div>
              <span
                className="px-2.5 py-1 rounded-full text-xs font-semibold"
                style={
                  item.connected
                    ? { background: "rgba(34,197,94,0.10)", color: T.green }
                    : { background: T.glass, color: T.text3 }
                }
              >
                {item.status}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Danger Zone */}
      <section>
        <h2 className="text-lg font-semibold mb-4" style={{ color: "#ef4444", fontFamily: T.h }}>
          Danger Zone
        </h2>
        <div className="p-4 rounded-xl" style={{ border: "1px solid rgba(239,68,68,0.20)", background: "rgba(239,68,68,0.05)" }}>
          <p className="text-sm font-medium mb-1" style={{ color: T.text }}>
            Delete this business
          </p>
          <p className="text-xs mb-4" style={{ color: T.text3 }}>
            This will permanently delete{" "}
            <strong style={{ color: T.text2 }}>{business.name}</strong>, including
            all checklist progress, chat history, and generated content. This
            action cannot be undone.
          </p>
          <div className="space-y-3">
            <div>
              <label className="block text-xs mb-1.5" style={{ color: T.text3 }}>
                Type <strong style={{ color: T.text2 }}>{business.name}</strong>{" "}
                to confirm
              </label>
              <input
                type="text"
                value={deleteConfirm}
                onChange={(e) => setDeleteConfirm(e.target.value)}
                placeholder={business.name}
                className="w-full px-4 py-2.5 rounded-lg text-sm focus:outline-none transition"
                style={{ background: T.glass, border: "1px solid rgba(239,68,68,0.20)", color: T.text }}
              />
            </div>
            <button
              onClick={handleDelete}
              disabled={deleteConfirm !== business.name || deleting}
              className="px-6 py-2.5 rounded-lg text-sm font-semibold transition disabled:opacity-30 disabled:cursor-not-allowed"
              style={{ background: "#dc2626", color: "#fff" }}
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
