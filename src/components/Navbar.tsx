"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();
  const isDashboard = pathname?.startsWith("/dashboard");

  if (isDashboard) return null; // Dashboard has its own sidebar nav

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
        <Link
          href="/wizard"
          className="btn-primary px-5 py-2 rounded-lg text-sm font-semibold text-white"
        >
          Start Free
        </Link>
      </div>
    </nav>
  );
}
