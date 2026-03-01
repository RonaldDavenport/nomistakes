"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { getUpgradePlan } from "@/lib/plans";

export default function AccountSettingsPage() {
  const router = useRouter();

  // Profile state
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState("");

  // Password state
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState("");

  // Plan state
  const [planId, setPlanId] = useState("free");
  const [planLoading, setPlanLoading] = useState(true);
  const [upgradeLoading, setUpgradeLoading] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);
  const [userId, setUserId] = useState("");

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/auth/login");
        return;
      }
      setEmail(user.email || "");
      setFullName(user.user_metadata?.full_name || "");
      setUserId(user.id);

      // Fetch plan from profiles
      const { data: profile } = await supabase
        .from("profiles")
        .select("plan")
        .eq("id", user.id)
        .single();
      if (profile?.plan) setPlanId(profile.plan);
      setPlanLoading(false);
    }
    load();
  }, [router]);

  async function saveProfile() {
    setProfileSaving(true);
    setProfileMsg("");
    const { error } = await supabase.auth.updateUser({
      data: { full_name: fullName },
    });
    setProfileMsg(error ? error.message : "Profile updated.");
    setProfileSaving(false);
  }

  async function changePassword() {
    setPasswordSaving(true);
    setPasswordMsg("");
    if (newPassword.length < 6) {
      setPasswordMsg("Password must be at least 6 characters.");
      setPasswordSaving(false);
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMsg("Passwords do not match.");
      setPasswordSaving(false);
      return;
    }
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      setPasswordMsg(error.message);
    } else {
      setPasswordMsg("Password updated.");
      setNewPassword("");
      setConfirmPassword("");
    }
    setPasswordSaving(false);
  }

  const planLabels: Record<string, { name: string; price: string }> = {
    free: { name: "Free", price: "Free" },
    starter: { name: "Starter", price: "$19.99/mo" },
    growth: { name: "Growth", price: "$49.99/mo" },
    pro: { name: "Pro", price: "$249.99/mo" },
  };
  const currentPlan = planLabels[planId] || planLabels.free;

  return (
    <div className="min-h-screen bg-[#0c0a09]">
      <div className="max-w-2xl mx-auto px-6 py-12">
        <Link
          href="/dashboard"
          className="text-sm text-zinc-500 hover:text-zinc-300 transition mb-8 inline-flex items-center gap-2"
        >
          &larr; Back to Dashboard
        </Link>
        <h1 className="text-2xl font-bold text-white mb-8">Account Settings</h1>

        {/* Profile Section */}
        <div className="p-6 rounded-xl border border-white/5 bg-[#171412]/50 mb-6">
          <h2 className="text-lg font-semibold text-white mb-4">Profile</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-zinc-400 mb-1">Email</label>
              <input
                type="email"
                value={email}
                disabled
                className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-zinc-500 text-sm cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-sm text-zinc-400 mb-1">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Your name"
                className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-brand-500 transition"
              />
            </div>
            {profileMsg && (
              <p className={`text-sm ${profileMsg.includes("updated") ? "text-green-400" : "text-red-400"}`}>
                {profileMsg}
              </p>
            )}
            <button
              onClick={saveProfile}
              disabled={profileSaving}
              className="px-5 py-2.5 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-sm font-semibold transition disabled:opacity-50"
            >
              {profileSaving ? "Saving..." : "Save Profile"}
            </button>
          </div>
        </div>

        {/* Change Password Section */}
        <div className="p-6 rounded-xl border border-white/5 bg-[#171412]/50 mb-6">
          <h2 className="text-lg font-semibold text-white mb-4">Change Password</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-zinc-400 mb-1">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="New password"
                className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-brand-500 transition"
              />
            </div>
            <div>
              <label className="block text-sm text-zinc-400 mb-1">Confirm New Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm password"
                className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-brand-500 transition"
              />
            </div>
            {passwordMsg && (
              <p className={`text-sm ${passwordMsg.includes("updated") ? "text-green-400" : "text-red-400"}`}>
                {passwordMsg}
              </p>
            )}
            <button
              onClick={changePassword}
              disabled={passwordSaving}
              className="px-5 py-2.5 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-sm font-semibold transition disabled:opacity-50"
            >
              {passwordSaving ? "Updating..." : "Update Password"}
            </button>
          </div>
        </div>

        {/* Current Plan Section */}
        <div className="p-6 rounded-xl border border-white/5 bg-[#171412]/50 mb-6">
          <h2 className="text-lg font-semibold text-white mb-4">Current Plan</h2>
          {planLoading ? (
            <p className="text-sm text-zinc-500">Loading...</p>
          ) : (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium">{currentPlan.name}</p>
                <p className="text-sm text-zinc-500">{currentPlan.price}</p>
              </div>
              {planId === "free" ? (
                <button
                  disabled={upgradeLoading}
                  onClick={async () => {
                    setUpgradeLoading(true);
                    try {
                      const upgrade = getUpgradePlan(planId);
                      if (!upgrade) return;
                      const res = await fetch("/api/stripe/checkout", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ planId: upgrade.id, userId, email }),
                      });
                      const { url, error } = await res.json();
                      if (url) window.location.href = url;
                      else console.error("Checkout error:", error);
                    } finally {
                      setUpgradeLoading(false);
                    }
                  }}
                  className="px-5 py-2.5 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-sm font-semibold transition disabled:opacity-50"
                >
                  {upgradeLoading ? "Redirecting..." : "Upgrade"}
                </button>
              ) : (
                <button
                  disabled={portalLoading}
                  onClick={async () => {
                    setPortalLoading(true);
                    try {
                      const res = await fetch("/api/stripe/portal", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ userId }),
                      });
                      const { url, error } = await res.json();
                      if (url) window.location.href = url;
                      else console.error("Portal error:", error);
                    } finally {
                      setPortalLoading(false);
                    }
                  }}
                  className="px-5 py-2.5 rounded-lg border border-white/10 hover:bg-white/5 text-white text-sm font-medium transition disabled:opacity-50"
                >
                  {portalLoading ? "Loading..." : "Manage Subscription"}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Danger Zone */}
        <div className="p-6 rounded-xl border border-red-500/20 bg-red-500/5 mb-6">
          <h2 className="text-lg font-semibold text-red-400 mb-2">Danger Zone</h2>
          <p className="text-sm text-zinc-400 mb-4">
            Deleting your account is permanent and cannot be undone. All your businesses, content, and data will be permanently removed.
          </p>
          <p className="text-sm text-zinc-500">
            To delete your account, please contact support at{" "}
            <a href="mailto:support@nomistakes.ai" className="text-red-400 hover:text-red-300 underline transition">
              support@nomistakes.ai
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
