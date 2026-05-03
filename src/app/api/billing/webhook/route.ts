import { NextRequest, NextResponse } from 'next/server';
import type Stripe from 'stripe';
import { stripe, planFromPriceId } from '@/lib/stripe/server';
import { db } from '@/lib/db';
import { organizations } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

/**
 * POST /api/billing/webhook (AI-8777)
 *
 * Stripe webhook handler. Verifies the signature using STRIPE_WEBHOOK_SECRET,
 * then updates organizations rows in response to subscription lifecycle events.
 *
 * Handled events:
 *   - checkout.session.completed         → set stripe_subscription_id + plan
 *   - customer.subscription.updated      → status, current_period_end, plan
 *   - customer.subscription.deleted      → status='canceled', plan='free'
 *   - invoice.payment_failed             → status='past_due'
 *
 * NOTE: this route MUST receive the raw request body for signature verification.
 * Next.js App Router gives us `request.text()` which preserves bytes.
 */

// Disable body parsing — we need the raw text for signature verification.
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function envOrThrow(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`${name} is not set`);
  return v;
}

export async function POST(request: NextRequest) {
  const signature = request.headers.get('stripe-signature');
  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 });
  }

  let webhookSecret: string;
  try {
    webhookSecret = envOrThrow('STRIPE_WEBHOOK_SECRET');
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('[billing/webhook] STRIPE_WEBHOOK_SECRET not configured');
    return NextResponse.json({ error: 'Server billing not configured' }, { status: 500 });
  }

  const rawBody = await request.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'unknown';
    // eslint-disable-next-line no-console
    console.warn('[billing/webhook] Signature verification failed:', message);
    return NextResponse.json({ error: `Invalid signature: ${message}` }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const sess = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(sess);
        break;
      }
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription;
        await handleSubscriptionChange(sub);
        break;
      }
      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(sub);
        break;
      }
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentFailed(invoice);
        break;
      }
      default: {
        // Acknowledge unhandled events with 200 — Stripe will stop retrying.
        // eslint-disable-next-line no-console
        console.log('[billing/webhook] Unhandled event type:', event.type);
      }
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[billing/webhook] Handler error for event', event.type, err);
    // 500 → Stripe will retry. That's the safe default for transient DB issues.
    return NextResponse.json({ error: 'Handler failed' }, { status: 500 });
  }
}

/* ─────────── Event handlers ─────────── */

async function handleCheckoutCompleted(sess: Stripe.Checkout.Session): Promise<void> {
  const orgId = sess.client_reference_id ?? (sess.metadata?.org_id as string | undefined);
  if (!orgId) {
    // eslint-disable-next-line no-console
    console.warn('[billing/webhook] checkout.session.completed without org_id');
    return;
  }

  const subscriptionId =
    typeof sess.subscription === 'string' ? sess.subscription : sess.subscription?.id ?? null;

  // Pull the full subscription so we get the price + period end in one place.
  if (!subscriptionId) {
    // eslint-disable-next-line no-console
    console.warn('[billing/webhook] checkout.session.completed without subscription id');
    return;
  }

  const sub = await stripe.subscriptions.retrieve(subscriptionId);
  await applySubscriptionToOrg(orgId, sub);
}

async function handleSubscriptionChange(sub: Stripe.Subscription): Promise<void> {
  const orgId = await resolveOrgIdFromSubscription(sub);
  if (!orgId) return;
  await applySubscriptionToOrg(orgId, sub);
}

async function handleSubscriptionDeleted(sub: Stripe.Subscription): Promise<void> {
  const orgId = await resolveOrgIdFromSubscription(sub);
  if (!orgId) return;

  await db
    .update(organizations)
    .set({
      planTier: 'free',
      plan: 'free',
      subscriptionStatus: 'canceled',
      stripeSubscriptionId: null,
      stripePriceId: null,
      currentPeriodEnd: null,
      updatedAt: new Date(),
    })
    .where(eq(organizations.id, orgId));
}

async function handlePaymentFailed(invoice: Stripe.Invoice): Promise<void> {
  // `subscription` was renamed to `parent.subscription_details.subscription` in
  // newer Stripe API versions. Both shapes are tolerated here.
  const subscriptionId =
    (invoice as unknown as { subscription?: string | { id: string } | null }).subscription &&
    (typeof (invoice as unknown as { subscription?: string | { id: string } }).subscription === 'string'
      ? ((invoice as unknown as { subscription: string }).subscription)
      : ((invoice as unknown as { subscription: { id: string } }).subscription?.id));

  if (!subscriptionId) return;

  const sub = await stripe.subscriptions.retrieve(subscriptionId);
  const orgId = await resolveOrgIdFromSubscription(sub);
  if (!orgId) return;

  await db
    .update(organizations)
    .set({
      subscriptionStatus: 'past_due',
      updatedAt: new Date(),
    })
    .where(eq(organizations.id, orgId));
}

/* ─────────── Helpers ─────────── */

async function resolveOrgIdFromSubscription(sub: Stripe.Subscription): Promise<string | null> {
  // Prefer subscription metadata (set at checkout). Fall back to a customer-id lookup.
  const fromMeta = sub.metadata?.org_id;
  if (fromMeta) return fromMeta;

  const customerId = typeof sub.customer === 'string' ? sub.customer : sub.customer.id;
  const [org] = await db
    .select({ id: organizations.id })
    .from(organizations)
    .where(eq(organizations.stripeCustomerId, customerId))
    .limit(1);

  return org?.id ?? null;
}

async function applySubscriptionToOrg(orgId: string, sub: Stripe.Subscription): Promise<void> {
  const item = sub.items.data[0];
  const priceId = item?.price?.id ?? null;
  const planTier = planFromPriceId(priceId) ?? 'free';

  // `current_period_end` lives on the subscription item in newer API versions
  // and on the subscription itself in older ones. Read both for safety.
  const periodEndUnix =
    item?.current_period_end ??
    (sub as unknown as { current_period_end?: number }).current_period_end ??
    null;

  const periodEnd = periodEndUnix ? new Date(periodEndUnix * 1000) : null;

  await db
    .update(organizations)
    .set({
      planTier,
      plan: planTier, // keep legacy varchar in sync
      stripeSubscriptionId: sub.id,
      stripePriceId: priceId,
      subscriptionStatus: sub.status as
        | 'active'
        | 'past_due'
        | 'canceled'
        | 'trialing'
        | 'incomplete'
        | 'incomplete_expired'
        | 'unpaid'
        | 'paused',
      currentPeriodEnd: periodEnd,
      updatedAt: new Date(),
    })
    .where(eq(organizations.id, orgId));
}
