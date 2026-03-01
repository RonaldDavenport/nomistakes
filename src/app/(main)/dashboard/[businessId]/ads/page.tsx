"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useBusinessContext } from "@/components/dashboard/BusinessProvider";
import { PaywallGate } from "@/components/dashboard/PaywallGate";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { T, CTA_GRAD, glassCard } from "@/lib/design-tokens";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface AdVariation {
  platform: string;
  headline: string;
  primary_text: string;
  description: string;
  cta: string;
  hashtags: string[];
}

interface AdCampaign {
  id: string;
  business_id: string;
  name: string;
  platforms: string[];
  objective: string;
  status: string;
  variations: AdVariation[];
  created_at: string;
}

interface UgcVideo {
  id: string;
  business_id: string;
  product_or_service: string;
  video_style: string;
  platform: string;
  duration_seconds: number;
  tone: string;
  script: {
    title: string;
    hook: string;
    script: Array<{ timestamp: string; visual: string; dialogue: string; direction: string }>;
    cta: string;
    music_suggestion: string;
    hashtags: string[];
    thumbnail_concept: string;
  };
  status: "generating" | "ready" | "script_only" | "failed";
  video_url: string | null;
  voiceover_url: string | null;
  created_at: string;
}

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const PLATFORM_OPTIONS = ["Meta", "TikTok", "Google"] as const;
const OBJECTIVE_OPTIONS = ["Drive traffic", "Generate leads", "Increase sales", "Brand awareness"] as const;

const UGC_STYLE_OPTIONS = ["testimonial", "unboxing", "demo", "talking_head", "before_after", "tutorial"] as const;
const UGC_PLATFORM_OPTIONS = ["tiktok", "instagram", "youtube"] as const;
const UGC_DURATION_OPTIONS = ["15s", "30s", "60s"] as const;
const UGC_TONE_OPTIONS = ["authentic", "professional", "energetic", "casual"] as const;

