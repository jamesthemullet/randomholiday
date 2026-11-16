export type TravelStyle = 'beach' | 'city' | 'adventure' | 'culture'

export type Continent = 'Europe' | 'Africa' | 'Asia' | 'Americas' | 'Oceania' | 'Middle East'

export interface Coordinates {
  lat: number
  lng: number
}

export interface EstimatedCosts {
  /** Round-trip flight estimate in GBP per person from a typical European hub */
  flightFromEurope: number
  /** Average hotel cost per night in GBP */
  hotelPerNight: number
  /** Daily spending per person in GBP (food, transport, activities) */
  dailySpending: number
}

export interface Destination {
  id: string
  name: string
  country: string
  /** ISO 3166-1 alpha-2 country code */
  countryCode: string
  coordinates: Coordinates
  continent: Continent
  description: string
  /** Primary climate type */
  climate: string
  travelStyles: TravelStyle[]
  /** Months (1–12) when this destination is at its best — mostly good weather, but also seasonal draws like Christmas markets */
  bestMonths: number[]
  estimatedCosts: EstimatedCosts
  activities: string[]
  currency: string
}

/** All valid travel styles */
export const TRAVEL_STYLES: TravelStyle[] = ['beach', 'city', 'adventure', 'culture']
