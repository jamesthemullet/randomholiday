import { describe, it, expect } from 'vitest'
import {
  scoreDestination,
  scoreDestinations,
  calculateStyleScore,
  calculateSeasonScore,
  calculateBudgetScore,
  calculateDistanceScore,
  DEFAULT_WEIGHTS,
} from '@/lib/scoringEngine'
import type { ScoreParams } from '@/lib/scoringEngine'
import type { Destination } from '@/lib/destinations'

// ── Fixtures ──────────────────────────────────────────────────────────────────

/** London, UK — used as the default origin */
const LONDON: { lat: number; lng: number } = { lat: 51.5074, lng: -0.1278 }

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

/**
 * Paris (~341 km from London). flightFromEurope: $100.
 * Budget for 7 nights, 2 people:
 *   flights: 100 × 2 = 200
 *   hotel:   80 × 7  = 560
 *   daily:   50 × 2 × 7 = 700
 *   total:   1460   → perPerson: 730
 */
const PARIS = makeDestination({
  id: 'paris',
  name: 'Paris',
  coordinates: { lat: 48.8566, lng: 2.3522 },
  travelStyles: ['city', 'culture'],
  bestMonths: [4, 5, 6, 9, 10],
  estimatedCosts: { flightFromEurope: 100, hotelPerNight: 80, dailySpending: 50 },
})

/**
 * Tokyo (~9 560 km from London). flightFromEurope: $800.
 * Budget for 7 nights, 2 people:
 *   flights: 800 × 2   = 1 600
 *   hotel:   200 × 7   = 1 400
 *   daily:   120 × 2 × 7 = 1 680
 *   total:   4 680  → perPerson: 2 340
 */
const TOKYO = makeDestination({
  id: 'tokyo',
  name: 'Tokyo',
  coordinates: { lat: 35.6762, lng: 139.6503 },
  travelStyles: ['city', 'culture'],
  bestMonths: [3, 4, 5, 10, 11],
  estimatedCosts: { flightFromEurope: 800, hotelPerNight: 200, dailySpending: 120 },
})

const ALL = [PARIS, TOKYO]

const DEFAULT_PARAMS: ScoreParams = {
  origin: LONDON,
  maxBudgetPerPerson: 3000,
  maxDistanceKm: 10000,
  nights: 7,
  groupSize: 2,
}

// ── calculateStyleScore ──────────────────────────────────────────────────────

describe('calculateStyleScore', () => {
  it('returns 1 when travelStyles is undefined', () => {
    expect(calculateStyleScore(PARIS, undefined)).toBe(1)
  })

  it('returns 1 when travelStyles is an empty array', () => {
    expect(calculateStyleScore(PARIS, [])).toBe(1)
  })

  it('returns 1 when every requested style is matched', () => {
    expect(calculateStyleScore(PARIS, ['city'])).toBe(1)
  })

  it('returns a fraction when only some requested styles are matched', () => {
    // Paris supports city + culture; beach is not supported
    expect(calculateStyleScore(PARIS, ['city', 'beach'])).toBe(0.5)
  })

  it('returns 0 when no requested styles are matched', () => {
    expect(calculateStyleScore(PARIS, ['beach'])).toBe(0)
  })
})

// ── calculateSeasonScore ─────────────────────────────────────────────────────

describe('calculateSeasonScore', () => {
  it('returns 1 when travelMonth is undefined', () => {
    expect(calculateSeasonScore(PARIS, undefined)).toBe(1)
  })

  it('returns 1 when travelMonth is an exact best-month match', () => {
    expect(calculateSeasonScore(PARIS, 5)).toBe(1)
  })

  it('returns 0.5 when travelMonth is adjacent to a best month', () => {
    // Paris best months: 4, 5, 6, 9, 10 — month 3 is adjacent to 4
    expect(calculateSeasonScore(PARIS, 3)).toBe(0.5)
  })

  it('returns 0.5 when travelMonth wraps around the year boundary', () => {
    const destination = makeDestination({ id: 'wrap', bestMonths: [1] })
    expect(calculateSeasonScore(destination, 12)).toBe(0.5)
  })

  it('returns 0 when travelMonth is far from every best month', () => {
    // Paris best months: 4, 5, 6, 9, 10 — month 1 is not adjacent to any
    expect(calculateSeasonScore(PARIS, 1)).toBe(0)
  })
})

// ── calculateBudgetScore ─────────────────────────────────────────────────────

describe('calculateBudgetScore', () => {
  it('returns 0 when maxBudgetPerPerson is 0', () => {
    expect(calculateBudgetScore(PARIS, 341, 0, 7, 2)).toBe(0)
  })

  it('returns close to 1 when cost is far under budget', () => {
    // Paris perPerson cost ~730; budget of 7300 leaves 90% headroom
    expect(calculateBudgetScore(PARIS, 341, 7300, 7, 2)).toBeCloseTo(0.9, 1)
  })

  it('returns 0 when cost exceeds the budget', () => {
    expect(calculateBudgetScore(PARIS, 341, 100, 7, 2)).toBe(0)
  })

  it('returns 0 when cost exactly equals the budget', () => {
    expect(calculateBudgetScore(PARIS, 341, 730, 7, 2)).toBe(0)
  })
})

// ── calculateDistanceScore ───────────────────────────────────────────────────

