import { describe, it, expect } from 'vitest'
import { getSeasonalWeatherEstimate } from '@/lib/seasonalWeather'

describe('getSeasonalWeatherEstimate', () => {
  it('returns a hot estimate for a hot desert climate in peak summer', () => {
    const estimate = getSeasonalWeatherEstimate('hot desert', 7, 25.2)
    expect(estimate.avgHighC).toBe(42)
    expect(estimate.description).toBe('hot')
  })

  it('returns a warm estimate for a mediterranean climate in summer', () => {
    const estimate = getSeasonalWeatherEstimate('mediterranean', 7, 41.38)
    expect(estimate.avgHighC).toBe(30)
    expect(estimate.description).toBe('warm')
  })

  it('returns a mild estimate for a temperate climate in spring', () => {
    const estimate = getSeasonalWeatherEstimate('temperate', 5, 48.85)
    expect(estimate.avgHighC).toBe(18)
    expect(estimate.description).toBe('mild')
  })

  it('returns a cool estimate for an oceanic climate in autumn', () => {
    const estimate = getSeasonalWeatherEstimate('oceanic', 10, 55.95)
    expect(estimate.avgHighC).toBe(13)
    expect(estimate.description).toBe('cool')
  })

  it('returns a cold estimate for a subarctic climate in winter', () => {
    const estimate = getSeasonalWeatherEstimate('subarctic', 1, 64.14)
    expect(estimate.avgHighC).toBe(-1)
    expect(estimate.description).toBe('cold')
  })

  it('is case-insensitive for the climate name', () => {
    const lower = getSeasonalWeatherEstimate('tropical', 1, 1.35)
    const mixed = getSeasonalWeatherEstimate('Tropical', 1, 1.35)
    expect(mixed).toEqual(lower)
  })

  it('falls back to the temperate profile for an unknown climate', () => {
    const unknown = getSeasonalWeatherEstimate('lunar', 7, 0)
    const temperate = getSeasonalWeatherEstimate('temperate', 7, 0)
    expect(unknown).toEqual(temperate)
  })

  it('shifts the month by 6 for Southern Hemisphere destinations', () => {
    // Cape Town (lat -33.9) in January (Southern summer) should read like a
    // Northern Hemisphere July for the same climate.
    const southernJan = getSeasonalWeatherEstimate('mediterranean', 1, -33.92)
    const northernJul = getSeasonalWeatherEstimate('mediterranean', 7, 41.38)
    expect(southernJan.avgHighC).toBe(northernJul.avgHighC)
  })

  it('wraps a month shifted past December back to the start of the year', () => {
    // Southern Hemisphere, month 8 shifts to 14, which should wrap to 2 (Feb)
    const estimate = getSeasonalWeatherEstimate('temperate', 8, -6.17)
    const february = getSeasonalWeatherEstimate('temperate', 2, 1)
    expect(estimate.avgHighC).toBe(february.avgHighC)
  })
})
