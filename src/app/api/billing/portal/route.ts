import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { organizations } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { stripe } from '@/lib/stripe/server';

/**
 * POST /api/billing/portal (AI-8777)
 *
 * Returns the URL for a Stripe Customer Portal session, scoped to the caller's
 * organization. Caller redirects via window.location.assign(url).
 *
 * 401 if not signed in. 400 if the org has never had a Stripe customer
 * created (i.e., never went through checkout). 500 on Stripe error.
 */
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const orgId = session.user.orgId;
  if (!orgId) {
    return NextResponse.json({ error: 'No organization on session' }, { status: 400 });
  }

  const [org] = await db
    .select()
    .from(organizations)
    .where(eq(organizations.id, orgId))
    .limit(1);

  if (!org) {
    return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
  }

  if (!org.stripeCustomerId) {
    return NextResponse.json(
      { error: 'No active billing relationship — start a checkout first.' },
      { status: 400 }
    );
  }

  const origin =
    request.headers.get('origin') ??
    process.env.AUTH_URL ??
    'https://shipping-savior.vercel.app';

  try {
    const portal = await stripe.billingPortal.sessions.create({
      customer: org.stripeCustomerId,
      return_url: `${origin}/platform/billing`,
    });

    return NextResponse.json({ url: portal.url });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[billing/portal] Stripe error:', error);
    const message = error instanceof Error ? error.message : 'Portal session failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
