"use client";

import { useEffect } from "react";

// Registers the PWA service worker (public/sw.js). Production only —
// a stale SW against the dev server makes hot reload unusable.
export default function ServiceWorkerProvider() {
  useEffect(() => {
    if (
      process.env.NODE_ENV !== "production" ||
      typeof window === "undefined" ||
      !("serviceWorker" in navigator)
    ) {
      return;
    }
    navigator.serviceWorker.register("/sw.js").catch((err) => {
      console.error("Service worker registration failed:", err);
    });
  }, []);

  return null;
}
