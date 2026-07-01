import type { Coordinates } from './destinations'

const EARTH_RADIUS_KM = 6371

/**
 * Converts degrees to radians.
 */
export function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180
}

/**
 * Calculates the great-circle distance between two coordinates using the
 * Haversine formula. Returns distance in kilometres.
 */
export function calculateDistance(from: Coordinates, to: Coordinates): number {
  const dLat = toRadians(to.lat - from.lat)
  const dLng = toRadians(to.lng - from.lng)

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(from.lat)) *
      Math.cos(toRadians(to.lat)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return EARTH_RADIUS_KM * c
}

/**
 * Returns true if the destination is within maxDistanceKm of the origin.
 */
export function isWithinDistance(
  origin: Coordinates,
  destination: Coordinates,
  maxDistanceKm: number
): boolean {
  return calculateDistance(origin, destination) <= maxDistanceKm
}

/**
 * Sorts an array of items by their distance from the origin (nearest first).
 * The caller provides a function to extract coordinates from each item.
 */
export function sortByDistance<T>(
  origin: Coordinates,
  items: T[],
  getCoords: (item: T) => Coordinates
): T[] {
  return [...items].sort(
    (a, b) => calculateDistance(origin, getCoords(a)) - calculateDistance(origin, getCoords(b))
  )
}
