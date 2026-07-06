# Shipping Savior — Mobile (Expo)

Native iOS + Android companion app for the Shipping Savior platform. One React
Native codebase (Expo SDK 57, expo-router) targeting both stores under bundle
ID `com.shippingsavior.app`.

## What's in v1

| Tab | Backed by | Notes |
|---|---|---|
| **Shipments** | `GET /api/shipments` | Status filters, pull-to-refresh, infinite scroll; detail screen surfaces reefer/workbook fields (cutoffs, cross-dock appt, AES#, seal#, temp) from `importMeta` |
| **Scan BOL** | `POST /api/bol` | Camera or library → AI extraction with animated per-field confidence bars → save as shipment |
| **Assistant** | `POST /api/ai/chat` | Claude with the platform's logistics tools (HTS, duty rates, ports, routes, container specs, FTZ) |
| **Calculate** | `POST /api/calculations` | Native landed-cost calculator (MPF/HMF math ported from web), saves to the org's calculation history |
| **Account** | `GET /api/mobile/auth/session` | Profile, deep links into web platform, sign out |

Micro-interactions: springy `PressableScale` + haptics on every tappable
surface, staggered `FadeInDown` list entrances, animated confidence meters,
success/error haptic notifications.

## Auth model

`POST /api/mobile/auth/login` (in the main Next.js app) validates credentials
and returns a **NextAuth-compatible session JWT**. The client stores it in
`expo-secure-store` and replays it as the NextAuth session cookie
(`Cookie: <cookieName>=<token>`) — so every existing `auth()`-gated API route
works without modification. Tokens live 30 days; `/api/mobile/auth/session`
is checked on launch and the app drops to the login screen when it expires.

## Push notifications

On login the app registers an Expo push token to `POST /api/mobile/devices`
(`push_tokens` table, org-scoped). Server-side *sending* (cutoff alarms,
delay alerts via the Expo Push API) is the Tier 1 notification-center work —
tokens are already being collected.

Registration silently no-ops in Expo Go / simulators (needs an EAS project ID
and a real device).

## Development

```bash
cd mobile
npm install
EXPO_PUBLIC_API_URL=http://<your-lan-ip>:3000 npx expo start
```

Scan the QR with Expo Go. Note: against local dev, the API issues the
non-`__Secure-` cookie name automatically.

## Builds & store submission

```bash
npx eas init            # once — links EAS project (needed for push tokens too)
npx eas build --platform ios --profile production      # needs Apple Developer account
npx eas build --platform android --profile production  # EAS manages the keystore
npx eas submit --platform ios
npx eas submit --platform android
```

EAS cloud builds mean **no local Mac/Xcode is required** for the iOS build
itself. Push credentials: `npx eas credentials` (APNs key for iOS, FCM
service-account key for Android).

See `docs/PRODUCTION-GAP-ANALYSIS.md` (repo root) for the full store-submission
runbook and remaining gaps.
