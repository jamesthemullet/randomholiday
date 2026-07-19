import { NextResponse } from 'next/server'
import { estimateFlightCostPerPerson } from '@/lib/budgetCalculator'

export async function GET(request: Request): Promise<NextResponse> {
  const { searchParams } = new URL(request.url)
  const distanceKmParam = searchParams.get('distanceKm')

  if (!distanceKmParam) {
    return NextResponse.json({ error: 'distanceKm is required' }, { status: 400 })
  }

  const distanceKm = Number(distanceKmParam)
  if (!Number.isFinite(distanceKm) || distanceKm < 0) {
    return NextResponse.json({ error: 'distanceKm must be a non-negative number' }, { status: 400 })
  }

  return NextResponse.json({
    source: 'static',
    pricePerPerson: estimateFlightCostPerPerson(distanceKm),
    currency: 'USD',
  })
}
