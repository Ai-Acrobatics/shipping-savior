import { NextRequest, NextResponse } from 'next/server';
import * as fs from 'fs';
import * as path from 'path';
import type { ShippingSchedule } from '@/lib/types/schedules';

export const dynamic = 'force-dynamic';

let schedules: ShippingSchedule[] | null = null;

function loadSchedules(): ShippingSchedule[] {
  if (schedules) return schedules;

  const schedulesDir = path.join(process.cwd(), 'data', 'schedules');
  schedules = [];

  if (!fs.existsSync(schedulesDir)) {
    return schedules;
  }

  const files = fs.readdirSync(schedulesDir).filter(f => f.endsWith('.json'));
  for (const file of files) {
    try {
      const raw = fs.readFileSync(path.join(schedulesDir, file), 'utf-8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        schedules.push(...parsed);
      } else {
        schedules.push(parsed);
      }
    } catch {
      // Skip malformed files
    }
  }

  return schedules;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const origin = searchParams.get('origin');
  const destination = searchParams.get('destination');
  const carrier = searchParams.get('carrier');
  const dateFrom = searchParams.get('dateFrom');
  const dateTo = searchParams.get('dateTo');
  const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 200);

  if (!origin || !destination) {
    return NextResponse.json(
      { error: 'Both "origin" and "destination" query parameters are required' },
      { status: 400 }
    );
  }

  const allSchedules = loadSchedules();
  const originUpper = origin.toUpperCase();
  const destUpper = destination.toUpperCase();

  let results = allSchedules.filter(s => {
    const matchOrigin =
      s.originPort.toUpperCase() === originUpper ||
      s.originPortName.toLowerCase().includes(origin.toLowerCase());
    const matchDest =
      s.destPort.toUpperCase() === destUpper ||
      s.destPortName.toLowerCase().includes(destination.toLowerCase());
    return matchOrigin && matchDest;
  });

  // Filter by carrier
  if (carrier) {
    const carrierUpper = carrier.toUpperCase();
    results = results.filter(
      s =>
        s.carrierCode.toUpperCase() === carrierUpper ||
        s.carrier.toLowerCase().includes(carrier.toLowerCase())
    );
  }

  // Filter by date range
  if (dateFrom) {
    results = results.filter(s => s.departureDate >= dateFrom);
  }
  if (dateTo) {
    results = results.filter(s => s.departureDate <= dateTo);
  }

  // Sort by departure date ascending
  results.sort((a, b) => a.departureDate.localeCompare(b.departureDate));

  const sliced = results.slice(0, limit);

  return NextResponse.json({
    origin,
    destination,
    carrier: carrier || undefined,
    dateRange: dateFrom || dateTo ? { from: dateFrom, to: dateTo } : undefined,
    count: sliced.length,
    total: results.length,
    results: sliced,
  });
}
