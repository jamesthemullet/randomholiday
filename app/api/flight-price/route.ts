import { NextResponse } from 'next/server'
import { estimateFlightCostPerPerson } from '@/lib/budgetCalculator'
import { parseNumberParam } from '@/lib/queryParams'
import { createRateLimiter } from '@/lib/rateLimiter'
import { getClientIp } from '@/lib/requestIp'

const rateLimiter = createRateLimiter({ limit: 30, windowMs: 60_000 })

export async function GET(request: Request): Promise<NextResponse> {
  const rateLimit = rateLimiter.check(getClientIp(request))
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: 'Too many requests, please try again shortly' },
      { status: 429, headers: { 'Retry-After': String(Math.ceil(rateLimit.retryAfterMs / 1000)) } }
    )
  }

  const { searchParams } = new URL(request.url)
  const distanceKmParam = searchParams.get('distanceKm')

  if (!distanceKmParam) {
    return NextResponse.json({ error: 'distanceKm is required' }, { status: 400 })
  }

  const distanceKm = parseNumberParam(distanceKmParam)
  if (distanceKm === null || distanceKm < 0) {
    return NextResponse.json({ error: 'distanceKm must be a non-negative number' }, { status: 400 })
  }

  return NextResponse.json({
    source: 'static',
    pricePerPerson: estimateFlightCostPerPerson(distanceKm),
    currency: 'GBP',
  })
}
