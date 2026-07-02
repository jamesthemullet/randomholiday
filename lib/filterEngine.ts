import type { Coordinates, Destination, TravelStyle } from './destinations'
import { calculateDistance } from './distanceCalculator'
import { calculateBudget } from './budgetCalculator'

export interface FilterParams {
  /** User's departure location */
  origin: Coordinates
  /** Maximum total cost per person in USD (flights + hotel + daily spending) */
  maxBudgetPerPerson: number
  /** Maximum great-circle distance from origin in kilometres */
  maxDistanceKm: number
  /** Number of nights at the destination */
  nights: number
  /** Total number of travellers */
  groupSize: number
  /** If provided, only destinations matching at least one style are kept */
  travelStyles?: TravelStyle[]
}

export interface FilterResult {
  passed: Destination[]
  /** Destinations removed by the distance filter */
  removedByDistance: Destination[]
  /** Destinations removed by the budget filter (after distance filter) */
  removedByBudget: Destination[]
  /** Destinations removed by the travel-style filter (after distance + budget filters) */
  removedByStyle: Destination[]
}

function meetsDistanceFilter(destination: Destination, origin: Coordinates, maxDistanceKm: number): boolean {
  return calculateDistance(origin, destination.coordinates) <= maxDistanceKm
}

function meetsBudgetFilter(
  destination: Destination,
  origin: Coordinates,
  maxBudgetPerPerson: number,
  nights: number,
  groupSize: number
): boolean {
  const distanceKm = calculateDistance(origin, destination.coordinates)
  const { perPersonCost } = calculateBudget({ destination, distanceKm, nights, groupSize })
  return perPersonCost <= maxBudgetPerPerson
}

function meetsStyleFilter(destination: Destination, travelStyles: TravelStyle[]): boolean {
  return destination.travelStyles.some((s) => travelStyles.includes(s))
}

/**
 * Applies hard filters to a list of destinations and returns both the passing
 * set and the destinations removed at each stage (for diagnostics / UI hints).
 *
 * Filter order: distance → budget → travel style.
 */
export function filterDestinations(destinations: Destination[], params: FilterParams): FilterResult {
  const { origin, maxBudgetPerPerson, maxDistanceKm, nights, groupSize, travelStyles } = params

  if (maxDistanceKm < 0) throw new Error('maxDistanceKm must be non-negative')
  if (maxBudgetPerPerson < 0) throw new Error('maxBudgetPerPerson must be non-negative')
  if (nights < 0) throw new Error('nights must be non-negative')
  if (groupSize < 1) throw new Error('groupSize must be at least 1')

  const removedByDistance: Destination[] = []
  const removedByBudget: Destination[] = []
  const removedByStyle: Destination[] = []

  const afterDistance = destinations.filter((d) => {
    if (meetsDistanceFilter(d, origin, maxDistanceKm)) return true
    removedByDistance.push(d)
    return false
  })

  const afterBudget = afterDistance.filter((d) => {
    if (meetsBudgetFilter(d, origin, maxBudgetPerPerson, nights, groupSize)) return true
    removedByBudget.push(d)
    return false
  })

  const passed =
    travelStyles && travelStyles.length > 0
      ? afterBudget.filter((d) => {
          if (meetsStyleFilter(d, travelStyles)) return true
          removedByStyle.push(d)
          return false
        })
      : afterBudget

  return { passed, removedByDistance, removedByBudget, removedByStyle }
}

/**
 * Convenience wrapper that returns only the passing destinations.
 */
export function getFilteredDestinations(destinations: Destination[], params: FilterParams): Destination[] {
  return filterDestinations(destinations, params).passed
}
