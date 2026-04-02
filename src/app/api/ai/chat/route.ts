import { NextRequest } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import * as fs from 'fs';
import * as path from 'path';
import Fuse from 'fuse.js';

// ─── Rate limiting ───────────────────────────────────────────────────────────
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 60_000 });
    return true;
  }
  if (entry.count >= 10) return false;
  entry.count++;
  return true;
}

// ─── Data loading (mirrors existing API route patterns) ──────────────────────
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

interface FTZZone {
  zone_number: number;
  name: string;
  city: string;
  state: string;
  state_code: string;
  operator: string;
  grantee: string;
  lat: number;
  lng: number;
  status: string;
  activated_year?: number;
  nearest_port?: string;
  port_distance_miles?: number;
  key_industries: string[];
  annual_merchandise_value_usd?: number;
  notes?: string;
}

// Cached data + indexes
let htsCodes: HTSCode[] | null = null;
let dutyRates: DutyRate[] | null = null;
let ports: Port[] | null = null;
let carrierRoutes: CarrierRoute[] | null = null;
let ftzZones: FTZZone[] | null = null;
let htsFuse: Fuse<HTSCode> | null = null;
let portFuse: Fuse<Port> | null = null;

function loadAllData() {
  const dataDir = path.join(process.cwd(), 'data');

  if (!htsCodes) {
    const p = path.join(dataDir, 'hts-schedule.json');
    htsCodes = fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, 'utf-8')) : [];
    htsFuse = new Fuse(htsCodes!, {
      keys: [
        { name: 'description', weight: 0.7 },
        { name: 'hts_code', weight: 0.3 },
      ],
      threshold: 0.4,
      includeScore: true,
    });
  }
  if (!dutyRates) {
    const p = path.join(dataDir, 'duty-rates-sea.json');
    dutyRates = fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, 'utf-8')) : [];
  }
  if (!ports) {
    const p = path.join(dataDir, 'ports.json');
    ports = fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, 'utf-8')) : [];
    portFuse = new Fuse(ports!, {
      keys: [
        { name: 'name', weight: 0.5 },
        { name: 'locode', weight: 0.3 },
        { name: 'country', weight: 0.2 },
      ],
      threshold: 0.3,
      includeScore: true,
    });
  }
  if (!carrierRoutes) {
    const p = path.join(dataDir, 'carrier-routes.json');
    carrierRoutes = fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, 'utf-8')) : [];
  }
  if (!ftzZones) {
    const p = path.join(dataDir, 'ftz-zones.json');
    ftzZones = fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, 'utf-8')) : [];
  }
}

// ─── Tool implementations ────────────────────────────────────────────────────
function searchHts(query: string, country?: string) {
  loadAllData();
  const results = htsFuse!.search(query).slice(0, 15).map(r => r.item);

  return results.map(code => {
    const countryRates: Record<string, DutyRate> = {};
    if (country) {
      const rates = (dutyRates || []).filter(
        r =>
          r.hts_chapter === code.chapter &&
          r.country_code === country.toUpperCase()
      );
      if (rates.length > 0) countryRates[country.toUpperCase()] = rates[0];
    }
    return {
      hts_code: code.hts_code,
      formatted_code: `${code.hts_code.slice(0, 4)}.${code.hts_code.slice(4, 6)}.${code.hts_code.slice(6, 10)}`,
      description: code.description,
      general_rate: code.general_rate,
      unit_of_quantity: code.unit_of_quantity,
      country_rates: Object.keys(countryRates).length > 0 ? countryRates : undefined,
    };
  });
}

function lookupDutyRate(htsCode: string, country: string) {
  loadAllData();
  const chapter = parseInt(htsCode.replace(/\./g, '').slice(0, 2));
  const rates = (dutyRates || []).filter(
    r =>
      r.hts_chapter === chapter &&
      r.country_code === country.toUpperCase()
  );

  // Also try to find the specific HTS code
  const htsMatch = (htsCodes || []).find(
    h => h.hts_code === htsCode.replace(/\./g, '')
  );

  return {
    hts_code: htsCode,
    country,
    hts_description: htsMatch?.description || 'Not found',
    general_rate: htsMatch?.general_rate || 'N/A',
    country_specific_rates: rates.slice(0, 5),
    total_matches: rates.length,
  };
}

