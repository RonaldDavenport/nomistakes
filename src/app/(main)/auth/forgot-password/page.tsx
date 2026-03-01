"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { T, CTA_GRAD } from "@/lib/design-tokens";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      email,
      { redirectTo: window.location.origin + "/auth/reset-password" }
    );

    if (resetError) {
      setError(resetError.message);
      setLoading(false);
      return;
    }

    setSent(true);
    setLoading(false);
  }

  return (
    <div style={{ background: T.bg }} className="min-h-screen flex items-center justify-center px-6">
      <div style={{ background: T.glass, border: `1px solid ${T.border}`, borderRadius: 16, backdropFilter: "blur(12px)", padding: "32px 28px" }} className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-bold tracking-tight inline-block mb-6">
            <span style={{ color: T.text }}>No</span>
            <span style={{ color: T.purple }}>Mistakes</span>
          </Link>
          <h1 className="text-2xl font-bold text-white mb-2">Reset your password</h1>
          <p style={{ color: T.text3 }} className="text-sm">
            {sent
              ? "We sent a reset link to your email"
              : "Enter your email and we'll send you a reset link"}
          </p>
        </div>

        {sent ? (
          <div className="space-y-4">
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg px-4 py-3 text-center">
              <p className="text-green-400 text-sm font-medium mb-1">Check your email</p>
              <p className="text-zinc-400 text-xs">
                We sent a password reset link to <span className="text-white">{email}</span>.
                Click the link in the email to set a new password.
              </p>
            </div>
            <Link
              href="/auth/login"
              style={{ background: CTA_GRAD }}
              className="w-full py-3.5 rounded-xl text-sm font-bold text-white block text-center border-0"
            >
              Back to Sign In
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
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

            {error && (
              <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{ background: CTA_GRAD, opacity: loading ? 0.6 : 1 }}
              className="w-full py-3.5 rounded-xl text-sm font-bold text-white border-0 cursor-pointer"
            >
              {loading ? "Sending..." : "Send Reset Link"}
            </button>
          </form>
        )}

        <p className="text-center text-sm text-zinc-500 mt-6">
          Remember your password?{" "}
          <Link href="/auth/login" className="text-brand-400 hover:text-brand-300 transition">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
