import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { organizations, users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import {
  stripe,
  isStripeConfigured,
  resolvePriceId,
  BILLING_UNAVAILABLE_MESSAGE,
  CHECKOUT_FAILED_MESSAGE,
} from '@/lib/stripe/server';

/**
 * POST /api/billing/checkout (AI-8777)
 *
 * Body: { priceId?: string; plan?: string }
 *
 * Creates (or reuses) a Stripe Customer for the caller's organization, then
 * creates a Checkout Session in `subscription` mode and returns the hosted URL.
 *
 * The caller redirects to `url`. Stripe redirects back to /platform/billing on
 * success and /pricing on cancel. The actual subscription state is written to the
 * DB by the webhook handler (/api/billing/webhook), not here — this route is
 * pure intent capture.
 *
 * AI-9859: never surface internal config (env var names, raw Stripe error
 * strings) to the customer. When Stripe isn't configured or a Stripe call fails,
 * we log the detail server-side and return a calm, customer-safe message with the
 * right status so the UI can render "billing unavailable / contact support"
 * instead of a confusing developer error after the customer thinks they paid.
 */
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Billing not wired up (missing STRIPE_SECRET_KEY / price IDs). Short-circuit
  // with a customer-safe 503 rather than calling Stripe with a placeholder key.
  if (!isStripeConfigured()) {
    // eslint-disable-next-line no-console
    console.error(
      '[billing/checkout] Stripe is not configured (STRIPE_SECRET_KEY missing or placeholder) — returning 503.'
    );
    return NextResponse.json({ error: BILLING_UNAVAILABLE_MESSAGE }, { status: 503 });
  }

  let body: { priceId?: string; plan?: string };
  try {
    body = (await request.json()) as { priceId?: string; plan?: string };
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  // Accept either a literal Stripe price ID OR a plan slug (preferred for browser
  // callers — keeps the price ID out of public env vars). Map slug → env price.
  const priceId = resolvePriceId({ priceId: body.priceId, plan: body.plan });
  if (!priceId) {
    // The plan's price ID env var is unset. This is a server misconfiguration,
    // not something the customer did — log the detail, show a safe message.
    // eslint-disable-next-line no-console
    console.error(
      '[billing/checkout] No price ID resolved — set STRIPE_PRICE_PREMIUM_MONTHLY / STRIPE_PRICE_ENTERPRISE_MONTHLY in env.'
    );
    return NextResponse.json({ error: BILLING_UNAVAILABLE_MESSAGE }, { status: 503 });
  }

  const orgId = session.user.orgId;
  if (!orgId) {
    return NextResponse.json(
      { error: 'No organization on session — cannot start checkout.' },
      { status: 400 }
    );
  }

  // Look up the org + user (we need the user's email for the Stripe customer record)
  const [org] = await db
    .select()
    .from(organizations)
    .where(eq(organizations.id, orgId))
    .limit(1);

  if (!org) {
    return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
  }

  const [user] = await db
    .select({ email: users.email, name: users.name })
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1);

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  try {
    // Reuse the org's Stripe customer if one exists, otherwise create + persist.
    let customerId = org.stripeCustomerId ?? null;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: org.name,
        metadata: {
          org_id: orgId,
          user_id: session.user.id,
        },
      });
      customerId = customer.id;
      await db
        .update(organizations)
        .set({ stripeCustomerId: customerId, updatedAt: new Date() })
        .where(eq(organizations.id, orgId));
    }

    // Origin for success/cancel URLs — prefer the request origin so previews + prod
    // redirect back to the same deployment that initiated checkout.
    const origin =
      request.headers.get('origin') ??
      process.env.AUTH_URL ??
      'https://shipping-savior.vercel.app';

    const checkout = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: customerId,
      client_reference_id: orgId,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${origin}/platform/billing?success=1&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/pricing`,
      allow_promotion_codes: true,
      subscription_data: {
        metadata: {
          org_id: orgId,
        },
      },
    });

    if (!checkout.url) {
      // eslint-disable-next-line no-console
      console.error('[billing/checkout] Stripe did not return a checkout URL.');
      return NextResponse.json({ error: CHECKOUT_FAILED_MESSAGE }, { status: 502 });
    }

    return NextResponse.json({ url: checkout.url });
  } catch (error) {
    // Log the real Stripe error for the team; show the customer a safe message.
    // eslint-disable-next-line no-console
    console.error('[billing/checkout] Stripe error:', error);
    return NextResponse.json({ error: CHECKOUT_FAILED_MESSAGE }, { status: 500 });
  }
}
