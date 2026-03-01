"use client";

import { useEffect } from "react";
import { registerProvider, createConsoleProvider, createMixpanelProvider, createGA4Provider } from "@/lib/analytics";

let initialized = false;

export function AnalyticsInit() {
  useEffect(() => {
    if (initialized) return;
    initialized = true;

    // Always register console provider in dev
    if (process.env.NODE_ENV === "development") {
      registerProvider(createConsoleProvider());
    }

    // Register Mixpanel if loaded
    const mp = createMixpanelProvider();
    if (mp) registerProvider(mp);

    // Register GA4 if loaded
    const ga = createGA4Provider();
    if (ga) registerProvider(ga);
  }, []);

  return null;
}
