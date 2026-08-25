const BOOKING_SEARCH_URL = 'https://www.booking.com/searchresults.html'
const SKYSCANNER_SEARCH_URL = 'https://www.skyscanner.net/transport/flights'

export interface BookingAffiliateLinkParams {
  city: string
  country: string
  groupSize: number
  /** Booking.com partner affiliate ID. Omit to build an untagged link. */
  affiliateId?: string
}

/**
 * Builds a Booking.com hotel search URL for a destination. Tags the link
 * with our affiliate ID when one is configured, so it still works untagged
 * before a partner account is set up.
 */
export function getBookingAffiliateUrl({
  city,
  country,
  groupSize,
  affiliateId,
}: BookingAffiliateLinkParams): string {
  const params = new URLSearchParams({
    ss: `${city}, ${country}`,
    group_adults: String(Math.max(1, groupSize)),
    no_rooms: '1',
  })

  if (affiliateId) {
    params.set('aid', affiliateId)
  }

  return `${BOOKING_SEARCH_URL}?${params.toString()}`
}

export interface SkyscannerAffiliateLinkParams {
  /** ISO 3166-1 alpha-2 country code of the destination */
  countryCode: string
  groupSize: number
  /** Skyscanner affiliate/associate ID. Omit to build an untagged link. */
  affiliateId?: string
}

/**
 * Builds a Skyscanner flight search URL to a destination country. We don't
 * capture the traveller's departure airport, so the origin is left as
 * "everywhere" to search the cheapest flights from anywhere. Tags the link
 * with our affiliate ID when one is configured, so it still works untagged
 * before a partner account is set up.
 */
export function getSkyscannerAffiliateUrl({
  countryCode,
  groupSize,
  affiliateId,
}: SkyscannerAffiliateLinkParams): string {
  const params = new URLSearchParams({
    adults: String(Math.max(1, groupSize)),
    rtn: '1',
  })

  if (affiliateId) {
    params.set('associateid', affiliateId)
  }

  const destination = countryCode.toLowerCase()
  return `${SKYSCANNER_SEARCH_URL}/everywhere/${destination}/?${params.toString()}`
}
