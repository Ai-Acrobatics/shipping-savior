import { NextRequest, NextResponse } from 'next/server';
import * as fs from 'fs';
import * as path from 'path';

interface HTSCode {
  hts_code: string;
  description: string;
  general_rate: string;
  special_rates: string;
  unit_of_quantity: string;
  chapter: number;
  indent_level: number;
}

interface DutyRate {
  hts_chapter: number;
  category: string;
  subcategory: string;
  hts_range: string;
  country: string;
  country_code: string;
  general_rate: string;
  general_rate_pct: number;
  section_301_rate?: string;
  section_301_pct?: number;
  effective_rate_pct: number;
  gsp_eligible: boolean;
  gsp_status?: string;
  ldc_preference: boolean;
  ad_cvd_flag: boolean;
  ad_cvd_details?: string;
  notes?: string;
}

let htsCodes: HTSCode[] | null = null;
let dutyRates: DutyRate[] | null = null;

function loadData() {
  if (!htsCodes) {
    const htsPath = path.join(process.cwd(), 'data', 'hts-schedule.json');
    if (fs.existsSync(htsPath)) {
      htsCodes = JSON.parse(fs.readFileSync(htsPath, 'utf-8'));
    } else {
      htsCodes = [];
    }
  }
  if (!dutyRates) {
    const dutyPath = path.join(process.cwd(), 'data', 'duty-rates-sea.json');
    if (fs.existsSync(dutyPath)) {
      dutyRates = JSON.parse(fs.readFileSync(dutyPath, 'utf-8'));
    } else {
      dutyRates = [];
    }
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { code: string } }
) {
  loadData();

  const code = params.code.replace(/\./g, '').padEnd(10, '0').slice(0, 10);
  const hts = (htsCodes || []).find(c => c.hts_code === code);

  if (!hts) {
    return NextResponse.json(
      { error: `HTS code ${code} not found` },
      { status: 404 }
    );
  }

  // Find all country-specific duty rates for this chapter
  const chapterRates = (dutyRates || []).filter(r => r.hts_chapter === hts.chapter);

  // Group by country
  const ratesByCountry: Record<string, DutyRate[]> = {};
  for (const rate of chapterRates) {
    if (!ratesByCountry[rate.country_code]) {
      ratesByCountry[rate.country_code] = [];
    }
    ratesByCountry[rate.country_code].push(rate);
  }

  return NextResponse.json({
    hts_code: hts.hts_code,
    formatted_code: `${hts.hts_code.slice(0, 4)}.${hts.hts_code.slice(4, 6)}.${hts.hts_code.slice(6, 10)}`,
    description: hts.description,
    general_rate: hts.general_rate,
    special_rates: hts.special_rates,
    unit_of_quantity: hts.unit_of_quantity,
    chapter: hts.chapter,
    country_rates: ratesByCountry,
  });
}
