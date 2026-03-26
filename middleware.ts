export { auth as middleware } from './auth';

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/calculators/:path*',
    '/shipments/:path*',
    '/routes/:path*',
    '/ftz/:path*',
    '/ai/:path*',
    '/compliance/:path*',
    '/documents/:path*',
    '/knowledge/:path*',
    '/settings/:path*',
  ],
};