function searchSchedules(origin: string, destination: string, carrier?: string) {
  loadAllData();
  let results = [...(carrierRoutes || [])];

  // Fuzzy match on origin/destination using port names or locodes
  const originPort = portFuse!.search(origin).slice(0, 1)[0]?.item;
  const destPort = portFuse!.search(destination).slice(0, 1)[0]?.item;

  const originCode = originPort?.locode || origin.toUpperCase();
  const destCode = destPort?.locode || destination.toUpperCase();

  results = results.filter(r => r.origin === originCode && r.destination === destCode);

  if (carrier) {
    results = results.filter(
      r =>
        r.carrier.toLowerCase().includes(carrier.toLowerCase()) ||
        r.carrier_code.toLowerCase() === carrier.toLowerCase()
    );
  }

  results.sort((a, b) => a.transit_days - b.transit_days);

  return {
    origin: originPort
      ? { locode: originPort.locode, name: originPort.name }
      : { locode: originCode, name: origin },
    destination: destPort
      ? { locode: destPort.locode, name: destPort.name }
      : { locode: destCode, name: destination },
    schedules: results.slice(0, 10).map(r => ({
      carrier: r.carrier,
      service: r.service_name,
      transit_days: r.transit_days,
      frequency: r.frequency,
      direct: r.direct,
      cost_20ft: `$${r.estimated_cost_20ft}`,
      cost_40ft: `$${r.estimated_cost_40ft}`,
      cost_40hc: `$${r.estimated_cost_40hc}`,
      transshipments: r.transshipment_ports,
    })),
    total: results.length,
  };
}

function findCarriers(port1: string, port2: string) {
  loadAllData();
  const p1 = portFuse!.search(port1).slice(0, 1)[0]?.item;
  const p2 = portFuse!.search(port2).slice(0, 1)[0]?.item;
  const code1 = p1?.locode || port1.toUpperCase();
  const code2 = p2?.locode || port2.toUpperCase();

  const routes = (carrierRoutes || []).filter(
    r =>
      (r.origin === code1 && r.destination === code2) ||
      (r.origin === code2 && r.destination === code1)
  );

  const carriers = [...new Set(routes.map(r => r.carrier))];

  return {
    port1: p1 ? { locode: p1.locode, name: p1.name } : { locode: code1, name: port1 },
    port2: p2 ? { locode: p2.locode, name: p2.name } : { locode: code2, name: port2 },
    carriers,
    routes: routes.slice(0, 10).map(r => ({
      carrier: r.carrier,
      service: r.service_name,
      transit_days: r.transit_days,
      direct: r.direct,
      cost_20ft: `$${r.estimated_cost_20ft}`,
      cost_40ft: `$${r.estimated_cost_40ft}`,
    })),
  };
}

function checkReliability(carrier?: string, route?: string) {
  loadAllData();
  let results = [...(carrierRoutes || [])];

  if (carrier) {
    results = results.filter(
      r =>
        r.carrier.toLowerCase().includes(carrier.toLowerCase()) ||
        r.carrier_code.toLowerCase() === carrier.toLowerCase()
    );
  }

  // Group by carrier
  const byCarrier: Record<string, CarrierRoute[]> = {};
  results.forEach(r => {
    if (!byCarrier[r.carrier]) byCarrier[r.carrier] = [];
    byCarrier[r.carrier].push(r);
  });

  return Object.entries(byCarrier).slice(0, 5).map(([name, routes]) => ({
    carrier: name,
    total_routes: routes.length,
    avg_transit_days: Math.round(routes.reduce((s, r) => s + r.transit_days, 0) / routes.length),
    direct_routes: routes.filter(r => r.direct).length,
    avg_cost_20ft: Math.round(routes.reduce((s, r) => s + r.estimated_cost_20ft, 0) / routes.length),
    avg_cost_40ft: Math.round(routes.reduce((s, r) => s + r.estimated_cost_40ft, 0) / routes.length),
    regions: [...new Set(routes.map(r => r.route_type))],
  }));
}

