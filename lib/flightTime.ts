import type { Coordinates } from './destinations'
import { calculateDistance } from './distanceCalculator'

/** Taxi, climb and descent on every flight, in hours. */
export const FLIGHT_OVERHEAD_HOURS = 0.5
/** Typical airliner cruising speed over the ground, in km/h. */
export const CRUISE_SPEED_KMH = 800

/** The "Anywhere" limit: longer than any flight on Earth (the antipodes are ~25.5h away). */
export const ANYWHERE_FLIGHT_HOURS = 30
/** The limits offered in the search form, shortest first. */
export const FLIGHT_TIME_OPTIONS = [3, 4, 5, 6, 7, 8, 10, 12, ANYWHERE_FLIGHT_HOURS] as const
export const DEFAULT_MAX_FLIGHT_HOURS = 12

/** Estimated time in the air for a direct flight covering `distanceKm` of great-circle distance. */
export function flightHoursForDistance(distanceKm: number): number {
  return FLIGHT_OVERHEAD_HOURS + distanceKm / CRUISE_SPEED_KMH
}

/**
 * Estimated flight time from origin to destination. Every route is direct for now; when
 * connecting routes exist this becomes the sum of each leg plus a layover per stop, and callers
 * don't change.
 */
export function estimateFlightHours(origin: Coordinates, destination: Coordinates): number {
  return flightHoursForDistance(calculateDistance(origin, destination))
}

/** "~2h 10m", rounded to the nearest 5 minutes. */
export function formatFlightTime(hours: number): string {
  const totalMinutes = Math.max(5, Math.round((hours * 60) / 5) * 5)
  const h = Math.floor(totalMinutes / 60)
  const m = totalMinutes % 60
  if (h === 0) return `~${m}m`
  return m === 0 ? `~${h}h` : `~${h}h ${m}m`
}

/** The form's label for a flight-time limit. */
export function formatFlightTimeLimit(hours: number): string {
  return hours >= ANYWHERE_FLIGHT_HOURS ? 'Anywhere' : `Up to ${hours}h`
}

/** The form option a limit falls under: the shortest option at least as long as `hours`. */
export function nearestFlightTimeOption(hours: number): number {
  return FLIGHT_TIME_OPTIONS.find((option) => option >= hours) ?? ANYWHERE_FLIGHT_HOURS
}
