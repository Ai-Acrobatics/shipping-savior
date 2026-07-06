# Launch Checklist — Web Production + App Store / Play Submission

> **Date:** 2026-07-06 · **Owner legend:** 🤖 agent-doable from the VPS · 👤 Julian/Blake (account/money/identity decisions)
> Status legend: ✅ done (this session) · ⏳ in flight · ⬜ open

## Phase 1 — Web production (shipping-savior.vercel.app)

| # | Item | Owner | Status |
|---|------|-------|--------|
| 1.1 | Push branch + open PR ([#58](https://github.com/Ai-Acrobatics/shipping-savior/pull/58)) | 🤖 | ✅ |
| 1.2 | Merge origin/main (PRs #52–57) into the branch, resolve conflicts | 🤖 | ✅ |
| 1.3 | Prod DB backup (CSV export → vault artifacts) | 🤖 | ✅ |
| 1.4 | Apply migrations 0004/0005/0006 (workbook enum + import_meta, push_tokens, shelf_life) — applied manually per DB-MIGRATION-RUNBOOK, tracking rows inserted, `db:migrate` idempotent | 🤖 | ✅ |
| 1.5 | **Heal prod schema drift**: 10 missing migration-0000 columns added to `shipments` (reference, origin/dest_port, container_count/type, cargo_type, value_usd, progress, current_location, user_id) — removes the AI-8055 workaround class | 🤖 | ✅ |
| 1.6 | Vercel env: `AUTH_URL` re-set clean; 5 Stripe placeholder vars + `BILLING_PLACEHOLDER=true` added | 🤖 | ✅ |
| 1.7 | Billing placeholder mode in code (open limits, safe 503s, billing-page banner) — **everything testable without Stripe** | 🤖 | ✅ |
| 1.8 | CI green (typecheck + vitest 214/214). NOTE: Playwright e2e job has been failing on main since ≤6/26 (pre-existing; PRs #52–57 merged over it) | 🤖 | ✅ unit · e2e = 1.11 |
| 1.9 | Merge PR #58 → main (`d14c1dc`, 2026-07-06) | 🤖 | ✅ |
| 1.10 | Production deploy + smoke test — 15/15 route checks + mobile-auth e2e (register → token login → authed API → push token) green on prod | 🤖 | ✅ |
| 1.11 | Fix the pre-existing Playwright e2e CI failure — root cause was framer-motion mid-fade frames misread by axe; fixed via MotionConfig reducedMotion="user" + reduced-motion emulation in the a11y helper (PR #59) | 🤖 | ✅ |
| 1.12 | Custom domain (e.g. shippingsavior.com) → Vercel + update `AUTH_URL`/OAuth redirect URIs | 👤 | ⬜ |
| 1.13 | Verify Google OAuth client is a **Web** client — verified 7/6: authorize URL with prod redirect_uri reaches the Google sign-in page (no redirect_uri_mismatch) | 🤖 | ✅ |
| 1.14 | Resend: verify a real sending domain, set `EMAIL_FROM`, then flip `REQUIRE_EMAIL_VERIFICATION=true` | 👤 | ⬜ |
| 1.15 | `BLOB_READ_WRITE_TOKEN`: Blob store `shipping-savior-bol` created + linked, token in all envs (7/6) | 🤖 | ✅ |

### Swapping Stripe placeholders for the real thing (when ready to charge)
1. Stripe dashboard: create products — Premium $499/mo, Enterprise (TBD) → copy the two price IDs.
2. Add webhook `https://shipping-savior.vercel.app/api/billing/webhook`, events: `checkout.session.completed`, `customer.subscription.*`, `invoice.payment_failed` → copy signing secret.
3. Replace the 5 Vercel env vars (`STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_PRICE_PREMIUM_MONTHLY`, `STRIPE_PRICE_ENTERPRISE_MONTHLY`) and **delete `BILLING_PLACEHOLDER`** (or set `false`).
4. Redeploy → test checkout with card `4242 4242 4242 4242` → confirm webhook flips org.planTier.

## Phase 2 — iOS App Store

| # | Item | Owner | Status |
|---|------|-------|--------|
| 2.1 | Expo app built (`mobile/`, SDK 57, `com.shippingsavior.app`) | 🤖 | ✅ |
| 2.2 | EAS project linked: [@julianai/shipping-savior](https://expo.dev/accounts/julianai/projects/shipping-savior) (`351f2cbc…`) — push tokens now work | 🤖 | ✅ |
| 2.3 | **Apple Developer Program** ($99/yr) — decide owning entity (recommend JV) | 👤 | ⬜ **gate** |
| 2.4 | `eas credentials -p ios` — sign in with the Apple account once; EAS manages certs/profiles + APNs key | 👤 (then 🤖) | ⬜ |
| 2.5 | `eas build -p ios --profile production` (cloud — **no Mac needed**) | 🤖 | ⬜ |
| 2.6 | App Store Connect: app record "Shipping Savior", category Business, privacy policy `https://shipping-savior.vercel.app/privacy`, App Privacy questionnaire (collects email, name, PostHog usage data) | 👤 | ⬜ |
| 2.7 | Screenshots (6.7" + 6.1" iPhone; 13" iPad if iPad enabled) — capture from simulator/TestFlight | 🤖/👤 | ⬜ |
| 2.8 | `eas submit -p ios` → TestFlight internal → Beta App Review (~24–48h) for external testers → App Store review | 👤/🤖 | ⬜ |
| 2.9 | Runtime smoke test first: `cd mobile && npx expo start` + Expo Go against prod API (login, shipments, scan, assistant) | 🤖/👤 | ⬜ **do before any store build** |

## Phase 3 — Android / Play Store

| # | Item | Owner | Status |
|---|------|-------|--------|
| 3.1 | Same Expo codebase — nothing extra to build | 🤖 | ✅ |
| 3.2 | **EAS build credits**: julianai account is at 100% of the monthly free tier — first build waits for reset or a pay-as-you-go OK (~$1–2/Android build) | 👤 | ⬜ **gate** |
| 3.3 | First `eas build -p android --profile preview` must run **interactively once** (EAS generates + stores the keystore; `--non-interactive` can't) | 🤖/👤 | ⬜ |
| 3.4 | **Play Console** account ($25 one-time) — use an **organization** account (personal accounts need 12 testers × 14 days before production) | 👤 | ⬜ **gate** |
| 3.5 | Firebase project → add Android app `com.shippingsavior.app` → upload FCM service-account key via `eas credentials -p android` (push) | 🤖 after 👤 creates | ⬜ |
| 3.6 | Play Console: store listing, data-safety form (email/name/analytics), content rating questionnaire, screenshots + feature graphic | 👤/🤖 | ⬜ |
| 3.7 | `eas build -p android --profile production` (AAB) → `eas submit -p android` → internal testing → production | 🤖 | ⬜ |

## Phase 4 — Post-launch build order (Blake-ROI, from PRODUCTION-GAP-ANALYSIS Part 6)

1. ✅ Cutoff alarm engine + Expo Push sender — hourly cron `/api/cron/cutoff-alerts`, org fanout, dedupe, token pruning, mobile deep links (PR #59)
2. ⬜ Load board CSV/xlsx export + AES filing tracker
3. ⬜ Terminal49 webhook + DCSA events → demurrage meter, vessel map
4. ⬜ Backhaul finder v1 · Jones Act + multi-modal markers
5. ⬜ Mobile v1.1: offline cache, review-queue screen, biometric unlock, push deep links

## Hard gates summary (the only things money/identity block)

- **Apple Developer account** ($99) → unlocks 2.4–2.8 (iOS on phones)
- **Play Console account** ($25) + **EAS build credits decision** → unlocks 3.3–3.7 (Android on phones)
- Everything else is agent-executable from the VPS.
