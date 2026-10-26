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
   function + tests, reusing the existing `recommendationEngine`/`scoringEngine` output shape. ✅
   (`lib/shareableResult.ts`, tested in `tests/lib/shareableResult.test.ts`)
2. `/results` reads that param on load and re-renders the same result deterministically instead
   of only working from live form state. ✅ (`app/results/ResultsClient.tsx`'s `pinnedDestinationId`/
   `pinnedRecommendation`, tested in `tests/app/ResultsClient.test.tsx`; wired into the Share button
   in PR #146)

### 2. "Spin again" exclusion — _Engagement, Fun_

Re-rolling currently can repeat the same destination. Exclude the last N results so re-rolling
feels like discovery, not repetition.

1. Track recently-shown destination IDs client-side (session state) — pure function + tests
   extending `recommendationEngine.ts`'s selection logic to accept an exclusion list. ✅
   (`excludeDestinationIds` on `RecommendationParams` in `lib/recommendationEngine.ts`, tested in
   `tests/lib/recommendationEngine.test.ts`)
2. Wire the exclusion list into the "spin again" action on `/results`. ✅
   (`app/results/ResultsClient.tsx` tracks the last 5 shown destinations and passes them as
   `excludeDestinationIds` on shuffle, tested in `tests/app/ResultsClient.test.tsx`)

### 3. Destination structured data — _Acquisition_

Each suggested destination already has data (`lib/destinations.ts`) but no crawlable page — SEO
needs _something_ indexable.

1. **One PR.** Static per-destination pages (`/destination/[slug]`) built from
   `lib/destinations.ts`, with basic JSON-LD — self-contained, reuses existing destination data. ✅
   (`app/destination/[slug]/page.tsx`, built from `pickableDestinations` in `lib/catalogue.ts` so
   only destinations the app actually recommends get a page; `TouristDestination` JSON-LD and the
   new routes added to `app/sitemap.ts`, tested in `tests/app/destination-page.test.tsx`)

### 4. Pro tier upsell moment — _Acquisition_

`lib/proTier.ts` exists but there's no visible moment prompting a free user toward `/pricing`.
The upsell attaches to a perk Pro already offers ("Save trip") rather than withholding a filter
from free users — degrading free recommendations works against _Fun_ and the affiliate links,
which earn on every result.

1. **One PR.** Replace the inline "Pro" message in `components/TripActions/TripActions.tsx` with
   the existing (unused) `components/UpgradePrompt/UpgradePrompt.tsx` for the `save-trip`
   feature, linking to `/pricing`. Resolves the matching AUDIT.md item about `ProGate`/
   `UpgradePrompt` never being imported. ✅ (`components/TripActions/TripActions.tsx` now renders
   `UpgradePrompt`, with `onUpgrade` routing to `/pricing`, tested in
   `tests/components/TripActions.test.tsx`)

Note: nothing sets a user's status to `'pro'` yet, so checkout currently unlocks nothing — see
**Pro status** under Mise en place before adding further gates (e.g. a shuffle limit).

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
   results. Thresholds start at today's numbers, so each later step tightens them. ✅
   (`lib/engineDiagnostics.ts`'s `runEngineDiagnostics`, baselined against `pickableDestinations`/
   `departureCities` in `tests/lib/engineDiagnostics.test.ts`)
2. Exclude destinations within ~100 km of the origin in `filterEngine.ts`, plus tests. ✅
   (`MIN_DISTANCE_KM` in `lib/filterEngine.ts`, tested in `tests/lib/filterEngine.test.ts`; also
   removes same-location self-matches, baseline updated in `tests/lib/engineDiagnostics.test.ts`)
3. Price flights by distance from the actual origin via `estimateFlightCostPerPerson` in
   `calculateBudget`. The destination detail modal's cost breakdown changes too, so check it.
4. Charge hotels per room (roughly one room per 2 travellers) in `calculateBudget`, plus tests. ✅
   (`estimateRooms`/`rooms` in `lib/budgetCalculator.ts`, tested in
   `tests/lib/budgetCalculator.test.ts`)
5. Change `calculateBudgetScore` to reward how closely the trip fits the budget rather than how
   far it undercuts it, so a bigger budget unlocks bigger trips. ✅
   (`calculateBudgetScore` in `lib/scoringEngine.ts` now scores `perPersonCost / maxBudgetPerPerson`
   — 0 if over budget, 1 at a perfect fit — tested in `tests/lib/scoringEngine.test.ts`)
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

### 8. More departure cities — _Acquisition_

Only London can be chosen today. It's the only city in `SUPPORTED_DEPARTURE_CITY_IDS`
(`lib/departureCities.ts`) with route data (`lib/data/london-destinations.json`, from
`yarn data:london`). The other cities are already in `departureCities` but can't be chosen. Each
city goes live as its own PR: route data only, no prices. New destinations it adds join the
catalogue as stubs and stay unpickable until their details land in
`lib/data/destination-details.json`.

1. **Infra (Mise en Place):** generalise the London script into
   `yarn data:routes <city-id>`. It takes a config of each city's airports (IATA code plus
   Wikipedia page) and writes `lib/data/routes/<city-id>.json`. The facts (country, coordinates,
   currency, continent) move to one shared destinations file, so a destination served from
   several cities is stored once. London's output must match today's.
