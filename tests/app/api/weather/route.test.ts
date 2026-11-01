import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { GET } from '@/app/api/weather/route'

const BASE_URL = 'http://localhost/api/weather'
const VALID_QUERY = 'lat=41.38&lng=2.17&climate=mediterranean&month=7'

describe('GET /api/weather', () => {
  beforeEach(() => {
    // VALID_QUERY uses month=7; pin "now" to July so the live-weather path
    // (gated on month === current month) is exercised by the tests below.
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 6, 15))
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllEnvs()
    vi.unstubAllGlobals()
  })

  it('returns 400 when lat is missing or out of range', async () => {
    const missing = await GET(new Request(`${BASE_URL}?lng=2.17&climate=mediterranean&month=7`))
    expect(missing.status).toBe(400)
    expect((await missing.json()).error).toMatch(/lat/)

    const outOfRange = await GET(
      new Request(`${BASE_URL}?lat=200&lng=2.17&climate=mediterranean&month=7`)
    )
    expect(outOfRange.status).toBe(400)
  })

  it('returns 400 when lng is missing or out of range', async () => {
    const missing = await GET(new Request(`${BASE_URL}?lat=41.38&climate=mediterranean&month=7`))
    expect(missing.status).toBe(400)
    expect((await missing.json()).error).toMatch(/lng/)

    const outOfRange = await GET(
      new Request(`${BASE_URL}?lat=41.38&lng=-200&climate=mediterranean&month=7`)
    )
    expect(outOfRange.status).toBe(400)
  })

  it('returns 400 when climate is missing', async () => {
    const response = await GET(new Request(`${BASE_URL}?lat=41.38&lng=2.17&month=7`))
    expect(response.status).toBe(400)
    expect((await response.json()).error).toMatch(/climate/)
  })

  it('returns 400 when month is missing or out of range', async () => {
    const missing = await GET(new Request(`${BASE_URL}?lat=41.38&lng=2.17&climate=mediterranean`))
    expect(missing.status).toBe(400)
    expect((await missing.json()).error).toMatch(/month/)

    const outOfRange = await GET(
      new Request(`${BASE_URL}?lat=41.38&lng=2.17&climate=mediterranean&month=13`)
    )
    expect(outOfRange.status).toBe(400)

    const notInteger = await GET(
      new Request(`${BASE_URL}?lat=41.38&lng=2.17&climate=mediterranean&month=7.5`)
    )
    expect(notInteger.status).toBe(400)
  })

  it('returns a static seasonal estimate when no API key is configured', async () => {
    vi.stubEnv('OPENWEATHER_API_KEY', '')

    const response = await GET(new Request(`${BASE_URL}?${VALID_QUERY}`))
    const body = await response.json()

    expect(body).toEqual({ source: 'static', avgHighC: 30, description: 'warm' })
  })

  it('returns live weather when an API key is configured and the fetch succeeds', async () => {
    vi.stubEnv('OPENWEATHER_API_KEY', 'test-key')
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ main: { temp: 26.4 }, weather: [{ description: 'clear sky' }] }),
      })
    )

    const response = await GET(new Request(`${BASE_URL}?${VALID_QUERY}`))
    const body = await response.json()

    expect(body).toEqual({ source: 'live', tempC: 26.4, description: 'clear sky' })
  })

  it('uses the seasonal estimate instead of live weather when the requested month is not the current month', async () => {
    vi.stubEnv('OPENWEATHER_API_KEY', 'test-key')
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ main: { temp: 26.4 }, weather: [{ description: 'clear sky' }] }),
    })
    vi.stubGlobal('fetch', fetchMock)

    const response = await GET(
      new Request(`${BASE_URL}?lat=41.38&lng=2.17&climate=mediterranean&month=12`)
    )
    const body = await response.json()

    expect(body).toEqual({ source: 'static', avgHighC: 15, description: 'cool' })
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('falls back to the static estimate when the live fetch response is not ok', async () => {
    vi.stubEnv('OPENWEATHER_API_KEY', 'test-key')
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false }))

    const response = await GET(new Request(`${BASE_URL}?${VALID_QUERY}`))
    const body = await response.json()

    expect(body.source).toBe('static')
  })

  it('falls back to the static estimate when the live fetch throws', async () => {
    vi.stubEnv('OPENWEATHER_API_KEY', 'test-key')
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network down')))

    const response = await GET(new Request(`${BASE_URL}?${VALID_QUERY}`))
    const body = await response.json()

    expect(body.source).toBe('static')
  })

  it('falls back to the static estimate when the live response is malformed', async () => {
    vi.stubEnv('OPENWEATHER_API_KEY', 'test-key')
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({}) }))

    const response = await GET(new Request(`${BASE_URL}?${VALID_QUERY}`))
    const body = await response.json()

    expect(body.source).toBe('static')
  })

  it('passes an abort signal to the live fetch so a hung request cannot block the response', async () => {
    vi.stubEnv('OPENWEATHER_API_KEY', 'test-key')
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ main: { temp: 26.4 }, weather: [{ description: 'clear sky' }] }),
    })
    vi.stubGlobal('fetch', fetchMock)

    await GET(new Request(`${BASE_URL}?${VALID_QUERY}`))

    const [, options] = fetchMock.mock.calls[0]
    expect(options.signal).toBeInstanceOf(AbortSignal)
  })

  it('falls back to the static estimate when the live fetch is aborted (e.g. by the timeout signal)', async () => {
    vi.stubEnv('OPENWEATHER_API_KEY', 'test-key')
    vi.stubGlobal(
      'fetch',
      vi.fn().mockRejectedValue(new DOMException('The operation was aborted', 'TimeoutError'))
    )

    const response = await GET(new Request(`${BASE_URL}?${VALID_QUERY}`))
    const body = await response.json()

    expect(body.source).toBe('static')
  })

  it('returns 429 once the per-IP limit is exceeded', async () => {
    vi.stubEnv('OPENWEATHER_API_KEY', '')
    const headers = { 'x-forwarded-for': '203.0.113.42' }

    for (let i = 0; i < 30; i += 1) {
      const response = await GET(new Request(`${BASE_URL}?${VALID_QUERY}`, { headers }))
      expect(response.status).toBe(200)
    }

    const limited = await GET(new Request(`${BASE_URL}?${VALID_QUERY}`, { headers }))
    const body = await limited.json()

    expect(limited.status).toBe(429)
    expect(body.error).toMatch(/Too many requests/)
    expect(limited.headers.get('Retry-After')).not.toBeNull()
  })
})
