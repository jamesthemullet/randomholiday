import type { Coordinates } from './destinations'

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
  {
    id: 'paris-france',
    name: 'Paris',
    country: 'France',
    coordinates: { lat: 48.8566, lng: 2.3522 },
  },
  {
    id: 'berlin-germany',
    name: 'Berlin',
    country: 'Germany',
    coordinates: { lat: 52.52, lng: 13.405 },
  },
  {
    id: 'madrid-spain',
    name: 'Madrid',
    country: 'Spain',
    coordinates: { lat: 40.4168, lng: -3.7038 },
  },
  { id: 'rome-italy', name: 'Rome', country: 'Italy', coordinates: { lat: 41.9028, lng: 12.4964 } },
  {
    id: 'amsterdam-netherlands',
    name: 'Amsterdam',
    country: 'Netherlands',
    coordinates: { lat: 52.3676, lng: 4.9041 },
  },
  {
    id: 'dublin-ireland',
    name: 'Dublin',
    country: 'Ireland',
    coordinates: { lat: 53.3498, lng: -6.2603 },
  },
  {
    id: 'lisbon-portugal',
    name: 'Lisbon',
    country: 'Portugal',
    coordinates: { lat: 38.7223, lng: -9.1393 },
  },
  {
    id: 'vienna-austria',
    name: 'Vienna',
    country: 'Austria',
    coordinates: { lat: 48.2082, lng: 16.3738 },
  },
  {
    id: 'zurich-switzerland',
    name: 'Zurich',
    country: 'Switzerland',
    coordinates: { lat: 47.3769, lng: 8.5417 },
  },
  {
    id: 'stockholm-sweden',
    name: 'Stockholm',
    country: 'Sweden',
    coordinates: { lat: 59.3293, lng: 18.0686 },
  },
  {
    id: 'copenhagen-denmark',
    name: 'Copenhagen',
    country: 'Denmark',
    coordinates: { lat: 55.6761, lng: 12.5683 },
  },
  {
    id: 'oslo-norway',
    name: 'Oslo',
    country: 'Norway',
    coordinates: { lat: 59.9139, lng: 10.7522 },
  },
  {
    id: 'warsaw-poland',
    name: 'Warsaw',
    country: 'Poland',
    coordinates: { lat: 52.2297, lng: 21.0122 },
  },
  {
    id: 'athens-greece',
    name: 'Athens',
    country: 'Greece',
    coordinates: { lat: 37.9838, lng: 23.7275 },
  },
  {
    id: 'new-york-usa',
    name: 'New York',
    country: 'United States',
    coordinates: { lat: 40.7128, lng: -74.006 },
  },
  {
    id: 'los-angeles-usa',
    name: 'Los Angeles',
    country: 'United States',
    coordinates: { lat: 34.0522, lng: -118.2437 },
  },
  {
    id: 'chicago-usa',
    name: 'Chicago',
    country: 'United States',
    coordinates: { lat: 41.8781, lng: -87.6298 },
  },
  {
    id: 'toronto-canada',
    name: 'Toronto',
    country: 'Canada',
    coordinates: { lat: 43.6532, lng: -79.3832 },
  },
  {
    id: 'mexico-city-mexico',
    name: 'Mexico City',
    country: 'Mexico',
    coordinates: { lat: 19.4326, lng: -99.1332 },
  },
  {
    id: 'sao-paulo-brazil',
    name: 'São Paulo',
    country: 'Brazil',
    coordinates: { lat: -23.5505, lng: -46.6333 },
  },
  {
    id: 'buenos-aires-argentina',
    name: 'Buenos Aires',
    country: 'Argentina',
    coordinates: { lat: -34.6037, lng: -58.3816 },
  },
  {
    id: 'tokyo-japan',
    name: 'Tokyo',
    country: 'Japan',
    coordinates: { lat: 35.6762, lng: 139.6503 },
  },
  {
    id: 'seoul-south-korea',
    name: 'Seoul',
    country: 'South Korea',
    coordinates: { lat: 37.5665, lng: 126.978 },
  },
  {
    id: 'singapore-singapore',
    name: 'Singapore',
    country: 'Singapore',
    coordinates: { lat: 1.3521, lng: 103.8198 },
  },
  {
    id: 'hong-kong-china',
    name: 'Hong Kong',
    country: 'China',
    coordinates: { lat: 22.3193, lng: 114.1694 },
  },
  {
    id: 'bangkok-thailand',
    name: 'Bangkok',
    country: 'Thailand',
    coordinates: { lat: 13.7563, lng: 100.5018 },
  },
  {
    id: 'mumbai-india',
    name: 'Mumbai',
    country: 'India',
    coordinates: { lat: 19.076, lng: 72.8777 },
  },
  {
    id: 'dubai-uae',
    name: 'Dubai',
    country: 'United Arab Emirates',
    coordinates: { lat: 25.2048, lng: 55.2708 },
  },
  {
    id: 'sydney-australia',
    name: 'Sydney',
    country: 'Australia',
    coordinates: { lat: -33.8688, lng: 151.2093 },
  },
  {
    id: 'melbourne-australia',
    name: 'Melbourne',
    country: 'Australia',
    coordinates: { lat: -37.8136, lng: 144.9631 },
  },
  {
    id: 'auckland-new-zealand',
    name: 'Auckland',
    country: 'New Zealand',
    coordinates: { lat: -36.8485, lng: 174.7633 },
  },
  {
    id: 'johannesburg-south-africa',
    name: 'Johannesburg',
    country: 'South Africa',
    coordinates: { lat: -26.2041, lng: 28.0473 },
  },
  {
    id: 'cairo-egypt',
    name: 'Cairo',
    country: 'Egypt',
    coordinates: { lat: 30.0444, lng: 31.2357 },
  },
  {
    id: 'nairobi-kenya',
    name: 'Nairobi',
    country: 'Kenya',
    coordinates: { lat: -1.2921, lng: 36.8219 },
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
