# RandomHoliday — Build Plan

## Current Phase: Phase 9 — Release Readiness

## Last Completed: Task 9.2 — vercel.json deployment config. Added `vercel.json` pinning the framework preset (`nextjs`) and the install/build/dev commands to their `yarn` equivalents (`yarn install` / `yarn build` / `yarn dev`), and set a minimum Node.js version via `"engines": { "node": ">=22.0.0" }` in `package.json` (the way Vercel actually reads a Node version preference — `vercel.json` has no Node-version field). Initially pinned `engines.node` to the exact `"22.x"` the task asked for, but that broke CI: the GitHub Actions workflow runs Node 24, and yarn's engine check is strict by default, so `yarn install` started failing there. Switched to an open-ended `">=22.0.0"` minimum instead, which satisfies both Vercel (22+) and CI (24) without re-pinning to whatever each happens to run today. Env var placeholders already live in `.env.example`/the README's variable table from Task 9.1; deliberately did not duplicate them as literal values in `vercel.json`'s `env` block, since a `vercel.json`-level `env` entry takes precedence over the same variable set in the Vercel dashboard and would silently blank out real secrets configured there. Updated the README's Vercel deployment section to reference the new config instead of claiming "no custom configuration is needed". `yarn lint`, `yarn typecheck`, and `yarn test` (1330 tests) are all clean; verified `yarn build` succeeds.

## Next: Task 9.4 — Error boundary + 404/500 pages

