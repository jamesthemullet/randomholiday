import { describe, it, expect } from 'vitest'
import {
  toRadians,
  calculateDistance,
  isWithinDistance,
  sortByDistance,
} from '@/lib/distanceCalculator'
import type { Coordinates } from '@/lib/destinations'

// Well-known coordinate pairs for ground-truth checks
const LONDON: Coordinates = { lat: 51.5074, lng: -0.1278 }
const PARIS: Coordinates = { lat: 48.8566, lng: 2.3522 }
const NEW_YORK: Coordinates = { lat: 40.7128, lng: -74.006 }
const SYDNEY: Coordinates = { lat: -33.8688, lng: 151.2093 }
const SAME_POINT: Coordinates = { lat: 35.0, lng: 139.0 }

describe('toRadians', () => {
  it('converts 0 degrees to 0 radians', () => {
    expect(toRadians(0)).toBe(0)
  })

  it('converts 180 degrees to π radians', () => {
    expect(toRadians(180)).toBeCloseTo(Math.PI, 10)
  })

  it('converts 90 degrees to π/2 radians', () => {
    expect(toRadians(90)).toBeCloseTo(Math.PI / 2, 10)
  })

  it('converts -90 degrees to -π/2 radians', () => {
    expect(toRadians(-90)).toBeCloseTo(-Math.PI / 2, 10)
  })

  it('converts 360 degrees to 2π radians', () => {
    expect(toRadians(360)).toBeCloseTo(2 * Math.PI, 10)
  })
})

describe('calculateDistance', () => {
  it('returns 0 for identical coordinates', () => {
    expect(calculateDistance(SAME_POINT, SAME_POINT)).toBe(0)
  })

  it('returns 0 for equal lat/lng values in different objects', () => {
    expect(calculateDistance(LONDON, { lat: 51.5074, lng: -0.1278 })).toBeCloseTo(0, 5)
  })

  it('calculates London to Paris (~341 km)', () => {
    const distance = calculateDistance(LONDON, PARIS)
    expect(distance).toBeCloseTo(341, -1) // within ±10 km
  })

  it('calculates London to New York (~5570 km)', () => {
    const distance = calculateDistance(LONDON, NEW_YORK)
    expect(distance).toBeCloseTo(5570, -2) // within ±100 km
  })

  it('calculates London to Sydney (~16993 km)', () => {
    const distance = calculateDistance(LONDON, SYDNEY)
    expect(distance).toBeCloseTo(16993, -2)
  })

  it('is symmetric — distance A→B equals B→A', () => {
    const ab = calculateDistance(LONDON, PARIS)
    const ba = calculateDistance(PARIS, LONDON)
    expect(ab).toBeCloseTo(ba, 10)
  })

  it('returns a positive number for distinct points', () => {
    expect(calculateDistance(LONDON, NEW_YORK)).toBeGreaterThan(0)
  })

  it('handles antipodal points (approximately half Earth circumference ~20015 km)', () => {
    const north: Coordinates = { lat: 0, lng: 0 }
    const antipode: Coordinates = { lat: 0, lng: 180 }
    const distance = calculateDistance(north, antipode)
    expect(distance).toBeCloseTo(20015, -2)
  })

  it('handles negative coordinates (southern hemisphere)', () => {
    const capeTown: Coordinates = { lat: -33.9249, lng: 18.4241 }
    const buenosAires: Coordinates = { lat: -34.6037, lng: -58.3816 }
    const distance = calculateDistance(capeTown, buenosAires)
    expect(distance).toBeGreaterThan(6000)
    expect(distance).toBeLessThan(8000)
  })
})

describe('isWithinDistance', () => {
  it('returns true when destination is closer than maxDistanceKm', () => {
    // London to Paris is ~341 km
    expect(isWithinDistance(LONDON, PARIS, 400)).toBe(true)
  })

  it('returns false when destination is farther than maxDistanceKm', () => {
    expect(isWithinDistance(LONDON, PARIS, 300)).toBe(false)
  })

  it('returns true when destination is exactly at maxDistanceKm (boundary inclusive)', () => {
    const distance = calculateDistance(LONDON, PARIS)
    expect(isWithinDistance(LONDON, PARIS, distance)).toBe(true)
  })

  it('returns true for same point with any positive maxDistanceKm', () => {
    expect(isWithinDistance(LONDON, LONDON, 1)).toBe(true)
  })

  it('returns true for same point with maxDistanceKm of 0', () => {
    expect(isWithinDistance(LONDON, LONDON, 0)).toBe(true)
  })

  it('returns false for New York from London with max 1000 km', () => {
    expect(isWithinDistance(LONDON, NEW_YORK, 1000)).toBe(false)
  })
})

describe('sortByDistance', () => {
  const cities: { name: string; coords: Coordinates }[] = [
    { name: 'Sydney', coords: SYDNEY },
    { name: 'Paris', coords: PARIS },
    { name: 'New York', coords: NEW_YORK },
  ]

  it('sorts items nearest-first from origin', () => {
    const sorted = sortByDistance(LONDON, cities, (c) => c.coords)
    expect(sorted[0].name).toBe('Paris')
    expect(sorted[1].name).toBe('New York')
    expect(sorted[2].name).toBe('Sydney')
  })

  it('returns an empty array when given an empty array', () => {
    expect(sortByDistance(LONDON, [], (c: { coords: Coordinates }) => c.coords)).toEqual([])
  })

  it('returns a single-item array unchanged', () => {
    const result = sortByDistance(LONDON, [cities[0]], (c) => c.coords)
    expect(result).toHaveLength(1)
    expect(result[0].name).toBe('Sydney')
  })

  it('does not mutate the original array', () => {
    const original = [...cities]
    sortByDistance(LONDON, cities, (c) => c.coords)
    expect(cities.map((c) => c.name)).toEqual(original.map((c) => c.name))
  })

  it('handles two equally-distant items without throwing', () => {
    const mirror1: Coordinates = { lat: 0, lng: 10 }
    const mirror2: Coordinates = { lat: 0, lng: -10 }
    const origin: Coordinates = { lat: 0, lng: 0 }
    const items = [
      { name: 'A', coords: mirror1 },
      { name: 'B', coords: mirror2 },
    ]
    const result = sortByDistance(origin, items, (c) => c.coords)
    expect(result).toHaveLength(2)
  })
})
