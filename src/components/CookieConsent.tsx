"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  CONSENT_COOKIE,
  CONSENT_STORAGE_KEY,
  type ConsentChoiceValue,
} from "@/lib/legal/consent";

/**
 * GDPR/ePrivacy cookie consent banner (AI-8780).
 *
 * - Renders nothing until mounted (avoids SSR/client hydration mismatch) and
 *   nothing once a choice has been stored.
 * - Persists the choice three ways: localStorage (instant re-render), the
 *   server-readable `cookie_consent` cookie, and an auditable DB row written by
 *   POST /api/consent. The cookie is what a regulator asks about; localStorage
 *   alone was not demonstrable.
 * - Dispatches `ss-consent-changed` so AnalyticsProvider / posthog-client can boot
 *   PostHog immediately on acceptance without a page reload.
 *
 * The banner shows to every visitor rather than geo-detecting EU/California
 * traffic. That is deliberate: a stricter-than-required default cannot be wrong,
 * and IP geolocation at the edge is itself a processing activity we would then
 * have to justify. Analytics stay dark until an explicit "Accept all".
 */

type ConsentChoice = ConsentChoiceValue;

function readConsentCookie(): string | null {
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${CONSENT_COOKIE}=`));
  return match ? decodeURIComponent(match.slice(CONSENT_COOKIE.length + 1)) : null;
}

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // The cookie is authoritative (it survives a localStorage wipe and is what
    // the server reads); localStorage is the fallback for privacy modes that
    // block cookies but allow storage.
    try {
      if (readConsentCookie()) return;
    } catch {
      // document.cookie unavailable — fall through to localStorage
    }
    try {
      if (window.localStorage.getItem(CONSENT_STORAGE_KEY)) return;
    } catch {
      // localStorage unavailable (e.g. privacy mode) — still show the banner so
      // the visitor can make a choice for this session.
    }
    setVisible(true);
  }, []);

  if (!visible) return null;

  const choose = async (choice: ConsentChoice) => {
    setSaving(true);
    try {
      window.localStorage.setItem(CONSENT_STORAGE_KEY, choice);
    } catch {
      // best effort — the cookie set by the API below is the durable record
    }

    // Honor the choice in this session immediately, before the network call —
    // a slow or failed request must never leave analytics ambiguously enabled.
    window.dispatchEvent(new CustomEvent("ss-consent-changed", { detail: choice }));
    setVisible(false);

    try {
      await fetch("/api/consent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ choice }),
      });
    } catch {
      // Offline or blocked: the localStorage mirror keeps the banner dismissed,
      // and the next successful request will record the audit row.
    } finally {
      setSaving(false);
    }
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
            disabled={saving}
            onClick={() => choose("essential")}
            className="rounded-md border border-white/30 px-4 py-2 text-sm text-white transition-colors hover:border-white/60 hover:bg-white/5 disabled:opacity-60"
          >
            Essential only
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={() => choose("all")}
            className="rounded-md bg-ocean-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-ocean-600 disabled:opacity-60"
          >
            Accept all
          </button>
        </div>
      </div>
    </div>
  );
}
