import { NextRequest, NextResponse } from 'next/server';
import { eq, and } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { documentExtractions } from '@/lib/db/schema';
import type { DocumentType } from '@/lib/db/schema';

// PATCH /api/documents/[id] — update extracted data, document type, or reviewed status
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { orgId } = session.user;

  let body: {
    extractedData?: unknown;
    documentType?: DocumentType;
    reviewed?: boolean;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const updates: Record<string, unknown> = { updatedAt: new Date() };
  if (body.extractedData !== undefined) updates.extractedData = body.extractedData;
  if (body.documentType !== undefined) updates.documentType = body.documentType;
  if (body.reviewed !== undefined) updates.reviewed = body.reviewed;

  try {
    const [updated] = await db
      .update(documentExtractions)
      .set(updates)
      .where(
        and(
          eq(documentExtractions.id, params.id),
          eq(documentExtractions.orgId, orgId),
        )
      )
      .returning();

    if (!updated) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json({ extraction: updated });
  } catch (error) {
    console.error('Failed to update extraction:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/documents/[id] — delete an extraction record
export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { orgId } = session.user;

  try {
    const [deleted] = await db
      .delete(documentExtractions)
      .where(
        and(
          eq(documentExtractions.id, params.id),
          eq(documentExtractions.orgId, orgId),
        )
      )
      .returning();

    if (!deleted) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete extraction:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
