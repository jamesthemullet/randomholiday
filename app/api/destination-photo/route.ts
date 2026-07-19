import { NextResponse } from 'next/server'
import {
  getStaticPhotoFallback,
  isUnsplashConfigured,
  parseUnsplashResponse,
} from '@/lib/destinationPhoto'

const UNSPLASH_SEARCH_URL = 'https://api.unsplash.com/search/photos'

export async function GET(request: Request): Promise<NextResponse> {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('query')

  if (!query) {
    return NextResponse.json({ error: 'query is required' }, { status: 400 })
  }

  const accessKey = process.env.UNSPLASH_ACCESS_KEY

  if (!isUnsplashConfigured(accessKey)) {
    return NextResponse.json(getStaticPhotoFallback(query))
  }

  try {
    const response = await fetch(
      `${UNSPLASH_SEARCH_URL}?query=${encodeURIComponent(query)}&per_page=1`,
      { headers: { Authorization: `Client-ID ${accessKey}` } }
    )

    if (!response.ok) {
      return NextResponse.json(getStaticPhotoFallback(query))
    }

    const data = await response.json()
    const photo = parseUnsplashResponse(query, data)

    return NextResponse.json(photo ?? getStaticPhotoFallback(query))
  } catch {
    return NextResponse.json(getStaticPhotoFallback(query))
  }
}
