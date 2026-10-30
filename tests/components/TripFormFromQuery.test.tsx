import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { TripFormFromQuery } from '@/components/TripForm'
import { departureCities } from '@/lib/departureCities'

let mockSearchParams = new URLSearchParams()

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
  useSearchParams: () => mockSearchParams,
}))

function moreOptionsToggle() {
  return screen.getByRole('button', { name: /more options/i })
}

describe('TripFormFromQuery', () => {
  it('prefills the form from a URL search param', () => {
    mockSearchParams = new URLSearchParams({ budget: '3000' })
    render(<TripFormFromQuery />)

    expect(screen.getByRole('slider', { name: 'Budget per person' })).toHaveAttribute(
      'aria-valuenow',
      '3000'
    )
  })

  it('prefills the departure city from the originId param', () => {
    const city = departureCities[0]
    mockSearchParams = new URLSearchParams({ originId: city.id })
    render(<TripFormFromQuery />)

    expect(screen.getByRole('combobox', { name: 'Where are you flying from?' })).toHaveValue(
      city.name
    )
  })

  it('keeps the form collapsed when the URL has no prefill values', () => {
    mockSearchParams = new URLSearchParams()
    render(<TripFormFromQuery />)

    expect(moreOptionsToggle()).toHaveAttribute('aria-expanded', 'false')
  })

  it('opens "More options" when a travel style is present in the URL', () => {
    mockSearchParams = new URLSearchParams({ budget: '2500', styles: 'beach,city' })
    render(<TripFormFromQuery />)

    expect(screen.getByRole('slider', { name: 'Budget per person' })).toHaveAttribute(
      'aria-valuenow',
      '2500'
    )
    expect(moreOptionsToggle()).toHaveAttribute('aria-expanded', 'true')
  })
})
