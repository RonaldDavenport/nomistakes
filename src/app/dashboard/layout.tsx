"use client";

import Link from "next/link";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      {/* Minimal top bar for non-business pages (overview, account) */}
      <header className="sticky top-0 z-30 border-b border-white/5 bg-[rgba(10,10,15,0.85)] backdrop-blur-xl px-4 sm:px-6 h-14 flex items-center justify-between">
        <Link href="/" className="text-lg font-bold tracking-tight">
          <span className="text-white">No</span>
          <span className="gradient-text">Mistakes</span>
        </Link>
        <div className="flex items-center gap-3">
          <Link
            href="/wizard"
            className="btn-primary px-4 py-2 rounded-lg text-xs font-semibold text-white"
          >
            + New Business
          </Link>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}
