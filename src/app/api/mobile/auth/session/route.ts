import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

// GET /api/mobile/auth/session — validate the mobile session token.
// The client sends its stored token as the session cookie; a 200 means the
// token is still good, a 401 means the app should return to the login screen.
export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return NextResponse.json({
    user: {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
      orgId: session.user.orgId ?? null,
      role: session.user.role ?? 'member',
    },
  });
}
