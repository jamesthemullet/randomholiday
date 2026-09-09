import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ResultsClient } from '@/app/results/ResultsClient'
import { departureCities } from '@/lib/departureCities'
import { destinations } from '@/lib/destinations'

const city = departureCities[0]

vi.mock('next/navigation', () => ({
  useSearchParams: () => mockSearchParams,
}))

let mockSearchParams = new URLSearchParams()

function setParams(params: Record<string, string>) {
  mockSearchParams = new URLSearchParams(params)
}

describe('ResultsClient', () => {
  it('shows the destination pinned by the destination param, not a random pick', () => {
    const pinned = destinations[destinations.length - 1]

    setParams({
      destination: pinned.id,
      originId: city.id,
      budget: '100000',
      distance: '20000',
      nights: '5',
      groupSize: '2',
      month: '6',
    })

    render(<ResultsClient />)

    expect(screen.getAllByText(pinned.name).length).toBeGreaterThan(0)
  })

  it('falls back to a random recommendation when no destination param is present', () => {
    setParams({
      originId: city.id,
      budget: '100000',
      distance: '20000',
      nights: '5',
      groupSize: '2',
      month: '6',
    })

    render(<ResultsClient />)

    const hasSomeDestinationName = destinations.some(
      (d) => screen.queryAllByText(d.name).length > 0
    )
    expect(hasSomeDestinationName).toBe(true)
  })

  it('ignores an unknown destination id and falls back to a random recommendation', () => {
    setParams({
      destination: 'not-a-real-destination-id',
      originId: city.id,
      budget: '100000',
      distance: '20000',
      nights: '5',
      groupSize: '2',
      month: '6',
    })

    render(<ResultsClient />)

    const hasSomeDestinationName = destinations.some(
      (d) => screen.queryAllByText(d.name).length > 0
    )
    expect(hasSomeDestinationName).toBe(true)
  })
})
