import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderToString } from 'react-dom/server'
import { ResultsClient } from '@/app/results/ResultsClient'
import { departureCities } from '@/lib/departureCities'
import { pickableDestinations as destinations } from '@/lib/catalogue'
import { pickableDestinations } from '@/lib/catalogue'
import { getRecommendations } from '@/lib/recommendationEngine'

const city = departureCities[0]

vi.mock('next/navigation', () => ({
  useSearchParams: () => mockSearchParams,
  useRouter: () => ({ push: vi.fn() }),
}))

vi.mock('@/lib/recommendationEngine', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/recommendationEngine')>()
  return { ...actual, getRecommendations: vi.fn(actual.getRecommendations) }
})

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
      hours: '25.5',
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
      hours: '6.75',
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
      hours: '6.75',
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
      originId: 'manchester-uk',
      budget: '1500',
      hours: '6.75',
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
      hours: '25.5',
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
      hours: '25.5',
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
      hours: '25.5',
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
      hours: '25.5',
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
      hours: '25.5',
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
      hours: '25.5',
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

  it('excludes the currently shown destination when Spin again is clicked', async () => {
    const user = userEvent.setup()
    const recommendations = vi.mocked(getRecommendations)
    recommendations.mockClear()

    setParams({
      originId: city.id,
      budget: '100000',
      hours: '25.5',
      nights: '5',
      groupSize: '2',
      month: '6',
    })

    render(<ResultsClient />)

    const shown = pickableDestinations.find((d) => screen.queryAllByText(d.name).length > 0)!

    await user.click(screen.getByRole('button', { name: 'Spin again' }))

    const lastCall = recommendations.mock.calls[recommendations.mock.calls.length - 1]
    expect(lastCall[1].excludeDestinationIds).toEqual([shown.id])
  })

  it('grows the exclusion list across repeated shuffles, up to a limit', async () => {
    const user = userEvent.setup()
    const recommendations = vi.mocked(getRecommendations)
    recommendations.mockClear()

    setParams({
      originId: city.id,
      budget: '100000',
      hours: '25.5',
      nights: '5',
      groupSize: '2',
      month: '6',
    })

    render(<ResultsClient />)

    for (let i = 0; i < 6; i++) {
      await user.click(screen.getByRole('button', { name: 'Spin again' }))
    }

    const lastCall = recommendations.mock.calls[recommendations.mock.calls.length - 1]
    const excluded = lastCall[1].excludeDestinationIds as string[]
    expect(excluded.length).toBeLessThanOrEqual(5)
    expect(new Set(excluded).size).toBe(excluded.length)
  })

  it('shows a comparison table of several destinations when Compare options is clicked', async () => {
    const user = userEvent.setup()

    setParams({
      originId: city.id,
      budget: '100000',
      hours: '25.5',
      nights: '5',
      groupSize: '2',
      month: '6',
    })

    render(<ResultsClient />)

    await user.click(screen.getByRole('button', { name: 'Compare 3 options' }))

    expect(screen.getByRole('heading', { name: /compare \d destinations?/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Back to single result' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Compare 3 options' })).not.toBeInTheDocument()
  })

  it('returns to the single result when Back to single result is clicked', async () => {
    const user = userEvent.setup()

    setParams({
      originId: city.id,
      budget: '100000',
      hours: '25.5',
      nights: '5',
      groupSize: '2',
      month: '6',
    })

    render(<ResultsClient />)

    await user.click(screen.getByRole('button', { name: 'Compare 3 options' }))
    await user.click(screen.getByRole('button', { name: 'Back to single result' }))

    expect(screen.getByRole('button', { name: 'Compare 3 options' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Back to single result' })).not.toBeInTheDocument()
  })

  it('opens the detail modal for a destination picked from the comparison table', async () => {
    const user = userEvent.setup()

    setParams({
      originId: city.id,
      budget: '100000',
      hours: '25.5',
      nights: '5',
      groupSize: '2',
      month: '6',
    })

    render(<ResultsClient />)

    await user.click(screen.getByRole('button', { name: 'Compare 3 options' }))

    // The first destination column, skipping the row-label corner cell.
    const destinationHeader = screen.getAllByRole('columnheader')[1]
    const pickedName = destinationHeader.firstChild?.textContent

    const pickButtons = screen.getAllByRole('button', { name: /see prices & book/i })
    await user.click(pickButtons[0])

    // Comparing is exited and the detail modal opens for the destination that was picked.
    expect(screen.queryByRole('button', { name: 'Back to single result' })).not.toBeInTheDocument()
    const dialog = screen.getByRole('dialog')
    const titleId = dialog.getAttribute('aria-labelledby')
    expect(titleId).toBeTruthy()
    expect(document.getElementById(titleId as string)?.textContent).toContain(pickedName)
  })
})
