import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderToString } from 'react-dom/server'
import { ResultsClient } from '@/app/results/ResultsClient'
import { departureCities } from '@/lib/departureCities'
import { destinations } from '@/lib/destinations'
import { pickableDestinations } from '@/lib/catalogue'

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

  it('links Change my answers back to the homepage form with the current query', () => {
    setParams({
      originId: city.id,
      budget: '1500',
      distance: '5000',
      nights: '7',
      groupSize: '2',
      month: '6',
    })

    render(<ResultsClient />)

    expect(screen.getByRole('link', { name: 'Change my answers' })).toHaveAttribute(
      'href',
      `/?${mockSearchParams.toString()}`
    )
  })

  it('shows the trip details on the postcard', () => {
    const pinned = destinations.find((d) => d.id === 'barcelona-spain')!
    setParams({
      destination: pinned.id,
      originId: city.id,
      budget: '1500',
      distance: '5000',
      nights: '7',
      groupSize: '2',
      month: '6',
    })

    render(<ResultsClient />)

    expect(screen.getByText('From').nextSibling).toHaveTextContent(city.name)
    expect(screen.getByText('7 nights')).toBeInTheDocument()
    expect(screen.getByText('Est. pp').nextSibling).toHaveTextContent(/^£[\d,]+$/)
  })

  it('offers a Start over link to the homepage when the trip details are missing', () => {
    setParams({})

    render(<ResultsClient />)

    expect(screen.getByRole('link', { name: 'Start over' })).toHaveAttribute('href', '/')
  })

  it('shows no destination when departing from a city without route data', () => {
    setParams({
      originId: 'paris-france',
      budget: '1500',
      distance: '5000',
      nights: '7',
      groupSize: '2',
      month: '6',
    })

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

    const hasSomeDestinationName = pickableDestinations.some(
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

    const hasSomeDestinationName = pickableDestinations.some(
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

    const hasSomeDestinationName = pickableDestinations.some(
      (d) => screen.queryAllByText(d.name).length > 0
    )
    expect(hasSomeDestinationName).toBe(true)
  })

  it('shares a link that pins the exact destination shown, not the page URL', async () => {
    const user = userEvent.setup()
    const writeText = vi.spyOn(navigator.clipboard, 'writeText').mockResolvedValue(undefined)

    setParams({
      originId: city.id,
      budget: '100000',
      distance: '20000',
      nights: '5',
      groupSize: '2',
      month: '6',
    })

    render(<ResultsClient />)

    // No `destination` param was present, so the page's own URL would re-roll on open —
    // the shared link must pin whichever destination actually ended up on screen instead.
    const shownDestination = pickableDestinations.find(
      (d) => screen.queryAllByText(d.name).length > 0
    )!

    fireEvent.click(screen.getByRole('button', { name: /see prices & book/i }))
    await user.click(screen.getByRole('button', { name: 'Share' }))

    expect(writeText).toHaveBeenCalled()
    const sharedUrl = new URL(writeText.mock.calls[0][0] as string)
    expect(sharedUrl.pathname).toBe('/results')
    expect(sharedUrl.searchParams.get('destination')).toBe(shownDestination.id)
    expect(sharedUrl.searchParams.get('originId')).toBe(city.id)
    expect(sharedUrl.searchParams.get('budget')).toBe('100000')
  })
})
