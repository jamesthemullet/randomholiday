import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { DestinationDetailModal } from '@/components/DestinationDetailModal'
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

describe('DestinationDetailModal', () => {
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
    expect(screen.getByText('Total ($950 per person)')).toBeInTheDocument()
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
})
