"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

/**
 * Cookie consent banner — GDPR-friendly defaults for EU traffic, low-friction
 * for everyone else.
 *
 * Storage contract (shared with the PostHog gate in src/lib/analytics/, owned
 * by Worker 4 on AI-8782):
 *   - localStorage key:   `ss_cookie_consent`
 *   - cookie name:        `cookie_consent`
 *   - values:
 *       'all'        → essential + analytics + marketing all enabled
 *       'essential'  → essential only
 *       JSON string  → custom: {"essential":true,"analytics":bool,"marketing":bool}
 *
 * The PostHog gate reads `localStorage.getItem('ss_cookie_consent')` and
 * enables analytics only when the value is exactly 'all' OR a JSON object
 * whose `analytics` field is true.
 *
 * Geo behaviour:
 *   - If `Accept-Language` indicates an EU locale OR the URL contains
 *     `?eu=1`, we render the banner.
 *   - Otherwise, we set `'essential'` silently and skip the UI (per
 *     AI-8780: reduce friction in the US market).
 */

const STORAGE_KEY = "ss_cookie_consent";
const COOKIE_NAME = "cookie_consent";
const COOKIE_MAX_AGE_DAYS = 365;

const EU_LOCALES = new Set([
  "at", "be", "bg", "hr", "cy", "cz", "dk", "ee", "fi", "fr", "de",
  "gr", "hu", "ie", "it", "lv", "lt", "lu", "mt", "nl", "pl", "pt",
  "ro", "sk", "si", "es", "se", "is", "li", "no", "gb", "uk",
]);

type ConsentValue = "all" | "essential" | string;

interface CustomConsent {
  essential: true;
  analytics: boolean;
  marketing: boolean;
}

