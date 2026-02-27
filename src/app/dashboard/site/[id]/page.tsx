"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import { supabase } from "@/lib/supabase";
const StripeConnectProvider = dynamic(() => import("@/components/StripeConnectProvider"), { ssr: false });

interface Business {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  type: string;
  status: string;
  deployed_url: string;
  custom_domain: string;
  stripe_account_id?: string;
  brand: {
    colors?: { primary?: string; secondary?: string; accent?: string; background?: string; text?: string };
    fonts?: { heading?: string; body?: string };
    tone?: string;
    values?: string[];
  };
  site_content: {
    hero?: { headline?: string; subheadline?: string };
    about?: { title?: string; text?: string; mission?: string };
    features?: { title: string; desc: string }[];
    products?: { name: string; desc: string; price: string; features?: string[] }[];
    testimonials?: { name: string; role: string; text: string }[];
    cta?: { headline?: string; subheadline?: string; button_text?: string };
    contact?: { email?: string; phone?: string; hours?: string };
  };
}

type Tab = "content" | "brand" | "products" | "payments" | "settings";

export default function SiteEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [tab, setTab] = useState<Tab>("content");
  const [bizId, setBizId] = useState("");
  const [deploying, setDeploying] = useState(false);
  const [deployMessage, setDeployMessage] = useState<string | null>(null);
  const [domainInput, setDomainInput] = useState("");
  const [domainStatus, setDomainStatus] = useState<string | null>(null);
  const [userId, setUserId] = useState("");

  useEffect(() => {
    params.then(({ id }) => {
      setBizId(id);
      loadBusiness(id);
    });
  }, [params]);

  async function loadBusiness(id: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { window.location.href = "/auth/login"; return; }
    setUserId(user.id);

    const { data } = await supabase
      .from("businesses")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (!data) { router.push("/dashboard"); return; }
    setBusiness(data as Business);
    setDomainInput(data.custom_domain || "");
    setLoading(false);
  }

  async function deployToVercel() {
    if (!business) return;
    setDeploying(true);
    setDeployMessage("Creating project and uploading files...");
    try {
      const res = await fetch("/api/deploy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessId: business.id, userId }),
      });
      const data = await res.json();
      if (res.ok && data.url) {
        setBusiness({ ...business, deployed_url: data.url, status: "live" });
        setDeployMessage("Deployed! Your site will be live in about 30-60 seconds.");
        setTimeout(() => setDeployMessage(null), 8000);
      } else {
        setDeployMessage(data.error || "Deployment failed. Please try again.");
        setTimeout(() => setDeployMessage(null), 5000);
      }
    } catch {
      setDeployMessage("Deployment failed. Please try again.");
      setTimeout(() => setDeployMessage(null), 5000);
    }
    setDeploying(false);
  }

  async function connectDomain() {
    if (!domainInput.trim() || !business) return;
    setDomainStatus("connecting");
    try {
      const res = await fetch("/api/domain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessId: business.id,
          domain: domainInput.trim(),
          userId,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setBusiness({ ...business, custom_domain: domainInput.trim() });
        setDomainStatus(data.configured ? "connected" : "pending-dns");
      } else {
        setDomainStatus("error");
      }
    } catch {
      setDomainStatus("error");
    }
  }

  async function save() {
    if (!business) return;
    setSaving(true);
    setSaved(false);

    const { error } = await supabase
      .from("businesses")
      .update({
        name: business.name,
        tagline: business.tagline,
        brand: business.brand,
        site_content: business.site_content,
        status: business.status,
      })
      .eq("id", business.id);

    setSaving(false);
    if (!error) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  }

  function updateContent(path: string, value: string) {
    if (!business) return;
    const updated = { ...business };
    const content = { ...updated.site_content };

    const parts = path.split(".");
    if (parts.length === 2) {
      const [section, key] = parts;
      const sectionKey = section as keyof typeof content;
      const existing = content[sectionKey];
      if (typeof existing === "object" && !Array.isArray(existing)) {
        (content as Record<string, unknown>)[section] = { ...existing, [key]: value };
      }
    }

    updated.site_content = content;
    setBusiness(updated);
  }

  function updateProduct(index: number, field: string, value: string) {
    if (!business) return;
    const updated = { ...business };
    const products = [...(updated.site_content.products || [])];
    products[index] = { ...products[index], [field]: value };
    updated.site_content = { ...updated.site_content, products };
    setBusiness(updated);
  }

  function updateColor(key: string, value: string) {
    if (!business) return;
    const updated = { ...business };
    updated.brand = {
      ...updated.brand,
      colors: { ...updated.brand.colors, [key]: value },
    };
    setBusiness(updated);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!business) return null;

  const tabs: { id: Tab; label: string }[] = [
    { id: "content", label: "Content" },
    { id: "brand", label: "Brand" },
    { id: "products", label: business.type === "services" ? "Services" : "Products" },
    { id: "payments", label: "Payments" },
    { id: "settings", label: "Settings" },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
      {/* Deploy status banner */}
      {deployMessage && (
        <div style={{
          marginBottom: 16, padding: "12px 16px", borderRadius: 12,
          background: deploying ? "rgba(76,110,245,0.08)" : deployMessage.includes("Deployed") ? "rgba(34,197,94,0.08)" : "rgba(239,68,68,0.08)",
          border: `1px solid ${deploying ? "rgba(76,110,245,0.2)" : deployMessage.includes("Deployed") ? "rgba(34,197,94,0.2)" : "rgba(239,68,68,0.2)"}`,
          display: "flex", alignItems: "center", gap: 10,
        }}>
          {deploying && (
            <div style={{
              width: 16, height: 16, border: "2px solid #4c6ef5",
              borderTopColor: "transparent", borderRadius: "50%",
              animation: "spin 0.6s linear infinite", flexShrink: 0,
            }} />
          )}
          <p style={{
            fontSize: 13, margin: 0,
            color: deploying ? "#93a4f5" : deployMessage.includes("Deployed") ? "#4ade80" : "#f87171",
          }}>{deployMessage}</p>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <Link href="/dashboard" className="text-sm text-zinc-500 hover:text-zinc-300 transition mb-2 inline-block">
            ← Back to Dashboard
          </Link>
          <h1 className="text-xl sm:text-2xl font-bold text-white">{business.name}</h1>
          <p className="text-zinc-500 text-sm">{business.tagline}</p>
        </div>
        <div className="flex items-center gap-3">
          {business.deployed_url ? (
            <a
              href={business.custom_domain ? `https://${business.custom_domain}` : business.deployed_url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary px-4 py-2 rounded-lg text-sm font-medium text-zinc-300"
            >
              View Live Site
            </a>
          ) : (
            <button
              onClick={deployToVercel}
              disabled={deploying}
              className="btn-secondary px-4 py-2 rounded-lg text-sm font-medium text-zinc-300"
            >
              {deploying ? "Deploying..." : "Deploy Site"}
            </button>
          )}
          <button
            onClick={save}
            disabled={saving}
            className="btn-primary px-6 py-2 rounded-lg text-sm font-bold text-white"
          >
            {saving ? "Saving..." : saved ? "Saved!" : "Save Changes"}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-white/5 overflow-x-auto">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-3 text-sm font-medium transition-all whitespace-nowrap ${
              tab === t.id
                ? "text-brand-400 border-b-2 border-brand-500"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Content tab */}
      {tab === "content" && (
        <div className="space-y-8 animate-fadeIn">
          {/* Hero */}
          <fieldset className="space-y-4">
            <legend className="text-white font-semibold mb-2">Hero Section</legend>
            <div>
              <label className="block text-sm text-zinc-400 mb-1.5">Headline</label>
              <input
                type="text"
                value={business.site_content.hero?.headline || ""}
                onChange={(e) => updateContent("hero.headline", e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-surface-light border border-white/10 text-white text-sm focus:outline-none focus:border-brand-500 transition"
              />
            </div>
            <div>
              <label className="block text-sm text-zinc-400 mb-1.5">Subheadline</label>
              <input
                type="text"
                value={business.site_content.hero?.subheadline || ""}
                onChange={(e) => updateContent("hero.subheadline", e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-surface-light border border-white/10 text-white text-sm focus:outline-none focus:border-brand-500 transition"
              />
            </div>
          </fieldset>

          {/* About */}
          <fieldset className="space-y-4">
            <legend className="text-white font-semibold mb-2">About Section</legend>
            <div>
              <label className="block text-sm text-zinc-400 mb-1.5">Title</label>
              <input
                type="text"
                value={business.site_content.about?.title || ""}
                onChange={(e) => updateContent("about.title", e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-surface-light border border-white/10 text-white text-sm focus:outline-none focus:border-brand-500 transition"
              />
            </div>
            <div>
              <label className="block text-sm text-zinc-400 mb-1.5">Story</label>
              <textarea
                rows={6}
                value={business.site_content.about?.text || ""}
                onChange={(e) => updateContent("about.text", e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-surface-light border border-white/10 text-white text-sm focus:outline-none focus:border-brand-500 transition resize-y"
              />
            </div>
            <div>
              <label className="block text-sm text-zinc-400 mb-1.5">Mission Statement</label>
              <input
                type="text"
                value={business.site_content.about?.mission || ""}
                onChange={(e) => updateContent("about.mission", e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-surface-light border border-white/10 text-white text-sm focus:outline-none focus:border-brand-500 transition"
              />
            </div>
          </fieldset>

          {/* CTA */}
          <fieldset className="space-y-4">
            <legend className="text-white font-semibold mb-2">Call to Action</legend>
            <div>
              <label className="block text-sm text-zinc-400 mb-1.5">Headline</label>
              <input
                type="text"
                value={business.site_content.cta?.headline || ""}
                onChange={(e) => updateContent("cta.headline", e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-surface-light border border-white/10 text-white text-sm focus:outline-none focus:border-brand-500 transition"
              />
            </div>
            <div>
              <label className="block text-sm text-zinc-400 mb-1.5">Button Text</label>
              <input
                type="text"
                value={business.site_content.cta?.button_text || ""}
                onChange={(e) => updateContent("cta.button_text", e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-surface-light border border-white/10 text-white text-sm focus:outline-none focus:border-brand-500 transition"
              />
            </div>
          </fieldset>

          {/* Contact */}
          <fieldset className="space-y-4">
            <legend className="text-white font-semibold mb-2">Contact Info</legend>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-zinc-400 mb-1.5">Email</label>
                <input
                  type="email"
                  value={business.site_content.contact?.email || ""}
                  onChange={(e) => updateContent("contact.email", e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-surface-light border border-white/10 text-white text-sm focus:outline-none focus:border-brand-500 transition"
                />
              </div>
              <div>
                <label className="block text-sm text-zinc-400 mb-1.5">Phone</label>
                <input
                  type="tel"
                  value={business.site_content.contact?.phone || ""}
                  onChange={(e) => updateContent("contact.phone", e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-surface-light border border-white/10 text-white text-sm focus:outline-none focus:border-brand-500 transition"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm text-zinc-400 mb-1.5">Business Hours</label>
              <input
                type="text"
                value={business.site_content.contact?.hours || ""}
                onChange={(e) => updateContent("contact.hours", e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-surface-light border border-white/10 text-white text-sm focus:outline-none focus:border-brand-500 transition"
              />
            </div>
          </fieldset>
        </div>
      )}

      {/* Brand tab */}
      {tab === "brand" && (
        <div className="space-y-8 animate-fadeIn">
          <fieldset className="space-y-4">
            <legend className="text-white font-semibold mb-2">Colors</legend>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {(["primary", "secondary", "accent", "background", "text"] as const).map((key) => (
                <div key={key}>
                  <label className="block text-sm text-zinc-400 mb-1.5 capitalize">{key}</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={business.brand.colors?.[key] || "#4c6ef5"}
                      onChange={(e) => updateColor(key, e.target.value)}
                      className="w-10 h-10 rounded-lg border border-white/10 bg-transparent cursor-pointer"
                    />
                    <input
                      type="text"
                      value={business.brand.colors?.[key] || ""}
                      onChange={(e) => updateColor(key, e.target.value)}
                      className="flex-1 px-3 py-2 rounded-lg bg-surface-light border border-white/10 text-white text-sm font-mono focus:outline-none focus:border-brand-500 transition"
                    />
                  </div>
                </div>
              ))}
            </div>
          </fieldset>

          <fieldset className="space-y-4">
            <legend className="text-white font-semibold mb-2">Typography</legend>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-zinc-400 mb-1.5">Heading Font</label>
                <input
                  type="text"
                  value={business.brand.fonts?.heading || ""}
                  onChange={(e) => {
                    const updated = { ...business };
                    updated.brand = { ...updated.brand, fonts: { ...updated.brand.fonts, heading: e.target.value } };
                    setBusiness(updated);
                  }}
                  placeholder="e.g. Poppins, Montserrat"
                  className="w-full px-4 py-3 rounded-xl bg-surface-light border border-white/10 text-white text-sm focus:outline-none focus:border-brand-500 transition"
                />
              </div>
              <div>
                <label className="block text-sm text-zinc-400 mb-1.5">Body Font</label>
                <input
                  type="text"
                  value={business.brand.fonts?.body || ""}
                  onChange={(e) => {
                    const updated = { ...business };
                    updated.brand = { ...updated.brand, fonts: { ...updated.brand.fonts, body: e.target.value } };
                    setBusiness(updated);
                  }}
                  placeholder="e.g. Inter, Open Sans"
                  className="w-full px-4 py-3 rounded-xl bg-surface-light border border-white/10 text-white text-sm focus:outline-none focus:border-brand-500 transition"
                />
              </div>
            </div>
          </fieldset>

          <fieldset className="space-y-4">
            <legend className="text-white font-semibold mb-2">Brand Tone</legend>
            <input
              type="text"
              value={business.brand.tone || ""}
              onChange={(e) => {
                const updated = { ...business };
                updated.brand = { ...updated.brand, tone: e.target.value };
                setBusiness(updated);
              }}
              placeholder="e.g. friendly, bold, luxurious"
              className="w-full px-4 py-3 rounded-xl bg-surface-light border border-white/10 text-white text-sm focus:outline-none focus:border-brand-500 transition"
            />
          </fieldset>

          {/* Color preview */}
          <div>
            <p className="text-white font-semibold mb-3">Preview</p>
            <div
              className="rounded-xl p-6 border border-white/5"
              style={{ background: business.brand.colors?.background || "#0a0a0f" }}
            >
              <h3 style={{
                color: business.brand.colors?.text || "#e4e4e7",
                fontWeight: 700,
                fontSize: 20,
                marginBottom: 8,
              }}>
                {business.name}
              </h3>
              <p style={{ color: business.brand.colors?.primary || "#4c6ef5", fontSize: 14, marginBottom: 16 }}>
                {business.tagline}
              </p>
              <div style={{ display: "flex", gap: 8 }}>
                <span style={{
                  background: `linear-gradient(135deg, ${business.brand.colors?.primary || "#4c6ef5"}, ${business.brand.colors?.accent || "#9775fa"})`,
                  color: "#fff", padding: "8px 20px", borderRadius: 8, fontSize: 13, fontWeight: 600,
                }}>
                  Primary Button
                </span>
                <span style={{
                  border: `1px solid ${business.brand.colors?.secondary || "#ffffff22"}`,
                  color: business.brand.colors?.text || "#e4e4e7",
                  padding: "8px 20px", borderRadius: 8, fontSize: 13, fontWeight: 500,
                }}>
                  Secondary
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Products tab */}
      {tab === "products" && (
        <div className="space-y-6 animate-fadeIn">
          {(business.site_content.products || []).map((product, i) => (
            <div key={i} className="p-4 sm:p-6 rounded-xl border border-white/5 bg-surface/50 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-white font-semibold">
                  {business.type === "services" ? "Service" : "Product"} {i + 1}
                </h3>
                <button
                  onClick={() => {
                    const updated = { ...business };
                    const products = [...(updated.site_content.products || [])];
                    products.splice(i, 1);
                    updated.site_content = { ...updated.site_content, products };
                    setBusiness(updated);
                  }}
                  className="text-red-400 text-sm hover:text-red-300 transition"
                >
                  Remove
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-zinc-400 mb-1.5">Name</label>
                  <input
                    type="text"
                    value={product.name}
                    onChange={(e) => updateProduct(i, "name", e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-surface-light border border-white/10 text-white text-sm focus:outline-none focus:border-brand-500 transition"
                  />
                </div>
                <div>
                  <label className="block text-sm text-zinc-400 mb-1.5">Price</label>
                  <input
                    type="text"
                    value={product.price}
                    onChange={(e) => updateProduct(i, "price", e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-surface-light border border-white/10 text-white text-sm focus:outline-none focus:border-brand-500 transition"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-zinc-400 mb-1.5">Description</label>
                <textarea
                  rows={3}
                  value={product.desc}
                  onChange={(e) => updateProduct(i, "desc", e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-surface-light border border-white/10 text-white text-sm focus:outline-none focus:border-brand-500 transition resize-y"
                />
              </div>
            </div>
          ))}

          <button
            onClick={() => {
              const updated = { ...business };
              const products = [...(updated.site_content.products || [])];
              products.push({ name: "", desc: "", price: "", features: [] });
              updated.site_content = { ...updated.site_content, products };
              setBusiness(updated);
            }}
            className="w-full p-4 rounded-xl border border-dashed border-white/10 text-zinc-400 text-sm font-medium hover:border-brand-600/30 transition"
          >
            + Add {business.type === "services" ? "Service" : "Product"}
          </button>
        </div>
      )}

      {/* Payments tab */}
      {tab === "payments" && (
        <div className="space-y-6 animate-fadeIn">
          {business.stripe_account_id ? (
            <PaymentsDashboard businessId={business.id} />
          ) : (
            <div className="p-8 rounded-xl border border-white/5 bg-surface/50 text-center">
              <div className="w-16 h-16 rounded-2xl bg-[#635bff]/10 flex items-center justify-center text-[#635bff] font-bold text-2xl mx-auto mb-4">
                S
              </div>
              <h3 className="text-white font-semibold text-lg mb-2">Connect Stripe to Accept Payments</h3>
              <p className="text-zinc-500 text-sm mb-6 max-w-md mx-auto">
                Set up Stripe to accept credit cards, Apple Pay, and more on your site. Takes about 2 minutes.
              </p>
              <button
                onClick={async () => {
                  const res = await fetch("/api/stripe", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ action: "connect", businessId: business.id, userId }),
                  });
                  const data = await res.json();
                  if (res.ok && data.accountId) {
                    setBusiness({ ...business, stripe_account_id: data.accountId });
                  }
                }}
                className="btn-primary px-8 py-3 rounded-xl text-sm font-bold text-white"
              >
                Connect Stripe
              </button>
            </div>
          )}
        </div>
      )}

      {/* Settings tab */}
      {tab === "settings" && (
        <div className="space-y-8 animate-fadeIn">
          <fieldset className="space-y-4">
            <legend className="text-white font-semibold mb-2">General</legend>
            <div>
              <label className="block text-sm text-zinc-400 mb-1.5">Business Name</label>
              <input
                type="text"
                value={business.name}
                onChange={(e) => setBusiness({ ...business, name: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-surface-light border border-white/10 text-white text-sm focus:outline-none focus:border-brand-500 transition"
              />
            </div>
            <div>
              <label className="block text-sm text-zinc-400 mb-1.5">Tagline</label>
              <input
                type="text"
                value={business.tagline}
                onChange={(e) => setBusiness({ ...business, tagline: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-surface-light border border-white/10 text-white text-sm focus:outline-none focus:border-brand-500 transition"
              />
            </div>
          </fieldset>

          <fieldset className="space-y-4">
            <legend className="text-white font-semibold mb-2">Site Status</legend>
            <div className="flex gap-3">
              {["live", "paused"].map((s) => (
                <button
                  key={s}
                  onClick={() => setBusiness({ ...business, status: s })}
                  className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    business.status === s
                      ? s === "live"
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                        : "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                      : "border border-white/10 text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset className="space-y-4">
            <legend className="text-white font-semibold mb-2">Deployment</legend>
            {business.deployed_url ? (
              <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
                <p className="text-sm text-emerald-400 font-medium mb-1">Deployed</p>
                <a
                  href={business.deployed_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand-400 font-mono text-sm hover:underline"
                >
                  {business.deployed_url}
                </a>
                <button
                  onClick={deployToVercel}
                  disabled={deploying}
                  className="mt-3 btn-secondary px-4 py-2 rounded-lg text-xs font-semibold text-zinc-300 block"
                >
                  {deploying ? "Redeploying..." : "Redeploy"}
                </button>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-surface-light border border-white/10">
                <p className="text-sm text-zinc-400 mb-1">Not yet deployed</p>
                <p className="text-xs text-zinc-600 mb-3">
                  Deploy this site to get its own URL at nm-{business.slug}.vercel.app
                </p>
                <button
                  onClick={deployToVercel}
                  disabled={deploying}
                  className="btn-primary px-4 py-2 rounded-lg text-xs font-semibold text-white"
                >
                  {deploying ? "Deploying..." : "Deploy to Vercel"}
                </button>
              </div>
            )}
          </fieldset>

          <fieldset className="space-y-4">
            <legend className="text-white font-semibold mb-2">Custom Domain</legend>
            <div className="p-4 rounded-xl border border-brand-600/20 bg-brand-600/5">
              <p className="text-sm text-white font-medium mb-1">Connect your own domain</p>
              <p className="text-xs text-zinc-500 mb-3">
                Point your domain&apos;s DNS to Vercel, then enter it below.
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={domainInput}
                  onChange={(e) => setDomainInput(e.target.value)}
                  placeholder="mybusiness.com"
                  className="flex-1 px-4 py-2 rounded-lg bg-surface-light border border-white/10 text-white text-sm focus:outline-none focus:border-brand-500 transition"
                />
                <button
                  onClick={connectDomain}
                  disabled={!domainInput.trim() || domainStatus === "connecting"}
                  className="btn-primary px-4 py-2 rounded-lg text-xs font-semibold text-white"
                >
                  {domainStatus === "connecting" ? "..." : "Connect"}
                </button>
              </div>
              {domainStatus === "connected" && (
                <p className="text-emerald-400 text-xs mt-2">Domain connected and verified.</p>
              )}
              {domainStatus === "pending-dns" && (
                <p className="text-amber-400 text-xs mt-2">
                  Domain added. Point your DNS CNAME to <code className="bg-surface-light px-1 rounded">cname.vercel-dns.com</code> to activate.
                </p>
              )}
              {domainStatus === "error" && (
                <p className="text-red-400 text-xs mt-2">Failed to connect domain. Make sure deployment is configured.</p>
              )}
            </div>
          </fieldset>
        </div>
      )}
    </div>
  );
}

function PaymentsDashboard({ businessId }: { businessId: string }) {
  const [components, setComponents] = useState<{
    ConnectPayments: React.ComponentType | null;
    ConnectPayouts: React.ComponentType | null;
    ConnectAccountManagement: React.ComponentType | null;
    ConnectNotificationBanner: React.ComponentType | null;
  }>({ ConnectPayments: null, ConnectPayouts: null, ConnectAccountManagement: null, ConnectNotificationBanner: null });

  useEffect(() => {
    import("@stripe/react-connect-js").then((mod) => {
      setComponents({
        ConnectPayments: mod.ConnectPayments,
        ConnectPayouts: mod.ConnectPayouts,
        ConnectAccountManagement: mod.ConnectAccountManagement,
        ConnectNotificationBanner: mod.ConnectNotificationBanner,
      });
    });
  }, []);

  const { ConnectPayments, ConnectPayouts, ConnectAccountManagement, ConnectNotificationBanner } = components;

  return (
    <StripeConnectProvider businessId={businessId}>
      <div className="space-y-6">
        {ConnectNotificationBanner && (
          <div className="rounded-xl overflow-hidden">
            <ConnectNotificationBanner />
          </div>
        )}
        {ConnectPayments && (
          <div>
            <h3 className="text-white font-semibold mb-3">Payments</h3>
            <div className="rounded-xl border border-white/5 overflow-hidden" style={{ minHeight: 300 }}>
              <ConnectPayments />
            </div>
          </div>
        )}
        {ConnectPayouts && (
          <div>
            <h3 className="text-white font-semibold mb-3">Payouts</h3>
            <div className="rounded-xl border border-white/5 overflow-hidden" style={{ minHeight: 200 }}>
              <ConnectPayouts />
            </div>
          </div>
        )}
        {ConnectAccountManagement && (
          <div>
            <h3 className="text-white font-semibold mb-3">Account Settings</h3>
            <div className="rounded-xl border border-white/5 overflow-hidden" style={{ minHeight: 200 }}>
              <ConnectAccountManagement />
            </div>
          </div>
        )}
        {!ConnectPayments && (
          <div style={{ padding: 40, textAlign: "center" }}>
            <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-zinc-500 text-sm mt-3">Loading payment components...</p>
          </div>
        )}
      </div>
    </StripeConnectProvider>
  );
}
