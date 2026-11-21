import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CompareTable } from '@/components/CompareTable'
import type { Destination } from '@/lib/types'
import type { DestinationScore } from '@/lib/scoringEngine'

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

const origin = { lat: 51.5072, lng: -0.1276 }

describe('CompareTable', () => {
  it('renders a column per candidate with name and country', () => {
    const candidates = [
      makeScore(),
      makeScore({
        destination: makeDestination({ id: 'rome-italy', name: 'Rome', country: 'Italy' }),
        totalScore: 72,
      }),
    ]

    render(
      <CompareTable
        candidates={candidates}
        origin={origin}
        nights={7}
        groupSize={2}
        onChoose={vi.fn()}
        onBack={vi.fn()}
      />
    )

    expect(screen.getByRole('columnheader', { name: /BaliIndonesia/ })).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: /RomeItaly/ })).toBeInTheDocument()
    expect(screen.getByText('87%')).toBeInTheDocument()
    expect(screen.getByText('72%')).toBeInTheDocument()
  })

  it('shows a weather row only when a travel month is given', () => {
    const candidates = [makeScore()]

    const { rerender } = render(
      <CompareTable
        candidates={candidates}
        origin={origin}
        nights={7}
        groupSize={2}
        onChoose={vi.fn()}
        onBack={vi.fn()}
      />
    )
    expect(screen.queryByText('Weather')).not.toBeInTheDocument()

    rerender(
      <CompareTable
        candidates={candidates}
        origin={origin}
        nights={7}
        groupSize={2}
        travelMonth={6}
        onChoose={vi.fn()}
        onBack={vi.fn()}
      />
    )
    expect(screen.getByText('Weather')).toBeInTheDocument()
  })

  it('calls onChoose with the destination id when a "Pick this one" button is clicked', async () => {
    const user = userEvent.setup()
    const onChoose = vi.fn()
    const candidates = [
      makeScore(),
      makeScore({
        destination: makeDestination({ id: 'rome-italy', name: 'Rome', country: 'Italy' }),
      }),
    ]

    render(
      <CompareTable
        candidates={candidates}
        origin={origin}
        nights={7}
        groupSize={2}
        onChoose={onChoose}
        onBack={vi.fn()}
      />
    )

    const pickButtons = screen.getAllByRole('button', { name: 'Pick this one' })
    await user.click(pickButtons[1])

    expect(onChoose).toHaveBeenCalledWith('rome-italy')
  })

  it('calls onBack when the back button is clicked', async () => {
    const user = userEvent.setup()
    const onBack = vi.fn()

    render(
      <CompareTable
        candidates={[makeScore()]}
        origin={origin}
        nights={7}
        groupSize={2}
        onChoose={vi.fn()}
        onBack={onBack}
      />
    )

    await user.click(screen.getByRole('button', { name: 'Back to your match' }))

    expect(onBack).toHaveBeenCalled()
  })

  it('shows a fallback message instead of a table when there is nothing to compare', () => {
    render(
      <CompareTable
        candidates={[]}
        origin={origin}
        nights={7}
        groupSize={2}
        onChoose={vi.fn()}
        onBack={vi.fn()}
      />
    )

    expect(screen.getByText(/nothing to compare yet/i)).toBeInTheDocument()
    expect(screen.queryByRole('table')).not.toBeInTheDocument()
  })
})
