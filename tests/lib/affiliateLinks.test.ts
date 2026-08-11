import { describe, it, expect } from 'vitest'
import { getBookingAffiliateUrl } from '@/lib/affiliateLinks'

describe('getBookingAffiliateUrl', () => {
  it('builds a Booking.com search URL for the destination and group size', () => {
    const url = getBookingAffiliateUrl({ city: 'Bali', country: 'Indonesia', groupSize: 2 })
    const parsed = new URL(url)

    expect(parsed.origin + parsed.pathname).toBe('https://www.booking.com/searchresults.html')
    expect(parsed.searchParams.get('ss')).toBe('Bali, Indonesia')
    expect(parsed.searchParams.get('group_adults')).toBe('2')
    expect(parsed.searchParams.get('no_rooms')).toBe('1')
  })

  it('omits the aid parameter when no affiliate ID is provided', () => {
    const url = getBookingAffiliateUrl({ city: 'Bali', country: 'Indonesia', groupSize: 2 })
    expect(new URL(url).searchParams.has('aid')).toBe(false)
  })

  it('includes the aid parameter when an affiliate ID is provided', () => {
    const url = getBookingAffiliateUrl({
      city: 'Bali',
      country: 'Indonesia',
      groupSize: 2,
      affiliateId: 'abc123',
    })
    expect(new URL(url).searchParams.get('aid')).toBe('abc123')
  })

  it('clamps group size to a minimum of 1', () => {
    const url = getBookingAffiliateUrl({ city: 'Bali', country: 'Indonesia', groupSize: 0 })
    expect(new URL(url).searchParams.get('group_adults')).toBe('1')
  })
})
