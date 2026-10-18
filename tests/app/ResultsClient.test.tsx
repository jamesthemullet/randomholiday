import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { renderToString } from 'react-dom/server'
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

  it('links Change search back to the homepage form with the current query', () => {
    setParams({
      originId: city.id,
      budget: '1500',
      distance: '5000',
      nights: '7',
      groupSize: '2',
      month: '6',
    })

    render(<ResultsClient />)

    expect(screen.getByRole('link', { name: 'Change search' })).toHaveAttribute(
      'href',
      `/?${mockSearchParams.toString()}`
    )
  })

  it('offers a Start over link to the homepage when the trip details are missing', () => {
    setParams({})

    render(<ResultsClient />)

    expect(screen.getByRole('link', { name: 'Start over' })).toHaveAttribute('href', '/')
  })

  it('does not pick a random destination during server rendering, to avoid a hydration mismatch', () => {
    setParams({
      originId: city.id,
      budget: '100000',
      distance: '20000',
      nights: '5',
      groupSize: '2',
      month: '6',
    })

    const html = renderToString(<ResultsClient />)

    expect(html).toContain('Picking your destination…')
    expect(html).not.toContain('No destinations matched')
  })

  it('server-renders a pinned destination, since it involves no randomness', () => {
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

    const html = renderToString(<ResultsClient />)

    expect(html).toContain(pinned.name)
    expect(html).not.toContain('Picking your destination…')
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

  it('ignores invalid travel style values in the styles param instead of crashing', () => {
    setParams({
      originId: city.id,
      budget: '100000',
      distance: '20000',
      nights: '5',
      groupSize: '2',
      month: '6',
      styles: 'beach,not-a-real-style',
    })

    render(<ResultsClient />)

    const hasSomeDestinationName = destinations.some(
      (d) => screen.queryAllByText(d.name).length > 0
    )
    expect(hasSomeDestinationName).toBe(true)
  })
})
