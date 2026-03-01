"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import GoogleSignInButton from "@/components/GoogleSignInButton";
import { T, CTA_GRAD } from "@/lib/design-tokens";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (loginError) {
      setError(loginError.message);
      setLoading(false);
      return;
    }

    router.push("/dashboard");
  }

  return (
    <div style={{ background: T.bg }} className="min-h-screen flex items-center justify-center px-6">
      <div style={{ background: T.glass, border: `1px solid ${T.border}`, borderRadius: 16, backdropFilter: "blur(12px)", padding: "32px 28px" }} className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-bold tracking-tight inline-block mb-6">
            <span style={{ color: T.text }}>No</span>
            <span style={{ color: T.purple }}>Mistakes</span>
          </Link>
          <h1 className="text-2xl font-bold text-white mb-2">Welcome back</h1>
          <p style={{ color: T.text3 }} className="text-sm">Sign in to manage your businesses</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm text-zinc-400 mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl bg-surface-light border border-white/10 text-white text-sm focus:outline-none focus:border-brand-500 transition placeholder-zinc-600"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-sm text-zinc-400 mb-1.5">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl bg-surface-light border border-white/10 text-white text-sm focus:outline-none focus:border-brand-500 transition placeholder-zinc-600"
              placeholder="Your password"
            />
          </div>
          <div className="text-right">
            <Link href="/auth/forgot-password" className="text-sm text-brand-400 hover:text-brand-300 transition">
              Forgot password?
            </Link>
          </div>

          {error && (
            <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{ background: CTA_GRAD, opacity: loading ? 0.6 : 1 }}
            className="w-full py-3.5 rounded-xl text-sm font-bold text-white border-0 cursor-pointer"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px bg-white/5" />
          <span className="text-xs text-zinc-600 uppercase">or</span>
          <div className="flex-1 h-px bg-white/5" />
        </div>

        <GoogleSignInButton redirectTo="/dashboard" />

        <p className="text-center text-sm text-zinc-500 mt-6">
          Don&apos;t have an account?{" "}
          <Link href="/auth/signup" className="text-brand-400 hover:text-brand-300 transition">Sign up free</Link>
        </p>
      </div>
    </div>
  );
}
