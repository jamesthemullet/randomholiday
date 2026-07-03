import type { Destination } from './destinations'
import { filterDestinations } from './filterEngine'
import type { FilterParams, FilterResult } from './filterEngine'
import { scoreDestinations } from './scoringEngine'
import type { DestinationScore, ScoreParams } from './scoringEngine'

export interface RecommendationParams
  extends FilterParams, Pick<ScoreParams, 'travelMonth' | 'weights'> {
  /** Number of recommendations to return. Defaults to 3. */
  count?: number
  /** How many of the top-scored candidates to randomly sample from. Defaults to 10. */
  poolSize?: number
  /** Random number source returning values in [0, 1). Injectable for deterministic tests; defaults to Math.random. */
  random?: () => number
}

export interface RecommendationResult {
  /** Randomly sampled, score-ranked destinations to present to the user */
  recommendations: DestinationScore[]
  /** Underlying filter diagnostics (what was removed and why) */
  filterResult: FilterResult
}

function shuffle<T>(items: T[], random: () => number): T[] {
  const shuffled = [...items]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

/**
 * Produces randomised holiday recommendations by filtering out destinations
 * that fail hard constraints (budget, distance, style), scoring the rest,
 * then randomly sampling from the top-scored pool. Sampling from a pool
 * (rather than always returning the single best match) keeps results
 * varied across repeated calls, e.g. for a "Shuffle" button, while still
 * only ever surfacing well-matched destinations.
 */
export function getRecommendations(
  destinations: Destination[],
  params: RecommendationParams
): RecommendationResult {
  const {
    count = 3,
    poolSize = 10,
    random = Math.random,
    travelMonth,
    weights,
    ...filterParams
  } = params

  if (count < 1) throw new Error('count must be at least 1')
  if (poolSize < 1) throw new Error('poolSize must be at least 1')

  const filterResult = filterDestinations(destinations, filterParams)
  const scored = scoreDestinations(filterResult.passed, { ...filterParams, travelMonth, weights })
  const pool = scored.slice(0, poolSize)
  const recommendations = shuffle(pool, random).slice(0, count)

  return { recommendations, filterResult }
}
