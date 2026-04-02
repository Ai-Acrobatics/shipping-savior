import { NextResponse } from 'next/server';
import * as fs from 'fs';
import * as path from 'path';
import type { VesselSharingAgreement } from '@/lib/types/schedules';

export const dynamic = 'force-dynamic';

let allianceData: VesselSharingAgreement[] | null = null;

function loadData(): VesselSharingAgreement[] {
  if (allianceData) return allianceData;

  const filePath = path.join(process.cwd(), 'data', 'vsa-alliances.json');
  if (fs.existsSync(filePath)) {
    allianceData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  } else {
    allianceData = [];
  }
  return allianceData!;
}

export async function GET() {
  const data = loadData();

  return NextResponse.json({
    count: data.length,
    alliances: data.map(a => ({
      ...a,
      memberCount: a.members.length,
      totalTeuCapacity: a.members.reduce((sum, m) => sum + m.teuCapacity, 0),
      combinedMarketShare: a.members.reduce((sum, m) => sum + m.marketSharePercent, 0),
    })),
  });
}
