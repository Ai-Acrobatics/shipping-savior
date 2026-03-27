/**
 * Load HTS (Harmonized Tariff Schedule) codes from USITC API
 * Fetches chapters 01-99 and normalizes codes to 10-digit format
 */

import * as fs from 'fs';
import * as path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const OUTPUT_FILE = path.join(DATA_DIR, 'hts-schedule.json');
const SQL_FILE = path.join(DATA_DIR, 'hts-schedule.sql');

interface HTSCode {
  hts_code: string;
  description: string;
  general_rate: string;
  special_rates: string;
  unit_of_quantity: string;
  chapter: number;
  indent_level: number;
}

/**
 * Normalize HTS code to 10-digit format without dots
 * "6402.99.40" → "6402994000"
 * "0301.11.00.30" → "0301110030"
 */
function normalizeHTSCode(code: string): string {
  const digits = code.replace(/\./g, '');
  return digits.padEnd(10, '0').slice(0, 10);
}

/**
 * Fetch HTS chapter data from USITC API
 */
async function fetchChapter(chapter: number): Promise<HTSCode[]> {
  const chapterStr = chapter.toString().padStart(2, '0');
  const url = `https://hts.usitc.gov/reststop/getChapter?chapter=${chapterStr}`;

  try {
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'ShippingSavior/1.0 (data-pipeline)',
      },
      signal: AbortSignal.timeout(30000),
    });

    if (!response.ok) {
      console.warn(`  Chapter ${chapterStr}: HTTP ${response.status} - skipping`);
      return [];
    }

    const text = await response.text();
    if (!text || text.trim() === '') {
      console.warn(`  Chapter ${chapterStr}: Empty response - skipping`);
      return [];
    }

    let data: any;
    try {
      data = JSON.parse(text);
    } catch {
      console.warn(`  Chapter ${chapterStr}: Invalid JSON - skipping`);
      return [];
    }

    const items = Array.isArray(data) ? data : (data?.items || data?.data || []);
    const codes: HTSCode[] = [];

    for (const item of items) {
      const htsNumber = item.htsno || item.hts_number || item.htsNumber || '';
      if (!htsNumber || !/\d/.test(htsNumber)) continue;

      codes.push({
        hts_code: normalizeHTSCode(htsNumber),
        description: (item.description || item.desc || '').replace(/<[^>]*>/g, '').trim(),
        general_rate: item.general || item.generalRate || item.general_rate_of_duty || '',
        special_rates: item.special || item.specialRate || item.special_rate_of_duty || '',
        unit_of_quantity: item.units || item.unitOfQuantity || item.unit_of_quantity || '',
        chapter,
        indent_level: parseInt(item.indent || item.indentLevel || '0', 10),
      });
    }

    return codes;
  } catch (error: any) {
    if (error.name === 'TimeoutError' || error.name === 'AbortError') {
      console.warn(`  Chapter ${chapterStr}: Timeout - skipping`);
    } else {
      console.warn(`  Chapter ${chapterStr}: ${error.message} - skipping`);
    }
    return [];
  }
}

/**
 * Generate curated HTS codes for key SE Asia import categories
 * as fallback when API is unavailable
 */
