import type { EstimatedCosts } from './destinations'

export interface TripParams {
  /** Number of nights at the destination */
  nights: number
  /** Number of people travelling together */
  travelers: number
}

export interface BudgetBreakdown {
  /** Round-trip flight cost for the whole group */
  flightCost: number
  /** Total accommodation cost for the whole group */
  hotelCost: number
  /** Total daily spending money for the whole group */
  spendingCost: number
  /** flightCost + hotelCost + spendingCost */
  totalCost: number
  /** totalCost divided evenly across travelers */
  costPerPerson: number
}

/** Hotel rooms are priced for double occupancy, so two travelers share one room */
const TRAVELERS_PER_ROOM = 2

/**
 * Estimates the full cost of a trip to a destination for a group of
 * travelers, broken down by flights, hotel, and daily spending money.
 */
export function calculateBudget(costs: EstimatedCosts, trip: TripParams): BudgetBreakdown {
  const rooms = Math.ceil(trip.travelers / TRAVELERS_PER_ROOM)

  const flightCost = costs.flightFromEurope * trip.travelers
  const hotelCost = costs.hotelPerNight * trip.nights * rooms
  const spendingCost = costs.dailySpending * trip.nights * trip.travelers
  const totalCost = flightCost + hotelCost + spendingCost
  const costPerPerson = totalCost / trip.travelers

  return { flightCost, hotelCost, spendingCost, totalCost, costPerPerson }
}

/**
 * Returns true if the estimated per-person cost of the trip is at or below
 * the given budget.
 */
export function isWithinBudget(
  costs: EstimatedCosts,
  trip: TripParams,
  maxBudgetPerPerson: number
): boolean {
  return calculateBudget(costs, trip).costPerPerson <= maxBudgetPerPerson
}
