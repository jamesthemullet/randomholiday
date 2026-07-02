import { describe, it, expect } from 'vitest'
import { getFlightTier, estimateFlightCostPerPerson, calculateBudget } from '@/lib/budgetCalculator'
import type { BudgetParams } from '@/lib/budgetCalculator'
import type { Destination } from '@/lib/destinations'

// Minimal destination stub reused across tests
const stubDestination: Destination = {
  id: 'test-city',
  name: 'Test City',
  country: 'Testland',
  countryCode: 'TL',
  coordinates: { lat: 0, lng: 0 },
  continent: 'Europe',
  description: 'A test destination.',
  climate: 'temperate',
  travelStyles: ['city'],
  bestMonths: [6, 7, 8],
  estimatedCosts: { flightFromEurope: 300, hotelPerNight: 100, dailySpending: 50 },
  activities: ['sightseeing'],
  currency: 'USD',
  visa: 'free',
}

// ── getFlightTier ─────────────────────────────────────────────────────────────

describe('getFlightTier', () => {
  it('returns short-haul for 0 km', () => {
    expect(getFlightTier(0)).toBe('short-haul')
  })

  it('returns short-haul for exactly 1500 km (upper boundary)', () => {
    expect(getFlightTier(1500)).toBe('short-haul')
  })

  it('returns medium-haul for 1501 km', () => {
    expect(getFlightTier(1501)).toBe('medium-haul')
  })

  it('returns medium-haul for exactly 4000 km (upper boundary)', () => {
    expect(getFlightTier(4000)).toBe('medium-haul')
  })

  it('returns long-haul for 4001 km', () => {
    expect(getFlightTier(4001)).toBe('long-haul')
  })

  it('returns long-haul for exactly 8000 km (upper boundary)', () => {
    expect(getFlightTier(8000)).toBe('long-haul')
  })

  it('returns ultra-long-haul for 8001 km', () => {
    expect(getFlightTier(8001)).toBe('ultra-long-haul')
  })

  it('returns ultra-long-haul for very large distances', () => {
    expect(getFlightTier(20000)).toBe('ultra-long-haul')
  })
})

// ── estimateFlightCostPerPerson ───────────────────────────────────────────────

describe('estimateFlightCostPerPerson', () => {
  it('returns 120 for short-haul (≤1500 km)', () => {
    expect(estimateFlightCostPerPerson(500)).toBe(120)
  })

  it('returns 350 for medium-haul (1501–4000 km)', () => {
    expect(estimateFlightCostPerPerson(2000)).toBe(350)
  })

  it('returns 700 for long-haul (4001–8000 km)', () => {
    expect(estimateFlightCostPerPerson(6000)).toBe(700)
  })

  it('returns 1100 for ultra-long-haul (>8000 km)', () => {
    expect(estimateFlightCostPerPerson(15000)).toBe(1100)
  })

  it('returns 120 at the exact short-haul boundary (1500 km)', () => {
    expect(estimateFlightCostPerPerson(1500)).toBe(120)
  })

  it('returns 350 at the exact medium-haul boundary (4000 km)', () => {
    expect(estimateFlightCostPerPerson(4000)).toBe(350)
  })

  it('returns 700 at the exact long-haul boundary (8000 km)', () => {
    expect(estimateFlightCostPerPerson(8000)).toBe(700)
  })
})

// ── calculateBudget ───────────────────────────────────────────────────────────

