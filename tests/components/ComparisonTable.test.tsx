import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ComparisonTable } from '@/components/ComparisonTable'
import type { ComparisonEntry } from '@/components/ComparisonTable'
import type { DestinationScore } from '@/lib/scoringEngine'
import type { Destination } from '@/lib/types'

vi.mock('@/lib/travelAdvisory', () => ({
  getSafetyStatus: vi.fn((id: string) => (id === 'tel-aviv-israel' ? 'warn' : 'ok')),
  getFcdoUrl: vi.fn(() => 'https://www.gov.uk/foreign-travel-advice/israel'),
}))

function makeDestination(overrides: Partial<Destination> = {}): Destination {
  return {
    id: 'bali-indonesia',
    name: 'Bali',
    country: 'Indonesia',
    countryCode: 'ID',
    coordinates: { lat: -8.3405, lng: 115.092 },
    continent: 'Asia',
    description: 'A lush island paradise.',
    climate: 'tropical',
    travelStyles: ['beach', 'adventure'],
    bestMonths: [4, 5, 6],
    estimatedCosts: { flightFromEurope: 600, hotelPerNight: 60, dailySpending: 40 },
    activities: ['Surfing', 'Temple hopping'],
    currency: 'IDR',
    ...overrides,
  }
}

function makeScore(overrides: Partial<DestinationScore> = {}): DestinationScore {
  return {
    destination: makeDestination(),
    totalScore: 87.4,
    styleScore: 1,
    seasonScore: 1,
    budgetScore: 0.8,
    flightTimeScore: 0.6,
    ...overrides,
  }
}

function makeEntry(overrides: Partial<ComparisonEntry> = {}): ComparisonEntry {
  return {
    recommendation: makeScore(),
    distanceKm: 11000,
    perPersonCost: 1240,
    weather: { avgHighC: 30, description: 'hot' },
    ...overrides,
  }
}

describe('ComparisonTable', () => {
  it('renders a column per destination with name and country', () => {
    const entries = [
      makeEntry({
        recommendation: makeScore({
          destination: makeDestination({ id: 'bali-indonesia', name: 'Bali', country: 'Indonesia' }),
        }),
      }),
      makeEntry({
        recommendation: makeScore({
          destination: makeDestination({ id: 'kyoto-japan', name: 'Kyoto', country: 'Japan' }),
        }),
      }),
    ]

    render(<ComparisonTable entries={entries} originName="London" />)

    expect(screen.getByRole('link', { name: 'Bali' })).toHaveAttribute(
      'href',
      '/destination/bali-indonesia'
    )
    expect(screen.getByRole('link', { name: 'Kyoto' })).toHaveAttribute(
      'href',
      '/destination/kyoto-japan'
    )
    expect(screen.getByText('Indonesia')).toBeInTheDocument()
    expect(screen.getByText('Japan')).toBeInTheDocument()
  })

  it('shows match score, flight time, cost and weather per destination', () => {
    const entries = [
      makeEntry({
        recommendation: makeScore({ totalScore: 92 }),
        distanceKm: 800,
        perPersonCost: 450,
        weather: { avgHighC: 22, description: 'mild' },
      }),
    ]

    render(<ComparisonTable entries={entries} />)

    expect(screen.getByText('92%')).toBeInTheDocument()
    expect(screen.getByText('£450')).toBeInTheDocument()
    expect(screen.getByText('22°C, mild')).toBeInTheDocument()
  })

  it('links a travel-advisory warning to the FCDO page and shows "None" otherwise', () => {
    const entries = [
      makeEntry({
        recommendation: makeScore({
          destination: makeDestination({ id: 'tel-aviv-israel', name: 'Tel Aviv', country: 'Israel' }),
        }),
      }),
      makeEntry({
        recommendation: makeScore({
          destination: makeDestination({ id: 'bali-indonesia', name: 'Bali', country: 'Indonesia' }),
        }),
      }),
    ]

    render(<ComparisonTable entries={entries} />)

    expect(screen.getByRole('link', { name: 'Check FCDO advice' })).toHaveAttribute(
      'href',
      'https://www.gov.uk/foreign-travel-advice/israel'
    )
    expect(screen.getByText('None')).toBeInTheDocument()
  })

  it('includes the origin name in the table caption for screen readers', () => {
    render(<ComparisonTable entries={[makeEntry()]} originName="Manchester" />)

    expect(screen.getByText('Comparing 1 destinations from Manchester')).toBeInTheDocument()
  })
})
