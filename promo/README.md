# Shipping Savior — Promo Animations (Remotion)

Programmatic, brand-accurate promo videos for Shipping Savior, built with
[Remotion](https://remotion.dev) (React → MP4). No external assets — the app
screens are recreated as animated React components, so everything is crisp,
editable, and re-renders identically.

## The four deliverables

| Composition | Format | Length | Use |
|---|---|---|---|
| `LogoSting` | 1080×1080 | 3.5s | Brand bumper / intro / loading sting |
| `SocialTeaser` | 1080×1920 (9:16) | 15s | Instagram / TikTok / Reels launch teaser |
| `SquareDemo` | 1080×1080 (1:1) | 30s | App Store preview, LinkedIn, landing-page embed |
| `HeroLoop` | 1600×900 (16:9) | 8s, seamless loop | Marketing-site hero background |

## Render

```bash
cd promo
npm install
npm run render:all          # renders all four to out/
# or individually:
npm run render:sting
npm run render:teaser
npm run render:demo
npm run render:hero
```

Output MP4s land in `out/`. Renders anywhere with Node — Remotion downloads its
own headless Chromium (verified rendering on the fleet VPS, no GPU needed).

## Edit / preview

```bash
npm run studio             # live Remotion Studio in the browser
```

## Brand

All colors, tagline, and the anchor mark live in `src/brand.ts` and
`src/components/Anchor.tsx`. The app-screen mockups (board, scan/OCR, cutoff
alert, login) are in `src/components/Screens.tsx` — update copy/data there and
every video reflects it. Compositions are in `src/compositions/`, registered in
`src/Root.tsx`.
