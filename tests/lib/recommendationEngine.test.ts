import { describe, it, expect } from 'vitest'
import { getRecommendations } from '@/lib/recommendationEngine'
import type { RecommendationParams } from '@/lib/recommendationEngine'
import { filterDestinations } from '@/lib/filterEngine'
import { scoreDestinations } from '@/lib/scoringEngine'
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

/** ~341 km from London, cheapest — should always score highest of the four. */
const PARIS = makeDestination({
  id: 'paris',
  coordinates: { lat: 48.8566, lng: 2.3522 },
  travelStyles: ['city', 'culture'],
  estimatedCosts: { flightFromEurope: 100, hotelPerNight: 80, dailySpending: 50 },
})

/** ~5 570 km from London, mid cost — should score between Paris and Tokyo. */
const NEW_YORK = makeDestination({
  id: 'new-york',
  coordinates: { lat: 40.7128, lng: -74.006 },
  travelStyles: ['city', 'culture'],
  estimatedCosts: { flightFromEurope: 700, hotelPerNight: 150, dailySpending: 100 },
})

/** ~9 560 km from London, pricier — should score lower than New York. */
const TOKYO = makeDestination({
  id: 'tokyo',
  coordinates: { lat: 35.6762, lng: 139.6503 },
  travelStyles: ['city', 'culture'],
  estimatedCosts: { flightFromEurope: 800, hotelPerNight: 200, dailySpending: 120 },
})

/** ~17 000 km from London, most expensive — should score lowest of the four. */
const SYDNEY = makeDestination({
  id: 'sydney',
  coordinates: { lat: -33.8688, lng: 151.2093 },
  travelStyles: ['city', 'culture'],
  estimatedCosts: { flightFromEurope: 1100, hotelPerNight: 220, dailySpending: 140 },
})

/** Comfortably within budget on its own, but priced far beyond maxBudgetPerPerson below. */
const OVER_BUDGET = makeDestination({
  id: 'over-budget',
  coordinates: { lat: 48.2082, lng: 16.3738 },
  travelStyles: ['city', 'culture'],
  estimatedCosts: { flightFromEurope: 100, hotelPerNight: 5000, dailySpending: 5000 },
})

const GENEROUS_PARAMS: RecommendationParams = {
  origin: LONDON,
  maxBudgetPerPerson: 6000,
  maxDistanceKm: 20000,
  nights: 7,
  groupSize: 2,
}

