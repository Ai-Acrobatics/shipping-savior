# Animations — v0 Terra Landing Page Template

**Source:** `/tmp/template-analysis-source/terra`
**Total animations cataloged:** 16

Libraries in play:
- **framer-motion 12** — used ONLY in `components/animated-text.tsx`
- **Native CSS keyframes** — defined in `app/globals.css:159-322`
- **Inline style mutations driven by React state** — scroll parallax, 3D tilt, feature stack positioning
- **`setInterval` + `setTimeout`** — dynamic word cycle, feature auto-rotation, animated counter

---

## A01 — Hero mount scale + fade-in

| Field | Value |
|---|---|
| File | `app/page.tsx:248-257` |
| Library | Tailwind + inline Tailwind `transition-all` |
| Trigger | Mount (`isLoaded` flips to `true` inside `useEffect`, line 114) |
| Duration | 1200ms |
| Easing | `cubic-bezier(0.16, 1, 0.3, 1)` (custom, arbitrary value) |
| Values | `scale-[1.03] opacity-0` → `scale-100 opacity-100` |
| Notes | Single-shot on mount. The `scale` end value is `1.0`, beginning at `1.03` so it settles slightly inward. |

---

## A02 — Hero background parallax

| Field | Value |
|---|---|
| File | `app/page.tsx:258-266` (overlay); base layer on lines 252-256 |
| Library | Inline `style` mutation driven by `scrollY` state (updated on scroll in `useEffect` line 83-111) |
| Trigger | `window.scroll` event |
| Duration | Continuous (tied 1:1 with scroll) |
| Easing | Linear (no easing; raw multiplication) |
| Values | `transform: translateY(${scrollY * 0.5}px)` on overlay; base layer uses `backgroundAttachment: fixed` instead |
| Notes | Two-layer parallax: a `fixed` attachment on the base + a second absolutely-positioned overlay that translates at 0.5× scroll. Creates depth without a real 3D scene. |

---

## A03 — Hero content parallax

| Field | Value |
|---|---|
| File | `app/page.tsx:270-274` |
| Library | Inline `style` driven by `scrollY` |
| Trigger | `window.scroll` |
| Duration | Continuous |
| Easing | Linear |
| Values | `transform: translateY(${scrollY * 0.2}px)` applied to the `max-w-[1120px]` wrapper |
| Notes | Moves the headline + CTA at 0.2× scroll — slower than the background overlay (0.5×) so content "lags" behind, reinforcing depth. |

---

## A04 — Dynamic word swap (hero headline)

| Field | Value |
|---|---|
| File | `app/page.tsx:71-81` (effect) + `app/page.tsx:278-284` (markup) |
| Library | `setInterval` + `setTimeout` + Tailwind `transition-all duration-500` |
| Trigger | Mounted — cycles every 3000ms indefinitely |
| Duration | 500ms fade/blur transition |
| Easing | Tailwind default (`ease-in-out`) |
| Values | On cycle: `wordFade` → false, 300ms timeout flips `dynamicWordIndex`, sets `wordFade` → true. Classes during fade: `opacity-0 blur-lg` ↔ `opacity-100 blur-0`. |
| Word list | `["forests", "nature", "animals", "ecosystems", "biodiversity", "wildlife", "habitats"]` (7 words, line 69) |
| Notes | The `<AnimatedText key={dynamicWordIndex}>` remount is what triggers the per-character reveal (A05) — the `key` prop change tears down and re-mounts the component so framer-motion plays the entrance animation fresh. Swap happens on a 3s cycle, so the net pacing is: 300ms blur-out → word swap → 500ms blur-in + char reveal → 2200ms rest. |

---

## A05 — AnimatedText character reveal

