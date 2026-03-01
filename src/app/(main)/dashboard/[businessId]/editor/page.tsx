"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useBusinessContext } from "@/components/dashboard/BusinessProvider";
import Link from "next/link";
import { useParams } from "next/navigation";
import { T, CTA_GRAD, glassCard } from "@/lib/design-tokens";

/* ─── Types ─── */

interface SiteContent {
  hero?: { headline?: string; subheadline?: string; badge?: string };
  about?: { title?: string; text?: string; mission?: string };
  features?: { title: string; desc: string }[];
  products?: {
    name: string; slug: string; tagline?: string; desc: string;
    price: string; features?: string[]; what_you_get?: string[];
    guarantee?: string; audience?: string; long_desc?: string;
  }[];
  testimonials?: { name: string; role: string; text: string; rating: number }[];
  process?: { title?: string; steps?: { step: string; title: string; desc: string }[] };
  stats?: { value: string; label: string }[];
  social_proof?: { logos?: string[] };
  cta?: { headline?: string; subheadline?: string; button_text?: string };
  seo?: { title?: string; description?: string };
  contact?: { email?: string; phone?: string; hours?: string; address?: string };
  faq?: { question: string; answer: string }[];
  images?: { hero?: string; about?: string; products?: string[] };
}

interface Brand {
  colors?: { primary?: string; secondary?: string; accent?: string; background?: string; text?: string };
  fonts?: { heading?: string; body?: string };
  tone?: string;
  values?: string[];
}

type SaveStatus = "idle" | "saving" | "saved" | "error";

/* ─── Section definitions ─── */

