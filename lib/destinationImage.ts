/** Path to a destination's local photo. Files are optional — add them to /public/destinations. */
export function getDestinationImagePath(destinationId: string): string {
  return `/destinations/${destinationId}.jpg`
}

export const POSTER_THEMES = ['coral', 'turquoise', 'ocean', 'yellow'] as const
export type PosterTheme = (typeof POSTER_THEMES)[number]

/** Stable per-destination colour for the "photos coming soon" poster shown without a photo. */
export function getPosterTheme(destinationId: string): PosterTheme {
  let hash = 0
  for (const ch of destinationId) hash = (hash + ch.charCodeAt(0)) % POSTER_THEMES.length
  return POSTER_THEMES[hash]
}
