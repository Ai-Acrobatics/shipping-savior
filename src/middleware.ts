import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';

export default auth((req) => {
  const isAuthenticated = !!req.auth;
  const isAuthPage =
    req.nextUrl.pathname.startsWith('/login') ||
    req.nextUrl.pathname.startsWith('/register');
  const isPlatformRoute = req.nextUrl.pathname.startsWith('/platform');

  // Unauthenticated user hitting /platform/* → redirect to /login
  if (isPlatformRoute && !isAuthenticated) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  // Authenticated user hitting /login or /register → redirect to /platform
  if (isAuthPage && isAuthenticated) {
    return NextResponse.redirect(new URL('/platform', req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/platform/:path*', '/login', '/register'],
};
