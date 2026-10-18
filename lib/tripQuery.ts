import { supportedDepartureCities } from './departureCities'
import type { DepartureCity } from './departureCities'
import { TRAVEL_STYLES } from './destinations'
import type { TravelStyle } from './destinations'
import { parseNumberParam } from './queryParams'

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

export interface TripQuery {
  city: DepartureCity
  budget: number
  month: number
  nights: number
  travelStyles: TravelStyle[]
  maxDistance: number
  groupSize: number
}

export type TripQueryInitialValues = Partial<TripQuery>

export function getMonthOptions(): { value: string; label: string }[] {
  return MONTH_NAMES.map((name, index) => ({ value: String(index + 1), label: name }))
}

/** Returns the 1-indexed month after the one `now` falls in, wrapping December to January. */
export function getNextMonth(now: Date = new Date()): number {
  return ((now.getMonth() + 1) % 12) + 1
}

/** The search used when nothing has been chosen: London, next month, a week for two. */
export function getDefaultTripQuery(now: Date = new Date()): TripQuery {
  return {
    // London is the only city with route data so far.
    city: supportedDepartureCities[0],
    budget: 1500,
    month: getNextMonth(now),
    nights: 7,
    travelStyles: [],
    maxDistance: 10000,
    groupSize: 2,
  }
}

export function buildResultsQuery(params: TripQuery): string {
  const query = new URLSearchParams({
    originId: params.city.id,
    budget: String(params.budget),
    distance: String(params.maxDistance),
    nights: String(params.nights),
    groupSize: String(params.groupSize),
    month: String(params.month),
  })
  if (params.travelStyles.length > 0) {
    query.set('styles', params.travelStyles.join(','))
  }
  return query.toString()
}

function parsePositiveParam(value: string | null): number | undefined {
  const parsed = parseNumberParam(value)
  return parsed !== null && parsed > 0 ? parsed : undefined
}

/**
 * Reads a results query string back into form values, so "Change search" can reopen the
 * form prefilled. Anything missing or invalid is left undefined for the form to default.
 */
export function parseTripQuery(params: URLSearchParams): TripQueryInitialValues {
  const values: TripQueryInitialValues = {}

  const city = supportedDepartureCities.find((c) => c.id === params.get('originId'))
  if (city) values.city = city

  const budget = parsePositiveParam(params.get('budget'))
  if (budget !== undefined) values.budget = budget

  const month = parsePositiveParam(params.get('month'))
  if (month !== undefined && Number.isInteger(month) && month <= 12) values.month = month

  const nights = parsePositiveParam(params.get('nights'))
  if (nights !== undefined) values.nights = nights

  const maxDistance = parsePositiveParam(params.get('distance'))
  if (maxDistance !== undefined) values.maxDistance = maxDistance

  const groupSize = parsePositiveParam(params.get('groupSize'))
  if (groupSize !== undefined) values.groupSize = groupSize

  const styles = params.get('styles')
  if (styles) {
    const travelStyles = styles
      .split(',')
      .filter((style): style is TravelStyle => TRAVEL_STYLES.includes(style as TravelStyle))
    if (travelStyles.length > 0) values.travelStyles = travelStyles
  }

  return values
}
