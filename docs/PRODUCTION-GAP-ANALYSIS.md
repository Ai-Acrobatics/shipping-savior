# Production Gap Analysis — Web, iOS, Android

> **Date:** 2026-07-06
> **Branch audited:** `AI-10777-platform-hardening-mobile` (HEAD `e0f4f14` + this session's commits)
> **Goal:** ship Shipping Savior to production on web, iOS (App Store), and Android (Play Store).
> **Companion docs:** `.planning/DEPLOYMENT-RUNBOOK.md`, `docs/MOBILE-APP-READINESS.md`, `docs/WORLD-CLASS-ROADMAP.md`

## Executive summary

The platform is code-complete for a v1.0 commercial launch on web: auth (credentials + OAuth scaffolding), Stripe billing with tier metering, 7 calculators, BOL OCR with 3-provider fallback, workbook intake → review queue → weekly load board, org/team management, GDPR compliance pages, PWA install, CI green (typecheck + 150 unit tests + Playwright e2e). **The remaining web gaps are almost entirely ops/config, not code** — Stripe products + env vars, OAuth client credentials, one env-var hygiene fix, and applying two DB migrations.

Mobile now has two tracks:

1. **Capacitor WebView shells** (`ios/`, `android/`) — scaffolded, load the production site. Fastest path to TestFlight, but weak against App Store Guideline 4.2 ("app-like" requirement) without a native capability.
2. **Native Expo app** (`mobile/`, built this session) — a true React Native app for iOS **and Android** with token auth, shipments, camera → BOL OCR, calculators, and push-notification registration. This is the recommended store-submission vehicle; the Capacitor shells become a fallback.

The single hard blocker neither code nor this VPS can remove: **an Apple Developer account ($99/yr) + a Mac with Xcode** for the iOS build, and **a Play Console account ($25)** for Android.

---

## Part 1 — Web production gaps

### P0 — blockers (app is broken or revenue-dead without these)

| # | Gap | Owner | Action |
|---|-----|-------|--------|
| 1 | **Stripe not configured** — 5 env vars missing in Vercel (`STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_PRICE_PREMIUM_MONTHLY`, `STRIPE_PRICE_ENTERPRISE_MONTHLY`); no products or webhook in the Stripe dashboard | Julian (dashboard access) | Create Premium ($499/mo) + Enterprise products; add webhook `https://shipping-savior.vercel.app/api/billing/webhook` subscribed to `checkout.session.completed`, `customer.subscription.*`, `invoice.payment_failed`; set the 5 vars; smoke-test checkout |
| 2 | **`AUTH_URL` has a trailing `\n`** in Vercel prod — risks 404s on every OAuth/auth callback | Julian | Remove + re-add the var via Vercel dashboard or CLI, redeploy |
| 3 | **DB migrations 0004–0005 not applied to prod** (workbook-import enum + `import_meta`; new `push_tokens` table) | Julian/agent with `DATABASE_URL` | Backup, then `npm run db:migrate` against prod |
| 4 | **Branch not pushed / merged** — all AI-10777 work (workbook intake, review queue, load board, cold-chain calc, team mgmt, GDPR, PWA, Capacitor, mobile API, Expo app) exists only on this VPS | Julian | Import the git bundle from `obsidian-vault/Projects/Shipping Savior/artifacts/`, push branch, open + merge PR |

### P1 — should fix before announcing (broken promises in the UI)

| # | Gap | Action |
|---|-----|--------|
| 5 | **Google/GitHub OAuth creds are the wrong kind** (desktop client / PAT). Login buttons are hidden until real creds exist | Create a Google **Web** OAuth client + a GitHub **OAuth App** with callbacks `https://shipping-savior.vercel.app/api/auth/callback/{google,github}`; set the 4 env vars — or ship v1 credentials-only and remove the buttons |
| 6 | **Shelf-life calculator can't save** — `shelf_life` missing from `calculatorTypeEnum` (`src/app/(platform)/platform/calculators/shelf-life/page.tsx:350`) | Add enum value + migration, wire the save call (~1 hr) |
| 7 | **Port Finder & Carrier Comparison run on mock data** (`src/app/port-finder/page.tsx:39`, `src/app/carrier-comparison/page.tsx:46`) while real APIs exist (`/api/carriers/ports`, `/api/schedules/search`, `/api/carriers/reliability`) | Wire to the real endpoints, or add a visible "demo data" badge for launch |
| 8 | **`BLOB_READ_WRITE_TOKEN` missing** — BOL PDF uploads have no durable storage in prod | Create a Vercel Blob store, set the token |
| 9 | **`REQUIRE_EMAIL_VERIFICATION=false`** — fine for launch, but flip to `true` once the Resend sending domain is verified (currently `onboarding@resend.dev`) | Verify a real domain in Resend, set `EMAIL_FROM`, flip the flag |

### P2 — post-launch hardening

- Idempotency constraints on source files/shipments; audit events for intake/parsing failures (`whats-next.md` item 4).
- Remaining Tier 0 roadmap items (Blake's workbook-replacement wedge): cutoff alarm rail, AES filing tracker, cross-dock appointment board, load-board CSV/PDF export, workbook write-back.
- Tier 1: Terminal49 webhook receiver + DCSA-normalized events (needs `TERMINAL49_WEBHOOK_SECRET`), vessel map, notification center (the new `push_tokens` table + Expo app are the delivery rail for this).
- Clean up `src/app/api-old/` and the standalone demo routes (`/offshore`, `/globe`, `/file-cards`, `/v0-chat`, `/agent-plan`) or gate them out of the sitemap.

### Web launch checklist (ordered)

1. Import bundle → push → merge `AI-10777-platform-hardening-mobile` to `main`.
2. Backup prod DB → `npm run db:migrate` (applies 0004 + 0005).
3. Fix `AUTH_URL` newline; add Stripe env vars + products + webhook; add `BLOB_READ_WRITE_TOKEN`.
4. `vercel deploy --prod`; verify: login, register, checkout (test card), BOL upload, workbook import, PWA install prompt, Lighthouse PWA pass.
5. (Optional for launch) OAuth clients, shelf-life save fix, port-finder wiring.

---

## Part 2 — iOS production gaps

Two vehicles; recommendation is the **Expo app** for the store, Capacitor shell only as a stopgap for TestFlight demos.

### Blockers (cannot be done from this Linux VPS)

| # | Gap | Notes |
|---|-----|-------|
| 1 | **Apple Developer Program membership** ($99/yr) | Decide the owning entity (recommend the JV entity per `MOBILE-APP-READINESS.md`) |
| 2 | **Mac with Xcode 16+** | Fleet Mac Mini or Julian's machine; needed for build/archive/upload |
| 3 | **App Store Connect record** | Name "Shipping Savior", category Business, privacy policy `/privacy`, App Privacy questionnaire (email, name, PostHog usage data), screenshots (6.7", 6.1", 13" iPad if supported) |

### Expo-app path (recommended)

1. On the Mac: `cd mobile && npm install && npx eas build --platform ios --profile production` (EAS cloud build also works from anywhere once the Apple account exists — **EAS can build iOS without a local Mac**, which removes blocker #2 for CI builds; a Mac is then only needed for local debugging).
2. Set `EXPO_PUBLIC_API_URL=https://shipping-savior.vercel.app` (already the default in `mobile/lib/config.ts`).
3. Push notifications: create an APNs key in the Apple account, upload to Expo (`eas credentials`); server-side sender for shipment/cutoff alerts is a Tier 1 follow-up (tokens are already collected via `/api/mobile/devices`).
4. TestFlight → external testers (Beta App Review ~24–48h) → App Store review. The native UI (shipments, camera OCR, calculators) comfortably clears Guideline 4.2.

### Capacitor-shell path (fallback)

Steps in `docs/MOBILE-APP-READINESS.md` §2: `npx cap add ios && npx cap sync ios`, set Team + bundle `com.shippingsavior.app`, archive, upload. Add `@capacitor/push-notifications` before App Store (not TestFlight) submission to survive Guideline 4.2. OAuth-in-WebView is blocked by Google — ship credentials-only.

**Note:** both vehicles use bundle ID `com.shippingsavior.app` — pick ONE for the store; the Expo app's `mobile/app.json` owns it in the recommended path (change the Capacitor ID if both are ever shipped).

---

## Part 3 — Android production gaps

The **Expo app is the Android strategy** (this was the missing piece — the Capacitor Android shell was never taken past scaffold, has no keystore and no `google-services.json`).

| # | Gap | Action |
|---|-----|--------|
| 1 | **Play Console account** ($25 one-time) | Julian/Blake — same entity decision as Apple |
| 2 | **Build + signing** | `npx eas build --platform android --profile production` — EAS manages the keystore; produces an AAB for Play Console |
| 3 | **Push (FCM)** | Create a Firebase project, add the Android app (`com.shippingsavior.app`), upload the FCM service-account key to Expo via `eas credentials` |
| 4 | **Store listing** | Data-safety form (email/name/analytics), content rating questionnaire, screenshots, feature graphic |
| 5 | **Internal testing track first** | Play requires 12+ testers for 14 days before production for new personal accounts — use an org account to skip this |

---

## Part 4 — What was built this session (closes the native-app gap)

### Backend (`src/app/api/mobile/*`)

The entire API was cookie-session only — a native app could not authenticate. Added:

- `POST /api/mobile/auth/login` — validates credentials (same checks + audit trail as the web Credentials provider) and returns a **NextAuth-compatible session JWT** encoded with the same secret/salt as the web session cookie. The client replays it as `Cookie: <cookieName>=<token>`, so **all ~48 existing `auth()`-gated API routes work for mobile unchanged** — no per-route bearer-token retrofit needed.
- `GET /api/mobile/auth/session` — token validity check on app launch.
- `POST/DELETE /api/mobile/devices` — Expo push-token registration (new `push_tokens` table, migration `0005`), org-scoped for alert fan-out.

### Expo app (`mobile/`)

Expo SDK (expo-router, TypeScript), targets iOS + Android from one codebase:

- **Auth:** login screen → `/api/mobile/auth/login`; token in `expo-secure-store`; auto session check on launch; logout unregisters the push token.
- **Shipments:** dashboard list with status filters + pull-to-refresh (`GET /api/shipments`), detail screen (route, dates, parties, reefer/workbook metadata from `importMeta`).
- **Scan:** camera / photo-library capture → `POST /api/bol` → extracted fields with confidence → save as shipment. This is the killer native feature (snap a BOL at the port).
- **Calculators:** native landed-cost calculator with save to `/api/calculations`; saved-calculations list.
- **Push:** `expo-notifications` registration on login → `/api/mobile/devices` (server-side sender is the Tier 1 notification-center work).
- **Config:** `EXPO_PUBLIC_API_URL` env (defaults to production URL); `eas.json` with development/preview/production profiles; bundle IDs `com.shippingsavior.app`.

### Remaining mobile build-out (post-v1)

- Server-side push sender (Expo Push API) triggered by cutoff alarms / Terminal49 events.
- Review-queue and load-board screens (currently web-only).
- Biometric unlock (`expo-local-authentication`).
- OAuth via system browser + deep link (`expo-auth-session`) if Google/GitHub login is wanted on mobile.
- Deep links from push notifications into shipment detail.

---

## Part 5 — Consolidated critical path

```
[VPS/agent — done this session]
  mobile API auth + push_tokens + Expo app + this plan → committed on branch, bundle exported

[Julian — ops, ~half a day]
  1. Import bundle, push branch, merge PR to main
  2. Prod DB backup → migrate (0004, 0005)
  3. Vercel env: fix AUTH_URL, add 5 Stripe vars + Blob token; Stripe dashboard: products + webhook
  4. Deploy prod → smoke test (login/checkout/BOL/workbook/PWA)
     ── WEB IS LIVE ──
  5. Apple Developer ($99, JV entity) + Play Console ($25)
  6. eas build --platform all (EAS cloud — no Mac needed for the build itself)
  7. APNs key + FCM key into eas credentials
  8. TestFlight internal → Beta review → App Store submission
  9. Play internal testing → production
     ── iOS + ANDROID ARE LIVE ──

[Agent follow-ups, parallel]
  - Shelf-life save fix; port-finder/carrier-comparison wiring or demo badges
  - Cutoff alarm rail + push sender (first real notification use case)
  - Terminal49 webhook + DCSA events
```

---

## Part 6 — World-class gap diff (2026-04-07 meeting commitments vs. today)

Sources: `docs/MEETING-TRANSCRIPT-2026-04-07-BLAKE.md`, `docs/BLAKE-CALL-ANALYSIS-2026-04-07.md`, `docs/AI-AGENTS-PLAN.md`, `docs/WORLD-CLASS-ROADMAP.md`. Blake's bar: *"a product where all of the tools that we have actually work the way that they're intended to work."*

Legend: ✅ shipped · 🟡 partial · ❌ missing

### Tier 0 — demo-blocking (Blake's operational wedge)

| Commitment | Status | Notes |
|---|---|---|
| Workbook import → review queue → weekly load board | ✅ | Shipped on this branch (was the "lost work", rebuilt) |
| Load board CSV/PDF export | ❌ | Ops handoff artifact — partners expect an emailable .xlsx |
| Cutoff alarm rail (reefer + doc cutoff, <24h alerts) | ❌ | **#1 field pain point.** Data is captured (importMeta) and mobile push tokens are now collected — needs the alert engine + Expo Push sender |
| AES filing tracker (TBD → filed → accepted, ACE links) | ❌ | 64/204 real rows were missing AES# — the biggest review-queue gap |
| Cross-dock appointment board (Port Hueneme / ANACAPA / KINGSCO) | 🟡 | Appointment data captured + shown per-shipment (web + mobile detail); no calendar/lane board view yet |
| Shelf-life calculator + temp/vent presets | 🟡 | Calculator shipped; save broken (enum), presets pending |
| Container tracking (Terminal49, DCSA events) | ❌ | AI-10404 scope, never recovered — the "live visibility" pitch foundation |

### AI vision (the "thought and logic" — 7-agent architecture from AI-AGENTS-PLAN)

| Agent | Status | Notes |
|---|---|---|
| Agent 4 — Document processing (BOL OCR) | ✅ | 3-provider fallback (Claude→Gemini→Kimi), confidence scoring; **now also on mobile via camera** |
| AI chat with logistics tools (HTS, duty, ports, routes, FTZ, specs) | ✅ | `/api/ai/chat`; **now also the mobile Assistant tab** |
| Agent 5 — Route optimization (multi-modal, cost/speed/risk) | 🟡 | `/api/routes/compare` exists; no constraint-driven recommendation engine, no rail/air legs |
| Agent 1 — Rate negotiation (FBX benchmarks, counter-offers) | ❌ | Needs FBX data ingest first — without a market baseline, recommendations are liability |
| Agent 6 — Backhaul finder (30–50% below market) | ❌ | Blake's highest-ROI wedge ($1.5–6K/container); he does this manually today |
| Agent 2 — FTZ optimizer (PF/NPF election, inverted tariff) | 🟡 | FTZ calculator is read-only; no recommendation agent |
| Agent 3 — Compliance monitor (OFAC, §301, UFLPA, HTS→agency) | ❌ | Tier 2 moat; urgent given the tariff environment |
| Agent 7 — Customer success / anomaly watchdog | ❌ | Requires event stream (Terminal49) first |
| HTS classification agent (description → GRI-ranked codes) | ❌ | Feeds FTZ inverted-tariff detection |

### Field-ops mobile (this session unblocked the rail)

| Capability | Status | Notes |
|---|---|---|
| Native app, both stores, token auth | ✅ | Built this session (`mobile/`) |
| Camera → BOL OCR at the port | ✅ | Scan tab |
| Cutoff/appointment data in hand | ✅ | Shipment detail surfaces importMeta |
| Push notifications (delivery rail) | 🟡 | Registration + storage shipped; **sender** pending (pairs with cutoff alarms) |
| Offline load-board cache | ❌ | Ports have dead zones — cache last-fetched shipments locally |
| Biometric unlock | ❌ | `expo-local-authentication`, small lift |
| Demurrage/detention countdown | ❌ | Needs Terminal49 arrival events |

### Platform commitments

| Commitment | Status | Notes |
|---|---|---|
| Jones Act lanes (Matson/Pasha, AK/HI/PR, "no customs import") | ❌ | Blake explicitly: *"we need to signify Jones Act vs non-Jones Act carriers"* |
| Multi-modal markers (ocean/rail/air/drayage) | ❌ | CMA CGM rail-to-SLC example can't be represented |
| Tiered pricing (Free/Premium/Enterprise "Cadillac") | ✅ | Pricing page + tier metering shipped; Stripe config is the blocker |
| Per-user bundles (1 → 8 → 20+ logins) | 🟡 | Team management + invites shipped; seat-count billing not modeled |
| NVOCC white-label customer portal (N/K/C/H/J tenants) | ❌ | The 10,000-NVOCC TAM story from the investor pitch |
| Vessel map (MapLibre + AIS) | ❌ | Visibility pitch visual |

### Recommended build order after launch (highest Blake-ROI first)

1. **Cutoff alarm rail + push sender** — data ✅, tokens ✅, only the engine is missing; instantly makes the mobile app indispensable.
2. **Load board export + AES tracker** — completes the Excel-replacement wedge.
3. **Terminal49 events** — unlocks demurrage meter, watchdog agent, vessel map.
4. **Backhaul finder v1** — automate what Blake does manually; the single best ROI demo in his own words.
5. **Jones Act + multi-modal markers** — small data-model lift, big credibility with Blake's lanes.
6. **FBX ingest → rate negotiation agent** — then the "planning tool" from the meeting (*"who has the best transit times, best reliability"*) becomes real.
