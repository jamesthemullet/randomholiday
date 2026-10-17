# Product Roadmap — RandomHoliday

The core loop already works: pick preferences, get a scored, filtered, budget-aware destination
suggestion. What's missing is anything that survives past a single visit — nothing is saved,
shared, or indexable, and the pro tier has no visible upsell moment. Everything below is scored
against four jobs:

- **Acquisition** — brings new visitors in
- **Engagement** — deepens a single visit
- **Retention** — earns a repeat visit
- **Fun** — no metric, just delight

Every feature is broken into a **PR sequence** — each step small enough for a human to review in
about 15 minutes. Genuinely atomic changes are left as one PR.

## Now (ship in weeks — reuses existing infra)

### 1. Shareable result — _Acquisition, Fun_

A shareable link/URL for a result so "you got Lisbon" can be sent to a friend instead of only
seen once in `/results`.

1. Encode the result's inputs (destination + preferences) into a URL query param or slug — pure
   function + tests, reusing the existing `recommendationEngine`/`scoringEngine` output shape.
2. `/results` reads that param on load and re-renders the same result deterministically instead
   of only working from live form state.

### 2. "Spin again" exclusion — _Engagement, Fun_

Re-rolling currently can repeat the same destination. Exclude the last N results so re-rolling
feels like discovery, not repetition.

1. Track recently-shown destination IDs client-side (session state) — pure function + tests
   extending `recommendationEngine.ts`'s selection logic to accept an exclusion list.
2. Wire the exclusion list into the "spin again" action on `/results`.

### 3. Destination structured data — _Acquisition_

Each suggested destination already has data (`lib/destinations.ts`) but no crawlable page — SEO
needs _something_ indexable.

1. **One PR.** Static per-destination pages (`/destination/[slug]`) built from
   `lib/destinations.ts`, with basic JSON-LD — self-contained, reuses existing destination data.

### 4. Pro tier upsell moment — _Acquisition_

`lib/proTier.ts` exists but there's no visible moment prompting a free user toward `/pricing`.

1. **One PR.** A single upsell prompt component shown on `/results` when a pro-only filter would
   have changed the outcome (using existing `proTier.ts` logic), linking to `/pricing`.

### 5. Recommendation quality — _Engagement, Fun_

A simulation of every departure city with the homepage defaults ($1,500, 7 nights, 2 people,
next month, 10,000 km) showed the engine favours cheap, nearby trips. 27 of 56 destinations
(Paris, Rome, Kyoto, Reykjavik…) never reach the top-10 pool from any city. Istanbul, Cairo,
Petra, Kathmandu and Marrakech appear for 26–28 of the 35 cities, and 20 shuffles from London
give only 9 distinct places. Root causes are all small, contained fixes in `lib/`:

- `calculateBudget` always uses `estimatedCosts.flightFromEurope`, wherever you fly from, so New
  York's #1 is Marrakech. `estimateFlightCostPerPerson(distanceKm)` exists but goes unused.
- Hotel cost is charged once per night regardless of group size. From London, a solo traveller
  qualifies for 26 destinations and a group of 6 for 45.
- The budget score rewards unspent budget. Raising London's budget from $1,500 to $5,000 returns
  almost the same pool.
- The distance score rewards nearness, and with no style picked everyone gets the full 40 style
  points, so cheap and close decide almost everything.
- A departure city can recommend itself: Cairo → Cairo, Bangkok → Bangkok, Buenos Aires →
  Buenos Aires.

1. **Baseline first.** Add an engine diagnostics test that runs every `departureCities` origin
   through `getRecommendations` and records pool coverage, self-matches and distinct shuffle
   results. Thresholds start at today's numbers, so each later step tightens them.
2. Exclude destinations within ~100 km of the origin in `filterEngine.ts`, plus tests.
3. Price flights by distance from the actual origin via `estimateFlightCostPerPerson` in
   `calculateBudget`. The destination detail modal's cost breakdown changes too, so check it.
4. Charge hotels per room (roughly one room per 2 travellers) in `calculateBudget`, plus tests.
5. Change `calculateBudgetScore` to reward how closely the trip fits the budget rather than how
   far it undercuts it, so a bigger budget unlocks bigger trips.
6. Rebalance `DEFAULT_WEIGHTS`, softening or dropping distance. Distance is already a hard
   filter, and for a "random holiday" nearer isn't better.
7. Sample the top-10 pool weighted by score instead of uniformly in `recommendationEngine.ts`.
   Session-level "don't show me that again" is feature 2.
8. **Content, not code.** Grow the catalogue where it's thin. Oceania has 4 of 56 destinations,
   so Sydney, Melbourne and Auckland get only 6–9 options.

## Next (this quarter — moderate new build)

### 6. Saved trips — _Retention_

Let a user save a result to come back to later — the first feature that needs persistence.

1. **Infra (Mise en Place):** pick and wire a lightweight persistence layer (no DB/auth exists
   yet — could be as simple as `localStorage` for v1, or a real DB if accounts are wanted).
2. Save/unsave action on `/results`, storing the result's encoded state from feature 1.
3. A "saved trips" list page.

### 7. Compare mode — _Engagement, Fun_

Roll two or three destinations at once and compare them side by side on budget/weather/distance.

1. Extend `recommendationEngine.ts` to return N candidates instead of one — pure function change
   - tests.
2. Comparison table UI on `/results`, reusing `budgetCalculator`/`seasonalWeather`/
   `distanceCalculator` outputs already computed per candidate.

## Mise en place — infrastructure prerequisites

| Investment                                     | Unlocks                                                                    |
| :--------------------------------------------- | :------------------------------------------------------------------------- |
| **Persistence layer** (Saved Trips step 1)     | Saved Trips, and any future accounts/history feature.                      |
| **Destination pages** (feature 3)              | SEO acquisition and a linkable target for Shareable Result.                |
| **Engine diagnostics test** (feature 5 step 1) | A before/after measure for every change to filtering, scoring or sampling. |

---

_RandomHoliday — product roadmap, 2 September 2026 (feature 5 added 17 October 2026)_
