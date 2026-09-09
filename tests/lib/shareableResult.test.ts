import { describe, it, expect } from 'vitest'
import { encodeShareableResult, decodeShareableResult } from '@/lib/shareableResult'
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

describe('decodeShareableResult', () => {
  it('round-trips a fully populated result', () => {
    const query = encodeShareableResult(FULL_RESULT)
    expect(decodeShareableResult(query)).toEqual(FULL_RESULT)
  })

  it('round-trips a minimal result without month or styles', () => {
    const query = encodeShareableResult(MINIMAL_RESULT)
    expect(decodeShareableResult(query)).toEqual(MINIMAL_RESULT)
  })

  it('accepts a URLSearchParams instance directly', () => {
    const query = encodeShareableResult(FULL_RESULT)
    const params = new URLSearchParams(query)
    expect(decodeShareableResult(params)).toEqual(FULL_RESULT)
  })

  it('returns null when destination is missing', () => {
    const params = new URLSearchParams(encodeShareableResult(FULL_RESULT))
    params.delete('destination')
    expect(decodeShareableResult(params)).toBeNull()
  })

  it('returns null when originId is missing', () => {
    const params = new URLSearchParams(encodeShareableResult(FULL_RESULT))
    params.delete('originId')
    expect(decodeShareableResult(params)).toBeNull()
  })

  it('returns null when budget is missing or non-numeric', () => {
    const params = new URLSearchParams(encodeShareableResult(FULL_RESULT))
    params.set('budget', 'not-a-number')
    expect(decodeShareableResult(params)).toBeNull()
  })

  it('returns null when groupSize is zero', () => {
    const params = new URLSearchParams(encodeShareableResult(FULL_RESULT))
    params.set('groupSize', '0')
    expect(decodeShareableResult(params)).toBeNull()
  })

  it('returns null for an empty query string', () => {
    expect(decodeShareableResult('')).toBeNull()
  })

  it('handles multiple travel styles', () => {
    const result: ShareableResult = {
      ...MINIMAL_RESULT,
      travelStyles: ['adventure', 'beach', 'culture'],
    }
    const query = encodeShareableResult(result)
    expect(decodeShareableResult(query)?.travelStyles).toEqual(['adventure', 'beach', 'culture'])
  })
})
