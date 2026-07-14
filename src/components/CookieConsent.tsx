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

  // Compact floating card, centered at the bottom (AI-12732): unlike the old
  // full-width banner it never covers the platform sidebar or the chat button.
  return (
    <div
      role="dialog"
      aria-label="Cookie consent"
      className="fixed inset-x-4 bottom-4 z-50 mx-auto max-w-xl rounded-2xl border border-white/10 bg-navy-950/95 px-5 py-4 text-white shadow-premium backdrop-blur-sm"
    >
      <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
        <p className="flex-1 text-[13px] leading-relaxed text-navy-100">
          We use essential cookies to run Shipping Savior and, with your consent,
          analytics cookies to improve the product. See our{" "}
          <Link href="/privacy" className="text-ocean-300 underline hover:text-ocean-200">
            Privacy Policy
          </Link>
          .
        </p>
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={() => choose("essential")}
            className="rounded-lg border border-white/25 px-3 py-1.5 text-[13px] font-medium text-white transition-colors hover:border-white/50 hover:bg-white/5"
          >
            Essential only
          </button>
          <button
            type="button"
            onClick={() => choose("all")}
            className="rounded-lg bg-ocean-500 px-3.5 py-1.5 text-[13px] font-semibold text-white transition-colors hover:bg-ocean-600"
          >
            Accept all
          </button>
        </div>
      </div>
    </div>
  );
}
