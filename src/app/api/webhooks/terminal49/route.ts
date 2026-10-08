/**
 * Terminal49 Webhook Receiver — POST /api/webhooks/terminal49
 *
 * AI-12010: Receives container tracking webhooks from Terminal49, normalizes
 * events to DCSA format, stores them, and detects ETA changes.
 *
 * Setup:
 *   1. In the Terminal49 dashboard, point a webhook at
 *      https://[your-domain]/api/webhooks/terminal49
 *   2. Set TERMINAL49_WEBHOOK_SECRET to that webhook's signing secret
 *      (required in production — requests are rejected with 503 without it)
 *   3. Set TERMINAL49_API_KEY for outbound API calls (optional)
 *
 * Handled events: container.transport.* milestones and
 * *.estimated.* ETA updates. Other notifications (tracking_request.*,
 * container.updated, ...) are stored for audit and acknowledged.
 *
 * Security: HMAC-SHA256 of the raw body, sent in X-T49-Webhook-Signature.
 */

import { NextResponse } from "next/server";
import { handleTerminal49Webhook, validateRequest } from "@/lib/terminal49/handler";
import { parseT49Envelope } from "@/lib/terminal49/normalize";

export const dynamic = "force-dynamic";

export async function POST(request: Request): Promise<NextResponse> {
  // 1. Read the raw body once — the signature is computed over these bytes.
  const rawBody = await request.text();

  // 2. Validate content type + signature
  const validation = validateRequest(request.headers, rawBody);
  if (!validation.valid) {
    return NextResponse.json(
      { ok: false, error: validation.error },
      { status: validation.status ?? 400 },
    );
  }

  // 3. Parse
  let body: Record<string, unknown>;
  try {
    const parsed: unknown = JSON.parse(rawBody);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error();
    body = parsed as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON body" }, { status: 400 });
  }

  // 4. Process
  const { notificationId, event } = parseT49Envelope(body);
  const result = await handleTerminal49Webhook(notificationId, event, body);

  // A processing failure returns 500 so Terminal49 retries the delivery;
  // the raw payload is already stored with its error for inspection.
  const failed = result.errors.length > 0;
  return NextResponse.json(
    {
      ok: !failed,
      webhookId: result.webhookId,
      eventsCreated: result.eventsCreated,
      alertsCreated: result.alertsCreated,
      duplicate: result.duplicate || undefined,
      errors: failed ? result.errors : undefined,
    },
    { status: failed ? 500 : 200 },
  );
}
