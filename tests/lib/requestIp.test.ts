import { describe, it, expect } from 'vitest'
import { getClientIp } from '@/lib/requestIp'

describe('getClientIp', () => {
  it('prefers cf-connecting-ip over x-forwarded-for', () => {
    const request = new Request('http://localhost/', {
      headers: {
        'cf-connecting-ip': '203.0.113.9',
        'x-forwarded-for': '198.51.100.1, 10.0.0.1',
      },
    })

    expect(getClientIp(request)).toBe('203.0.113.9')
  })

  it('trims whitespace around cf-connecting-ip', () => {
    const request = new Request('http://localhost/', {
      headers: { 'cf-connecting-ip': '  203.0.113.9  ' },
    })

    expect(getClientIp(request)).toBe('203.0.113.9')
  })

  it('returns the first address from x-forwarded-for', () => {
    const request = new Request('http://localhost/', {
      headers: { 'x-forwarded-for': '203.0.113.1, 10.0.0.1' },
    })

    expect(getClientIp(request)).toBe('203.0.113.1')
  })

  it('trims whitespace around the first address', () => {
    const request = new Request('http://localhost/', {
      headers: { 'x-forwarded-for': '  203.0.113.1  , 10.0.0.1' },
    })

    expect(getClientIp(request)).toBe('203.0.113.1')
  })

  it('falls back to x-real-ip when x-forwarded-for has no usable address', () => {
    const request = new Request('http://localhost/', {
      headers: { 'x-forwarded-for': ' , 10.0.0.1', 'x-real-ip': '198.51.100.7' },
    })

    expect(getClientIp(request)).toBe('198.51.100.7')
  })

  it('falls back to x-real-ip when x-forwarded-for is absent', () => {
    const request = new Request('http://localhost/', {
      headers: { 'x-real-ip': '198.51.100.7' },
    })

    expect(getClientIp(request)).toBe('198.51.100.7')
  })

  it('falls back to "unknown" when no IP header is present', () => {
    const request = new Request('http://localhost/')

    expect(getClientIp(request)).toBe('unknown')
  })
})
