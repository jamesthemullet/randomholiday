import type { Destination } from './destinations'
import type { DepartureCity } from './departureCities'
import { getRecommendations } from './recommendationEngine'
import type { RecommendationParams } from './recommendationEngine'

export interface OriginDiagnostics {
  originId: string
  /** Destination ids in the top-scored pool considered for this origin (pre-shuffle). */
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

export interface EngineDiagnosticsOptions
  extends Omit<RecommendationParams, 'origin' | 'count' | 'poolSize'> {
  /** How many independent shuffles to sample per origin. Defaults to 20. */
  shuffleCount?: number
  /** Size of the top-scored pool each origin draws from. Defaults to 10. */
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
  const { shuffleCount = 20, poolSize = 10, random = Math.random, ...rest } = options

  const coveredIds = new Set<string>()
  let selfMatchCount = 0

  const perOrigin = origins.map((origin) => {
    const baseParams: RecommendationParams = { ...rest, origin: origin.coordinates, poolSize }

    // count === poolSize returns every pool member (shuffled order, same membership) in one call.
    const { recommendations: fullPool } = getRecommendations(destinations, {
      ...baseParams,
      count: poolSize,
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
