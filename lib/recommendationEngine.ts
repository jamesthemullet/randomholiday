import type { Destination } from './destinations'
import { filterDestinations } from './filterEngine'
import type { FilterParams, FilterResult } from './filterEngine'
import { scoreDestinations } from './scoringEngine'
import type { DestinationScore, ScoreParams } from './scoringEngine'

export interface RecommendationParams
  extends FilterParams, Pick<ScoreParams, 'travelMonth' | 'weights'> {
  /** Number of recommendations to return. Defaults to 1. */
  count?: number
  /** Limits sampling to this many top-scored candidates. Defaults to every passing destination. */
  poolSize?: number
  /** Random number source returning values in [0, 1). Injectable for deterministic tests; defaults to Math.random. */
  random?: () => number
  /** Destination IDs to leave out of consideration entirely, e.g. recently shown results. */
  excludeDestinationIds?: string[]
}

export interface RecommendationResult {
  /** Randomly sampled, score-ranked destinations to present to the user */
  recommendations: DestinationScore[]
  /** Underlying filter diagnostics (what was removed and why) */
  filterResult: FilterResult
}

/**
 * How strongly score drives the draw: a destination's chance is proportional to
 * (score / 100) ^ this. Higher favours better matches; 0 would ignore score entirely.
 */
export const SCORE_SAMPLING_POWER = 3

/**
 * Weighted random order without replacement (Efraimidis–Spirakis): each item draws
 * `u ^ (1 / weight)` and the highest draws come first.
 */
function weightedShuffle(scored: DestinationScore[], random: () => number): DestinationScore[] {
  return scored
    .map((entry) => {
      const weight = (entry.totalScore / 100) ** SCORE_SAMPLING_POWER
      return { entry, key: random() ** (1 / weight) }
    })
    .sort((a, b) => b.key - a.key)
    .map(({ entry }) => entry)
}

/**
 * Produces randomised holiday recommendations by filtering out destinations
 * that fail hard constraints (budget, distance, style), scoring the rest,
 * then drawing at random with better scores more likely. Every destination
 * that passes the filters can be drawn, which keeps results varied across
 * repeated calls, e.g. for a "Shuffle" button, while still favouring good
 * matches.
 */
export function getRecommendations(
  destinations: Destination[],
  params: RecommendationParams
): RecommendationResult {
  const {
    count = 1,
    poolSize = Number.POSITIVE_INFINITY,
    random = Math.random,
    travelMonth,
    weights,
    excludeDestinationIds,
    ...filterParams
  } = params

  if (count < 1) throw new Error('count must be at least 1')
  if (poolSize < 1) throw new Error('poolSize must be at least 1')

  const candidates =
    excludeDestinationIds && excludeDestinationIds.length > 0
      ? destinations.filter((d) => !excludeDestinationIds.includes(d.id))
      : destinations

  const filterResult = filterDestinations(candidates, filterParams)
  const scored = scoreDestinations(filterResult.passed, { ...filterParams, travelMonth, weights })
  const pool = scored.slice(0, poolSize)
  const recommendations = weightedShuffle(pool, random).slice(0, count)

  return { recommendations, filterResult }
}
