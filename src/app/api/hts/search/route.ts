import { NextRequest, NextResponse } from 'next/server';
import Fuse from 'fuse.js';
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
  effective_rate_pct: number;
  section_301_rate?: string;
  ad_cvd_flag: boolean;
  ad_cvd_details?: string;
  gsp_eligible: boolean;
  notes?: string;
}

let htsCodes: HTSCode[] | null = null;
let dutyRates: DutyRate[] | null = null;
let fuseIndex: Fuse<HTSCode> | null = null;

function loadData() {
  if (!htsCodes) {
    const htsPath = path.join(process.cwd(), 'data', 'hts-schedule.json');
    if (fs.existsSync(htsPath)) {
      htsCodes = JSON.parse(fs.readFileSync(htsPath, 'utf-8'));
    } else {
      htsCodes = [];
    }
    fuseIndex = new Fuse(htsCodes!, {
      keys: [
        { name: 'description', weight: 0.7 },
        { name: 'hts_code', weight: 0.3 },
      ],
      threshold: 0.4,
      includeScore: true,
    });
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

export async function GET(request: NextRequest) {
  loadData();

  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q') || '';
  const country = searchParams.get('country');
  const chapter = searchParams.get('chapter');
  const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);

  if (!q && !chapter) {
    return NextResponse.json(
      { error: 'Query parameter "q" or "chapter" is required' },
      { status: 400 }
    );
  }

  let results: HTSCode[];

  if (chapter) {
    const chapterNum = parseInt(chapter);
    results = (htsCodes || []).filter(c => c.chapter === chapterNum);
    if (q) {
      const filtered = new Fuse(results, {
        keys: ['description', 'hts_code'],
        threshold: 0.4,
      });
      results = filtered.search(q).map(r => r.item);
    }
  } else {
    const fuseResults = fuseIndex!.search(q);
    results = fuseResults.slice(0, limit).map(r => r.item);
  }

  // Attach country-specific rates if requested
  const enriched = results.slice(0, limit).map(code => {
    const countryRates: Record<string, any> = {};

    if (country) {
      const rates = (dutyRates || []).filter(
        r => r.hts_range === code.hts_code.slice(0, 7).replace(/(\d{4})(\d{2})/, '$1.$2') &&
             r.country_code === country.toUpperCase()
      );
      if (rates.length > 0) {
        countryRates[country.toUpperCase()] = rates[0];
      }
    }

    // Also match by chapter for broader matches
    const chapterRates = (dutyRates || []).filter(
      r => r.hts_chapter === code.chapter
    );

    return {
      ...code,
      formatted_code: `${code.hts_code.slice(0, 4)}.${code.hts_code.slice(4, 6)}.${code.hts_code.slice(6, 10)}`,
      country_rates: Object.keys(countryRates).length > 0 ? countryRates : undefined,
      available_country_rates: Array.from(new Set(chapterRates.map(r => r.country_code))),
    };
  });

  return NextResponse.json({
    query: q,
    chapter: chapter || undefined,
    country: country || undefined,
    count: enriched.length,
    results: enriched,
  });
}
