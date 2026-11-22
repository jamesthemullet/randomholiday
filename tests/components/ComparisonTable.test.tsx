import { describe, it, expect, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ComparisonTable } from '@/components/ComparisonTable'
import type { DestinationScore } from '@/lib/scoringEngine'
import type { Destination } from '@/lib/types'

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

const origin = { lat: 51.5074, lng: -0.1278 }

describe('ComparisonTable', () => {
  it('shows one column per candidate with match, cost and flight time', () => {
    const candidates = [
      makeScore({ destination: makeDestination({ id: 'bali-indonesia', name: 'Bali' }) }),
      makeScore({
        destination: makeDestination({ id: 'lisbon-portugal', name: 'Lisbon', country: 'Portugal' }),
        totalScore: 60,
      }),
    ]

    render(
      <ComparisonTable
        candidates={candidates}
        origin={origin}
        nights={5}
        groupSize={2}
        onBack={vi.fn()}
      />
    )

    expect(screen.getByRole('heading', { name: 'Compare 2 destinations' })).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: /Bali/ })).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: /Lisbon/ })).toBeInTheDocument()

    const matchRow = screen.getByRole('row', { name: /Match/ })
    expect(within(matchRow).getByText('87%')).toBeInTheDocument()
    expect(within(matchRow).getByText('60%')).toBeInTheDocument()

    expect(screen.getByRole('row', { name: /Est. cost per person/ })).toBeInTheDocument()
    expect(screen.getByRole('row', { name: /Flight time/ })).toBeInTheDocument()
    expect(screen.queryByText(/Weather in/)).not.toBeInTheDocument()
  })

  it('adds a weather row when a travel month is given', () => {
    const candidates = [makeScore()]

    render(
      <ComparisonTable
        candidates={candidates}
        origin={origin}
        nights={5}
        groupSize={2}
        travelMonth={7}
        onBack={vi.fn()}
      />
    )

    expect(screen.getByText('Weather in July')).toBeInTheDocument()
  })

  it('shows a message instead of a table when there are no candidates', () => {
    render(<ComparisonTable candidates={[]} origin={origin} nights={5} groupSize={2} onBack={vi.fn()} />)

    expect(screen.getByText('No destinations matched to compare.')).toBeInTheDocument()
    expect(screen.queryByRole('table')).not.toBeInTheDocument()
  })

  it('calls onBack when Back to single result is clicked', async () => {
    const user = userEvent.setup()
    const onBack = vi.fn()

    render(
      <ComparisonTable
        candidates={[makeScore()]}
        origin={origin}
        nights={5}
        groupSize={2}
        onBack={onBack}
      />
    )

    await user.click(screen.getByRole('button', { name: 'Back to single result' }))

    expect(onBack).toHaveBeenCalledTimes(1)
  })

  it('does not show select buttons when onSelect is omitted', () => {
    render(
      <ComparisonTable
        candidates={[makeScore()]}
        origin={origin}
        nights={5}
        groupSize={2}
        onBack={vi.fn()}
      />
    )

    expect(screen.queryByRole('button', { name: /see prices & book/i })).not.toBeInTheDocument()
  })

  it('calls onSelect with the picked candidate', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    const candidate = makeScore()

    render(
      <ComparisonTable
        candidates={[candidate]}
        origin={origin}
        nights={5}
        groupSize={2}
        onSelect={onSelect}
        onBack={vi.fn()}
      />
    )

    await user.click(screen.getByRole('button', { name: /see prices & book/i }))

    expect(onSelect).toHaveBeenCalledWith(candidate)
  })
})
