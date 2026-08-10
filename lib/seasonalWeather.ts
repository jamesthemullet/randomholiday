export interface SeasonalWeatherEstimate {
  /** Typical daytime high in Celsius for the given climate and month */
  avgHighC: number
  /** One-word summary of the estimate, e.g. "warm" */
  description: string
}

// Approximate average daytime highs (°C) by calendar month, Jan–Dec, for a
// destination in the Northern Hemisphere. Southern Hemisphere destinations
// have their month shifted by 6 before lookup.
const CLIMATE_MONTHLY_HIGHS_C: Record<string, number[]> = {
  'cold desert': [2, 5, 11, 17, 23, 29, 33, 32, 26, 18, 10, 3],
  continental: [1, 3, 8, 14, 19, 22, 24, 24, 19, 13, 7, 3],
  'hot desert': [24, 26, 30, 35, 40, 42, 42, 41, 38, 33, 28, 24],
  'humid continental': [-2, 0, 5, 12, 18, 23, 26, 25, 20, 13, 6, 0],
  'humid subtropical': [10, 11, 14, 19, 24, 27, 30, 31, 27, 22, 16, 11],
  mediterranean: [14, 15, 17, 19, 23, 27, 30, 30, 27, 22, 18, 15],
  oceanic: [7, 7, 9, 12, 15, 18, 20, 20, 17, 13, 9, 7],
  'semi-arid': [18, 20, 23, 26, 29, 32, 34, 34, 31, 27, 22, 19],
  subarctic: [-1, 0, 2, 6, 11, 14, 15, 14, 10, 6, 2, -1],
  subtropical: [12, 13, 16, 20, 24, 28, 31, 31, 28, 23, 18, 13],
  'subtropical highland': [20, 20, 20, 19, 18, 17, 17, 18, 19, 20, 20, 20],
  temperate: [7, 8, 11, 14, 18, 20, 22, 22, 19, 15, 10, 7],
  tropical: [30, 30, 31, 31, 31, 30, 29, 29, 29, 30, 30, 30],
}

const DEFAULT_CLIMATE = 'temperate'

function wrapMonth(month: number): number {
  return ((((month - 1) % 12) + 12) % 12) + 1
}

function describeTemp(avgHighC: number): string {
  if (avgHighC >= 32) return 'hot'
  if (avgHighC >= 24) return 'warm'
  if (avgHighC >= 16) return 'mild'
  if (avgHighC >= 8) return 'cool'
  return 'cold'
}

/**
 * Static, no-network estimate of typical weather for a destination in a
 * given travel month, used when a live weather provider is unavailable.
 */
export function getSeasonalWeatherEstimate(
  climate: string,
  month: number,
  lat: number
): SeasonalWeatherEstimate {
  const profile =
    CLIMATE_MONTHLY_HIGHS_C[climate.toLowerCase()] ?? CLIMATE_MONTHLY_HIGHS_C[DEFAULT_CLIMATE]
  const effectiveMonth = lat < 0 ? wrapMonth(month + 6) : wrapMonth(month)
  const avgHighC = profile[effectiveMonth - 1]

  return { avgHighC, description: describeTemp(avgHighC) }
}
