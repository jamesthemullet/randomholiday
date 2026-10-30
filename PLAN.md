# RandomHoliday — Build Plan

## Current Phase: Phase 9 — Release Readiness ✅ COMPLETE

## Last Completed: Task 9.6 (final) — Ran the final quality gate (`yarn lint`, `yarn typecheck`, `yarn test`: 1833 tests, all clean) and raised GitHub issue "Ready for Production Release" with a deployment checklist covering the app's actual deploy target (Cloudflare Workers via the OpenNext adapter, with `vercel.json` kept as a fallback path). This completes Phase 9 and the build plan — remaining work is the manual credential setup tracked in issue #108.

## Next: None — all planned build phases are complete. Remaining work is tracked in open GitHub issues (credential/account setup) rather than PLAN.md tasks.

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
- [x] ~~Dark mode toggle component~~ (removed 2026-10-18 — light theme only)
- [x] Unit tests for all components (`vitest.config.ts` enforces 95%+ lines/branches/statements and 100% functions for `components/**`, not blanket 100% — see AUDIT.md §1 for current coverage gaps; test count has grown well past the original 1277, and `DiscoverWizard` was later replaced by `TripForm`, below)

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

*Superseded: the multi-step `/discover` wizard below was later replaced by a single-page `TripForm` on the homepage (`components/TripForm/`) — see the note after this list.*

- [x] ~~Landing page: hero with animated globe SVG, tagline, gradient background~~ (superseded: the hero is now a photo image via `next/image`, not an animated SVG globe — `components/Hero/Hero.tsx`)
- [x] ~~Multi-step wizard form — step 1: departure city autocomplete input~~ (superseded, see note below)
- [x] ~~Multi-step wizard form — step 2: budget slider~~ (superseded, see note below)
- [x] ~~Multi-step wizard form — step 3: travel dates picker~~ (superseded, see note below)
- [x] ~~Multi-step wizard form — step 4: travel style selector~~ (superseded, see note below)
- [x] ~~Multi-step wizard form — step 5: max distance + group size~~ (superseded, see note below)
- [x] ~~Results page: animated reveal of top 3 destinations, Shuffle button~~ (superseded: `ResultsClient.tsx` reveals one recommendation at a time, with "Spin again" swapping it for another)
- [x] ~~Wire wizard steps + results into a working flow: /discover route (step state + navigation) → /results route (query params → recommendation engine → ResultsReveal)~~ (superseded: `/discover` now permanently redirects to `/` — `next.config.mjs` — where `TripForm` collects all inputs on one page before navigating straight to `/results`; `DiscoverWizard` no longer exists)
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
- [x] Error boundary + 404/500 pages
- [x] Rate limiting on API routes
- [x] Final CI check passes
- [x] RAISE GITHUB ISSUE: "Ready for Production Release"

---

## Notes

- All styles via CSS Modules (.module.css per component) — NO Tailwind, NO inline styles
- Design tokens in /styles/tokens.css as CSS custom properties
- Business logic stays in /lib with zero DOM dependencies (React Native reuse)
- All API calls server-side via Next.js route handlers