| Field | Value |
|---|---|
| File | `components/animated-text.tsx:10-29` |
| Library | framer-motion `motion.span` |
| Trigger | Mount of component (remounted whenever the parent's `key` changes — see A04) |
| Duration | 500ms per character |
| Easing | `cubic-bezier(0.21, 0.47, 0.32, 0.98)` (custom) |
| Stagger | 30ms between characters (`delay: delay + index * 0.03`) |
| Values | `initial: { opacity: 0, y: 20, filter: "blur(8px)" }` → `animate: { opacity: 1, y: 0, filter: "blur(0px)" }` |
| Notes | Spaces are converted to ` ` and kept as `display: inline` so the whitespace is preserved during the animation. Each character is its own `motion.span`. Short words (`"animals"` = 7 chars) finish in 500 + 6×30 = 680ms. |

---

## A06 — Stagger-reveal entry (CSS keyframe)

| Field | Value |
|---|---|
| File | `app/globals.css:197-212` |
| Library | Native CSS keyframe (`@keyframes blur-reveal`) |
| Trigger | Mount of any element with class `stagger-reveal`; individual delays applied inline |
| Duration | 900ms |
| Easing | `cubic-bezier(0.16, 1, 0.3, 1)` |
| Values | `from: { opacity: 0, transform: translateY(12px), filter: blur(8px) }` → `to: { opacity: 1, transform: translateY(0), filter: blur(0) }` |
| Applied to | Hero block span 1 (no delay), span 2 (`animationDelay: "90ms"`), subheading (`180ms`), CTA button (`270ms`), dashboard wrapper (`360ms`) — `app/page.tsx:279, 285, 291, 296, 303` |
| Notes | Baseline is `opacity: 0` (line 211) so the element is hidden until the animation runs. Classic 90ms-between-elements cascade. |

---

## A07 — Dashboard 3D scroll-tilt

| Field | Value |
|---|---|
| File | `app/page.tsx:83-111` (math), `app/page.tsx:304-318` (markup) |
| Library | Inline `style` driven by `dashboardScrollOffset` state |
| Trigger | `window.scroll` (computed against `dashboardRef.getBoundingClientRect()`) |
| Duration | 0.05s CSS transition on `transform` (essentially frame-by-frame) |
| Easing | Linear |
| Values | `rotateX(${dashboardScrollOffset}deg)` where `dashboardScrollOffset` ∈ [0, 15]. Mapping: when dashboard `rect.top >= 0.8·vh`, offset = 0; when `rect.top <= 0.2·vh`, offset = 15; linear interpolation between. |
| Parent transform | `perspective: 1200px`, `transformStyle: preserve-3d` |
| Notes | This is the "Apple product mock tilts back as you scroll" effect. The perspective lives on a parent wrapper so the tilt is correctly projected. The 0.05s transition smooths the rAF-free scroll listener. |

---

## A08 — Dashboard slide-up on mount

| Field | Value |
|---|---|
| File | `app/globals.css:217-230` (keyframe + `.dashboard-image` class) |
| Library | Native CSS keyframe |
| Trigger | Mount of `<img class="dashboard-image">` (line 316) |
| Duration | 600ms |
| Easing | `cubic-bezier(0.83, 0, 0.17, 1)` — punchy "expo-in-out" feel |
| Values | `from: { transform: translateY(200px), opacity: 0 }` → `to: { transform: translateY(0), opacity: 1 }` |
| Notes | Stacks with A07 (3D tilt) — the image slides up from below while the parent wrapper is tilted forward, creating the classic "product reveal" feel. |

---

## A09 — Partner logo marquee

| Field | Value |
|---|---|
| File | `app/globals.css:279-309` (keyframe + `.logo-marquee*` classes), `app/page.tsx:329-359` (markup) |
| Library | Native CSS keyframe |
| Trigger | Always running (infinite) |
| Duration | 40s per cycle |
| Easing | Linear |
| Values | `@keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }` |
| Technique | 8 logos are rendered twice in a flex row → translating to `-50%` brings the second copy flush into view, creating a seamless infinite loop |
| A11y | `@media (prefers-reduced-motion: reduce) { animation-play-state: paused; }` — the marquee stops entirely for users who request reduced motion |
| Notes | Opacity 0.4 base with 0.6 on hover via a 500ms `opacity` transition. All logos are `brightness-0 invert` so they render as pure white regardless of their native color — monochrome treatment. |

---

## A10 — Animated counter (metrics grid)

| Field | Value |
|---|---|
| File | `app/page.tsx:12-51` (component) + `app/page.tsx:403-404` (usage) |
| Library | IntersectionObserver + `setInterval` |
| Trigger | Element enters viewport at `threshold: 0.5` (half visible) |
| Duration | ≈960ms (60 frames × 16ms interval) |
| Easing | Linear (constant `increment = targetNum / 60` per frame) |
| Values | Parses input string (e.g. `"2.4M"`) into numeric part + unit suffix, counts from 0 to target in 60 steps |
| Notes | **Known bug in source:** `observer.disconnect()` is called inside the `if (entry.isIntersecting)` branch at line 36, but the observer is already created outside that block. If the element is not immediately intersecting when observed, the interval never fires — which is exactly the intended behavior. However, the interval is NOT cleared on unmount (no cleanup of `interval` in the `return` of `useEffect`), so a fast-scroll unmount mid-count could leak the interval. Worth fixing on recreation. |

Four instances with values: `"2.4M"`, `"12K+"`, `"18M"`, `"99.4%"` (`app/page.tsx:386-389`).

---

## A11 — Feature carousel auto-rotation

| Field | Value |
|---|---|
| File | `app/page.tsx:133-145` |
| Library | `setInterval` + `setTimeout` + Tailwind `transition-opacity` |
| Trigger | Mount; resets whenever `autoRotationKey` changes (i.e. user clicks a feature — line 514) |
| Duration | 300ms fade, cycles every 6000ms |
| Easing | Tailwind default `ease-in-out` |
| Values | On tick: `imageFade` → false, 300ms timeout flips `selectedFeature = (prev + 1) % 4`, sets `imageFade` → true. Classes: `opacity-100` vs `opacity-0`. |
| Notes | Coupled with A13 (progress bar) which also runs on a 6s cycle. User click triggers a 300ms cross-fade immediately and increments `autoRotationKey` so the 6s interval resets. |

---

## A12 — Feature stacked-card 3D offset (desktop only)

| Field | Value |
|---|---|
| File | `app/page.tsx:540-582` |
| Library | Inline `style` |
| Trigger | `selectedFeature` state change (from auto-rotation A11 or user click) |
| Duration | 600ms (`transition-all duration-600 ease-out` Tailwind class) |
| Easing | `ease-out` |
| Values | For each of 4 cards: `positionInStack = (i - selectedFeature + 4) % 4` (0 = front, 3 = back). Then: `zIndex: 4 - positionInStack`, `transform: translateX(${positionInStack * 16}px) scale(${1 - positionInStack * 0.02})`, `opacity: isActive ? 1 : 0.6 - positionInStack * 0.15` |
| Notes | Creates a "stacked card deck" with each card offset 16px to the right and shrunk 2% behind the one in front. On rotation the previously-front card goes to the back of the stack (z-index 1, opacity 0.15, translate-X 48px, scale 0.94). Only rendered on `md:` and up (line 540 has `hidden md:flex`). On mobile a single image cross-fades instead (line 461-477). |

---

## A13 — Active-feature progress bar

| Field | Value |
|---|---|
| File | `app/globals.css:264-272` (keyframe + class), `app/page.tsx:530-535` (markup) |
| Library | Native CSS keyframe |
| Trigger | Rendered only when `selectedFeature === i` — re-mounts on each feature change |
| Duration | 6000ms |
| Easing | Linear |
| Values | `@keyframes progress { from { width: 0%; } to { width: 100%; } }` |
| Notes | Pairs with A11 — both run on 6s cycle so the bar visually counts down to the next auto-rotation. When the user clicks a different feature, the old bar unmounts and the new one mounts from 0%, effectively resetting the countdown. |

---

## A14 — FAQ accordion expand/collapse

| Field | Value |
|---|---|
| File | `app/page.tsx:646-670` |
| Library | Tailwind `transition-all` on `max-height` + `opacity` |
| Trigger | Click on FAQ header button (`onClick` toggles `openFaqIndex`) |
| Duration | 300ms |
| Easing | `ease-in-out` |
| Values | Open: `max-h-[500px] opacity-100`. Closed: `max-h-0 opacity-0`. |
| Chevron sub-animation | `ChevronDown` gets `transition-transform duration-300` and rotates `180deg` when open (line 656-659) |
| Notes | Classic max-height trick — works because the answer paragraphs are short enough to fit within 500px. For longer content you'd see the animation stutter or cut. Missing `aria-expanded` / `aria-controls` — visual only. |

---

## A15 — CTA section fixed-attachment parallax

| Field | Value |
|---|---|
| File | `app/page.tsx:675-703` |
| Library | CSS `background-attachment: fixed` + gradient overlay |
| Trigger | Always on |
| Duration | Continuous (tied to scroll) |
| Easing | N/A (native browser behavior) |
| Values | `backgroundImage: url('/earth-cta.png')`, `backgroundSize: cover`, `backgroundPosition: center`, `backgroundAttachment: fixed`. Overlay: `bg-gradient-to-b from-[#0B0C0F] via-[#0B0C0F]/60 to-transparent`. |
| A11y | `prefers-reduced-motion` override in `globals.css:181-191` switches `background-attachment: scroll` to kill the parallax (but that rule is scoped to `.hero-section`, NOT applied to the CTA — **inconsistency**; reduced-motion users will still see CTA parallax). Worth fixing on recreation. |

---

## A16 — Gradient text clip

| Field | Value |
|---|---|
| File | `app/page.tsx:365-377, 443-454, 594-607, + metrics heading` |
| Library | Inline `style` |
| Trigger | None — static treatment |
| Duration | N/A |
| Easing | N/A |
| Values | `background: linear-gradient(135deg, #d9a7c7 0%, #fffcdc 100%); WebkitBackgroundClip: text; WebkitTextFillColor: transparent; backgroundClip: text;` |
| Applied to | Emphasis words in section headings: "Impact" (metrics), "matters" (narrative), "questions" (FAQ), plus other places |
| Notes | Not technically an animation, but a reusable decorative primitive. Include in the design standard as a static test case because it's part of the visual language. |

---

## Cross-cutting observations

### Easing curves used
| Curve | Where |
|---|---|
| `cubic-bezier(0.16, 1, 0.3, 1)` | A01 hero mount, A06 stagger-reveal, `.animate-on-scroll` fade-up |
| `cubic-bezier(0.21, 0.47, 0.32, 0.98)` | A05 char reveal, `.animate-blur-transition` class (unused in page.tsx but defined) |
| `cubic-bezier(0.83, 0, 0.17, 1)` | A08 dashboard slide-up (expo feel) |
| Linear | A02/A03/A07 parallax, A09 marquee, A10 counter, A13 progress |
| Tailwind default `ease-in-out` | A04 word swap, A11 feature fade, A14 FAQ accordion |
| Tailwind `ease-out` | A12 stacked card transition |

### Timing "family"
- **Micro** (<= 300ms): A04 word cross-fade (500ms), A11 feature cross-fade (300ms), A14 FAQ (300ms) — fast, utilitarian
- **Macro** (500–1200ms): A01 hero mount (1200ms), A05 char reveal (500ms/char), A06 stagger-reveal (900ms), A08 dashboard slide (600ms), A10 counter (~960ms), A12 stacked card (600ms)
- **Ambient** (>= 3s): A04 word cycle (3s), A09 marquee (40s), A11 feature rotation (6s), A13 progress (6s)

### Respecting reduced motion
Only A09 (marquee) and A15 (hero section specifically — but NOT CTA) respect `prefers-reduced-motion`. Every other animation plays unconditionally. This is a recreation opportunity — add global reduced-motion support for A01/A05/A06/A07/A10/A15-CTA.

### Reusability for Shipping Savior
Patterns that map directly to the planned `v1.1 Investor Demo Sprint` home page:
- **A04 dynamic word cycle** → "Save on [freight / tariffs / transit / demurrage]"
- **A05 AnimatedText** → hero headline character reveal
- **A07 dashboard 3D tilt** → tilt the Shipping Savior platform mockup as investors scroll
- **A09 logo marquee** → Chiquita · Hall Pass · Trader Joe's · Lineage · Matson · Pasha Hawaii
- **A10 animated counter** → `3,700 ports · 200+ HTS codes · 260 FTZ zones`
- **A11+A12+A13 feature carousel** → multi-modal showcase (ocean / rail / air / drayage), each with its own auto-rotating showcase
- **A14 FAQ accordion** → investor and buyer Q&A blocks
- **A16 gradient text** → emphasis words in Shipping Savior section headings
