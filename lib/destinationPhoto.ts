export type DestinationPhoto = {
  source: 'unsplash' | 'static'
  url: string | null
  alt: string
  photographerName: string | null
  photographerUrl: string | null
}

type UnsplashSearchResult = {
  results: Array<{
    urls?: { regular?: string }
    alt_description?: string | null
    user?: { name?: string; links?: { html?: string } }
  }>
}

const PLACEHOLDER_KEY_VALUE = 'your_unsplash_access_key_here'

export function isUnsplashConfigured(accessKey: string | undefined): boolean {
  return Boolean(accessKey) && accessKey !== PLACEHOLDER_KEY_VALUE
}

export function getStaticPhotoFallback(query: string): DestinationPhoto {
  return {
    source: 'static',
    url: null,
    alt: `${query} — photo unavailable`,
    photographerName: null,
    photographerUrl: null,
  }
}

export function parseUnsplashResponse(
  query: string,
  data: UnsplashSearchResult
): DestinationPhoto | null {
  const firstResult = data.results?.[0]
  const url = firstResult?.urls?.regular

  if (!firstResult || !url) {
    return null
  }

  return {
    source: 'unsplash',
    url,
    alt: firstResult.alt_description ?? query,
    photographerName: firstResult.user?.name ?? null,
    photographerUrl: firstResult.user?.links?.html ?? null,
  }
}
