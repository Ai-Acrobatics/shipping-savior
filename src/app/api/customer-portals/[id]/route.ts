import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { customerPortals } from '@/lib/db/schema';
import { and, eq } from 'drizzle-orm';
import { generatePortalToken } from '@/lib/portal/customer-portal';

export const runtime = 'nodejs';

/**
 * PATCH /api/customer-portals/[id] — rename, enable/disable, or rotate the
 * token (AI-12022).
 *
 * Rotation exists because a share link forwarded to the wrong inbox cannot be
 * un-sent: minting a new token is the only real revocation for a URL that has
 * already left the building. `enabled: false` is the softer stop.
 *
 * Cross-org access returns 404, not 403, so portal existence never leaks.
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { id } = await params;
  const { orgId } = session.user;

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const updates: Record<string, unknown> = {};

  if ('label' in body) {
    const label = body.label;
    if (typeof label !== 'string' || !label.trim().length) {
      return NextResponse.json({ error: 'label must be a non-empty string' }, { status: 400 });
    }
    if (label.trim().length > 200) {
      return NextResponse.json({ error: 'label must be 200 characters or fewer' }, { status: 400 });
    }
    updates.label = label.trim();
  }

  if ('enabled' in body) {
    if (typeof body.enabled !== 'boolean') {
      return NextResponse.json({ error: 'enabled must be a boolean' }, { status: 400 });
    }
    updates.enabled = body.enabled;
  }

  if (body.rotateToken === true) {
    updates.token = generatePortalToken();
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'Nothing to update' }, { status: 400 });
  }

  try {
    const [portal] = await db
      .update(customerPortals)
      .set({ ...updates, updatedAt: new Date() })
      .where(and(eq(customerPortals.id, id), eq(customerPortals.orgId, orgId)))
      .returning();

    if (!portal) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    return NextResponse.json({ portal });
  } catch (error) {
    console.error('Failed to update customer portal:', error);
    return NextResponse.json({ error: 'Failed to update customer portal' }, { status: 500 });
  }
}

/** DELETE /api/customer-portals/[id] — permanently drop the link. */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { id } = await params;

  try {
    const [deleted] = await db
      .delete(customerPortals)
      .where(and(eq(customerPortals.id, id), eq(customerPortals.orgId, session.user.orgId)))
      .returning({ id: customerPortals.id });

    if (!deleted) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete customer portal:', error);
    return NextResponse.json({ error: 'Failed to delete customer portal' }, { status: 500 });
  }
}