function searchPorts(query: string) {
  loadAllData();
  return portFuse!.search(query).slice(0, 10).map(r => ({
    locode: r.item.locode,
    name: r.item.name,
    country: r.item.country,
    region: r.item.region,
    size: r.item.size,
    annual_teu: r.item.annual_teu,
  }));
}

function estimateFreight(origin: string, destination: string, containerType?: string, mode?: string) {
  loadAllData();
  const originPort = portFuse!.search(origin).slice(0, 1)[0]?.item;
  const destPort = portFuse!.search(destination).slice(0, 1)[0]?.item;
  const originCode = originPort?.locode || origin.toUpperCase();
  const destCode = destPort?.locode || destination.toUpperCase();

  const routes = (carrierRoutes || []).filter(
    r => r.origin === originCode && r.destination === destCode
  );

  if (routes.length === 0) {
    return {
      origin: originPort?.name || origin,
      destination: destPort?.name || destination,
      message: 'No direct routes found for this pair. Try searching for nearby ports.',
      suggestion: originPort ? undefined : 'Could not match origin port. Try a more specific name or LOCODE.',
    };
  }

  const costKey = containerType === '40hc'
    ? 'estimated_cost_40hc'
    : containerType === '40ft'
    ? 'estimated_cost_40ft'
    : 'estimated_cost_20ft';

  const costs = routes.map(r => (r as any)[costKey] as number);
  const min = Math.min(...costs);
  const max = Math.max(...costs);
  const avg = Math.round(costs.reduce((s, c) => s + c, 0) / costs.length);

  return {
    origin: originPort?.name || origin,
    destination: destPort?.name || destination,
    container_type: containerType || '20ft',
    estimates: {
      min: `$${min}`,
      max: `$${max}`,
      average: `$${avg}`,
    },
    carriers: routes.slice(0, 5).map(r => ({
      carrier: r.carrier,
      cost: `$${(r as any)[costKey]}`,
      transit_days: r.transit_days,
    })),
    available_carriers: routes.length,
  };
}

function searchFtzZones(state?: string, nearPort?: string, industry?: string) {
  loadAllData();
  let results = [...(ftzZones || [])];

  if (state) {
    results = results.filter(z => z.state_code.toUpperCase() === state.toUpperCase());
  }
  if (nearPort) {
    // Fuzzy match port
    const port = portFuse!.search(nearPort).slice(0, 1)[0]?.item;
    const portCode = port?.locode || nearPort.toUpperCase();
    results = results.filter(z => z.nearest_port === portCode);
  }
  if (industry) {
    const q = industry.toLowerCase();
    results = results.filter(z =>
      z.key_industries.some(i => i.toLowerCase().includes(q))
    );
  }

  return results.slice(0, 15).map(z => ({
    zone_number: z.zone_number,
    name: z.name,
    city: z.city,
    state: z.state,
    operator: z.operator,
    nearest_port: z.nearest_port,
    port_distance_miles: z.port_distance_miles,
    key_industries: z.key_industries,
    status: z.status,
  }));
}

