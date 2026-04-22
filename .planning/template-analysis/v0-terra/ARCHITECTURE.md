# Architecture — v0 Terra Landing Page Template

**Source:** `/tmp/template-analysis-source/terra`
**Classification:** design-template (single-page landing)
**Date:** 2026-04-22

## Stack

| Layer | Tech | Version |
|---|---|---|
| Framework | Next.js (App Router) | 16.0.10 |
| UI | React | 19.2.0 |
| Styling | Tailwind CSS via @tailwindcss/postcss + custom globals.css | 4.1.9 |
| Animation | framer-motion + native CSS keyframes | 12.23.26 |
| Components | shadcn/ui (60+ Radix primitives, unmodified) | — |
| Icons | lucide-react | 0.454.0 |
| Maps | d3 (geoNaturalEarth1) + topojson-client | 7.9.0 / 3.1.0 |
| Charts (unused here) | recharts | 2.15.4 |
| Analytics | @vercel/analytics | 1.3.1 |

## Routes

Single route: `app/page.tsx` (821 lines). No API routes, no dynamic segments, no middleware.

```
app/
├── layout.tsx         — RootLayout + metadata (LUMERA — AI Support That Actually Works)
├── page.tsx           — entire landing page in one file
└── globals.css        — 324 lines: tokens, glass styles, keyframes, animation classes
```

## Component Map

### Custom components (3)
| Component | File | Purpose |
|---|---|---|
| `AnimatedText` | `components/animated-text.tsx` (30 lines) | Char-by-char reveal with framer-motion. Each character gets opacity/y/blur tween w/ 30ms stagger and cubic-bezier `[0.21, 0.47, 0.32, 0.98]` |
| `CustomDroneIcon` | `components/drone-icon.tsx` (26 lines) | SVG icon, currentColor, 24×24 |
| `WorldMap` | `components/world-map.tsx` (79 lines) | d3 `geoNaturalEarth1` projection scaffolded but **render is stubbed to `<img src="/map.svg" />`** — projection math is live (for marker placement via `getMarkerPosition`) but no markers are rendered in the returned JSX. The callbacks `onSelectExperience` and `hoveredExp` state exist but aren't wired into any visible SVG. This is a half-finished component. |
| `AnimatedCounter` | inline in `app/page.tsx:12-51` | IntersectionObserver (0.5 threshold) + setInterval (16ms, 60 frames) count-up |
| `TerraPage` | `app/page.tsx:53-821` | Main landing page component |

### Shared primitives (unmodified shadcn/ui)
60+ components under `components/ui/` — all stock shadcn output. The template imports only `Button` from this set (`app/page.tsx:4`). Every other UI primitive is dead code that came with the v0 generation.

### Hooks
- `hooks/use-mobile.ts` — `useIsMobile()` returning boolean for `< 768px` breakpoint
- `hooks/use-toast.ts` — standard shadcn toast controller (unused by the landing page itself)

### Data
- `lib/experience-data.ts` — 5 hardcoded `Experience` records with `{id, title, company, location: {city, country, lat, lng, isRemote}, startDate, endDate, color}`. Used by `WorldMap` for (intended) marker placement.

## Design Tokens (from `app/globals.css`)

### Color palette
```css
--bg-primary:       #0B0C0F    /* deep black, also html+body background */
--text-primary:     #F2F3F5    /* near-white */
--text-secondary:   #A7ABB3    /* muted gray (reused everywhere as "muted" tone) */
--glass-bg:         rgba(15, 17, 23, 0.3)
--glass-border:     rgba(255, 255, 255, 0.08)
--accent-pink:      #EC4899
--accent-purple:    #A855F7
```

Additional inline gradients (appear in 4 places on emphasis words):
```css
background: linear-gradient(135deg, #d9a7c7 0%, #fffcdc 100%);
WebkitBackgroundClip: text;
WebkitTextFillColor: transparent;
```

And an unrelated shadcn-default OKLCH palette under `:root` (dark card/primary/etc.) — **only loosely used** because Tailwind 4 theme tokens `--color-background` etc. point at them but most concrete styling uses the LUMERA tokens or hex values directly.