function writeCookie(value: string) {
  if (typeof document === "undefined") return;
  const maxAge = COOKIE_MAX_AGE_DAYS * 24 * 60 * 60;
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${COOKIE_NAME}=${encodeURIComponent(
    value
  )}; Path=/; Max-Age=${maxAge}; SameSite=Lax${secure}`;
}

function persistConsent(value: ConsentValue) {
  try {
    localStorage.setItem(STORAGE_KEY, value);
  } catch {
    // Some browsers throw in private mode — fall through to the cookie.
  }
  writeCookie(value);
}

function readConsent(): ConsentValue | null {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function isLikelyEUUser(): boolean {
  if (typeof window === "undefined") return false;
  // Force-open via `?eu=1` (handy for testing and for explicit-opt-in regions).
  const params = new URLSearchParams(window.location.search);
  if (params.get("eu") === "1") return true;
  // Use Accept-Language proxy (browser primary language).
  const lang = navigator.language || (navigator.languages && navigator.languages[0]);
  if (!lang) return false;
  // Pull the region tag, e.g. "en-GB" → "gb", "fr" → "fr".
  const parts = lang.toLowerCase().split("-");
  const region = parts[1] ?? parts[0];
  return EU_LOCALES.has(region);
}

export default function CookieConsent() {
  const [open, setOpen] = useState(false);
  const [showCustomize, setShowCustomize] = useState(false);
  const [analyticsOk, setAnalyticsOk] = useState(true);
  const [marketingOk, setMarketingOk] = useState(false);

  useEffect(() => {
    const existing = readConsent();
    if (existing) return;

    if (isLikelyEUUser()) {
      // Show banner — user must affirmatively choose.
      setOpen(true);
    } else {
      // Default-set essential silently for non-EU traffic and skip UI.
      persistConsent("essential");
    }
  }, []);

  if (!open) return null;

  const handleAcceptAll = () => {
    persistConsent("all");
    setOpen(false);
  };

  const handleEssentialOnly = () => {
    persistConsent("essential");
    setOpen(false);
  };

  const handleSaveCustom = () => {
    const custom: CustomConsent = {
      essential: true,
      analytics: analyticsOk,
      marketing: marketingOk,
    };
    persistConsent(JSON.stringify(custom));
    setOpen(false);
  };

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Cookie preferences"
      className="fixed bottom-0 inset-x-0 z-50 px-4 pb-4 pointer-events-none"
    >
      <div className="max-w-3xl mx-auto pointer-events-auto rounded-2xl border border-navy-200 bg-white shadow-2xl">
        {!showCustomize ? (
          <div className="p-5 md:p-6 flex flex-col gap-4">
            <div>
              <h3 className="text-base font-semibold text-navy-900">
                We use cookies
              </h3>
              <p className="text-sm text-navy-600 mt-1 leading-relaxed">
                Essential cookies keep you signed in and the platform
                running. Analytics cookies help us improve the product. You
                can accept all, reject non-essential, or choose what to
                allow. See our{" "}
                <Link
                  href="/privacy"
                  className="text-ocean-600 underline hover:text-ocean-700"
                >
                  Privacy Policy
                </Link>
                .
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={handleAcceptAll}
                className="flex-1 px-4 py-2 rounded-lg bg-ocean-600 text-white text-sm font-medium hover:bg-ocean-700 transition-colors"
                data-testid="cookie-accept-all"
              >
                Accept all
              </button>
              <button
                onClick={handleEssentialOnly}
                className="flex-1 px-4 py-2 rounded-lg border border-navy-200 text-navy-700 text-sm font-medium hover:bg-navy-50 transition-colors"
                data-testid="cookie-reject-non-essential"
              >
                Reject non-essential
              </button>
              <button
                onClick={() => setShowCustomize(true)}
                className="flex-1 px-4 py-2 rounded-lg border border-navy-200 text-navy-700 text-sm font-medium hover:bg-navy-50 transition-colors"
                data-testid="cookie-customize"
              >
                Customize
              </button>
            </div>
          </div>
        ) : (
          <div className="p-5 md:p-6 flex flex-col gap-4">
            <div>
              <h3 className="text-base font-semibold text-navy-900">
                Cookie preferences
              </h3>
              <p className="text-sm text-navy-600 mt-1">
                Choose which cookies we may set. You can change this at any
                time from this banner (we'll re-prompt) or by clearing your
                browser cookies.
              </p>
            </div>

            <ul className="flex flex-col gap-3">
              <li className="flex items-start gap-3 p-3 rounded-lg border border-navy-100 bg-navy-50/50">
                <input
                  type="checkbox"
                  checked
                  disabled
                  aria-label="Essential cookies (always on)"
                  className="mt-1"
                />
                <div className="text-sm">
                  <div className="font-medium text-navy-900">
                    Essential
                    <span className="ml-2 text-xs text-navy-500">
                      (always on)
                    </span>
                  </div>
                  <div className="text-navy-600 text-xs mt-0.5">
                    Required to keep you signed in and protect the
                    platform from abuse. Cannot be disabled.
                  </div>
                </div>
              </li>

              <li className="flex items-start gap-3 p-3 rounded-lg border border-navy-100">
                <input
                  type="checkbox"
                  id="cc-analytics"
                  checked={analyticsOk}
                  onChange={(e) => setAnalyticsOk(e.target.checked)}
                  className="mt-1"
                />
                <label htmlFor="cc-analytics" className="text-sm cursor-pointer">
                  <div className="font-medium text-navy-900">Analytics</div>
                  <div className="text-navy-600 text-xs mt-0.5">
                    Helps us understand which features are used so we can
                    improve them. Powered by PostHog.
                  </div>
                </label>
              </li>

              <li className="flex items-start gap-3 p-3 rounded-lg border border-navy-100">
                <input
                  type="checkbox"
                  id="cc-marketing"
                  checked={marketingOk}
                  onChange={(e) => setMarketingOk(e.target.checked)}
                  className="mt-1"
                />
                <label htmlFor="cc-marketing" className="text-sm cursor-pointer">
                  <div className="font-medium text-navy-900">Marketing</div>
                  <div className="text-navy-600 text-xs mt-0.5">
                    Lets us measure marketing-campaign effectiveness. Off
                    by default.
                  </div>
                </label>
              </li>
            </ul>

            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={handleSaveCustom}
                className="flex-1 px-4 py-2 rounded-lg bg-ocean-600 text-white text-sm font-medium hover:bg-ocean-700 transition-colors"
                data-testid="cookie-save-custom"
              >
                Save preferences
              </button>
              <button
                onClick={() => setShowCustomize(false)}
                className="px-4 py-2 rounded-lg border border-navy-200 text-navy-700 text-sm font-medium hover:bg-navy-50 transition-colors"
              >
                Back
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
