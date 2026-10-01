import { NextResponse } from 'next/server'
import { getSeasonalWeatherEstimate } from '@/lib/seasonalWeather'

interface OpenWeatherResponse {
  main?: { temp?: number }
  weather?: { description?: string }[]
}

const LIVE_WEATHER_TIMEOUT_MS = 5000

function parseNumberParam(value: string | null): number | null {
  if (value === null) return null
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

export async function GET(request: Request): Promise<NextResponse> {
  const { searchParams } = new URL(request.url)
  const lat = parseNumberParam(searchParams.get('lat'))
  const lng = parseNumberParam(searchParams.get('lng'))
  const climate = searchParams.get('climate')
  const month = parseNumberParam(searchParams.get('month'))

  if (lat === null || lat < -90 || lat > 90) {
    return NextResponse.json({ error: 'lat must be a number between -90 and 90' }, { status: 400 })
  }
  if (lng === null || lng < -180 || lng > 180) {
    return NextResponse.json(
      { error: 'lng must be a number between -180 and 180' },
      { status: 400 }
    )
  }
  if (!climate) {
    return NextResponse.json({ error: 'climate is required' }, { status: 400 })
  }
  if (month === null || !Number.isInteger(month) || month < 1 || month > 12) {
    return NextResponse.json(
      { error: 'month must be an integer between 1 and 12' },
      { status: 400 }
    )
  }

  const apiKey = process.env.OPENWEATHER_API_KEY
  if (apiKey) {
    const live = await fetchLiveWeather(lat, lng, apiKey)
    if (live) return NextResponse.json(live)
  }

  const estimate = getSeasonalWeatherEstimate(climate, month, lat)
  return NextResponse.json({
    source: 'static',
    avgHighC: estimate.avgHighC,
    description: estimate.description,
  })
}

async function fetchLiveWeather(
  lat: number,
  lng: number,
  apiKey: string
): Promise<{ source: 'live'; tempC: number; description: string } | null> {
  try {
    // This URL embeds OPENWEATHER_API_KEY in the query string: never log it or the
    // raw response body below, on success or failure — only response.status is safe to log.
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&units=metric&appid=${apiKey}`,
      { signal: AbortSignal.timeout(LIVE_WEATHER_TIMEOUT_MS) }
    )
    if (!response.ok) return null

    const data = (await response.json()) as OpenWeatherResponse
    const tempC = data.main?.temp
    const description = data.weather?.[0]?.description

    if (typeof tempC !== 'number' || typeof description !== 'string') return null

    return { source: 'live', tempC, description }
  } catch {
    return null
  }
}
