import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe/config';
import { db } from '@/lib/db';
import { organizations } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import type Stripe from 'stripe';

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    event = getStripe().webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      const orgId = session.metadata?.orgId;
      const plan = session.metadata?.plan;

      if (orgId && plan) {
        await db
          .update(organizations)
          .set({
            stripeCustomerId: session.customer as string,
            stripeSubscriptionId: session.subscription as string,
            plan: plan as any,
          })
          .where(eq(organizations.id, orgId));
      }
      break;
    }

    case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription;
      // Handle plan changes, cancellations, etc.
      if (subscription.metadata?.orgId) {
        await db
          .update(organizations)
          .set({
            stripeSubscriptionId: subscription.id,
          })
          .where(eq(organizations.id, subscription.metadata.orgId));
      }
      break;
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription;
      if (subscription.metadata?.orgId) {
        await db
          .update(organizations)
          .set({
            plan: 'starter',
            stripeSubscriptionId: null,
          })
          .where(eq(organizations.id, subscription.metadata.orgId));
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}
