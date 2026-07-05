import { NextResponse } from 'next/server'
import { fetchLiveFlightPrice } from '@/lib/amadeus'
import { estimateFlightCostPerPerson } from '@/lib/budgetCalculator'

export async function GET(request: Request): Promise<NextResponse> {
  const { searchParams } = new URL(request.url)
  const originIata = searchParams.get('originIata')
  const destinationIata = searchParams.get('destinationIata')
  const departureDate = searchParams.get('departureDate')
  const distanceKmParam = searchParams.get('distanceKm')
  const adultsParam = searchParams.get('adults')

  if (!originIata || !destinationIata || !departureDate || !distanceKmParam) {
    return NextResponse.json(
      { error: 'originIata, destinationIata, departureDate, and distanceKm are required' },
      { status: 400 }
    )
  }

  const distanceKm = Number(distanceKmParam)
  if (!Number.isFinite(distanceKm) || distanceKm < 0) {
    return NextResponse.json({ error: 'distanceKm must be a non-negative number' }, { status: 400 })
  }

  const adults = adultsParam ? Number(adultsParam) : 1

  const apiKey = process.env.AMADEUS_API_KEY
  const apiSecret = process.env.AMADEUS_API_SECRET

  if (apiKey && apiSecret) {
    try {
      const live = await fetchLiveFlightPrice(
        { originIata, destinationIata, departureDate, adults },
        { apiKey, apiSecret }
      )
      return NextResponse.json({ source: 'live', ...live })
    } catch {
      // Amadeus request failed — fall through to the static estimate below.
    }
  }

  return NextResponse.json({
    source: 'static',
    pricePerPerson: estimateFlightCostPerPerson(distanceKm),
    currency: 'USD',
  })
}
