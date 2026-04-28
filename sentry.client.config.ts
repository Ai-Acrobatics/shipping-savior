// This file configures the Sentry SDK on the browser/client.
// The DSN is read from NEXT_PUBLIC_SENTRY_DSN.
// TODO(AI-8781): Set NEXT_PUBLIC_SENTRY_DSN in Vercel env vars to activate.
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Performance Monitoring — sample 10% of transactions in prod, 100% in dev.
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

  // Capture Replay only on errors in production for cost control.
  replaysSessionSampleRate: 0,
  replaysOnErrorSampleRate: 1.0,

  // Don't send events at all if no DSN is set (prevents noisy local errors).
  enabled: Boolean(process.env.NEXT_PUBLIC_SENTRY_DSN),

  // Filter out noisy non-actionable client errors.
  ignoreErrors: [
    'ResizeObserver loop limit exceeded',
    'ResizeObserver loop completed with undelivered notifications',
    'Non-Error promise rejection captured',
  ],

  // Environment + release tagging.
  environment: process.env.VERCEL_ENV || process.env.NODE_ENV || 'development',
  release: process.env.VERCEL_GIT_COMMIT_SHA,
});
