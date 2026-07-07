/**
 * Terminal49 Webhook Handler
 *
 * AI-12010: Processes inbound Terminal49 webhooks:
 * 1. Stores the raw payload in `terminal49_webhooks` (audit trail)
 * 2. Normalizes Terminal49 events to DCSA format
 * 3. Inserts normalized events into `shipment_events`
 * 4. Detects ETA changes and creates alerts
 * 5. Links events to the matching shipment (if identifiable by container)
 *
 * Idempotent: deduplication by `sourceEventId` (unique index on DB).
 * Signature verification: Terminal49 sends an `X-T49-Signature` header
 * (HMAC-SHA256 of the body, keyed by the webhook signing secret).
 */

import { headers } from "next/headers";
import { insertTerminal49Webhook, bulkInsertShipmentEvents, markWebhookProcessed } from "./queries";
import { extractEventsFromWebhook } from "./normalize";
import { detectEtaChange } from "./alerts";
import { insertEtaChangeAlert } from "./queries";
import type { NewTerminal49Webhook } from "@/lib/db/schema";

// ── Configuration ─────────────────────────────────────
//
// Set TERMINAL49_WEBHOOK_SECRET in environment to enable webhook signature
// verification. Without it, verification is skipped (not recommended for prod).

function getWebhookSecret(): string | null {
  return process.env.TERMINAL49_WEBHOOK_SECRET ?? null;
}

function getApiKey(): string | null {
  return process.env.TERMINAL49_API_KEY ?? null;
}

// ── Signature Verification ────────────────────────────
//
// Terminal49 signs webhooks with HMAC-SHA256. The signature is sent in the
// `X-T49-Signature` header as a hex string.

function verifySignature(
  body: string,
  signatureHeader: string | null,
  secret: string,
): boolean {
  if (!signatureHeader) return false;
  const crypto = require("crypto");
  const expected = crypto
    .createHmac("sha256", secret)
    .update(body)
    .digest("hex");
  // Timing-safe comparison
  if (expected.length !== signatureHeader.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) {
    diff |= expected.charCodeAt(i) ^ signatureHeader.charCodeAt(i);
  }
  return diff === 0;
}

// ── Request Validation ────────────────────────────────

export interface ValidationResult {
  valid: boolean;
  status?: number;
  error?: string;
}

/**
 * Validate an incoming Terminal49 webhook request.
 */
export async function validateRequest(
  request: Request,
): Promise<ValidationResult> {
  // 1. Check request method
  if (request.method !== "POST") {
    return { valid: false, status: 405, error: "Method not allowed" };
  }

  // 2. Check content type
  const ct = request.headers.get("content-type");
  if (!ct?.includes("application/json")) {
    return { valid: false, status: 415, error: "Expected application/json" };
  }

  // 3. Verify signature (if secret is configured)
  const secret = getWebhookSecret();
  if (secret) {
    const bodyText = await request.clone().text();
    const signature = request.headers.get("x-t49-signature");
    if (!verifySignature(bodyText, signature, secret)) {
      return { valid: false, status: 401, error: "Invalid signature" };
    }
  }

  return { valid: true };
}

// ── Main Handler ──────────────────────────────────────

export interface WebhookResult {
  webhookId: string;
  eventsCreated: number;
  alertsCreated: number;
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
    // 2. Normalize events
    const normalized = extractEventsFromWebhook(t49EventType, rawPayload);

    if (normalized.length === 0) {
      await markWebhookProcessed(saved.id);
      return {
        webhookId: saved.id,
        eventsCreated: 0,
        alertsCreated: 0,
        errors: ["No container events found in payload"],
      };
    }

    // Link events to webhook
    const eventsWithWebhook = normalized.map((ev) => ({
      ...ev,
      webhookId: saved.id,
    }));

    // 3. Insert normalized events (dedup by sourceEventId via unique index)
    const inserted = await bulkInsertShipmentEvents(eventsWithWebhook);
    eventsCreated = inserted.length;

    // 4. Detect ETA changes and create alerts
    for (const event of inserted) {
      const alert = await detectEtaChange(event);
      if (alert) {
        await insertEtaChangeAlert(alert);
        alertsCreated++;
      }
    }

    // 5. Mark webhook processed
    await markWebhookProcessed(saved.id);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    errors.push(msg);
    await markWebhookProcessed(saved.id, msg);
  }

  return {
    webhookId: saved.id,
    eventsCreated,
    alertsCreated,
    errors,
  };
}

// ── Exported config for docs/info ─────────────────────

export const CONFIG = {
  webhookSecret: !!getWebhookSecret(),
  apiKey: !!getApiKey(),
};
