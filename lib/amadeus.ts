// Amadeus Travel API client (https://developers.amadeus.com)
// Test environment base URL — Amadeus uses the same host for self-service auth + flight search.
const AMADEUS_BASE_URL = 'https://test.api.amadeus.com'

export interface AmadeusCredentials {
  apiKey: string
  apiSecret: string
}

export interface FlightPriceQuery {
  originIata: string
  destinationIata: string
  departureDate: string
  adults?: number
}

export interface FlightPriceResult {
  pricePerPerson: number
  currency: string
}

interface AmadeusTokenResponse {
  access_token: string
}

interface AmadeusFlightOffer {
  price: {
    total: string
    currency: string
  }
}

interface AmadeusFlightOffersResponse {
  data?: AmadeusFlightOffer[]
}

async function fetchAmadeusAccessToken(credentials: AmadeusCredentials): Promise<string> {
  const response = await fetch(`${AMADEUS_BASE_URL}/v1/security/oauth2/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: credentials.apiKey,
      client_secret: credentials.apiSecret,
    }),
  })

  if (!response.ok) {
    throw new Error(`Amadeus token request failed with status ${response.status}`)
  }

  const data = (await response.json()) as AmadeusTokenResponse
  return data.access_token
}

/**
 * Fetches a live round-trip flight price estimate from the Amadeus Flight
 * Offers Search API. Throws if credentials are invalid, the request fails,
 * or no offers are returned — callers are expected to fall back to a static
 * estimate in that case.
 */
export async function fetchLiveFlightPrice(
  query: FlightPriceQuery,
  credentials: AmadeusCredentials
): Promise<FlightPriceResult> {
  const accessToken = await fetchAmadeusAccessToken(credentials)

  const params = new URLSearchParams({
    originLocationCode: query.originIata,
    destinationLocationCode: query.destinationIata,
    departureDate: query.departureDate,
    adults: String(query.adults ?? 1),
    max: '1',
  })

  const response = await fetch(
    `${AMADEUS_BASE_URL}/v2/shopping/flight-offers?${params.toString()}`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  )

  if (!response.ok) {
    throw new Error(`Amadeus flight offers request failed with status ${response.status}`)
  }

  const data = (await response.json()) as AmadeusFlightOffersResponse
  const offer = data.data?.[0]

  if (!offer) {
    throw new Error('Amadeus returned no flight offers for this route')
  }

  return {
    pricePerPerson: Number(offer.price.total),
    currency: offer.price.currency,
  }
}
