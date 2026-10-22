import type { Destination } from './destinations'

export type FlightTier = 'short-haul' | 'medium-haul' | 'long-haul' | 'ultra-long-haul'

export interface BudgetParams {
  destination: Destination
  /** Great-circle distance from origin to destination in kilometres */
  distanceKm: number
  /** Number of nights at the destination */
  nights: number
  /** Total number of travellers */
  groupSize: number
}

export interface BudgetBreakdown {
  flightTier: FlightTier
  /** Round-trip flight cost per person in GBP */
  flightCostPerPerson: number
  /** Number of hotel rooms booked, roughly one room per 2 travellers */
  rooms: number
  /** Hotel cost per night in GBP across all booked rooms */
  hotelCostPerNight: number
  /** Daily spending per person in GBP (food, transport, activities) */
  dailySpendingPerPerson: number
  nights: number
  groupSize: number
  /** flightCostPerPerson × groupSize */
  totalFlightCost: number
  /** hotelCostPerNight × nights */
  totalHotelCost: number
  /** dailySpendingPerPerson × groupSize × nights */
  totalDailySpending: number
  /** Sum of all costs */
  totalCost: number
  /** totalCost / groupSize */
  perPersonCost: number
}

// Distance thresholds (km) defining each flight tier
const TIER_THRESHOLDS = {
  SHORT: 1500,
  MEDIUM: 4000,
  LONG: 8000,
} as const

// Round-trip flight cost per person in GBP for each tier
const FLIGHT_COSTS: Record<FlightTier, number> = {
  'short-haul': 120,
  'medium-haul': 350,
  'long-haul': 700,
  'ultra-long-haul': 1100,
}

export function getFlightTier(distanceKm: number): FlightTier {
  if (distanceKm <= TIER_THRESHOLDS.SHORT) return 'short-haul'
  if (distanceKm <= TIER_THRESHOLDS.MEDIUM) return 'medium-haul'
  if (distanceKm <= TIER_THRESHOLDS.LONG) return 'long-haul'
  return 'ultra-long-haul'
}

export function estimateFlightCostPerPerson(distanceKm: number): number {
  return FLIGHT_COSTS[getFlightTier(distanceKm)]
}

// Travellers sharing a hotel room
const TRAVELLERS_PER_ROOM = 2

export function estimateRooms(groupSize: number): number {
  return Math.ceil(groupSize / TRAVELLERS_PER_ROOM)
}

export function calculateBudget(params: BudgetParams): BudgetBreakdown {
  const { destination, distanceKm, nights, groupSize } = params

  if (distanceKm < 0) throw new Error('distanceKm must be non-negative')
  if (nights < 0) throw new Error('nights must be non-negative')
  if (groupSize < 1) throw new Error('groupSize must be at least 1')

  const flightTier = getFlightTier(distanceKm)
  const flightCostPerPerson = destination.estimatedCosts.flightFromEurope
  const rooms = estimateRooms(groupSize)
  const hotelCostPerNight = destination.estimatedCosts.hotelPerNight * rooms
  const dailySpendingPerPerson = destination.estimatedCosts.dailySpending

  const totalFlightCost = flightCostPerPerson * groupSize
  const totalHotelCost = hotelCostPerNight * nights
  const totalDailySpending = dailySpendingPerPerson * groupSize * nights
  const totalCost = totalFlightCost + totalHotelCost + totalDailySpending
  const perPersonCost = totalCost / groupSize

  return {
    flightTier,
    flightCostPerPerson,
    rooms,
    hotelCostPerNight,
    dailySpendingPerPerson,
    nights,
    groupSize,
    totalFlightCost,
    totalHotelCost,
    totalDailySpending,
    totalCost,
    perPersonCost,
  }
}
