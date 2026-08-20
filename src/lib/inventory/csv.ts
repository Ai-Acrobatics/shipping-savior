// ============================================================
// Container-contents CSV parsing
// AI-8869
//
// Lives in lib rather than in the importer component so it can be unit
// tested without a JSX transform, and so the API route can reuse it if we
// ever accept a raw CSV upload instead of a paste.
// ============================================================

/**
 * Parse a pasted CSV. Header-driven so column order doesn't matter, which is
 * what makes "export from your ERP and paste it" viable — every ERP emits a
 * different column order and we are not going to map each one by hand.
 */
export function parseLineItemCsv(text: string): Record<string, string>[] {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  if (lines.length < 2) return [];

  const splitRow = (row: string) =>
    row.split(",").map((cell) => cell.trim().replace(/^"|"$/g, ""));

  const headers = splitRow(lines[0]).map((h) =>
    h.toLowerCase().replace(/[^a-z0-9]/g, "")
  );

  // Common aliases across the ERP exports we've seen. Anything unrecognised is
  // ignored rather than rejected — a stray column shouldn't kill an import.
  const ALIASES: Record<string, string> = {
    sku: "sku",
    itemcode: "sku",
    partnumber: "sku",
    description: "description",
    itemdescription: "description",
    hts: "htsCode",
    htscode: "htsCode",
    tariffcode: "htsCode",
    country: "countryOfOrigin",
    countryoforigin: "countryOfOrigin",
    coo: "countryOfOrigin",
    qty: "quantity",
    quantity: "quantity",
    units: "quantity",
    uom: "unitOfMeasure",
    unitofmeasure: "unitOfMeasure",
    unitcost: "unitCostUsd",
    unitcostusd: "unitCostUsd",
    cost: "unitCostUsd",
    price: "unitCostUsd",
    supplier: "supplier",
    vendor: "supplier",
    po: "poRef",
    poref: "poRef",
    ponumber: "poRef",
    container: "containerNumber",
    containernumber: "containerNumber",
    location: "locationCode",
    locationcode: "locationCode",
  };

  return lines.slice(1).map((row) => {
    const cells = splitRow(row);
    const record: Record<string, string> = {};
    headers.forEach((header, i) => {
      const key = ALIASES[header];
      if (key && cells[i]) record[key] = cells[i];
    });
    return record;
  });
}
