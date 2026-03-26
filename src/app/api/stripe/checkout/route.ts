import { NextRequest, NextResponse } from 'next/server';
import { auth } from '../../../../../auth';
import { getStripe, PLANS, PlanKey } from '@/lib/stripe/config';

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { plan } = await req.json();

    if (!plan || !(plan in PLANS)) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
    }

    const selectedPlan = PLANS[plan as PlanKey];

    const checkoutSession = await getStripe().checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Shipping Savior ${selectedPlan.name}`,
              description: `Monthly subscription to Shipping Savior ${selectedPlan.name} plan`,
            },
            unit_amount: selectedPlan.price,
            recurring: { interval: 'month' },
          },
          quantity: 1,
        },
      ],
      customer_email: session.user.email!,
      metadata: {
        userId: (session.user as any).id,
        orgId: (session.user as any).orgId,
        plan,
      },
      success_url: `${process.env.NEXTAUTH_URL}/(platform)/settings?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXTAUTH_URL}/(platform)/settings`,
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
