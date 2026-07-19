import { describe, it, expect, afterEach, vi } from 'vitest'
import { GET } from '@/app/api/destination-photo/route'

const BASE_URL = 'http://localhost/api/destination-photo'

afterEach(() => {
  vi.unstubAllEnvs()
  vi.unstubAllGlobals()
})

describe('GET /api/destination-photo', () => {
  it('returns 400 when query is missing', async () => {
    const request = new Request(BASE_URL)

    const response = await GET(request)
    const body = await response.json()

    expect(response.status).toBe(400)
    expect(body.error).toMatch(/query/)
  })

  it('returns a static fallback when Unsplash is not configured', async () => {
    vi.stubEnv('UNSPLASH_ACCESS_KEY', 'your_unsplash_access_key_here')
    const request = new Request(`${BASE_URL}?query=Bali`)

    const response = await GET(request)
    const body = await response.json()

    expect(body).toEqual({
      source: 'static',
      url: null,
      alt: 'Bali — photo unavailable',
      photographerName: null,
      photographerUrl: null,
    })
  })

  it('returns an Unsplash photo when the API call succeeds', async () => {
    vi.stubEnv('UNSPLASH_ACCESS_KEY', 'real-key')
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        results: [
          {
            urls: { regular: 'https://images.unsplash.com/photo-1' },
            alt_description: 'A beach in Bali',
            user: { name: 'Jane Doe', links: { html: 'https://unsplash.com/@janedoe' } },
          },
        ],
      }),
    })
    vi.stubGlobal('fetch', fetchMock)

    const request = new Request(`${BASE_URL}?query=Bali`)
    const response = await GET(request)
    const body = await response.json()

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('https://api.unsplash.com/search/photos?query=Bali'),
      { headers: { Authorization: 'Client-ID real-key' } }
    )
    expect(body).toEqual({
      source: 'unsplash',
      url: 'https://images.unsplash.com/photo-1',
      alt: 'A beach in Bali',
      photographerName: 'Jane Doe',
      photographerUrl: 'https://unsplash.com/@janedoe',
    })
  })

  it('falls back to static when the Unsplash response is not ok', async () => {
    vi.stubEnv('UNSPLASH_ACCESS_KEY', 'real-key')
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false }))

    const request = new Request(`${BASE_URL}?query=Bali`)
    const response = await GET(request)
    const body = await response.json()

    expect(body.source).toBe('static')
  })

  it('falls back to static when the Unsplash response has no usable results', async () => {
    vi.stubEnv('UNSPLASH_ACCESS_KEY', 'real-key')
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: true, json: async () => ({ results: [] }) })
    )

    const request = new Request(`${BASE_URL}?query=Bali`)
    const response = await GET(request)
    const body = await response.json()

    expect(body.source).toBe('static')
  })

  it('falls back to static when the fetch call throws', async () => {
    vi.stubEnv('UNSPLASH_ACCESS_KEY', 'real-key')
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network error')))

    const request = new Request(`${BASE_URL}?query=Bali`)
    const response = await GET(request)
    const body = await response.json()

    expect(body.source).toBe('static')
  })
})
