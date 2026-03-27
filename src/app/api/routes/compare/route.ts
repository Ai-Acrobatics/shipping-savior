import { NextRequest, NextResponse } from 'next/server';
import * as fs from 'fs';
import * as path from 'path';

interface CarrierRoute {
  id: string;
  carrier: string;
  carrier_code: string;
  service_name: string;
  origin: string;
  origin_name: string;
  destination: string;
  destination_name: string;
  transit_days: number;
  frequency: string;
  transshipment_ports: string[];
  direct: boolean;
  backhaul_available: boolean;
  estimated_cost_20ft: number;
  estimated_cost_40ft: number;
  estimated_cost_40hc: number;
  route_type: string;
  via: string;
  vessel_size_teu?: number;
  co2_per_teu_kg?: number;
  notes?: string;
}

let routes: CarrierRoute[] | null = null;

function loadData() {
  if (!routes) {
    const routesPath = path.join(process.cwd(), 'data', 'carrier-routes.json');
    if (fs.existsSync(routesPath)) {
      routes = JSON.parse(fs.readFileSync(routesPath, 'utf-8'));
    } else {
      routes = [];
    }
  }
}

export async function GET(request: NextRequest) {
  loadData();

  const { searchParams } = new URL(request.url);
  const origin = searchParams.get('origin')?.toUpperCase();
  const dest = searchParams.get('dest')?.toUpperCase();
  const carrier = searchParams.get('carrier');
  const cargo = searchParams.get('cargo'); // 20ft, 40ft, 40hc
  const sortBy = searchParams.get('sort') || 'transit_days'; // transit_days, cost, co2

  if (!origin && !dest) {
    return NextResponse.json(
      { error: 'At least one of "origin" or "dest" query params is required' },
      { status: 400 }
    );
  }

  let results = [...(routes || [])];

  if (origin) {
    results = results.filter(r => r.origin === origin);
  }
  if (dest) {
    results = results.filter(r => r.destination === dest);
  }
  if (carrier) {
    results = results.filter(r =>
      r.carrier.toLowerCase().includes(carrier.toLowerCase()) ||
      r.carrier_code.toLowerCase() === carrier.toLowerCase()
    );
  }

  // Sort
  switch (sortBy) {
    case 'cost':
      const costKey = cargo === '40hc' ? 'estimated_cost_40hc' :
                      cargo === '40ft' ? 'estimated_cost_40ft' :
                      'estimated_cost_20ft';
      results.sort((a, b) => (a as any)[costKey] - (b as any)[costKey]);
      break;
    case 'co2':
      results.sort((a, b) => (a.co2_per_teu_kg || 9999) - (b.co2_per_teu_kg || 9999));
      break;
    case 'transit_days':
    default:
      results.sort((a, b) => a.transit_days - b.transit_days);
      break;
  }

  // Compute savings comparison if multiple results
  const cheapest20 = results.length > 0 ? Math.min(...results.map(r => r.estimated_cost_20ft)) : 0;
  const cheapest40 = results.length > 0 ? Math.min(...results.map(r => r.estimated_cost_40ft)) : 0;
  const fastest = results.length > 0 ? Math.min(...results.map(r => r.transit_days)) : 0;

  const enriched = results.map(r => ({
    ...r,
    cost_premium_20ft: r.estimated_cost_20ft - cheapest20,
    cost_premium_40ft: r.estimated_cost_40ft - cheapest40,
    transit_premium_days: r.transit_days - fastest,
  }));

  return NextResponse.json({
    origin: origin || 'any',
    destination: dest || 'any',
    carrier: carrier || 'all',
    sort: sortBy,
    count: enriched.length,
    summary: results.length > 0 ? {
      cheapest_20ft: `$${cheapest20}`,
      cheapest_40ft: `$${cheapest40}`,
      fastest_transit: `${fastest} days`,
      carriers: [...new Set(results.map(r => r.carrier))],
    } : null,
    results: enriched,
  });
}
