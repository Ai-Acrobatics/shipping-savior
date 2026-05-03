import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';

const REQUIRE_EMAIL_VERIFICATION =
  (process.env.REQUIRE_EMAIL_VERIFICATION || 'false').toLowerCase() === 'true';

export default auth((req) => {
  const isAuthenticated = !!req.auth;
  const isAuthPage =
    req.nextUrl.pathname.startsWith('/login') ||
    req.nextUrl.pathname.startsWith('/register');
  const isInvitePage = req.nextUrl.pathname.startsWith('/invite');
  const isPlatformRoute = req.nextUrl.pathname.startsWith('/platform');
  const isVerifyEmailPage = req.nextUrl.pathname.startsWith('/verify-email');

  // Unauthenticated user hitting /platform/* → redirect to /login
  // Preserve the original path + query as callbackUrl so the user lands
  // back on the page they intended after sign-in (AI-9199).
  if (isPlatformRoute && !isAuthenticated) {
    const callbackUrl = req.nextUrl.pathname + req.nextUrl.search;
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('callbackUrl', callbackUrl);
    return NextResponse.redirect(loginUrl);
  }

  // Email-verification gate (opt-in via env). Authenticated users on
  // /platform/* without a verified email are bounced to /verify-email.
  if (
    REQUIRE_EMAIL_VERIFICATION &&
    isPlatformRoute &&
    isAuthenticated &&
    req.auth?.user &&
    !(req.auth.user as { emailVerified?: boolean }).emailVerified
  ) {
    return NextResponse.redirect(new URL('/verify-email', req.url));
  }

  // Authenticated user hitting /login or /register → redirect to /platform
  // UNLESS they have an invite token (let them through to complete the invite flow)
  if (isAuthPage && isAuthenticated) {
    const inviteToken = req.nextUrl.searchParams.get('invite');
    if (inviteToken) {
      return NextResponse.redirect(new URL(`/invite/${inviteToken}`, req.url));
    }
    return NextResponse.redirect(new URL('/platform', req.url));
  }

  // Invite + verify-email pages are public (no redirect)
  if (isInvitePage || isVerifyEmailPage) {
    return NextResponse.next();
  }

  // Forward the original path + query to downstream server components via a
  // request header so a layout-level redirect (defense-in-depth) can also
  // build a correct callbackUrl. Next.js does not expose the pathname to
  // server components otherwise (AI-9199).
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set('x-pathname', req.nextUrl.pathname + req.nextUrl.search);
  return NextResponse.next({ request: { headers: requestHeaders } });
});

export const config = {
  matcher: [
    '/platform/:path*',
    '/login',
    '/register',
    '/invite/:path*',
    '/verify-email',
  ],
};
