import { describe, it, expect } from 'vitest'
import { filterDestinations, getFilteredDestinations } from '@/lib/filterEngine'
import type { FilterParams } from '@/lib/filterEngine'
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
 * Paris (~341 km from London). Short-haul flight cost: $120.
 * Budget for 7 nights, 2 people:
 *   flights: 120 × 2 = 240
 *   hotel:   80 × 7  = 560
 *   daily:   50 × 2 × 7 = 700
 *   total:   1500   → perPerson: 750
 */
const PARIS = makeDestination({
  id: 'paris',
  name: 'Paris',
  coordinates: { lat: 48.8566, lng: 2.3522 },
  travelStyles: ['city', 'culture'],
  estimatedCosts: { flightFromEurope: 100, hotelPerNight: 80, dailySpending: 50 },
})

/**
 * New York (~5 570 km from London). Long-haul flight cost: $700.
 * Budget for 7 nights, 2 people:
 *   flights: 700 × 2  = 1 400
 *   hotel:   150 × 7  = 1 050
 *   daily:   100 × 2 × 7 = 1 400
 *   total:   3 850  → perPerson: 1 925
 */
const NEW_YORK = makeDestination({
  id: 'new-york',
  name: 'New York',
  coordinates: { lat: 40.7128, lng: -74.006 },
  travelStyles: ['city'],
  estimatedCosts: { flightFromEurope: 600, hotelPerNight: 150, dailySpending: 100 },
})

/**
 * Tokyo (~9 560 km from London). Ultra-long-haul flight cost: $1 100.
 * Budget for 7 nights, 2 people:
 *   flights: 1100 × 2  = 2 200
 *   hotel:   200 × 7   = 1 400
 *   daily:   120 × 2 × 7 = 1 680
 *   total:   5 280  → perPerson: 2 640
 */
const TOKYO = makeDestination({
  id: 'tokyo',
  name: 'Tokyo',
  coordinates: { lat: 35.6762, lng: 139.6503 },
  travelStyles: ['city', 'culture'],
  estimatedCosts: { flightFromEurope: 800, hotelPerNight: 200, dailySpending: 120 },
})

/** A beach-only destination close to London (Malaga, ~2 000 km, medium-haul) */
const MALAGA = makeDestination({
  id: 'malaga',
  name: 'Malaga',
  coordinates: { lat: 36.7213, lng: -4.4214 },
  travelStyles: ['beach'],
  estimatedCosts: { flightFromEurope: 150, hotelPerNight: 90, dailySpending: 60 },
})

const ALL = [PARIS, NEW_YORK, TOKYO, MALAGA]

/** Default params used in most tests — generous limits so all pass by default */
const DEFAULT_PARAMS: FilterParams = {
  origin: LONDON,
  maxBudgetPerPerson: 5000,
  maxDistanceKm: 15000,
  nights: 7,
  groupSize: 2,
}

// ── filterDestinations ────────────────────────────────────────────────────────

