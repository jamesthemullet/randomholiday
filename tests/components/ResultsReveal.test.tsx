import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { renderToString } from 'react-dom/server'
import {
  ResultsReveal,
  FLAP_INTERVAL_MS,
  getFlapFrame,
  getFlapTicks,
} from '@/components/ResultsReveal'
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

function getBoardText(container: HTMLElement): string {
  const flaps = container.querySelectorAll('[class*="flap"]:not([class*="flaps"])')
  return Array.from(flaps, (el) => el.textContent).join('')
}

function mockReducedMotion(matches: boolean) {
  const listeners = new Set<() => void>()
  const original = window.matchMedia
  window.matchMedia = ((query: string) => ({
    matches,
    media: query,
    addEventListener: (_: string, cb: () => void) => listeners.add(cb),
    removeEventListener: (_: string, cb: () => void) => listeners.delete(cb),
  })) as unknown as typeof window.matchMedia
  return {
    listeners,
    restore: () => {
      window.matchMedia = original
    },
  }
}

afterEach(() => {
  vi.useRealTimers()
})

describe('ResultsReveal', () => {
  it('renders a heading for the match', () => {
    render(<ResultsReveal recommendation={makeScore()} onShuffle={vi.fn()} />)
    expect(screen.getByRole('heading', { level: 1, name: 'Your Match' })).toBeInTheDocument()
  })

  it('renders the postcard for the recommendation', () => {
    render(<ResultsReveal recommendation={makeScore()} onShuffle={vi.fn()} />)
    expect(screen.getByRole('heading', { level: 2, name: 'Bali' })).toBeInTheDocument()
    expect(screen.getByText('Indonesia')).toBeInTheDocument()
    expect(screen.getByText('A lush island paradise.')).toBeInTheDocument()
    expect(screen.getByRole('list', { name: 'Things to do' })).toHaveTextContent(
      'SurfingTemple hopping'
    )
  })

  it('omits the activities list when there are none', () => {
    render(
      <ResultsReveal
        recommendation={makeScore({ destination: makeDestination({ activities: [] }) })}
        onShuffle={vi.fn()}
      />
    )
    expect(screen.queryByRole('list', { name: 'Things to do' })).not.toBeInTheDocument()
  })

  it('renders a rounded match percentage stamp', () => {
    render(<ResultsReveal recommendation={makeScore({ totalScore: 87.6 })} onShuffle={vi.fn()} />)
    expect(screen.getByText('88%')).toBeInTheDocument()
  })

  it('shows the destination photo, swapping to a poster if it fails to load', () => {
    render(<ResultsReveal recommendation={makeScore()} onShuffle={vi.fn()} />)
    const photo = screen.getByRole('img', { name: 'Bali, Indonesia' })
    expect(photo).toHaveAttribute('src', '/destinations/bali-indonesia.jpg')

    fireEvent.error(photo)
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
    expect(screen.getByText('GREETINGS FROM')).toBeInTheDocument()
    expect(screen.getByText('Photos coming soon')).toBeInTheDocument()
  })

  it('shows the poster when the photo already failed before mounting', () => {
    const proto = HTMLImageElement.prototype
    const complete = vi.spyOn(proto, 'complete', 'get').mockReturnValue(true)
    const naturalWidth = vi.spyOn(proto, 'naturalWidth', 'get').mockReturnValue(0)
    try {
      render(<ResultsReveal recommendation={makeScore()} onShuffle={vi.fn()} />)
      expect(screen.queryByRole('img')).not.toBeInTheDocument()
      expect(screen.getByText('GREETINGS FROM')).toBeInTheDocument()
    } finally {
      complete.mockRestore()
      naturalWidth.mockRestore()
    }
  })

  it('shows trip stats when trip details are provided', () => {
    render(
      <ResultsReveal
        recommendation={makeScore()}
        onShuffle={vi.fn()}
        originName="London"
        distanceKm={12_344}
        nights={1}
        perPersonCost={1234.4}
      />
    )
    expect(screen.getByText('From').nextSibling).toHaveTextContent('London')
    expect(screen.getByText('12,340 km')).toBeInTheDocument()
    expect(screen.getByText('1 night')).toBeInTheDocument()
    expect(screen.getByText('£1,234')).toBeInTheDocument()
  })

  it('pluralises the trip length', () => {
    render(<ResultsReveal recommendation={makeScore()} onShuffle={vi.fn()} nights={7} />)
    expect(screen.getByText('7 nights')).toBeInTheDocument()
  })

  it('omits the stats row when no trip details are provided', () => {
    render(<ResultsReveal recommendation={makeScore()} onShuffle={vi.fn()} />)
    expect(screen.queryByText('From')).not.toBeInTheDocument()
  })

  it('calls onShuffle when Spin again is clicked', () => {
    const onShuffle = vi.fn()
    render(<ResultsReveal recommendation={makeScore()} onShuffle={onShuffle} />)
    fireEvent.click(screen.getByRole('button', { name: 'Spin again' }))
    expect(onShuffle).toHaveBeenCalledOnce()
  })

  it('renders a Change my answers link when changeSearchHref is provided', () => {
    render(
      <ResultsReveal
        recommendation={makeScore()}
        onShuffle={vi.fn()}
        changeSearchHref="/?originId=london-uk"
      />
    )
    expect(screen.getByRole('link', { name: 'Change my answers' })).toHaveAttribute(
      'href',
      '/?originId=london-uk'
    )
  })

  it('omits the Change my answers link when no changeSearchHref is provided', () => {
    render(<ResultsReveal recommendation={makeScore()} onShuffle={vi.fn()} />)
    expect(screen.queryByRole('link', { name: 'Change my answers' })).not.toBeInTheDocument()
  })

  it('shows a picking message instead of the empty state while a destination is being chosen', () => {
    const { container } = render(
      <ResultsReveal recommendation={null} isPicking onShuffle={vi.fn()} />
    )
    expect(screen.getByText('Picking your destination…')).toBeInTheDocument()
    expect(screen.queryByText(/no destinations matched/i)).not.toBeInTheDocument()
    expect(screen.getByText('SHUFFLING…')).toBeInTheDocument()
    expect(getBoardText(container)).toBe('??????')
  })

  it('shows an empty state when there is no recommendation', () => {
    const { container } = render(
      <ResultsReveal recommendation={null} onShuffle={vi.fn()} changeSearchHref="/" />
    )
    expect(screen.getByRole('heading', { name: 'Nowhere fits… yet.' })).toBeInTheDocument()
    expect(
      screen.getByText(
        'No destinations matched your search. Try adjusting your budget or distance.'
      )
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Change my answers' })).toHaveAttribute('href', '/')
    expect(screen.getByText('CANCELLED')).toBeInTheDocument()
    expect(getBoardText(container)).toBe('NO MATCH')
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
  })

  it('omits the empty state link when no changeSearchHref is provided', () => {
    render(<ResultsReveal recommendation={null} onShuffle={vi.fn()} />)
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
  })

  it('calls onSelect with the destination id', () => {
    const onSelect = vi.fn()
    render(
      <ResultsReveal
        recommendation={makeScore({ destination: makeDestination({ id: 'kyoto-japan' }) })}
        onShuffle={vi.fn()}
        onSelect={onSelect}
      />
    )
    fireEvent.click(screen.getByRole('button', { name: 'See prices & book' }))
    expect(onSelect).toHaveBeenCalledWith('kyoto-japan')
  })

  it('does not render a select button when onSelect is not provided', () => {
    render(<ResultsReveal recommendation={makeScore()} onShuffle={vi.fn()} />)
    expect(screen.queryByRole('button', { name: 'See prices & book' })).not.toBeInTheDocument()
  })

  it('announces the matched destination in a live region', () => {
    render(<ResultsReveal recommendation={makeScore({ totalScore: 87.6 })} onShuffle={vi.fn()} />)
    expect(screen.getByRole('status')).toHaveTextContent('New match: Bali, Indonesia — 88% match')
  })

  it('updates the live region announcement when the recommendation changes', () => {
    const { rerender } = render(<ResultsReveal recommendation={makeScore()} onShuffle={vi.fn()} />)
    expect(screen.getByRole('status')).toHaveTextContent('New match: Bali, Indonesia')

    rerender(
      <ResultsReveal
        recommendation={makeScore({
          destination: makeDestination({ id: 'kyoto-japan', name: 'Kyoto', country: 'Japan' }),
        })}
        onShuffle={vi.fn()}
      />
    )
    expect(screen.getByRole('status')).toHaveTextContent('New match: Kyoto, Japan')
  })

  it('renders an empty live region when there is no recommendation', () => {
    render(<ResultsReveal recommendation={null} onShuffle={vi.fn()} />)
    expect(screen.getByRole('status')).toHaveTextContent('')
  })

  it('shows the departure city on the board', () => {
    render(<ResultsReveal recommendation={makeScore()} onShuffle={vi.fn()} originName="London" />)
    expect(screen.getByText('DEPARTURES · FROM LONDON')).toBeInTheDocument()
  })

  it('flips the board through letters until it spells the destination', () => {
    vi.useFakeTimers()
    const { container } = render(<ResultsReveal recommendation={makeScore()} onShuffle={vi.fn()} />)
    expect(getBoardText(container)).toBe(getFlapFrame('BALI', 0))
    expect(screen.getByText('SHUFFLING…')).toBeInTheDocument()

    act(() => {
      vi.advanceTimersByTime(getFlapTicks('BALI') * FLAP_INTERVAL_MS)
    })
    expect(getBoardText(container)).toBe('BALI')
    expect(screen.getByText('NOW BOARDING')).toBeInTheDocument()
  })

  it('restarts the board when a new destination arrives', () => {
    vi.useFakeTimers()
    const { container, rerender } = render(
      <ResultsReveal recommendation={makeScore()} onShuffle={vi.fn()} />
    )
    act(() => {
      vi.advanceTimersByTime(getFlapTicks('BALI') * FLAP_INTERVAL_MS)
    })
    rerender(
      <ResultsReveal
        recommendation={makeScore({
          destination: makeDestination({ id: 'kyoto-japan', name: 'Kyoto' }),
        })}
        onShuffle={vi.fn()}
      />
    )
    expect(getBoardText(container)).toBe(getFlapFrame('KYOTO', 0))
    expect(screen.getByText('SHUFFLING…')).toBeInTheDocument()
  })

  it('delays the postcard pop until the board settles', () => {
    render(<ResultsReveal recommendation={makeScore()} onShuffle={vi.fn()} />)
    expect(screen.getByRole('article', { name: 'Bali' })).toHaveStyle({
      '--reveal-delay': `${getFlapTicks('BALI') * FLAP_INTERVAL_MS}ms`,
    })
  })

  it('skips the flip animation when the user prefers reduced motion', () => {
    const media = mockReducedMotion(true)
    try {
      const { container, unmount } = render(
        <ResultsReveal recommendation={makeScore()} onShuffle={vi.fn()} />
      )
      expect(getBoardText(container)).toBe('BALI')
      expect(screen.getByText('NOW BOARDING')).toBeInTheDocument()
      expect(screen.getByRole('article', { name: 'Bali' })).toHaveStyle({
        '--reveal-delay': '0ms',
      })
      expect(media.listeners.size).toBe(1)
      unmount()
      expect(media.listeners.size).toBe(0)
    } finally {
      media.restore()
    }
  })

  it('server-renders the first board frame, so hydration matches', () => {
    const html = renderToString(<ResultsReveal recommendation={makeScore()} onShuffle={vi.fn()} />)
    expect(html).toContain('SHUFFLING…')
    expect(html).toContain('Bali')
  })
})

describe('getFlapFrame', () => {
  it('scrambles every letter before the warm-up ends', () => {
    const frame = getFlapFrame('PARIS', 0)
    expect(frame).toHaveLength(5)
    expect(frame).toMatch(/^[A-Z]{5}$/)
  })

  it('locks letters in from the left', () => {
    expect(getFlapFrame('PARIS', 16).slice(0, 2)).toBe('PA')
  })

  it('leaves spaces and punctuation untouched', () => {
    expect(getFlapFrame('CUSCO & MACHU', 0)[5]).toBe(' ')
    expect(getFlapFrame('CUSCO & MACHU', 0)[6]).toBe('&')
  })

  it('reaches the target by the final tick', () => {
    expect(getFlapFrame('PARIS', getFlapTicks('PARIS'))).toBe('PARIS')
  })
})
