// This file configures the Sentry SDK on the Node.js server runtime.
// TODO(AI-8781): Set SENTRY_DSN (or NEXT_PUBLIC_SENTRY_DSN) in Vercel env vars to activate.
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Performance Monitoring — capture 10% of transactions in prod for slow API route detection.
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

  // Don't send events at all if no DSN is set (prevents noisy local errors).
  enabled: Boolean(process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN),

  // Environment + release tagging.
  environment: process.env.VERCEL_ENV || process.env.NODE_ENV || 'development',
  release: process.env.VERCEL_GIT_COMMIT_SHA,
});
