import type { Coordinates } from './types'
import { calculateDistance } from './distanceCalculator'

/** Taxi, climb and descent on every flight, in hours. */
export const FLIGHT_OVERHEAD_HOURS = 0.5
/** Typical airliner cruising speed over the ground, in km/h. */
export const CRUISE_SPEED_KMH = 800
/** Time added per stop on a connecting route: the layover, not just taxi/climb/descent. */
export const LAYOVER_HOURS = 2.5

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
 * Total distance of a trip's legs: origin → each hub in order → destination. Equal to the
 * great-circle distance for a direct trip (no hubs), and always at least as long as it for a
 * connecting one, since a detour through a hub is never shorter than flying straight there.
 */
export function totalLegDistanceKm(
  origin: Coordinates,
  destination: Coordinates,
  viaHubs: Coordinates[] = []
): number {
  const legs = [origin, ...viaHubs, destination]
  let total = 0
  for (let i = 0; i + 1 < legs.length; i++) total += calculateDistance(legs[i], legs[i + 1])
  return total
}

/**
 * Estimated flight time from origin to destination, optionally via one or more hubs (ROADMAP.md
 * feature 10). A direct trip (no hubs, the default) behaves exactly as before: the great-circle
 * distance's flight time. A connecting trip sums each leg's flight time and adds `LAYOVER_HOURS`
 * per stop.
 */
export function estimateFlightHours(
  origin: Coordinates,
  destination: Coordinates,
  viaHubs: Coordinates[] = []
): number {
  const legsHours = flightHoursForDistance(totalLegDistanceKm(origin, destination, viaHubs))
  return legsHours + viaHubs.length * LAYOVER_HOURS
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
