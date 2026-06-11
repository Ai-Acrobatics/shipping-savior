# What's Next — Shipping Savior

> **Last updated**: 2026-06-11 (AI-10777 session)
> **Status**: 🟢 v1.0 commercial platform on main; hardening + mobile readiness on `AI-10777-platform-hardening-mobile`
> **Priority**: P1

## Current State

- **main (`6b0bf2d`, 2026-05-15)**: marketing site + demo, 6 calculators with persistence, NextAuth v5 (credentials + Google/GitHub OAuth, email verify, password reset, invites, RBAC), Stripe billing with tier metering, BOL OCR + contract parsing (Claude Sonnet 4 → Gemini 2.5 Pro → Kimi K2 fallback), AI chat with 8 logistics tools, Sentry + PostHog, CI green (typecheck + vitest + Playwright).
- **Branch `AI-10777-platform-hardening-mobile`** (this session):
  - `/api/shipments` auth-gated + org-scoped + paginated (closes 2026-05-31 audit blocker #3); 6 new unit tests (40 total).
  - Installable PWA: manifest, branded icons, service worker with offline page, apple-icon, viewport/theme metadata.
  - Capacitor iOS/Android scaffolding + `docs/MOBILE-APP-READINESS.md` (TestFlight / App Store / Play Store runbook).
  - Shipments table Load More pagination UI.
  - Graphify knowledge graph committed (`graphify-out/`, 8,855 nodes).

## ⚠️ Lost work — needs decision

The AI-10401/10403/10404 scope (AI assistant route planner, Terminal49 webhook + DCSA mapper, workbook intake + review queue, cross-dock board) is **not in this repo on any branch** — it was local uncommitted work on another machine (see 2026-05-31 production-readiness audit). Either locate that checkout or re-scope/rebuild. Linear states for those issues overstate reality.

## Immediate (ops, mostly Julian)

- Push `AI-10777-platform-hardening-mobile` + open PR (no GitHub credentials on the VPS; bundle in `obsidian-vault/Projects/Shipping Savior/artifacts/`).
- Vercel envs still missing: `OPENROUTER_API_KEY`, `BLOB_READ_WRITE_TOKEN`, `STRIPE_SECRET_KEY`, `TERMINAL49_WEBHOOK_SECRET`; Stripe products + webhook not created in dashboard.
- Apply Supabase migrations after backup (audit listed 0004/0005 pending on the lost checkout — main has only 0000–0003).
- Apple Developer account ($99/yr, recommend JV entity) + Play Console ($25) for native apps; iOS build needs a Mac (see `docs/MOBILE-APP-READINESS.md`).

## Next build milestones

1. Rebuild/recover workbook intake → review queue → load board (Blake's refrigerated-export MVP per audit).
2. Terminal49 webhook receiver + DCSA-normalized events (AI-10404 scope).
3. Native v1.1: push notifications (shipment delay/tariff alerts), camera → BOL OCR.
4. Idempotency constraints for source files/shipments; audit events for intake/parsing failures.
