import { describe, it, expect } from 'vitest'
import destinationFacts from '@/lib/data/destination-facts.json'
import londonRoutes from '@/lib/data/routes/london.json'
import detailsData from '@/lib/data/destination-details.json'
import {
  buildCatalogue,
  catalogue,
  isPickable,
  joinFactsAndRoutes,
  pickableDestinations,
  type CatalogueEntry,
  type DestinationDetails,
  type DestinationFacts,
  type LondonRoute,
} from '@/lib/catalogue'
import { TRAVEL_STYLES } from '@/lib/types'
import type { Destination } from '@/lib/types'

const CONTINENTS = ['Europe', 'Africa', 'Asia', 'Americas', 'Oceania', 'Middle East']
// The allowed climate labels; add to this list deliberately.
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

const lisbonDetails = (detailsData as Record<string, DestinationDetails>)['lisbon-portugal']
const lisbon: Destination = { ...stub({ id: 'lisbon-portugal', name: 'Lisbon' }), ...lisbonDetails }

// What lib/catalogue.ts builds internally from the two generated files: a destination's shared
// facts joined with its London route, for every destination reachable from London.
const londonRoutesById = new Map(londonRoutes.map((route) => [route.id, route]))
const londonData = destinationFacts.flatMap((facts) => {
  const route = londonRoutesById.get(facts.id)
  return route ? [{ ...facts, london: route }] : []
})

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
  ] as const)('rejects an entry missing %s', (field) => {
    const entry: CatalogueEntry = { ...lisbon, london: route }
    delete entry[field]
    expect(isPickable(entry)).toBe(false)
  })

  it('rejects an entry with no travel styles', () => {
    expect(isPickable({ ...lisbon, london: route, travelStyles: [] })).toBe(false)
  })
})

describe('joinFactsAndRoutes', () => {
  it('joins a fact with its matching route', () => {
    const facts: DestinationFacts[] = [stub()]
    const joined = joinFactsAndRoutes(facts, [{ id: 'faro-portugal', ...route }])
    expect(joined).toEqual([{ ...stub(), london: route }])
  })

  it('drops a fact with no route for this city', () => {
    const facts: DestinationFacts[] = [stub()]
    expect(joinFactsAndRoutes(facts, [])).toEqual([])
  })
})

describe('buildCatalogue', () => {
  it('merges each generated destination with its details', () => {
    const entries = buildCatalogue([stub()], { 'faro-portugal': lisbonDetails })
    expect(entries).toHaveLength(1)
    expect(entries[0]).toMatchObject({ id: 'faro-portugal', name: 'Faro', ...lisbonDetails })
    expect(isPickable(entries[0])).toBe(true)
  })

  it('leaves generated destinations without details unpickable', () => {
    const entries = buildCatalogue([stub()], {})
    expect(isPickable(entries[0])).toBe(false)
  })
})

describe('catalogue', () => {
  it('has exactly one entry per London destination', () => {
    expect(catalogue).toHaveLength(londonData.length)
  })

  it('only includes destinations reachable from London', () => {
    const londonIds = new Set(londonData.map((d) => d.id))
    expect(catalogue.every((d) => londonIds.has(d.id))).toBe(true)
  })

  it('has unique ids', () => {
    const ids = catalogue.map((d) => d.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('only recommends complete destinations', () => {
    const pickable: Destination[] = pickableDestinations
    expect(pickable.every((d) => isPickable({ ...d, london: route }))).toBe(true)
  })

  it('recommends exactly the detailed generated destinations', () => {
    const detailed = Object.keys(detailsData).filter((id) => {
      const entry = catalogue.find((d) => d.id === id)
      return entry !== undefined && isPickable(entry)
    })
    expect(pickableDestinations.map((d) => d.id).sort()).toEqual(detailed.sort())
  })
})

describe('destination details data', () => {
  const generatedIds = new Set(londonData.map((d) => d.id))
  const details = detailsData as Record<string, Partial<DestinationDetails>>
  const entries = Object.entries(details)

  it('only has details for generated destinations', () => {
    entries.forEach(([id]) => expect(generatedIds.has(id)).toBe(true))
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
    })
  })
})
