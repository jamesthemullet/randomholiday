import { describe, it, expect } from 'vitest'
import { encodeShareableResult } from '@/lib/shareableResult'
import type { ShareableResult } from '@/lib/shareableResult'

const FULL_RESULT: ShareableResult = {
  destinationId: 'barcelona-spain',
  originId: 'london-uk',
  maxBudgetPerPerson: 1500,
  maxDistanceKm: 2000,
  nights: 5,
  groupSize: 2,
  travelStyles: ['beach', 'city'],
  travelMonth: 6,
}

const MINIMAL_RESULT: ShareableResult = {
  destinationId: 'santorini-greece',
  originId: 'paris-france',
  maxBudgetPerPerson: 900,
  maxDistanceKm: 1000,
  nights: 3,
  groupSize: 1,
}

describe('encodeShareableResult', () => {
  it('encodes all fields into a query string', () => {
    const query = encodeShareableResult(FULL_RESULT)
    const params = new URLSearchParams(query)

    expect(params.get('destination')).toBe('barcelona-spain')
    expect(params.get('originId')).toBe('london-uk')
    expect(params.get('budget')).toBe('1500')
    expect(params.get('distance')).toBe('2000')
    expect(params.get('nights')).toBe('5')
    expect(params.get('groupSize')).toBe('2')
    expect(params.get('month')).toBe('6')
    expect(params.get('styles')).toBe('beach,city')
  })

  it('omits month and styles when not provided', () => {
    const query = encodeShareableResult(MINIMAL_RESULT)
    const params = new URLSearchParams(query)

    expect(params.has('month')).toBe(false)
    expect(params.has('styles')).toBe(false)
  })

  it('omits styles when an empty array is provided', () => {
    const query = encodeShareableResult({ ...MINIMAL_RESULT, travelStyles: [] })
    const params = new URLSearchParams(query)

    expect(params.has('styles')).toBe(false)
  })
})
