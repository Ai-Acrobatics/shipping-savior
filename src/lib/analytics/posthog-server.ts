/**
 * Server-side PostHog wrapper for capturing events from API routes / RSC.
 *
 * - No-op when NEXT_PUBLIC_POSTHOG_KEY is unset.
 * - Server-side capture does NOT go through cookie consent — only call this from
 *   API routes for events the user has explicitly initiated (e.g. POST /api/contact).
 *   Do NOT use this to bypass consent for passive/page tracking.
 */

import { PostHog } from "posthog-node";

let serverInstance: PostHog | null = null;

function getKey(): string | null {
  return (
    process.env.POSTHOG_KEY ||
    process.env.NEXT_PUBLIC_POSTHOG_KEY ||
    null
  );
}

function getHost(): string {
  return (
    process.env.POSTHOG_HOST ||
    process.env.NEXT_PUBLIC_POSTHOG_HOST ||
    "https://us.i.posthog.com"
  );
}

function getServer(): PostHog | null {
  if (serverInstance) return serverInstance;
  const key = getKey();
  if (!key) return null;
  serverInstance = new PostHog(key, {
    host: getHost(),
    flushAt: 1, // flush immediately for serverless
    flushInterval: 0,
  });
  return serverInstance;
}

export async function captureServerEvent(params: {
  distinctId: string;
  event: string;
  properties?: Record<string, unknown>;
}): Promise<void> {
  const ph = getServer();
  if (!ph) return;
  try {
    ph.capture({
      distinctId: params.distinctId,
      event: params.event,
      properties: params.properties,
    });
    // serverless safety: explicit flush
    await ph.flush();
  } catch {
    // never throw from analytics
  }
}

/**
 * Call from a graceful-shutdown hook in long-lived processes.
 * In Next.js serverless this is rarely needed because flushAt:1 forces inline flush.
 */
export async function shutdownPostHog(): Promise<void> {
  if (!serverInstance) return;
  try {
    await serverInstance.shutdown();
  } catch {
    // swallow
  }
}
