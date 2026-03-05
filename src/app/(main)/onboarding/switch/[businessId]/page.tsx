"use client";

import { Suspense, useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { T, CTA_GRAD } from "@/lib/design-tokens";

type StepId = "booking" | "proposals" | "payments" | "clients" | "done";

interface StepDef {
  id: StepId;
  title: string;
  subtitle: string;
  replaces?: string;
}

const STEPS: StepDef[] = [
  {
    id: "booking",
    title: "Your booking link is live.",
    subtitle: "Clients book directly from your site or you can share the link anywhere. No more back-and-forth scheduling.",
    replaces: "Calendly / Acuity",
  },
  {
    id: "proposals",
    title: "AI-written proposals.",
    subtitle: "Describe the project. Kovra writes the proposal. Send it in under a minute — client signs on the same page.",
    replaces: "Google Docs + DocuSign",
  },
  {
    id: "payments",
    title: "Get paid online.",
    subtitle: "Connect Stripe to send branded invoices paid by card or bank. Your clients pay, you get notified.",
    replaces: "PayPal / FreshBooks",
  },
  {
    id: "clients",
    title: "Bring your clients in.",
    subtitle: "Your client list, your pipeline, your projects — all in one place. Add the first one now or import later.",
    replaces: "Spreadsheets / Pipedrive",
  },
  {
    id: "done",
    title: "You're set up.",
    subtitle: "Your workspace is ready. Here's what you replaced.",
  },
];

function CheckIcon({ color = T.green }: { color?: string }) {
  return (
    <svg width="14" height="14" fill="none" stroke={color} viewBox="0 0 24 24" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  );
}

function ArrowRight() {
  return (
    <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
  );
}

interface Business {
  id: string;
  name: string;
  slug: string;
  deployed_url?: string;
  live_url?: string;
  stripe_account_id?: string;
}

export default function SwitchOnboardingPage() {
  return (
    <Suspense>
      <SwitchOnboardingContent />
    </Suspense>
  );
}

function SwitchOnboardingContent() {
  const { businessId } = useParams<{ businessId: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const toolsParam = searchParams.get("tools") || "";
  const replacedTools = toolsParam ? toolsParam.split(",") : [];

  const [business, setBusiness] = useState<Business | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [completed, setCompleted] = useState<Set<StepId>>(new Set());
  const [loading, setLoading] = useState(true);

  // Payments step state
  const [stripeConnected, setStripeConnected] = useState(false);
  const [connectingStripe, setConnectingStripe] = useState(false);

  // Clients step state
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [addingContact, setAddingContact] = useState(false);
  const [contactAdded, setContactAdded] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/onboarding?businessId=${businessId}`);
        if (res.ok) {
          const data = await res.json();
          const biz = data.business as Business;
          setBusiness(biz);
          if (biz.stripe_account_id) setStripeConnected(true);
        }
      } catch {}
      setLoading(false);
    }
    load();
  }, [businessId]);

  const step = STEPS[currentStep];
  const isLast = currentStep === STEPS.length - 1;
  const progress = ((currentStep) / (STEPS.length - 1)) * 100;

  function markCompleteAndNext() {
    setCompleted(prev => new Set([...prev, step.id]));
    if (!isLast) setCurrentStep(i => i + 1);
    else router.push(`/dashboard/switch/${businessId}?tools=${encodeURIComponent(toolsParam)}`);
  }

  async function handleStripeConnect() {
    setConnectingStripe(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const res = await fetch("/api/stripe/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessId, userId: user?.id }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.url) window.location.href = data.url;
      }
    } catch {}
    setConnectingStripe(false);
  }

  async function handleAddContact(e: React.FormEvent) {
    e.preventDefault();
    if (!contactName.trim()) return;
    setAddingContact(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      await fetch("/api/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessId,
          userId: user?.id,
          name: contactName,
          email: contactEmail,
        }),
      });
      setContactAdded(true);
    } catch {}
    setAddingContact(false);
  }

  // ── Styles ──

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "12px 14px",
    borderRadius: 9,
    background: T.bgEl,
    border: `1px solid ${T.border}`,
    color: T.text,
    fontSize: "0.9rem",
    fontFamily: T.h,
    outline: "none",
    boxSizing: "border-box",
  };

  function primaryBtn(disabled = false): React.CSSProperties {
    return {
      padding: "12px 26px",
      borderRadius: 9,
      fontSize: "0.88rem",
      fontWeight: 600,
      fontFamily: T.h,
      border: "none",
      cursor: disabled ? "not-allowed" : "pointer",
      background: disabled ? T.bgAlt : CTA_GRAD,
      color: disabled ? T.text3 : "#09090B",
      opacity: disabled ? 0.5 : 1,
      transition: "all 0.15s",
      letterSpacing: "-0.01em",
    };
  }

  function ghostBtn(): React.CSSProperties {
    return {
      padding: "12px 22px",
      borderRadius: 9,
      fontSize: "0.85rem",
      fontWeight: 500,
      fontFamily: T.h,
      border: `1px solid ${T.border}`,
      cursor: "pointer",
      background: "transparent",
      color: T.text2,
      transition: "all 0.15s",
    };
  }

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: T.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: 32, height: 32, borderRadius: "50%", border: `2px solid ${T.border}`, borderTop: `2px solid ${T.gold}`, animation: "spin 0.8s linear infinite" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const bookingUrl = business?.deployed_url || business?.live_url
    ? `${business.deployed_url || business.live_url}/book`
    : null;

  return (
    <div style={{ minHeight: "100vh", background: T.bg, fontFamily: T.h }}>

      {/* Progress bar */}
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, height: 2, background: T.border, zIndex: 100 }}>
        <div
          style={{
            height: "100%",
            background: CTA_GRAD,
            width: `${progress}%`,
            transition: "width 0.4s ease",
          }}
        />
      </div>

      {/* Logo */}
      <div style={{
        position: "fixed", top: 0, left: 0, right: 0,
        height: 56, display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 24px", zIndex: 50,
      }}>
        <Link href="/" style={{ textDecoration: "none", color: T.text, fontWeight: 700, fontSize: 18, letterSpacing: "-0.03em" }}>
          kovra
        </Link>
        <span style={{ fontSize: "0.75rem", color: T.text3 }}>
          {currentStep + 1} / {STEPS.length}
        </span>
      </div>

      {/* Main content */}
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        padding: "96px 24px 80px",
      }}>
        <div style={{ width: "100%", maxWidth: 600 }}>

          {/* Step nav dots */}
          <div style={{ display: "flex", gap: 6, marginBottom: 40 }}>
            {STEPS.map((s, i) => (
              <div
                key={s.id}
                style={{
                  flex: i === currentStep ? 3 : 1,
                  height: 3,
                  borderRadius: 2,
                  background: completed.has(s.id)
                    ? T.gold
                    : i === currentStep
                    ? "rgba(200,164,78,0.5)"
                    : T.border,
                  transition: "all 0.3s ease",
                }}
              />
            ))}
          </div>

          {/* Step header */}
          {step.replaces && (
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              padding: "4px 10px", borderRadius: 100, marginBottom: 16,
              background: "rgba(239,68,68,0.06)",
              border: "1px solid rgba(239,68,68,0.15)",
            }}>
              <span style={{ fontSize: "0.7rem", color: "#EF4444", fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase" }}>
                Replaces {step.replaces}
              </span>
            </div>
          )}

          <h1 style={{
            fontSize: "clamp(1.8rem, 5vw, 2.4rem)",
            fontWeight: 700,
            color: T.text,
            letterSpacing: "-0.03em",
            lineHeight: 1.1,
            marginBottom: 10,
          }}>
            {step.title}
          </h1>
          <p style={{ color: T.text2, fontSize: "0.95rem", lineHeight: 1.65, marginBottom: 36 }}>
            {step.subtitle}
          </p>

          {/* ── BOOKING step ── */}
          {step.id === "booking" && (
            <div>
              {bookingUrl ? (
                <div style={{ marginBottom: 28 }}>
                  <p style={{ fontSize: "0.78rem", color: T.text3, marginBottom: 8, letterSpacing: "0.04em", textTransform: "uppercase" }}>
                    Your booking link
                  </p>
                  <div style={{
                    display: "flex", alignItems: "center", gap: 12,
                    padding: "12px 16px",
                    background: T.bgEl,
                    border: `1px solid ${T.border}`,
                    borderRadius: 10,
                  }}>
                    <span style={{ flex: 1, fontSize: "0.85rem", color: T.text2, fontFamily: "monospace", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {bookingUrl}
                    </span>
                    <button
                      onClick={() => navigator.clipboard.writeText(bookingUrl)}
                      style={{
                        padding: "6px 14px", borderRadius: 7, fontSize: "0.78rem",
                        fontWeight: 600, fontFamily: T.h, border: `1px solid ${T.border}`,
                        background: T.bgAlt, color: T.text2, cursor: "pointer",
                        flexShrink: 0,
                      }}
                    >
                      Copy
                    </button>
                  </div>
                  <p style={{ fontSize: "0.78rem", color: T.text3, marginTop: 8 }}>
                    Share this link anywhere — social bio, email signature, website. Clients pick a slot, you get notified.
                  </p>
                </div>
              ) : (
                <div style={{
                  padding: "16px 18px", borderRadius: 10,
                  background: T.bgEl, border: `1px solid ${T.border}`,
                  marginBottom: 28,
                }}>
                  <p style={{ fontSize: "0.88rem", color: T.text2 }}>
                    Your booking link will be available after your site deploys. You can also find it in your dashboard under Calls.
                  </p>
                </div>
              )}

              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={markCompleteAndNext} style={primaryBtn()}>
                  Got it — next
                </button>
              </div>
            </div>
          )}

          {/* ── PROPOSALS step ── */}
          {step.id === "proposals" && (
            <div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 28 }}>
                {[
                  { title: "Describe the project", desc: "A few sentences. What you're building, who it's for." },
                  { title: "Kovra writes it", desc: "Scope, pricing, timeline — all drafted in 30 seconds." },
                  { title: "Client reviews + signs", desc: "They e-sign on the same page. No PDF, no DocuSign." },
                  { title: "You both get a copy", desc: "Stored in your dashboard. Searchable. Always there." },
                ].map(({ title, desc }) => (
                  <div key={title} style={{ padding: "14px 16px", borderRadius: 10, background: T.bgEl, border: `1px solid ${T.border}` }}>
                    <p style={{ fontSize: "0.83rem", fontWeight: 600, color: T.text, marginBottom: 4 }}>{title}</p>
                    <p style={{ fontSize: "0.78rem", color: T.text2, lineHeight: 1.55 }}>{desc}</p>
                  </div>
                ))}
              </div>

              <div style={{ display: "flex", gap: 10 }}>
                <Link
                  href={`/dashboard/${businessId}/proposals`}
                  style={{ ...primaryBtn(), textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 8 }}
                >
                  Write my first proposal <ArrowRight />
                </Link>
                <button onClick={markCompleteAndNext} style={ghostBtn()}>
                  Do this later
                </button>
              </div>
            </div>
          )}

          {/* ── PAYMENTS step ── */}
          {step.id === "payments" && (
            <div>
              {stripeConnected ? (
                <div style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "14px 18px", borderRadius: 10,
                  background: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.18)",
                  marginBottom: 28,
                }}>
                  <CheckIcon />
                  <div>
                    <p style={{ fontSize: "0.88rem", fontWeight: 600, color: T.text }}>Stripe is connected.</p>
                    <p style={{ fontSize: "0.78rem", color: T.text2 }}>You can send invoices and accept card payments.</p>
                  </div>
                </div>
              ) : (
                <div style={{ marginBottom: 28 }}>
                  <div style={{
                    padding: "16px 18px", borderRadius: 10,
                    background: T.bgEl, border: `1px solid ${T.border}`,
                    marginBottom: 16,
                  }}>
                    <p style={{ fontSize: "0.88rem", fontWeight: 600, color: T.text, marginBottom: 6 }}>Connect Stripe</p>
                    <p style={{ fontSize: "0.82rem", color: T.text2, lineHeight: 1.6 }}>
                      Takes 2 minutes. Once connected, every invoice you send can be paid online. Funds go directly to your bank.
                    </p>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                    {[
                      { label: "Branded invoices", desc: "Your name, not PayPal's" },
                      { label: "Card + bank pay", desc: "Clients pay how they want" },
                      { label: "Auto-reminders", desc: "Stop chasing payments" },
                    ].map(({ label, desc }) => (
                      <div key={label} style={{ padding: "10px 12px", borderRadius: 9, background: T.bgEl, border: `1px solid ${T.border}` }}>
                        <p style={{ fontSize: "0.78rem", fontWeight: 600, color: T.text, marginBottom: 2 }}>{label}</p>
                        <p style={{ fontSize: "0.72rem", color: T.text3 }}>{desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ display: "flex", gap: 10 }}>
                {!stripeConnected && (
                  <button
                    onClick={handleStripeConnect}
                    disabled={connectingStripe}
                    style={primaryBtn(connectingStripe)}
                  >
                    {connectingStripe ? "Connecting..." : "Connect Stripe"}
                  </button>
                )}
                <button onClick={markCompleteAndNext} style={stripeConnected ? primaryBtn() : ghostBtn()}>
                  {stripeConnected ? "Continue" : "Connect later"}
                </button>
              </div>
            </div>
          )}

          {/* ── CLIENTS step ── */}
          {step.id === "clients" && (
            <div>
              {contactAdded ? (
                <div style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "14px 18px", borderRadius: 10,
                  background: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.18)",
                  marginBottom: 28,
                }}>
                  <CheckIcon />
                  <div>
                    <p style={{ fontSize: "0.88rem", fontWeight: 600, color: T.text }}>{contactName} was added to your CRM.</p>
                    <p style={{ fontSize: "0.78rem", color: T.text2 }}>You can import more from your dashboard.</p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleAddContact} style={{ marginBottom: 24 }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
                    <div>
                      <label style={{ fontSize: "0.75rem", color: T.text3, display: "block", marginBottom: 6 }}>Name</label>
                      <input
                        type="text"
                        value={contactName}
                        onChange={(e) => setContactName(e.target.value)}
                        placeholder="Client name"
                        style={inputStyle}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: "0.75rem", color: T.text3, display: "block", marginBottom: 6 }}>Email</label>
                      <input
                        type="email"
                        value={contactEmail}
                        onChange={(e) => setContactEmail(e.target.value)}
                        placeholder="email@example.com"
                        style={inputStyle}
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={addingContact || contactName.trim().length === 0}
                    style={{ ...primaryBtn(addingContact || contactName.trim().length === 0), marginBottom: 0 }}
                  >
                    {addingContact ? "Adding..." : "Add client"}
                  </button>
                </form>
              )}

              <div style={{ display: "flex", gap: 10 }}>
                {contactAdded && (
                  <button onClick={markCompleteAndNext} style={primaryBtn()}>
                    Continue
                  </button>
                )}
                <button onClick={markCompleteAndNext} style={contactAdded ? ghostBtn() : ghostBtn()}>
                  {contactAdded ? "Add more later" : "Skip — add clients later"}
                </button>
              </div>
            </div>
          )}

          {/* ── DONE step ── */}
          {step.id === "done" && (
            <div>
              {replacedTools.length > 0 && (
                <div style={{ marginBottom: 28 }}>
                  <p style={{ fontSize: "0.75rem", color: T.text3, marginBottom: 12, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                    Tools you replaced
                  </p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {replacedTools.map(tool => (
                      <div
                        key={tool}
                        style={{
                          display: "flex", alignItems: "center", gap: 6,
                          padding: "6px 12px", borderRadius: 100,
                          background: "rgba(34,197,94,0.06)",
                          border: "1px solid rgba(34,197,94,0.18)",
                        }}
                      >
                        <CheckIcon />
                        <span style={{ fontSize: "0.82rem", color: T.text2, fontFamily: T.h }}>{tool}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div style={{
                padding: "18px 20px", borderRadius: 12,
                background: "rgba(200,164,78,0.06)",
                border: "1px solid rgba(200,164,78,0.18)",
                marginBottom: 32,
              }}>
                <p style={{ fontSize: "0.88rem", fontWeight: 600, color: T.gold, marginBottom: 8 }}>Everything is set up.</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {[
                    "Your booking link is live and shareable",
                    "AI proposals — describe a project, send in 30 seconds",
                    "Invoicing and contracts in the same workspace",
                    "Your CRM tracks every client and project",
                  ].map(item => (
                    <div key={item} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <CheckIcon color={T.gold} />
                      <span style={{ fontSize: "0.82rem", color: T.text2 }}>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Link
                href={`/dashboard/switch/${businessId}?tools=${encodeURIComponent(toolsParam)}`}
                style={{
                  ...primaryBtn(),
                  textDecoration: "none",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                Go to my dashboard <ArrowRight />
              </Link>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