### Typography
```css
--font-sans:  "Geist", "Geist Fallback"
--font-serif: "Georgia", "Times New Roman", serif
--font-mono:  "Geist Mono", "Geist Mono Fallback"
```
Loaded via `next/font/google`: `Geist({ subsets: ["latin"] })` + `Geist_Mono`. Serif uses system Georgia (no web font load).

Typographic scale (from inline classnames):
| Role | Mobile | Desktop |
|---|---|---|
| Hero headline | `text-7xl` (≈4.5rem) / `text-[44px]` | `text-8xl` (≈6rem) / `text-[72px]` |
| Section H2 | `text-[32px]` or `text-[36px]` | `text-[48px]` or `text-[56px]` |
| CTA H2 | `text-[40px]` | `text-[64px]` |
| Body | `text-base` | `text-lg` |
| Eyebrow label | `text-[10px]` uppercase `tracking-[0.15em]` | `text-xs` |
| Metric counter | `text-[48px]` | `text-[72px]` or `text-8xl` |

### Radius / spacing
```css
--radius: 1.75rem         /* 28px — shadcn base */
border-radius: 16px       /* glass-nav-left (the nav pill) */
border-radius: 24px       /* dashboard mockup container */
border-radius: 56px       /* glass-nav (wide pill variant) */
```

Common max-widths: `max-w-[1120px]` (content container), `max-w-[800px]` (FAQ + CTA), `max-w-[600px]` (subheading blocks), `max-w-[520px]` / `[560px]` (hero sub copy).

Common section padding: `py-20 md:py-32 px-4`. Nav clearance: `pt-24 md:pt-32` on the hero.

### Breakpoints (Tailwind defaults)
- `sm`: 640px
- `md`: 768px — main mobile/desktop pivot (used throughout)
- `lg` / `xl` / `2xl` — not referenced

### Glass morphism system (custom in `globals.css`)
```
.glass-nav         background rgba(15,17,23,.35) + backdrop-blur(24px) + 56px radius + 12px 40px shadow
.glass-nav-left    same as above but 16px radius
.glass-card        rgba(15,17,23,.25) + backdrop-blur(16px) + 8px translucent border + 6px 24px shadow
.glass-card-inner  rgba(255,255,255,.03) + backdrop-blur(12px) + float-in animation on mount
.glass-button      backdrop-blur(16px) + 4px 16px shadow + color: #F2F3F5
.glass-pill        rgba(15,17,23,.4) + backdrop-blur(16px)
```

## Page Section Map (in scroll order)

| # | Section | ID | `page.tsx` lines | Key patterns |
|---|---|---|---|---|
| 1 | Fixed header nav | — | 157–209 | Glass pill, 16px radius, fixed `top-6 left-6 right-6`, z-40, desktop-only links, hamburger on `< md` |
| 2 | Mobile fullscreen menu | — | 211–246 | Portal-style overlay, opens on hamburger, large serif links |
| 3 | Hero | — | 248–322 | Parallax bg (fixed-attachment), parallax content overlay, dynamic word cycle, AnimatedText, stagger-reveal entrance, CTA button, dashboard mock w/ 3D scroll-tilt |
| 4 | Logo marquee | — | 324–360 | Infinite scroll (40s), 8 logos repeated to make 16, brightness-0 invert, hover opacity bump |
| 5 | Metrics grid | `#metrics` | 362–411 | 2×2 grid, gradient-text H2, IntersectionObserver AnimatedCounter, pink/purple accent dots |
| 6 | World map | `#map` | 413–432 | `WorldMap` component (half-finished — renders static SVG) |
| 7 | Narrative + feature carousel | `#narrative` | 434–585 | 2-col layout, feature buttons with active underline + auto-rotation, 3D stacked-card image panel on desktop, single image on mobile |
| 8 | FAQ accordion | `#faq` | 587–673 | 6 items, max-height + opacity transition, chevron rotation, gradient-text H2 |
| 9 | CTA section | `#cta` | 675–703 | Fixed-attachment Earth background, glass-pill eyebrow, large headline, glass button |
| 10 | Footer | — | 705–818 | 4-col grid (Brand / Product / Company / Newsletter), social icons (X/YouTube/IG), bottom bar (copyright + legal links) |

## State Management

