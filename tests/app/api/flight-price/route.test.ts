import { describe, it, expect } from 'vitest'
import { GET } from '@/app/api/flight-price/route'

const BASE_URL = 'http://localhost/api/flight-price'

describe('GET /api/flight-price', () => {
  it('returns 400 when distanceKm is missing', async () => {
    const request = new Request(BASE_URL)

    const response = await GET(request)
    const body = await response.json()

    expect(response.status).toBe(400)
    expect(body.error).toMatch(/distanceKm/)
  })

  it('returns 400 when distanceKm is not a valid non-negative number', async () => {
    const request = new Request(`${BASE_URL}?distanceKm=-5`)

    const response = await GET(request)
    const body = await response.json()

    expect(response.status).toBe(400)
    expect(body.error).toMatch(/distanceKm/)
  })

  it('returns a static estimate for a valid distance', async () => {
    const request = new Request(`${BASE_URL}?distanceKm=1150`)

    const response = await GET(request)
    const body = await response.json()

    expect(body).toEqual({ source: 'static', pricePerPerson: 120, currency: 'USD' })
  })

  it('returns a static estimate for a long-haul distance', async () => {
    const request = new Request(`${BASE_URL}?distanceKm=9000`)

    const response = await GET(request)
    const body = await response.json()

    expect(body).toEqual({ source: 'static', pricePerPerson: 1100, currency: 'USD' })
  })

  it('returns 429 once the per-IP limit is exceeded', async () => {
    const headers = { 'x-forwarded-for': '203.0.113.42' }

    for (let i = 0; i < 30; i += 1) {
      const response = await GET(new Request(`${BASE_URL}?distanceKm=1150`, { headers }))
      expect(response.status).toBe(200)
    }

    const limited = await GET(new Request(`${BASE_URL}?distanceKm=1150`, { headers }))
    const body = await limited.json()

    expect(limited.status).toBe(429)
    expect(body.error).toMatch(/Too many requests/)
    expect(limited.headers.get('Retry-After')).not.toBeNull()
  })
})
