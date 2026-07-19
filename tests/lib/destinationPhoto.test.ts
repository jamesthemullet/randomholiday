import { describe, it, expect } from 'vitest'
import {
  getStaticPhotoFallback,
  isUnsplashConfigured,
  parseUnsplashResponse,
} from '@/lib/destinationPhoto'

describe('isUnsplashConfigured', () => {
  it('returns false when the key is undefined', () => {
    expect(isUnsplashConfigured(undefined)).toBe(false)
  })

  it('returns false when the key is the placeholder value', () => {
    expect(isUnsplashConfigured('your_unsplash_access_key_here')).toBe(false)
  })

  it('returns false when the key is an empty string', () => {
    expect(isUnsplashConfigured('')).toBe(false)
  })

  it('returns true when a real key is set', () => {
    expect(isUnsplashConfigured('abc123')).toBe(true)
  })
})

describe('getStaticPhotoFallback', () => {
  it('returns a static, source-tagged fallback with no url', () => {
    expect(getStaticPhotoFallback('Bali')).toEqual({
      source: 'static',
      url: null,
      alt: 'Bali — photo unavailable',
      photographerName: null,
      photographerUrl: null,
    })
  })
})

describe('parseUnsplashResponse', () => {
  it('returns null when there are no results', () => {
    expect(parseUnsplashResponse('Bali', { results: [] })).toBeNull()
  })

  it('returns null when the first result has no regular url', () => {
    expect(parseUnsplashResponse('Bali', { results: [{ urls: {} }] })).toBeNull()
  })

  it('maps a full Unsplash result to a DestinationPhoto', () => {
    const result = parseUnsplashResponse('Bali', {
      results: [
        {
          urls: { regular: 'https://images.unsplash.com/photo-1' },
          alt_description: 'A rice terrace in Bali',
          user: { name: 'Jane Doe', links: { html: 'https://unsplash.com/@janedoe' } },
        },
      ],
    })

    expect(result).toEqual({
      source: 'unsplash',
      url: 'https://images.unsplash.com/photo-1',
      alt: 'A rice terrace in Bali',
      photographerName: 'Jane Doe',
      photographerUrl: 'https://unsplash.com/@janedoe',
    })
  })

  it('falls back to the query and null attribution when optional fields are missing', () => {
    const result = parseUnsplashResponse('Bali', {
      results: [{ urls: { regular: 'https://images.unsplash.com/photo-2' } }],
    })

    expect(result).toEqual({
      source: 'unsplash',
      url: 'https://images.unsplash.com/photo-2',
      alt: 'Bali',
      photographerName: null,
      photographerUrl: null,
    })
  })
})
