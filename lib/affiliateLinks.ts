const BOOKING_SEARCH_URL = 'https://www.booking.com/searchresults.html'

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
