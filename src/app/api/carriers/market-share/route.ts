import { NextResponse } from 'next/server';
import * as fs from 'fs';
import * as path from 'path';
import type { CarrierMarketShare } from '@/lib/types/schedules';

export const dynamic = 'force-dynamic';

let marketShareData: CarrierMarketShare[] | null = null;

function loadData(): CarrierMarketShare[] {
  if (marketShareData) return marketShareData;

  const filePath = path.join(process.cwd(), 'data', 'carrier-market-share.json');
  if (fs.existsSync(filePath)) {
    marketShareData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  } else {
    marketShareData = [];
  }
  return marketShareData!;
}

export async function GET() {
  const data = loadData();

  // Sort by market share descending
  const sorted = [...data].sort(
    (a, b) => b.globalMarketSharePercent - a.globalMarketSharePercent
  );

  return NextResponse.json({
    count: sorted.length,
    totalTeuCapacity: sorted.reduce((sum, c) => sum + c.teuCapacity, 0),
    results: sorted,
  });
}
