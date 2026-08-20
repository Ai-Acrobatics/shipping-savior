import { NextRequest, NextResponse } from 'next/server';
import { loadPortalView, recordPortalView } from '@/lib/portal/load';

export const runtime = 'nodejs';
// Never cached: one customer's boxes must never be served to the next token
// that happens to hit the same edge node.
export const dynamic = 'force-dynamic';

/**
 * GET /api/portal/[token] — public, unauthenticated read of one customer's
 * shipments (AI-12022).
 *
 * The token is the whole credential. Everything in the response is built by
 * `toCustomerShipment`'s allowlist, so no internal cost, margin, shipper or
 * importMeta field can reach this body.
 *
 * Unknown and revoked tokens both return 404 — a distinct 403 for "revoked"
 * would confirm the customer relationship to anyone holding a stale URL.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  try {
    const view = await loadPortalView(token);
    if (!view) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    void recordPortalView(token);

    return NextResponse.json(view, {
      headers: { 'Cache-Control': 'no-store, max-age=0' },
    });
  } catch (error) {
    // Never echo the token or the driver error — this endpoint is public.
    console.error('[customer-portal] view failed:', error);
    return NextResponse.json({ error: 'Failed to load portal' }, { status: 500 });
  }
}
