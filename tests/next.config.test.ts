import { describe, it, expect } from 'vitest'
import nextConfig from '../next.config.mjs'

describe('next.config redirects', () => {
  it('permanently redirects the retired /discover page to the homepage form', async () => {
    if (!nextConfig.redirects) throw new Error('nextConfig.redirects is not defined')
    const rules = await nextConfig.redirects()

    expect(rules).toEqual([{ source: '/discover', destination: '/', permanent: true }])
  })
})

describe('next.config headers', () => {
  it('applies baseline security headers to every route', async () => {
    if (!nextConfig.headers) throw new Error('nextConfig.headers is not defined')
    const rules = await nextConfig.headers()

    expect(rules).toHaveLength(1)
    expect(rules[0].source).toBe('/:path*')

    const headerMap = Object.fromEntries(rules[0].headers.map(({ key, value }) => [key, value]))

    expect(headerMap['X-Content-Type-Options']).toBe('nosniff')
    expect(headerMap['X-Frame-Options']).toBe('DENY')
    expect(headerMap['Referrer-Policy']).toBe('strict-origin-when-cross-origin')
    expect(headerMap['Permissions-Policy']).toBe('camera=(), microphone=(), geolocation=()')
    expect(headerMap['Strict-Transport-Security']).toBe(
      'max-age=63072000; includeSubDomains; preload'
    )
  })
})
