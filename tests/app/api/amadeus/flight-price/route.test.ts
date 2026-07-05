import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { GET } from '@/app/api/amadeus/flight-price/route'

const BASE_URL = 'http://localhost/api/amadeus/flight-price'

function jsonResponse(body: unknown, ok = true, status = 200): Response {
  return {
    ok,
    status,
    json: () => Promise.resolve(body),
  } as unknown as Response
}

describe('GET /api/amadeus/flight-price', () => {
  const originalEnv = { ...process.env }

  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    process.env = { ...originalEnv }
  })

  it('returns 400 when required params are missing', async () => {
    const request = new Request(`${BASE_URL}?originIata=LHR`)

    const response = await GET(request)
    const body = await response.json()

    expect(response.status).toBe(400)
    expect(body.error).toMatch(/required/)
  })

  it('returns 400 when distanceKm is not a valid non-negative number', async () => {
    const request = new Request(
      `${BASE_URL}?originIata=LHR&destinationIata=BCN&departureDate=2026-08-01&distanceKm=-5`
    )

    const response = await GET(request)
    const body = await response.json()

    expect(response.status).toBe(400)
    expect(body.error).toMatch(/distanceKm/)
  })

  it('returns a static estimate when Amadeus credentials are not configured', async () => {
    delete process.env.AMADEUS_API_KEY
    delete process.env.AMADEUS_API_SECRET

    const request = new Request(
      `${BASE_URL}?originIata=LHR&destinationIata=BCN&departureDate=2026-08-01&distanceKm=1150`
    )

    const response = await GET(request)
    const body = await response.json()

    expect(body).toEqual({ source: 'static', pricePerPerson: 120, currency: 'USD' })
    expect(fetch).not.toHaveBeenCalled()
  })

  it('returns a live price when Amadeus credentials are configured and the request succeeds', async () => {
    process.env.AMADEUS_API_KEY = 'test-key'
    process.env.AMADEUS_API_SECRET = 'test-secret'

    vi.mocked(fetch)
      .mockResolvedValueOnce(jsonResponse({ access_token: 'token-123' }))
      .mockResolvedValueOnce(
        jsonResponse({ data: [{ price: { total: '245.50', currency: 'EUR' } }] })
      )

    const request = new Request(
      `${BASE_URL}?originIata=LHR&destinationIata=BCN&departureDate=2026-08-01&distanceKm=1150&adults=2`
    )

    const response = await GET(request)
    const body = await response.json()

    expect(body).toEqual({ source: 'live', pricePerPerson: 245.5, currency: 'EUR' })
  })

  it('falls back to a static estimate when the live Amadeus request fails', async () => {
    process.env.AMADEUS_API_KEY = 'test-key'
    process.env.AMADEUS_API_SECRET = 'test-secret'

    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse({}, false, 401))

    const request = new Request(
      `${BASE_URL}?originIata=LHR&destinationIata=BCN&departureDate=2026-08-01&distanceKm=9000`
    )

    const response = await GET(request)
    const body = await response.json()

    expect(body).toEqual({ source: 'static', pricePerPerson: 1100, currency: 'USD' })
  })
})