const SECTIONS = [
  { key: "hero", label: "Hero", icon: "M3 4h18v4H3V4zm0 6h18v4H3v-4zm0 6h12v4H3v-4z" },
  { key: "about", label: "About", icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" },
  { key: "features", label: "Features", icon: "M9.663 17h4.674M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" },
  { key: "products", label: "Products", icon: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" },
  { key: "testimonials", label: "Testimonials", icon: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" },
  { key: "process", label: "Process", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" },
  { key: "faq", label: "FAQ", icon: "M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
  { key: "cta", label: "Call to Action", icon: "M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5" },
  { key: "contact", label: "Contact", icon: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" },
  { key: "seo", label: "SEO", icon: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" },
  { key: "brand", label: "Brand & Layout", icon: "M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" },
];

/* ─── Helper: deep set by dot-path ─── */

function deepSet<T>(obj: T, path: string, value: unknown): T {
  const clone = structuredClone(obj);
  const keys = path.split(".");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let cur: any = clone;
  for (let i = 0; i < keys.length - 1; i++) {
    const k = keys[i];
    if (cur[k] === undefined || cur[k] === null) cur[k] = {};
    cur = cur[k];
  }
  cur[keys[keys.length - 1]] = value;
  return clone;
}

/* ─── Inline field components ─── */

function TextField({ label, value, onChange, maxLength, placeholder }: {
  label: string; value: string; onChange: (v: string) => void;
  maxLength?: number; placeholder?: string;
}) {
  return (
    <div className="mb-3">
      <div className="flex items-center justify-between mb-1">
        <label className="text-xs font-medium" style={{ color: T.text2 }}>{label}</label>
        {maxLength && (
          <span className="text-[10px]" style={{ color: value.length > maxLength ? "#ef4444" : T.text3 }}>
            {value.length}/{maxLength}
          </span>
        )}
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none transition"
        style={{ background: "rgba(0,0,0,0.30)", border: `1px solid ${T.border}`, color: T.text, "--tw-placeholder-color": T.text3 } as React.CSSProperties}
      />
    </div>
  );
}

function TextAreaField({ label, value, onChange, rows, maxLength }: {
  label: string; value: string; onChange: (v: string) => void;
  rows?: number; maxLength?: number;
}) {
  return (
    <div className="mb-3">
      <div className="flex items-center justify-between mb-1">
        <label className="text-xs font-medium" style={{ color: T.text2 }}>{label}</label>
        {maxLength && (
          <span className="text-[10px]" style={{ color: value.length > maxLength ? "#ef4444" : T.text3 }}>
            {value.length}/{maxLength}
          </span>
        )}
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows || 3}
        className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none transition resize-y"
        style={{ background: "rgba(0,0,0,0.30)", border: `1px solid ${T.border}`, color: T.text }}
      />
    </div>
  );
}

function ColorField({ label, value, onChange }: {
  label: string; value: string; onChange: (v: string) => void;
}) {
  return (
    <div className="mb-3 flex items-center gap-3">
      <input
        type="color"
        value={value || "#6366f1"}
        onChange={(e) => onChange(e.target.value)}
        className="w-8 h-8 rounded-lg cursor-pointer bg-transparent"
        style={{ border: `1px solid ${T.border}` }}
      />
      <div className="flex-1">
        <label className="text-xs font-medium block mb-0.5" style={{ color: T.text2 }}>{label}</label>
        <input
          type="text"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#hex"
          className="w-full px-2 py-1 rounded text-xs font-mono focus:outline-none transition"
          style={{ background: "rgba(0,0,0,0.30)", border: `1px solid ${T.border}`, color: T.text }}
        />
      </div>
    </div>
  );
}

function SelectField({ label, value, onChange, options }: {
  label: string; value: string; onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="mb-3">
      <label className="text-xs font-medium block mb-1" style={{ color: T.text2 }}>{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none transition"
        style={{ background: "rgba(0,0,0,0.30)", border: `1px solid ${T.border}`, color: T.text }}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}

/* ─── EditorTopBar ─── */

function EditorTopBar({ businessName, businessId, liveUrl, saveStatus, canUndo, onUndo }: {
  businessName: string; businessId: string; liveUrl: string;
  saveStatus: SaveStatus; canUndo: boolean; onUndo: () => void;
}) {
  return (
    <div className="h-12 flex items-center justify-between px-4 shrink-0" style={{ borderBottom: `1px solid ${T.border}`, background: T.bgEl, backdropFilter: "blur(20px)" }}>
      <div className="flex items-center gap-3">
        <Link
          href={`/dashboard/${businessId}`}
          className="flex items-center gap-1.5 text-sm transition-colors"
          style={{ color: T.text2 }}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </Link>
        <span style={{ color: T.border }}>|</span>
        <span className="text-sm font-medium truncate max-w-[200px]" style={{ color: T.text }}>{businessName}</span>
      </div>

      <div className="flex items-center gap-3">
        {/* Save status */}
        <div className="flex items-center gap-1.5 text-xs">
          {saveStatus === "saving" && (
            <>
              <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span className="text-amber-400">Saving...</span>
            </>
          )}
          {saveStatus === "saved" && (
            <>
              <div className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="text-emerald-400">Saved</span>
            </>
          )}
          {saveStatus === "error" && (
            <>
              <div className="w-2 h-2 rounded-full bg-red-400" />
              <span className="text-red-400">Error saving</span>
            </>
          )}
          {saveStatus === "idle" && (
            <>
              <div className="w-2 h-2 rounded-full" style={{ background: T.text3 }} />
              <span style={{ color: T.text3 }}>Up to date</span>
            </>
          )}
        </div>

        {/* Undo */}
        <button
          onClick={onUndo}
          disabled={!canUndo}
          className="p-1.5 rounded-lg transition disabled:opacity-30 disabled:cursor-not-allowed"
          style={{ color: T.text2 }}
          title="Undo (Ctrl+Z)"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
          </svg>
        </button>

        {/* View live */}
        <a
          href={liveUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition"
          style={{ color: T.text2, border: `1px solid ${T.border}` }}
        >
          View Live
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
          </svg>
        </a>
      </div>
    </div>
  );
}

/* ─── Section panel renderers ─── */

function HeroPanel({ content, onUpdate }: { content: SiteContent; onUpdate: (path: string, v: unknown) => void }) {
  return (
    <>
      <TextField label="Headline" value={content.hero?.headline || ""} onChange={(v) => onUpdate("hero.headline", v)} maxLength={80} />
      <TextAreaField label="Subheadline" value={content.hero?.subheadline || ""} onChange={(v) => onUpdate("hero.subheadline", v)} rows={2} />
      <TextField label="Badge" value={content.hero?.badge || ""} onChange={(v) => onUpdate("hero.badge", v)} placeholder="e.g. Trusted by 500+ teams" />
    </>
  );
}

function AboutPanel({ content, onUpdate }: { content: SiteContent; onUpdate: (path: string, v: unknown) => void }) {
  return (
    <>
      <TextField label="Title" value={content.about?.title || ""} onChange={(v) => onUpdate("about.title", v)} />
      <TextAreaField label="Story" value={content.about?.text || ""} onChange={(v) => onUpdate("about.text", v)} rows={6} />
      <TextAreaField label="Mission" value={content.about?.mission || ""} onChange={(v) => onUpdate("about.mission", v)} rows={2} />
    </>
  );
}

function FeaturesPanel({ content, onUpdate }: { content: SiteContent; onUpdate: (path: string, v: unknown) => void }) {
  const features = content.features || [];
  return (
    <>
      {features.map((f, i) => (
        <div key={i} className="mb-4 p-3 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] uppercase tracking-wider font-semibold">Feature {i + 1}</span>
            <button
              onClick={() => {
                const updated = features.filter((_, idx) => idx !== i);
                onUpdate("features", updated);
              }}
              className="text-[10px] text-red-400 hover:text-red-300 transition"
            >
              Remove
            </button>
          </div>
          <TextField label="Title" value={f.title} onChange={(v) => {
            const updated = [...features];
            updated[i] = { ...updated[i], title: v };
            onUpdate("features", updated);
          }} />
          <TextAreaField label="Description" value={f.desc} onChange={(v) => {
            const updated = [...features];
            updated[i] = { ...updated[i], desc: v };
            onUpdate("features", updated);
          }} rows={2} />
        </div>
      ))}
      {features.length < 6 && (
        <button
          onClick={() => onUpdate("features", [...features, { title: "", desc: "" }])}
          className="w-full py-2 rounded-lg border border-dashed border-white/10 text-xs text-zinc-500 hover:text-zinc-300 hover:border-white/20 transition"
        >
          + Add Feature
        </button>
      )}
    </>
  );
}

function ProductsPanel({ content, onUpdate }: { content: SiteContent; onUpdate: (path: string, v: unknown) => void }) {
  const products = content.products || [];
  const [expanded, setExpanded] = useState<number | null>(0);

  return (
    <>
      {products.map((p, i) => (
        <div key={i} className="mb-3 rounded-lg border border-white/5 bg-black/20 overflow-hidden">
          <button
            onClick={() => setExpanded(expanded === i ? null : i)}
            className="w-full flex items-center justify-between p-3 text-left hover:bg-white/[0.02] transition"
          >
            <span className="text-sm text-white font-medium truncate">{p.name || `Product ${i + 1}`}</span>
            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-500">{p.price}</span>
              <svg className={`w-3 h-3 text-zinc-500 transition-transform ${expanded === i ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </button>
          {expanded === i && (
            <div className="px-3 pb-3 border-t border-white/5 pt-3">
              <TextField label="Name" value={p.name} onChange={(v) => {
                const updated = [...products];
                updated[i] = { ...updated[i], name: v, slug: v.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") };
                onUpdate("products", updated);
              }} />
              <TextField label="Tagline" value={p.tagline || ""} onChange={(v) => {
                const updated = [...products];
                updated[i] = { ...updated[i], tagline: v };
                onUpdate("products", updated);
              }} />
              <TextAreaField label="Description" value={p.desc} onChange={(v) => {
                const updated = [...products];
                updated[i] = { ...updated[i], desc: v };
                onUpdate("products", updated);
              }} rows={3} />
              <TextField label="Price" value={p.price} onChange={(v) => {
                const updated = [...products];
                updated[i] = { ...updated[i], price: v };
                onUpdate("products", updated);
              }} placeholder="e.g. $2,999/mo" />
              <TextField label="Audience" value={p.audience || ""} onChange={(v) => {
                const updated = [...products];
                updated[i] = { ...updated[i], audience: v };
                onUpdate("products", updated);
              }} placeholder="Who is this for?" />
              <TextAreaField label="Features (one per line)" value={(p.features || []).join("\n")} onChange={(v) => {
                const updated = [...products];
                updated[i] = { ...updated[i], features: v.split("\n").filter(Boolean) };
                onUpdate("products", updated);
              }} rows={4} />
              <button
                onClick={() => {
                  const updated = products.filter((_, idx) => idx !== i);
                  onUpdate("products", updated);
                  setExpanded(null);
                }}
                className="mt-2 text-[10px] text-red-400 hover:text-red-300 transition"
              >
                Remove this product
              </button>
            </div>
          )}
        </div>
      ))}
      <button
        onClick={() => {
          onUpdate("products", [...products, { name: "New Product", slug: "new-product", desc: "", price: "$0", features: [] }]);
          setExpanded(products.length);
        }}
        className="w-full py-2 rounded-lg border border-dashed border-white/10 text-xs text-zinc-500 hover:text-zinc-300 hover:border-white/20 transition"
      >
        + Add Product
      </button>
    </>
  );
}

function TestimonialsPanel({ content, onUpdate }: { content: SiteContent; onUpdate: (path: string, v: unknown) => void }) {
  const testimonials = content.testimonials || [];
  return (
    <>
      {testimonials.map((t, i) => (
        <div key={i} className="mb-4 p-3 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] uppercase tracking-wider font-semibold">Testimonial {i + 1}</span>
            <button onClick={() => onUpdate("testimonials", testimonials.filter((_, idx) => idx !== i))} className="text-[10px] text-red-400 hover:text-red-300 transition">Remove</button>
          </div>
          <TextField label="Name" value={t.name} onChange={(v) => {
            const u = [...testimonials]; u[i] = { ...u[i], name: v }; onUpdate("testimonials", u);
          }} />
          <TextField label="Role" value={t.role} onChange={(v) => {
            const u = [...testimonials]; u[i] = { ...u[i], role: v }; onUpdate("testimonials", u);
          }} placeholder="e.g. CEO at Acme" />
          <TextAreaField label="Quote" value={t.text} onChange={(v) => {
            const u = [...testimonials]; u[i] = { ...u[i], text: v }; onUpdate("testimonials", u);
          }} rows={2} />
          <SelectField label="Rating" value={String(t.rating || 5)} onChange={(v) => {
            const u = [...testimonials]; u[i] = { ...u[i], rating: parseInt(v) }; onUpdate("testimonials", u);
          }} options={[{ value: "5", label: "5 stars" }, { value: "4", label: "4 stars" }, { value: "3", label: "3 stars" }]} />
        </div>
      ))}
      <button
        onClick={() => onUpdate("testimonials", [...testimonials, { name: "", role: "", text: "", rating: 5 }])}
        className="w-full py-2 rounded-lg border border-dashed border-white/10 text-xs text-zinc-500 hover:text-zinc-300 hover:border-white/20 transition"
      >
        + Add Testimonial
      </button>
    </>
  );
}

function ProcessPanel({ content, onUpdate }: { content: SiteContent; onUpdate: (path: string, v: unknown) => void }) {
  const process = content.process || { title: "", steps: [] };
  const steps = process.steps || [];
  return (
    <>
      <TextField label="Section Title" value={process.title || ""} onChange={(v) => onUpdate("process", { ...process, title: v })} />
      {steps.map((s, i) => (
        <div key={i} className="mb-3 p-3 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] uppercase tracking-wider font-semibold">Step {i + 1}</span>
            <button onClick={() => onUpdate("process", { ...process, steps: steps.filter((_, idx) => idx !== i) })} className="text-[10px] text-red-400 hover:text-red-300 transition">Remove</button>
          </div>
          <TextField label="Title" value={s.title} onChange={(v) => {
            const u = [...steps]; u[i] = { ...u[i], title: v }; onUpdate("process", { ...process, steps: u });
          }} />
          <TextAreaField label="Description" value={s.desc} onChange={(v) => {
            const u = [...steps]; u[i] = { ...u[i], desc: v }; onUpdate("process", { ...process, steps: u });
          }} rows={2} />
        </div>
      ))}
      <button
        onClick={() => onUpdate("process", { ...process, steps: [...steps, { step: String(steps.length + 1), title: "", desc: "" }] })}
        className="w-full py-2 rounded-lg border border-dashed border-white/10 text-xs text-zinc-500 hover:text-zinc-300 hover:border-white/20 transition"
      >
        + Add Step
      </button>
    </>
  );
}

function FAQPanel({ content, onUpdate }: { content: SiteContent; onUpdate: (path: string, v: unknown) => void }) {
  const faq = content.faq || [];
  return (
    <>
      {faq.map((f, i) => (
        <div key={i} className="mb-3 p-3 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] uppercase tracking-wider font-semibold">FAQ {i + 1}</span>
            <button onClick={() => onUpdate("faq", faq.filter((_, idx) => idx !== i))} className="text-[10px] text-red-400 hover:text-red-300 transition">Remove</button>
          </div>
          <TextField label="Question" value={f.question} onChange={(v) => {
            const u = [...faq]; u[i] = { ...u[i], question: v }; onUpdate("faq", u);
          }} />
          <TextAreaField label="Answer" value={f.answer} onChange={(v) => {
            const u = [...faq]; u[i] = { ...u[i], answer: v }; onUpdate("faq", u);
          }} rows={3} />
        </div>
      ))}
      <button
        onClick={() => onUpdate("faq", [...faq, { question: "", answer: "" }])}
        className="w-full py-2 rounded-lg border border-dashed border-white/10 text-xs text-zinc-500 hover:text-zinc-300 hover:border-white/20 transition"
      >
        + Add FAQ
      </button>
    </>
  );
}

function CTAPanel({ content, onUpdate }: { content: SiteContent; onUpdate: (path: string, v: unknown) => void }) {
  return (
    <>
      <TextField label="Headline" value={content.cta?.headline || ""} onChange={(v) => onUpdate("cta.headline", v)} />
      <TextField label="Subheadline" value={content.cta?.subheadline || ""} onChange={(v) => onUpdate("cta.subheadline", v)} />
      <TextField label="Button Text" value={content.cta?.button_text || ""} onChange={(v) => onUpdate("cta.button_text", v)} />
    </>
  );
}

function ContactPanel({ content, onUpdate }: { content: SiteContent; onUpdate: (path: string, v: unknown) => void }) {
  return (
    <>
      <TextField label="Email" value={content.contact?.email || ""} onChange={(v) => onUpdate("contact.email", v)} />
      <TextField label="Phone" value={content.contact?.phone || ""} onChange={(v) => onUpdate("contact.phone", v)} />
      <TextField label="Hours" value={content.contact?.hours || ""} onChange={(v) => onUpdate("contact.hours", v)} />
      <TextField label="Address" value={content.contact?.address || ""} onChange={(v) => onUpdate("contact.address", v)} />
    </>
  );
}

function SEOPanel({ content, onUpdate }: { content: SiteContent; onUpdate: (path: string, v: unknown) => void }) {
  return (
    <>
      <TextField label="Page Title" value={content.seo?.title || ""} onChange={(v) => onUpdate("seo.title", v)} maxLength={60} />
      <TextAreaField label="Meta Description" value={content.seo?.description || ""} onChange={(v) => onUpdate("seo.description", v)} rows={3} maxLength={155} />
    </>
  );
}

function BrandPanel({ brand, layout, onBrandUpdate, onLayoutChange }: {
  brand: Brand; layout: string;
  onBrandUpdate: (path: string, v: unknown) => void;
  onLayoutChange: (v: string) => void;
}) {
  return (
    <>
      <SelectField
        label="Layout Template"
        value={layout}
        onChange={onLayoutChange}
        options={[
          { value: "default", label: "Default (Professional)" },
          { value: "minimal", label: "Minimal (Editorial)" },
          { value: "creator", label: "Creator (Bold)" },
        ]}
      />
      <div className="mt-3">
        <p className="text-[10px] uppercase tracking-wider font-semibold mb-2">Colors</p>
        <ColorField label="Primary" value={brand.colors?.primary || "#6366f1"} onChange={(v) => onBrandUpdate("colors.primary", v)} />
        <ColorField label="Accent" value={brand.colors?.accent || "#a78bfa"} onChange={(v) => onBrandUpdate("colors.accent", v)} />
        <ColorField label="Secondary" value={brand.colors?.secondary || "#1e1b4b"} onChange={(v) => onBrandUpdate("colors.secondary", v)} />
        <ColorField label="Background" value={brand.colors?.background || "#0c0a09"} onChange={(v) => onBrandUpdate("colors.background", v)} />
        <ColorField label="Text" value={brand.colors?.text || "#e4e4e7"} onChange={(v) => onBrandUpdate("colors.text", v)} />
      </div>
      <div className="mt-3">
        <p className="text-[10px] uppercase tracking-wider font-semibold mb-2">Fonts</p>
        <TextField label="Heading Font" value={brand.fonts?.heading || ""} onChange={(v) => onBrandUpdate("fonts.heading", v)} placeholder="e.g. Poppins" />
        <TextField label="Body Font" value={brand.fonts?.body || ""} onChange={(v) => onBrandUpdate("fonts.body", v)} placeholder="e.g. Inter" />
      </div>
      <div className="mt-3">
        <SelectField
          label="Brand Tone"
          value={brand.tone || "professional"}
          onChange={(v) => onBrandUpdate("tone", v)}
          options={[
            { value: "professional", label: "Professional" },
            { value: "friendly", label: "Friendly" },
            { value: "bold", label: "Bold" },
            { value: "luxurious", label: "Luxurious" },
            { value: "playful", label: "Playful" },
            { value: "energetic", label: "Energetic" },
          ]}
        />
      </div>
    </>
  );
}

/* ─── Section panel router ─── */

function SectionContent({ sectionKey, content, brand, layout, onContentUpdate, onBrandUpdate, onLayoutChange }: {
  sectionKey: string; content: SiteContent; brand: Brand; layout: string;
  onContentUpdate: (path: string, v: unknown) => void;
  onBrandUpdate: (path: string, v: unknown) => void;
  onLayoutChange: (v: string) => void;
}) {
  switch (sectionKey) {
    case "hero": return <HeroPanel content={content} onUpdate={onContentUpdate} />;
    case "about": return <AboutPanel content={content} onUpdate={onContentUpdate} />;
    case "features": return <FeaturesPanel content={content} onUpdate={onContentUpdate} />;
    case "products": return <ProductsPanel content={content} onUpdate={onContentUpdate} />;
    case "testimonials": return <TestimonialsPanel content={content} onUpdate={onContentUpdate} />;
    case "process": return <ProcessPanel content={content} onUpdate={onContentUpdate} />;
    case "faq": return <FAQPanel content={content} onUpdate={onContentUpdate} />;
    case "cta": return <CTAPanel content={content} onUpdate={onContentUpdate} />;
    case "contact": return <ContactPanel content={content} onUpdate={onContentUpdate} />;
    case "seo": return <SEOPanel content={content} onUpdate={onContentUpdate} />;
    case "brand": return <BrandPanel brand={brand} layout={layout} onBrandUpdate={onBrandUpdate} onLayoutChange={onLayoutChange} />;
    default: return null;
  }
}

/* ─── Main Editor Page ─── */

export default function EditorPage() {
  const params = useParams();
  const businessId = params.businessId as string;
  const { business, refreshBusiness } = useBusinessContext();

  // Core state
  const [siteContent, setSiteContent] = useState<SiteContent | null>(null);
  const [brand, setBrand] = useState<Brand | null>(null);
  const [layout, setLayout] = useState("default");
  const [initialized, setInitialized] = useState(false);

  // UI state
  const [activeSection, setActiveSection] = useState("hero");
  const [previewMode, setPreviewMode] = useState<"desktop" | "mobile">("desktop");
  const [mobileTab, setMobileTab] = useState<"edit" | "preview">("edit");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Save state
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [dirty, setDirty] = useState(false);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // AI state
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [aiStatus, setAiStatus] = useState<"idle" | "success" | "error">("idle");
  const [aiChangedSections, setAiChangedSections] = useState<string[]>([]);

  // Multi-action state
  const [imageGenState, setImageGenState] = useState<{ slot: string; status: "generating" | "done" | "error"; summary: string } | null>(null);
  const [auditResults, setAuditResults] = useState<{ findings: { category: string; severity: string; title: string; description: string; recommendation: string; section?: string }[]; overall_score: number; summary: string } | null>(null);
  const [aiMessage, setAiMessage] = useState<string | null>(null);

  // Auto-recommendations
  const [recommendations, setRecommendations] = useState<{ title: string; description: string; action: string; severity: string; section: string }[]>([]);
  const [recsLoading, setRecsLoading] = useState(false);
  const [recsDismissed, setRecsDismissed] = useState(false);
  const recsFetched = useRef(false);

  // Video generation state
  const [videoGenState, setVideoGenState] = useState<{ style: string; status: "scripting" | "voiceover" | "rendering" | "done" | "error"; summary: string } | null>(null);

  // Undo
  const [undoStack, setUndoStack] = useState<{ siteContent: SiteContent; brand: Brand; layout: string }[]>([]);

  // Iframe
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [iframeLoading, setIframeLoading] = useState(true);

  // Initialize from business
  useEffect(() => {
    if (!business || initialized) return;
    setSiteContent((business.site_content as SiteContent) || {});
    setBrand((business.brand as Brand) || {});
    setLayout((business.layout as string) || "default");
    setInitialized(true);
  }, [business, initialized]);

  // Auto-recommendations on first load
  useEffect(() => {
    if (!initialized || !business || !siteContent || recsFetched.current) return;
    recsFetched.current = true;
    setRecsLoading(true);
    fetch("/api/site-edit/recommendations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        businessId: business.id,
        siteContent,
        brand,
        businessContext: {
          name: business.name,
          tagline: business.tagline,
          type: business.type,
          audience: business.audience,
        },
      }),
    })
      .then((res) => res.json())
      .then((data) => setRecommendations(data.recommendations || []))
      .catch(() => {})
      .finally(() => setRecsLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialized]);

  // Autosave
  useEffect(() => {
    if (!dirty || !business || !siteContent || !brand) return;

    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);

    saveTimerRef.current = setTimeout(async () => {
      setSaveStatus("saving");
      try {
        const res = await fetch(`/api/business/${business.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ site_content: siteContent, brand, layout }),
        });
        if (res.ok) {
          setSaveStatus("saved");
          setDirty(false);
          await refreshBusiness();
          // Reload preview
          if (iframeRef.current) {
            setIframeLoading(true);
            const separator = previewBaseUrl.includes("?") ? "&" : "?";
            iframeRef.current.src = `${previewBaseUrl}${separator}t=${Date.now()}`;
          }
          setTimeout(() => setSaveStatus("idle"), 2000);
        } else {
          setSaveStatus("error");
        }
      } catch {
        setSaveStatus("error");
      }
    }, 1500);

    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dirty, siteContent, brand, layout]);

  // beforeunload
  useEffect(() => {
    function handler(e: BeforeUnloadEvent) {
      if (dirty) { e.preventDefault(); e.returnValue = ""; }
    }
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);

  // Keyboard shortcuts
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      }
    }
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [undoStack]);

  // Undo
  const pushUndoStack = useCallback(() => {
    if (!siteContent || !brand) return;
    setUndoStack((prev) => [...prev.slice(-19), { siteContent: structuredClone(siteContent), brand: structuredClone(brand), layout }]);
  }, [siteContent, brand, layout]);

  function handleUndo() {
    if (undoStack.length === 0) return;
    const prev = undoStack[undoStack.length - 1];
    setUndoStack((s) => s.slice(0, -1));
    setSiteContent(prev.siteContent);
    setBrand(prev.brand);
    setLayout(prev.layout);
    setDirty(true);
  }

  // Content update
  function handleContentUpdate(path: string, value: unknown) {
    if (!siteContent) return;
    pushUndoStack();
    setSiteContent(deepSet(siteContent, path, value));
    setDirty(true);
  }

  // Brand update
  function handleBrandUpdate(path: string, value: unknown) {
    if (!brand) return;
    pushUndoStack();
    setBrand(deepSet(brand, path, value));
    setDirty(true);
  }

  // Layout change
  function handleLayoutChange(value: string) {
    pushUndoStack();
    setLayout(value);
    setDirty(true);
  }

  // AI edit — processes multi-action response from tool_use API
  async function handleAIEdit() {
    if (!aiPrompt.trim() || aiLoading || !business || !siteContent || !brand) return;
    pushUndoStack();
    setAiLoading(true);
    setAiSummary(null);
    setAiStatus("idle");
    setAiChangedSections([]);
    setAiMessage(null);
    setAuditResults(null);
    const prompt = aiPrompt;
    setAiPrompt("");

    // Snapshot before for diff
    const beforeContent = JSON.stringify(siteContent);
    const beforeBrand = JSON.stringify(brand);

    try {
      const res = await fetch("/api/site-edit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessId: business.id,
          prompt,
          currentContent: { site_content: siteContent, brand },
          businessContext: {
            name: business.name,
            tagline: business.tagline,
            type: business.type,
            audience: business.audience,
          },
        }),
      });

      if (!res.ok) throw new Error("AI edit failed");
      const data = await res.json();
      const actions: Record<string, unknown>[] = data.actions || [];

      const summaries: string[] = [];
      const changed: string[] = [];

      for (const action of actions) {
        switch (action.type) {
          case "content_edit": {
            const newContent = action.site_content as SiteContent;
            const newBrand = action.brand as Brand | null;

            // Detect changed sections
            const sectionKeys = ["hero", "about", "features", "products", "testimonials", "process", "faq", "cta", "contact", "seo"];
            const oldContent = JSON.parse(beforeContent) as Record<string, unknown>;
            for (const key of sectionKeys) {
              if (JSON.stringify(oldContent[key]) !== JSON.stringify((newContent as Record<string, unknown>)[key])) {
                changed.push(key);
              }
            }
            if (newBrand && JSON.stringify(newBrand) !== beforeBrand) {
              changed.push("brand");
            }

            setSiteContent(newContent);
            if (newBrand) setBrand(newBrand);
            setDirty(true);
            summaries.push(action.summary as string || "Content updated");
            break;
          }

          case "image_generating": {
            const slot = action.slot as string;
            const imagePrompt = action.imagePrompt as string;
            summaries.push(action.summary as string || `Generating ${slot} image...`);

            // Fire async image generation
            setImageGenState({ slot, status: "generating", summary: action.summary as string || `Generating ${slot} image...` });
            fetch("/api/site-edit/image", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ businessId: business.id, slot, imagePrompt }),
            })
              .then(async (imgRes) => {
                if (imgRes.ok) {
                  const imgData = await imgRes.json();
                  setImageGenState({ slot, status: "done", summary: `${slot} image generated` });
                  // Update local images state
                  setSiteContent((prev) => {
                    if (!prev) return prev;
                    const images = { ...(prev.images || {}) } as Record<string, unknown>;
                    if (slot.startsWith("product_")) {
                      const idx = parseInt(slot.replace("product_", ""), 10);
                      const products = Array.isArray(images.products) ? [...(images.products as string[])] : [];
                      products[idx] = imgData.url;
                      images.products = products;
                    } else {
                      images[slot] = imgData.url;
                    }
                    return { ...prev, images: images as SiteContent["images"] };
                  });
                  await refreshBusiness();
                  // Reload preview
                  if (iframeRef.current) {
                    setIframeLoading(true);
                    const sep = previewBaseUrl.includes("?") ? "&" : "?";
                    iframeRef.current.src = `${previewBaseUrl}${sep}t=${Date.now()}`;
                  }
                  setTimeout(() => setImageGenState(null), 4000);
                } else {
                  setImageGenState({ slot, status: "error", summary: "Image generation failed" });
                  setTimeout(() => setImageGenState(null), 4000);
                }
              })
              .catch(() => {
                setImageGenState({ slot, status: "error", summary: "Image generation failed" });
                setTimeout(() => setImageGenState(null), 4000);
              });
            break;
          }

          case "video_generating": {
            const vStyle = action.style as string;
            summaries.push(action.summary as string || `Generating ${vStyle} video...`);

            // Fire async video generation pipeline
            setVideoGenState({ style: vStyle, status: "scripting", summary: "Writing video script..." });
            fetch("/api/site-edit/video", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                businessId: business.id,
                style: vStyle,
                topic: action.topic,
                talking_points: action.talking_points,
              }),
            })
              .then(async (vidRes) => {
                if (vidRes.ok) {
                  const vidData = await vidRes.json();
                  if (vidData.partial) {
                    // Remotion Lambda not configured — show script only
                    setVideoGenState({ style: vStyle, status: "done", summary: "Video script generated (rendering not configured)" });
                    setAiMessage(vidData.message);
                  } else {
                    setVideoGenState({ style: vStyle, status: "done", summary: `${vStyle === "promo" ? "Promo" : "Social clip"} video ready!` });
                    await refreshBusiness();
                    if (iframeRef.current) {
                      setIframeLoading(true);
                      const sep = previewBaseUrl.includes("?") ? "&" : "?";
                      iframeRef.current.src = `${previewBaseUrl}${sep}t=${Date.now()}`;
                    }
                  }
                  setTimeout(() => setVideoGenState(null), 6000);
                } else {
                  setVideoGenState({ style: vStyle, status: "error", summary: "Video generation failed" });
                  setTimeout(() => setVideoGenState(null), 5000);
                }
              })
              .catch(() => {
                setVideoGenState({ style: vStyle, status: "error", summary: "Video generation failed" });
                setTimeout(() => setVideoGenState(null), 5000);
              });
            break;
          }

          case "video_embed": {
            const videoUrl = action.video_url as string;
            summaries.push(action.summary as string || "Video embedded");
            // PATCH business with video_url
            fetch(`/api/business/${business.id}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ video_url: videoUrl }),
            }).then(() => refreshBusiness());
            break;
          }

          case "audit": {
            setAuditResults({
              findings: action.findings as { category: string; severity: string; title: string; description: string; recommendation: string; section?: string }[],
              overall_score: action.overall_score as number,
              summary: action.summary as string,
            });
            summaries.push(action.summary as string || "Audit complete");
            break;
          }

          case "blog_created": {
            summaries.push(action.summary as string || "Blog post created");
            // POST to /api/blog
            fetch("/api/blog", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                businessId: business.id,
                title: action.title,
                slug: action.slug,
                content: action.content,
                meta_description: action.meta_description,
                keywords: action.keywords,
              }),
            });
            break;
          }

          case "message": {
            setAiMessage(action.text as string);
            summaries.push(action.summary as string || "AI response");
            break;
          }
        }
      }

      const combinedSummary = summaries.join(" · ");
      setAiSummary(combinedSummary);
      setAiStatus("success");
      setAiChangedSections(changed);
      // Auto-clear after 8 seconds (but not audit results)
      setTimeout(() => { setAiStatus("idle"); setAiSummary(null); setAiChangedSections([]); setAiMessage(null); }, 8000);
    } catch {
      setAiSummary("Failed to apply AI edit. Try again.");
      setAiStatus("error");
      setTimeout(() => { setAiStatus("idle"); setAiSummary(null); }, 4000);
    } finally {
      setAiLoading(false);
    }
  }

  // Loading state
  if (!business || !siteContent || !brand) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <div className="w-8 h-8 rounded-full animate-spin" style={{ border: `2px solid ${T.purple}`, borderTopColor: "transparent" }} />
      </div>
    );
  }

  const slug = business.slug as string;

  // Compute proper URLs — deployed site is a separate Vercel app, /site/[slug] is internal preview
  const liveUrl = business.custom_domain
    ? `https://${business.custom_domain}?nm_admin=true`
    : business.deployed_url ? `${business.deployed_url}?nm_admin=true` : `/site/${slug}`;

  // Always use internal /site/[slug] for editor preview — the deployed site uses ISR caching
  // (60s revalidation) which causes stale previews. Internal route reads fresh from DB.
  const previewBaseUrl = `/site/${slug}`;

  return (
    <>
      {/* Take over viewport */}
      <style>{`
        main { overflow: hidden !important; height: 100vh !important; }
        aside { display: none !important; }
        [data-dashboard-header] { display: none !important; }
      `}</style>

      <div className="flex flex-col h-screen" style={{ background: T.bg }}>
        <EditorTopBar
          businessName={business.name as string}
          businessId={businessId}
          liveUrl={liveUrl}
          saveStatus={saveStatus}
          canUndo={undoStack.length > 0}
          onUndo={handleUndo}
        />

        {/* Mobile tab switcher */}
        <div className="lg:hidden flex" style={{ borderBottom: `1px solid ${T.border}`, background: T.bgEl }}>
          <button
            onClick={() => setMobileTab("edit")}
            className="flex-1 py-2.5 text-xs font-semibold text-center transition"
            style={mobileTab === "edit" ? { color: T.purpleLight, borderBottom: `2px solid ${T.purple}` } : { color: T.text3 }}
          >
            Edit
          </button>
          <button
            onClick={() => setMobileTab("preview")}
            className="flex-1 py-2.5 text-xs font-semibold text-center transition"
            style={mobileTab === "preview" ? { color: T.purpleLight, borderBottom: `2px solid ${T.purple}` } : { color: T.text3 }}
          >
            Preview
          </button>
        </div>

        {/* Main content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar */}
          <div className={`w-80 flex flex-col shrink-0 overflow-hidden ${mobileTab === "preview" ? "hidden lg:flex" : "flex"} ${mobileTab === "edit" ? "w-full lg:w-80" : ""}`} style={{ borderRight: `1px solid ${T.border}`, background: T.bgEl }}>
            {/* Toggle for larger screens */}
            <div className="hidden lg:flex items-center justify-between px-4 py-2.5" style={{ borderBottom: `1px solid ${T.border}` }}>
              <span className="text-xs uppercase tracking-wider font-semibold" style={{ color: T.text3 }}>Sections</span>
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="transition p-1"
                style={{ color: T.text3 }}
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d={sidebarOpen ? "M18.75 19.5l-7.5-7.5 7.5-7.5m-6 15L5.25 12l7.5-7.5" : "M11.25 4.5l7.5 7.5-7.5 7.5m-6-15l7.5 7.5-7.5 7.5"} />
                </svg>
              </button>
            </div>

            {/* AI Recommendations */}
            {!recsDismissed && (recsLoading || recommendations.length > 0) && (
              <div style={{ borderBottom: `1px solid ${T.border}` }}>
                <div className="px-4 py-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <svg className="w-3.5 h-3.5" style={{ color: T.gold }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126z" />
                    </svg>
                    <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: T.text2 }}>Quick Wins</span>
                  </div>
                  <button
                    onClick={() => setRecsDismissed(true)}
                    className="transition p-0.5"
                    style={{ color: T.text3 }}
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                {recsLoading ? (
                  <div className="px-4 pb-3 flex items-center gap-2">
                    <div className="w-3 h-3 border-2 border-amber-400/30 border-t-amber-400 rounded-full animate-spin" />
                    <span className="text-[11px]" style={{ color: T.text3 }}>Analyzing your site...</span>
                  </div>
                ) : (
                  <div className="px-3 pb-3 space-y-1.5">
                    {recommendations.map((rec, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          setAiPrompt(rec.action);
                          setRecsDismissed(true);
                        }}
                        className="w-full text-left p-2.5 rounded-lg hover:bg-white/[0.03] transition group"
                      >
                        <div className="flex items-start gap-2">
                          <span style={{
                            width: 6, height: 6, borderRadius: "50%", marginTop: 5, flexShrink: 0,
                            backgroundColor: rec.severity === "critical" ? "#ef4444" : rec.severity === "important" ? T.gold : T.purple,
                          }} />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium transition" style={{ color: T.text2 }}>{rec.title}</p>
                            <p className="text-[11px] mt-0.5 leading-relaxed" style={{ color: T.text3 }}>{rec.description}</p>
                          </div>
                          <svg className="w-3 h-3 transition shrink-0 mt-0.5" style={{ color: T.text3 }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                          </svg>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Section accordion */}
            <div className="flex-1 overflow-y-auto">
              {SECTIONS.map((section) => {
                const isActive = activeSection === section.key;
                const wasChanged = aiChangedSections.includes(section.key);
                return (
                  <div key={section.key} style={{ borderBottom: `1px solid ${T.border}` }}>
                    <button
                      onClick={() => setActiveSection(isActive ? "" : section.key)}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left transition"
                      style={wasChanged ? { backgroundColor: "rgba(34,197,94,0.06)" } : isActive ? { background: "rgba(123,57,252,0.06)" } : undefined}
                    >
                      <svg className="w-4 h-4 shrink-0" style={{ color: isActive ? T.purpleLight : T.text3 }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d={section.icon} />
                      </svg>
                      <span className="text-sm font-medium flex-1" style={{ color: isActive ? T.text : T.text2 }}>{section.label}</span>
                      {wasChanged && (
                        <span style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: "#10b981", flexShrink: 0 }} />
                      )}
                      <svg className={`w-3 h-3 transition-transform ${isActive ? "rotate-180" : ""}`} style={{ color: T.text3 }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {isActive && (
                      <div className="px-4 pb-4">
                        <SectionContent
                          sectionKey={section.key}
                          content={siteContent}
                          brand={brand}
                          layout={layout}
                          onContentUpdate={handleContentUpdate}
                          onBrandUpdate={handleBrandUpdate}
                          onLayoutChange={handleLayoutChange}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Preview pane */}
          <div className={`flex-1 flex flex-col overflow-hidden ${mobileTab === "edit" ? "hidden lg:flex" : "flex"}`} style={{ background: T.bgAlt }}>
            {/* Preview toolbar */}
            <div className="flex items-center justify-between px-4 py-2 shrink-0" style={{ borderBottom: `1px solid ${T.border}`, background: T.bgEl }}>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPreviewMode("desktop")}
                  className="p-1.5 rounded transition"
                  style={previewMode === "desktop" ? { background: "rgba(255,255,255,0.10)", color: T.text } : { color: T.text3 }}
                  title="Desktop preview"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25A2.25 2.25 0 015.25 3h13.5A2.25 2.25 0 0121 5.25z" />
                  </svg>
                </button>
                <button
                  onClick={() => setPreviewMode("mobile")}
                  className="p-1.5 rounded transition"
                  style={previewMode === "mobile" ? { background: "rgba(255,255,255,0.10)", color: T.text } : { color: T.text3 }}
                  title="Mobile preview"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
                  </svg>
                </button>
              </div>
              <button
                onClick={() => {
                  if (iframeRef.current) {
                    setIframeLoading(true);
                    const sep = previewBaseUrl.includes("?") ? "&" : "?";
                    iframeRef.current.src = `${previewBaseUrl}${sep}t=${Date.now()}`;
                  }
                }}
                className="p-1.5 rounded transition"
                style={{ color: T.text3 }}
                title="Refresh preview"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
                </svg>
              </button>
            </div>

            {/* Iframe container */}
            <div className="flex-1 overflow-hidden flex items-start justify-center p-4">
              <div
                className={`relative h-full transition-all duration-300 ${
                  previewMode === "mobile"
                    ? "w-[375px] rounded-[2rem] shadow-2xl overflow-hidden"
                    : "w-full rounded-lg overflow-hidden"
                }`}
              >
                {/* Loading overlay */}
                {iframeLoading && (
                  <div className="absolute inset-0 bg-black/50 z-10 flex items-center justify-center">
                    <div className="w-6 h-6 rounded-full animate-spin" style={{ border: `2px solid ${T.purple}`, borderTopColor: "transparent" }} />
                  </div>
                )}
                <iframe
                  ref={iframeRef}
                  src={`${previewBaseUrl}${previewBaseUrl.includes("?") ? "&" : "?"}t=${Date.now()}`}
                  className="w-full h-full bg-white"
                  onLoad={() => setIframeLoading(false)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Audit Results Overlay */}
        {auditResults && (
          <div className="fixed inset-0 z-50 flex items-center justify-end">
            <div className="absolute inset-0 bg-black/50" onClick={() => setAuditResults(null)} />
            <div className="relative w-full max-w-lg h-full overflow-y-auto" style={{ background: T.bgEl, borderLeft: `1px solid ${T.border}` }}>
              <div className="sticky top-0 px-5 py-4 flex items-center justify-between" style={{ background: T.bgEl, borderBottom: `1px solid ${T.border}` }}>
                <div className="flex items-center gap-3">
                  <span className="text-lg font-bold" style={{ color: T.text, fontFamily: T.h }}>Site Audit</span>
                  <span style={{
                    padding: "4px 12px",
                    borderRadius: 20,
                    fontSize: 13,
                    fontWeight: 700,
                    color: auditResults.overall_score >= 80 ? "#10b981" : auditResults.overall_score >= 60 ? "#f59e0b" : "#ef4444",
                    backgroundColor: auditResults.overall_score >= 80 ? "rgba(16,185,129,0.15)" : auditResults.overall_score >= 60 ? "rgba(245,158,11,0.15)" : "rgba(239,68,68,0.15)",
                  }}>
                    {auditResults.overall_score}/100
                  </span>
                </div>
                <button onClick={() => setAuditResults(null)} className="text-zinc-500 hover:text-white transition p-1">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="px-5 py-4">
                <p className="text-sm text-zinc-300 mb-5">{auditResults.summary}</p>
                {(["critical", "important", "suggestion"] as const).map((severity) => {
                  const items = auditResults.findings.filter((f) => f.severity === severity);
                  if (items.length === 0) return null;
                  return (
                    <div key={severity} className="mb-5">
                      <div className="flex items-center gap-2 mb-3">
                        <span style={{
                          width: 8, height: 8, borderRadius: "50%",
                          backgroundColor: severity === "critical" ? "#ef4444" : severity === "important" ? T.gold : T.purple,
                        }} />
                        <span className="text-xs font-semibold uppercase tracking-wider" style={{
                          color: severity === "critical" ? "#ef4444" : severity === "important" ? T.gold : T.purpleLight,
                        }}>
                          {severity} ({items.length})
                        </span>
                      </div>
                      {items.map((finding, i) => (
                        <div key={i} className="mb-3 p-3 rounded-lg border border-white/5 bg-black/30">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium text-white">{finding.title}</span>
                            <span className="text-[10px] text-zinc-600 px-1.5 py-0.5 rounded bg-white/5">{finding.category}</span>
                            {finding.section && (
                              <span className="text-[10px] text-zinc-600 px-1.5 py-0.5 rounded bg-white/5">{finding.section}</span>
                            )}
                          </div>
                          <p className="text-xs text-zinc-400 mb-1.5">{finding.description}</p>
                          <p className="text-xs text-emerald-400/80">{finding.recommendation}</p>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* AI Prompt Bar */}
        <div className="px-4 py-3 shrink-0" style={{ borderTop: `1px solid ${T.border}`, background: T.bgEl, backdropFilter: "blur(20px)" }}>
          {/* Image generation progress */}
          {imageGenState && (
            <div style={{
              marginBottom: 8, padding: "8px 12px", borderRadius: 8,
              backgroundColor: imageGenState.status === "error" ? "rgba(239,68,68,0.1)" : "rgba(99,102,241,0.1)",
              border: `1px solid ${imageGenState.status === "error" ? "rgba(239,68,68,0.2)" : "rgba(99,102,241,0.2)"}`,
            }} className="flex items-center gap-2">
              {imageGenState.status === "generating" && (
                <div className="w-3.5 h-3.5 border-2 border-indigo-400/30 border-t-indigo-400 rounded-full animate-spin shrink-0" />
              )}
              {imageGenState.status === "done" && (
                <svg className="w-4 h-4 text-emerald-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
              {imageGenState.status === "error" && (
                <svg className="w-4 h-4 text-red-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                </svg>
              )}
              <span className={`text-xs flex-1 ${imageGenState.status === "error" ? "text-red-300" : imageGenState.status === "done" ? "text-emerald-300" : "text-indigo-300"}`}>
                {imageGenState.summary}
                {imageGenState.status === "generating" && " (~15-30s)"}
              </span>
            </div>
          )}

          {/* Video generation progress */}
          {videoGenState && (
            <div style={{
              marginBottom: 8, padding: "8px 12px", borderRadius: 8,
              backgroundColor: videoGenState.status === "error" ? "rgba(239,68,68,0.1)" : "rgba(168,85,247,0.1)",
              border: `1px solid ${videoGenState.status === "error" ? "rgba(239,68,68,0.2)" : "rgba(168,85,247,0.2)"}`,
            }} className="flex items-center gap-2">
              {videoGenState.status === "done" ? (
                <svg className="w-4 h-4 text-emerald-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ) : videoGenState.status === "error" ? (
                <svg className="w-4 h-4 text-red-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                </svg>
              ) : (
                <div className="w-3.5 h-3.5 border-2 border-purple-400/30 border-t-purple-400 rounded-full animate-spin shrink-0" />
              )}
              <span className={`text-xs flex-1 ${videoGenState.status === "error" ? "text-red-300" : videoGenState.status === "done" ? "text-emerald-300" : "text-purple-300"}`}>
                {videoGenState.summary}
              </span>
              {(videoGenState.status === "scripting" || videoGenState.status === "voiceover" || videoGenState.status === "rendering") && (
                <span className="text-[10px] text-purple-400/60">~1-3 min</span>
              )}
            </div>
          )}

          {/* AI message response */}
          {aiMessage && (
            <div style={{ marginBottom: 8, padding: "8px 12px", borderRadius: 8, backgroundColor: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.15)" }} className="flex items-start gap-2">
              <svg className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
              </svg>
              <span className="text-xs text-zinc-300 flex-1">{aiMessage}</span>
              <button onClick={() => setAiMessage(null)} className="text-zinc-500 hover:text-white transition p-0.5 shrink-0">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}

          {aiSummary && aiStatus === "success" && (
            <div style={{ marginBottom: 8, padding: "8px 12px", borderRadius: 8, backgroundColor: "rgba(16, 185, 129, 0.1)", border: "1px solid rgba(16, 185, 129, 0.2)" }} className="flex items-center gap-2">
              <svg className="w-4 h-4 text-emerald-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-xs text-emerald-300 flex-1">{aiSummary}</span>
              {aiChangedSections.length > 0 && (
                <span style={{ padding: "2px 8px", borderRadius: 10, backgroundColor: "rgba(16, 185, 129, 0.15)", fontSize: 10, color: "#6ee7b7", whiteSpace: "nowrap" }}>
                  {aiChangedSections.length} section{aiChangedSections.length !== 1 ? "s" : ""} updated
                </span>
              )}
              <button onClick={() => { setAiStatus("idle"); setAiSummary(null); setAiChangedSections([]); }} className="text-zinc-500 hover:text-white transition p-0.5">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}
          {aiSummary && aiStatus === "error" && (
            <div style={{ marginBottom: 8, padding: "8px 12px", borderRadius: 8, backgroundColor: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.2)" }} className="flex items-center gap-2">
              <svg className="w-4 h-4 text-red-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
              <span className="text-xs text-red-300 flex-1">{aiSummary}</span>
            </div>
          )}
          <div className="flex items-center gap-3">
            <div className="flex-1 relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2">
                <svg className="w-4 h-4" style={{ color: T.text3 }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                </svg>
              </div>
              <input
                type="text"
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleAIEdit();
                }}
                placeholder="Edit text, generate images, audit site, write blog posts... (Cmd+Enter)"
                disabled={aiLoading}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg text-sm focus:outline-none transition disabled:opacity-50"
                style={{ background: "rgba(0,0,0,0.30)", border: `1px solid ${T.border}`, color: T.text }}
              />
            </div>
            <button
              onClick={handleAIEdit}
              disabled={aiLoading || !aiPrompt.trim()}
              className="px-5 py-2.5 rounded-lg text-sm font-semibold disabled:opacity-30 shrink-0 flex items-center gap-2"
              style={{ background: CTA_GRAD, color: "#fff" }}
            >
              {aiLoading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Editing...
                </>
              ) : (
                <>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                  </svg>
                  Apply
                </>
              )}
            </button>
          </div>
          <p className="text-[10px] mt-1.5" style={{ color: T.text3 }}>
            {aiLoading ? "AI is working..." : "Edit content, generate images, audit your site, write blog posts, embed videos — all from one prompt."}
          </p>
        </div>
      </div>
    </>
  );
}