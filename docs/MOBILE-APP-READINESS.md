# Mobile App Readiness — iOS / Android / PWA

Last updated: 2026-06-11 (AI-10777)

Shipping Savior ships to mobile three ways, in increasing order of effort:

| Channel | Status | What's needed |
|---|---|---|
| **Responsive web** | ✅ Live | Nothing — Tailwind mobile-first breakpoints throughout |
| **Installable PWA** | ✅ Code complete (this branch) | Deploy to production; users "Add to Home Screen" |
| **Native iOS (TestFlight/App Store) + Android (Play)** | 🟡 Scaffolded | Mac with Xcode + Apple Developer account; Android Studio + Play Console (steps below) |

## 1. PWA (shipped on this branch)

- `src/app/manifest.ts` — web app manifest (standalone display, navy theme, maskable icons)
- `public/icons/` — 192/512 any + maskable icon set; `src/app/apple-icon.png` for iOS home screen
- `public/sw.js` + `ServiceWorkerProvider` — minimal service worker: cache-first for `_next/static` + icons, network-first navigations with `/offline` fallback. **API routes are never cached.**
- `viewport`/`themeColor`/`appleWebApp` metadata in `src/app/layout.tsx`

Verify after deploy: Chrome DevTools → Application → Manifest shows installable; Lighthouse PWA pass.

## 2. Native shells via Capacitor (scaffolded on this branch)

`capacitor.config.ts` is committed and `@capacitor/{core,cli,ios,android}` are devDependencies.
The shell loads the production URL (`server.url`) — correct pattern for an SSR Next.js app.

### iOS → TestFlight → App Store (requires macOS)

1. **Prereqs:** Mac with Xcode 16+, Apple Developer Program membership ($99/yr), App Store Connect access.
2. `npx cap add ios && npx cap sync ios`
3. `npx cap open ios` → in Xcode set the Team, bundle id `com.shippingsavior.app`, version/build number.
4. App icons: drag `public/icons/icon-512.png` derivatives into `Assets.xcassets/AppIcon` (Xcode 16 accepts a single 1024×1024 — regenerate from `/tmp/ss-icon.svg` source in repo history or `public/icons/`).
5. Product → Archive → Distribute → App Store Connect → TestFlight.
6. App Store Connect: create the app record (name "Shipping Savior", primary category Business), add privacy policy URL (`/privacy`), App Privacy questionnaire (collects: email, name, usage data via PostHog — declare), screenshots (6.7" + 6.1" iPhone, 13" iPad if supporting iPad).
7. **Review-proofing for hybrid apps (Guideline 4.2):** the app must feel app-like. The PWA shell + auth-gated platform dashboard qualifies, but consider adding at least one native capability before App Store (not TestFlight) submission — push notifications for shipment status alerts is the natural fit (`@capacitor/push-notifications`).
8. External TestFlight testers require Beta App Review (~24–48h).

### Android → Play Store

1. **Prereqs:** Android Studio, Play Console account ($25 one-time).
2. `npx cap add android && npx cap sync android`
3. Generate signing keystore, configure `android/app/build.gradle` signing.
4. Build → Generate Signed Bundle (AAB) → upload to Play Console internal testing track.
5. Play Console: store listing, data safety form (email/name/analytics), content rating questionnaire.

### What cannot be done from the Linux VPS

- `npx cap add ios` / Xcode build / TestFlight upload — **macOS only**. Run on the Mac Mini (fleet has one) or Julian's machine.
- Apple Developer account enrollment and App Store Connect setup — Julian/Blake decision (who owns the account: recommend the JV entity once formed).

## 3. Auth note for native shells

OAuth (Google/GitHub) inside a WebView can be blocked by Google's user-agent policy.
Email/password and email-verification flows work as-is. Before App Store submission either:
- enable Capacitor's system-browser OAuth flow (`@capacitor/browser` + redirect back), or
- ship v1 native with credentials-only login (OAuth stays on web).

## 4. Suggested native v1.1 backlog

- `@capacitor/push-notifications` — shipment delay / tariff alert pushes (pairs with watch-rules backlog from AI-10401)
- `@capacitor/camera` — snap a BOL photo straight into `/api/bol` OCR
- Biometric unlock (FaceID) for the platform shell
