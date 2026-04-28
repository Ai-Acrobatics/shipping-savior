# Worker 3 Plan — AI-8784 Onboarding + KB foundation

## Scope (this worker)
- C: KB MDX content system + 3 starter articles
- A: First-run onboarding wizard skeleton (localStorage only)
- E: Contextual `<HelpHint>` component with 3 placements

## Skip (separate tickets)
- B: react-joyride product tour
- D: Support email routing (depends AI-8781, AI-8776)
- F: Email sequence (depends AI-8776)
- G: Public changelog page

## Implementation order
1. Install `next-mdx-remote` + `gray-matter` (MDX content system)
2. Create `content/kb/*.mdx` directory with 3 articles + frontmatter contract
3. Build `src/lib/kb.ts` loader (read fs at build, parse frontmatter)
4. Rewrite `src/app/knowledge-base/page.tsx` to render category-grouped grid + client search
5. Create `src/app/knowledge-base/[slug]/page.tsx` for article rendering
6. Build `src/components/platform/OnboardingWizard.tsx` (4-step client component)
7. Mount wizard in `src/app/(platform)/platform/page.tsx` (small surgical edit)
8. Build `src/components/ui/HelpHint.tsx` tooltip
9. Add HelpHint to dashboard, calculators hub, shipments import
10. Verify: `npm run build` and `npx tsc --noEmit`

## Files I will touch
- ADD: `content/kb/{what-is-an-ftz,importing-shipments-csv,comparing-carriers}.mdx`
- ADD: `src/lib/kb.ts`
- REWRITE: `src/app/knowledge-base/page.tsx`
- ADD: `src/app/knowledge-base/[slug]/page.tsx`
- ADD: `src/components/platform/OnboardingWizard.tsx`
- ADD: `src/components/ui/HelpHint.tsx`
- EDIT (small): `src/app/(platform)/platform/page.tsx` (mount wizard)
- EDIT (small): `src/app/(platform)/platform/calculators/page.tsx` (HelpHint)
- EDIT (small): `src/app/(platform)/platform/shipments/import/page.tsx` (HelpHint)
- EDIT: `package.json` (add next-mdx-remote, gray-matter)

## Files I will NOT touch (Worker 1 / Worker 2 territory)
- `src/lib/db/schema.ts` — Worker 1
- `src/lib/data/dashboard.ts` — Worker 1
- `src/app/api/shipments/` — Worker 1
- `next.config.mjs`, `src/instrumentation.ts`, `sentry.*.config.ts` — Worker 2
- `src/app/api/health/` — Worker 2

## Coordination notes
- Wizard persists via `localStorage('ss_onboarded')`. DB persistence (`org.onboarded_at`) is a TODO comment — schema mig depends AI-8779 (Worker 1).
- Search is client-side title/description filter. Pagefind is follow-up.
- Article voice: logistics operator, not marketer. Real numbers, real lanes, real examples.
