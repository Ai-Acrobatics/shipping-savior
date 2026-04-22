# Interactions — v0 Terra Landing Page Template

**Source:** `/tmp/template-analysis-source/terra`
**Total interactions cataloged:** 9

Patterns range from pure-DOM (smooth scroll to anchor) to mixed state+DOM (feature click that resets auto-rotation).

---

## I01 — Logo click scrolls to top

| Field | Value |
|---|---|
| File | `app/page.tsx:160-164` |
| Pattern | `window.scrollTo({ top: 0, behavior: "smooth" })` on click of wordmark |
| Trigger | Click on "TERRA" wordmark in the glass nav |
| Side effects | None — scroll only |
| A11y | Renders as a `<button>`, not an anchor. No `aria-label`. Text content is the brand name which works as a label. |

---

## I02 — Nav link scroll-to-section

| Field | Value |
|---|---|
| File | `app/page.tsx:147-153` (handler), `167-198` (desktop nav), `214-243` (mobile menu) |
| Pattern | `document.getElementById(id).scrollIntoView({ behavior: "smooth" })` + close mobile menu |
| Sections | `#metrics`, `#map`, `#narrative`, `#faq`, `#cta` |
| Side effects | `setIsMenuOpen(false)` so the mobile overlay dismisses after click |
| CSS support | `html { scroll-behavior: smooth }` in `globals.css:251-254` — guarantees smooth scroll even for browsers that ignore the JS option |

---

## I03 — Mobile menu toggle

| Field | Value |
|---|---|
| File | `app/page.tsx:200-206` (trigger), `211-246` (overlay) |
| Pattern | Toggle `isMenuOpen` on hamburger click; swap `<Menu>` ↔ `<X>` icon |
| Overlay | `fixed inset-0 bg-[#0B0C0F]/95 backdrop-blur-md z-50` — full-screen with large serif links (`text-5xl md:text-7xl`) |
| Dismiss | Clicking any link calls `scrollToSection` which also sets `isMenuOpen: false` |
| A11y | `aria-label="Toggle menu"` on the hamburger button |
| Visibility | `<md` only (`md:hidden` on the button) |

---

## I04 — Feature card click (narrative section)

| Field | Value |
|---|---|
| File | `app/page.tsx:507-536` |
| Pattern | `onClick` runs 3-step sequence: `setImageFade(false)` → 300ms timeout flips `selectedFeature` + sets `imageFade: true` + increments `autoRotationKey` |
| Side effects | The `autoRotationKey` increment is keyed in the `useEffect` dependency array on line 145, so the 6s rotation interval is torn down and restarted — effectively "resetting" the countdown to zero when user interacts |
| Visual feedback | Active card has `border-white/20` (vs `border-white/10`), icon shifts from `text-green-500/60` to `text-green-400`, and a progress bar (A13) animates across the bottom |
| A11y | Missing `aria-pressed` for the selected state. Currently rendered as a `<button>` so keyboard-activatable, but screen readers won't know which is selected |

---

## I05 — FAQ accordion toggle

| Field | Value |
|---|---|
| File | `app/page.tsx:651-661` |
| Pattern | `onClick={() => setOpenFaqIndex(openFaqIndex === i ? null : i)}` — accordion behavior: clicking the open item closes it, clicking a different item closes the current and opens the new |
| Visual feedback | Max-height expansion (A14), chevron rotates 180deg, border hover state `hover:border-white/20` |
| A11y | **Missing** `aria-expanded`, `aria-controls`, and `role="button"` on the toggle button. Screen readers have no way to know about the expanded/collapsed state. Needs hardening during recreation. |
| Keyboard | Works because it's a native `<button>`, but missing proper accordion semantics |

---

## I06 — World map marker hover/click (scaffolded, not wired)

