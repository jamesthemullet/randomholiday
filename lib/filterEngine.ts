import type { Coordinates, Destination, TravelStyle } from './types'
import { calculateDistance } from './distanceCalculator'
import { estimateFlightHours } from './flightTime'
import { calculateBudget } from './budgetCalculator'
import { getSafetyStatus } from './travelAdvisory'

/**
 * Destinations closer than this to the origin are excluded as too-local to be a "holiday" and,
 * for origins that are themselves a pickable destination, to stop a city recommending itself
 * (see ROADMAP.md feature 5).
 */
export const MIN_DISTANCE_KM = 100

export interface FilterParams {
  /** User's departure location */
  origin: Coordinates
  /** Maximum total cost per person in GBP (flights + hotel + daily spending) */
  maxBudgetPerPerson: number
  /** Maximum estimated flight time from origin, in hours */
  maxFlightHours: number
  /** Number of nights at the destination */
  nights: number
  /** Total number of travellers */
  groupSize: number
  /** If provided, only destinations matching at least one style are kept */
  travelStyles?: TravelStyle[]
}

export interface FilterResult {
  passed: Destination[]
  /** Destinations removed by the flight-time filter (too far, or too close to be a holiday) */
  removedByFlightTime: Destination[]
  /** Destinations removed by the FCDO travel advisory filter (after flight-time filter) */
  removedByAdvisory: Destination[]
  /** Destinations removed by the budget filter (after flight-time + advisory filters) */
  removedByBudget: Destination[]
  /** Destinations removed by the travel-style filter (after flight-time + advisory + budget filters) */
  removedByStyle: Destination[]
}

function meetsFlightTimeFilter(
  destination: Destination,
  origin: Coordinates,
  maxFlightHours: number
): boolean {
  const distanceKm = calculateDistance(origin, destination.coordinates)
  return (
    distanceKm >= MIN_DISTANCE_KM &&
    estimateFlightHours(origin, destination.coordinates) <= maxFlightHours
  )
}

/** Destinations the FCDO advises against all/essential travel to are never picked. */
function meetsAdvisoryFilter(destination: Destination): boolean {
  return getSafetyStatus(destination.id) !== 'exclude'
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
 * Filter order: flight time → travel advisory → budget → travel style.
 */
export function filterDestinations(
  destinations: Destination[],
  params: FilterParams
): FilterResult {
  const { origin, maxBudgetPerPerson, maxFlightHours, nights, groupSize, travelStyles } = params

  if (maxFlightHours < 0) throw new Error('maxFlightHours must be non-negative')
  if (maxBudgetPerPerson < 0) throw new Error('maxBudgetPerPerson must be non-negative')
  if (nights < 0) throw new Error('nights must be non-negative')
  if (groupSize < 1) throw new Error('groupSize must be at least 1')

  const removedByFlightTime: Destination[] = []
  const removedByAdvisory: Destination[] = []
  const removedByBudget: Destination[] = []
  const removedByStyle: Destination[] = []

  const afterFlightTime = destinations.filter((d) => {
    if (meetsFlightTimeFilter(d, origin, maxFlightHours)) return true
    removedByFlightTime.push(d)
    return false
  })

  const afterAdvisory = afterFlightTime.filter((d) => {
    if (meetsAdvisoryFilter(d)) return true
    removedByAdvisory.push(d)
    return false
  })

  const afterBudget = afterAdvisory.filter((d) => {
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

  return { passed, removedByFlightTime, removedByAdvisory, removedByBudget, removedByStyle }
}
