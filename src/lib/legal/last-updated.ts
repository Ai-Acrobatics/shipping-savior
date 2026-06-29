// Single source of truth for the "Last updated" date displayed on /privacy,
// /terms, /sub-processors, /security, /dpa. Bump this whenever those documents
// are materially changed.
//
// Format: ISO 8601 (YYYY-MM-DD).
export const LEGAL_LAST_UPDATED = '2026-04-27';

export const LEGAL_CONTACTS = {
  // TODO: review — these inboxes need real routing wired up via AI-8784
  // (support routing). Until then, fall back to julian@aiacrobatics.com.
  privacy: 'privacy@shippingsavior.com',
  security: 'security@shippingsavior.com',
  sales: 'sales@shippingsavior.com',
  fallback: 'julian@aiacrobatics.com',
} as const;
