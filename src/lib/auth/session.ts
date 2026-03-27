import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';

/**
 * Get the current session. Returns null if not authenticated.
 */
export async function getSession() {
  return auth();
}

/**
 * Require authentication. Redirects to /login if not authenticated.
 * Returns the session (guaranteed non-null).
 */
export async function requireAuth() {
  const session = await auth();
  if (!session?.user) {
    redirect('/login');
  }
  return session;
}

/**
 * Require authentication with a valid orgId.
 * Throws if the user has no org membership (shouldn't happen in normal flow).
 */
export async function requireOrg() {
  const session = await requireAuth();
  if (!session.user.orgId) {
    throw new Error('User has no organization. Please contact support.');
  }
  return session;
}
