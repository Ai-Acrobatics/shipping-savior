import { NextResponse } from 'next/server';
import { eq, desc } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { documentExtractions } from '@/lib/db/schema';

// GET /api/documents — list all document extractions for the user's org
export async function GET() {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { orgId } = session.user;

  try {
    const rows = await db
      .select()
      .from(documentExtractions)
      .where(eq(documentExtractions.orgId, orgId))
      .orderBy(desc(documentExtractions.createdAt));

    return NextResponse.json({ extractions: rows });
  } catch (error) {
    console.error('Failed to fetch documents:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
