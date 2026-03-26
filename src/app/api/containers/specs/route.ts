import { NextRequest, NextResponse } from 'next/server';
import * as fs from 'fs';
import * as path from 'path';

interface ContainerSpec {
  type: string;
  iso_code: string;
  description: string;
  length_m: number;
  width_m: number;
  height_m: number;
  max_payload_kg: number;
  tare_weight_kg: number;
  max_gross_weight_kg: number;
  cubic_capacity_cbm: number;
  temperature_range?: { min_c: number; max_c: number };
  common_use: string[];
}

let specs: ContainerSpec[] | null = null;

function loadData() {
  if (!specs) {
    const specsPath = path.join(process.cwd(), 'data', 'container-specs.json');
    if (fs.existsSync(specsPath)) {
      specs = JSON.parse(fs.readFileSync(specsPath, 'utf-8'));
    } else {
      specs = [];
    }
  }
}

export async function GET(request: NextRequest) {
  loadData();

  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');
  const reefer = searchParams.get('reefer');

  let results = [...(specs || [])];

  if (type) {
    results = results.filter(s => s.type.includes(type.toLowerCase()));
  }

  if (reefer === 'true') {
    results = results.filter(s => s.temperature_range !== undefined);
  } else if (reefer === 'false') {
    results = results.filter(s => s.temperature_range === undefined);
  }

  return NextResponse.json({
    count: results.length,
    results,
  });
}