All state is local to `TerraPage` via `useState`. No context, no global store.

| State | Purpose | `page.tsx` line |
|---|---|---|
| `isLoaded` | Drives initial hero scale+fade | 54 |
| `isMenuOpen` | Mobile menu open/close | 55 |
| `scrollY` | Drives parallax offsets | 56 |
| `selectedFeature` | Active narrative feature (0–3) | 57 |
| `imageFade` | Controls feature image opacity during 300ms transitions | 58 |
| `autoRotationKey` | Resets the 6s auto-rotation interval when user clicks a feature | 59 |
| `dynamicWordIndex` | Index into `dynamicWords` array for hero rotation | 60 |
| `wordFade` | Opacity/blur toggle during word swap | 61 |
| `dashboardScrollOffset` | RotateX angle for dashboard 3D tilt (0–15deg) | 62 |
| `selectedExperience` | Would drive map marker (unused by current static map) | 63 |
| `openFaqIndex` | Which FAQ item is expanded (or `null`) | 64 |

## Refs / Observers

- `dashboardRef` — element for scroll-driven tilt math (`getBoundingClientRect`)
- `heroRef` — hero section element (declared but unused in effect logic)
- `observerRef` — single IntersectionObserver that adds `.animate-in` to anything with `.animate-on-scroll` (threshold 0.1, rootMargin `-50px` bottom)

## Images (all in `public/`)

| Path | Purpose |
|---|---|
| `/hero-landscape.png` | Hero fixed-attachment background (applied twice: base + parallax overlay) |
| `/dashboard-screenshot.png` | Product mock in the hero that 3D-tilts on scroll |
| `/map.svg` | Static world map used by `WorldMap` stub |
| `/drone.png` `/real-time-satellite.png` `/biodiversity-tracking.png` `/deforestation-detect.png` | Four feature carousel images |
| `/earth-cta.png` | Final CTA section fixed background |
| `/logos/frame-{2,3,4,6,7,8,11,55}.png` | 8 partner logos used in marquee (rendered brightness-0 invert so they become monochrome) |

## Performance characteristics

- All images are plain `<img>` tags — no `next/image` optimization
- `backgroundAttachment: fixed` used in hero and CTA — known mobile performance hit, template mitigates with `prefers-reduced-motion` override in `globals.css:186-191`
- Single JS bundle for the page since it's one route
- framer-motion only used by `AnimatedText` (low cost). All other animations are CSS keyframes or inline style mutations driven by React state
- No dynamic imports, no code splitting beyond Next defaults

## Accessibility notes

- Mobile menu button has `aria-label="Toggle menu"`
- Social links have `aria-label`s (X, YouTube, Instagram)
- FAQ buttons do NOT have `aria-expanded` or `aria-controls` — accordion semantics are visual-only (fail for assistive tech)
- Feature buttons lack `aria-pressed` for their selected state
- `prefers-reduced-motion` respected for fixed-attachment bg and marquee, but NOT for: char-reveal, stagger-reveal, counter, 3D tilt, dynamic word swap. Opportunity to harden during recreation.
- Color contrast: muted text `#A7ABB3` on `#0B0C0F` ≈ 7.3:1 (passes WCAG AA for normal text)

## What's missing / broken

- **Brand inconsistency:** layout.tsx metadata says "LUMERA — AI Support That Actually Works" and describes AI customer-support deflection, while page.tsx renders "TERRA" conservation copy. If shipping to production both would need to align.
- **World map is a stub:** d3 projection is computed but the JSX only renders `/map.svg` as an `<img>`. No SVG markers, no click handler wiring. The `selectedExperience`, `hoveredExp`, `colorMap`, and `getMarkerPosition` are dead code paths.
- **Newsletter form:** the email input has no submit handler, no `<form>`, no backend call
- **Social links** point at bare `https://twitter.com` / `https://youtube.com` / `https://instagram.com` — placeholder URLs
- **60+ shadcn primitives imported but unused** — all of `components/ui/*` except `Button` is dead weight in the bundle (tree-shake should handle, but the v0 scaffold is noisy)
- **FAQ a11y:** missing `aria-expanded` / `aria-controls`
- No error boundaries, no loading states (single-route landing page so it barely matters)
