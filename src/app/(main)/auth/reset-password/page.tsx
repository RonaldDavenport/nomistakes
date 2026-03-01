"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { T, CTA_GRAD } from "@/lib/design-tokens";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event) => {
        if (event === "PASSWORD_RECOVERY") {
          setReady(true);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    const { error: updateError } = await supabase.auth.updateUser({
      password,
    });

    if (updateError) {
      setError(updateError.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);

    setTimeout(() => {
      router.push("/auth/login");
    }, 2000);
  }

  return (
    <div style={{ background: T.bg }} className="min-h-screen flex items-center justify-center px-6">
      <div style={{ background: T.glass, border: `1px solid ${T.border}`, borderRadius: 16, backdropFilter: "blur(12px)", padding: "32px 28px" }} className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-bold tracking-tight inline-block mb-6">
            <span style={{ color: T.text }}>No</span>
            <span style={{ color: T.purple }}>Mistakes</span>
          </Link>
          <h1 className="text-2xl font-bold text-white mb-2">Set new password</h1>
          <p style={{ color: T.text3 }} className="text-sm">
            {success
              ? "Your password has been updated"
              : "Enter your new password below"}
          </p>
        </div>

        {success ? (
          <div className="space-y-4">
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg px-4 py-3 text-center">
              <p className="text-green-400 text-sm font-medium mb-1">Password updated</p>
              <p className="text-zinc-400 text-xs">
                Redirecting you to sign in...
              </p>
            </div>
          </div>
        ) : !ready ? (
          <div className="space-y-4">
            <div className="bg-zinc-800/50 border border-white/10 rounded-lg px-4 py-3 text-center">
              <p className="text-zinc-400 text-sm">
                Verifying your reset link...
              </p>
            </div>
            <p className="text-center text-sm text-zinc-500">
              If this takes too long, try{" "}
              <Link href="/auth/forgot-password" className="text-brand-400 hover:text-brand-300 transition">
                requesting a new link
              </Link>
              .
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-zinc-400 mb-1.5">New password</label>
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
            <div>
              <label className="block text-sm text-zinc-400 mb-1.5">Confirm password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-4 py-3 rounded-xl bg-surface-light border border-white/10 text-white text-sm focus:outline-none focus:border-brand-500 transition placeholder-zinc-600"
                placeholder="Repeat your new password"
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
              {loading ? "Updating..." : "Update Password"}
            </button>
          </form>
        )}

        <p className="text-center text-sm text-zinc-500 mt-6">
          <Link href="/auth/login" className="text-brand-400 hover:text-brand-300 transition">
            Back to Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
