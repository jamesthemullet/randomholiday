import { describe, it, expect } from 'vitest'
import { createRateLimiter } from '@/lib/rateLimiter'

describe('createRateLimiter', () => {
  it('allows requests under the limit', () => {
    const limiter = createRateLimiter({ limit: 3, windowMs: 1000 })

    expect(limiter.check('a').allowed).toBe(true)
    expect(limiter.check('a').allowed).toBe(true)
    expect(limiter.check('a').allowed).toBe(true)
  })

  it('blocks requests once the limit is reached within the window', () => {
    const limiter = createRateLimiter({ limit: 2, windowMs: 1000 })

    expect(limiter.check('a').allowed).toBe(true)
    expect(limiter.check('a').allowed).toBe(true)

    const blocked = limiter.check('a')
    expect(blocked.allowed).toBe(false)
    expect(blocked.retryAfterMs).toBeGreaterThan(0)
  })

  it('tracks each key independently', () => {
    const limiter = createRateLimiter({ limit: 1, windowMs: 1000 })

    expect(limiter.check('a').allowed).toBe(true)
    expect(limiter.check('b').allowed).toBe(true)
    expect(limiter.check('a').allowed).toBe(false)
  })

  it('resets the count once the window elapses', () => {
    let time = 0
    const limiter = createRateLimiter({ limit: 1, windowMs: 1000, now: () => time })

    expect(limiter.check('a').allowed).toBe(true)
    expect(limiter.check('a').allowed).toBe(false)

    time += 1000
    expect(limiter.check('a').allowed).toBe(true)
  })

  it('reports a decreasing retryAfterMs as the window progresses', () => {
    let time = 0
    const limiter = createRateLimiter({ limit: 1, windowMs: 1000, now: () => time })

    limiter.check('a')
    const first = limiter.check('a')

    time += 400
    const second = limiter.check('a')

    expect(second.retryAfterMs).toBeLessThan(first.retryAfterMs)
  })
})