describe('filterDestinations', () => {
  // ── validation ──────────────────────────────────────────────────────────────

  it('throws when maxDistanceKm is negative', () => {
    expect(() => filterDestinations(ALL, { ...DEFAULT_PARAMS, maxDistanceKm: -1 })).toThrow(
      'maxDistanceKm must be non-negative'
    )
  })

  it('throws when maxBudgetPerPerson is negative', () => {
    expect(() => filterDestinations(ALL, { ...DEFAULT_PARAMS, maxBudgetPerPerson: -1 })).toThrow(
      'maxBudgetPerPerson must be non-negative'
    )
  })

  it('throws when nights is negative', () => {
    expect(() => filterDestinations(ALL, { ...DEFAULT_PARAMS, nights: -1 })).toThrow(
      'nights must be non-negative'
    )
  })

  it('throws when groupSize is less than 1', () => {
    expect(() => filterDestinations(ALL, { ...DEFAULT_PARAMS, groupSize: 0 })).toThrow(
      'groupSize must be at least 1'
    )
  })

  // ── empty input ─────────────────────────────────────────────────────────────

  it('returns empty result when given an empty list', () => {
    const result = filterDestinations([], DEFAULT_PARAMS)
    expect(result.passed).toEqual([])
    expect(result.removedByDistance).toEqual([])
    expect(result.removedByBudget).toEqual([])
    expect(result.removedByStyle).toEqual([])
  })

  // ── distance filter ─────────────────────────────────────────────────────────

  it('removes destinations beyond maxDistanceKm', () => {
    // 2 000 km only keeps Paris (~341 km) and Malaga (~2 000 km boundary);
    // New York (~5 570) and Tokyo (~9 560) are removed.
    const result = filterDestinations(ALL, { ...DEFAULT_PARAMS, maxDistanceKm: 2200 })
    const passedIds = result.passed.map((d) => d.id)
    expect(passedIds).toContain('paris')
    expect(passedIds).toContain('malaga')
    expect(result.removedByDistance.map((d) => d.id)).toContain('new-york')
    expect(result.removedByDistance.map((d) => d.id)).toContain('tokyo')
  })

  it('keeps all destinations when maxDistanceKm is very large', () => {
    const result = filterDestinations(ALL, { ...DEFAULT_PARAMS, maxDistanceKm: 20000 })
    expect(result.passed).toHaveLength(ALL.length)
    expect(result.removedByDistance).toHaveLength(0)
  })

  it('removes all destinations when maxDistanceKm is 0', () => {
    const result = filterDestinations(ALL, { ...DEFAULT_PARAMS, maxDistanceKm: 0 })
    expect(result.passed).toHaveLength(0)
    expect(result.removedByDistance).toHaveLength(ALL.length)
  })

  // ── budget filter ───────────────────────────────────────────────────────────

  it('removes destinations that exceed maxBudgetPerPerson', () => {
    // Paris per-person for 7n/2pax: (120×2 + 80×7 + 50×2×7) / 2 = 750
    // New York:                      (700×2 + 150×7 + 100×2×7) / 2 = 1 925
    // Set budget to 800 to pass Paris but fail New York (and Tokyo)
    const result = filterDestinations([PARIS, NEW_YORK], {
      ...DEFAULT_PARAMS,
      maxBudgetPerPerson: 800,
    })
    expect(result.passed.map((d) => d.id)).toEqual(['paris'])
    expect(result.removedByBudget.map((d) => d.id)).toEqual(['new-york'])
  })

  it('keeps destinations exactly at the budget limit', () => {
    // Paris per-person: 750 — set budget to exactly 750
    const result = filterDestinations([PARIS], {
      ...DEFAULT_PARAMS,
      maxBudgetPerPerson: 750,
    })
    expect(result.passed.map((d) => d.id)).toEqual(['paris'])
    expect(result.removedByBudget).toHaveLength(0)
  })

  it('removes destinations one cent above the budget limit', () => {
    // Paris per-person: 750 — set budget to 749
    const result = filterDestinations([PARIS], {
      ...DEFAULT_PARAMS,
      maxBudgetPerPerson: 749,
    })
    expect(result.passed).toHaveLength(0)
    expect(result.removedByBudget.map((d) => d.id)).toEqual(['paris'])
  })

  it('budget filter runs only on destinations that passed the distance filter', () => {
    // Tokyo is too far; ensure it only appears in removedByDistance, not removedByBudget
    const result = filterDestinations([PARIS, TOKYO], {
      ...DEFAULT_PARAMS,
      maxDistanceKm: 2000,
      maxBudgetPerPerson: 5000,
    })
    expect(result.removedByDistance.map((d) => d.id)).toContain('tokyo')
    expect(result.removedByBudget.map((d) => d.id)).not.toContain('tokyo')
  })

  // ── travel-style filter ─────────────────────────────────────────────────────

  it('keeps destinations with at least one matching style', () => {
    const result = filterDestinations(ALL, {
      ...DEFAULT_PARAMS,
      travelStyles: ['beach'],
    })
    expect(result.passed.map((d) => d.id)).toContain('malaga')
    expect(result.passed.map((d) => d.id)).not.toContain('paris')
    expect(result.passed.map((d) => d.id)).not.toContain('new-york')
  })

  it('tracks destinations removed by the style filter', () => {
    const result = filterDestinations([PARIS, MALAGA], {
      ...DEFAULT_PARAMS,
      travelStyles: ['beach'],
    })
    expect(result.removedByStyle.map((d) => d.id)).toEqual(['paris'])
  })

  it('keeps all destinations when travelStyles is undefined', () => {
    const result = filterDestinations(ALL, {
      ...DEFAULT_PARAMS,
      travelStyles: undefined,
    })
    expect(result.passed).toHaveLength(ALL.length)
    expect(result.removedByStyle).toHaveLength(0)
  })

  it('keeps all destinations when travelStyles is an empty array', () => {
    const result = filterDestinations(ALL, {
      ...DEFAULT_PARAMS,
      travelStyles: [],
    })
    expect(result.passed).toHaveLength(ALL.length)
    expect(result.removedByStyle).toHaveLength(0)
  })

  it('keeps destinations matching any of multiple requested styles', () => {
    const result = filterDestinations(ALL, {
      ...DEFAULT_PARAMS,
      travelStyles: ['beach', 'culture'],
    })
    // Paris: city+culture ✓, New York: city ✗, Tokyo: city+culture ✓, Malaga: beach ✓
    const passedIds = result.passed.map((d) => d.id)
    expect(passedIds).toContain('paris')
    expect(passedIds).toContain('tokyo')
    expect(passedIds).toContain('malaga')
    expect(passedIds).not.toContain('new-york')
  })

  it('style filter runs only on destinations that passed distance + budget', () => {
    // Restrict distance so New York and Tokyo are removed first
    const result = filterDestinations(ALL, {
      ...DEFAULT_PARAMS,
      maxDistanceKm: 2200,
      travelStyles: ['beach'],
    })
    // New York and Tokyo should only appear in removedByDistance
    expect(result.removedByDistance.map((d) => d.id)).toContain('new-york')
    expect(result.removedByStyle.map((d) => d.id)).not.toContain('new-york')
  })

  // ── combined filters ────────────────────────────────────────────────────────

  it('applies all three filters in sequence', () => {
    // Distance: Tokyo (~9 560 km) passes maxDistanceKm 10 000; New York (~5 570 km) passes.
    // Budget (7n/2pax): Paris ~750, Malaga ~1085, New York ~1925, Tokyo ~2640.
    //   → maxBudgetPerPerson 1200 removes New York and Tokyo; Paris and Malaga pass.
    // Style ['city']: Paris (city+culture) passes; Malaga (beach only) → removedByStyle.
    const result = filterDestinations(ALL, {
      origin: LONDON,
      maxDistanceKm: 10000,
      maxBudgetPerPerson: 1200,
      nights: 7,
      groupSize: 2,
      travelStyles: ['city'],
    })
    expect(result.passed.map((d) => d.id)).toContain('paris')
    expect(result.removedByBudget.map((d) => d.id)).toContain('new-york')
    expect(result.removedByStyle.map((d) => d.id)).toContain('malaga')
  })

  it('returns empty passed list when nothing matches', () => {
    const result = filterDestinations(ALL, {
      ...DEFAULT_PARAMS,
      maxBudgetPerPerson: 0,
    })
    expect(result.passed).toHaveLength(0)
  })

  // ── groupSize and nights affect budget ──────────────────────────────────────

  it('reflects higher group size in per-person cost calculation', () => {
    // With 1 person Paris cost = (120×1 + 80×7 + 50×1×7) / 1 = 120+560+350 = 1030
    // With 2 people = (120×2 + 80×7 + 50×2×7) / 2 = (240+560+700)/2 = 750
    const solo = filterDestinations([PARIS], {
      ...DEFAULT_PARAMS,
      groupSize: 1,
      maxBudgetPerPerson: 1100, // 1030 per-person for 1 pax, so 1100 passes
    })
    expect(solo.passed.map((d) => d.id)).toContain('paris')

    const couple = filterDestinations([PARIS], {
      ...DEFAULT_PARAMS,
      groupSize: 2,
      maxBudgetPerPerson: 700, // below the 750 per-person for 2pax
    })
    expect(couple.passed).toHaveLength(0)
  })

  it('reflects longer trip duration in per-person cost', () => {
    // For 1 night Paris (1pax): 120 + 80 + 50 = 250 → well within 500
    const shortTrip = filterDestinations([PARIS], {
      ...DEFAULT_PARAMS,
      nights: 1,
      groupSize: 1,
      maxBudgetPerPerson: 500,
    })
    expect(shortTrip.passed).toHaveLength(1)

    // For 20 nights (1pax): 120 + 80×20 + 50×20 = 120+1600+1000 = 2720 → exceeds 500
    const longTrip = filterDestinations([PARIS], {
      ...DEFAULT_PARAMS,
      nights: 20,
      groupSize: 1,
      maxBudgetPerPerson: 500,
    })
    expect(longTrip.passed).toHaveLength(0)
    expect(longTrip.removedByBudget).toHaveLength(1)
  })
})

// ── getFilteredDestinations ───────────────────────────────────────────────────

describe('getFilteredDestinations', () => {
  it('returns the same passing set as filterDestinations', () => {
    const params: FilterParams = { ...DEFAULT_PARAMS, maxDistanceKm: 2200 }
    const fromFull = filterDestinations(ALL, params).passed
    const fromConvenience = getFilteredDestinations(ALL, params)
    expect(fromConvenience).toEqual(fromFull)
  })

  it('returns an empty array when no destinations pass', () => {
    expect(getFilteredDestinations(ALL, { ...DEFAULT_PARAMS, maxBudgetPerPerson: 0 })).toEqual([])
  })

  it('returns all destinations when limits are very generous', () => {
    expect(getFilteredDestinations(ALL, DEFAULT_PARAMS)).toHaveLength(ALL.length)
  })
})
