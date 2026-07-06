// Helpers for the native mobile app's token auth (see /api/mobile/*).

// The salt for Auth.js JWT encryption is the session cookie name, which
// depends on whether the deployment is behind HTTPS (Vercel prod) or not
// (local dev). The mobile client sends the token back as this cookie so
// every existing auth()-gated API route works unchanged.
export function sessionCookieName(): string {
  const url = process.env.AUTH_URL ?? process.env.NEXT_PUBLIC_APP_URL ?? '';
  const secure =
    url.trim().startsWith('https://') || process.env.NODE_ENV === 'production';
  return secure ? '__Secure-authjs.session-token' : 'authjs.session-token';
}

export const MOBILE_SESSION_MAX_AGE = 30 * 24 * 60 * 60; // 30 days, matches web
