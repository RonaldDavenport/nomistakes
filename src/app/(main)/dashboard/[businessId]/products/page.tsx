"use client";

import { useBusinessContext } from "@/components/dashboard/BusinessProvider";
import { PaywallGate } from "@/components/dashboard/PaywallGate";
import { T, CTA_GRAD } from "@/lib/design-tokens";
import { useParams } from "next/navigation";
import { useState, useEffect, useCallback } from "react";

interface Product {
  id: string;
  name: string;
  description: string | null;
  type: string;
  price_cents: number;
  status: string;
  sales_count: number;
  revenue_cents: number;
  created_at: string;
}

function fmt(cents: number) { return `$${(cents / 100).toFixed(2)}`; }

const HR: React.CSSProperties = {
  width: "100%", height: 1, background: "#1E1E21", border: "none", margin: 0,
};

const PRODUCT_TYPES = [
  {
    label: "Digital Downloads",
    desc: "PDFs, templates, spreadsheets, design files, presets, swipe files",
    icon: "\u2193",
  },
  {
    label: "Online Courses",
    desc: "Video lessons, modules, quizzes, certificates of completion",
    icon: "\u25B6",
  },
  {
    label: "Ebooks & Guides",
    desc: "How-to guides, playbooks, frameworks, checklists",
    icon: "\u2592",
  },
  {
    label: "Templates & Kits",
    desc: "Notion templates, Figma kits, code starters, SOPs",
    icon: "\u25A1",
  },
];

const STEPS = [
  { num: "1", title: "Create a product", desc: "Give it a name, set a price, and pick the type (digital download, course, template, ebook)." },
  { num: "2", title: "Publish it", desc: "Flip it to Active and a Stripe checkout link is generated automatically." },
  { num: "3", title: "Share the link", desc: "Drop it on your site, in an email, or on social. Buyers pay and get instant delivery." },
];

