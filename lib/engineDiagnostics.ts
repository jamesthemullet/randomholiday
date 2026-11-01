import type { Destination } from './destinations'
import type { DepartureCity } from './departureCities'
import { getRecommendations } from './recommendationEngine'
import type { RecommendationParams } from './recommendationEngine'

export interface OriginDiagnostics {
  originId: string
  /** Destination ids this origin can draw from. */
  poolIds: string[]
  /** True when the origin's own destination entry appears in its own pool. */
  selfMatch: boolean
  /** Distinct destination ids seen across `shuffleCount` independent "spin again" draws. */
  distinctShuffleIds: string[]
}

export interface EngineDiagnosticsSummary {
  perOrigin: OriginDiagnostics[]
  /** Fraction of `destinations` that appear in at least one origin's pool. */
  poolCoverage: number
  /** Number of origins whose own destination appears in their own pool. */
  selfMatchCount: number
}

export interface EngineDiagnosticsOptions extends Omit<
  RecommendationParams,
  'origin' | 'count' | 'poolSize'
> {
  /** How many independent shuffles to sample per origin. Defaults to 20. */
  shuffleCount?: number
  /** Limits each origin to this many top-scored destinations. Defaults to all of them. */
  poolSize?: number
}

/**
 * Runs `getRecommendations` for every given origin against a shared set of destinations and
 * records the diagnostics the roadmap's recommendation-quality work tracks: how much of the
 * catalogue ever surfaces (pool coverage), how often a city recommends itself, and how varied
 * repeated shuffles are. A baseline test pins today's numbers so later scoring/filtering changes
 * can tighten them deliberately instead of drifting unnoticed.
 */
export function runEngineDiagnostics(
  destinations: Destination[],
  origins: DepartureCity[],
  options: EngineDiagnosticsOptions
): EngineDiagnosticsSummary {
  const { shuffleCount = 20, poolSize, random = Math.random, ...rest } = options

  const coveredIds = new Set<string>()
  let selfMatchCount = 0

  const perOrigin = origins.map((origin) => {
    const baseParams: RecommendationParams = { ...rest, origin: origin.coordinates, poolSize }

    // Asking for every destination returns the whole pool (shuffled order) in one call.
    const { recommendations: fullPool } = getRecommendations(destinations, {
      ...baseParams,
      count: Math.max(destinations.length, 1),
      random,
    })
    const poolIds = fullPool.map((entry) => entry.destination.id)
    poolIds.forEach((id) => coveredIds.add(id))

    const selfMatch = poolIds.includes(origin.id)
    if (selfMatch) selfMatchCount += 1

    const distinctShuffleIds = new Set<string>()
    for (let i = 0; i < shuffleCount; i++) {
      const { recommendations } = getRecommendations(destinations, {
        ...baseParams,
        count: 1,
        random,
      })
      const picked = recommendations[0]
      if (picked) distinctShuffleIds.add(picked.destination.id)
    }

    return {
      originId: origin.id,
      poolIds,
      selfMatch,
      distinctShuffleIds: [...distinctShuffleIds],
    }
  })

  const poolCoverage = destinations.length === 0 ? 0 : coveredIds.size / destinations.length

  return { perOrigin, poolCoverage, selfMatchCount }
}