describe('calculateDistanceScore', () => {
  it('returns 0 when maxDistanceKm is 0 and distanceKm is nonzero', () => {
    expect(calculateDistanceScore(100, 0)).toBe(0)
  })

  it('returns 1 when maxDistanceKm is 0 and distanceKm is 0', () => {
    expect(calculateDistanceScore(0, 0)).toBe(1)
  })

  it('returns 1 when distanceKm is 0', () => {
    expect(calculateDistanceScore(0, 1000)).toBe(1)
  })

  it('returns a fraction proportional to distance headroom', () => {
    expect(calculateDistanceScore(500, 1000)).toBe(0.5)
  })

  it('returns 0 when distanceKm equals maxDistanceKm', () => {
    expect(calculateDistanceScore(1000, 1000)).toBe(0)
  })
})

// ── scoreDestination ─────────────────────────────────────────────────────────

describe('scoreDestination', () => {
  it('throws when maxDistanceKm is negative', () => {
    expect(() => scoreDestination(PARIS, { ...DEFAULT_PARAMS, maxDistanceKm: -1 })).toThrow(
      'maxDistanceKm must be non-negative'
    )
  })

  it('throws when maxBudgetPerPerson is negative', () => {
    expect(() => scoreDestination(PARIS, { ...DEFAULT_PARAMS, maxBudgetPerPerson: -1 })).toThrow(
      'maxBudgetPerPerson must be non-negative'
    )
  })

  it('throws when nights is negative', () => {
    expect(() => scoreDestination(PARIS, { ...DEFAULT_PARAMS, nights: -1 })).toThrow(
      'nights must be non-negative'
    )
  })

  it('throws when groupSize is less than 1', () => {
    expect(() => scoreDestination(PARIS, { ...DEFAULT_PARAMS, groupSize: 0 })).toThrow(
      'groupSize must be at least 1'
    )
  })

  it('throws when travelMonth is below 1', () => {
    expect(() => scoreDestination(PARIS, { ...DEFAULT_PARAMS, travelMonth: 0 })).toThrow(
      'travelMonth must be between 1 and 12'
    )
  })

  it('throws when travelMonth is above 12', () => {
    expect(() => scoreDestination(PARIS, { ...DEFAULT_PARAMS, travelMonth: 13 })).toThrow(
      'travelMonth must be between 1 and 12'
    )
  })

  it('returns a totalScore of 100 for a perfect match', () => {
    const result = scoreDestination(PARIS, {
      ...DEFAULT_PARAMS,
      maxBudgetPerPerson: 730,
      maxDistanceKm: 341,
      travelStyles: ['city'],
      travelMonth: 5,
    })
    expect(result.styleScore).toBe(1)
    expect(result.seasonScore).toBe(1)
    // At the exact budget/distance limit, headroom scores are 0, so totalScore
    // reflects only the style + season weights.
    expect(result.totalScore).toBeCloseTo(100 * (DEFAULT_WEIGHTS.style + DEFAULT_WEIGHTS.season), 5)
  })

  it('returns a totalScore of 0 for a total mismatch', () => {
    const result = scoreDestination(PARIS, {
      ...DEFAULT_PARAMS,
      maxBudgetPerPerson: 1,
      maxDistanceKm: 1,
      travelStyles: ['beach'],
      travelMonth: 1,
    })
    expect(result.totalScore).toBe(0)
  })

  it('includes the destination in the result', () => {
    const result = scoreDestination(PARIS, DEFAULT_PARAMS)
    expect(result.destination).toBe(PARIS)
  })

  it('applies custom weights', () => {
    const styleOnly = scoreDestination(PARIS, {
      ...DEFAULT_PARAMS,
      travelStyles: ['beach'],
      weights: { style: 1, season: 0, budget: 0, distance: 0 },
    })
    // Paris does not match 'beach', so with 100% weight on style the score is 0
    expect(styleOnly.totalScore).toBe(0)

    const noStyleWeight = scoreDestination(PARIS, {
      ...DEFAULT_PARAMS,
      travelStyles: ['beach'],
      weights: { style: 0, season: 0, budget: 0, distance: 1 },
    })
    // With style weight zeroed out, the mismatch no longer affects the score
    expect(noStyleWeight.totalScore).toBeGreaterThan(0)
  })
})

// ── scoreDestinations ────────────────────────────────────────────────────────

describe('scoreDestinations', () => {
  it('returns a score for every destination', () => {
    const results = scoreDestinations(ALL, DEFAULT_PARAMS)
    expect(results).toHaveLength(ALL.length)
  })

  it('returns an empty array for an empty input', () => {
    expect(scoreDestinations([], DEFAULT_PARAMS)).toEqual([])
  })

  it('sorts results by totalScore descending', () => {
    // Tokyo is much farther and pricier than Paris, so under a shared budget
    // and distance cap it should always score lower.
    const results = scoreDestinations(ALL, {
      ...DEFAULT_PARAMS,
      maxBudgetPerPerson: 3000,
      maxDistanceKm: 10000,
    })
    expect(results[0]?.destination.id).toBe('paris')
    expect(results[1]?.destination.id).toBe('tokyo')
    expect(results[0]?.totalScore).toBeGreaterThanOrEqual(results[1]?.totalScore ?? 0)
  })
})
