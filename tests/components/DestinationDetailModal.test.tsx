import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { DestinationDetailModal } from '@/components/DestinationDetailModal'
import type { Destination } from '@/lib/destinations'

function jsonResponse(body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}

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

describe('DestinationDetailModal', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() =>
        Promise.resolve(jsonResponse({ source: 'static', avgHighC: 24, description: 'warm' }))
      )
    )
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('renders nothing when destination is null', () => {
    render(
      <DestinationDetailModal
        isOpen
        onClose={vi.fn()}
        destination={null}
        distanceKm={500}
        nights={5}
        groupSize={2}
      />
    )
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('renders nothing when isOpen is false', () => {
    render(
      <DestinationDetailModal
        isOpen={false}
        onClose={vi.fn()}
        destination={makeDestination()}
        distanceKm={500}
        nights={5}
        groupSize={2}
      />
    )
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('renders the destination name and country as the dialog title', () => {
    render(
      <DestinationDetailModal
        isOpen
        onClose={vi.fn()}
        destination={makeDestination()}
        distanceKm={500}
        nights={5}
        groupSize={2}
      />
    )
    expect(screen.getByRole('heading', { name: 'Bali, Indonesia' })).toBeInTheDocument()
  })

  it('renders the description', () => {
    render(
      <DestinationDetailModal
        isOpen
        onClose={vi.fn()}
        destination={makeDestination()}
        distanceKm={500}
        nights={5}
        groupSize={2}
      />
    )
    expect(screen.getByText('A lush island paradise.')).toBeInTheDocument()
  })

  it('renders the destination photo with the expected local path', () => {
    render(
      <DestinationDetailModal
        isOpen
        onClose={vi.fn()}
        destination={makeDestination()}
        distanceKm={500}
        nights={5}
        groupSize={2}
      />
    )
    const img = screen.getByRole('img')
    expect(img).toHaveAttribute('src', '/destinations/bali-indonesia.jpg')
    expect(img).toHaveAttribute('alt', 'Bali, Indonesia')
  })

  it('falls back to a photo placeholder when the image fails to load', () => {
    render(
      <DestinationDetailModal
        isOpen
        onClose={vi.fn()}
        destination={makeDestination()}
        distanceKm={500}
        nights={5}
        groupSize={2}
      />
    )
    fireEvent.error(screen.getByRole('img'))
    expect(screen.getByText('Photos coming soon')).toBeInTheDocument()
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
  })

  it('resets the image-failed state when the destination changes while the modal stays open', () => {
    const { rerender } = render(
      <DestinationDetailModal
        isOpen
        onClose={vi.fn()}
        destination={makeDestination()}
        distanceKm={500}
        nights={5}
        groupSize={2}
      />
    )
    fireEvent.error(screen.getByRole('img'))
    expect(screen.getByText('Photos coming soon')).toBeInTheDocument()

    rerender(
      <DestinationDetailModal
        isOpen
        onClose={vi.fn()}
        destination={makeDestination({ id: 'rome-italy', name: 'Rome', country: 'Italy' })}
        distanceKm={500}
        nights={5}
        groupSize={2}
      />
    )

    expect(screen.queryByText('Photos coming soon')).not.toBeInTheDocument()
    const img = screen.getByRole('img')
    expect(img).toHaveAttribute('src', '/destinations/rome-italy.jpg')
    expect(img).toHaveAttribute('alt', 'Rome, Italy')
  })

  it('renders a cost breakdown with flights, hotel, daily spending, and total', () => {
    render(
      <DestinationDetailModal
        isOpen
        onClose={vi.fn()}
        destination={makeDestination()}
        distanceKm={500}
        nights={5}
        groupSize={2}
      />
    )
    // flightFromEurope: $600 * 2 travellers = $1200
    expect(screen.getByText('Flights (2 travellers)')).toBeInTheDocument()
    expect(screen.getByText('$1,200')).toBeInTheDocument()
    // hotel: $60 * 5 nights = $300
    expect(screen.getByText('Hotel (5 nights)')).toBeInTheDocument()
    expect(screen.getByText('$300')).toBeInTheDocument()
    // daily spending: $40 * 2 * 5 = $400
    expect(screen.getByText('Daily spending')).toBeInTheDocument()
    expect(screen.getByText('$400')).toBeInTheDocument()
    // total: 1200 + 300 + 400 = $1,900, per person = $950
    expect(screen.getByText('Total')).toBeInTheDocument()
    expect(screen.getByText('$950 per person')).toBeInTheDocument()
    expect(screen.getByText('$1,900')).toBeInTheDocument()
  })

  it('singularises the traveller label for a group size of 1', () => {
    render(
      <DestinationDetailModal
        isOpen
        onClose={vi.fn()}
        destination={makeDestination()}
        distanceKm={500}
        nights={5}
        groupSize={1}
      />
    )
    expect(screen.getByText('Flights (1 traveller)')).toBeInTheDocument()
  })

  it('renders a Booking.com hotel search link scoped to the destination and group size', () => {
    render(
      <DestinationDetailModal
        isOpen
        onClose={vi.fn()}
        destination={makeDestination()}
        distanceKm={500}
        nights={5}
        groupSize={3}
      />
    )
    const link = screen.getByRole('link', { name: 'Find hotels on Booking.com' })
    const url = new URL(link.getAttribute('href') ?? '')
    expect(url.origin + url.pathname).toBe('https://www.booking.com/searchresults.html')
    expect(url.searchParams.get('ss')).toBe('Bali, Indonesia')
    expect(url.searchParams.get('group_adults')).toBe('3')
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer sponsored')
  })

  it('renders a Skyscanner flight search link scoped to the destination country and group size', () => {
    render(
      <DestinationDetailModal
        isOpen
        onClose={vi.fn()}
        destination={makeDestination()}
        distanceKm={500}
        nights={5}
        groupSize={3}
      />
    )
    const link = screen.getByRole('link', { name: 'Find flights on Skyscanner' })
    const url = new URL(link.getAttribute('href') ?? '')
    expect(url.origin + url.pathname).toBe(
      'https://www.skyscanner.net/transport/flights/everywhere/id/'
    )
    expect(url.searchParams.get('adults')).toBe('3')
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer sponsored')
  })

  it('renders things to do from destination activities', () => {
    render(
      <DestinationDetailModal
        isOpen
        onClose={vi.fn()}
        destination={makeDestination()}
        distanceKm={500}
        nights={5}
        groupSize={2}
      />
    )
    expect(screen.getByRole('heading', { name: 'Things to do' })).toBeInTheDocument()
    expect(screen.getByText('Surfing')).toBeInTheDocument()
    expect(screen.getByText('Temple hopping')).toBeInTheDocument()
  })

  it('fetches and renders a seasonal weather estimate, scoped to the destination and month', async () => {
    const fetchMock = vi.fn((_url: string | URL) =>
      Promise.resolve(jsonResponse({ source: 'static', avgHighC: 30.4, description: 'hot' }))
    )
    vi.stubGlobal('fetch', fetchMock)

    render(
      <DestinationDetailModal
        isOpen
        onClose={vi.fn()}
        destination={makeDestination()}
        distanceKm={500}
        nights={5}
        groupSize={2}
        month={7}
      />
    )

    expect(screen.getByText('Loading seasonal weather…')).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.getByText(/Typically/)).toBeInTheDocument()
    })
    expect(screen.getByText('30°C', { exact: false })).toBeInTheDocument()
    expect(screen.getByText(/hot\./)).toBeInTheDocument()

    const requestUrl = new URL(fetchMock.mock.calls[0][0] as string, 'http://localhost')
    expect(requestUrl.pathname).toBe('/api/weather')
    expect(requestUrl.searchParams.get('lat')).toBe('-8.3405')
    expect(requestUrl.searchParams.get('lng')).toBe('115.092')
    expect(requestUrl.searchParams.get('climate')).toBe('tropical')
    expect(requestUrl.searchParams.get('month')).toBe('7')
  })

  it('renders a live weather estimate using its tempC field', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() =>
        Promise.resolve(jsonResponse({ source: 'live', tempC: 18.9, description: 'light rain' }))
      )
    )

    render(
      <DestinationDetailModal
        isOpen
        onClose={vi.fn()}
        destination={makeDestination()}
        distanceKm={500}
        nights={5}
        groupSize={2}
        month={11}
      />
    )

    await waitFor(() => {
      expect(screen.getByText('19°C', { exact: false })).toBeInTheDocument()
    })
    expect(screen.getByText(/light rain\./)).toBeInTheDocument()
  })

  it('shows an unavailable message when the weather request fails', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.resolve(new Response(null, { status: 500 })))
    )

    render(
      <DestinationDetailModal
        isOpen
        onClose={vi.fn()}
        destination={makeDestination()}
        distanceKm={500}
        nights={5}
        groupSize={2}
      />
    )

    await waitFor(() => {
      expect(screen.getByText('Weather estimate unavailable right now.')).toBeInTheDocument()
    })
  })

  it('marks the travel month as great when it is one of the best months', () => {
    render(
      <DestinationDetailModal
        isOpen
        onClose={vi.fn()}
        destination={makeDestination()}
        distanceKm={500}
        nights={5}
        groupSize={2}
        month={5}
      />
    )
    expect(screen.getByText('✓ GREAT IN MAY')).toBeInTheDocument()
  })

  it('marks the travel month as off-peak otherwise', () => {
    render(
      <DestinationDetailModal
        isOpen
        onClose={vi.fn()}
        destination={makeDestination()}
        distanceKm={500}
        nights={1}
        groupSize={1}
        month={12}
      />
    )
    expect(screen.getByText('OFF-PEAK IN DECEMBER')).toBeInTheDocument()
    expect(screen.getByText('1 traveller · 1 night')).toBeInTheDocument()
  })

  it('describes the booking links with the trip details', () => {
    render(
      <DestinationDetailModal
        isOpen
        onClose={vi.fn()}
        destination={makeDestination()}
        distanceKm={500}
        nights={5}
        groupSize={2}
        originName="London"
      />
    )
    expect(
      screen.getByRole('link', { name: 'Find flights on Skyscanner' })
    ).toHaveAccessibleDescription('From London · est. $1,200')
    expect(
      screen.getByRole('link', { name: 'Find hotels on Booking.com' })
    ).toHaveAccessibleDescription('5 nights · 2 guests · est. $300')
  })

  it('leaves the origin out of the flights note when it is unknown', () => {
    render(
      <DestinationDetailModal
        isOpen
        onClose={vi.fn()}
        destination={makeDestination()}
        distanceKm={500}
        nights={5}
        groupSize={1}
      />
    )
    expect(
      screen.getByRole('link', { name: 'Find flights on Skyscanner' })
    ).toHaveAccessibleDescription('est. $600')
    expect(
      screen.getByRole('link', { name: 'Find hotels on Booking.com' })
    ).toHaveAccessibleDescription('5 nights · 1 guest · est. $300')
  })

  it('does not fetch weather when the modal is closed', () => {
    const fetchMock = vi.fn(() =>
      Promise.resolve(jsonResponse({ source: 'static', avgHighC: 24, description: 'warm' }))
    )
    vi.stubGlobal('fetch', fetchMock)

    render(
      <DestinationDetailModal
        isOpen={false}
        onClose={vi.fn()}
        destination={makeDestination()}
        distanceKm={500}
        nights={5}
        groupSize={2}
      />
    )

    expect(fetchMock).not.toHaveBeenCalled()
  })
})
