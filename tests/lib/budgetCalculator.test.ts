import { describe, it, expect } from 'vitest'
import { calculateBudget, isWithinBudget } from '@/lib/budgetCalculator'
import type { EstimatedCosts } from '@/lib/destinations'

const BARCELONA: EstimatedCosts = { flightFromEurope: 120, hotelPerNight: 110, dailySpending: 80 }

describe('calculateBudget', () => {
  it('calculates costs for a solo traveler', () => {
    const result = calculateBudget(BARCELONA, { nights: 5, travelers: 1 })
    expect(result.flightCost).toBe(120)
    expect(result.hotelCost).toBe(550) // 1 room, 5 nights
    expect(result.spendingCost).toBe(400) // 80 * 5 * 1
    expect(result.totalCost).toBe(1070)
    expect(result.costPerPerson).toBe(1070)
  })

  it('shares one hotel room between two travelers', () => {
    const result = calculateBudget(BARCELONA, { nights: 5, travelers: 2 })
    expect(result.flightCost).toBe(240) // 120 * 2
    expect(result.hotelCost).toBe(550) // still 1 room
    expect(result.spendingCost).toBe(800) // 80 * 5 * 2
    expect(result.totalCost).toBe(1590)
    expect(result.costPerPerson).toBe(795)
  })

  it('rounds up to an extra room for an odd-sized group', () => {
    const result = calculateBudget(BARCELONA, { nights: 3, travelers: 3 })
    expect(result.hotelCost).toBe(660) // 2 rooms * 110 * 3 nights
  })

  it('returns zero costs for zero nights', () => {
    const result = calculateBudget(BARCELONA, { nights: 0, travelers: 2 })
    expect(result.hotelCost).toBe(0)
    expect(result.spendingCost).toBe(0)
    expect(result.totalCost).toBe(result.flightCost)
  })
})

describe('isWithinBudget', () => {
  it('returns true when the per-person cost is under the budget', () => {
    expect(isWithinBudget(BARCELONA, { nights: 3, travelers: 2 }, 2000)).toBe(true)
  })

  it('returns false when the per-person cost exceeds the budget', () => {
    expect(isWithinBudget(BARCELONA, { nights: 3, travelers: 2 }, 100)).toBe(false)
  })

  it('returns true when the per-person cost exactly equals the budget', () => {
    const { costPerPerson } = calculateBudget(BARCELONA, { nights: 4, travelers: 1 })
    expect(isWithinBudget(BARCELONA, { nights: 4, travelers: 1 }, costPerPerson)).toBe(true)
  })
})
