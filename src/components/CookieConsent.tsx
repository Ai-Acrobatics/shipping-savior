"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

/**
 * GDPR/ePrivacy cookie consent banner (AI-8780).
 *
 * - Renders nothing until mounted (avoids SSR/client hydration mismatch) and
 *   nothing once a choice has been stored.
 * - Persists the choice in localStorage under `ss-cookie-consent` ("all" | "essential").
 * - Dispatches `ss-consent-changed` so AnalyticsProvider / posthog-client can boot
 *   PostHog immediately on acceptance without a page reload.
 */

const STORAGE_KEY = "ss-cookie-consent";

type ConsentChoice = "all" | "essential";

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (!window.localStorage.getItem(STORAGE_KEY)) {
        setVisible(true);
      }
    } catch {
      // localStorage unavailable (e.g. privacy mode) — keep the banner hidden
      // and treat the session as essential-only.
    }
  }, []);

  if (!visible) return null;

  const choose = (choice: ConsentChoice) => {
    try {
      window.localStorage.setItem(STORAGE_KEY, choice);
    } catch {
      // best effort — still dispatch so the current session honors the choice
    }
    window.dispatchEvent(new CustomEvent("ss-consent-changed", { detail: choice }));
    setVisible(false);
  };

  return (
    <div
      role="dialog"
      aria-label="Cookie consent"
      className="fixed inset-x-0 bottom-0 z-50 bg-navy-900 text-white px-6 py-4 shadow-[0_-4px_20px_rgba(2,6,23,0.35)]"
    >
      <div className="mx-auto flex max-w-5xl flex-col items-start gap-4 sm:flex-row sm:items-center">
        <p className="flex-1 text-sm leading-relaxed text-navy-100">
          We use essential cookies to run Shipping Savior and, with your consent,
          analytics cookies to improve the product. See our{" "}
          <Link href="/privacy" className="text-ocean-300 underline hover:text-ocean-200">
            Privacy Policy
          </Link>
          .
        </p>
        <div className="flex shrink-0 items-center gap-3">
          <button
            type="button"
            onClick={() => choose("essential")}
            className="rounded-md border border-white/30 px-4 py-2 text-sm text-white transition-colors hover:border-white/60 hover:bg-white/5"
          >
            Essential only
          </button>
          <button
            type="button"
            onClick={() => choose("all")}
            className="rounded-md bg-ocean-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-ocean-600"
          >
            Accept all
          </button>
        </div>
      </div>
    </div>
  );
}
