"use client";

import { useEffect } from "react";
import { initPostHogIfConsented } from "@/lib/analytics/posthog-client";
import { captureUtmFromUrl } from "@/lib/analytics/utm";

/**
 * Boots client-side analytics:
 *   1. Captures UTM params + referrer on first landing (idempotent)
 *   2. Initializes PostHog ONLY if cookie consent is granted (ss_cookie_consent === 'all')
 *      and NEXT_PUBLIC_POSTHOG_KEY is set. Both are no-ops otherwise.
 *
 * Listens for the `ss-consent-changed` window event so PostHog boots immediately
 * when the user accepts cookies. The CookieConsent banner (W6) should dispatch
 * `window.dispatchEvent(new CustomEvent('ss-consent-changed'))` after writing
 * to localStorage.
 */
export default function AnalyticsProvider() {
  useEffect(() => {
    // 1. UTM capture — runs on every mount but is idempotent (first-touch)
    captureUtmFromUrl();

    // 2. PostHog boot if consent already granted
    void initPostHogIfConsented();

    // 3. Re-attempt boot when consent changes
    const onConsentChange = () => {
      void initPostHogIfConsented();
    };
    window.addEventListener("ss-consent-changed", onConsentChange);

    return () => {
      window.removeEventListener("ss-consent-changed", onConsentChange);
    };
  }, []);

  return null;
}
