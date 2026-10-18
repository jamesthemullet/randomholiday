import { describe, it, expect } from 'vitest'
import {
  departureCities,
  searchDepartureCities,
  supportedDepartureCities,
} from '@/lib/departureCities'

describe('departureCities database', () => {
  it('has a set of major departure cities', () => {
    expect(departureCities.length).toBeGreaterThanOrEqual(30)
  })

  it('every city has a unique id, name, country and coordinates', () => {
    const ids = new Set(departureCities.map((c) => c.id))
    expect(ids.size).toBe(departureCities.length)

    for (const city of departureCities) {
      expect(city.name).toBeTruthy()
      expect(city.country).toBeTruthy()
      expect(city.coordinates.lat).toBeGreaterThanOrEqual(-90)
      expect(city.coordinates.lat).toBeLessThanOrEqual(90)
      expect(city.coordinates.lng).toBeGreaterThanOrEqual(-180)
      expect(city.coordinates.lng).toBeLessThanOrEqual(180)
    }
  })
})

describe('supportedDepartureCities', () => {
  it('is just London until other cities have route data', () => {
    expect(supportedDepartureCities.map((c) => c.id)).toEqual(['london-uk'])
  })
})

describe('searchDepartureCities', () => {
  it('searches only supported cities by default', () => {
    expect(searchDepartureCities('')).toEqual(supportedDepartureCities)
    expect(searchDepartureCities('Paris')).toEqual([])
  })

  it('returns all cities for an empty query', () => {
    expect(searchDepartureCities('', departureCities)).toEqual(departureCities)
  })

  it('returns all cities for a whitespace-only query', () => {
    expect(searchDepartureCities('   ', departureCities)).toEqual(departureCities)
  })

  it('matches by city name, case-insensitively', () => {
    const results = searchDepartureCities('lon', departureCities)
    expect(results.some((c) => c.name === 'London')).toBe(true)
  })

  it('matches by country, case-insensitively', () => {
    const results = searchDepartureCities('FRANCE', departureCities)
    expect(results.some((c) => c.name === 'Paris')).toBe(true)
  })

  it('returns an empty array when nothing matches', () => {
    expect(searchDepartureCities('zzzznotacity', departureCities)).toEqual([])
  })
})
