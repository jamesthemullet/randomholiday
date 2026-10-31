import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { getAppUrl } from '@/lib/appUrl'

describe('getAppUrl', () => {
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

  it('returns NEXT_PUBLIC_APP_URL when set', () => {
    process.env.NEXT_PUBLIC_APP_URL = 'https://randomholiday.example'

    expect(getAppUrl()).toBe('https://randomholiday.example')
  })

  it('falls back to localhost when NEXT_PUBLIC_APP_URL is unset', () => {
    expect(getAppUrl()).toBe('http://localhost:3000')
  })
})
