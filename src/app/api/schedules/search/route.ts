import { NextRequest, NextResponse } from 'next/server';
import * as fs from 'fs';
import * as path from 'path';
import type { ShippingSchedule } from '@/lib/types/schedules';
import { classifyLane } from '@/lib/data/jones-act';

export const dynamic = 'force-dynamic';

interface ScheduleWithJonesAct extends ShippingSchedule {
  is_jones_act?: boolean;
  customs_required?: boolean;
  transport_mode?: string;
  jones_act_trade?: string | null;
  lane_label?: string;
}

/**
 * Fill the Jones Act / customs flags from the lane classifier (AI-12014).
 *
 * The JSON feeds only hand-tag `data/schedules/jones-act.json`, which meant
 * every other carrier's domestic sailings came back untagged and a
 * `?jones_act=false` filter silently kept them. Deriving the flags from the
 * port codes makes the filter correct for every schedule, and an explicit
 * value in the data file still wins.
 */
function withLaneFlags(schedule: ScheduleWithJonesAct): ScheduleWithJonesAct {
  const lane = classifyLane({
    originPort: schedule.originPort,
    destPort: schedule.destPort,
    carrier: schedule.carrier ?? schedule.carrierCode,
  });

  return {
    ...schedule,
    is_jones_act: schedule.is_jones_act ?? lane.isJonesActLane,
    customs_required: schedule.customs_required ?? lane.customsEntryRequired,
    jones_act_trade: schedule.jones_act_trade ?? lane.trade,
    lane_label: schedule.lane_label ?? lane.label,
  };
}

let schedules: ScheduleWithJonesAct[] | null = null;

function loadSchedules(): ScheduleWithJonesAct[] {
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
        // Flat array of schedules
        schedules.push(...parsed);
      } else if (parsed.schedules && Array.isArray(parsed.schedules)) {
        // Wrapper format: { carrier, carrierCode, alliance, schedules: [...] }
        const defaults = {
          carrier: parsed.carrier,
          carrierCode: parsed.carrierCode,
          alliance: parsed.alliance,
          ...(parsed.is_jones_act != null && { is_jones_act: parsed.is_jones_act }),
          ...(parsed.customs_required != null && { customs_required: parsed.customs_required }),
          ...(parsed.transport_mode != null && { transport_mode: parsed.transport_mode }),
        };

        for (const schedule of parsed.schedules) {
          schedules.push({ ...defaults, ...schedule });
        }
      } else {
        // Single schedule object
        schedules.push(parsed);
      }
    } catch {
      // Skip malformed files
    }
  }

  schedules = schedules.map(withLaneFlags);
  return schedules;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const origin = searchParams.get('origin');
  const destination = searchParams.get('destination');
  const carrier = searchParams.get('carrier');
  const dateFrom = searchParams.get('dateFrom');
  const dateTo = searchParams.get('dateTo');
  const jonesAct = searchParams.get('jones_act');
  const mode = searchParams.get('mode');
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

  // Filter by Jones Act
  if (jonesAct === 'true') {
    results = results.filter(s => s.is_jones_act === true);
  } else if (jonesAct === 'false') {
    results = results.filter(s => !s.is_jones_act);
  }

  // Filter by transport mode
  if (mode) {
    const modeLower = mode.toLowerCase();
    results = results.filter(
      s => s.transport_mode?.toLowerCase() === modeLower
    );
  }

  // Sort by departure date ascending
  results.sort((a, b) => a.departureDate.localeCompare(b.departureDate));

  const sliced = results.slice(0, limit);

  return NextResponse.json({
    origin,
    destination,
    carrier: carrier || undefined,
    jones_act: jonesAct === 'true' ? true : jonesAct === 'false' ? false : undefined,
    mode: mode || undefined,
    dateRange: dateFrom || dateTo ? { from: dateFrom, to: dateTo } : undefined,
    count: sliced.length,
    total: results.length,
    results: sliced,
  });
}