| Field | Value |
|---|---|
| File | `components/world-map.tsx` |
| Pattern | Component receives `selectedExperience` + `onSelectExperience` props, manages local `hoveredExp` state, computes d3 projection for marker positioning, defines colorMap — but the returned JSX only renders `<img src="/map.svg" />` |
| Status | **Half-finished** — the data-driven marker layer is dead code. All handlers, state, and callbacks exist but none are attached to visible DOM |
| Intent (inferred) | Hovering a marker would set `hoveredExp`; clicking would call `onSelectExperience(exp)`. Parent state `selectedExperience` (page.tsx:63) would reflect selection. Colors are pink/yellow/green/blue per experience record. |
| Recreation note | If pulling this pattern for Shipping Savior, the marker layer needs to be actually built — render SVG `<circle>` elements using `getMarkerPosition(exp)` coords, hook up `onMouseEnter` / `onMouseLeave` / `onClick` handlers |

---

## I07 — Feature card auto-rotation reset on interaction

| Field | Value |
|---|---|
| File | `app/page.tsx:133-145` (effect), `509-516` (trigger) |
| Pattern | The 6s `setInterval` useEffect depends on `autoRotationKey` — incrementing this state tears down the existing interval and starts a fresh one |
| Trigger | Any user click on a feature card (I04) |
| Effect | Countdown restarts from 0, so the user has ~6 seconds of "their chosen feature" before auto-rotation resumes |
| Pattern name | "Resettable polling" or "interaction-paced carousel" — a nice UX detail that prevents auto-rotation from fighting user intent |

---

## I08 — Social link outbound navigation

| Field | Value |
|---|---|
| File | `app/page.tsx:714-744` |
| Pattern | `<a target="_blank" rel="noopener noreferrer">` for X / YouTube / Instagram |
| URLs | Placeholder: `https://twitter.com`, `https://youtube.com`, `https://instagram.com` — no account slugs |
| A11y | Each has `aria-label` identifying the platform. Icons are `lucide-react` for YouTube/Instagram and an inline SVG for X |
| Recreation note | Replace with real Shipping Savior social URLs (or remove entirely if there's no social presence yet) |

---

## I09 — Newsletter email submit (NON-WIRED)

| Field | Value |
|---|---|
| File | `app/page.tsx:785-798` |
| Pattern | Email `<input>` + Subscribe `<button>` with no `<form>` wrapper, no `onSubmit`, no `onClick` |
| Status | **Placeholder UI only** — clicking Subscribe does nothing |
| A11y | No label element (placeholder acts as implicit label, which fails WCAG). Missing `type="submit"` on the button, missing `required` on the input. |
| Recreation note | If keeping the newsletter capture, wire to a form handler (Resend, ConvertKit, or a simple API route) and add proper form semantics |

---

## Interaction summary table

| # | Name | Trigger | Handler type | A11y grade |
|---|---|---|---|---|
| I01 | Wordmark → scroll top | Click | `window.scrollTo` | B — button semantic, brand as label |
| I02 | Nav link → scroll to section | Click | `scrollIntoView` + close mobile menu | B — text links inside buttons |
| I03 | Mobile menu toggle | Click hamburger | State toggle + icon swap | A — aria-label present |
| I04 | Feature card click | Click | Fade + swap + rotation reset | C — missing aria-pressed |
| I05 | FAQ accordion | Click header | Toggle open index | **D — missing aria-expanded/controls** |
| I06 | Map marker (stub) | Would be hover/click | Set state + callback (dead) | N/A — not rendered |
| I07 | Auto-rotation reset | Side effect of I04 | Dep-array driven interval reset | N/A — invisible |
| I08 | Social outbound | Click | Default anchor behavior | A — aria-label + target+rel |
| I09 | Newsletter subscribe | Click (non-functional) | None | **F — no form, no handler, no label** |

## Reusability for Shipping Savior

Direct ports to the planned v1.1 home page:
- **I01/I02** scroll-to-section pattern → same for investor-deck sections
- **I03** mobile menu overlay → reuse verbatim
- **I04+I07** feature-click-with-auto-rotation-reset → reuse for multi-modal showcase
- **I05** FAQ accordion → investor Q&A — **but fix the a11y gaps**
- **I06** map interaction → actually build this out for "carriers we aggregate" map
- **I09** newsletter → swap for "Request demo" CTA wired to calendar-book or Linear
