import { withSentryConfig } from '@sentry/nextjs';

// Security headers applied to every route. Tuned for Stripe, Sentry, PostHog, Cal.com.
// CSP is intentionally permissive for inline/eval because Next.js + Tailwind require it.
const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value:
      "default-src 'self'; " +
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://*.sentry.io https://*.posthog.com https://app.cal.com; " +
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
      "img-src 'self' data: blob: https:; " +
      "font-src 'self' https://fonts.gstatic.com; " +
      "connect-src 'self' https://*.sentry.io https://*.posthog.com https://api.stripe.com; " +
      'frame-src https://js.stripe.com https://app.cal.com; ' +
      "object-src 'none'; " +
      "base-uri 'self'; " +
      "form-action 'self'; " +
      "frame-ancestors 'none'; " +
      'upgrade-insecure-requests;',
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY',
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()',
  },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ];
  },
};

// Sentry config — set NEXT_PUBLIC_SENTRY_DSN, SENTRY_ORG, SENTRY_PROJECT, SENTRY_AUTH_TOKEN env vars to activate
export default withSentryConfig(nextConfig, {
  // Org / project for source-map upload. Required when SENTRY_AUTH_TOKEN is set.
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,

  // Suppress all logs unless an auth token is present (i.e. only chatter when actually uploading).
  silent: !process.env.SENTRY_AUTH_TOKEN,

  // Upload source maps but hide them from public clients.
  widenClientFileUpload: true,
  hideSourceMaps: true,

  // Tree-shake Sentry debug logger out of prod bundles.
  disableLogger: true,

  // Tunnel Sentry events through this Next.js route to avoid ad-blocker false positives.
  tunnelRoute: '/monitoring',
});
