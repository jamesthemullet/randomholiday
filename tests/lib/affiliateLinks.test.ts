import { describe, it, expect } from 'vitest'
import { getBookingAffiliateUrl, getSkyscannerAffiliateUrl } from '@/lib/affiliateLinks'

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

describe('getSkyscannerAffiliateUrl', () => {
  it('builds a Skyscanner flight search URL from anywhere to the destination country', () => {
    const url = getSkyscannerAffiliateUrl({ countryCode: 'ID', groupSize: 2 })
    const parsed = new URL(url)

    expect(parsed.origin + parsed.pathname).toBe(
      'https://www.skyscanner.net/transport/flights/everywhere/id/'
    )
    expect(parsed.searchParams.get('adults')).toBe('2')
    expect(parsed.searchParams.get('rtn')).toBe('1')
  })

  it('lowercases the destination country code', () => {
    const url = getSkyscannerAffiliateUrl({ countryCode: 'FR', groupSize: 1 })
    expect(new URL(url).pathname).toBe('/transport/flights/everywhere/fr/')
  })

  it('omits the associateid parameter when no affiliate ID is provided', () => {
    const url = getSkyscannerAffiliateUrl({ countryCode: 'ID', groupSize: 2 })
    expect(new URL(url).searchParams.has('associateid')).toBe(false)
  })

  it('includes the associateid parameter when an affiliate ID is provided', () => {
    const url = getSkyscannerAffiliateUrl({
      countryCode: 'ID',
      groupSize: 2,
      affiliateId: 'xyz789',
    })
    expect(new URL(url).searchParams.get('associateid')).toBe('xyz789')
  })

  it('clamps group size to a minimum of 1', () => {
    const url = getSkyscannerAffiliateUrl({ countryCode: 'ID', groupSize: 0 })
    expect(new URL(url).searchParams.get('adults')).toBe('1')
  })
})