2. Make the catalogue and engine origin-aware. A destination's `london` field becomes
   `routes: Record<originId, Route>`, and `getRecommendations` only picks destinations reachable
   from the chosen origin. Decide what counts as reachable before the smaller airports go live.
   Inverness flies to very few places directly, so "any destination, one stop" may suit it
   better. Also stop a city recommending itself (Edinburgh → Edinburgh).

**UK first.** For each city: add its airports to the config, run `yarn data:routes <city-id>`,
check the new stubs and the merges with existing destinations (watch for airport-named cities,
like Newark vs New York), then add the id to `SUPPORTED_DEPARTURE_CITY_IDS`.

3. Manchester (MAN)
4. Birmingham (BHX)
5. Edinburgh (EDI)
6. Glasgow (GLA, PIK)
7. Bristol (BRS)
8. Newcastle (NCL)
9. Liverpool (LPL)
10. Leeds (LBA)
11. East Midlands (EMA)
12. Belfast (BFS, BHD)
13. Aberdeen (ABZ)
14. Cardiff (CWL)
15. Southampton (SOU)
16. Exeter (EXT)
17. Bournemouth (BOH)
18. Norwich (NWI)
19. Inverness (INV)

**Then Europe**, same steps:

20. Dublin (DUB)
21. Paris (CDG, ORY, BVA)
22. Amsterdam (AMS)
23. Berlin (BER)
24. Madrid (MAD)
25. Rome (FCO, CIA)
26. Lisbon (LIS)
27. Vienna (VIE)
28. Zurich (ZRH)
29. Copenhagen (CPH)
30. Stockholm (ARN, BMA)
31. Oslo (OSL, TRF)
32. Warsaw (WAW, WMI)
33. Athens (ATH)

**Then the rest of the world.** These need step 2's "reachable" rule to hold up for long-haul
hubs. Wikipedia's destination lists for big hubs are long and get edited often, so re-run each
one seasonally.

34. New York (JFK, EWR, LGA)
35. Los Angeles (LAX)
36. Chicago (ORD, MDW)
37. Toronto (YYZ)
38. Mexico City (MEX, NLU)
39. São Paulo (GRU, CGH)
40. Buenos Aires (EZE, AEP)
41. Dubai (DXB, DWC)
42. Cairo (CAI)
43. Johannesburg (JNB)
44. Nairobi (NBO)
45. Mumbai (BOM)
46. Bangkok (BKK, DMK)
47. Singapore (SIN)
48. Hong Kong (HKG)
49. Seoul (ICN, GMP)
50. Tokyo (HND, NRT)
51. Sydney (SYD)
52. Melbourne (MEL, AVV)
53. Auckland (AKL)

## Mise en place — infrastructure prerequisites

| Investment                                      | Unlocks                                                                      |
| :---------------------------------------------- | :--------------------------------------------------------------------------- |
| **Persistence layer** (Saved Trips step 1)      | Saved Trips, and any future accounts/history feature.                        |
| **Destination pages** (feature 3)               | SEO acquisition and a linkable target for Shareable Result.                  |
| **Engine diagnostics test** (feature 5 step 1)  | A before/after measure for every change to filtering, scoring or sampling.   |
| **Per-city route script** (feature 8 step 1)    | Every departure city after London, one `yarn data:routes <city-id>` each.    |
| **Pro status** (Stripe webhook → stored status) | Any Pro gate actually unlocking after checkout; needs the persistence layer. |

---

_RandomHoliday — product roadmap, 2 September 2026 (feature 5 added 17 October 2026, feature 8
added 18 October 2026)_
