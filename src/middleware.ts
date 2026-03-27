import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';

export default auth((req) => {
  const isAuthenticated = !!req.auth;
  const isAuthPage =
    req.nextUrl.pathname.startsWith('/login') ||
    req.nextUrl.pathname.startsWith('/register');
  const isInvitePage = req.nextUrl.pathname.startsWith('/invite');
  const isPlatformRoute = req.nextUrl.pathname.startsWith('/platform');

  // Unauthenticated user hitting /platform/* → redirect to /login
  if (isPlatformRoute && !isAuthenticated) {
    return NextResponse.redirect(new URL('/login', req.url));
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

  // Invite pages are public (no redirect) — auth is optional
  if (isInvitePage) {
    return NextResponse.next();
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/platform/:path*', '/login', '/register', '/invite/:path*'],
};
