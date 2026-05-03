"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Mail, CheckCircle2, AlertCircle } from "lucide-react";

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="bg-white rounded-xl shadow-card p-8 animate-pulse h-72" />}>
      <VerifyEmailContent />
    </Suspense>
  );
}

const ERROR_COPY: Record<string, string> = {
  missing_token: "This link is missing a verification token.",
  invalid_or_expired:
    "This verification link is invalid or has expired. Request a new one below.",
  server_error:
    "Something went wrong while verifying your email. Please try again.",
};

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);
  const [resendError, setResendError] = useState("");

  async function handleResend() {
    setResending(true);
    setResendError("");
    try {
      const res = await fetch("/api/auth/resend-verification", {
        method: "POST",
      });
      if (!res.ok) {
        setResendError("Couldn't resend. Please try again in a minute.");
      } else {
        setResent(true);
      }
    } catch {
      setResendError("Couldn't resend. Please try again in a minute.");
    } finally {
      setResending(false);
    }
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-card p-8 text-center">
        <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-6 h-6 text-red-600" />
        </div>
        <h2 className="text-lg font-semibold text-navy-900 mb-2">
          Verification failed
        </h2>
        <p className="text-sm text-navy-600 mb-6">
          {ERROR_COPY[error] ||
            "We couldn't verify your email with that link."}
        </p>

        {resent ? (
          <p className="text-sm text-emerald-700 mb-3">
            Sent. Check your inbox for the new link.
          </p>
        ) : (
          <button
            type="button"
            onClick={handleResend}
            disabled={resending}
            className="inline-block px-4 py-2 rounded-lg bg-ocean-600 text-white font-medium text-sm hover:bg-ocean-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {resending ? "Sending..." : "Resend verification email"}
          </button>
        )}
        {resendError && (
          <p className="mt-3 text-xs text-red-600">{resendError}</p>
        )}

        <div className="mt-6">
          <Link
            href="/login"
            className="text-sm text-navy-500 hover:text-navy-700"
          >
            Back to sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-card p-8 text-center">
      <div className="w-12 h-12 rounded-full bg-ocean-50 flex items-center justify-center mx-auto mb-4">
        <Mail className="w-5 h-5 text-ocean-600" />
      </div>
      <h2 className="text-lg font-semibold text-navy-900 mb-2">
        Check your email
      </h2>
      <p className="text-sm text-navy-600 mb-6">
        We sent a verification link to your inbox. Click it to confirm your
        email and finish setting up your account.
      </p>

      {resent ? (
        <div className="inline-flex items-center gap-1.5 text-sm text-emerald-700 mb-3">
          <CheckCircle2 className="w-4 h-4" />
          Sent. Check your inbox.
        </div>
      ) : (
        <button
          type="button"
          onClick={handleResend}
          disabled={resending}
          className="inline-block px-4 py-2 rounded-lg border border-navy-200 text-navy-700 font-medium text-sm hover:bg-navy-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {resending ? "Sending..." : "Resend verification email"}
        </button>
      )}
      {resendError && (
        <p className="mt-3 text-xs text-red-600">{resendError}</p>
      )}

      <p className="mt-6 text-xs text-navy-500">
        Didn&apos;t mean to land here?{" "}
        <Link
          href="/login"
          className="text-ocean-600 hover:text-ocean-700 font-medium"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
