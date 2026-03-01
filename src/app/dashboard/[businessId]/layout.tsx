"use client";

import Link from "next/link";
import { usePathname, useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { BusinessProvider, useBusinessContext } from "@/components/dashboard/BusinessProvider";
import { BusinessSwitcher } from "@/components/dashboard/BusinessSwitcher";
import { getPlan } from "@/lib/plans";
import { supabase } from "@/lib/supabase";
import { T, CTA_GRAD } from "@/lib/design-tokens";

function SidebarNav({ businessId }: { businessId: string }) {
  const pathname = usePathname();
  const { plan: planId, loading } = useBusinessContext();
  const plan = getPlan(planId);

  const NAV_ITEMS = [
    { href: `/dashboard/${businessId}`, label: "Overview", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0h4" },
    { href: `/dashboard/${businessId}/chat`, label: "AI Coach", icon: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" },
    { href: `/dashboard/${businessId}/editor`, label: "Site Editor", icon: "M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" },
    { href: `/dashboard/${businessId}/content`, label: "Content", icon: "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" },
    { href: `/dashboard/${businessId}/ads`, label: "Ads", icon: "M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" },
    { href: `/dashboard/${businessId}/analytics`, label: "Analytics", icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" },
    { href: `/dashboard/${businessId}/tools`, label: "Tools", icon: "M11.42 15.17l-5.658-5.658a1 1 0 010-1.414l.354-.354a1 1 0 011.414 0l4.95 4.95 4.95-4.95a1 1 0 011.414 0l.354.354a1 1 0 010 1.414l-5.658 5.658a2 2 0 01-2.828 0z" },
    { href: `/dashboard/${businessId}/settings`, label: "Settings", icon: "M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" },
  ];

  if (loading) return null;

  return (
    <>
      <div className="p-4" style={{ borderBottom: `1px solid ${T.border}` }}>
        <BusinessSwitcher />
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all"
              style={
                active
                  ? {
                      background: "rgba(123,57,252,0.1)",
                      color: T.purpleLight,
                      borderLeft: `3px solid ${T.purple}`,
                    }
                  : {
                      color: T.text3,
                    }
              }
              onMouseEnter={(e) => {
                if (!active) {
                  (e.currentTarget as HTMLElement).style.color = T.text2;
                  (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.03)";
                }
              }}
              onMouseLeave={(e) => {
                if (!active) {
                  (e.currentTarget as HTMLElement).style.color = T.text3;
                  (e.currentTarget as HTMLElement).style.background = "transparent";
                }
              }}
            >
              <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
              </svg>
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-4" style={{ borderTop: `1px solid ${T.border}` }}>
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
              style={{ background: CTA_GRAD }}
            >
              R
            </div>
            <div>
              <p className="text-sm font-medium" style={{ color: T.text }}>{plan.name} Plan</p>
              <p className="text-xs" style={{ color: T.text3 }}>
                {plan.price === 0 ? "Free" : `$${(plan.price / 100).toFixed(2)}/mo`}
              </p>
              <Link
                href="/dashboard/account"
                className="text-xs transition"
                style={{ color: T.text3 }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = T.text2; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = T.text3; }}
              >
                Account Settings
              </Link>
            </div>
          </div>
          {plan.id === "free" && (
            <button
              onClick={async () => {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) return;
                const res = await fetch("/api/stripe/checkout", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ planId: "starter", userId: user.id, email: user.email }),
                });
                const { url } = await res.json();
                if (url) window.location.href = url;
              }}
              className="text-xs font-medium transition-colors"
              style={{ color: T.purpleLight }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = T.purple; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = T.purpleLight; }}
            >
              Upgrade
            </button>
          )}
        </div>
      </div>
    </>
  );
}

export default function BusinessLayout({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const pathname = usePathname();
  const businessId = params.businessId as string;
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  return (
    <BusinessProvider businessId={businessId}>
      {/* Hide parent dashboard header — business layout has its own sidebar with logo */}
      <style>{`[data-dashboard-header] { display: none !important; }`}</style>
      <div className="flex min-h-screen">
        {/* Mobile overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 lg:hidden"
            style={{ background: "rgba(0,0,0,0.6)" }}
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={`
            fixed inset-y-0 left-0 z-50 w-64 flex flex-col shrink-0
            transform transition-transform duration-200 ease-out
            lg:relative lg:translate-x-0
            ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          `}
          style={{
            background: T.bgEl,
            borderRight: `1px solid ${T.border}`,
            backdropFilter: "blur(20px)",
          }}
        >
          <div
            className="p-6 flex items-center justify-between"
            style={{ borderBottom: `1px solid ${T.border}` }}
          >
            <Link href="/dashboard" className="text-xl font-bold tracking-tight">
              <span style={{ color: T.text }}>No</span>
              <span style={{ color: T.purple }}>Mistakes</span>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden w-8 h-8 flex items-center justify-center rounded-lg"
              style={{ color: T.text3 }}
              aria-label="Close sidebar"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <SidebarNav businessId={businessId} />
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto min-w-0" style={{ background: T.bg }}>
          {/* Mobile top bar */}
          <div
            className="sticky top-0 z-30 lg:hidden px-4 h-14 flex items-center gap-3"
            style={{
              borderBottom: `1px solid ${T.border}`,
              background: "rgba(0,0,0,0.85)",
              backdropFilter: "blur(20px)",
            }}
          >
            <button
              onClick={() => setSidebarOpen(true)}
              className="w-10 h-10 flex items-center justify-center rounded-lg"
              style={{ color: T.text2 }}
              aria-label="Open sidebar"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5" />
              </svg>
            </button>
            <Link href="/dashboard" className="text-lg font-bold tracking-tight">
              <span style={{ color: T.text }}>No</span>
              <span style={{ color: T.purple }}>Mistakes</span>
            </Link>
          </div>
          {children}
        </main>
      </div>
    </BusinessProvider>
  );
}
