import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { fetchLiveFlightPrice } from '@/lib/amadeus'

const credentials = { apiKey: 'test-key', apiSecret: 'test-secret' }
const query = {
  originIata: 'LHR',
  destinationIata: 'BCN',
  departureDate: '2026-08-01',
}

function jsonResponse(body: unknown, ok = true, status = 200): Response {
  return {
    ok,
    status,
    json: () => Promise.resolve(body),
  } as unknown as Response
}

describe('fetchLiveFlightPrice', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('returns a price and currency on success', async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce(jsonResponse({ access_token: 'token-123' }))
      .mockResolvedValueOnce(
        jsonResponse({ data: [{ price: { total: '245.50', currency: 'EUR' } }] })
      )

    const result = await fetchLiveFlightPrice(query, credentials)

    expect(result).toEqual({ pricePerPerson: 245.5, currency: 'EUR' })
  })

  it('requests an access token before requesting flight offers', async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce(jsonResponse({ access_token: 'token-123' }))
      .mockResolvedValueOnce(jsonResponse({ data: [{ price: { total: '100', currency: 'USD' } }] }))

    await fetchLiveFlightPrice({ ...query, adults: 3 }, credentials)

    const tokenCall = vi.mocked(fetch).mock.calls[0]
    expect(tokenCall[0]).toContain('/v1/security/oauth2/token')

    const offersCall = vi.mocked(fetch).mock.calls[1]
    expect(offersCall[0]).toContain('originLocationCode=LHR')
    expect(offersCall[0]).toContain('destinationLocationCode=BCN')
    expect(offersCall[0]).toContain('adults=3')
    expect((offersCall[1] as RequestInit).headers).toEqual({ Authorization: 'Bearer token-123' })
  })

  it('throws when the token request fails', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse({}, false, 401))

    await expect(fetchLiveFlightPrice(query, credentials)).rejects.toThrow(
      'Amadeus token request failed with status 401'
    )
  })

  it('throws when the flight offers request fails', async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce(jsonResponse({ access_token: 'token-123' }))
      .mockResolvedValueOnce(jsonResponse({}, false, 500))

    await expect(fetchLiveFlightPrice(query, credentials)).rejects.toThrow(
      'Amadeus flight offers request failed with status 500'
    )
  })

  it('throws when no flight offers are returned', async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce(jsonResponse({ access_token: 'token-123' }))
      .mockResolvedValueOnce(jsonResponse({ data: [] }))

    await expect(fetchLiveFlightPrice(query, credentials)).rejects.toThrow(
      'Amadeus returned no flight offers for this route'
    )
  })

  it('throws when the offers response has no data field', async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce(jsonResponse({ access_token: 'token-123' }))
      .mockResolvedValueOnce(jsonResponse({}))

    await expect(fetchLiveFlightPrice(query, credentials)).rejects.toThrow(
      'Amadeus returned no flight offers for this route'
    )
  })

  it('defaults adults to 1 when not provided', async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce(jsonResponse({ access_token: 'token-123' }))
      .mockResolvedValueOnce(jsonResponse({ data: [{ price: { total: '100', currency: 'USD' } }] }))

    await fetchLiveFlightPrice(query, credentials)

    const offersCall = vi.mocked(fetch).mock.calls[1]
    expect(offersCall[0]).toContain('adults=1')
  })
})
