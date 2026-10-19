import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import sitemap from '@/app/sitemap'
import { pickableDestinations } from '@/lib/catalogue'

describe('sitemap', () => {
  const originalAppUrl = process.env.NEXT_PUBLIC_APP_URL

  beforeEach(() => {
    delete process.env.NEXT_PUBLIC_APP_URL
  })

  afterEach(() => {
    if (originalAppUrl === undefined) {
      delete process.env.NEXT_PUBLIC_APP_URL
    } else {
      process.env.NEXT_PUBLIC_APP_URL = originalAppUrl
    }
  })

  it('lists the static routes and every pickable destination with a lastModified date', () => {
    const result = sitemap()

    expect(result).toHaveLength(2 + pickableDestinations.length)
    result.forEach((entry) => {
      expect(entry.lastModified).toBeInstanceOf(Date)
    })
  })

  it('builds URLs using NEXT_PUBLIC_APP_URL', () => {
    process.env.NEXT_PUBLIC_APP_URL = 'https://randomholiday.example'

    const result = sitemap()

    expect(result.map((entry) => entry.url)).toEqual([
      'https://randomholiday.example',
      'https://randomholiday.example/pricing',
      ...pickableDestinations.map(
        (destination) => `https://randomholiday.example/destination/${destination.id}`
      ),
    ])
  })

  it('falls back to localhost when NEXT_PUBLIC_APP_URL is unset', () => {
    const result = sitemap()

    expect(result.map((entry) => entry.url)).toEqual([
      'http://localhost:3000',
      'http://localhost:3000/pricing',
      ...pickableDestinations.map(
        (destination) => `http://localhost:3000/destination/${destination.id}`
      ),
    ])
  })
})
