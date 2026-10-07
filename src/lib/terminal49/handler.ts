/**
 * Terminal49 Webhook Handler
 *
 * AI-12010: Processes inbound Terminal49 webhooks:
 * 1. Stores the raw payload in `terminal49_webhooks` (audit trail)
 * 2. Normalizes Terminal49 events to DCSA format
 * 3. Inserts normalized events into `shipment_events`
 * 4. Links events to the matching shipment (by container number)
 * 5. Detects ETA changes, creates alerts and updates the shipment's ETA
 *
 * Idempotent: a notification id that was already processed successfully is
 * acknowledged without re-processing, and events are deduplicated by
 * `sourceEventId` (unique index).
 *
 * Signature verification: Terminal49 sends `X-T49-Webhook-Signature`, a hex
 * HMAC-SHA256 of the raw request body keyed by the webhook secret.
 */

import { createHmac, timingSafeEqual } from "crypto";
import {
  insertTerminal49Webhook,
  bulkInsertShipmentEvents,
  markWebhookProcessed,
  findProcessedWebhook,
  insertEtaChangeAlert,
} from "./queries";
import { extractEventsFromWebhook } from "./normalize";
import { detectEtaChange, linkContainerToShipment } from "./alerts";
import type { NewTerminal49Webhook } from "@/lib/db/schema";

// ── Configuration ─────────────────────────────────────

function getWebhookSecret(): string | null {
  return process.env.TERMINAL49_WEBHOOK_SECRET || null;
}

function getApiKey(): string | null {
  return process.env.TERMINAL49_API_KEY || null;
}

// ── Signature Verification ────────────────────────────

export const SIGNATURE_HEADERS = ["x-t49-webhook-signature", "x-t49-signature"] as const;

export function computeSignature(body: string, secret: string): string {
  return createHmac("sha256", secret).update(body).digest("hex");
}

export function verifySignature(
  body: string,
  signatureHeader: string | null,
  secret: string,
): boolean {
  if (!signatureHeader) return false;
  const expected = Buffer.from(computeSignature(body, secret), "utf8");
  const given = Buffer.from(signatureHeader.trim().toLowerCase(), "utf8");
  if (expected.length !== given.length) return false;
  return timingSafeEqual(expected, given);
}

// ── Request Validation ────────────────────────────────

export interface ValidationResult {
  valid: boolean;
  status?: number;
  error?: string;
}

/**
 * Validate an incoming Terminal49 webhook given its raw body.
 *
 * Fails closed: in production a missing TERMINAL49_WEBHOOK_SECRET rejects
 * every request (503) rather than accepting unsigned payloads. Outside
 * production an unset secret skips verification for local testing.
 */
export function validateRequest(
  headers: Headers,
  rawBody: string,
  env: { secret?: string | null; nodeEnv?: string } = {},
): ValidationResult {
  const ct = headers.get("content-type");
  if (!ct?.includes("application/json")) {
    return { valid: false, status: 415, error: "Expected application/json" };
  }

  const secret = env.secret !== undefined ? env.secret : getWebhookSecret();
  const nodeEnv = env.nodeEnv ?? process.env.NODE_ENV;

  if (!secret) {
    if (nodeEnv === "production") {
      return { valid: false, status: 503, error: "Webhook signing secret not configured" };
    }
    return { valid: true };
  }

  const signature =
    SIGNATURE_HEADERS.map((h) => headers.get(h)).find((v) => !!v) ?? null;
  if (!verifySignature(rawBody, signature, secret)) {
    return { valid: false, status: 401, error: "Invalid signature" };
  }
  return { valid: true };
}

// ── Main Handler ──────────────────────────────────────

export interface WebhookResult {
  webhookId: string;
  eventsCreated: number;
  alertsCreated: number;
  duplicate?: boolean;
  errors: string[];
}

/**
 * Process an inbound Terminal49 webhook.
 */
export async function handleTerminal49Webhook(
  t49EventId: string | undefined,
  t49EventType: string,
  rawPayload: Record<string, unknown>,
): Promise<WebhookResult> {
  // 0. Idempotency — Terminal49 retries deliveries until it gets a 2xx.
  if (t49EventId) {
    const existing = await findProcessedWebhook(t49EventId);
    if (existing) {
      return { webhookId: existing.id, eventsCreated: 0, alertsCreated: 0, duplicate: true, errors: [] };
    }
  }

  const errors: string[] = [];
  let eventsCreated = 0;
  let alertsCreated = 0;

  // 1. Store raw webhook
  const webhook: NewTerminal49Webhook = {
    t49EventId: t49EventId ?? null,
    t49EventType,
    rawPayload,
    processed: false,
  };
  const saved = await insertTerminal49Webhook(webhook);

  try {
    // 2. Normalize events. Notifications without a container milestone
    //    (tracking_request.*, container.updated, ...) are stored and acked.
    const normalized = extractEventsFromWebhook(t49EventType, rawPayload);
    if (normalized.length === 0) {
      await markWebhookProcessed(saved.id);
      return { webhookId: saved.id, eventsCreated: 0, alertsCreated: 0, errors: [] };
    }

    // 3. Link to shipments up front so stored events carry shipment_id
    const shipmentByContainer = new Map<string, string | null>();
    for (const ev of normalized) {
      if (!shipmentByContainer.has(ev.containerNumber)) {
        shipmentByContainer.set(ev.containerNumber, await linkContainerToShipment(ev.containerNumber));
      }
    }

    // 4. Insert normalized events (duplicates skipped via unique index)
    const inserted = await bulkInsertShipmentEvents(
      normalized.map((ev) => ({
        ...ev,
        webhookId: saved.id,
        shipmentId: shipmentByContainer.get(ev.containerNumber) ?? null,
      })),
    );
    eventsCreated = inserted.length;

    // 5. Detect ETA changes and create alerts
    for (const event of inserted) {
      const alert = await detectEtaChange(event);
      if (alert) {
        await insertEtaChangeAlert(alert);
        alertsCreated++;
      }
    }

    await markWebhookProcessed(saved.id);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    errors.push(msg);
    await markWebhookProcessed(saved.id, msg);
  }

  return { webhookId: saved.id, eventsCreated, alertsCreated, errors };
}

// ── Exported config for docs/info ─────────────────────

export function getTerminal49Config() {
  return {
    webhookSecret: !!getWebhookSecret(),
    apiKey: !!getApiKey(),
  };
}
