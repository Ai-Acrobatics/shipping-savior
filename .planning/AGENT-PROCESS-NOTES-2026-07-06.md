# Agent Process Notes — 2026-07-06 (Fable 5)

> Reasoning trace for the mobile-app + production-gap session. Written so a
> later agent can learn the *why* behind each decision, not just the diff.
> Machine-readable executor playbook: `FABLED-FOLLOWER.md` (repo root).

## What was asked

Blake/Julian: close the gap to production (web + iOS), and build an Expo app
usable on iOS **and Android** — with micro-interactions, AI integration, the
logistics-planning intelligence from the 2026-04-07 meeting, Linear updates,
and this document.

## Decision log (with reasoning)

### D1 — Audit before building
Two parallel Explore agents (web prod-readiness, mobile state) before any code.
**Why:** `whats-next.md` was 3+ weeks stale and claimed work was "lost" that
git log showed had been rebuilt. Docs lie; commits don't. The audits changed
the plan: the web gap turned out to be ~90% ops/config, so agent effort went
to the genuinely missing piece (native app), not re-touching web features.

### D2 — Mobile auth: reuse the NextAuth session JWT, don't retrofit Bearer auth
The whole API (~48 routes) authenticates via `await auth()` reading the
NextAuth session cookie. Options considered:
1. Add Bearer-token support to every route — ~48 files touched, huge diff, drift risk.
2. Have the app drive the NextAuth CSRF/callback dance and scrape Set-Cookie — fragile, breaks on NextAuth upgrades.
3. **Chosen:** a dedicated `/api/mobile/auth/login` that validates credentials
   (mirroring the Credentials provider exactly, same audit log) and calls
   `encode()` from `next-auth/jwt` with the same `AUTH_SECRET` and salt.
   The salt **is the cookie name** (`__Secure-authjs.session-token` on HTTPS,
   `authjs.session-token` otherwise — verified in `@auth/core/lib/utils/cookie.js`).
   The client replays the token as that cookie header. `auth()` can't tell the
   difference. Zero changes to existing routes.

**Invariant for future agents:** any change to `AUTH_SECRET`, the cookie name,
or NextAuth's JWT encoding invalidates mobile sessions. The login response
returns `cookieName` explicitly so the client never hardcodes it.

### D3 — Expo (native RN) rather than extending the Capacitor WebView shells
Capacitor shells already existed and load the production site. But: (a) App
Store Guideline 4.2 is hostile to pure WebView wrappers; (b) Google blocks
OAuth in WebViews; (c) the user asked for micro-interactions and camera/push —
native capabilities; (d) EAS cloud builds remove the "need a Mac" blocker for
iOS. Capacitor shells kept as fallback but the Expo app is the store vehicle.
Both use `com.shippingsavior.app` — only one may ship per store.

### D4 — Scope of mobile v1: field-ops first
From the meeting notes, the mobile user is Blake at the port, not an analyst.
So v1 = shipments (with reefer cutoffs/cross-dock/AES from `importMeta`),
camera → BOL OCR (kills 20–40 min of re-keying), AI assistant (the tool-using
`/api/ai/chat`, which already knows HTS/duty/ports/routes/FTZ), one native
calculator, push registration. Review queue, load board, offline cache
deliberately deferred — listed in the gap doc.

### D5 — Push: ship the rail, not the engine
A `push_tokens` table + register/unregister API + client registration is
cheap now and unblocks the cutoff-alarm engine later (server-side Expo Push
sender). Shipping collection first means tokens accumulate from day one.

### D6 — Linear reality
`issueCreate` fails: workspace hit the free active-issue limit. Fallback:
progress comment on AI-10777 (comment `bed64544`). Future agents: don't
burn retries on issueCreate until the workspace is upgraded; comment on the
umbrella issue.

## Verification performed

- Web: `npm run typecheck` clean, `npm run test:run` 150/150 green after the
  API additions; migration 0005 generated via `drizzle-kit generate` (never
  hand-write snapshot meta).
- Mobile: `npx tsc --noEmit` clean; `npx expo config` parses. **Not** device-
  tested from this VPS — first runtime smoke test must happen in Expo Go
  against a dev server (see mobile/README.md).

## Pitfalls hit (so you don't)

1. `create-expo-app` prompts interactively inside an existing git repo — run
   with piped input or expect a hang in background shells.
2. Next.js route files may only export HTTP handlers — helper functions go in
   `src/lib/` (moved `sessionCookieName` to `src/lib/auth/mobile.ts`).
3. RN 0.86 types dropped `StyleSheet.absoluteFillObject` — spell out the
   four edges.
4. Repo has no git identity configured — `git config user.name/email` locally
   (match prior commits: `Claude Agent <noreply@anthropic.com>`).
5. No GitHub push creds on this VPS — deliver via
   `git bundle create ... AI-10777-platform-hardening-mobile` →
   `obsidian-vault/Projects/Shipping Savior/artifacts/`.

## Open threads for the next session

1. Cutoff alarm engine + Expo Push sender (`push_tokens` is waiting).
2. Load-board CSV/xlsx export; AES tracker; shelf-life save enum fix.
3. Mobile: offline cache, review-queue screen, biometric unlock, deep links
   from push into `/shipment/[id]`.
4. Rate-limit `/api/mobile/auth/login` (same pattern as `/api/ai/chat`).
5. Runtime-test the app in Expo Go; then `eas init` + first preview build.
