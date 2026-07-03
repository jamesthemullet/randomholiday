import type { Coordinates, Destination, TravelStyle } from './destinations'
import { calculateDistance } from './distanceCalculator'
import { calculateBudget } from './budgetCalculator'

export interface ScoringWeights {
  /** Weight applied to how well the destination matches the requested travel styles */
  style: number
  /** Weight applied to how well the travel month lines up with the destination's best months */
  season: number
  /** Weight applied to how much headroom the destination leaves under the budget */
  budget: number
  /** Weight applied to how close the destination is to the origin */
  distance: number
}

export const DEFAULT_WEIGHTS: ScoringWeights = {
  style: 0.4,
  season: 0.25,
  budget: 0.2,
  distance: 0.15,
}

export interface ScoreParams {
  /** User's departure location */
  origin: Coordinates
  /** Maximum total cost per person in USD (flights + hotel + daily spending) */
  maxBudgetPerPerson: number
  /** Maximum great-circle distance from origin in kilometres */
  maxDistanceKm: number
  /** Number of nights at the destination */
  nights: number
  /** Total number of travellers */
  groupSize: number
  /** Preferred travel styles; when omitted the style score is neutral (1) */
  travelStyles?: TravelStyle[]
  /** Month (1–12) of travel; when omitted the season score is neutral (1) */
  travelMonth?: number
  /** Overrides for the default scoring weights */
  weights?: Partial<ScoringWeights>
}

export interface DestinationScore {
  destination: Destination
  /** Combined weighted score, 0–100 */
  totalScore: number
  /** Fraction (0–1) of requested travel styles the destination satisfies */
  styleScore: number
  /** 1 if travelMonth is a best month, 0.5 if adjacent, otherwise 0 */
  seasonScore: number
  /** Fraction (0–1) of budget headroom remaining, 0 if over budget */
  budgetScore: number
  /** Fraction (0–1) of distance headroom remaining, 0 if beyond maxDistanceKm */
  distanceScore: number
}

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value))
}

export function calculateStyleScore(
  destination: Destination,
  travelStyles?: TravelStyle[]
): number {
  if (!travelStyles || travelStyles.length === 0) return 1
  const matches = destination.travelStyles.filter((style) => travelStyles.includes(style)).length
  return matches / travelStyles.length
}

export function calculateSeasonScore(destination: Destination, travelMonth?: number): number {
  if (travelMonth === undefined) return 1
  if (destination.bestMonths.includes(travelMonth)) return 1

  const isAdjacent = destination.bestMonths.some((month) => {
    const diff = Math.abs(month - travelMonth)
    return diff === 1 || diff === 11
  })
  return isAdjacent ? 0.5 : 0
}

export function calculateBudgetScore(
  destination: Destination,
  distanceKm: number,
  maxBudgetPerPerson: number,
  nights: number,
  groupSize: number
): number {
  if (maxBudgetPerPerson <= 0) return 0
  const { perPersonCost } = calculateBudget({ destination, distanceKm, nights, groupSize })
  return clamp01(1 - perPersonCost / maxBudgetPerPerson)
}

export function calculateDistanceScore(distanceKm: number, maxDistanceKm: number): number {
  if (maxDistanceKm <= 0) return distanceKm === 0 ? 1 : 0
  return clamp01(1 - distanceKm / maxDistanceKm)
}

/**
 * Produces a soft 0–100 score for a single destination, blending style match,
 * season match, budget headroom, and distance headroom by the given weights.
 */
export function scoreDestination(destination: Destination, params: ScoreParams): DestinationScore {
  const {
    origin,
    maxBudgetPerPerson,
    maxDistanceKm,
    nights,
    groupSize,
    travelStyles,
    travelMonth,
    weights,
  } = params

  if (maxDistanceKm < 0) throw new Error('maxDistanceKm must be non-negative')
  if (maxBudgetPerPerson < 0) throw new Error('maxBudgetPerPerson must be non-negative')
  if (nights < 0) throw new Error('nights must be non-negative')
  if (groupSize < 1) throw new Error('groupSize must be at least 1')
  if (travelMonth !== undefined && (travelMonth < 1 || travelMonth > 12)) {
    throw new Error('travelMonth must be between 1 and 12')
  }

  const resolvedWeights: ScoringWeights = { ...DEFAULT_WEIGHTS, ...weights }
  const distanceKm = calculateDistance(origin, destination.coordinates)

  const styleScore = calculateStyleScore(destination, travelStyles)
  const seasonScore = calculateSeasonScore(destination, travelMonth)
  const budgetScore = calculateBudgetScore(
    destination,
    distanceKm,
    maxBudgetPerPerson,
    nights,
    groupSize
  )
  const distanceScore = calculateDistanceScore(distanceKm, maxDistanceKm)

  const totalScore =
    100 *
    (styleScore * resolvedWeights.style +
      seasonScore * resolvedWeights.season +
      budgetScore * resolvedWeights.budget +
      distanceScore * resolvedWeights.distance)

  return { destination, totalScore, styleScore, seasonScore, budgetScore, distanceScore }
}

/**
 * Scores every destination and returns the results sorted by totalScore descending.
 */
export function scoreDestinations(
  destinations: Destination[],
  params: ScoreParams
): DestinationScore[] {
  return destinations
    .map((destination) => scoreDestination(destination, params))
    .sort((a, b) => b.totalScore - a.totalScore)
}
