"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2 } from "lucide-react";

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="bg-white rounded-xl shadow-card p-8 animate-pulse h-72" />}>
      <ResetPasswordForm />
    </Suspense>
  );
}

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  if (!token) {
    return (
      <div className="bg-white rounded-xl shadow-card p-8 text-center">
        <h2 className="text-lg font-semibold text-navy-900 mb-2">
          Invalid reset link
        </h2>
        <p className="text-sm text-navy-600 mb-4">
          This link is missing a token. Request a fresh reset email below.
        </p>
        <Link
          href="/forgot-password"
          className="inline-block text-sm text-ocean-600 hover:text-ocean-700 font-medium"
        >
          Send a new link
        </Link>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const formData = new FormData(e.currentTarget);
    const newPassword = String(formData.get("password") || "");
    const confirm = String(formData.get("confirm") || "");

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirm) {
      setError("Passwords don't match.");
      return;
    }

    setLoading(true);
    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, new_password: newPassword }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data?.error || "Reset failed. Please request a new link.");
      setLoading(false);
      return;
    }

    setDone(true);
    setLoading(false);
    setTimeout(() => router.push("/login"), 2000);
  }

  if (done) {
    return (
      <div className="bg-white rounded-xl shadow-card p-8 text-center">
        <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-6 h-6 text-emerald-600" />
        </div>
        <h2 className="text-lg font-semibold text-navy-900 mb-2">
          Password updated
        </h2>
        <p className="text-sm text-navy-600 mb-4">
          You can now sign in with your new password.
        </p>
        <Link
          href="/login"
          className="inline-block text-sm text-ocean-600 hover:text-ocean-700 font-medium"
        >
          Continue to sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-card p-8">
      <h2 className="text-xl font-semibold text-navy-900 text-center mb-2">
        Choose a new password
      </h2>
      <p className="text-sm text-navy-500 text-center mb-6">
        Enter the new password for your ShippingSavior account.
      </p>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm text-center">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-navy-700 mb-1"
          >
            New password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            className="w-full px-4 py-2.5 rounded-lg border border-navy-200 bg-white text-navy-900 placeholder-navy-400 focus:outline-none focus:ring-2 focus:ring-ocean-500 focus:border-transparent transition-colors"
            placeholder="At least 8 characters"
          />
        </div>

        <div>
          <label
            htmlFor="confirm"
            className="block text-sm font-medium text-navy-700 mb-1"
          >
            Confirm new password
          </label>
          <input
            id="confirm"
            name="confirm"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            className="w-full px-4 py-2.5 rounded-lg border border-navy-200 bg-white text-navy-900 placeholder-navy-400 focus:outline-none focus:ring-2 focus:ring-ocean-500 focus:border-transparent transition-colors"
            placeholder="Re-enter new password"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 px-4 rounded-lg bg-ocean-600 text-white font-medium hover:bg-ocean-700 focus:outline-none focus:ring-2 focus:ring-ocean-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? "Updating..." : "Update password"}
        </button>
      </form>
    </div>
  );
}
