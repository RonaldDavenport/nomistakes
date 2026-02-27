"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function Navbar() {
  const pathname = usePathname();
  const isDashboard = pathname?.startsWith("/dashboard");
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
    <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-[rgba(10,10,15,0.85)] backdrop-blur-xl">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold tracking-tight">
          <span className="text-white">No</span>
          <span className="gradient-text">Mistakes</span>
        </Link>
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
        <div className="flex items-center gap-3">
          {loggedIn ? (
            <Link
              href="/dashboard"
              className="btn-primary px-5 py-2 rounded-lg text-sm font-semibold text-white"
            >
              Dashboard
            </Link>
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
                className="hidden sm:block btn-primary px-5 py-2 rounded-lg text-sm font-semibold text-white"
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
        <div className="md:hidden border-t border-white/5 bg-[rgba(10,10,15,0.95)] backdrop-blur-xl animate-fadeIn">
          <div className="px-6 py-4 space-y-1">
            <Link href="/#how-it-works" className="block py-3 text-sm text-zinc-400 hover:text-white transition">
              How It Works
            </Link>
            <Link href="/#features" className="block py-3 text-sm text-zinc-400 hover:text-white transition">
              Features
            </Link>
            <Link href="/#pricing" className="block py-3 text-sm text-zinc-400 hover:text-white transition">
              Pricing
            </Link>
            <div className="pt-3 border-t border-white/5 space-y-3">
              {loggedIn ? (
                <Link href="/dashboard" className="btn-primary block text-center px-5 py-3 rounded-lg text-sm font-semibold text-white">
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link href="/auth/login" className="block py-3 text-sm text-zinc-400 hover:text-white transition">
                    Sign In
                  </Link>
                  <Link href="/wizard" className="btn-primary block text-center px-5 py-3 rounded-lg text-sm font-semibold text-white">
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
