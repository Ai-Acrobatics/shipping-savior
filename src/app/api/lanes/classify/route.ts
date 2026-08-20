import { NextRequest, NextResponse } from 'next/server';
import {
  classifyLane,
  JONES_ACT_CARRIERS,
  DOMESTIC_OFFSHORE_PORTS,
} from '@/lib/data/jones-act';

export const dynamic = 'force-dynamic';

/**
 * GET /api/lanes/classify?origin=USLAX&destination=USHNL&carrier=Matson
 *
 * Signifies whether a lane is Jones Act cargo and whether it is an import
 * at all — the AK / HI / PR domestic lanes carry no CBP entry, so no duty,
 * MPF, HMF or broker fee should ever appear on a quote for them.
 *
 * Omit both params to get the reference data (carriers + offshore ports).
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const origin = searchParams.get('origin');
  const destination = searchParams.get('destination');
  const carrier = searchParams.get('carrier');

  if (!origin && !destination) {
    return NextResponse.json({
      carriers: JONES_ACT_CARRIERS,
      offshorePorts: Object.entries(DOMESTIC_OFFSHORE_PORTS).map(([code, meta]) => ({
        code,
        ...meta,
      })),
    });
  }

  if (!origin || !destination) {
    return NextResponse.json(
      { error: 'Both "origin" and "destination" query parameters are required' },
      { status: 400 }
    );
  }

  const classification = classifyLane({
    originPort: origin,
    destPort: destination,
    carrier,
  });

  return NextResponse.json(classification);
}
