import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { organizations, users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { stripe } from '@/lib/stripe/server';

/**
 * POST /api/billing/checkout (AI-8777)
 *
 * Body: { priceId: string }
 *
 * Creates (or reuses) a Stripe Customer for the caller's organization, then
 * creates a Checkout Session in `subscription` mode and returns the hosted URL.
 *
 * The caller redirects to `url`. Stripe redirects back to /platform/billing on
 * success and /pricing on cancel. The actual subscription state is written to the
 * DB by the webhook handler (/api/billing/webhook), not here — this route is
 * pure intent capture.
 */
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: { priceId?: string; plan?: string };
  try {
    body = (await request.json()) as { priceId?: string; plan?: string };
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  // Accept either a literal Stripe price ID OR a plan slug (preferred for browser
  // callers — keeps the price ID out of public env vars). Map slug → env price.
  let priceId = body.priceId?.trim();
  if (!priceId || priceId === 'PREMIUM_MONTHLY' || body.plan === 'premium') {
    priceId = process.env.STRIPE_PRICE_PREMIUM_MONTHLY;
  } else if (priceId === 'ENTERPRISE_MONTHLY' || body.plan === 'enterprise') {
    priceId = process.env.STRIPE_PRICE_ENTERPRISE_MONTHLY;
  }
  if (!priceId) {
    return NextResponse.json(
      { error: 'No priceId — set STRIPE_PRICE_PREMIUM_MONTHLY (or pass priceId).' },
      { status: 400 }
    );
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
      return NextResponse.json(
        { error: 'Stripe did not return a checkout URL' },
        { status: 502 }
      );
    }

    return NextResponse.json({ url: checkout.url });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[billing/checkout] Stripe error:', error);
    const message = error instanceof Error ? error.message : 'Checkout failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
