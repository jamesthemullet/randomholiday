---
name: product-roadmap
description: Build or refresh a product roadmap for RandomHoliday — new features, pages, and content, PLUS making existing content easier to find, SEO, and improvements to features/pages that already exist — grounded in what the app already has. Writes a plain markdown ROADMAP.md at the repo root, grouped into Now/Next/Later, with each feature broken into a sequence of ~15-minute-reviewable PR steps. Use when the user asks for a roadmap, growth ideas, "what should we build next", or to update/rescope the existing roadmap. Note: PLAN.md is a separate, existing build-roadmap document — don't confuse the two; this skill owns ROADMAP.md only.
---

# Product roadmap

Produces (or refreshes) **`ROADMAP.md`** at the repo root for `randomholiday`: a Next.js 15 App
Router app (React 19, TypeScript, `motion`) that gives users surprise holiday destination
suggestions, with a budget calculator, seasonal weather/scoring/recommendation engines, a
departure-cities list, affiliate links, and a pro tier. Roadmap items are scored against what
actually moves the app forward, broken into ~15-minute-reviewable PR steps. Covers more than new
features:

- **Findability** — making the destination/results content easier to discover and revisit
  (shareable results, saved favourites, linkable destination pages).
- **SEO** — the app is currently pure client-flow (`/discover` → `/results`) with no indexable
  per-destination content; SEO plays here look like giving destinations their own crawlable URLs.
- **Improving what already exists** — `lib/scoringEngine.ts`, `filterEngine.ts`,
  `recommendationEngine.ts`, `budgetCalculator.ts`, `proTier.ts` are all real, working logic —
  extending or exposing them further is often cheaper than a new feature.

## Grounding the roadmap in the real app

Before inventing features, read the actual app:

- `README.md` and `PLAN.md` — PLAN.md is the original build plan, not this roadmap; don't
  duplicate what's already scheduled there.
- `AUDIT.md` if present — don't duplicate known bugs/gaps as roadmap features; those are health
  fixes.
- `package.json` — no database/auth package present (no Prisma/Drizzle/Clerk etc.) — the app is
  currently stateless client-side; any feature needing persistence (saved trips, accounts) needs
  that flagged as infra in Mise en Place.
- `app/` (discover, results, pricing, api) and `lib/` (destinations, budgetCalculator,
  departureCities, distanceCalculator, filterEngine, proTier, recommendationEngine,
  scoringEngine, seasonalWeather, affiliateLinks, destinationImage) — real logic to extend.

Every feature description should be traceable to something concrete in the repo.

## Output format

Plain markdown, not an HTML artifact. Write directly to `ROADMAP.md` at the repo root,
overwriting the previous version.

Structure: intro + 4 goal-tag lenses (Acquisition/Engagement/Retention/Fun) → PR-sequence
explainer → Now/Next/Later sections, each feature as `### N. Name — *Goal tags*` + description +
numbered PR-step list → Mise en place table → footer `*RandomHoliday — product roadmap,
<date>*`.

## Breaking a feature into PR steps

Sequence data/logic → UI → wiring, splitting wherever a step could stand alone:

- A pure function (in `lib/`) plus its unit tests is its own step.
- New UI (a page/component under `app/`) is its own step.
- A step needing new written content (destination copy, marketing copy) gets a GitHub issue via
  `mcp__github__create_issue` rather than a PR, referenced from the roadmap line.
- No feature-flag system exists in this repo — don't propose gating behind flags unless the user
  asks for one to be built first.
- If a feature is small enough that splitting produces nothing independently reviewable, write
  **"One PR."** instead.

## Notes

- Personal/small project — don't propose enterprise-scale features as "Now"/"Next".
- Don't re-propose anything already in `AUDIT.md` (health fix) or `PLAN.md` (already scheduled
  build work).
- Do not commit, push, or open a PR for `ROADMAP.md` changes unless the user explicitly asks.
