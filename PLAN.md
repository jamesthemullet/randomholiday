# RandomHoliday — Build Plan

## Current Phase: Phase 3 — Holiday Recommendation Engine

## Last Completed: Phase 2 — Design System & Core Components ✅

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
- [x] Unit tests for all components (100% coverage — 135 tests, 100% lines/branches/functions/statements)

---

## Phase 3: Holiday Recommendation Engine (pure logic, /lib)

- [x] Destination database JSON (55 destinations across 6 continents, full TypeScript types)
- [x] Distance calculator (great-circle / haversine formula)
- [ ] Budget calculator (flight estimate + hotel + spending money)
- [ ] Filter engine (hard filters: budget, distance)
- [ ] Scoring algorithm (weights: style match, season match, budget, distance)
- [ ] 100% unit test coverage for all /lib

---

## Phase 4: Main UI Flow

- [ ] Landing page: hero with animated globe SVG, tagline, gradient background
- [ ] Multi-step wizard form: departure > budget > dates > travel style > distance > group size
- [ ] Results page: animated reveal of top 3 destinations, Shuffle button
- [ ] Destination detail modal: photos, weather, cost breakdown, activities, affiliate links
- [ ] Save trip (Pro feature, upsell prompt)
- [ ] Share button (social sharing)

---

## Phase 5: API Integration

- [ ] Amadeus API route handler (flight prices + destination inspiration)
- [ ] Unsplash API route handler (destination photos)
- [ ] OpenWeatherMap API route handler (seasonal weather)
- [ ] Graceful fallbacks when APIs unavailable
- [ ] RAISE GITHUB ISSUE: "API Keys Required"

---

## Phase 6: Monetisation Layer

- [ ] Affiliate link injection — Booking.com (hotels)
- [ ] Affiliate link injection — Skyscanner (flights)
- [ ] Pro tier UI (feature gates, upgrade prompts)
- [ ] Pricing page
- [ ] Stripe checkout + webhook handler scaffold
- [ ] AdSense placeholder components
- [ ] RAISE GITHUB ISSUE: "Stripe + Affiliate Keys Required"

---

## Phase 7: Accessibility Audit & Polish

- [ ] axe-core sweep across all pages
- [ ] Full keyboard navigation testing + fixes
- [ ] ARIA labels audit
- [ ] Colour contrast check (WCAG AA)
- [ ] Focus trap in modals
- [ ] Skip-to-main link
- [ ] Route change announcements for screen readers
- [ ] Accessibility unit tests

---

## Phase 8: Test Coverage Pass

- [ ] Coverage report audit — find gaps
- [ ] Missing unit tests to reach 100% for /lib and /components
- [ ] E2E: full happy path, mobile viewport, keyboard-only, API error states
- [ ] Lighthouse CI check (target 90+ all metrics)

---

## Phase 9: Release Readiness

- [ ] README.md with full setup + deployment guide
- [ ] vercel.json deployment config
- [ ] robots.txt, sitemap, OpenGraph meta tags
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
