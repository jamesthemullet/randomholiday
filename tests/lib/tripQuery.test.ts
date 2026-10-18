import { describe, it, expect } from 'vitest'
import {
  buildResultsQuery,
  getMonthOptions,
  getNextMonth,
  parseTripQuery,
  type TripQuery,
} from '@/lib/tripQuery'
import type { DepartureCity } from '@/lib/departureCities'

const london: DepartureCity = {
  id: 'london-uk',
  name: 'London',
  country: 'United Kingdom',
  coordinates: { lat: 51.5072, lng: -0.1276 },
}

const trip: TripQuery = {
  city: london,
  budget: 1500,
  month: 6,
  nights: 7,
  travelStyles: ['beach', 'city'],
  maxDistance: 10000,
  groupSize: 2,
}

describe('getMonthOptions', () => {
  it('returns all twelve months with 1-indexed values', () => {
    const options = getMonthOptions()
    expect(options).toHaveLength(12)
    expect(options[0]).toEqual({ value: '1', label: 'January' })
    expect(options[11]).toEqual({ value: '12', label: 'December' })
  })
})

describe('getNextMonth', () => {
  it('returns the following month', () => {
    expect(getNextMonth(new Date(2026, 9, 17))).toBe(11)
  })

  it('wraps December round to January', () => {
    expect(getNextMonth(new Date(2026, 11, 5))).toBe(1)
  })
})

describe('buildResultsQuery', () => {
  it('includes styles when travel styles are selected', () => {
    const params = new URLSearchParams(buildResultsQuery(trip))
    expect(params.get('originId')).toBe('london-uk')
    expect(params.get('budget')).toBe('1500')
    expect(params.get('distance')).toBe('10000')
    expect(params.get('nights')).toBe('7')
    expect(params.get('groupSize')).toBe('2')
    expect(params.get('month')).toBe('6')
    expect(params.get('styles')).toBe('beach,city')
  })

  it('omits styles when no travel styles are selected', () => {
    const params = new URLSearchParams(buildResultsQuery({ ...trip, travelStyles: [] }))
    expect(params.has('styles')).toBe(false)
  })
})

describe('parseTripQuery', () => {
  it('round-trips a query built by buildResultsQuery', () => {
    const values = parseTripQuery(new URLSearchParams(buildResultsQuery(trip)))
    expect(values).toEqual({ ...trip, city: expect.objectContaining({ id: 'london-uk' }) })
  })

  it('returns no values for an empty query', () => {
    expect(parseTripQuery(new URLSearchParams())).toEqual({})
  })

  it('drops unknown cities, non-numeric, non-positive and out-of-range values', () => {
    const values = parseTripQuery(
      new URLSearchParams({
        originId: 'atlantis',
        budget: 'lots',
        month: '13',
        nights: '0',
        distance: '-5',
        groupSize: 'NaN',
      })
    )
    expect(values).toEqual({})
  })

  it('drops a known city that has no route data yet', () => {
    expect(parseTripQuery(new URLSearchParams({ originId: 'paris-france' })).city).toBeUndefined()
  })

  it('rejects a fractional month', () => {
    expect(parseTripQuery(new URLSearchParams({ month: '6.5' })).month).toBeUndefined()
  })

  it('keeps only valid travel styles', () => {
    const values = parseTripQuery(new URLSearchParams({ styles: 'beach,space,culture' }))
    expect(values.travelStyles).toEqual(['beach', 'culture'])
  })

  it('omits travel styles when none are valid', () => {
    const values = parseTripQuery(new URLSearchParams({ styles: 'space' }))
    expect(values.travelStyles).toBeUndefined()
  })
})
