import { describe, it, expect } from 'vitest'
import {
  ANYWHERE_FLIGHT_HOURS,
  LAYOVER_HOURS,
  estimateFlightHours,
  flightHoursForDistance,
  formatFlightTime,
  formatFlightTimeLimit,
  nearestFlightTimeOption,
  totalLegDistanceKm,
} from '@/lib/flightTime'
import { calculateDistance } from '@/lib/distanceCalculator'

const LONDON = { lat: 51.5074, lng: -0.1278 }
const DOHA = { lat: 25.2731, lng: 51.608 }
const BALI = { lat: -8.7467, lng: 115.1667 }

describe('flightHoursForDistance', () => {
  it('adds half an hour of overhead to the time at 800 km/h', () => {
    expect(flightHoursForDistance(0)).toBe(0.5)
    expect(flightHoursForDistance(800)).toBe(1.5)
    expect(flightHoursForDistance(8000)).toBe(10.5)
  })
})

describe('estimateFlightHours', () => {
  it('lands close to scheduled times for direct flights from London', () => {
    // Scheduled LHR times: Barcelona ~2h05, New York ~8h, Bangkok ~11h45.
    const barcelona = estimateFlightHours(LONDON, { lat: 41.3874, lng: 2.1686 })
    const newYork = estimateFlightHours(LONDON, { lat: 40.7128, lng: -74.006 })
    const bangkok = estimateFlightHours(LONDON, { lat: 13.7563, lng: 100.5018 })
    expect(Math.abs(barcelona - 2.1)).toBeLessThan(0.5)
    expect(Math.abs(newYork - 8)).toBeLessThan(1)
    expect(Math.abs(bangkok - 11.75)).toBeLessThan(1)
  })

  it('matches the no-via result when viaHubs is omitted or empty (no behaviour change)', () => {
    const withoutArg = estimateFlightHours(LONDON, BALI)
    const withEmptyArray = estimateFlightHours(LONDON, BALI, [])
    expect(withEmptyArray).toBe(withoutArg)
  })

  it('sums each leg and adds LAYOVER_HOURS per stop for a one-stop route', () => {
    const direct = estimateFlightHours(LONDON, BALI)
    const viaDoha = estimateFlightHours(LONDON, BALI, [DOHA])

    const expectedLegsHours = flightHoursForDistance(
      calculateDistance(LONDON, DOHA) + calculateDistance(DOHA, BALI)
    )
    expect(viaDoha).toBe(expectedLegsHours + LAYOVER_HOURS)
    // A detour through a hub is never a shorter flight than going direct.
    expect(viaDoha).toBeGreaterThan(direct)
  })

  it('adds LAYOVER_HOURS once per stop across multiple hubs', () => {
    const oneStop = estimateFlightHours(LONDON, BALI, [DOHA])
    const twoStop = estimateFlightHours(LONDON, BALI, [DOHA, { lat: 1.3644, lng: 103.9915 }])
    expect(twoStop).toBeGreaterThan(oneStop + LAYOVER_HOURS)
  })
})

describe('totalLegDistanceKm', () => {
  it('equals the great-circle distance for a direct route (no hubs)', () => {
    expect(totalLegDistanceKm(LONDON, BALI)).toBe(calculateDistance(LONDON, BALI))
    expect(totalLegDistanceKm(LONDON, BALI, [])).toBe(calculateDistance(LONDON, BALI))
  })

  it('sums each leg for a route via one or more hubs', () => {
    const viaDoha = totalLegDistanceKm(LONDON, BALI, [DOHA])
    expect(viaDoha).toBe(calculateDistance(LONDON, DOHA) + calculateDistance(DOHA, BALI))
    // The detour is never shorter than the direct great-circle distance.
    expect(viaDoha).toBeGreaterThan(calculateDistance(LONDON, BALI))
  })
})

describe('formatFlightTime', () => {
  it('rounds to the nearest 5 minutes', () => {
    expect(formatFlightTime(2 + 8 / 60)).toBe('~2h 10m')
    expect(formatFlightTime(7.5)).toBe('~7h 30m')
  })

  it('drops the minutes on a whole hour and the hours under an hour', () => {
    expect(formatFlightTime(3)).toBe('~3h')
    expect(formatFlightTime(0.75)).toBe('~45m')
  })

  it('never shows zero', () => {
    expect(formatFlightTime(0)).toBe('~5m')
  })
})

describe('formatFlightTimeLimit', () => {
  it('labels a limit in hours, and the longest as Anywhere', () => {
    expect(formatFlightTimeLimit(5)).toBe('Up to 5h')
    expect(formatFlightTimeLimit(ANYWHERE_FLIGHT_HOURS)).toBe('Anywhere')
  })
})

describe('nearestFlightTimeOption', () => {
  it('returns the shortest option at least as long as the limit', () => {
    expect(nearestFlightTimeOption(5)).toBe(5)
    expect(nearestFlightTimeOption(5.1)).toBe(6)
    expect(nearestFlightTimeOption(8.5)).toBe(10)
    expect(nearestFlightTimeOption(1)).toBe(3)
  })

  it('treats anything past the longest option as Anywhere', () => {
    expect(nearestFlightTimeOption(40)).toBe(ANYWHERE_FLIGHT_HOURS)
  })
})