const inputStyle: React.CSSProperties = {
  background: T.bgEl,
  color: T.text,
  border: `1px solid ${T.border}`,
  borderRadius: 8,
  padding: "10px 14px",
  fontSize: 14,
  width: "100%",
  outline: "none",
};

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function AdsPage() {
  const params = useParams();
  const router = useRouter();
  const businessId = params.businessId as string;
  const { business, userId, credits, refreshCredits } = useBusinessContext();

  // Tab state
  const [activeTab, setActiveTab] = useState<"ads" | "ugc">("ads");

  // ---- Ad Campaigns ----
  const [campaigns, setCampaigns] = useState<AdCampaign[]>([]);
  const [loadingCampaigns, setLoadingCampaigns] = useState(true);
  const [expandedCampaign, setExpandedCampaign] = useState<string | null>(null);

  // Create campaign form
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [objective, setObjective] = useState<string>(OBJECTIVE_OPTIONS[0]);
  const [productOrService, setProductOrService] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [generatingAd, setGeneratingAd] = useState(false);
  const [adError, setAdError] = useState("");

  // ---- UGC Videos ----
  const [ugcVideos, setUgcVideos] = useState<UgcVideo[]>([]);
  const [loadingUgc, setLoadingUgc] = useState(true);
  const [expandedUgc, setExpandedUgc] = useState<string | null>(null);

  // Create UGC form
  const [showUgcForm, setShowUgcForm] = useState(false);
  const [ugcStyle, setUgcStyle] = useState<string>(UGC_STYLE_OPTIONS[0]);
  const [ugcPlatform, setUgcPlatform] = useState<string>(UGC_PLATFORM_OPTIONS[0]);
  const [ugcDuration, setUgcDuration] = useState<string>(UGC_DURATION_OPTIONS[0]);
  const [ugcTone, setUgcTone] = useState<string>(UGC_TONE_OPTIONS[0]);
  const [ugcProduct, setUgcProduct] = useState("");
  const [generatingUgc, setGeneratingUgc] = useState(false);
  const [ugcError, setUgcError] = useState("");
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Copy-to-clipboard state
  const [copiedField, setCopiedField] = useState<string | null>(null);

  /* ---------------------------------------------------------------- */
  /*  Data fetching                                                    */
  /* ---------------------------------------------------------------- */

  const fetchCampaigns = useCallback(async () => {
    setLoadingCampaigns(true);
    try {
      const { data, error } = await supabase
        .from("ad_campaigns")
        .select("*")
        .eq("business_id", businessId)
        .order("created_at", { ascending: false });
      if (!error && data) {
        setCampaigns(data as AdCampaign[]);
      }
    } catch {
      /* ignore */
    } finally {
      setLoadingCampaigns(false);
    }
  }, [businessId]);

  const fetchUgcVideos = useCallback(async () => {
    setLoadingUgc(true);
    try {
      const { data, error } = await supabase
        .from("ugc_videos")
        .select("*")
        .eq("business_id", businessId)
        .order("created_at", { ascending: false });
      if (!error && data) {
        setUgcVideos(data as UgcVideo[]);
      }
    } catch {
      /* ignore */
    } finally {
      setLoadingUgc(false);
    }
  }, [businessId]);

  useEffect(() => {
    fetchCampaigns();
    fetchUgcVideos();
  }, [fetchCampaigns, fetchUgcVideos]);

  // Poll for generating videos
  useEffect(() => {
    const generatingIds = ugcVideos.filter((v) => v.status === "generating").map((v) => v.id);
    if (generatingIds.length === 0) {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
      return;
    }
    if (pollingRef.current) return; // already polling
    pollingRef.current = setInterval(async () => {
      const currentGenerating = ugcVideos.filter((v) => v.status === "generating");
      if (currentGenerating.length === 0) {
        if (pollingRef.current) {
          clearInterval(pollingRef.current);
          pollingRef.current = null;
        }
        return;
      }
      for (const video of currentGenerating) {
        try {
          const res = await fetch(`/api/ugc/${video.id}/status`);
          if (res.ok) {
            const data = await res.json();
            if (data.status && data.status !== "generating") {
              setUgcVideos((prev) =>
                prev.map((v) =>
                  v.id === video.id
                    ? { ...v, status: data.status, video_url: data.video_url ?? v.video_url, voiceover_url: data.voiceover_url ?? v.voiceover_url }
                    : v
                )
              );
            }
          }
        } catch {
          /* ignore polling errors */
        }
      }
    }, 5000);
    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    };
  }, [ugcVideos]);

  /* ---------------------------------------------------------------- */
  /*  Handlers                                                         */
  /* ---------------------------------------------------------------- */

  function handleInputFocus(e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    e.currentTarget.style.boxShadow = `0 0 0 2px ${T.purple}`;
  }

  function handleInputBlur(e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    e.currentTarget.style.boxShadow = "none";
  }

  function togglePlatform(platform: string) {
    setSelectedPlatforms((prev) =>
      prev.includes(platform) ? prev.filter((p) => p !== platform) : [...prev, platform]
    );
  }

  async function copyToClipboard(text: string, fieldId: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldId);
      setTimeout(() => setCopiedField(null), 2000);
    } catch {
      /* ignore */
    }
  }

  async function handleGenerateAd() {
    if (selectedPlatforms.length === 0) {
      setAdError("Please select at least one platform.");
      return;
    }
    setGeneratingAd(true);
    setAdError("");
    try {
      const res = await fetch("/api/ads/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessId,
          userId,
          platforms: selectedPlatforms,
          objective,
          productOrService: productOrService.trim() || undefined,
          targetAudience: targetAudience.trim() || undefined,
        }),
      });
      if (res.status === 402) {
        const data = await res.json();
        if (data.error === "insufficient_credits") {
          setAdError("insufficient_credits");
          return;
        }
      }
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setAdError(data.error || "Generation failed. Please try again.");
        return;
      }
      const data = await res.json();
      if (data.campaign) {
        setCampaigns((prev) => [data.campaign, ...prev]);
      }
      await refreshCredits();
      // Reset form
      setSelectedPlatforms([]);
      setObjective(OBJECTIVE_OPTIONS[0]);
      setProductOrService("");
      setTargetAudience("");
      setShowCreateForm(false);
    } catch {
      setAdError("Something went wrong. Please try again.");
    } finally {
      setGeneratingAd(false);
    }
  }

  async function handleGenerateUgc() {
    if (!ugcProduct.trim()) {
      setUgcError("Please describe your product or service.");
      return;
    }
    setGeneratingUgc(true);
    setUgcError("");
    try {
      const res = await fetch("/api/ugc/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessId,
          userId,
          productOrService: ugcProduct.trim(),
          videoStyle: ugcStyle,
          platform: ugcPlatform,
          duration: parseInt(ugcDuration, 10),
          tone: ugcTone,
        }),
      });
      if (res.status === 402) {
        const data = await res.json();
        if (data.error === "insufficient_credits") {
          setUgcError("insufficient_credits");
          return;
        }
      }
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setUgcError(data.error || "Generation failed. Please try again.");
        return;
      }
      const data = await res.json();
      if (data.video) {
        setUgcVideos((prev) => [data.video, ...prev]);
      }
      await refreshCredits();
      // Reset form
      setUgcProduct("");
      setUgcStyle(UGC_STYLE_OPTIONS[0]);
      setUgcPlatform(UGC_PLATFORM_OPTIONS[0]);
      setUgcDuration(UGC_DURATION_OPTIONS[0]);
      setUgcTone(UGC_TONE_OPTIONS[0]);
      setShowUgcForm(false);
    } catch {
      setUgcError("Something went wrong. Please try again.");
    } finally {
      setGeneratingUgc(false);
    }
  }

  async function handleRetryUgcVideo(videoId: string) {
    try {
      const res = await fetch("/api/ugc/generate-video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoId, userId, businessId }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.video) {
          setUgcVideos((prev) => prev.map((v) => (v.id === videoId ? data.video : v)));
        }
        await refreshCredits();
      }
    } catch {
      /* ignore */
    }
  }

  function buildSuggestedPrompts(): Array<{ label: string; style: string; product: string }> {
    const prompts: Array<{ label: string; style: string; product: string }> = [];
    const products = (business?.site_content as { products?: Array<{ name: string; desc?: string; price?: string }> })?.products;
    if (products && products.length > 0) {
      const first = products[0];
      prompts.push({
        label: `"${first.name} review"`,
        style: "testimonial",
        product: first.name,
      });
      prompts.push({
        label: `"How ${first.name} works"`,
        style: "demo",
        product: first.name,
      });
      if (products.length > 1) {
        prompts.push({
          label: `"${products[1].name} unboxing"`,
          style: "unboxing",
          product: products[1].name,
        });
      }
    }
    if (business?.tagline) {
      prompts.push({
        label: `"${business.tagline}"`,
        style: "before_after",
        product: business.tagline,
      });
    }
    // Fallback if no products or tagline
    if (prompts.length === 0) {
      prompts.push(
        { label: `"${business?.name || "Your product"} review"`, style: "testimonial", product: business?.name || "" },
        { label: `"How ${business?.name || "it"} works"`, style: "demo", product: business?.name || "" },
        { label: `"Why I switched to ${business?.name || "this"}"`, style: "talking_head", product: business?.name || "" }
      );
    }
    return prompts.slice(0, 4);
  }

  /* ---------------------------------------------------------------- */
  /*  Shared UI helpers                                                */
  /* ---------------------------------------------------------------- */

  function renderInsufficientCredits(error: string) {
    if (error !== "insufficient_credits") return null;
    return (
      <div
        className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs"
        style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.20)" }}
      >
        <svg className="w-4 h-4 shrink-0" style={{ color: T.gold }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
        </svg>
        <span style={{ color: T.gold }}>
          Not enough credits.{" "}
          <button
            onClick={() => router.push("/dashboard/account")}
            className="font-semibold underline transition"
            style={{ color: T.purpleLight }}
          >
            Buy Credits
          </button>
        </span>
      </div>
    );
  }

  function renderPlatformBadge(platform: string) {
    const colors: Record<string, { bg: string; fg: string }> = {
      Meta: { bg: "rgba(59,130,246,0.12)", fg: "#60A5FA" },
      TikTok: { bg: "rgba(236,72,153,0.12)", fg: "#F472B6" },
      Google: { bg: "rgba(34,197,94,0.12)", fg: "#4ADE80" },
    };
    const c = colors[platform] || { bg: "rgba(123,57,252,0.10)", fg: T.purpleLight };
    return (
      <span
        key={platform}
        className="text-[10px] font-medium px-2 py-0.5 rounded-full"
        style={{ background: c.bg, color: c.fg }}
      >
        {platform}
      </span>
    );
  }

  function renderCopyButton(text: string, id: string) {
    const isCopied = copiedField === id;
    return (
      <button
        onClick={() => copyToClipboard(text, id)}
        className="p-1 rounded transition shrink-0"
        style={{ color: isCopied ? T.green : T.text3 }}
        title="Copy"
      >
        {isCopied ? (
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        ) : (
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9.75a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
          </svg>
        )}
      </button>
    );
  }

  function renderSpinner() {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="w-6 h-6 rounded-full animate-spin" style={{ border: `2px solid ${T.purple}`, borderTopColor: "transparent" }} />
      </div>
    );
  }

  /* ---------------------------------------------------------------- */
  /*  Loading gate                                                     */
  /* ---------------------------------------------------------------- */

  if (!business) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <div className="w-8 h-8 rounded-full animate-spin" style={{ border: `2px solid ${T.purple}`, borderTopColor: "transparent" }} />
      </div>
    );
  }

  /* ---------------------------------------------------------------- */
  /*  Render                                                           */
  /* ---------------------------------------------------------------- */

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl font-bold mb-1" style={{ color: T.text, fontFamily: T.h }}>Ad Creator</h1>
        <p className="text-sm" style={{ color: T.text3 }}>
          AI-generated ad copy for Meta, TikTok, and Google
        </p>
      </div>

      <PaywallGate
        requiredPlan="growth"
        teaser={{
          headline: "AI Ad Campaigns & UGC Videos",
          description: "Create scroll-stopping ads and UGC-style videos that convert across every platform.",
          bullets: [
            "AI-generated ad copy for any platform",
            "UGC-style videos in minutes",
            "Optimized for Meta, TikTok & Google",
          ],
        }}
      >
        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {(["ads", "ugc"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
              style={
                activeTab === tab
                  ? {
                      background: "rgba(123,57,252,0.10)",
                      color: T.purpleLight,
                      border: "1px solid rgba(123,57,252,0.20)",
                    }
                  : {
                      color: T.text3,
                      border: `1px solid ${T.border}`,
                    }
              }
            >
              {tab === "ads" ? "Ad Campaigns" : "UGC Videos"}
            </button>
          ))}
          <div className="flex-1" />
          <span className="text-xs font-medium self-center" style={{ color: T.text3 }}>
            {credits} credit{credits !== 1 ? "s" : ""}
          </span>
        </div>

        {/* ============================================================ */}
        {/*  AD CAMPAIGNS TAB                                             */}
        {/* ============================================================ */}
        {activeTab === "ads" && (
          <>
            {/* Create Campaign button */}
            <div className="flex justify-end mb-4">
              <button
                onClick={() => setShowCreateForm((v) => !v)}
                className="px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2"
                style={{
                  background: showCreateForm ? "rgba(123,57,252,0.15)" : CTA_GRAD,
                  color: "#fff",
                  border: showCreateForm ? "1px solid rgba(123,57,252,0.30)" : "none",
                }}
              >
                {showCreateForm ? (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Cancel
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                    Create Campaign
                  </>
                )}
              </button>
            </div>

            {/* Create Campaign Form */}
            {showCreateForm && (
              <div className="mb-6 rounded-xl overflow-hidden" style={{ ...glassCard }}>
                <div className="px-5 py-4" style={{ borderBottom: `1px solid ${T.border}` }}>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{ background: "rgba(123,57,252,0.10)" }}
                    >
                      <svg className="w-4 h-4" style={{ color: T.purpleLight }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 110-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463 1.511l-.657.38c-.551.318-1.26.117-1.527-.461a20.845 20.845 0 01-1.44-4.282m3.102.069a18.03 18.03 0 01-.59-4.59c0-1.586.205-3.124.59-4.59m0 9.18a23.848 23.848 0 018.835 2.535M10.34 6.66a23.847 23.847 0 008.835-2.535m0 0A23.74 23.74 0 0018.795 3m.38 1.125a23.91 23.91 0 011.014 5.395m-1.014 8.855c-.118.38-.245.754-.38 1.125m.38-1.125a23.91 23.91 0 001.014-5.395m0-3.46c.495.413.811 1.035.811 1.73 0 .695-.316 1.317-.811 1.73m0-3.46a24.347 24.347 0 010 3.46" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold" style={{ color: T.text }}>Create Ad Campaign</h3>
                      <p className="text-xs" style={{ color: T.text3 }}>Generate ad copy for multiple platforms at once</p>
                    </div>
                  </div>
                </div>

                <div className="p-5 space-y-4">
                  {/* Platform Selection */}
                  <div>
                    <label className="block text-xs font-medium mb-2" style={{ color: T.text2 }}>Platforms *</label>
                    <div className="flex gap-2 flex-wrap">
                      {PLATFORM_OPTIONS.map((p) => {
                        const selected = selectedPlatforms.includes(p);
                        return (
                          <button
                            key={p}
                            onClick={() => togglePlatform(p)}
                            className="px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2"
                            style={
                              selected
                                ? {
                                    background: "rgba(123,57,252,0.15)",
                                    color: T.purpleLight,
                                    border: "1px solid rgba(123,57,252,0.30)",
                                  }
                                : {
                                    background: T.bgEl,
                                    color: T.text3,
                                    border: `1px solid ${T.border}`,
                                  }
                            }
                          >
                            {selected && (
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                              </svg>
                            )}
                            {p}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Objective */}
                  <div>
                    <label className="block text-xs font-medium mb-1.5" style={{ color: T.text2 }}>Objective</label>
                    <select
                      value={objective}
                      onChange={(e) => setObjective(e.target.value)}
                      onFocus={handleInputFocus}
                      onBlur={handleInputBlur}
                      style={{ ...inputStyle, appearance: "none", cursor: "pointer" }}
                    >
                      {OBJECTIVE_OPTIONS.map((o) => (
                        <option key={o} value={o}>{o}</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Product/Service */}
                    <div>
                      <label className="block text-xs font-medium mb-1.5" style={{ color: T.text2 }}>Product / Service</label>
                      <input
                        type="text"
                        value={productOrService}
                        onChange={(e) => setProductOrService(e.target.value)}
                        onFocus={handleInputFocus}
                        onBlur={handleInputBlur}
                        placeholder="e.g. Online coaching program"
                        style={inputStyle}
                      />
                    </div>

                    {/* Target Audience */}
                    <div>
                      <label className="block text-xs font-medium mb-1.5" style={{ color: T.text2 }}>Target Audience</label>
                      <input
                        type="text"
                        value={targetAudience}
                        onChange={(e) => setTargetAudience(e.target.value)}
                        onFocus={handleInputFocus}
                        onBlur={handleInputBlur}
                        placeholder="e.g. Small business owners, 25-45"
                        style={inputStyle}
                      />
                    </div>
                  </div>

                  {/* Error */}
                  {adError && adError !== "insufficient_credits" && (
                    <p className="text-xs" style={{ color: "#EF4444" }}>{adError}</p>
                  )}
                  {renderInsufficientCredits(adError)}

                  {/* Generate button */}
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-xs" style={{ color: T.text3 }}>Cost: 3 credits</span>
                    <button
                      onClick={handleGenerateAd}
                      disabled={generatingAd || selectedPlatforms.length === 0}
                      className="px-5 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 transition"
                      style={{
                        background: generatingAd || selectedPlatforms.length === 0 ? "rgba(123,57,252,0.30)" : CTA_GRAD,
                        color: "#fff",
                        cursor: generatingAd || selectedPlatforms.length === 0 ? "not-allowed" : "pointer",
                      }}
                    >
                      {generatingAd ? (
                        <>
                          <div className="w-4 h-4 rounded-full animate-spin" style={{ border: "2px solid rgba(255,255,255,0.30)", borderTopColor: "#fff" }} />
                          Generating...
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                          </svg>
                          Generate Ad Copy (3 credits)
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Campaigns list */}
            {loadingCampaigns ? (
              renderSpinner()
            ) : campaigns.length === 0 ? (
              <div className="rounded-xl p-8 text-center" style={{ ...glassCard }}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4" style={{ background: "rgba(123,57,252,0.10)" }}>
                  <svg className="w-6 h-6" style={{ color: T.purpleLight }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 110-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463 1.511l-.657.38c-.551.318-1.26.117-1.527-.461a20.845 20.845 0 01-1.44-4.282m3.102.069a18.03 18.03 0 01-.59-4.59c0-1.586.205-3.124.59-4.59m0 9.18a23.848 23.848 0 018.835 2.535M10.34 6.66a23.847 23.847 0 008.835-2.535m0 0A23.74 23.74 0 0018.795 3m.38 1.125a23.91 23.91 0 011.014 5.395m-1.014 8.855c-.118.38-.245.754-.38 1.125m.38-1.125a23.91 23.91 0 001.014-5.395m0-3.46c.495.413.811 1.035.811 1.73 0 .695-.316 1.317-.811 1.73m0-3.46a24.347 24.347 0 010 3.46" />
                  </svg>
                </div>
                <h2 className="text-lg font-semibold mb-2" style={{ color: T.text, fontFamily: T.h }}>No ad campaigns yet</h2>
                <p className="text-sm max-w-md mx-auto leading-relaxed mb-4" style={{ color: T.text3 }}>
                  Create your first campaign to generate ad copy for Meta, TikTok, and Google tailored to{" "}
                  <strong style={{ color: T.text2 }}>{business.name}</strong>.
                </p>
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="px-4 py-2 rounded-lg text-sm font-semibold"
                  style={{ background: CTA_GRAD, color: "#fff" }}
                >
                  Create Campaign
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {campaigns.map((campaign) => {
                  const isExpanded = expandedCampaign === campaign.id;
                  const variations = Array.isArray(campaign.variations) ? campaign.variations : [];
                  const grouped = PLATFORM_OPTIONS.reduce<Record<string, AdVariation[]>>((acc, p) => {
                    const matches = variations.filter((v) => v.platform === p);
                    if (matches.length) acc[p] = matches;
                    return acc;
                  }, {});

                  return (
                    <div key={campaign.id} className="rounded-xl overflow-hidden" style={{ ...glassCard }}>
                      {/* Campaign header */}
                      <button
                        onClick={() => setExpandedCampaign(isExpanded ? null : campaign.id)}
                        className="w-full px-4 py-4 flex items-start gap-4 text-left transition"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                            <h3 className="text-sm font-semibold" style={{ color: T.text }}>{campaign.name}</h3>
                            {(campaign.platforms || []).map((p) => renderPlatformBadge(p))}
                          </div>
                          <div className="flex items-center gap-3 text-[10px]" style={{ color: T.text3 }}>
                            <span>{campaign.objective}</span>
                            <span
                              className="px-1.5 py-0.5 rounded-full font-medium"
                              style={{
                                background: campaign.status === "active" ? "rgba(34,197,94,0.15)" : "rgba(245,158,11,0.15)",
                                color: campaign.status === "active" ? T.green : T.gold,
                              }}
                            >
                              {campaign.status}
                            </span>
                            <span>{new Date(campaign.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <svg
                          className="w-4 h-4 shrink-0 mt-1 transition-transform"
                          style={{ color: T.text3, transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)" }}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          strokeWidth={2}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                        </svg>
                      </button>

                      {/* Expanded: variations by platform */}
                      {isExpanded && (
                        <div className="px-4 pb-4 space-y-4" style={{ borderTop: `1px solid ${T.border}` }}>
                          {Object.entries(grouped).map(([platform, vars]) => (
                            <div key={platform} className="pt-4">
                              <div className="flex items-center gap-2 mb-3">
                                {renderPlatformBadge(platform)}
                                <span className="text-xs" style={{ color: T.text3 }}>
                                  {vars.length} variation{vars.length !== 1 ? "s" : ""}
                                </span>
                              </div>
                              <div className="space-y-3">
                                {vars.map((v, vi) => (
                                  <div
                                    key={vi}
                                    className="rounded-lg p-3 space-y-2"
                                    style={{ background: "rgba(0,0,0,0.20)", border: `1px solid ${T.border}`, borderRadius: 12 }}
                                  >
                                    {/* Headline */}
                                    <div className="flex items-start gap-2">
                                      <div className="flex-1 min-w-0">
                                        <span className="text-[10px] font-medium uppercase tracking-wide" style={{ color: T.text3 }}>Headline</span>
                                        <p className="text-sm font-medium" style={{ color: T.text }}>{v.headline}</p>
                                      </div>
                                      {renderCopyButton(v.headline, `${campaign.id}-${vi}-headline`)}
                                    </div>
                                    {/* Primary Text */}
                                    <div className="flex items-start gap-2">
                                      <div className="flex-1 min-w-0">
                                        <span className="text-[10px] font-medium uppercase tracking-wide" style={{ color: T.text3 }}>Primary Text</span>
                                        <p className="text-xs leading-relaxed" style={{ color: T.text2 }}>{v.primary_text}</p>
                                      </div>
                                      {renderCopyButton(v.primary_text, `${campaign.id}-${vi}-primary`)}
                                    </div>
                                    {/* Description */}
                                    {v.description && (
                                      <div className="flex items-start gap-2">
                                        <div className="flex-1 min-w-0">
                                          <span className="text-[10px] font-medium uppercase tracking-wide" style={{ color: T.text3 }}>Description</span>
                                          <p className="text-xs" style={{ color: T.text2 }}>{v.description}</p>
                                        </div>
                                        {renderCopyButton(v.description, `${campaign.id}-${vi}-desc`)}
                                      </div>
                                    )}
                                    {/* CTA */}
                                    <div className="flex items-start gap-2">
                                      <div className="flex-1 min-w-0">
                                        <span className="text-[10px] font-medium uppercase tracking-wide" style={{ color: T.text3 }}>CTA</span>
                                        <p className="text-xs font-medium" style={{ color: T.purpleLight }}>{v.cta}</p>
                                      </div>
                                      {renderCopyButton(v.cta, `${campaign.id}-${vi}-cta`)}
                                    </div>
                                    {/* Hashtags */}
                                    {v.hashtags && v.hashtags.length > 0 && (
                                      <div className="flex items-start gap-2">
                                        <div className="flex-1 min-w-0">
                                          <span className="text-[10px] font-medium uppercase tracking-wide" style={{ color: T.text3 }}>Hashtags</span>
                                          <p className="text-xs" style={{ color: T.text3 }}>{v.hashtags.join(" ")}</p>
                                        </div>
                                        {renderCopyButton(v.hashtags.join(" "), `${campaign.id}-${vi}-hashtags`)}
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}

                          {variations.length === 0 && (
                            <p className="text-xs text-center py-4" style={{ color: T.text3 }}>No variations generated.</p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* ============================================================ */}
        {/*  UGC VIDEOS TAB                                               */}
        {/* ============================================================ */}
        {activeTab === "ugc" && (
          <>
            {/* Create UGC button */}
            <div className="flex justify-end mb-4">
              <button
                onClick={() => setShowUgcForm((v) => !v)}
                className="px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2"
                style={{
                  background: showUgcForm ? "rgba(123,57,252,0.15)" : CTA_GRAD,
                  color: "#fff",
                  border: showUgcForm ? "1px solid rgba(123,57,252,0.30)" : "none",
                }}
              >
                {showUgcForm ? (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Cancel
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
                    </svg>
                    Create UGC Video
                  </>
                )}
              </button>
            </div>

            {/* UGC Form */}
            {showUgcForm && (
              <div className="mb-6 rounded-xl overflow-hidden" style={{ ...glassCard }}>
                <div className="px-5 py-4" style={{ borderBottom: `1px solid ${T.border}` }}>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{ background: "rgba(123,57,252,0.10)" }}
                    >
                      <svg className="w-4 h-4" style={{ color: T.purpleLight }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold" style={{ color: T.text }}>UGC Video Script Generator</h3>
                      <p className="text-xs" style={{ color: T.text3 }}>Generate scene-by-scene UGC scripts for social platforms</p>
                    </div>
                  </div>
                </div>

                <div className="p-5 space-y-4">
                  {/* Product/Service */}
                  <div>
                    <label className="block text-xs font-medium mb-1.5" style={{ color: T.text2 }}>Product / Service *</label>
                    <input
                      type="text"
                      value={ugcProduct}
                      onChange={(e) => setUgcProduct(e.target.value)}
                      onFocus={handleInputFocus}
                      onBlur={handleInputBlur}
                      placeholder="e.g. Wireless earbuds with noise cancellation"
                      style={inputStyle}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Video Style */}
                    <div>
                      <label className="block text-xs font-medium mb-1.5" style={{ color: T.text2 }}>Video Style</label>
                      <select
                        value={ugcStyle}
                        onChange={(e) => setUgcStyle(e.target.value)}
                        onFocus={handleInputFocus}
                        onBlur={handleInputBlur}
                        style={{ ...inputStyle, appearance: "none", cursor: "pointer" }}
                      >
                        {UGC_STYLE_OPTIONS.map((s) => (
                          <option key={s} value={s}>
                            {s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Platform */}
                    <div>
                      <label className="block text-xs font-medium mb-1.5" style={{ color: T.text2 }}>Platform</label>
                      <select
                        value={ugcPlatform}
                        onChange={(e) => setUgcPlatform(e.target.value)}
                        onFocus={handleInputFocus}
                        onBlur={handleInputBlur}
                        style={{ ...inputStyle, appearance: "none", cursor: "pointer" }}
                      >
                        {UGC_PLATFORM_OPTIONS.map((p) => (
                          <option key={p} value={p}>
                            {p.charAt(0).toUpperCase() + p.slice(1)}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Duration */}
                    <div>
                      <label className="block text-xs font-medium mb-1.5" style={{ color: T.text2 }}>Duration</label>
                      <select
                        value={ugcDuration}
                        onChange={(e) => setUgcDuration(e.target.value)}
                        onFocus={handleInputFocus}
                        onBlur={handleInputBlur}
                        style={{ ...inputStyle, appearance: "none", cursor: "pointer" }}
                      >
                        {UGC_DURATION_OPTIONS.map((d) => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Error */}
                  {ugcError && ugcError !== "insufficient_credits" && (
                    <p className="text-xs" style={{ color: "#EF4444" }}>{ugcError}</p>
                  )}
                  {renderInsufficientCredits(ugcError)}

                  {/* Generate button */}
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-xs" style={{ color: T.text3 }}>Cost: 3 credits</span>
                    <button
                      onClick={handleGenerateUgc}
                      disabled={generatingUgc || !ugcProduct.trim()}
                      className="px-5 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 transition"
                      style={{
                        background: generatingUgc || !ugcProduct.trim() ? "rgba(123,57,252,0.30)" : CTA_GRAD,
                        color: "#fff",
                        cursor: generatingUgc || !ugcProduct.trim() ? "not-allowed" : "pointer",
                      }}
                    >
                      {generatingUgc ? (
                        <>
                          <div className="w-4 h-4 rounded-full animate-spin" style={{ border: "2px solid rgba(255,255,255,0.30)", borderTopColor: "#fff" }} />
                          Generating...
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                          </svg>
                          Generate Script (3 credits)
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* UGC Videos list */}
            {loadingUgc ? (
              renderSpinner()
            ) : ugcVideos.length === 0 ? (
              <div className="rounded-xl p-8 text-center" style={{ ...glassCard }}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4" style={{ background: "rgba(123,57,252,0.10)" }}>
                  <svg className="w-6 h-6" style={{ color: T.purpleLight }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
                  </svg>
                </div>
                <h2 className="text-lg font-semibold mb-2" style={{ color: T.text, fontFamily: T.h }}>No UGC videos yet</h2>
                <p className="text-sm max-w-md mx-auto leading-relaxed mb-4" style={{ color: T.text3 }}>
                  Generate scene-by-scene UGC video scripts for TikTok, Instagram, and YouTube tailored to{" "}
                  <strong style={{ color: T.text2 }}>{business.name}</strong>.
                </p>
                <button
                  onClick={() => setShowUgcForm(true)}
                  className="px-4 py-2 rounded-lg text-sm font-semibold"
                  style={{ background: CTA_GRAD, color: "#fff" }}
                >
                  Create UGC Video
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {ugcVideos.map((video) => {
                  const isExpanded = expandedUgc === video.id;
                  const scenes = Array.isArray(video.script?.script) ? video.script.script : [];

                  return (
                    <div key={video.id} className="rounded-xl overflow-hidden" style={{ ...glassCard }}>
                      {/* Video header */}
                      <button
                        onClick={() => setExpandedUgc(isExpanded ? null : video.id)}
                        className="w-full px-4 py-4 flex items-start gap-4 text-left transition"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                            <h3 className="text-sm font-semibold" style={{ color: T.text }}>{video.product_or_service}</h3>
                            <span
                              className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                              style={{ background: "rgba(236,72,153,0.12)", color: "#F472B6" }}
                            >
                              {video.video_style.replace(/_/g, " ")}
                            </span>
                            <span
                              className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                              style={{ background: "rgba(59,130,246,0.12)", color: "#60A5FA" }}
                            >
                              {video.platform}
                            </span>
                            <span
                              className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                              style={{ background: "rgba(245,158,11,0.12)", color: T.gold }}
                            >
                              {video.duration_seconds}s
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-[10px]" style={{ color: T.text3 }}>
                            {/* Status badge */}
                            <span
                              className="font-semibold px-2 py-0.5 rounded-full"
                              style={
                                video.status === "ready"
                                  ? { background: "rgba(34,197,94,0.12)", color: T.green }
                                  : video.status === "generating"
                                    ? { background: "rgba(123,57,252,0.12)", color: T.purpleLight }
                                    : video.status === "failed"
                                      ? { background: "rgba(239,68,68,0.12)", color: "#EF4444" }
                                      : { background: "rgba(245,158,11,0.12)", color: T.gold }
                              }
                            >
                              {video.status === "ready" ? "Ready" : video.status === "generating" ? "Generating..." : video.status === "failed" ? "Failed" : "Script Only"}
                            </span>
                            <span>{scenes.length} scene{scenes.length !== 1 ? "s" : ""}</span>
                            <span>{new Date(video.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <svg
                          className="w-4 h-4 shrink-0 mt-1 transition-transform"
                          style={{ color: T.text3, transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)" }}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          strokeWidth={2}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                        </svg>
                      </button>

                      {/* Expanded content */}
                      {isExpanded && (
                        <div className="px-4 pb-4" style={{ borderTop: `1px solid ${T.border}` }}>
                          {/* Video player */}
                          {video.video_url && (
                            <div className="mt-4 mb-3 rounded-lg overflow-hidden" style={{ background: "#000" }}>
                              <video
                                src={video.video_url}
                                controls
                                className="w-full"
                                style={{ maxHeight: 400 }}
                                preload="metadata"
                              />
                            </div>
                          )}

                          {/* Generating indicator */}
                          {video.status === "generating" && (
                            <div className="flex items-center gap-3 mt-4 mb-3 px-4 py-3 rounded-lg" style={{ background: "rgba(123,57,252,0.06)", border: "1px solid rgba(123,57,252,0.15)" }}>
                              <div className="w-5 h-5 rounded-full animate-spin" style={{ border: `2px solid ${T.purple}`, borderTopColor: "transparent" }} />
                              <span className="text-xs" style={{ color: T.purpleLight }}>Video is generating... This can take a few minutes.</span>
                            </div>
                          )}

                          {/* Voiceover audio */}
                          {video.voiceover_url && (
                            <div className="mt-3 mb-3">
                              <span className="text-[10px] font-medium uppercase tracking-wide block mb-1.5" style={{ color: T.text3 }}>Voiceover</span>
                              <audio src={video.voiceover_url} controls className="w-full" style={{ height: 36 }} preload="metadata" />
                            </div>
                          )}

                          {/* Action buttons */}
                          <div className="flex items-center gap-2 mt-3 mb-4 flex-wrap">
                            {video.video_url && (
                              <a
                                href={video.video_url}
                                download
                                className="px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5"
                                style={{ background: "rgba(34,197,94,0.10)", color: T.green, border: "1px solid rgba(34,197,94,0.20)" }}
                              >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                                </svg>
                                Download Video
                              </a>
                            )}
                            {(video.status === "failed" || video.status === "script_only") && (
                              <button
                                onClick={() => handleRetryUgcVideo(video.id)}
                                className="px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5"
                                style={{ background: "rgba(123,57,252,0.10)", color: T.purpleLight, border: "1px solid rgba(123,57,252,0.20)" }}
                              >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
                                </svg>
                                {video.status === "script_only" ? "Generate Video (12 credits)" : "Retry Video (12 credits)"}
                              </button>
                            )}
                          </div>

                          {/* Hook & CTA */}
                          {video.script?.hook && (
                            <div className="mb-3 flex items-start gap-2">
                              <div className="flex-1">
                                <span className="text-[10px] font-medium uppercase tracking-wide" style={{ color: T.text3 }}>Hook</span>
                                <p className="text-xs font-medium" style={{ color: T.text }}>&#8220;{video.script.hook}&#8221;</p>
                              </div>
                              {renderCopyButton(video.script.hook, `${video.id}-hook`)}
                            </div>
                          )}
                          {video.script?.cta && (
                            <div className="mb-4 flex items-start gap-2">
                              <div className="flex-1">
                                <span className="text-[10px] font-medium uppercase tracking-wide" style={{ color: T.text3 }}>CTA</span>
                                <p className="text-xs font-medium" style={{ color: T.purpleLight }}>{video.script.cta}</p>
                              </div>
                              {renderCopyButton(video.script.cta, `${video.id}-cta`)}
                            </div>
                          )}

                          {/* Scene breakdown */}
                          {scenes.length === 0 ? (
                            <p className="text-xs text-center py-4" style={{ color: T.text3 }}>No scenes generated.</p>
                          ) : (
                            <div className="space-y-3 pt-4">
                              {scenes.map((scene, si) => (
                                <div
                                  key={si}
                                  className="rounded-lg p-3 space-y-2"
                                  style={{ background: "rgba(0,0,0,0.20)", border: `1px solid ${T.border}`, borderRadius: 12 }}
                                >
                                  {/* Timestamp */}
                                  <div className="flex items-center gap-2 mb-1">
                                    <span
                                      className="text-[10px] font-semibold px-2 py-0.5 rounded"
                                      style={{ background: "rgba(123,57,252,0.15)", color: T.purpleLight }}
                                    >
                                      {scene.timestamp}
                                    </span>
                                    <span className="text-[10px] font-medium" style={{ color: T.text3 }}>Scene {si + 1}</span>
                                  </div>

                                  {/* Visual */}
                                  <div className="flex items-start gap-2">
                                    <div className="flex-1 min-w-0">
                                      <span className="text-[10px] font-medium uppercase tracking-wide" style={{ color: T.text3 }}>Visual</span>
                                      <p className="text-xs" style={{ color: T.text2 }}>{scene.visual}</p>
                                    </div>
                                    {renderCopyButton(scene.visual, `${video.id}-${si}-visual`)}
                                  </div>

                                  {/* Dialogue */}
                                  {scene.dialogue && (
                                    <div className="flex items-start gap-2">
                                      <div className="flex-1 min-w-0">
                                        <span className="text-[10px] font-medium uppercase tracking-wide" style={{ color: T.text3 }}>Dialogue</span>
                                        <p className="text-xs italic" style={{ color: T.text }}>&#8220;{scene.dialogue}&#8221;</p>
                                      </div>
                                      {renderCopyButton(scene.dialogue, `${video.id}-${si}-dialogue`)}
                                    </div>
                                  )}

                                  {/* Direction */}
                                  {scene.direction && (
                                    <div className="flex items-start gap-2">
                                      <div className="flex-1 min-w-0">
                                        <span className="text-[10px] font-medium uppercase tracking-wide" style={{ color: T.text3 }}>Direction</span>
                                        <p className="text-xs" style={{ color: T.text3 }}>{scene.direction}</p>
                                      </div>
                                      {renderCopyButton(scene.direction, `${video.id}-${si}-direction`)}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </PaywallGate>
    </div>
  );
}
