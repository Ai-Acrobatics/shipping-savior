import Stripe from 'stripe';

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
      apiVersion: '2024-12-18.acacia',
    });
  }
  return _stripe;
}

export const PLANS = {
  starter: {
    name: 'Starter',
    price: 29900, // $299 in cents
    priceId: process.env.STRIPE_STARTER_PRICE_ID || '',
    features: [
      'Landed cost calculator',
      'HTS code lookup',
      'Up to 50 shipments/month',
      'Basic compliance alerts',
      'Email support',
    ],
  },
  professional: {
    name: 'Professional',
    price: 79900, // $799 in cents
    priceId: process.env.STRIPE_PROFESSIONAL_PRICE_ID || '',
    features: [
      'Everything in Starter',
      'Unlimited shipments',
      'FTZ savings analyzer',
      'Route comparison engine',
      'AI classification assistant',
      'Priority support',
    ],
  },
  enterprise: {
    name: 'Enterprise',
    price: 249900, // $2,499 in cents
    priceId: process.env.STRIPE_ENTERPRISE_PRICE_ID || '',
    features: [
      'Everything in Professional',
      'Custom data integrations',
      'Dedicated account manager',
      'White-glove onboarding',
      'SLA guarantee',
      'API access',
    ],
  },
} as const;

export type PlanKey = keyof typeof PLANS;
