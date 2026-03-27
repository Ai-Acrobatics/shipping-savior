import { NextRequest, NextResponse } from 'next/server';
import * as fs from 'fs';
import * as path from 'path';

interface FTZZone {
  zone_number: number;
  name: string;
  city: string;
  state: string;
  state_code: string;
  operator: string;
  grantee: string;
  lat: number;
  lng: number;
  status: string;
  activated_year?: number;
  nearest_port?: string;
  port_distance_miles?: number;
  key_industries: string[];
  annual_merchandise_value_usd?: number;
  notes?: string;
}

let ftzZones: FTZZone[] | null = null;

function loadData() {
  if (!ftzZones) {
    const ftzPath = path.join(process.cwd(), 'data', 'ftz-zones.json');
    if (fs.existsSync(ftzPath)) {
      ftzZones = JSON.parse(fs.readFileSync(ftzPath, 'utf-8'));
    } else {
      ftzZones = [];
    }
  }
}

export async function GET(request: NextRequest) {
  loadData();

  const { searchParams } = new URL(request.url);
  const state = searchParams.get('state');
  const nearPort = searchParams.get('near_port');
  const industry = searchParams.get('industry');

  let results = [...(ftzZones || [])];

  if (state) {
    results = results.filter(z => z.state_code.toUpperCase() === state.toUpperCase());
  }

  if (nearPort) {
    results = results.filter(z => z.nearest_port === nearPort.toUpperCase());
  }

  if (industry) {
    const q = industry.toLowerCase();
    results = results.filter(z =>
      z.key_industries.some(i => i.toLowerCase().includes(q))
    );
  }

  return NextResponse.json({
    filters: { state, near_port: nearPort, industry },
    count: results.length,
    results,
  });
}
