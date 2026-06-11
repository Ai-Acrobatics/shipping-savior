import type { CapacitorConfig } from "@capacitor/cli";

// Shipping Savior native shell (iOS + Android).
//
// The app is a server-rendered Next.js platform, so the native shell loads the
// production deployment rather than a static bundle. This is the standard
// Capacitor pattern for SSR apps: the WebView points at the live site, native
// plugins are still available, and App Store review treats it as a hybrid app
// (acceptable as long as the app provides app-like navigation, which the
// installed PWA shell + platform UI does).
//
// To build:  npx cap add ios && npx cap add android  (run on a Mac for iOS)
// then:      npx cap sync && npx cap open ios
// See docs/MOBILE-APP-READINESS.md for the full TestFlight/Play Store runbook.
const config: CapacitorConfig = {
  appId: "com.shippingsavior.app",
  appName: "Shipping Savior",
  // webDir is required by the CLI but unused when server.url is set; it only
  // needs to exist and contain an index.html (public/ does).
  webDir: "public",
  server: {
    url: "https://shipping-savior.vercel.app",
    allowNavigation: ["shipping-savior.vercel.app", "*.stripe.com", "accounts.google.com", "github.com"],
  },
  ios: {
    contentInset: "automatic",
    backgroundColor: "#0f172a",
  },
  android: {
    backgroundColor: "#0f172a",
    allowMixedContent: false,
  },
};

export default config;