// ─── Claude tool definitions ─────────────────────────────────────────────────
const tools: Anthropic.Tool[] = [
  {
    name: 'search_hts',
    description:
      'Search HTS (Harmonized Tariff Schedule) codes by keyword. Returns matching codes with descriptions and rates.',
    input_schema: {
      type: 'object' as const,
      properties: {
        query: { type: 'string', description: 'Search keyword (e.g., "electronics", "steel pipes", "cotton shirts")' },
        country: { type: 'string', description: 'Optional country code (e.g., "CN", "VN", "MX") to get country-specific duty rates' },
      },
      required: ['query'],
    },
  },
  {
    name: 'lookup_duty_rate',
    description:
      'Get the duty rate for a specific HTS code and origin country. Returns general and country-specific rates.',
    input_schema: {
      type: 'object' as const,
      properties: {
        htsCode: { type: 'string', description: 'HTS code (e.g., "8471.30.01" or "8471300100")' },
        country: { type: 'string', description: 'Country code (e.g., "CN" for China, "VN" for Vietnam)' },
      },
      required: ['htsCode', 'country'],
    },
  },
  {
    name: 'search_schedules',
    description:
      'Find shipping schedules between two ports. Returns available carriers, transit times, frequencies, and costs.',
    input_schema: {
      type: 'object' as const,
      properties: {
        origin: { type: 'string', description: 'Origin port name or LOCODE (e.g., "Shanghai", "CNSHA")' },
        destination: { type: 'string', description: 'Destination port name or LOCODE (e.g., "Los Angeles", "USLAX")' },
        carrier: { type: 'string', description: 'Optional carrier name filter (e.g., "Maersk", "MSC")' },
      },
      required: ['origin', 'destination'],
    },
  },
  {
    name: 'find_carriers',
    description:
      'Find which shipping carriers serve two ports. Returns all carriers with routes between the two ports.',
    input_schema: {
      type: 'object' as const,
      properties: {
        port1: { type: 'string', description: 'First port name or LOCODE' },
        port2: { type: 'string', description: 'Second port name or LOCODE' },
      },
      required: ['port1', 'port2'],
    },
  },
  {
    name: 'check_reliability',
    description:
      'Get carrier reliability data including average transit times, number of routes, and cost averages.',
    input_schema: {
      type: 'object' as const,
      properties: {
        carrier: { type: 'string', description: 'Optional carrier name to filter (e.g., "Maersk")' },
        route: { type: 'string', description: 'Optional route filter' },
      },
      required: [],
    },
  },
  {
    name: 'search_ports',
    description:
      'Search for ports by name, country, or LOCODE. Returns port details including size and throughput.',
    input_schema: {
      type: 'object' as const,
      properties: {
        query: { type: 'string', description: 'Search query (port name, city, country, or LOCODE)' },
      },
      required: ['query'],
    },
  },
  {
    name: 'estimate_freight',
    description:
      'Estimate freight costs between two ports. Returns min/max/average costs by carrier.',
    input_schema: {
      type: 'object' as const,
      properties: {
        origin: { type: 'string', description: 'Origin port name or LOCODE' },
        destination: { type: 'string', description: 'Destination port name or LOCODE' },
        containerType: { type: 'string', description: 'Container type: "20ft", "40ft", or "40hc"', enum: ['20ft', '40ft', '40hc'] },
        mode: { type: 'string', description: 'Shipping mode (currently only "ocean" supported)', enum: ['ocean'] },
      },
      required: ['origin', 'destination'],
    },
  },
  {
    name: 'search_ftz_zones',
    description:
      'Search Foreign Trade Zones (FTZ) by state, nearby port, or industry. Returns zone details.',
    input_schema: {
      type: 'object' as const,
      properties: {
        state: { type: 'string', description: 'State code (e.g., "CA", "TX", "NY")' },
        nearPort: { type: 'string', description: 'Port name or LOCODE to find nearby FTZ zones' },
        industry: { type: 'string', description: 'Industry keyword (e.g., "automotive", "electronics")' },
      },
      required: [],
    },
  },
];

// ─── Execute a tool call ─────────────────────────────────────────────────────
function executeTool(name: string, input: Record<string, any>): any {
  switch (name) {
    case 'search_hts':
      return searchHts(input.query, input.country);
    case 'lookup_duty_rate':
      return lookupDutyRate(input.htsCode, input.country);
    case 'search_schedules':
      return searchSchedules(input.origin, input.destination, input.carrier);
    case 'find_carriers':
      return findCarriers(input.port1, input.port2);
    case 'check_reliability':
      return checkReliability(input.carrier, input.route);
    case 'search_ports':
      return searchPorts(input.query);
    case 'estimate_freight':
      return estimateFreight(input.origin, input.destination, input.containerType, input.mode);
    case 'search_ftz_zones':
      return searchFtzZones(input.state, input.nearPort, input.industry);
    default:
      return { error: `Unknown tool: ${name}` };
  }
}

