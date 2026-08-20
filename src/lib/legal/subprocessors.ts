/**
 * Sub-processor register — single source of truth (AI-8780).
 *
 * /privacy, /dpa, and /sub-processors all render from this list. Enterprise
 * procurement reviews ask for a maintained register with a change date, so
 * whenever a vendor is added, removed, or swapped (e.g. Resend → Postmark)
 * update BOTH the entry and `SUBPROCESSORS_LAST_UPDATED` in this file — every
 * public page picks the change up automatically.
 */

export type Subprocessor = {
  /** Legal/product name as the customer would recognize it. */
  name: string;
  /** What the vendor does for us — the processing purpose under GDPR Art. 28. */
  purpose: string;
  /** Where the processing happens. Drives the transfer-mechanism column. */
  location: string;
  /** Categories of personal data the vendor can see. */
  dataCategories: string;
  /** True when the vendor only ever receives data the customer sends us. */
  transferMechanism: 'SCCs' | 'EU hosting available' | 'No personal data';
};

export const SUBPROCESSORS: Subprocessor[] = [
  {
    name: 'Vercel',
    purpose: 'Application hosting, edge network, file storage (uploaded documents)',
    location: 'United States',
    dataCategories: 'Account identifiers, request metadata, uploaded documents',
    transferMechanism: 'SCCs',
  },
  {
    name: 'Supabase / Neon',
    purpose: 'PostgreSQL database hosting',
    location: 'United States',
    dataCategories: 'All customer-submitted platform data',
    transferMechanism: 'SCCs',
  },
  {
    name: 'Stripe',
    purpose: 'Payment processing and subscription billing',
    location: 'United States',
    dataCategories: 'Billing contact, payment metadata (card data never touches our servers)',
    transferMechanism: 'SCCs',
  },
  {
    name: 'Resend',
    purpose: 'Transactional email (verification, password reset, invites)',
    location: 'United States',
    dataCategories: 'Email address, name, message content',
    transferMechanism: 'SCCs',
  },
  {
    name: 'Sentry',
    purpose: 'Error monitoring and diagnostics',
    location: 'United States',
    dataCategories: 'Account identifier, request metadata, stack traces',
    transferMechanism: 'SCCs',
  },
  {
    name: 'PostHog',
    purpose: 'Product analytics (loaded only after analytics consent)',
    location: 'United States / EU',
    dataCategories: 'Pseudonymous usage events, account identifier',
    transferMechanism: 'EU hosting available',
  },
  {
    name: 'Anthropic',
    purpose: 'AI document extraction and assistant features (Claude)',
    location: 'United States',
    dataCategories: 'Document content and prompts you submit to AI features',
    transferMechanism: 'SCCs',
  },
  {
    name: 'Google',
    purpose: 'OAuth sign-in; AI document extraction fallback (Gemini)',
    location: 'United States',
    dataCategories: 'Email address, profile name, document content sent to AI fallback',
    transferMechanism: 'SCCs',
  },
  {
    name: 'GitHub',
    purpose: 'OAuth sign-in',
    location: 'United States',
    dataCategories: 'Email address, profile name',
    transferMechanism: 'SCCs',
  },
  {
    name: 'Moonshot AI',
    purpose: 'AI document extraction fallback (Kimi)',
    location: 'International',
    dataCategories: 'Document content submitted to AI extraction',
    transferMechanism: 'SCCs',
  },
];

/** Shown on every page that renders the register. Update when the list changes. */
export const SUBPROCESSORS_LAST_UPDATED = 'August 20, 2026';

/**
 * Legacy tuple shape used by the original /privacy and /dpa tables
 * ([name, purpose, location]). Kept so those pages render identically while
 * reading from the SSOT.
 */
export const SUBPROCESSOR_ROWS: [string, string, string][] = SUBPROCESSORS.map(
  (s) => [s.name, s.purpose, s.location]
);
