// This file configures the Sentry SDK on the Edge runtime (middleware, edge routes).
// TODO(AI-8781): Set SENTRY_DSN (or NEXT_PUBLIC_SENTRY_DSN) in Vercel env vars to activate.
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN,

  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

  enabled: Boolean(process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN),

  environment: process.env.VERCEL_ENV || process.env.NODE_ENV || 'development',
  release: process.env.VERCEL_GIT_COMMIT_SHA,
});
