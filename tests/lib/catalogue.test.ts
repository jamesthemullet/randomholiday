import { describe, it, expect } from 'vitest'
import londonData from '@/lib/data/london-destinations.json'
import detailsData from '@/lib/data/destination-details.json'
import {
  buildCatalogue,
  catalogue,
  HAND_WRITTEN_ALIASES,
  isPickable,
  pickableDestinations,
  type CatalogueEntry,
  type DestinationDetails,
  type DestinationFacts,
  type LondonRoute,
} from '@/lib/catalogue'
import { destinations, TRAVEL_STYLES } from '@/lib/destinations'
import type { Destination } from '@/lib/destinations'

const CONTINENTS = ['Europe', 'Africa', 'Asia', 'Americas', 'Oceania', 'Middle East']
// The climate labels already used in lib/destinations.ts; add to this list deliberately.
const CLIMATES = [
  'cold desert',
  'continental',
  'hot desert',
  'humid continental',
  'humid subtropical',
  'mediterranean',
  'oceanic',
  'semi-arid',
  'subarctic',
  'subtropical highland',
  'subtropical',
  'temperate',
  'tropical',
]
const LONDON_AIRPORTS = ['LHR', 'LGW', 'STN', 'LTN', 'LCY', 'SEN']

const route: LondonRoute = {
  direct: true,
  airports: ['LHR'],
  airlines: ['BA'],
  seasonalOnly: false,
}

function stub(
  overrides: Partial<DestinationFacts> = {}
): DestinationFacts & { london: LondonRoute } {
  return {
    id: 'faro-portugal',
    name: 'Faro',
    country: 'Portugal',
    countryCode: 'PT',
    coordinates: { lat: 37.0144, lng: -7.9659 },
    continent: 'Europe',
    currency: 'EUR',
    london: route,
    ...overrides,
  }
}

const lisbon = destinations.find((d) => d.id === 'lisbon-portugal')!
const lisbonDetails: DestinationDetails = {
  description: lisbon.description,
  climate: lisbon.climate,
  travelStyles: lisbon.travelStyles,
  bestMonths: lisbon.bestMonths,
  estimatedCosts: lisbon.estimatedCosts,
  activities: lisbon.activities,
  visa: lisbon.visa,
}

