import { describe, it, expect } from 'vitest'
import { runEngineDiagnostics } from '@/lib/engineDiagnostics'
import { pickableDestinations } from '@/lib/catalogue'
import { departureCities } from '@/lib/departureCities'
import type { Destination } from '@/lib/destinations'
import type { DepartureCity } from '@/lib/departureCities'

// ── Fixtures ──────────────────────────────────────────────────────────────────

function makeDestination(overrides: Partial<Destination> & { id: string }): Destination {
  return {
    name: overrides.id,
    country: 'Testland',
    countryCode: 'TL',
    coordinates: { lat: 0, lng: 0 },
    continent: 'Europe',
    description: 'A test destination.',
    climate: 'temperate',
    travelStyles: ['city'],
    bestMonths: [6, 7, 8],
    estimatedCosts: {
      flightFromEurope: 100,
      hotelPerNight: 80,
      dailySpending: 50,
    },
    activities: ['sightseeing'],
    currency: 'USD',
    visa: 'free',
    ...overrides,
  }
}

const PARIS = makeDestination({ id: 'paris', coordinates: { lat: 48.8566, lng: 2.3522 } })
const BERLIN = makeDestination({ id: 'berlin', coordinates: { lat: 52.52, lng: 13.405 } })
// Shares an id with LONDON_ORIGIN (self-match), but sits ~165km away so filterEngine's
// MIN_DISTANCE_KM exclusion doesn't itself remove it from the pool before selfMatch is checked.
const LONDON_DEST = makeDestination({ id: 'london', coordinates: { lat: 53.0074, lng: -0.1278 } })

const LONDON_ORIGIN: DepartureCity = {
  id: 'london',
  name: 'London',
  country: 'United Kingdom',
  coordinates: { lat: 51.5074, lng: -0.1278 },
}
const PARIS_ORIGIN: DepartureCity = {
  id: 'paris-origin',
  name: 'Paris',
  country: 'France',
  coordinates: { lat: 48.8566, lng: 2.3522 },
}

const BASE_PARAMS = {
  maxBudgetPerPerson: 1000,
  maxDistanceKm: 10000,
  nights: 7,
  groupSize: 2,
}

