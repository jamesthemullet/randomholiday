import type { Coordinates } from './types'

export interface DepartureCity {
  id: string
  name: string
  country: string
  coordinates: Coordinates
}

export const departureCities: DepartureCity[] = [
  {
    id: 'london-uk',
    name: 'London',
    country: 'United Kingdom',
    coordinates: { lat: 51.5072, lng: -0.1276 },
  },
  {
    id: 'manchester-uk',
    name: 'Manchester',
    country: 'United Kingdom',
    coordinates: { lat: 53.4808, lng: -2.2426 },
  },
  {
    id: 'birmingham-uk',
    name: 'Birmingham',
    country: 'United Kingdom',
    coordinates: { lat: 52.4862, lng: -1.8904 },
  },
  {
    id: 'edinburgh-uk',
    name: 'Edinburgh',
    country: 'United Kingdom',
    coordinates: { lat: 55.9533, lng: -3.1883 },
  },
  {
    id: 'glasgow-uk',
    name: 'Glasgow',
    country: 'United Kingdom',
    coordinates: { lat: 55.8642, lng: -4.2518 },
  },
  {
    id: 'bristol-uk',
    name: 'Bristol',
    country: 'United Kingdom',
    coordinates: { lat: 51.4545, lng: -2.5879 },
  },
  {
    id: 'newcastle-uk',
    name: 'Newcastle',
    country: 'United Kingdom',
    coordinates: { lat: 54.9783, lng: -1.6178 },
  },
  {
    id: 'liverpool-uk',
    name: 'Liverpool',
    country: 'United Kingdom',
    coordinates: { lat: 53.4084, lng: -2.9916 },
  },
  {
    id: 'leeds-uk',
    name: 'Leeds',
    country: 'United Kingdom',
    coordinates: { lat: 53.8008, lng: -1.5491 },
  },
  {
    id: 'east-midlands-uk',
    name: 'East Midlands',
    country: 'United Kingdom',
    coordinates: { lat: 52.8311, lng: -1.3281 },
  },
  {
    id: 'belfast-uk',
    name: 'Belfast',
    country: 'United Kingdom',
    coordinates: { lat: 54.5973, lng: -5.9301 },
  },
  {
    id: 'aberdeen-uk',
    name: 'Aberdeen',
    country: 'United Kingdom',
    coordinates: { lat: 57.1497, lng: -2.0943 },
  },
  {
    id: 'cardiff-uk',
    name: 'Cardiff',
    country: 'United Kingdom',
    coordinates: { lat: 51.4816, lng: -3.1791 },
  },
  {
    id: 'southampton-uk',
    name: 'Southampton',
    country: 'United Kingdom',
    coordinates: { lat: 50.9097, lng: -1.4044 },
  },
  {
    id: 'exeter-uk',
    name: 'Exeter',
    country: 'United Kingdom',
    coordinates: { lat: 50.7184, lng: -3.5339 },
  },
  {
    id: 'bournemouth-uk',
    name: 'Bournemouth',
    country: 'United Kingdom',
    coordinates: { lat: 50.7192, lng: -1.8808 },
  },
  {
    id: 'norwich-uk',
    name: 'Norwich',
    country: 'United Kingdom',
    coordinates: { lat: 52.6309, lng: 1.2974 },
  },
  {
    id: 'inverness-uk',
    name: 'Inverness',
    country: 'United Kingdom',
    coordinates: { lat: 57.4778, lng: -4.2247 },
  },
]

/**
 * Departure cities whose routes are in the catalogue. Only these can be searched from; add a city
 * here once its route data has been generated.
 */
export const SUPPORTED_DEPARTURE_CITY_IDS = ['london-uk']

export const supportedDepartureCities: DepartureCity[] = departureCities.filter((city) =>
  SUPPORTED_DEPARTURE_CITY_IDS.includes(city.id)
)

/**
 * Filters departure cities by a query string, matching against city name
 * and country (case-insensitive substring match). Returns all cities for
 * an empty query.
 */
export function searchDepartureCities(
  query: string,
  cities: DepartureCity[] = supportedDepartureCities
): DepartureCity[] {
  const trimmed = query.trim().toLowerCase()
  if (!trimmed) return cities

  return cities.filter(
    (city) =>
      city.name.toLowerCase().includes(trimmed) || city.country.toLowerCase().includes(trimmed)
  )
}
