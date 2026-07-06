import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { pushTokens } from '@/lib/db/schema';
import { and, eq } from 'drizzle-orm';

const PLATFORMS = ['ios', 'android'] as const;

// POST /api/mobile/devices — register (or refresh) an Expo push token for the
// authenticated user's device. Upserts on the token so re-registration after
// app restart just bumps lastSeenAt / re-parents the token to the current user.
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.orgId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: { token?: unknown; platform?: unknown; deviceName?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const token = typeof body.token === 'string' ? body.token.trim() : '';
  const platform = typeof body.platform === 'string' ? body.platform : '';
  const deviceName =
    typeof body.deviceName === 'string' ? body.deviceName.slice(0, 200) : null;

  if (!token || token.length > 4096) {
    return NextResponse.json({ error: 'token is required' }, { status: 400 });
  }
  if (!(PLATFORMS as readonly string[]).includes(platform)) {
    return NextResponse.json(
      { error: `platform must be one of: ${PLATFORMS.join(', ')}` },
      { status: 400 }
    );
  }

  const [row] = await db
    .insert(pushTokens)
    .values({
      userId: session.user.id,
      orgId: session.user.orgId,
      token,
      platform,
      deviceName,
    })
    .onConflictDoUpdate({
      target: pushTokens.token,
      set: {
        userId: session.user.id,
        orgId: session.user.orgId,
        platform,
        deviceName,
        lastSeenAt: new Date(),
      },
    })
    .returning({ id: pushTokens.id });

  return NextResponse.json({ id: row.id }, { status: 201 });
}

// DELETE /api/mobile/devices — unregister a push token (logout / notifications off).
export async function DELETE(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: { token?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const token = typeof body.token === 'string' ? body.token.trim() : '';
  if (!token) {
    return NextResponse.json({ error: 'token is required' }, { status: 400 });
  }

  await db
    .delete(pushTokens)
    .where(and(eq(pushTokens.token, token), eq(pushTokens.userId, session.user.id)));

  return NextResponse.json({ ok: true });
}
