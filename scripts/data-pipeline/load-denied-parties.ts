/**
 * Refresh the denied-party screening lists (AI-12017).
 *
 * Source: the International Trade Administration's Consolidated Screening
 * List — a free, public, government-published merge of every US restricted
 * party list that matters at the border:
 *
 *   OFAC SDN and Non-SDN Consolidated, BIS Entity List, BIS Denied Persons,
 *   BIS Unverified List, State Department debarred parties, and the DHS UFLPA
 *   Entity List.
 *
 * Writes data/denied-parties.json, which lib/data/denied-parties.ts prefers
 * over the bundled seed. When that file exists, the "seed list only" caveat
 * disappears from every screening result — so this script is what turns the
 * agent from a demo into a control.
 *
 * Run it on a schedule. Sanctions lists change weekly and a stale export is
 * indistinguishable from not screening at all.
 *
 *   npm run load:denied-parties
 */

import * as fs from "fs";
import * as path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const OUTPUT_FILE = path.join(DATA_DIR, "denied-parties.json");

const CSL_URL =
  process.env.CSL_URL ??
  "https://data.trade.gov/downloadable_consolidated_screening_list/v1/consolidated.json";

/** Trade.gov source names → our ScreeningListSource union. */
const SOURCE_MAP: Record<string, string> = {
  "Specially Designated Nationals (SDN) - Treasury Department": "OFAC-SDN",
  "Non-SDN Menu-Based Sanctions List (NS-MBS List) - Treasury Department": "OFAC-CONSOLIDATED",
  "Sectoral Sanctions Identifications List (SSI) - Treasury Department": "OFAC-CONSOLIDATED",
  "Foreign Sanctions Evaders (FSE) - Treasury Department": "OFAC-CONSOLIDATED",
  "Entity List (EL) - Bureau of Industry and Security": "BIS-ENTITY-LIST",
  "Denied Persons List (DPL) - Bureau of Industry and Security": "BIS-DENIED-PERSONS",
  "Unverified List (UVL) - Bureau of Industry and Security": "BIS-UNVERIFIED",
  "Military End User (MEU) List - Bureau of Industry and Security": "BIS-ENTITY-LIST",
  "AECA Debarred List (DTC) - State Department": "STATE-DEBARRED",
  "Nonproliferation Sanctions (ISN) - State Department": "STATE-DEBARRED",
  "Uyghur Forced Labor Prevention Act Entity List (UFLPA) - Department of Homeland Security":
    "DHS-UFLPA-ENTITY-LIST",
};

interface CslRecord {
  id?: string;
  name?: string;
  alt_names?: string[];
  source?: string;
  programs?: string[];
  countries?: string[];
  federal_register_notice?: string;
  start_date?: string;
  remarks?: string;
  addresses?: { country?: string }[];
}

function mapSource(source: string | undefined): string | null {
  if (!source) return null;
  if (SOURCE_MAP[source]) return SOURCE_MAP[source];
  // Trade.gov renames list titles occasionally; fall back to a substring read
  // rather than silently dropping records we do want.
  const lower = source.toLowerCase();
  if (lower.includes("uyghur")) return "DHS-UFLPA-ENTITY-LIST";
  if (lower.includes("entity list")) return "BIS-ENTITY-LIST";
  if (lower.includes("denied persons")) return "BIS-DENIED-PERSONS";
  if (lower.includes("unverified")) return "BIS-UNVERIFIED";
  if (lower.includes("specially designated")) return "OFAC-SDN";
  if (lower.includes("treasury")) return "OFAC-CONSOLIDATED";
  if (lower.includes("state department")) return "STATE-DEBARRED";
  return null;
}

async function main(): Promise<void> {
  console.log(`[denied-parties] Fetching consolidated screening list from ${CSL_URL}`);

  const response = await fetch(CSL_URL, {
    headers: { Accept: "application/json", "User-Agent": "shipping-savior-compliance/1.0" },
  });
  if (!response.ok) {
    throw new Error(
      `Consolidated screening list request failed: ${response.status} ${response.statusText}`
    );
  }

  const payload = (await response.json()) as { results?: CslRecord[] };
  const records = payload.results ?? [];
  if (records.length === 0) {
    throw new Error("Consolidated screening list returned zero records — refusing to overwrite.");
  }

  const entries = records
    .map((record) => {
      const source = mapSource(record.source);
      if (!source || !record.name) return null;
      const countries = Array.from(
        new Set(
          [
            ...(record.countries ?? []),
            ...(record.addresses ?? []).map((address) => address.country).filter(Boolean),
          ].filter(Boolean) as string[]
        )
      );
      return {
        id: record.id ?? `${source}-${record.name}`.slice(0, 120),
        name: record.name,
        aliases: record.alt_names?.filter(Boolean) ?? undefined,
        source,
        program: (record.programs ?? []).join(", ") || source,
        countries: countries.length > 0 ? countries : undefined,
        citation: record.federal_register_notice ?? record.start_date ?? undefined,
        remarks: record.remarks ?? undefined,
      };
    })
    .filter(Boolean);

  // A collapse to a fraction of the expected size means the upstream schema
  // moved. Overwriting a good export with a broken one is worse than failing.
  if (entries.length < records.length * 0.5) {
    throw new Error(
      `Only mapped ${entries.length} of ${records.length} records — source schema likely changed. Not writing.`
    );
  }

  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(
    OUTPUT_FILE,
    JSON.stringify(
      {
        exportedAt: new Date().toISOString().slice(0, 10),
        source: "trade.gov Consolidated Screening List",
        sourceUrl: CSL_URL,
        entries,
      },
      null,
      2
    )
  );

  const bySource = entries.reduce<Record<string, number>>((acc, entry) => {
    const key = (entry as { source: string }).source;
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});

  console.log(`[denied-parties] Wrote ${entries.length} entries to ${OUTPUT_FILE}`);
  for (const [source, count] of Object.entries(bySource).sort()) {
    console.log(`  ${source.padEnd(26)} ${count}`);
  }
}

main().catch((error) => {
  console.error("[denied-parties] Refresh failed:", error);
  process.exit(1);
});
