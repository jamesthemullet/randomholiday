import { describe, it, expect } from 'vitest'
import { getDestinationImagePath } from '@/lib/destinationImage'

describe('getDestinationImagePath', () => {
  it('builds a local path from the destination id', () => {
    expect(getDestinationImagePath('bali-indonesia')).toBe('/destinations/bali-indonesia.jpg')
  })
})
