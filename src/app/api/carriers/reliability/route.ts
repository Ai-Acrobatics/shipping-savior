import { NextRequest, NextResponse } from 'next/server';
import * as fs from 'fs';
import * as path from 'path';
import type { CarrierReliability } from '@/lib/types/schedules';

export const dynamic = 'force-dynamic';

let reliabilityData: CarrierReliability[] | null = null;

function loadData(): CarrierReliability[] {
  if (reliabilityData) return reliabilityData;

  const filePath = path.join(process.cwd(), 'data', 'reliability.json');
  if (fs.existsSync(filePath)) {
    reliabilityData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  } else {
    reliabilityData = [];
  }
  return reliabilityData!;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const carrier = searchParams.get('carrier');
  const route = searchParams.get('route');

  const data = loadData();
  let results = [...data];

  // Filter by carrier code or name
  if (carrier) {
    const carrierUpper = carrier.toUpperCase();
    results = results.filter(
      r =>
        r.carrierCode.toUpperCase() === carrierUpper ||
        r.carrier.toLowerCase().includes(carrier.toLowerCase())
    );
  }

  // Filter by route (e.g. "CNQIN-USLAX")
  if (route) {
    const routeUpper = route.toUpperCase();
    results = results.filter(r => r.route?.toUpperCase() === routeUpper);
  }

  // Sort by on-time percentage descending (best first)
  results.sort((a, b) => b.onTimePercent - a.onTimePercent);

  return NextResponse.json({
    carrier: carrier || undefined,
    route: route || undefined,
    count: results.length,
    results,
  });
}