describe('getRecommendations', () => {
  it('returns a filterResult alongside recommendations', () => {
    const result = getRecommendations([PARIS, OVER_BUDGET], {
      ...GENEROUS_PARAMS,
      maxBudgetPerPerson: 1000,
      count: 1,
      poolSize: 1,
    })

    expect(result.filterResult.passed.map((d) => d.id)).toEqual(['paris'])
    expect(result.filterResult.removedByBudget.map((d) => d.id)).toEqual(['over-budget'])
    expect(result.recommendations.map((r) => r.destination.id)).toEqual(['paris'])
  })

  it('never recommends a destination removed by the hard filters', () => {
    const result = getRecommendations([PARIS, NEW_YORK, OVER_BUDGET], {
      ...GENEROUS_PARAMS,
      maxBudgetPerPerson: 1000,
      count: 3,
      poolSize: 10,
      random: () => 0,
    })

    expect(result.recommendations.map((r) => r.destination.id)).not.toContain('over-budget')
  })

  it('samples only from the top poolSize scored candidates', () => {
    const expectedScored = scoreDestinations(
      filterDestinations([PARIS, NEW_YORK, TOKYO, SYDNEY], GENEROUS_PARAMS).passed,
      GENEROUS_PARAMS
    )
    const topTwoIds = expectedScored.slice(0, 2).map((s) => s.destination.id)

    const result = getRecommendations([PARIS, NEW_YORK, TOKYO, SYDNEY], {
      ...GENEROUS_PARAMS,
      count: 2,
      poolSize: 2,
      random: () => 0.999,
    })

    expect(result.recommendations.map((r) => r.destination.id).sort()).toEqual(topTwoIds.sort())
  })

  it('includes every passing destination when poolSize exceeds the candidate count', () => {
    const result = getRecommendations([PARIS, NEW_YORK, TOKYO, SYDNEY], {
      ...GENEROUS_PARAMS,
      count: 4,
      poolSize: 10,
      random: () => 0,
    })

    expect(result.recommendations.map((r) => r.destination.id).sort()).toEqual(
      ['new-york', 'paris', 'sydney', 'tokyo'].sort()
    )
  })

  it('produces a different order for different random sources', () => {
    const low = getRecommendations([PARIS, NEW_YORK, TOKYO, SYDNEY], {
      ...GENEROUS_PARAMS,
      count: 4,
      poolSize: 4,
      random: () => 0,
    })
    const high = getRecommendations([PARIS, NEW_YORK, TOKYO, SYDNEY], {
      ...GENEROUS_PARAMS,
      count: 4,
      poolSize: 4,
      random: () => 0.999,
    })

    expect(low.recommendations.map((r) => r.destination.id)).not.toEqual(
      high.recommendations.map((r) => r.destination.id)
    )
  })

  it('does not shuffle a pool of a single destination', () => {
    const result = getRecommendations([PARIS], {
      ...GENEROUS_PARAMS,
      count: 1,
      poolSize: 1,
      random: () => 0,
    })

    expect(result.recommendations.map((r) => r.destination.id)).toEqual(['paris'])
  })

  it('returns fewer recommendations than count when fewer destinations pass the filters', () => {
    const result = getRecommendations([PARIS, NEW_YORK], {
      ...GENEROUS_PARAMS,
      count: 5,
      poolSize: 10,
    })

    expect(result.recommendations).toHaveLength(2)
  })

  it('returns no recommendations when nothing passes the filters', () => {
    const result = getRecommendations([OVER_BUDGET], {
      ...GENEROUS_PARAMS,
      maxBudgetPerPerson: 1000,
    })

    expect(result.recommendations).toEqual([])
  })

  it('defaults count to 3 and poolSize to 10', () => {
    const many = [PARIS, NEW_YORK, TOKYO, SYDNEY, OVER_BUDGET]
    const result = getRecommendations(many, GENEROUS_PARAMS)

    expect(result.recommendations.length).toBeLessThanOrEqual(3)
  })

  it('uses Math.random by default without throwing', () => {
    const result = getRecommendations([PARIS, NEW_YORK, TOKYO], { ...GENEROUS_PARAMS, count: 2 })

    expect(result.recommendations.length).toBe(2)
  })

  it('throws when count is less than 1', () => {
    expect(() => getRecommendations([PARIS], { ...GENEROUS_PARAMS, count: 0 })).toThrow(
      'count must be at least 1'
    )
  })

  it('throws when poolSize is less than 1', () => {
    expect(() => getRecommendations([PARIS], { ...GENEROUS_PARAMS, poolSize: 0 })).toThrow(
      'poolSize must be at least 1'
    )
  })

  it('propagates validation errors from the underlying filter engine', () => {
    expect(() => getRecommendations([PARIS], { ...GENEROUS_PARAMS, maxDistanceKm: -1 })).toThrow(
      'maxDistanceKm must be non-negative'
    )
  })

  it('applies travelMonth and weights through to scoring', () => {
    const result = getRecommendations([PARIS, TOKYO], {
      ...GENEROUS_PARAMS,
      count: 2,
      poolSize: 2,
      travelMonth: 7,
      weights: { season: 1, style: 0, budget: 0, distance: 0 },
    })

    const parisScore = result.recommendations.find((r) => r.destination.id === 'paris')
    expect(parisScore?.seasonScore).toBe(1)
  })
})
