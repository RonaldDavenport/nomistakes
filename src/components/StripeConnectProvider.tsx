"use client";

import { useState, useEffect } from "react";
import { ConnectComponentsProvider } from "@stripe/react-connect-js";
import { loadConnectAndInitialize } from "@stripe/connect-js";

type StripeConnectInstance = Awaited<ReturnType<typeof loadConnectAndInitialize>>;

export default function StripeConnectProvider({
  businessId,
  children,
}: {
  businessId: string;
  children: React.ReactNode;
}) {
  const [instance, setInstance] = useState<StripeConnectInstance | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const pk = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    if (!pk) {
      setError("Stripe publishable key not configured");
      return;
    }

    const connectInstance = loadConnectAndInitialize({
      publishableKey: pk,
      fetchClientSecret: async () => {
        const res = await fetch("/api/stripe/account-session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ businessId }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to create session");
        return data.clientSecret;
      },
      appearance: {
        overlays: "dialog",
        variables: {
          colorBackground: "#111118",
          colorText: "#e4e4e7",
          colorPrimary: "#4c6ef5",
          borderRadius: "12px",
          colorSecondaryText: "#a1a1aa",
          colorBorder: "#27272a",
        },
      },
    });

    setInstance(connectInstance);
  }, [businessId]);

  if (error) {
    return (
      <div style={{ padding: 24, textAlign: "center", color: "#ef4444" }}>
        <p>{error}</p>
      </div>
    );
  }

  if (!instance) {
    return (
      <div style={{ padding: 40, textAlign: "center" }}>
        <div style={{
          width: 24, height: 24, border: "2px solid #4c6ef5",
          borderTopColor: "transparent", borderRadius: "50%",
          animation: "spin 0.6s linear infinite",
          margin: "0 auto",
        }} />
        <p style={{ color: "#71717a", fontSize: 13, marginTop: 12 }}>Loading Stripe...</p>
      </div>
    );
  }

  return (
    <ConnectComponentsProvider connectInstance={instance}>
      {children}
    </ConnectComponentsProvider>
  );
}
