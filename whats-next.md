# What's Next — Shipping Savior

> **Last updated**: 2026-07-06 (mobile + gap-analysis session)
> **Status**: 🟢 v1.0 web code-complete + native Expo app built; launch is ops-gated
> **Priority**: P1
> **Authoritative launch plan**: `docs/PRODUCTION-GAP-ANALYSIS.md`

## Current State

- **Branch `AI-10777-platform-hardening-mobile`** (ahead of main, needs push/merge):
  - Everything from 2026-06-11/12 sessions: workbook intake → review queue → weekly load board (the "lost work", rebuilt), cold-chain shelf-life calculator, team management + invite emails, GDPR (cookie consent, export/delete, DPA), `/api/shipments` hardening, PWA, Capacitor scaffolds.
  - **2026-07-06:** mobile token auth (`/api/mobile/auth/login|session`, NextAuth-JWT-compatible — all existing routes work for native clients), `push_tokens` table (migration **0005**) + device registration API, and a **full native Expo app in `mobile/`** (iOS + Android, one codebase): shipments + reefer/cutoff detail, camera → BOL OCR, AI logistics assistant, landed-cost calculator, push registration, micro-interactions throughout. `docs/PRODUCTION-GAP-ANALYSIS.md` = consolidated web/iOS/Android launch plan + world-class gap diff vs the 2026-04-07 meeting.
- Web: typecheck clean, 150/150 unit tests green. Mobile: `tsc` clean, not yet device-tested.

## Immediate (ops, Julian — ~half a day, see gap doc Part 5)

1. Import the git bundle (`obsidian-vault/Projects/Shipping Savior/artifacts/`), push branch, merge PR.
2. Prod DB backup → `npm run db:migrate` (0004 + 0005 pending).
3. Vercel: fix `AUTH_URL` trailing `\n`; add 5 Stripe vars + `BLOB_READ_WRITE_TOKEN`; Stripe dashboard: products + webhook.
4. Deploy prod, smoke test → **web is live**.
5. Apple Developer ($99, JV entity) + Play Console ($25) → `eas build --platform all` (cloud — no Mac needed) → TestFlight / Play internal.

## Next build milestones (Blake-ROI order, gap doc Part 6)

1. Cutoff alarm rail + Expo Push sender (tokens already being collected).
2. Load board CSV/xlsx export + AES filing tracker.
3. Shelf-life save fix (`shelf_life` enum); port-finder/carrier-comparison real-data wiring.
4. Terminal49 webhook + DCSA events → demurrage meter, vessel map, watchdog agent.
5. Backhaul finder v1; Jones Act + multi-modal markers.
6. Mobile v1.1: offline cache, review-queue screen, biometric unlock, push deep links, login rate limit.

## Agent onboarding

Read `FABLED-FOLLOWER.md` (executor playbook) + `.planning/AGENT-PROCESS-NOTES-2026-07-06.md` (reasoning trace) before touching this repo.
