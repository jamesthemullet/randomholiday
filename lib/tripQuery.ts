import { supportedDepartureCities } from './departureCities'
import type { DepartureCity } from './departureCities'
import { TRAVEL_STYLES } from './types'
import type { TravelStyle } from './types'
import { DEFAULT_MAX_FLIGHT_HOURS, flightHoursForDistance } from './flightTime'
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
  maxFlightHours: number
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
    maxFlightHours: DEFAULT_MAX_FLIGHT_HOURS,
    groupSize: 2,
  }
}

export function buildResultsQuery(params: TripQuery): string {
  const query = new URLSearchParams({
    originId: params.city.id,
    budget: String(params.budget),
    hours: String(params.maxFlightHours),
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
 * Reads the flight-time limit from `hours`, falling back to the older `distance` (km) param so
 * links made before the switch to flight time still give the same results.
 */
export function parseMaxFlightHours(params: URLSearchParams): number | undefined {
  const hours = parsePositiveParam(params.get('hours'))
  if (hours !== undefined) return hours
  const distanceKm = parsePositiveParam(params.get('distance'))
  return distanceKm === undefined ? undefined : flightHoursForDistance(distanceKm)
}

/** Splits a `styles` query param on commas and drops any entry that isn't a known TravelStyle. */
export function parseTravelStyles(stylesParam: string | null): TravelStyle[] {
  if (!stylesParam) return []
  return stylesParam
    .split(',')
    .filter((style): style is TravelStyle => TRAVEL_STYLES.includes(style as TravelStyle))
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

  const maxFlightHours = parseMaxFlightHours(params)
  if (maxFlightHours !== undefined) values.maxFlightHours = maxFlightHours

  const groupSize = parsePositiveParam(params.get('groupSize'))
  if (groupSize !== undefined) values.groupSize = groupSize

  const travelStyles = parseTravelStyles(params.get('styles'))
  if (travelStyles.length > 0) values.travelStyles = travelStyles

  return values
}