/** Deterministic, seedable PRNG so shuffle-diversity assertions never flake. */
function mulberry32(seed: number): () => number {
  let a = seed
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// ── Unit behaviour ───────────────────────────────────────────────────────────────

describe('runEngineDiagnostics', () => {
  it('records which destinations pass the filter for each origin as the pool', () => {
    const summary = runEngineDiagnostics([PARIS, BERLIN, LONDON_DEST], [LONDON_ORIGIN], {
      ...BASE_PARAMS,
      random: mulberry32(1),
    })

    expect(summary.perOrigin).toHaveLength(1)
    expect(summary.perOrigin[0].originId).toBe('london')
    expect(summary.perOrigin[0].poolIds.sort()).toEqual(['berlin', 'london', 'paris'])
  })

  it('flags a self-match when a destination shares the origin id', () => {
    const summary = runEngineDiagnostics([PARIS, BERLIN, LONDON_DEST], [LONDON_ORIGIN], {
      ...BASE_PARAMS,
      random: mulberry32(1),
    })

    expect(summary.perOrigin[0].selfMatch).toBe(true)
    expect(summary.selfMatchCount).toBe(1)
  })

  it('does not flag a self-match when no destination shares the origin id', () => {
    const summary = runEngineDiagnostics([PARIS, BERLIN], [LONDON_ORIGIN], {
      ...BASE_PARAMS,
      random: mulberry32(1),
    })

    expect(summary.perOrigin[0].selfMatch).toBe(false)
    expect(summary.selfMatchCount).toBe(0)
  })

  it('computes pool coverage as the fraction of destinations reachable by any origin', () => {
    const summary = runEngineDiagnostics(
      [PARIS, BERLIN, LONDON_DEST],
      [LONDON_ORIGIN, PARIS_ORIGIN],
      { ...BASE_PARAMS, random: mulberry32(1) }
    )

    expect(summary.poolCoverage).toBe(1)
  })

  it('returns zero coverage when there are no destinations to recommend', () => {
    const summary = runEngineDiagnostics([], [LONDON_ORIGIN], {
      ...BASE_PARAMS,
      random: mulberry32(1),
    })

    expect(summary.poolCoverage).toBe(0)
    expect(summary.perOrigin[0].poolIds).toEqual([])
    expect(summary.perOrigin[0].distinctShuffleIds).toEqual([])
  })

  it('samples shuffleCount times and collects distinct results', () => {
    const summary = runEngineDiagnostics([PARIS, BERLIN, LONDON_DEST], [LONDON_ORIGIN], {
      ...BASE_PARAMS,
      shuffleCount: 5,
      random: mulberry32(7),
    })

    expect(summary.perOrigin[0].distinctShuffleIds.length).toBeGreaterThan(0)
    expect(summary.perOrigin[0].distinctShuffleIds.length).toBeLessThanOrEqual(3)
  })

  it('defaults to a pool of 10 and 20 shuffles when not given', () => {
    const destinations = Array.from({ length: 15 }, (_, i) =>
      makeDestination({ id: `d${i}`, coordinates: { lat: i * 0.1, lng: i * 0.1 } })
    )
    const summary = runEngineDiagnostics(destinations, [LONDON_ORIGIN], {
      ...BASE_PARAMS,
      random: mulberry32(3),
    })

    expect(summary.perOrigin[0].poolIds.length).toBeLessThanOrEqual(10)
  })
})

// ── Baseline against the real catalogue ─────────────────────────────────────────

/**
 * Measured 19 October 2026 against `pickableDestinations`/`departureCities` with the
 * homepage defaults (£1,500 budget, 10,000 km max distance, 7 nights, 2 people, no style
 * preference) and a fixed seed, per ROADMAP.md feature 5's analysis: the engine favours
 * cheap, nearby trips, over a quarter of the catalogue never surfaces, and repeated shuffles
 * from London return few distinct places. These are regression floors/ceilings pinned to
 * today's numbers, not targets — feature 5's later steps (excluding nearby self-matches,
 * distance-aware flight pricing, per-room hotel cost, budget-fit scoring, rebalanced
 * weights, weighted pool sampling) should tighten them as they land.
 */
describe('engine diagnostics baseline (ROADMAP.md feature 5)', () => {
  const summary = runEngineDiagnostics(pickableDestinations, departureCities, {
    maxBudgetPerPerson: 1500,
    maxDistanceKm: 10000,
    nights: 7,
    groupSize: 2,
    travelStyles: [],
    random: mulberry32(42),
  })

  it('surfaces close to half the catalogue across every origin, but not much more today', () => {
    // Floor lowered from 0.5 to 0.45 when the catalogue grew by six destinations (Almería,
    // Antalya, Athens, Bodrum, Bucharest, Chania) that no origin's pool surfaces yet.
    expect(summary.poolCoverage).toBeGreaterThanOrEqual(0.45)
    expect(summary.poolCoverage).toBeLessThan(0.6)
  })

  it('no longer lets departure cities recommend themselves', () => {
    // Feature 5 step 2: filterEngine now excludes destinations within MIN_DISTANCE_KM of the
    // origin, which also removes same-location self-matches (Cairo → Cairo, Bangkok → Bangkok).
    expect(summary.selfMatchCount).toBe(0)
  })

  it('gives London only a handful of distinct destinations across 20 shuffles', () => {
    const london = summary.perOrigin.find((origin) => origin.originId === 'london-uk')
    expect(london).toBeDefined()
    expect(london?.distinctShuffleIds.length).toBeGreaterThanOrEqual(9)
    expect(london?.distinctShuffleIds.length).toBeLessThan(15)
  })

  it('keeps every origin reasonably varied, but none close to the pool size', () => {
    const distinctCounts = summary.perOrigin.map((origin) => origin.distinctShuffleIds.length)
    expect(Math.min(...distinctCounts)).toBeGreaterThanOrEqual(4)
    expect(Math.max(...distinctCounts)).toBeLessThanOrEqual(10)
  })
})