export default function ProductsPage() {
  const params = useParams();
  const businessId = params.businessId as string;
  const { userId } = useBusinessContext();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [price, setPrice] = useState("");
  const [type, setType] = useState("digital");

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/products?businessId=${businessId}`);
    const data = await res.json();
    setProducts(data.products || []);
    setLoading(false);
  }, [businessId]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const createProduct = async () => {
    setSaving(true);
    await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        businessId, userId, name, description: desc,
        priceCents: Math.round(parseFloat(price || "0") * 100),
        type,
      }),
    });
    setSaving(false);
    setShowCreate(false);
    setName(""); setDesc(""); setPrice(""); setType("digital");
    fetchProducts();
  };

  const toggleStatus = async (id: string, current: string) => {
    await fetch("/api/products", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId: id, status: current === "active" ? "draft" : "active" }),
    });
    fetchProducts();
  };

  const totalRevenue = products.reduce((s, p) => s + p.revenue_cents, 0);
  const totalSales = products.reduce((s, p) => s + p.sales_count, 0);

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "10px 12px", fontSize: 13,
    background: T.bgAlt, border: `1px solid ${T.border}`, borderRadius: 8, color: T.text, outline: "none",
  };

  return (
    <PaywallGate requiredPlan="growth" teaser={{ headline: "Digital Products", description: "Sell ebooks, templates, courses, and more. Instant delivery on purchase.", bullets: ["Digital downloads", "Courses and templates", "Stripe-powered checkout"] }}>
      <div style={{ padding: "32px 40px 80px" }}>

        {/* ── Header ── */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: T.text, margin: 0 }}>Products</h1>
            <p style={{ fontSize: 13, color: "#9CA3AF", marginTop: 4 }}>Create and manage digital products your customers can buy.</p>
          </div>
          <button onClick={() => setShowCreate(true)} style={{ background: CTA_GRAD, color: "#09090B", border: "none", borderRadius: 8, padding: "10px 20px", fontSize: 13, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" }}>
            + New Product
          </button>
        </div>

        {/* ── Stats Row ── */}
        <div style={{ display: "flex", alignItems: "stretch", marginBottom: 28 }}>
          <div style={{ flex: 1, paddingRight: 24 }}>
            <p style={{ fontSize: 12, fontWeight: 500, color: "#9CA3AF", margin: 0, marginBottom: 4 }}>Total Products</p>
            <p style={{ fontSize: 22, fontWeight: 700, color: T.text, margin: 0, fontVariantNumeric: "tabular-nums" }}>{products.length}</p>
          </div>
          <div style={{ width: 1, background: "#1E1E21", alignSelf: "stretch" }} />
          <div style={{ flex: 1, padding: "0 24px" }}>
            <p style={{ fontSize: 12, fontWeight: 500, color: "#9CA3AF", margin: 0, marginBottom: 4 }}>Total Sales</p>
            <p style={{ fontSize: 22, fontWeight: 700, color: T.text, margin: 0, fontVariantNumeric: "tabular-nums" }}>{totalSales}</p>
          </div>
          <div style={{ width: 1, background: "#1E1E21", alignSelf: "stretch" }} />
          <div style={{ flex: 1, paddingLeft: 24 }}>
            <p style={{ fontSize: 12, fontWeight: 500, color: "#9CA3AF", margin: 0, marginBottom: 4 }}>Total Revenue</p>
            <p style={{ fontSize: 22, fontWeight: 700, color: T.text, margin: 0, fontVariantNumeric: "tabular-nums" }}>{fmt(totalRevenue)}</p>
          </div>
        </div>

        <hr style={HR} />

        {/* ── Body ── */}
        {loading ? (
          <p style={{ color: "#9CA3AF", fontSize: 13, padding: "40px 0", textAlign: "center" }}>Loading products...</p>
        ) : products.length === 0 ? (
          /* ── Rich Empty State ── */
          <div style={{ paddingTop: 32 }}>

            {/* What you can sell */}
            <div style={{ marginBottom: 32 }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: T.text, margin: 0, marginBottom: 4 }}>What you can sell</h2>
              <p style={{ fontSize: 13, color: "#52525B", margin: 0, marginBottom: 20 }}>Products are digital goods delivered instantly after purchase. No shipping, no inventory.</p>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                {PRODUCT_TYPES.map((pt) => (
                  <div key={pt.label} style={{ background: T.bgEl, border: `1px solid ${T.border}`, borderRadius: 10, padding: "16px 18px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                      <span style={{ fontSize: 14, color: "#9CA3AF", width: 20, textAlign: "center" }}>{pt.icon}</span>
                      <span style={{ fontSize: 14, fontWeight: 600, color: T.text }}>{pt.label}</span>
                    </div>
                    <p style={{ fontSize: 12, color: "#52525B", margin: 0, lineHeight: 1.5 }}>{pt.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            <hr style={HR} />

            {/* How it works */}
            <div style={{ paddingTop: 32, marginBottom: 32 }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: T.text, margin: 0, marginBottom: 20 }}>How it works</h2>

              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                {STEPS.map((s) => (
                  <div key={s.num} style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                    <div style={{ width: 28, height: 28, borderRadius: "50%", background: T.bgAlt, border: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: "#9CA3AF", flexShrink: 0 }}>
                      {s.num}
                    </div>
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 600, color: T.text, margin: 0, marginBottom: 2 }}>{s.title}</p>
                      <p style={{ fontSize: 13, color: "#52525B", margin: 0, lineHeight: 1.5 }}>{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <hr style={HR} />

            {/* CTA */}
            <div style={{ paddingTop: 28, textAlign: "center" }}>
              <p style={{ fontSize: 13, color: "#9CA3AF", margin: 0, marginBottom: 14 }}>Ready to launch your first product?</p>
              <button onClick={() => setShowCreate(true)} style={{ background: CTA_GRAD, color: "#09090B", border: "none", borderRadius: 8, padding: "12px 28px", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
                + Create Your First Product
              </button>
            </div>
          </div>
        ) : (
          /* ── Product List ── */
          <div style={{ paddingTop: 4 }}>
            {products.map((p) => (
              <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 16, padding: "16px 0", borderBottom: `1px solid #1E1E21` }}>
                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: T.text }}>{p.name}</span>
                  {p.description && <p style={{ fontSize: 12, color: "#9CA3AF", marginTop: 2, margin: 0 }}>{p.description}</p>}
                </div>
                <span style={{ fontSize: 13, fontWeight: 600, color: T.text, fontVariantNumeric: "tabular-nums" }}>{fmt(p.price_cents)}</span>
                <span style={{ fontSize: 12, color: "#9CA3AF" }}>{p.sales_count} sales</span>
                <span style={{ fontSize: 12, fontWeight: 500, color: p.status === "active" ? T.green : "#52525B" }}>
                  {p.status === "active" ? "Active" : "Draft"}
                </span>
                <button onClick={() => toggleStatus(p.id, p.status)} style={{ fontSize: 12, color: T.gold, background: "none", border: "none", cursor: "pointer" }}>
                  {p.status === "active" ? "Unpublish" : "Publish"}
                </button>
              </div>
            ))}
          </div>
        )}

        {/* ── Create Modal ── */}
        {showCreate && (
          <>
            <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 50 }} onClick={() => setShowCreate(false)} />
            <div style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: 480, background: T.bgEl, border: `1px solid ${T.border}`, borderRadius: 12, padding: 28, zIndex: 51 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: T.text, marginBottom: 20 }}>New Product</h2>
              <label style={{ display: "block", marginBottom: 16 }}>
                <span style={{ fontSize: 12, fontWeight: 500, color: "#9CA3AF", display: "block", marginBottom: 6 }}>Name</span>
                <input value={name} onChange={(e) => setName(e.target.value)} style={inputStyle} placeholder="e.g. Brand Strategy Template" />
              </label>
              <label style={{ display: "block", marginBottom: 16 }}>
                <span style={{ fontSize: 12, fontWeight: 500, color: "#9CA3AF", display: "block", marginBottom: 6 }}>Description</span>
                <textarea value={desc} onChange={(e) => setDesc(e.target.value)} rows={3} style={{ ...inputStyle, resize: "vertical" }} />
              </label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
                <label>
                  <span style={{ fontSize: 12, fontWeight: 500, color: "#9CA3AF", display: "block", marginBottom: 6 }}>Price ($)</span>
                  <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} style={inputStyle} placeholder="29.00" />
                </label>
                <label>
                  <span style={{ fontSize: 12, fontWeight: 500, color: "#9CA3AF", display: "block", marginBottom: 6 }}>Type</span>
                  <select value={type} onChange={(e) => setType(e.target.value)} style={{ ...inputStyle, appearance: "none" as const }}>
                    <option value="digital">Digital Download</option>
                    <option value="course">Course</option>
                    <option value="template">Template</option>
                    <option value="ebook">Ebook</option>
                  </select>
                </label>
              </div>
              <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
                <button onClick={() => setShowCreate(false)} style={{ padding: "10px 20px", fontSize: 13, background: "none", border: `1px solid ${T.border}`, borderRadius: 8, color: "#9CA3AF", cursor: "pointer" }}>Cancel</button>
                <button onClick={createProduct} disabled={saving || !name} style={{ padding: "10px 20px", fontSize: 13, fontWeight: 600, background: CTA_GRAD, border: "none", borderRadius: 8, color: "#09090B", cursor: "pointer", opacity: saving ? 0.6 : 1 }}>
                  {saving ? "Creating..." : "Create Product"}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </PaywallGate>
  );
}
