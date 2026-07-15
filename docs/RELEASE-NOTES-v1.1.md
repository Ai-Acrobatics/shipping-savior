# Shipping Savior — Release Notes v1.1

**Date:** July 15, 2026 · **Live on:** https://shipping-savior.vercel.app (web)

This release fixes two production issues and adds live carrier intelligence, a redesigned platform, and a native mobile build.

## 🩹 Fixes
- **AI Assistant is back online.** The in-app assistant was down (billing issue on the AI provider). It now runs on a multi-provider fallback chain, so a single provider outage can no longer take it offline. Ask it about HTS duty rates, ports, FTZ savings, or routes and it answers from live data.
- **Workbook import fixed.** Uploading your weekly workbook was failing with an error. Root cause was a database mismatch; it's fixed — a real workbook now imports all rows, flags the ones missing AES numbers or weights for review, and skips duplicates if you re-upload.

## ✨ New & Improved
- **Live carrier data.** Carrier alliances (Gemini Cooperation, Ocean Alliance, Premier Alliance, MSC), market share, and on-time reliability are now real data, not samples.
- **Port Finder uses live carrier overlap** instead of demo data (and shows a clear "Demo data" badge when a port isn't in the dataset yet).
- **Redesigned platform.** Real numbers on the dashboard (was showing zeros), a one-tap "Scan a BOL" action, cleaner shipments / load board / history / settings screens, and the cookie banner no longer covers the app.
- **Save a scanned BOL and jump straight to that shipment's profile.**

## 📱 Mobile app
- A native iOS build now runs and shows your live shipments, with a 5-tab layout (Shipments · Scan · Assistant · Calculate · Account) and camera BOL scanning.
- **Status: not yet on TestFlight.** See the testing note below.

## ✅ Quality
- 51 of 70 acceptance tests passing, verified against live production (up from 21). Full interactive report: https://ss-storyboard.vercel.app

## Known / in progress
- Live sailing schedules (needs the Terminal49 data integration)
- A couple of smaller items (chat throttling, one port record) tracked internally
