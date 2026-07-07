/**
 * Terminal49 Webhook Receiver — POST /api/webhooks/terminal49
 *
 * AI-12010: Receives container tracking webhooks from Terminal49, normalizes
 * events to DCSA format, stores them, and detects ETA changes.
 *
 * Setup instructions for Terminal49:
 *   1. Configure your webhook URL in Terminal49 dashboard to:
 *      https://[your-domain]/api/webhooks/terminal49
 *   2. Set TERMINAL49_WEBHOOK_SECRET to the signing secret from Terminal49
 *   3. Set TERMINAL49_API_KEY for outbound API calls (optional, for sync)
 *
 * Terminal49 webhook types handled:
 *   - tracking.created: A new container is being tracked
 *   - tracking.updated: An existing container has a new event
 *   - tracking.eta_updated: ETA has changed for a tracked container
 *
 * Response format: { ok: boolean, webhookId?: string, eventsCreated?: number }
 *
 * Security: HMAC-SHA256 signature verification via X-T49-Signature header.
 * When TERMINAL49_WEBHOOK_SECRET is not set, verification is skipped.
 */

import { NextResponse } from "next/server";
import { handleTerminal49Webhook, validateRequest } from "@/lib/terminal49/handler";

export async function POST(request: Request): Promise<NextResponse> {
  // 1. Validate the request
  const validation = await validateRequest(request);
  if (!validation.valid) {
    return NextResponse.json(
      { ok: false, error: validation.error },
      { status: validation.status ?? 400 },
    );
  }

  // 2. Parse the body
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid JSON body" },
      { status: 400 },
    );
  }

  // 3. Extract webhook metadata from Terminal49 payload
  const t49EventId = (body.event_id as string | undefined) ?? undefined;
  const t49EventType = (body.event_type as string | undefined) ?? "tracking.updated";

  // 4. Process the webhook
  const result = await handleTerminal49Webhook(t49EventId, t49EventType, body);

  // 5. Return response
  return NextResponse.json({
    ok: result.errors.length === 0,
    webhookId: result.webhookId,
    eventsCreated: result.eventsCreated,
    alertsCreated: result.alertsCreated,
    errors: result.errors.length > 0 ? result.errors : undefined,
  });
}
