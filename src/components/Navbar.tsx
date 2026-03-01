"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { T, CTA_GRAD } from "@/lib/design-tokens";

export default function Navbar() {
  const pathname = usePathname();
  const isDashboard = pathname?.startsWith("/dashboard");
  const isAppFlow = pathname?.startsWith("/wizard") || pathname?.startsWith("/onboarding") || pathname?.startsWith("/auth");
  const [loggedIn, setLoggedIn] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setLoggedIn(!!user);
    });
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  if (isDashboard) return null;

  return (
    <nav style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(12px)" }} className="fixed top-0 w-full z-50 border-b border-white/5">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold tracking-tight">
          <span style={{ color: T.text }}>No</span>
          <span style={{ color: T.purple }}>Mistakes</span>
        </Link>
        {!isAppFlow && (
          <div className="hidden md:flex items-center gap-8 text-sm text-zinc-400">
            <Link href="/#how-it-works" className="hover:text-white transition">
              How It Works
            </Link>
            <Link href="/#features" className="hover:text-white transition">
              Features
            </Link>
            <Link href="/#pricing" className="hover:text-white transition">
              Pricing
            </Link>
          </div>
        )}
        <div className="flex items-center gap-3">
          {loggedIn ? (
            <div className="flex items-center gap-3">
              <Link
                href="/dashboard"
                style={{ background: CTA_GRAD }}
                className="px-5 py-2 rounded-full text-sm font-semibold text-white"
              >
                Dashboard
              </Link>
              <button
                onClick={async () => {
                  await supabase.auth.signOut();
                  window.location.href = "/";
                }}
                className="text-sm text-zinc-500 hover:text-zinc-300 transition"
              >
                Log out
              </button>
            </div>
          ) : (
            <>
              <Link
                href="/auth/login"
                className="hidden sm:block text-sm text-zinc-400 hover:text-white transition"
              >
                Sign In
              </Link>
              <Link
                href="/wizard"
                style={{ background: CTA_GRAD }}
                className="hidden sm:block px-5 py-2 rounded-full text-sm font-semibold text-white"
              >
                Start Free
              </Link>
            </>
          )}
          {/* Hamburger — mobile only */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden flex flex-col justify-center items-center w-10 h-10 rounded-lg hover:bg-white/5 transition"
            aria-label="Toggle menu"
          >
            <span className={`block w-5 h-0.5 bg-zinc-300 transition-all duration-200 ${mobileOpen ? "rotate-45 translate-y-[3px]" : ""}`} />
            <span className={`block w-5 h-0.5 bg-zinc-300 mt-1 transition-all duration-200 ${mobileOpen ? "-rotate-45 -translate-y-[3px]" : ""}`} />
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div style={{ background: T.bgEl }} className="md:hidden border-t border-white/5 backdrop-blur-xl animate-fadeIn">
          <div className="px-6 py-4 space-y-1">
            {!isAppFlow && (
              <>
                <Link href="/#how-it-works" className="block py-3 text-sm text-zinc-400 hover:text-white transition">
                  How It Works
                </Link>
                <Link href="/#features" className="block py-3 text-sm text-zinc-400 hover:text-white transition">
                  Features
                </Link>
                <Link href="/#pricing" className="block py-3 text-sm text-zinc-400 hover:text-white transition">
                  Pricing
                </Link>
              </>
            )}
            <div className={`${isAppFlow ? "" : "pt-3 border-t border-white/5 "}space-y-3`}>
              {loggedIn ? (
                <>
                  <Link href="/dashboard" style={{ background: CTA_GRAD }} className="block text-center px-5 py-3 rounded-full text-sm font-semibold text-white">
                    Dashboard
                  </Link>
                  <button
                    onClick={async () => {
                      await supabase.auth.signOut();
                      window.location.href = "/";
                    }}
                    className="block w-full text-left py-3 text-sm text-zinc-400 hover:text-white transition"
                  >
                    Log out
                  </button>
                </>
              ) : (
                <>
                  <Link href="/auth/login" className="block py-3 text-sm text-zinc-400 hover:text-white transition">
                    Sign In
                  </Link>
                  <Link href="/wizard" style={{ background: CTA_GRAD }} className="block text-center px-5 py-3 rounded-full text-sm font-semibold text-white">
                    Start Free
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
