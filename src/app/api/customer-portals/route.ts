import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { customerPortals, shipments } from '@/lib/db/schema';
import { and, eq, sql } from 'drizzle-orm';
import {
  generatePortalToken,
  isValidCustomerCode,
  normalizeCustomerCode,
} from '@/lib/portal/customer-portal';

export const runtime = 'nodejs';

/**
 * GET /api/customer-portals — the org's share links, plus every customer code
 * seen on its board so the UI can offer "create a portal for C" without the
 * operator having to remember which codes exist (AI-12022).
 */
export async function GET() {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { orgId } = session.user;

  try {
    const [portals, codes] = await Promise.all([
      db
        .select()
        .from(customerPortals)
        .where(eq(customerPortals.orgId, orgId))
        .orderBy(customerPortals.customerCode),
      db
        .select({
          code: sql<string>`upper(trim(${shipments.importMeta} ->> 'customerCode'))`.as('code'),
          shipmentCount: sql<number>`count(*)::int`.as('shipment_count'),
        })
        .from(shipments)
        .where(
          and(
            eq(shipments.orgId, orgId),
            sql`nullif(trim(${shipments.importMeta} ->> 'customerCode'), '') is not null`
          )
        )
        .groupBy(sql`upper(trim(${shipments.importMeta} ->> 'customerCode'))`),
    ]);

    return NextResponse.json({ portals, customerCodes: codes });
  } catch (error) {
    console.error('Failed to list customer portals:', error);
    return NextResponse.json({ error: 'Failed to list customer portals' }, { status: 500 });
  }
}

/**
 * POST /api/customer-portals — mint a share link for one customer code.
 *
 * Idempotent by (org, customerCode): asking twice returns the existing portal
 * rather than a second live token, because two links to one customer means
 * revoking one and still leaking through the other.
 */
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { orgId, id: userId } = session.user;

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  if (!isValidCustomerCode(body.customerCode)) {
    return NextResponse.json(
      { error: 'customerCode is required (1-50 characters)' },
      { status: 400 }
    );
  }
  const customerCode = normalizeCustomerCode(body.customerCode);

  const rawLabel = typeof body.label === 'string' ? body.label.trim() : '';
  if (rawLabel.length > 200) {
    return NextResponse.json({ error: 'label must be 200 characters or fewer' }, { status: 400 });
  }
  const label = rawLabel || `Customer ${customerCode}`;

  try {
    const [existing] = await db
      .select()
      .from(customerPortals)
      .where(
        and(eq(customerPortals.orgId, orgId), eq(customerPortals.customerCode, customerCode))
      )
      .limit(1);

    if (existing) {
      return NextResponse.json({ portal: existing, created: false });
    }

    const [portal] = await db
      .insert(customerPortals)
      .values({
        orgId,
        customerCode,
        label,
        token: generatePortalToken(),
        createdBy: userId,
      })
      .returning();

    return NextResponse.json({ portal, created: true }, { status: 201 });
  } catch (error) {
    console.error('Failed to create customer portal:', error);
    return NextResponse.json({ error: 'Failed to create customer portal' }, { status: 500 });
  }
}
