"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import GoogleSignInButton from "@/components/GoogleSignInButton";
import { T, CTA_GRAD } from "@/lib/design-tokens";
import { trackSignupStart, trackSignupComplete, trackSignupError } from "@/lib/analytics";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    trackSignupStart("email");

    const { error: signupError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } },
    });

    if (signupError) {
      trackSignupError("email", signupError.message);
      setError(signupError.message);
      setLoading(false);
      return;
    }

    trackSignupComplete("email");
    router.push("/wizard");
  }

  return (
    <div style={{ background: T.bg }} className="min-h-screen flex items-center justify-center px-6">
      <div style={{ background: T.glass, border: `1px solid ${T.border}`, borderRadius: 16, backdropFilter: "blur(12px)", padding: "32px 28px" }} className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 24, textDecoration: "none" }}>
            <svg width="24" height="27" viewBox="0 0 80 88" fill="none">
              <path d="M40 4C40 4 14 16 14 38C14 54 26 62 32 65.5C34.5 67 36 69 36 72V80C36 82.5 37.5 84 40 84C42.5 84 44 82.5 44 80V72C44 69 45.5 67 48 65.5C54 62 66 54 66 38C66 16 40 4 40 4Z" fill="#C8A44E" />
              <circle cx="33" cy="35" r="3.5" fill="#0A0A0A" />
              <circle cx="47" cy="35" r="3.5" fill="#0A0A0A" />
            </svg>
            <span style={{ color: T.text, fontWeight: 700, fontSize: 20, letterSpacing: "-0.03em" }}>kovra</span>
          </Link>
          <h1 className="text-2xl font-bold text-white mb-2">Create your account</h1>
          <p style={{ color: T.text3 }} className="text-sm">Start building your AI-powered business</p>
        </div>

        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label className="block text-sm text-zinc-400 mb-1.5">Full name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl bg-surface-light border border-white/10 text-white text-sm focus:outline-none focus:border-brand-500 transition placeholder-zinc-600"
              placeholder="Ron Davenport"
            />
          </div>
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
              minLength={6}
              className="w-full px-4 py-3 rounded-xl bg-surface-light border border-white/10 text-white text-sm focus:outline-none focus:border-brand-500 transition placeholder-zinc-600"
              placeholder="At least 6 characters"
            />
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
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px bg-white/5" />
          <span className="text-xs text-zinc-600 uppercase">or</span>
          <div className="flex-1 h-px bg-white/5" />
        </div>

        <div onClick={() => trackSignupStart("google")}>
          <GoogleSignInButton redirectTo="/wizard" />
        </div>

        <p className="text-center text-sm text-zinc-500 mt-6">
          Already have an account?{" "}
          <Link href="/auth/login" className="text-brand-400 hover:text-brand-300 transition">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
