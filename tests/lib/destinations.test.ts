import { describe, it, expect } from 'vitest'
import {
  destinations,
  DESTINATION_COUNT,
  TRAVEL_STYLES,
  CONTINENTS,
  type Destination,
  type TravelStyle,
  type Continent,
  type VisaRequirement,
} from '@/lib/destinations'

describe('destinations database', () => {
  describe('DESTINATION_COUNT', () => {
    it('matches the actual number of destinations', () => {
      expect(DESTINATION_COUNT).toBe(destinations.length)
    })

    it('has at least 50 destinations', () => {
      expect(DESTINATION_COUNT).toBeGreaterThanOrEqual(50)
    })
  })

  describe('TRAVEL_STYLES', () => {
    it('contains all four travel styles', () => {
      expect(TRAVEL_STYLES).toHaveLength(4)
      expect(TRAVEL_STYLES).toContain('beach')
      expect(TRAVEL_STYLES).toContain('city')
      expect(TRAVEL_STYLES).toContain('adventure')
      expect(TRAVEL_STYLES).toContain('culture')
    })
  })

  describe('CONTINENTS', () => {
    it('contains all six continents', () => {
      expect(CONTINENTS).toHaveLength(6)
      expect(CONTINENTS).toContain('Europe')
      expect(CONTINENTS).toContain('Africa')
      expect(CONTINENTS).toContain('Asia')
      expect(CONTINENTS).toContain('Americas')
      expect(CONTINENTS).toContain('Oceania')
      expect(CONTINENTS).toContain('Middle East')
    })
  })

  describe('each destination', () => {
    const VALID_TRAVEL_STYLES = new Set<TravelStyle>(['beach', 'city', 'adventure', 'culture'])
    const VALID_CONTINENTS = new Set<Continent>([
      'Europe',
      'Africa',
      'Asia',
      'Americas',
      'Oceania',
      'Middle East',
    ])
    const VALID_VISA: VisaRequirement[] = ['free', 'on-arrival', 'required']

    it('has unique ids', () => {
      const ids = destinations.map((d) => d.id)
      const uniqueIds = new Set(ids)
      expect(uniqueIds.size).toBe(ids.length)
    })

    destinations.forEach((destination: Destination) => {
      describe(`${destination.name} (${destination.country})`, () => {
        it('has a non-empty id', () => {
          expect(destination.id).toBeTruthy()
          expect(typeof destination.id).toBe('string')
        })

        it('has a non-empty name', () => {
          expect(destination.name).toBeTruthy()
          expect(typeof destination.name).toBe('string')
        })

        it('has a non-empty country', () => {
          expect(destination.country).toBeTruthy()
          expect(typeof destination.country).toBe('string')
        })

        it('has a valid 2-letter ISO countryCode', () => {
          expect(destination.countryCode).toMatch(/^[A-Z]{2}$/)
        })

        it('has valid coordinates', () => {
          const { lat, lng } = destination.coordinates
          expect(lat).toBeGreaterThanOrEqual(-90)
          expect(lat).toBeLessThanOrEqual(90)
          expect(lng).toBeGreaterThanOrEqual(-180)
          expect(lng).toBeLessThanOrEqual(180)
        })

        it('has a valid continent', () => {
          expect(VALID_CONTINENTS.has(destination.continent)).toBe(true)
        })

        it('has a non-empty description', () => {
          expect(destination.description).toBeTruthy()
          expect(typeof destination.description).toBe('string')
          expect(destination.description.length).toBeGreaterThan(20)
        })

        it('has a non-empty climate', () => {
          expect(destination.climate).toBeTruthy()
          expect(typeof destination.climate).toBe('string')
        })

        it('has at least one valid travel style', () => {
          expect(destination.travelStyles.length).toBeGreaterThanOrEqual(1)
          destination.travelStyles.forEach((style) => {
            expect(VALID_TRAVEL_STYLES.has(style)).toBe(true)
          })
        })

        it('has at least one best month between 1 and 12', () => {
          expect(destination.bestMonths.length).toBeGreaterThanOrEqual(1)
          destination.bestMonths.forEach((month) => {
            expect(month).toBeGreaterThanOrEqual(1)
            expect(month).toBeLessThanOrEqual(12)
          })
        })

        it('has positive estimated costs', () => {
          const { flightFromEurope, hotelPerNight, dailySpending } = destination.estimatedCosts
          expect(flightFromEurope).toBeGreaterThan(0)
          expect(hotelPerNight).toBeGreaterThan(0)
          expect(dailySpending).toBeGreaterThan(0)
        })

        it('has at least one activity', () => {
          expect(destination.activities.length).toBeGreaterThanOrEqual(1)
          destination.activities.forEach((activity) => {
            expect(typeof activity).toBe('string')
            expect(activity.length).toBeGreaterThan(0)
          })
        })

        it('has a non-empty currency', () => {
          expect(destination.currency).toBeTruthy()
          expect(typeof destination.currency).toBe('string')
        })

        it('has a valid visa requirement', () => {
          expect(VALID_VISA).toContain(destination.visa)
        })
      })
    })
  })

  describe('geographic coverage', () => {
    it('has destinations on every continent', () => {
      const coveredContinents = new Set(destinations.map((d) => d.continent))
      CONTINENTS.forEach((continent) => {
        expect(coveredContinents.has(continent)).toBe(true)
      })
    })

    it('has at least one beach destination', () => {
      const beachDests = destinations.filter((d) => d.travelStyles.includes('beach'))
      expect(beachDests.length).toBeGreaterThan(0)
    })

    it('has at least one city destination', () => {
      const cityDests = destinations.filter((d) => d.travelStyles.includes('city'))
      expect(cityDests.length).toBeGreaterThan(0)
    })

    it('has at least one adventure destination', () => {
      const adventureDests = destinations.filter((d) => d.travelStyles.includes('adventure'))
      expect(adventureDests.length).toBeGreaterThan(0)
    })

    it('has at least one culture destination', () => {
      const cultureDests = destinations.filter((d) => d.travelStyles.includes('culture'))
      expect(cultureDests.length).toBeGreaterThan(0)
    })
  })

  describe('budget range', () => {
    it('has budget-friendly destinations (flight under $300)', () => {
      const budget = destinations.filter((d) => d.estimatedCosts.flightFromEurope < 300)
      expect(budget.length).toBeGreaterThan(0)
    })

    it('has premium destinations (flight over $600)', () => {
      const premium = destinations.filter((d) => d.estimatedCosts.flightFromEurope >= 600)
      expect(premium.length).toBeGreaterThan(0)
    })
  })
})
