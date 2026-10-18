import { describe, it, expect } from 'vitest'
import { getDestinationImagePath, getPosterTheme, POSTER_THEMES } from '@/lib/destinationImage'

describe('getDestinationImagePath', () => {
  it('builds a local path from the destination id', () => {
    expect(getDestinationImagePath('bali-indonesia')).toBe('/destinations/bali-indonesia.jpg')
  })
})

describe('getPosterTheme', () => {
  it('returns the same theme for the same destination', () => {
    expect(getPosterTheme('bali-indonesia')).toBe(getPosterTheme('bali-indonesia'))
  })

  it('returns one of the poster themes', () => {
    expect(POSTER_THEMES).toContain(getPosterTheme('kyoto-japan'))
  })
})
