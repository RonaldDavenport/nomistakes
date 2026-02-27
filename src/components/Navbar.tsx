"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function Navbar() {
  const pathname = usePathname();
  const isDashboard = pathname?.startsWith("/dashboard");
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setLoggedIn(!!user);
    });
  }, []);

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
        {loggedIn ? (
          <Link
            href="/dashboard"
            className="btn-primary px-5 py-2 rounded-lg text-sm font-semibold text-white"
          >
            Dashboard
          </Link>
        ) : (
          <div className="flex items-center gap-3">
            <Link
              href="/auth/login"
              className="text-sm text-zinc-400 hover:text-white transition"
            >
              Sign In
            </Link>
            <Link
              href="/wizard"
              className="btn-primary px-5 py-2 rounded-lg text-sm font-semibold text-white"
            >
              Start Free
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
