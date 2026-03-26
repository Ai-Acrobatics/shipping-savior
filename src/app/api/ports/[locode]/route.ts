import { NextRequest, NextResponse } from 'next/server';
import * as fs from 'fs';
import * as path from 'path';

interface Port {
  locode: string;
  name: string;
  country: string;
  country_code: string;
  lat: number;
  lng: number;
  port_type: string;
  size: string;
  annual_teu?: number;
  region: string;
  timezone: string;
}

interface FTZZone {
  zone_number: number;
  name: string;
  city: string;
  state: string;
  nearest_port?: string;
  port_distance_miles?: number;
}

let ports: Port[] | null = null;
let ftzZones: FTZZone[] | null = null;

function loadData() {
  if (!ports) {
    const portsPath = path.join(process.cwd(), 'data', 'ports.json');
    if (fs.existsSync(portsPath)) {
      ports = JSON.parse(fs.readFileSync(portsPath, 'utf-8'));
    } else {
      ports = [];
    }
  }
  if (!ftzZones) {
    const ftzPath = path.join(process.cwd(), 'data', 'ftz-zones.json');
    if (fs.existsSync(ftzPath)) {
      ftzZones = JSON.parse(fs.readFileSync(ftzPath, 'utf-8'));
    } else {
      ftzZones = [];
    }
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { locode: string } }
) {
  loadData();

  const locode = params.locode.toUpperCase();
  const port = (ports || []).find(p => p.locode === locode);

  if (!port) {
    return NextResponse.json(
      { error: `Port ${locode} not found` },
      { status: 404 }
    );
  }

  // Find nearby FTZ zones
  const nearbyFTZ = (ftzZones || []).filter(z => z.nearest_port === locode);

  return NextResponse.json({
    ...port,
    nearby_ftz_zones: nearbyFTZ.map(z => ({
      zone_number: z.zone_number,
      name: z.name,
      city: z.city,
      state: z.state,
      distance_miles: z.port_distance_miles,
    })),
  });
}
