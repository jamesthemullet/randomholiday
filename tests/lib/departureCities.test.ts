import { describe, it, expect } from 'vitest'
import { departureCities, searchDepartureCities } from '@/lib/departureCities'

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

describe('searchDepartureCities', () => {
  it('returns all cities for an empty query', () => {
    expect(searchDepartureCities('')).toEqual(departureCities)
  })

  it('returns all cities for a whitespace-only query', () => {
    expect(searchDepartureCities('   ')).toEqual(departureCities)
  })

  it('matches by city name, case-insensitively', () => {
    const results = searchDepartureCities('lon')
    expect(results.some((c) => c.name === 'London')).toBe(true)
  })

  it('matches by country, case-insensitively', () => {
    const results = searchDepartureCities('FRANCE')
    expect(results.some((c) => c.name === 'Paris')).toBe(true)
  })

  it('returns an empty array when nothing matches', () => {
    expect(searchDepartureCities('zzzznotacity')).toEqual([])
  })
})
