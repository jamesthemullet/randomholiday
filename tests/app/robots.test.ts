import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import robots from '@/app/robots'

describe('robots', () => {
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

  it('allows all user agents on all paths', () => {
    const result = robots()

    expect(result.rules).toEqual({ userAgent: '*', allow: '/' })
  })

  it('points to the sitemap using NEXT_PUBLIC_APP_URL', () => {
    process.env.NEXT_PUBLIC_APP_URL = 'https://randomholiday.example'

    const result = robots()

    expect(result.sitemap).toBe('https://randomholiday.example/sitemap.xml')
  })

  it('falls back to localhost when NEXT_PUBLIC_APP_URL is unset', () => {
    const result = robots()

    expect(result.sitemap).toBe('http://localhost:3000/sitemap.xml')
  })
})
