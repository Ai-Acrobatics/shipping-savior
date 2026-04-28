# Worker 1 PLAN — AI-8779 Real product data foundation

## Scope (sub-areas A, B, E)

### Discovery findings
- `shipments` table ALREADY exists in `src/lib/db/schema.ts` (lines 317-340) with BOL-OCR-flavored columns: containerNumber, vesselName, voyageNumber, pol, pod, etd, eta, carrier, shipper, consignee, notifyParty, goodsDescription, weightKg, quantity, status (in_transit/arrived/delayed/pending), source (manual/bol_ocr).
- `organizations` table at lines 47-54, no `is_demo` flag yet.
- No drizzle migrations exist yet (`drizzle/` empty). `npm run db:generate` will produce the first migration which will include both shipments + new is_demo column.
- `/api/shipments` route already exists for create/list (no auth, no org scope) — I'll keep it backward compatible and add the `import` sub-route.
- `csv-parse` already in deps.
- `src/app/dashboard/page.tsx` has its OWN inline mocks (not from dashboard.ts) — out of scope per ticket. Per ticket scope, I focus on `dashboard/savings/page.tsx` + the *.ts file rename.
- `src/lib/data/dashboard.ts` is imported by 11 components — renaming would require touching all of them. The ticket says "Rename dashboard.ts → demo-data.ts" but that creates churn outside scope. Solution: KEEP `dashboard.ts` as a re-export shim that points at `demo-data.ts`, so all 11 importers stay working.

### Plan
1. **Schema additions** (A+B+E)
   - Extend existing `shipments` table:
     - Add columns: `userId` FK, `reference`, `originPort`, `destPort`, `containerCount`, `containerType`, `cargoType`, `valueUsd`, `progress`, `currentLocation`
     - Extend `shipmentStatusEnum` with: `booked`, `at_port`, `customs`, `delivered`
   - Add `isDemo` boolean to `organizations` (default false)

2. **Migration**: `npm run db:generate` → creates first migration file under `drizzle/`. Commit it.

3. **Queries** (`src/lib/db/queries/shipments.ts`)
   - `getShipmentsByOrg(orgId)`
   - `createShipment(data)`
   - `bulkInsertShipments(rows)`

4. **API route** `src/app/api/shipments/import/route.ts`
   - Auth guard via `auth()`
   - POST multipart/form-data file upload OR JSON body with `csvText`
   - Parse with `csv-parse/sync`
   - Validate rows (zod or hand-rolled)
   - Mode: `?dryRun=1` returns preview rows + errors WITHOUT inserting
   - Mode: default → `bulkInsertShipments` scoped to `session.user.orgId`

5. **Import UI page** `src/app/(platform)/platform/shipments/import/page.tsx`
   - "use client" component with drag-drop CSV
   - Download template button (links to `/api/shipments/template.csv` GET that streams a static CSV)
   - Preview table (editable cells for bad rows? — keep simple v1: show errors, let user re-upload)
   - Commit button → POST without dryRun

6. **Demo mode separation** (E)
   - Create `src/lib/data/demo-data.ts` (rename target). Make `src/lib/data/dashboard.ts` re-export everything from `demo-data.ts` so the 11 existing importers keep working.
   - Update `src/app/dashboard/savings/page.tsx`: server-render? No, it's "use client". Convert to a client component that fetches from `/api/shipments/savings-summary` OR a simpler approach: gate via session+org `is_demo` lookup at server level. Cleanest: convert savings/page.tsx to a server component that reads `is_demo`, passes data to client child.
   - Add a server helper `getOrgWithDemoFlag(orgId)` that returns `{ id, is_demo }`.
   - For `src/app/dashboard/page.tsx`: ticket says "check session.user.orgId.is_demo" — but this is "use client". Convert to server component shell that loads shipments + flags, hands data to client child.
   - Empty state: when DB returns 0 shipments, render "No shipments yet — Import CSV" CTA pointing at `/platform/shipments/import`.

7. **Build + types** — `npm run build` + `npx tsc --noEmit`

### Risks / mitigations
- `dashboard/page.tsx` rewrite touches lots of UI. Risk = scope creep. Mitigation: minimal change — add a single conditional at top: if (orgIsDemo) render existing component, else render new DB-backed component or empty state. Keep existing demo data exposed; just add a real-data path.
- Renaming dashboard.ts breaks 11 imports. Mitigation: re-export shim.
- The existing `shipments` table has nullable `orgId`. Bulk insert must require orgId for imports but keep schema permissive.

### Out of scope (follow-ups)
- C: Manual entry form
- D: 3 missing calculators
- Ephemeral /demo session route
- Touching layout.tsx, auth files, next.config.mjs
