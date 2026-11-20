import photoIds from './data/destination-photos.json'
import { catalogue, type CatalogueEntry } from './catalogue'
import { getDestinationImagePath } from './destinationImage'

export interface HeroPhoto {
  src: string
  /** e.g. "Santorini, Greece" — used for both the alt text and the on-image caption. */
  label: string
}

const DAY_MS = 24 * 60 * 60 * 1000

/** "Santorini, Greece", or just "Jersey" when the place and country share a name. */
export function formatPlace(entry: Pick<CatalogueEntry, 'name' | 'country'>): string {
  return entry.name === entry.country ? entry.name : `${entry.name}, ${entry.country}`
}

/** Days since 1970-01-01 as the calendar date in the UK, so the hero changes at UK midnight. */
export function ukDayNumber(date: Date): number {
  const ukDate = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/London',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date)
  return Math.round(Date.parse(`${ukDate}T00:00:00Z`) / DAY_MS)
}

/** A fixed shuffle, so consecutive days jump around the map instead of going alphabetically. */
function shuffle<T>(items: T[]): T[] {
  const result = [...items]
  let seed = 0x9e3779b9
  for (let i = result.length - 1; i > 0; i--) {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0
    const j = seed % (i + 1)
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

/**
 * Builds the daily hero picker for the destinations that have a photo. Only route-data
 * destinations are used, and each one shows once before any repeats.
 */
export function createHeroPicker(
  entries: Pick<CatalogueEntry, 'id' | 'name' | 'country'>[],
  withPhotos: string[]
): (date: Date) => HeroPhoto {
  const photos = new Set(withPhotos)
  const rotation = shuffle(entries.filter((entry) => photos.has(entry.id)))
  if (rotation.length === 0) throw new Error('No destination photos found for the homepage hero')

  return (date) => {
    const day = ukDayNumber(date)
    const entry = rotation[((day % rotation.length) + rotation.length) % rotation.length]
    return { src: getDestinationImagePath(entry.id), label: formatPlace(entry) }
  }
}

/** Today's homepage hero photo. */
export const getHeroPhoto = createHeroPicker(catalogue, photoIds)
