import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import sitemap from '@/app/sitemap'

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

  it('lists the static routes with a lastModified date', () => {
    const result = sitemap()

    expect(result).toHaveLength(3)
    result.forEach((entry) => {
      expect(entry.lastModified).toBeInstanceOf(Date)
    })
  })

  it('builds URLs using NEXT_PUBLIC_APP_URL', () => {
    process.env.NEXT_PUBLIC_APP_URL = 'https://randomholiday.example'

    const result = sitemap()

    expect(result.map((entry) => entry.url)).toEqual([
      'https://randomholiday.example',
      'https://randomholiday.example/discover',
      'https://randomholiday.example/pricing',
    ])
  })

  it('falls back to localhost when NEXT_PUBLIC_APP_URL is unset', () => {
    const result = sitemap()

    expect(result.map((entry) => entry.url)).toEqual([
      'http://localhost:3000',
      'http://localhost:3000/discover',
      'http://localhost:3000/pricing',
    ])
  })
})