(Task 9.3 — robots.txt, sitemap, OpenGraph meta tags — was already shipped in an earlier PR as
`app/robots.ts`, `app/sitemap.ts`, and `app/opengraph-image.tsx`; the Phase 9 checklist below just
hadn't been ticked off for it until now.)

---

## Phase 1: Project Scaffold ✅ COMPLETE

- [x] Next.js 14 + TypeScript setup (no Tailwind)
- [x] ESLint + Prettier config
- [x] Vitest + React Testing Library setup
- [x] Playwright setup
- [x] Husky pre-commit hooks (lint + typecheck + lint-staged)
- [x] PLAN.md created with all phases
- [x] GitHub Actions CI workflow (lint, typecheck, unit-tests, e2e)
- [x] /styles/tokens.css with all design tokens (tropical palette)
- [x] /styles/globals.css with base reset + accessibility utilities
- [x] Basic folder structure: /app /components /lib /styles /tests /e2e
- [x] .env.example with all API key placeholders
- [x] Fonts: Poppins (headings) + Inter (body) via next/font/google
- [x] Minimal app/layout.tsx with skip-to-main link
- [x] app/page.tsx placeholder

---

## Phase 2: Design System & Core Components ✅ COMPLETE

Sub-steps:

- [x] Design tokens verified in tokens.css (colours, spacing, typography, breakpoints)
- [x] Button component (Button.tsx + Button.module.css) — variants: primary, secondary, ghost, danger; sizes: sm, md, lg; accessible
- [x] Card component (Card.tsx + Card.module.css) — with hover animation
- [x] Input component (Input.tsx + Input.module.css) — text, with label + error state
- [x] Slider component (Slider.tsx + Slider.module.css) — accessible range input
- [x] Select component (Select.tsx + Select.module.css) — accessible dropdown
- [x] Badge component (Badge.tsx + Badge.module.css) — colour variants
- [x] Modal component (Modal.tsx + Modal.module.css) — focus trap, ESC close, ARIA
- [x] Loading spinner (Spinner.tsx + Spinner.module.css) — CSS animation, globe SVG
- [x] Destination card with flip animation (DestinationCard.tsx + .module.css)
- [x] Layout shell: Header, Main, Footer (each with own .module.css)
- [x] Dark mode toggle component
- [x] Unit tests for all components (part of the 1277-test suite; `vitest.config.ts` enforces 95%+ lines/branches/statements and 100% functions for `components/**`, not blanket 100% — see AUDIT.md §1 for the known gaps in `DestinationDetailModal`/`DiscoverWizard`)

---

## Phase 3: Holiday Recommendation Engine ✅ COMPLETE (pure logic, /lib)

- [x] Destination database JSON (56 destinations across 6 continents, full TypeScript types)
- [x] Distance calculator (great-circle / haversine formula)
- [x] Budget calculator (flight tiers + hotel + daily spending, 36 tests, 100% coverage)
- [x] Filter engine (hard filters: budget, distance, travel style) — 25 tests, 100% coverage
- [x] Scoring algorithm (weights: style match, season match, budget, distance) — 35 tests, 100% coverage
- [x] Recommendation engine (combines filter + scoring + randomisation, weighted pool sampling) — 16 tests, 100% coverage
- [x] Unit test coverage for all /lib (`vitest.config.ts` enforces 100% statements/functions/lines and 95% branches; verified via `yarn vitest run --coverage`, currently 100%/99.12%/100%/100% statements/branches/functions/lines)

---

## Phase 4: Main UI Flow

- [x] Landing page: hero with animated globe SVG, tagline, gradient background
- [x] Multi-step wizard form — step 1: departure city autocomplete input
- [x] Multi-step wizard form — step 2: budget slider
- [x] Multi-step wizard form — step 3: travel dates picker
- [x] Multi-step wizard form — step 4: travel style selector
- [x] Multi-step wizard form — step 5: max distance + group size
- [x] Results page: animated reveal of top 3 destinations, Shuffle button
- [x] Wire wizard steps + results into a working flow: /discover route (step state + navigation) → /results route (query params → recommendation engine → ResultsReveal)
- [x] Destination detail modal: photos placeholder, cost breakdown, things to do (weather and affiliate links come later, in Phases 5 and 6)
- [x] Save trip (Pro feature, upsell prompt) + Share button (native share sheet with clipboard fallback), via TripActions component in the destination detail modal

---

## Phase 5: API Integration

- [x] Flight price API route handler — `/api/flight-price`, returns a static estimate (via `estimateFlightCostPerPerson`). No live provider wired up: Amadeus self-service was decommissioned July 2026, and the natural replacement (Duffel) doesn't cover Ryanair/Wizz Air, which matter too much for this app to accept the gap. Revisit if a provider with LCC coverage turns up.
- [x] Destination photos — self-hosted static images in `/public/destinations/<id>.jpg`, no external API/copyright risk; falls back to a placeholder when a destination has no photo yet (photos being added manually)
- [x] OpenWeatherMap API route handler (seasonal weather)
- [x] Graceful fallbacks when APIs unavailable — live weather fetch now has a bounded timeout, so a hung upstream request falls back to the static estimate instead of blocking
- [x] RAISE GITHUB ISSUE: "API Keys Required" (#27)

---

## Phase 6: Monetisation Layer

- [x] Affiliate link injection — Booking.com (hotels)
- [x] Affiliate link injection — Skyscanner (flights)
- [x] Pro tier UI (feature gates, upgrade prompts)
- [x] Pricing page
- [x] Stripe checkout + webhook handler scaffold
- [x] AdSense placeholder components
- [x] RAISE GITHUB ISSUE: "Stripe + Affiliate Keys Required" (#108)

---

## Phase 7: Accessibility Audit & Polish

- [x] axe-core sweep across all pages (`@axe-core/playwright` e2e scan of home, discover, results, pricing, and the destination detail modal; fixed Button primary/danger and Badge secondary color-contrast, and DestinationCard heading order)
- [x] Full keyboard navigation testing + fixes (fixed DestinationCard's post-flip focus landing inside `aria-hidden` content, and added focus movement to the step announcement in DiscoverWizard on step change; audited Modal, DepartureAutocomplete, TravelStyleSelector, Slider/BudgetSlider, Card and nav — all already keyboard-operable)
- [x] ARIA labels audit (form input label association, icon-only buttons and image alt text were already correct; fixed Modal not restoring focus to its trigger on close, ResultsReveal's Shuffle update having no live-region announcement, and Header nav links missing `aria-current="page"`)
- [x] Colour contrast check (WCAG AA) — covered by the 7.1 axe-core sweep
- [x] Focus trap in modals — pre-existing trap verified in 7.2, focus restoration to trigger on close added in 7.3
- [x] Skip-to-main link
- [x] Route change announcements for screen readers
- [x] Accessibility unit tests (axe-core in Vitest)

---

## Phase 8: Test Coverage Pass

- [x] Coverage report audit — find gaps
- [x] Missing unit tests to reach 100% for /lib and /components
- [x] E2E: full happy path, mobile viewport, keyboard-only, API error states
- [x] Lighthouse CI check (target 90+ all metrics)

---

## Phase 9: Release Readiness

- [x] README.md with full setup + deployment guide
- [x] vercel.json deployment config
- [x] robots.txt, sitemap, OpenGraph meta tags (shipped earlier as `app/robots.ts`, `app/sitemap.ts`, `app/opengraph-image.tsx`; this checklist just hadn't been updated)
- [ ] Error boundary + 404/500 pages
- [ ] Rate limiting on API routes
- [ ] Final CI check passes
- [ ] RAISE GITHUB ISSUE: "Ready for Production Release"

---

## Notes

- All styles via CSS Modules (.module.css per component) — NO Tailwind, NO inline styles
- Design tokens in /styles/tokens.css as CSS custom properties
- Dark mode: [data-theme="dark"] overrides on CSS custom properties
- Business logic stays in /lib with zero DOM dependencies (React Native reuse)
- All API calls server-side via Next.js route handlers
