import { NextResponse } from 'next/server'

export interface RateLimitResult {
  allowed: boolean
  retryAfterMs: number
}

/** Standard 429 JSON response for a blocked `RateLimitResult`. */
export function rateLimitedResponse(result: RateLimitResult): NextResponse {
  return NextResponse.json(
    { error: 'Too many requests, please try again shortly' },
    { status: 429, headers: { 'Retry-After': String(Math.ceil(result.retryAfterMs / 1000)) } }
  )
}

export interface RateLimiter {
  check: (key: string) => RateLimitResult
  /** Number of keys currently tracked; exposed so tests can assert expired windows are pruned. */
  size: () => number
}

export interface RateLimiterOptions {
  limit: number
  windowMs: number
  now?: () => number
}

interface Window {
  count: number
  windowStart: number
}

/**
 * Fixed-window counter: pure and dependency-free so it can run in any
 * Next.js API route (or be swapped for a shared store later). State is
 * per-instance and in-memory, so it resets per server process/region —
 * fine for basic abuse protection, not for exact multi-instance limits.
 */
export function createRateLimiter({
  limit,
  windowMs,
  now = Date.now,
}: RateLimiterOptions): RateLimiter {
  const windows = new Map<string, Window>()

  function pruneExpired(timestamp: number) {
    for (const [key, entry] of windows) {
      if (timestamp - entry.windowStart >= windowMs) {
        windows.delete(key)
      }
    }
  }

  return {
    check(key: string): RateLimitResult {
      const timestamp = now()
      pruneExpired(timestamp)
      const entry = windows.get(key)

      if (!entry || timestamp - entry.windowStart >= windowMs) {
        windows.set(key, { count: 1, windowStart: timestamp })
        return { allowed: true, retryAfterMs: 0 }
      }

      if (entry.count < limit) {
        entry.count += 1
        return { allowed: true, retryAfterMs: 0 }
      }

      return { allowed: false, retryAfterMs: entry.windowStart + windowMs - timestamp }
    },
    size() {
      return windows.size
    },
  }
}
