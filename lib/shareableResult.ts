import type { TravelStyle } from './destinations'

export interface ShareableResult {
  /** id of the destination that was shown */
  destinationId: string
  /** id of the departure city used to produce the result */
  originId: string
  /** Maximum total cost per person in USD, as entered by the user */
  maxBudgetPerPerson: number
  /** Maximum great-circle distance from origin in kilometres */
  maxDistanceKm: number
  /** Number of nights at the destination */
  nights: number
  /** Total number of travellers */
  groupSize: number
  /** Preferred travel styles, if any were selected */
  travelStyles?: TravelStyle[]
  /** Month (1–12) of travel, if one was selected */
  travelMonth?: number
}

/**
 * Encodes a result (the destination shown plus the preferences that produced
 * it) into a URL query string. Param names match the individual preference
 * params `/results` already reads from the discover flow, plus a
 * `destination` param pinning the specific destination that was shown.
 */
export function encodeShareableResult(result: ShareableResult): string {
  const params = new URLSearchParams()
  params.set('destination', result.destinationId)
  params.set('originId', result.originId)
  params.set('budget', String(result.maxBudgetPerPerson))
  params.set('distance', String(result.maxDistanceKm))
  params.set('nights', String(result.nights))
  params.set('groupSize', String(result.groupSize))

  if (result.travelMonth !== undefined) {
    params.set('month', String(result.travelMonth))
  }

  if (result.travelStyles && result.travelStyles.length > 0) {
    params.set('styles', result.travelStyles.join(','))
  }

  return params.toString()
}

/**
 * Decodes a shareable result query string (or URLSearchParams) back into its
 * parts. Returns null when required fields are missing or unparseable.
 */
export function decodeShareableResult(
  searchParams: URLSearchParams | string
): ShareableResult | null {
  const params = typeof searchParams === 'string' ? new URLSearchParams(searchParams) : searchParams

  const destinationId = params.get('destination')
  const originId = params.get('originId')
  const maxBudgetPerPerson = Number(params.get('budget'))
  const maxDistanceKm = Number(params.get('distance'))
  const nights = Number(params.get('nights'))
  const groupSize = Number(params.get('groupSize'))

  if (
    !destinationId ||
    !originId ||
    !maxBudgetPerPerson ||
    !maxDistanceKm ||
    !nights ||
    !groupSize
  ) {
    return null
  }

  const monthParam = params.get('month')
  const travelMonth = monthParam !== null ? Number(monthParam) : undefined

  const stylesParam = params.get('styles')
  const travelStyles = stylesParam ? (stylesParam.split(',') as TravelStyle[]) : undefined

  return {
    destinationId,
    originId,
    maxBudgetPerPerson,
    maxDistanceKm,
    nights,
    groupSize,
    travelStyles,
    travelMonth: travelMonth !== undefined && Number.isNaN(travelMonth) ? undefined : travelMonth,
  }
}