// ─── System prompt ───────────────────────────────────────────────────────────
const SYSTEM_PROMPT = `You are Shipping Savior AI — an expert logistics assistant for international trade. You help freight brokers, importers, and FTZ operators with:
- HTS code classification and duty rate lookups
- Landed cost calculations
- Carrier schedule comparisons
- FTZ savings analysis
- Port and route information

You have access to real-time tools to look up data. Always use your tools to provide accurate, data-backed answers rather than guessing. When users ask about shipping costs, tariffs, or routes, use the appropriate tool.

Be concise and professional. Format responses with clear headings and bullet points when presenting data.`;

// ─── POST handler ────────────────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  // Rate limiting
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown';

  if (!checkRateLimit(ip)) {
    return new Response(
      JSON.stringify({ error: 'Rate limit exceeded. Max 10 messages per minute.' }),
      { status: 429, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // Check API key
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: 'Chat unavailable — API key not configured.' }),
      { status: 503, headers: { 'Content-Type': 'application/json' } }
    );
  }

  let body: { messages: Array<{ role: string; content: string }> };
  try {
    body = await request.json();
  } catch {
    return new Response(
      JSON.stringify({ error: 'Invalid request body' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  if (!body.messages || !Array.isArray(body.messages) || body.messages.length === 0) {
    return new Response(
      JSON.stringify({ error: 'messages array is required' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const client = new Anthropic({ apiKey });

  // Build the messages for Claude
  const claudeMessages: Anthropic.MessageParam[] = body.messages.map(m => ({
    role: m.role as 'user' | 'assistant',
    content: m.content,
  }));

  try {
    // Tool-use loop: keep calling Claude until we get a final text response
    let currentMessages = [...claudeMessages];
    const toolSteps: Array<{ tool: string; input: any; result: any }> = [];
    let maxIterations = 5;

    while (maxIterations > 0) {
      maxIterations--;

      const response = await client.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2048,
        system: SYSTEM_PROMPT,
        tools,
        messages: currentMessages,
      });

      // Check if there are tool calls
      const toolUseBlocks = response.content.filter(
        (b): b is Anthropic.ContentBlock & { type: 'tool_use' } => b.type === 'tool_use'
      );

      if (toolUseBlocks.length === 0) {
        // Final text response — extract text and stream it back
        const textContent = response.content
          .filter((b): b is Anthropic.TextBlock => b.type === 'text')
          .map(b => b.text)
          .join('');

        // Return as SSE stream for progressive rendering
        const encoder = new TextEncoder();
        const stream = new ReadableStream({
          start(controller) {
            // First send tool steps if any
            if (toolSteps.length > 0) {
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ type: 'tool_steps', steps: toolSteps })}\n\n`)
              );
            }

            // Stream the text in chunks for typing effect
            const chunkSize = 12;
            let i = 0;
            const sendChunk = () => {
              if (i < textContent.length) {
                const chunk = textContent.slice(i, i + chunkSize);
                controller.enqueue(
                  encoder.encode(`data: ${JSON.stringify({ type: 'text', content: chunk })}\n\n`)
                );
                i += chunkSize;
                // Use setTimeout equivalent via recursive queueing
                sendChunk();
              } else {
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'done' })}\n\n`));
                controller.close();
              }
            };
            sendChunk();
          },
        });

        return new Response(stream, {
          headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            Connection: 'keep-alive',
          },
        });
      }

      // Execute tool calls
      const toolResults: Anthropic.ToolResultBlockParam[] = [];
      for (const toolBlock of toolUseBlocks) {
        const result = executeTool(toolBlock.name, toolBlock.input as Record<string, any>);
        toolSteps.push({
          tool: toolBlock.name,
          input: toolBlock.input,
          result,
        });
        toolResults.push({
          type: 'tool_result',
          tool_use_id: toolBlock.id,
          content: JSON.stringify(result),
        });
      }

      // Add assistant response and tool results to messages
      currentMessages = [
        ...currentMessages,
        { role: 'assistant' as const, content: response.content },
        { role: 'user' as const, content: toolResults },
      ];
    }

    // If we exhausted iterations, return what we have
    return new Response(
      JSON.stringify({ error: 'Too many tool iterations' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    console.error('AI Chat error:', err);
    return new Response(
      JSON.stringify({ error: err.message || 'An error occurred' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