function getCuratedHTSCodes(): HTSCode[] {
  const codes: HTSCode[] = [
    // Chapter 03 - Seafood
    { hts_code: '0302110020', description: 'Trout (Salmo trutta), fresh or chilled, farmed', general_rate: 'Free', special_rates: '', unit_of_quantity: 'kg', chapter: 3, indent_level: 2 },
    { hts_code: '0303110000', description: 'Sockeye salmon (red salmon), frozen', general_rate: 'Free', special_rates: '', unit_of_quantity: 'kg', chapter: 3, indent_level: 2 },
    { hts_code: '0304410000', description: 'Pacific salmon fillets, fresh or chilled', general_rate: 'Free', special_rates: '', unit_of_quantity: 'kg', chapter: 3, indent_level: 2 },
    { hts_code: '0306171000', description: 'Frozen shrimp and prawns', general_rate: 'Free', special_rates: '', unit_of_quantity: 'kg', chapter: 3, indent_level: 2 },
    { hts_code: '0306361000', description: 'Cold-water shrimps and prawns, in shell, cooked', general_rate: 'Free', special_rates: '', unit_of_quantity: 'kg', chapter: 3, indent_level: 2 },
    { hts_code: '0307210000', description: 'Scallops, live, fresh or chilled', general_rate: 'Free', special_rates: '', unit_of_quantity: 'kg', chapter: 3, indent_level: 2 },
    { hts_code: '0307430000', description: 'Cuttle fish and squid, frozen', general_rate: 'Free', special_rates: '', unit_of_quantity: 'kg', chapter: 3, indent_level: 2 },
    { hts_code: '0308110000', description: 'Sea urchins, live, fresh or chilled', general_rate: 'Free', special_rates: '', unit_of_quantity: 'kg', chapter: 3, indent_level: 2 },

    // Chapter 16 - Prepared foods
    { hts_code: '1604141040', description: 'Tuna, prepared or preserved, in oil, in airtight containers', general_rate: '35%', special_rates: 'Free (IL, JO, AU, SG, BH, CL, CO, PA, PE, KR)', unit_of_quantity: 'kg', chapter: 16, indent_level: 2 },
    { hts_code: '1604200520', description: 'Prepared or preserved fish, other, in airtight containers', general_rate: '4%', special_rates: '', unit_of_quantity: 'kg', chapter: 16, indent_level: 2 },
    { hts_code: '1605211030', description: 'Shrimps and prawns, prepared, not in airtight containers', general_rate: 'Free', special_rates: '', unit_of_quantity: 'kg', chapter: 16, indent_level: 2 },
    { hts_code: '1605290500', description: 'Other prepared shrimps and prawns', general_rate: 'Free', special_rates: '', unit_of_quantity: 'kg', chapter: 16, indent_level: 2 },
    { hts_code: '1605530000', description: 'Mussels, prepared or preserved', general_rate: 'Free', special_rates: '', unit_of_quantity: 'kg', chapter: 16, indent_level: 2 },

    // Chapter 39 - Plastics
    { hts_code: '3901100000', description: 'Polyethylene having a specific gravity of less than 0.94, in primary forms', general_rate: '6.5%', special_rates: 'Free (AU, BH, CL, CO, IL, JO, KR, MA, OM, PA, PE, SG)', unit_of_quantity: 'kg', chapter: 39, indent_level: 2 },
    { hts_code: '3901200000', description: 'Polyethylene having a specific gravity of 0.94 or more, in primary forms', general_rate: '6.5%', special_rates: 'Free (AU, BH, CL, CO, IL, JO, KR, MA, OM, PA, PE, SG)', unit_of_quantity: 'kg', chapter: 39, indent_level: 2 },
    { hts_code: '3902100000', description: 'Polypropylene, in primary forms', general_rate: '6.5%', special_rates: 'Free (AU, BH, CL, CO, IL, JO, KR, MA, OM, PA, PE, SG)', unit_of_quantity: 'kg', chapter: 39, indent_level: 2 },
    { hts_code: '3903110000', description: 'Polystyrene, expansible, in primary forms', general_rate: '6.5%', special_rates: 'Free (AU, BH, CL, CO, IL, JO, KR, MA, OM, PA, PE, SG)', unit_of_quantity: 'kg', chapter: 39, indent_level: 2 },
    { hts_code: '3904100000', description: 'Poly(vinyl chloride) (PVC), in primary forms', general_rate: '5.8%', special_rates: 'Free (AU, BH, CL, CO, IL, JO, KR, MA, OM, PA, PE, SG)', unit_of_quantity: 'kg', chapter: 39, indent_level: 2 },
    { hts_code: '3923100000', description: 'Boxes, cases, crates and similar articles of plastics', general_rate: '3%', special_rates: 'Free (AU, BH, CL, CO, IL, JO, KR, MA, OM, PA, PE, SG)', unit_of_quantity: 'kg', chapter: 39, indent_level: 2 },
    { hts_code: '3923210000', description: 'Sacks and bags of polymers of ethylene', general_rate: '3%', special_rates: 'Free (AU, BH, CL, CO, IL, JO, KR, MA, OM, PA, PE, SG)', unit_of_quantity: 'kg', chapter: 39, indent_level: 2 },
    { hts_code: '3923290000', description: 'Sacks and bags of other plastics', general_rate: '3%', special_rates: 'Free (AU, BH, CL, CO, IL, JO, KR, MA, OM, PA, PE, SG)', unit_of_quantity: 'kg', chapter: 39, indent_level: 2 },
    { hts_code: '3926909989', description: 'Other articles of plastics, nesoi', general_rate: '5.3%', special_rates: 'Free (AU, BH, CL, CO, IL, JO, KR, MA, OM, PA, PE, SG)', unit_of_quantity: 'kg', chapter: 39, indent_level: 2 },

    // Chapter 42 - Leather goods
    { hts_code: '4202110000', description: 'Trunks, suitcases, vanity cases, with outer surface of leather', general_rate: '8%', special_rates: 'Free (AU, BH, CL, CO, IL, JO, KR, MA, OM, PA, PE, SG)', unit_of_quantity: 'No.', chapter: 42, indent_level: 2 },
    { hts_code: '4202121000', description: 'Trunks, suitcases with outer surface of plastics', general_rate: '20%', special_rates: '7.8% (JO), Free (IL, AU, SG, BH, CL, CO, PA, PE, KR)', unit_of_quantity: 'No.', chapter: 42, indent_level: 2 },
    { hts_code: '4202210000', description: 'Handbags with outer surface of leather or composition leather', general_rate: '8%', special_rates: 'Free (AU, BH, CL, CO, IL, JO, KR, MA, OM, PA, PE, SG)', unit_of_quantity: 'No.', chapter: 42, indent_level: 2 },
    { hts_code: '4202220000', description: 'Handbags with outer surface of sheeting of plastics', general_rate: '16.8%', special_rates: '5.5% (JO), Free (IL, AU, SG, BH, CL, CO, PA, PE, KR)', unit_of_quantity: 'No.', chapter: 42, indent_level: 2 },
    { hts_code: '4202310000', description: 'Articles normally carried in pocket, of leather', general_rate: '8%', special_rates: 'Free (AU, BH, CL, CO, IL, JO, KR, MA, OM, PA, PE, SG)', unit_of_quantity: 'No.', chapter: 42, indent_level: 2 },
    { hts_code: '4202320000', description: 'Articles normally carried in pocket, of plastic sheeting', general_rate: '12.1%', special_rates: 'Free (AU, BH, CL, CO, IL, JO, KR, MA, OM, PA, PE, SG)', unit_of_quantity: 'No.', chapter: 42, indent_level: 2 },
    { hts_code: '4202920000', description: 'Travel, sports and similar bags with outer surface of plastic sheeting', general_rate: '20%', special_rates: '7.8% (JO), Free (IL, AU, SG, BH, CL, CO, PA, PE, KR)', unit_of_quantity: 'No.', chapter: 42, indent_level: 2 },

    // Chapter 61 - Knitted apparel
    { hts_code: '6101200010', description: "Men's or boys' overcoats of cotton, knitted", general_rate: '15.9%', special_rates: 'Free (BH, CL, CO, IL, JO, KR, MA, OM, PA, PE, SG)', unit_of_quantity: 'doz/kg', chapter: 61, indent_level: 2 },
    { hts_code: '6102200010', description: "Women's or girls' overcoats of cotton, knitted", general_rate: '15.9%', special_rates: 'Free (BH, CL, CO, IL, JO, KR, MA, OM, PA, PE, SG)', unit_of_quantity: 'doz/kg', chapter: 61, indent_level: 2 },
    { hts_code: '6104420000', description: "Women's or girls' dresses of cotton, knitted", general_rate: '11.5%', special_rates: 'Free (BH, CL, CO, IL, JO, KR, MA, OM, PA, PE, SG)', unit_of_quantity: 'doz/kg', chapter: 61, indent_level: 2 },
    { hts_code: '6105100010', description: "Men's or boys' shirts of cotton, knitted", general_rate: '19.7%', special_rates: 'Free (BH, CL, CO, IL, JO, KR, MA, OM, PA, PE, SG)', unit_of_quantity: 'doz/kg', chapter: 61, indent_level: 2 },
    { hts_code: '6106100000', description: "Women's or girls' blouses of cotton, knitted", general_rate: '19.7%', special_rates: 'Free (BH, CL, CO, IL, JO, KR, MA, OM, PA, PE, SG)', unit_of_quantity: 'doz/kg', chapter: 61, indent_level: 2 },
    { hts_code: '6109100010', description: 'T-shirts, singlets of cotton, knitted, men or boys', general_rate: '16.5%', special_rates: 'Free (BH, CL, CO, IL, JO, KR, MA, OM, PA, PE, SG)', unit_of_quantity: 'doz/kg', chapter: 61, indent_level: 2 },
    { hts_code: '6109100012', description: 'T-shirts of cotton, knitted, women or girls', general_rate: '16.5%', special_rates: 'Free (BH, CL, CO, IL, JO, KR, MA, OM, PA, PE, SG)', unit_of_quantity: 'doz/kg', chapter: 61, indent_level: 2 },
    { hts_code: '6110200020', description: 'Sweaters, pullovers of cotton, knitted', general_rate: '16.5%', special_rates: 'Free (BH, CL, CO, IL, JO, KR, MA, OM, PA, PE, SG)', unit_of_quantity: 'doz/kg', chapter: 61, indent_level: 2 },
    { hts_code: '6110301550', description: 'Sweaters, pullovers of man-made fibers, knitted', general_rate: '32%', special_rates: 'Free (BH, CL, CO, IL, JO, KR, MA, OM, PA, PE, SG)', unit_of_quantity: 'doz/kg', chapter: 61, indent_level: 2 },
    { hts_code: '6115950000', description: 'Hosiery and footwear of cotton, knitted', general_rate: '13.5%', special_rates: 'Free (BH, CL, CO, IL, JO, KR, MA, OM, PA, PE, SG)', unit_of_quantity: 'doz/kg', chapter: 61, indent_level: 2 },

    // Chapter 62 - Woven apparel
    { hts_code: '6203420010', description: "Men's trousers of cotton, not knitted", general_rate: '16.6%', special_rates: 'Free (BH, CL, CO, IL, JO, KR, MA, OM, PA, PE, SG)', unit_of_quantity: 'doz/kg', chapter: 62, indent_level: 2 },
    { hts_code: '6204420010', description: "Women's dresses of cotton, not knitted", general_rate: '8.4%', special_rates: 'Free (BH, CL, CO, IL, JO, KR, MA, OM, PA, PE, SG)', unit_of_quantity: 'doz/kg', chapter: 62, indent_level: 2 },
    { hts_code: '6204620010', description: "Women's trousers of cotton, not knitted", general_rate: '16.6%', special_rates: 'Free (BH, CL, CO, IL, JO, KR, MA, OM, PA, PE, SG)', unit_of_quantity: 'doz/kg', chapter: 62, indent_level: 2 },
    { hts_code: '6205200010', description: "Men's shirts of cotton, not knitted", general_rate: '19.7%', special_rates: 'Free (BH, CL, CO, IL, JO, KR, MA, OM, PA, PE, SG)', unit_of_quantity: 'doz/kg', chapter: 62, indent_level: 2 },
    { hts_code: '6206300010', description: "Women's blouses of cotton, not knitted", general_rate: '15.4%', special_rates: 'Free (BH, CL, CO, IL, JO, KR, MA, OM, PA, PE, SG)', unit_of_quantity: 'doz/kg', chapter: 62, indent_level: 2 },
    { hts_code: '6210400000', description: "Men's garments of fabric of heading 5602 or 5603", general_rate: '7.1%', special_rates: 'Free (BH, CL, CO, IL, JO, KR, MA, OM, PA, PE, SG)', unit_of_quantity: 'doz/kg', chapter: 62, indent_level: 2 },
    { hts_code: '6211420010', description: "Women's garments nesoi, of cotton, not knitted", general_rate: '8.1%', special_rates: 'Free (BH, CL, CO, IL, JO, KR, MA, OM, PA, PE, SG)', unit_of_quantity: 'doz/kg', chapter: 62, indent_level: 2 },

    // Chapter 64 - Footwear
    { hts_code: '6401100000', description: 'Waterproof footwear with metal toe cap, rubber/plastics', general_rate: '37.5%', special_rates: 'Free (AU, BH, CL, CO, IL, JO, KR, MA, OM, PA, PE, SG)', unit_of_quantity: 'prs', chapter: 64, indent_level: 2 },
    { hts_code: '6402190000', description: 'Sports footwear, with outer soles and uppers of rubber or plastics, other', general_rate: '20%', special_rates: 'Free (AU, BH, CL, CO, IL, JO, KR, MA, OM, PA, PE, SG)', unit_of_quantity: 'prs', chapter: 64, indent_level: 2 },
    { hts_code: '6402994060', description: 'Footwear with outer sole and upper of rubber or plastics, nesoi', general_rate: '6%', special_rates: 'Free (AU, BH, CL, CO, IL, JO, KR, MA, OM, PA, PE, SG)', unit_of_quantity: 'prs', chapter: 64, indent_level: 2 },
    { hts_code: '6403510000', description: 'Footwear with uppers of leather covering the ankle', general_rate: '8.5%', special_rates: 'Free (AU, BH, CL, CO, IL, JO, KR, MA, OM, PA, PE, SG)', unit_of_quantity: 'prs', chapter: 64, indent_level: 2 },
    { hts_code: '6403990000', description: 'Other footwear with uppers of leather', general_rate: '10%', special_rates: 'Free (AU, BH, CL, CO, IL, JO, KR, MA, OM, PA, PE, SG)', unit_of_quantity: 'prs', chapter: 64, indent_level: 2 },
    { hts_code: '6404110000', description: 'Sports footwear with outer soles of rubber and textile uppers', general_rate: '20%', special_rates: 'Free (AU, BH, CL, CO, IL, JO, KR, MA, OM, PA, PE, SG)', unit_of_quantity: 'prs', chapter: 64, indent_level: 2 },
    { hts_code: '6404190000', description: 'Other footwear with outer soles of rubber and textile uppers', general_rate: '37.5%', special_rates: 'Free (AU, BH, CL, CO, IL, JO, KR, MA, OM, PA, PE, SG)', unit_of_quantity: 'prs', chapter: 64, indent_level: 2 },
    { hts_code: '6405200090', description: 'Other footwear with uppers of textile materials', general_rate: '12.5%', special_rates: 'Free (AU, BH, CL, CO, IL, JO, KR, MA, OM, PA, PE, SG)', unit_of_quantity: 'prs', chapter: 64, indent_level: 2 },

    // Chapter 85 - Electronics
    { hts_code: '8471300100', description: 'Portable digital automatic data processing machines (laptops)', general_rate: 'Free', special_rates: '', unit_of_quantity: 'No.', chapter: 85, indent_level: 2 },
    { hts_code: '8471410150', description: 'Other digital automatic data processing machines', general_rate: 'Free', special_rates: '', unit_of_quantity: 'No.', chapter: 85, indent_level: 2 },
    { hts_code: '8504400000', description: 'Static converters (power supplies)', general_rate: '1.5%', special_rates: 'Free (AU, BH, CL, CO, IL, JO, KR, MA, OM, PA, PE, SG)', unit_of_quantity: 'No.', chapter: 85, indent_level: 2 },
    { hts_code: '8507600000', description: 'Lithium-ion batteries', general_rate: '3.4%', special_rates: 'Free (AU, BH, CL, CO, IL, JO, KR, MA, OM, PA, PE, SG)', unit_of_quantity: 'No.', chapter: 85, indent_level: 2 },
    { hts_code: '8517120050', description: 'Smartphones', general_rate: 'Free', special_rates: '', unit_of_quantity: 'No.', chapter: 85, indent_level: 2 },
    { hts_code: '8518100000', description: 'Microphones and their stands', general_rate: 'Free', special_rates: '', unit_of_quantity: 'No.', chapter: 85, indent_level: 2 },
    { hts_code: '8518300000', description: 'Headphones and earphones', general_rate: 'Free', special_rates: '', unit_of_quantity: 'No.', chapter: 85, indent_level: 2 },
    { hts_code: '8523510000', description: 'Semiconductor storage devices (flash drives, SSD)', general_rate: 'Free', special_rates: '', unit_of_quantity: 'No.', chapter: 85, indent_level: 2 },
    { hts_code: '8528720000', description: 'Television reception apparatus, color, with flat panel screen', general_rate: '3.9%', special_rates: 'Free (AU, BH, CL, CO, IL, JO, KR, MA, OM, PA, PE, SG)', unit_of_quantity: 'No.', chapter: 85, indent_level: 2 },
    { hts_code: '8541400000', description: 'Photosensitive semiconductor devices (solar cells)', general_rate: 'Free', special_rates: '', unit_of_quantity: 'No.', chapter: 85, indent_level: 2 },
    { hts_code: '8542310000', description: 'Processors and controllers, electronic integrated circuits', general_rate: 'Free', special_rates: '', unit_of_quantity: 'No.', chapter: 85, indent_level: 2 },
    { hts_code: '8544200000', description: 'Co-axial cable and other coaxial electric conductors', general_rate: '3.5%', special_rates: 'Free (AU, BH, CL, CO, IL, JO, KR, MA, OM, PA, PE, SG)', unit_of_quantity: 'kg', chapter: 85, indent_level: 2 },

    // Chapter 44 - Wood products
    { hts_code: '4407100000', description: 'Coniferous wood sawn or chipped lengthwise', general_rate: 'Free', special_rates: '', unit_of_quantity: 'cbm', chapter: 44, indent_level: 2 },
    { hts_code: '4412340000', description: 'Plywood with tropical wood outer ply', general_rate: '8%', special_rates: 'Free (AU, BH, CL, CO, IL, JO, KR, MA, OM, PA, PE, SG)', unit_of_quantity: 'cbm', chapter: 44, indent_level: 2 },
    { hts_code: '4418200000', description: 'Doors and their frames and thresholds of wood', general_rate: '3.2%', special_rates: 'Free (AU, BH, CL, CO, IL, JO, KR, MA, OM, PA, PE, SG)', unit_of_quantity: 'No.', chapter: 44, indent_level: 2 },
    { hts_code: '4421990098', description: 'Other articles of wood, nesoi', general_rate: '3.3%', special_rates: 'Free (AU, BH, CL, CO, IL, JO, KR, MA, OM, PA, PE, SG)', unit_of_quantity: 'kg', chapter: 44, indent_level: 2 },

    // Chapter 73 - Iron/Steel articles
    { hts_code: '7307190000', description: 'Cast fittings of stainless steel', general_rate: '5%', special_rates: 'Free (AU, BH, CL, CO, IL, JO, KR, MA, OM, PA, PE, SG)', unit_of_quantity: 'kg', chapter: 73, indent_level: 2 },
    { hts_code: '7308900000', description: 'Structures and parts of structures of iron or steel, nesoi', general_rate: 'Free', special_rates: '', unit_of_quantity: 'kg', chapter: 73, indent_level: 2 },
    { hts_code: '7318150000', description: 'Threaded bolts of iron or steel', general_rate: 'Free', special_rates: '', unit_of_quantity: 'kg', chapter: 73, indent_level: 2 },
    { hts_code: '7323930000', description: 'Table, kitchen or household articles of stainless steel', general_rate: '2%', special_rates: 'Free (AU, BH, CL, CO, IL, JO, KR, MA, OM, PA, PE, SG)', unit_of_quantity: 'No.', chapter: 73, indent_level: 2 },
    { hts_code: '7326909886', description: 'Other articles of iron or steel, nesoi', general_rate: '2.9%', special_rates: 'Free (AU, BH, CL, CO, IL, JO, KR, MA, OM, PA, PE, SG)', unit_of_quantity: 'kg', chapter: 73, indent_level: 2 },

    // Chapter 94 - Furniture
    { hts_code: '9401610000', description: 'Upholstered seats with wooden frames', general_rate: 'Free', special_rates: '', unit_of_quantity: 'No.', chapter: 94, indent_level: 2 },
    { hts_code: '9401690000', description: 'Other seats with wooden frames', general_rate: 'Free', special_rates: '', unit_of_quantity: 'No.', chapter: 94, indent_level: 2 },
    { hts_code: '9403400000', description: 'Wooden furniture for kitchen', general_rate: 'Free', special_rates: '', unit_of_quantity: 'No.', chapter: 94, indent_level: 2 },
    { hts_code: '9403500000', description: 'Wooden furniture for bedroom', general_rate: 'Free', special_rates: '', unit_of_quantity: 'No.', chapter: 94, indent_level: 2 },
    { hts_code: '9403600000', description: 'Other wooden furniture', general_rate: 'Free', special_rates: '', unit_of_quantity: 'No.', chapter: 94, indent_level: 2 },
    { hts_code: '9403890000', description: 'Furniture of other materials (bamboo, rattan)', general_rate: 'Free', special_rates: '', unit_of_quantity: 'No.', chapter: 94, indent_level: 2 },

    // Chapter 69 - Ceramics
    { hts_code: '6911100000', description: 'Tableware and kitchenware of porcelain or china', general_rate: '20%', special_rates: 'Free (AU, BH, CL, CO, IL, JO, KR, MA, OM, PA, PE, SG)', unit_of_quantity: 'doz', chapter: 69, indent_level: 2 },
    { hts_code: '6912000000', description: 'Ceramic tableware and kitchenware, other', general_rate: '9.8%', special_rates: 'Free (AU, BH, CL, CO, IL, JO, KR, MA, OM, PA, PE, SG)', unit_of_quantity: 'doz', chapter: 69, indent_level: 2 },

    // Chapter 71 - Jewelry
    { hts_code: '7113110000', description: 'Articles of jewelry of silver', general_rate: '5%', special_rates: 'Free (AU, BH, CL, CO, IL, JO, KR, MA, OM, PA, PE, SG)', unit_of_quantity: 'kg', chapter: 71, indent_level: 2 },
    { hts_code: '7113190000', description: 'Articles of jewelry of other precious metal', general_rate: '6.5%', special_rates: 'Free (AU, BH, CL, CO, IL, JO, KR, MA, OM, PA, PE, SG)', unit_of_quantity: 'kg', chapter: 71, indent_level: 2 },
    { hts_code: '7117190000', description: 'Imitation jewelry of base metals', general_rate: '11%', special_rates: 'Free (AU, BH, CL, CO, IL, JO, KR, MA, OM, PA, PE, SG)', unit_of_quantity: 'kg', chapter: 71, indent_level: 2 },

    // Chapter 95 - Toys
    { hts_code: '9503000090', description: 'Other toys, scale models and similar recreational models', general_rate: 'Free', special_rates: '', unit_of_quantity: 'No.', chapter: 95, indent_level: 2 },
    { hts_code: '9506290000', description: 'Water sport equipment, other', general_rate: 'Free', special_rates: '', unit_of_quantity: 'No.', chapter: 95, indent_level: 2 },
    { hts_code: '9506990000', description: 'Articles for sports and outdoor games, other', general_rate: 'Free', special_rates: '', unit_of_quantity: 'No.', chapter: 95, indent_level: 2 },

    // Additional common imports - Chapter 20 (Prepared vegetables/fruits)
    { hts_code: '2008199000', description: 'Nuts and other seeds, preserved, nesoi', general_rate: '17.9%', special_rates: 'Free (AU, BH, CL, CO, IL, JO, KR, MA, OM, PA, PE, SG)', unit_of_quantity: 'kg', chapter: 20, indent_level: 2 },
    { hts_code: '2009410000', description: 'Pineapple juice, Brix value not exceeding 20', general_rate: '4.5¢/liter', special_rates: 'Free (AU, BH, CL, CO, IL, JO, KR, MA, OM, PA, PE, SG)', unit_of_quantity: 'liters', chapter: 20, indent_level: 2 },
    { hts_code: '2008970000', description: 'Mixtures of fruits, preserved', general_rate: '14.9%', special_rates: 'Free (AU, BH, CL, CO, IL, JO, KR, MA, OM, PA, PE, SG)', unit_of_quantity: 'kg', chapter: 20, indent_level: 2 },

    // Chapter 09 - Coffee, tea, spices
    { hts_code: '0901110000', description: 'Coffee, not roasted, not decaffeinated', general_rate: 'Free', special_rates: '', unit_of_quantity: 'kg', chapter: 9, indent_level: 2 },
    { hts_code: '0902100000', description: 'Green tea (not fermented), in packages not exceeding 3kg', general_rate: 'Free', special_rates: '', unit_of_quantity: 'kg', chapter: 9, indent_level: 2 },
    { hts_code: '0904110000', description: 'Pepper, neither crushed nor ground', general_rate: 'Free', special_rates: '', unit_of_quantity: 'kg', chapter: 9, indent_level: 2 },
    { hts_code: '0910110000', description: 'Ginger, neither crushed nor ground', general_rate: 'Free', special_rates: '', unit_of_quantity: 'kg', chapter: 9, indent_level: 2 },

    // Chapter 15 - Fats and oils
    { hts_code: '1511100000', description: 'Crude palm oil', general_rate: 'Free', special_rates: '', unit_of_quantity: 'kg', chapter: 15, indent_level: 2 },
    { hts_code: '1513110000', description: 'Crude coconut (copra) oil', general_rate: 'Free', special_rates: '', unit_of_quantity: 'kg', chapter: 15, indent_level: 2 },

    // Chapter 40 - Rubber
    { hts_code: '4001210000', description: 'Natural rubber sheets (smoked)', general_rate: 'Free', special_rates: '', unit_of_quantity: 'kg', chapter: 40, indent_level: 2 },
    { hts_code: '4011100000', description: 'New pneumatic tires of rubber, for motor cars', general_rate: '4%', special_rates: 'Free (AU, BH, CL, CO, IL, JO, KR, MA, OM, PA, PE, SG)', unit_of_quantity: 'No.', chapter: 40, indent_level: 2 },
    { hts_code: '4015190000', description: 'Rubber gloves, other than surgical', general_rate: '3%', special_rates: 'Free (AU, BH, CL, CO, IL, JO, KR, MA, OM, PA, PE, SG)', unit_of_quantity: 'doz prs', chapter: 40, indent_level: 2 },

    // Chapter 48 - Paper
    { hts_code: '4819100000', description: 'Cartons, boxes and cases of corrugated paper or paperboard', general_rate: 'Free', special_rates: '', unit_of_quantity: 'kg', chapter: 48, indent_level: 2 },
    { hts_code: '4823909586', description: 'Other articles of paper pulp, paper, paperboard, nesoi', general_rate: 'Free', special_rates: '', unit_of_quantity: 'kg', chapter: 48, indent_level: 2 },

    // Chapter 63 - Other textile articles
    { hts_code: '6302210010', description: 'Bed linen of cotton, printed', general_rate: '7.8%', special_rates: 'Free (BH, CL, CO, IL, JO, KR, MA, OM, PA, PE, SG)', unit_of_quantity: 'kg', chapter: 63, indent_level: 2 },
    { hts_code: '6302600000', description: 'Toilet linen and kitchen linen of terry toweling of cotton', general_rate: '9.1%', special_rates: 'Free (BH, CL, CO, IL, JO, KR, MA, OM, PA, PE, SG)', unit_of_quantity: 'kg', chapter: 63, indent_level: 2 },
    { hts_code: '6305330000', description: 'Sacks and bags for packing, of polyethylene strips', general_rate: '8.4%', special_rates: 'Free (BH, CL, CO, IL, JO, KR, MA, OM, PA, PE, SG)', unit_of_quantity: 'No.', chapter: 63, indent_level: 2 },

    // Chapter 84 - Machinery
    { hts_code: '8414510000', description: 'Table, floor, wall fans with self-contained electric motor <=125W', general_rate: '4.7%', special_rates: 'Free (AU, BH, CL, CO, IL, JO, KR, MA, OM, PA, PE, SG)', unit_of_quantity: 'No.', chapter: 84, indent_level: 2 },
    { hts_code: '8415100060', description: 'Window or wall type air conditioning machines', general_rate: '2.2%', special_rates: 'Free (AU, BH, CL, CO, IL, JO, KR, MA, OM, PA, PE, SG)', unit_of_quantity: 'No.', chapter: 84, indent_level: 2 },
    { hts_code: '8418100000', description: 'Combined refrigerator-freezers', general_rate: '1%', special_rates: 'Free (AU, BH, CL, CO, IL, JO, KR, MA, OM, PA, PE, SG)', unit_of_quantity: 'No.', chapter: 84, indent_level: 2 },
    { hts_code: '8443310000', description: 'Printers, copying machines', general_rate: 'Free', special_rates: '', unit_of_quantity: 'No.', chapter: 84, indent_level: 2 },
    { hts_code: '8450110000', description: 'Washing machines, fully automatic, <=10kg dry linen capacity', general_rate: '1%', special_rates: 'Free (AU, BH, CL, CO, IL, JO, KR, MA, OM, PA, PE, SG)', unit_of_quantity: 'No.', chapter: 84, indent_level: 2 },
  ];

  return codes;
}

