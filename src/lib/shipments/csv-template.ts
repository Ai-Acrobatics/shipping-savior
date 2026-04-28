// Shared CSV template definition for the shipments import flow.
// Lives outside `src/app/api/.../route.ts` because Next.js App Router
// route files only allow specific named exports (GET/POST/etc + config).

export const CSV_TEMPLATE_COLUMNS = [
  "reference",
  "origin_port",
  "dest_port",
  "carrier",
  "etd",
  "eta",
  "container_count",
  "container_type",
  "cargo_type",
  "weight_kg",
  "value_usd",
] as const;

export type CsvTemplateColumn = (typeof CSV_TEMPLATE_COLUMNS)[number];
