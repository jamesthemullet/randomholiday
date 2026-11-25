import hubsData from './data/hubs.json'
import type { Coordinates } from './types'

/** An IATA airport code used as a one-stop connection hub (ROADMAP.md feature 10). */
export type HubCode = string

export interface Hub {
  name: string
  coordinates: Coordinates
}

/**
 * Hand-seeded coordinates for hubs a connecting route can pass through, keyed by IATA code.
 * See the hub table in ROADMAP.md feature 10 for why each one was picked.
 */
const hubs = hubsData as Record<HubCode, Hub>

/** A hub's coordinates, or `undefined` for a code with no entry in `lib/data/hubs.json`. */
export function getHub(code: HubCode): Hub | undefined {
  return hubs[code]
}