describe('generated London destination data', () => {
  it('has unique ids', () => {
    const ids = londonData.map((d) => d.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it.each(londonData.map((d) => [d.id, d] as const))('%s has valid facts', (_, d) => {
    expect(d.name.length).toBeGreaterThan(0)
    expect(d.countryCode).toMatch(/^[A-Z]{2}$/)
    expect(d.currency).toMatch(/^[A-Z]{3}$/)
    expect(CONTINENTS).toContain(d.continent)
    expect(Math.abs(d.coordinates.lat)).toBeLessThanOrEqual(90)
    expect(Math.abs(d.coordinates.lng)).toBeLessThanOrEqual(180)
    expect(d.london.direct).toBe(true)
    expect(d.london.airports.length).toBeGreaterThan(0)
    d.london.airports.forEach((airport) => expect(LONDON_AIRPORTS).toContain(airport))
  })

  it('points every hand-written alias at a generated destination', () => {
    const ids = new Set(londonData.map((d) => d.id))
    Object.values(HAND_WRITTEN_ALIASES).forEach((id) => expect(ids).toContain(id))
  })
})

describe('isPickable', () => {
  it('accepts a destination with every detail', () => {
    expect(isPickable({ ...lisbon, london: route })).toBe(true)
  })

  it('rejects a generated destination with no details', () => {
    expect(isPickable(stub())).toBe(false)
  })

  it.each([
    'estimatedCosts',
    'travelStyles',
    'bestMonths',
    'description',
    'climate',
    'activities',
    'visa',
  ] as const)('rejects an entry missing %s', (field) => {
    const entry: CatalogueEntry = { ...lisbon, london: route }
    delete entry[field]
    expect(isPickable(entry)).toBe(false)
  })

  it('rejects an entry with no travel styles', () => {
    expect(isPickable({ ...lisbon, london: route, travelStyles: [] })).toBe(false)
  })
})

describe('buildCatalogue', () => {
  it('attaches the London route to a hand-written destination with the same id', () => {
    const [entry] = buildCatalogue([lisbon], [stub({ id: 'lisbon-portugal' })], {})
    expect(entry).toMatchObject({
      id: 'lisbon-portugal',
      description: lisbon.description,
      london: route,
    })
  })

  it('matches a hand-written destination through an alias and drops the duplicate', () => {
    const entries = buildCatalogue(
      [lisbon],
      [stub({ id: 'lisboa-portugal' })],
      {},
      {
        'lisbon-portugal': 'lisboa-portugal',
      }
    )
    expect(entries).toHaveLength(1)
    expect(entries[0].london).toEqual(route)
  })

  it('marks an unmatched hand-written destination as needing a connection', () => {
    const [entry] = buildCatalogue([lisbon], [], {})
    expect(entry.london).toEqual({ direct: false, airports: [], airlines: [], seasonalOnly: false })
  })

  it('adds unmatched generated destinations, merged with any details', () => {
    const entries = buildCatalogue([], [stub()], { 'faro-portugal': lisbonDetails })
    expect(entries).toHaveLength(1)
    expect(entries[0]).toMatchObject({ id: 'faro-portugal', name: 'Faro', ...lisbonDetails })
    expect(isPickable(entries[0])).toBe(true)
  })

  it('leaves generated destinations without details unpickable', () => {
    const entries = buildCatalogue([], [stub()], {})
    expect(isPickable(entries[0])).toBe(false)
  })
})

describe('catalogue', () => {
  it('includes every hand-written destination and every unmatched London destination', () => {
    const matched = new Set(
      destinations
        .map((d) => HAND_WRITTEN_ALIASES[d.id] ?? d.id)
        .filter((id) => londonData.some((l) => l.id === id))
    )
    expect(catalogue).toHaveLength(destinations.length + londonData.length - matched.size)
  })

  it('has unique ids', () => {
    const ids = catalogue.map((d) => d.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('only recommends complete destinations', () => {
    const pickable: Destination[] = pickableDestinations
    expect(pickable.every((d) => isPickable({ ...d, london: route }))).toBe(true)
  })

  it('recommends every hand-written destination and every generated one with full details', () => {
    const detailed = Object.keys(detailsData).filter((id) => {
      const entry = catalogue.find((d) => d.id === id)
      return entry !== undefined && isPickable(entry)
    })
    expect(pickableDestinations.map((d) => d.id).sort()).toEqual(
      [...destinations.map((d) => d.id), ...detailed].sort()
    )
  })
})

describe('destination details data', () => {
  const generatedIds = new Set(londonData.map((d) => d.id))
  const matchedIds = new Set(Object.values(HAND_WRITTEN_ALIASES))
  const details = detailsData as Record<string, Partial<DestinationDetails>>
  const entries = Object.entries(details)

  it('only has details for generated destinations without a hand-written match', () => {
    // Hand-written destinations keep their details in lib/destinations.ts, not here.
    entries.forEach(([id]) => {
      expect(generatedIds.has(id)).toBe(true)
      expect(matchedIds.has(id)).toBe(false)
      expect(destinations.some((d) => d.id === id)).toBe(false)
    })
  })

  it('has a valid, complete entry for every destination', () => {
    entries.forEach(([, entry]) => {
      expect(entry.description?.length).toBeGreaterThan(20)
      expect(CLIMATES).toContain(entry.climate)
      expect(entry.travelStyles?.length).toBeGreaterThan(0)
      entry.travelStyles?.forEach((style) => expect(TRAVEL_STYLES).toContain(style))
      expect(new Set(entry.travelStyles).size).toBe(entry.travelStyles?.length)
      expect(entry.bestMonths?.length).toBeGreaterThan(0)
      entry.bestMonths?.forEach((month) => {
        expect(Number.isInteger(month)).toBe(true)
        expect(month).toBeGreaterThanOrEqual(1)
        expect(month).toBeLessThanOrEqual(12)
      })
      expect(entry.estimatedCosts?.flightFromEurope).toBeGreaterThan(0)
      expect(entry.estimatedCosts?.hotelPerNight).toBeGreaterThan(0)
      expect(entry.estimatedCosts?.dailySpending).toBeGreaterThan(0)
      expect(entry.activities?.length).toBeGreaterThanOrEqual(3)
      expect(['free', 'on-arrival', 'required']).toContain(entry.visa)
    })
  })
})
