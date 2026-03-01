"use client";

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";
import { supabase } from "@/lib/supabase";

export interface Business {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  type: string;
  subtype: string;
  status: string;
  revenue_estimate: string;
  audience: string;
  live_url: string;
  deployed_url: string;
  custom_domain: string;
  created_at: string;
  brand: Record<string, unknown>;
  site_content: Record<string, unknown>;
  business_plan: Record<string, unknown>;
  onboarding_step: number;
  onboarding_completed: boolean;
  stripe_account_id: string | null;
  calendly_url: string | null;
  business_email: string | null;
  checklist_initialized: boolean;
  coach_name: string | null;
  layout: string;
}

interface BusinessContextValue {
  business: Business | null;
  allBusinesses: Business[];
  plan: string;
  credits: number;
  userId: string | null;
  loading: boolean;
  refreshBusiness: () => Promise<void>;
  refreshCredits: () => Promise<void>;
}

const BusinessContext = createContext<BusinessContextValue>({
  business: null,
  allBusinesses: [],
  plan: "free",
  credits: 0,
  userId: null,
  loading: true,
  refreshBusiness: async () => {},
  refreshCredits: async () => {},
});

export function useBusinessContext() {
  return useContext(BusinessContext);
}

export function BusinessProvider({
  businessId,
  children,
}: {
  businessId: string;
  children: ReactNode;
}) {
  const [business, setBusiness] = useState<Business | null>(null);
  const [allBusinesses, setAllBusinesses] = useState<Business[]>([]);
  const [plan, setPlan] = useState("free");
  const [credits, setCredits] = useState(0);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchCredits = useCallback(async (uid: string, bizId: string) => {
    try {
      const res = await fetch(`/api/credits?userId=${uid}&businessId=${bizId}`);
      if (res.ok) {
        const data = await res.json();
        setCredits(data.balance || 0);
      }
    } catch {
      // Credits fetch is non-critical
    }
  }, []);

  async function load() {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      window.location.href = "/auth/login";
      return;
    }

    setUserId(user.id);

    // Fetch plan from profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("plan")
      .eq("id", user.id)
      .single();
    setPlan(profile?.plan || "free");

    // Fetch current business
    const { data: biz } = await supabase
      .from("businesses")
      .select("*")
      .eq("id", businessId)
      .eq("user_id", user.id)
      .single();

    if (!biz) {
      window.location.href = "/dashboard";
      return;
    }
    setBusiness(biz as Business);

    // Fetch all businesses for switcher
    const { data: allBiz } = await supabase
      .from("businesses")
      .select("id, name, slug, tagline, type, subtype, status, deployed_url, brand")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    setAllBusinesses((allBiz as Business[]) || []);

    // Fetch credit balance
    await fetchCredits(user.id, businessId);

    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [businessId]);

  async function refreshBusiness() {
    setLoading(true);
    await load();
  }

  async function refreshCredits() {
    if (userId) {
      await fetchCredits(userId, businessId);
    }
  }

  return (
    <BusinessContext.Provider value={{ business, allBusinesses, plan, credits, userId, loading, refreshBusiness, refreshCredits }}>
      {children}
    </BusinessContext.Provider>
  );
}
