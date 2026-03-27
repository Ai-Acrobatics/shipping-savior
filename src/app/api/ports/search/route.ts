import { NextRequest, NextResponse } from 'next/server';
import Fuse from 'fuse.js';
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

let ports: Port[] | null = null;
let fuseIndex: Fuse<Port> | null = null;

function loadData() {
  if (!ports) {
    const portsPath = path.join(process.cwd(), 'data', 'ports.json');
    if (fs.existsSync(portsPath)) {
      ports = JSON.parse(fs.readFileSync(portsPath, 'utf-8'));
    } else {
      ports = [];
    }
    fuseIndex = new Fuse(ports!, {
      keys: [
        { name: 'name', weight: 0.5 },
        { name: 'locode', weight: 0.3 },
        { name: 'country', weight: 0.2 },
      ],
      threshold: 0.3,
      includeScore: true,
    });
  }
}

export async function GET(request: NextRequest) {
  loadData();

  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q') || '';
  const region = searchParams.get('region');
  const country = searchParams.get('country');
  const size = searchParams.get('size');
  const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);

  let results: Port[];

  if (q) {
    results = fuseIndex!.search(q).map(r => r.item);
  } else {
    results = [...(ports || [])];
  }

  // Apply filters
  if (region) {
    results = results.filter(p => p.region.toLowerCase() === region.toLowerCase());
  }
  if (country) {
    results = results.filter(p => p.country_code.toUpperCase() === country.toUpperCase());
  }
  if (size) {
    results = results.filter(p => p.size === size.toLowerCase());
  }

  return NextResponse.json({
    query: q || undefined,
    filters: { region, country, size },
    count: Math.min(results.length, limit),
    total: results.length,
    results: results.slice(0, limit),
  });
}
