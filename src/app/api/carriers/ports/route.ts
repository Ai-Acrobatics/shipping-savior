import { NextRequest, NextResponse } from 'next/server';
import * as fs from 'fs';
import * as path from 'path';
import type { CarrierPortMapping } from '@/lib/types/schedules';

export const dynamic = 'force-dynamic';

let carrierPorts: CarrierPortMapping[] | null = null;

function loadData(): CarrierPortMapping[] {
  if (carrierPorts) return carrierPorts;

  const filePath = path.join(process.cwd(), 'data', 'carrier-ports.json');
  if (fs.existsSync(filePath)) {
    carrierPorts = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  } else {
    carrierPorts = [];
  }
  return carrierPorts!;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const port = searchParams.get('port');
  const port1 = searchParams.get('port1');
  const port2 = searchParams.get('port2');
  const carrier = searchParams.get('carrier');

  if (!port && !port1 && !carrier) {
    return NextResponse.json(
      { error: 'At least one of "port", "port1"+"port2", or "carrier" is required' },
      { status: 400 }
    );
  }

  const data = loadData();

  // Mode 1: Single port — return carriers serving that port
  if (port) {
    const portUpper = port.toUpperCase();
    const entry = data.find(p => p.portCode.toUpperCase() === portUpper);

    if (!entry) {
      return NextResponse.json(
        { error: `Port "${port}" not found in carrier-ports data` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      port: entry.portCode,
      portName: entry.portName,
      country: entry.country,
      carrierCount: entry.carriers.length,
      carriers: entry.carriers,
    });
  }

  // Mode 2: Two ports — find carriers present at BOTH (overlap)
  if (port1 && port2) {
    const p1Upper = port1.toUpperCase();
    const p2Upper = port2.toUpperCase();

    const entry1 = data.find(p => p.portCode.toUpperCase() === p1Upper);
    const entry2 = data.find(p => p.portCode.toUpperCase() === p2Upper);

    if (!entry1) {
      return NextResponse.json(
        { error: `Port "${port1}" not found in carrier-ports data` },
        { status: 404 }
      );
    }
    if (!entry2) {
      return NextResponse.json(
        { error: `Port "${port2}" not found in carrier-ports data` },
        { status: 404 }
      );
    }

    const port1CarrierCodes = new Set(entry1.carriers.map(c => c.code));
    const overlapping = entry2.carriers.filter(c => port1CarrierCodes.has(c.code));

    return NextResponse.json({
      port1: { code: entry1.portCode, name: entry1.portName, country: entry1.country },
      port2: { code: entry2.portCode, name: entry2.portName, country: entry2.country },
      overlappingCarrierCount: overlapping.length,
      overlappingCarriers: overlapping.map(c => ({
        name: c.name,
        code: c.code,
        servicesAtPort1: entry1.carriers.find(e => e.code === c.code)?.services || [],
        servicesAtPort2: c.services,
      })),
    });
  }

  // Mode 3: Carrier code — return all ports that carrier serves
  if (carrier) {
    const carrierUpper = carrier.toUpperCase();
    const portsServed = data.filter(p =>
      p.carriers.some(c => c.code.toUpperCase() === carrierUpper)
    );

    return NextResponse.json({
      carrier: carrierUpper,
      portCount: portsServed.length,
      ports: portsServed.map(p => ({
        portCode: p.portCode,
        portName: p.portName,
        country: p.country,
        services: p.carriers.find(c => c.code.toUpperCase() === carrierUpper)?.services || [],
      })),
    });
  }

  // Should not reach here, but just in case
  return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 });
}
