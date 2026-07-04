import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ResultsReveal } from '@/components/ResultsReveal'
import type { DestinationScore } from '@/lib/scoringEngine'
import type { Destination } from '@/lib/destinations'

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
    visa: 'on-arrival',
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
    distanceScore: 0.6,
    ...overrides,
  }
}

describe('ResultsReveal', () => {
  it('renders a heading for the match', () => {
    render(<ResultsReveal recommendation={makeScore()} onShuffle={vi.fn()} />)
    expect(screen.getByRole('heading', { name: 'Your Match' })).toBeInTheDocument()
  })

  it('renders a DestinationCard for the recommendation', () => {
    render(<ResultsReveal recommendation={makeScore()} onShuffle={vi.fn()} />)
    expect(screen.getAllByText('Bali').length).toBeGreaterThan(0)
  })

  it('renders a rounded match percentage badge', () => {
    render(<ResultsReveal recommendation={makeScore({ totalScore: 87.6 })} onShuffle={vi.fn()} />)
    expect(screen.getByText('88% match')).toBeInTheDocument()
  })

  it('calls onShuffle when the Shuffle button is clicked', () => {
    const onShuffle = vi.fn()
    render(<ResultsReveal recommendation={makeScore()} onShuffle={onShuffle} />)
    fireEvent.click(screen.getByRole('button', { name: 'Shuffle' }))
    expect(onShuffle).toHaveBeenCalledOnce()
  })

  it('shows an empty state message when there is no recommendation', () => {
    render(<ResultsReveal recommendation={null} onShuffle={vi.fn()} />)
    expect(
      screen.getByText(
        'No destinations matched your search. Try adjusting your budget or distance.'
      )
    ).toBeInTheDocument()
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
  })

  it('passes onSelect through to DestinationCard, scoped to the destination id', () => {
    const onSelect = vi.fn()
    render(
      <ResultsReveal
        recommendation={makeScore({ destination: makeDestination({ id: 'kyoto-japan' }) })}
        onShuffle={vi.fn()}
        onSelect={onSelect}
      />
    )
    fireEvent.click(screen.getByRole('button', { name: /bali/i }))
    fireEvent.click(screen.getByRole('button', { name: 'Select Destination' }))
    expect(onSelect).toHaveBeenCalledWith('kyoto-japan')
  })

  it('does not render a select button when onSelect is not provided', () => {
    render(<ResultsReveal recommendation={makeScore()} onShuffle={vi.fn()} />)
    fireEvent.click(screen.getByRole('button', { name: /bali/i }))
    expect(screen.queryByRole('button', { name: 'Select Destination' })).not.toBeInTheDocument()
  })

  it('skips entrance animation variants when the user prefers reduced motion', async () => {
    vi.resetModules()
    vi.doMock('framer-motion', async () => {
      const actual = await vi.importActual<typeof import('framer-motion')>('framer-motion')
      return { ...actual, useReducedMotion: () => true }
    })

    const { ResultsReveal: ReducedMotionResultsReveal } = await import('@/components/ResultsReveal')
    render(<ReducedMotionResultsReveal recommendation={makeScore()} onShuffle={vi.fn()} />)
    expect(screen.getByRole('heading', { name: 'Your Match' })).toBeInTheDocument()

    vi.doUnmock('framer-motion')
    vi.resetModules()
  })
})
