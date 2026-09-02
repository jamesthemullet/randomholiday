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

### 1. Shareable result — *Acquisition, Fun*
A shareable link/URL for a result so "you got Lisbon" can be sent to a friend instead of only
seen once in `/results`.

1. Encode the result's inputs (destination + preferences) into a URL query param or slug — pure
   function + tests, reusing the existing `recommendationEngine`/`scoringEngine` output shape.
2. `/results` reads that param on load and re-renders the same result deterministically instead
   of only working from live form state.

### 2. "Spin again" exclusion — *Engagement, Fun*
Re-rolling currently can repeat the same destination. Exclude the last N results so re-rolling
feels like discovery, not repetition.

1. Track recently-shown destination IDs client-side (session state) — pure function + tests
   extending `recommendationEngine.ts`'s selection logic to accept an exclusion list.
2. Wire the exclusion list into the "spin again" action on `/results`.

### 3. Destination structured data — *Acquisition*
Each suggested destination already has data (`lib/destinations.ts`) but no crawlable page — SEO
needs *something* indexable.

1. **One PR.** Static per-destination pages (`/destination/[slug]`) built from
   `lib/destinations.ts`, with basic JSON-LD — self-contained, reuses existing destination data.

### 4. Pro tier upsell moment — *Acquisition*
`lib/proTier.ts` exists but there's no visible moment prompting a free user toward `/pricing`.

1. **One PR.** A single upsell prompt component shown on `/results` when a pro-only filter would
   have changed the outcome (using existing `proTier.ts` logic), linking to `/pricing`.

## Next (this quarter — moderate new build)

### 5. Saved trips — *Retention*
Let a user save a result to come back to later — the first feature that needs persistence.

1. **Infra (Mise en Place):** pick and wire a lightweight persistence layer (no DB/auth exists
   yet — could be as simple as `localStorage` for v1, or a real DB if accounts are wanted).
2. Save/unsave action on `/results`, storing the result's encoded state from feature 1.
3. A "saved trips" list page.

### 6. Compare mode — *Engagement, Fun*
Roll two or three destinations at once and compare them side by side on budget/weather/distance.

1. Extend `recommendationEngine.ts` to return N candidates instead of one — pure function change
   + tests.
2. Comparison table UI on `/results`, reusing `budgetCalculator`/`seasonalWeather`/
   `distanceCalculator` outputs already computed per candidate.

## Mise en place — infrastructure prerequisites

| Investment | Unlocks |
| :--- | :--- |
| **Persistence layer** (Saved Trips step 1) | Saved Trips, and any future accounts/history feature. |
| **Destination pages** (feature 3) | SEO acquisition and a linkable target for Shareable Result. |

---
*RandomHoliday — product roadmap, 2 September 2026*