async function main() {
  console.log('=== HTS Code Loader ===\n');

  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  let allCodes: HTSCode[] = [];
  let apiSuccess = 0;
  let apiFail = 0;

  // Attempt to fetch from USITC API
  const chaptersToFetch = [3, 9, 15, 16, 20, 39, 40, 42, 44, 48, 61, 62, 63, 64, 69, 71, 73, 84, 85, 94, 95];

  console.log(`Attempting to fetch ${chaptersToFetch.length} key chapters from USITC API...\n`);

  for (const chapter of chaptersToFetch) {
    const codes = await fetchChapter(chapter);
    if (codes.length > 0) {
      allCodes.push(...codes);
      apiSuccess++;
      console.log(`  Chapter ${chapter.toString().padStart(2, '0')}: loaded ${codes.length} codes`);
    } else {
      apiFail++;
    }
    // Rate limit: pause between requests
    await new Promise(r => setTimeout(r, 300));
  }

  console.log(`\nAPI results: ${apiSuccess} chapters loaded, ${apiFail} chapters failed`);

  // Merge with curated codes (always include these as baseline)
  const curatedCodes = getCuratedHTSCodes();
  const existingCodeSet = new Set(allCodes.map(c => c.hts_code));

  let curatedAdded = 0;
  for (const code of curatedCodes) {
    if (!existingCodeSet.has(code.hts_code)) {
      allCodes.push(code);
      curatedAdded++;
    }
  }

  console.log(`Added ${curatedAdded} curated codes (${curatedCodes.length} total curated, ${curatedCodes.length - curatedAdded} already from API)`);

  // Sort by HTS code
  allCodes.sort((a, b) => a.hts_code.localeCompare(b.hts_code));

  // Write JSON
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(allCodes, null, 2));
  console.log(`\nWrote ${allCodes.length} HTS codes to ${OUTPUT_FILE}`);

  // Write SQL insert script
  const sqlLines = [
    '-- HTS Schedule Import',
    '-- Generated by load-hts-codes.ts',
    `-- ${new Date().toISOString()}`,
    '',
    'CREATE TABLE IF NOT EXISTS hts_codes (',
    '  id SERIAL PRIMARY KEY,',
    '  hts_code VARCHAR(10) NOT NULL UNIQUE,',
    '  description TEXT NOT NULL,',
    '  general_rate VARCHAR(100),',
    '  special_rates TEXT,',
    '  unit_of_quantity VARCHAR(50),',
    '  chapter INTEGER NOT NULL,',
    '  indent_level INTEGER DEFAULT 0,',
    '  created_at TIMESTAMP DEFAULT NOW()',
    ');',
    '',
    'CREATE INDEX IF NOT EXISTS idx_hts_code ON hts_codes(hts_code);',
    'CREATE INDEX IF NOT EXISTS idx_hts_chapter ON hts_codes(chapter);',
    '',
  ];

  for (const code of allCodes) {
    const desc = code.description.replace(/'/g, "''");
    const generalRate = code.general_rate.replace(/'/g, "''");
    const specialRates = code.special_rates.replace(/'/g, "''");
    const unit = code.unit_of_quantity.replace(/'/g, "''");
    sqlLines.push(
      `INSERT INTO hts_codes (hts_code, description, general_rate, special_rates, unit_of_quantity, chapter, indent_level) VALUES ('${code.hts_code}', '${desc}', '${generalRate}', '${specialRates}', '${unit}', ${code.chapter}, ${code.indent_level}) ON CONFLICT (hts_code) DO UPDATE SET description = EXCLUDED.description, general_rate = EXCLUDED.general_rate, special_rates = EXCLUDED.special_rates;`
    );
  }

  fs.writeFileSync(SQL_FILE, sqlLines.join('\n'));
  console.log(`Wrote SQL insert script to ${SQL_FILE}`);

  console.log(`\n=== Summary ===`);
  console.log(`Total HTS codes: ${allCodes.length}`);
  console.log(`Chapters covered: ${[...new Set(allCodes.map(c => c.chapter))].sort((a, b) => a - b).join(', ')}`);
}

main().catch(console.error);