describe('calculateBudget', () => {
  const baseParams: BudgetParams = {
    destination: stubDestination,
    distanceKm: 500,
    nights: 7,
    groupSize: 2,
  }

  it('returns the correct flight tier', () => {
    const result = calculateBudget(baseParams)
    expect(result.flightTier).toBe('short-haul')
  })

  it('returns the correct flightCostPerPerson for short-haul', () => {
    const result = calculateBudget(baseParams)
    expect(result.flightCostPerPerson).toBe(120)
  })

  it('reflects destination hotelCostPerNight', () => {
    const result = calculateBudget(baseParams)
    expect(result.hotelCostPerNight).toBe(100)
  })

  it('reflects destination dailySpendingPerPerson', () => {
    const result = calculateBudget(baseParams)
    expect(result.dailySpendingPerPerson).toBe(50)
  })

  it('calculates totalFlightCost as flightCostPerPerson × groupSize', () => {
    // 120 × 2 = 240
    const result = calculateBudget(baseParams)
    expect(result.totalFlightCost).toBe(240)
  })

  it('calculates totalHotelCost as hotelPerNight × nights', () => {
    // 100 × 7 = 700
    const result = calculateBudget(baseParams)
    expect(result.totalHotelCost).toBe(700)
  })

  it('calculates totalDailySpending as dailySpending × groupSize × nights', () => {
    // 50 × 2 × 7 = 700
    const result = calculateBudget(baseParams)
    expect(result.totalDailySpending).toBe(700)
  })

  it('calculates totalCost as sum of all three cost lines', () => {
    // 240 + 700 + 700 = 1640
    const result = calculateBudget(baseParams)
    expect(result.totalCost).toBe(1640)
  })

  it('calculates perPersonCost as totalCost / groupSize', () => {
    // 1640 / 2 = 820
    const result = calculateBudget(baseParams)
    expect(result.perPersonCost).toBe(820)
  })

  it('passes nights and groupSize through to the breakdown', () => {
    const result = calculateBudget(baseParams)
    expect(result.nights).toBe(7)
    expect(result.groupSize).toBe(2)
  })

  it('handles a solo traveller (groupSize 1)', () => {
    const result = calculateBudget({ ...baseParams, groupSize: 1 })
    // flightCost 120×1=120, hotel 100×7=700, daily 50×1×7=350 → total 1170
    expect(result.totalCost).toBe(1170)
    expect(result.perPersonCost).toBe(1170)
  })

  it('handles a large group (groupSize 10)', () => {
    const result = calculateBudget({ ...baseParams, groupSize: 10 })
    // flights: 120×10=1200, hotel: 100×7=700, daily: 50×10×7=3500 → total 5400
    expect(result.totalFlightCost).toBe(1200)
    expect(result.totalHotelCost).toBe(700)
    expect(result.totalDailySpending).toBe(3500)
    expect(result.totalCost).toBe(5400)
    expect(result.perPersonCost).toBe(540)
  })

  it('handles 0 nights (day trip)', () => {
    const result = calculateBudget({ ...baseParams, nights: 0 })
    // hotel: 0, daily: 0, flights: 240 → total 240
    expect(result.totalHotelCost).toBe(0)
    expect(result.totalDailySpending).toBe(0)
    expect(result.totalCost).toBe(240)
  })

  it('uses medium-haul tier for 2500 km', () => {
    const result = calculateBudget({ ...baseParams, distanceKm: 2500 })
    expect(result.flightTier).toBe('medium-haul')
    expect(result.flightCostPerPerson).toBe(350)
  })

  it('uses long-haul tier for 6000 km', () => {
    const result = calculateBudget({ ...baseParams, distanceKm: 6000 })
    expect(result.flightTier).toBe('long-haul')
    expect(result.flightCostPerPerson).toBe(700)
  })

  it('uses ultra-long-haul tier for 15000 km', () => {
    const result = calculateBudget({ ...baseParams, distanceKm: 15000 })
    expect(result.flightTier).toBe('ultra-long-haul')
    expect(result.flightCostPerPerson).toBe(1100)
  })

  it('reflects destination costs from an expensive destination', () => {
    const expensive: Destination = {
      ...stubDestination,
      estimatedCosts: { flightFromEurope: 1200, hotelPerNight: 400, dailySpending: 150 },
    }
    const result = calculateBudget({ ...baseParams, destination: expensive, distanceKm: 12000 })
    // ultra-long-haul: 1100×2=2200 flights, 400×7=2800 hotel, 150×2×7=2100 daily → 7100
    expect(result.totalFlightCost).toBe(2200)
    expect(result.totalHotelCost).toBe(2800)
    expect(result.totalDailySpending).toBe(2100)
    expect(result.totalCost).toBe(7100)
    expect(result.perPersonCost).toBe(3550)
  })

  describe('input validation', () => {
    it('throws when distanceKm is negative', () => {
      expect(() => calculateBudget({ ...baseParams, distanceKm: -1 })).toThrow(
        'distanceKm must be non-negative'
      )
    })

    it('throws when nights is negative', () => {
      expect(() => calculateBudget({ ...baseParams, nights: -1 })).toThrow(
        'nights must be non-negative'
      )
    })

    it('throws when groupSize is zero', () => {
      expect(() => calculateBudget({ ...baseParams, groupSize: 0 })).toThrow(
        'groupSize must be at least 1'
      )
    })

    it('throws when groupSize is negative', () => {
      expect(() => calculateBudget({ ...baseParams, groupSize: -5 })).toThrow(
        'groupSize must be at least 1'
      )
    })
  })
})
