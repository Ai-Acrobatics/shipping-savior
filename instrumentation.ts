// Next.js 14+ instrumentation entry point.
// Loads the appropriate Sentry config for the current runtime (Node.js or Edge).
// See: https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('./sentry.server.config');
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('./sentry.edge.config');
  }
}

// Re-export Sentry's request error capture so server-side route handlers + RSC
// errors propagate to Sentry automatically.
export { captureRequestError as onRequestError } from '@sentry/nextjs';
