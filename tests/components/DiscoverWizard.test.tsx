import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { DiscoverWizard, buildResultsQuery } from '@/components/DiscoverWizard'
import type { DepartureCity } from '@/lib/departureCities'

const push = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
}))

const london: DepartureCity = {
  id: 'london-uk',
  name: 'London',
  country: 'United Kingdom',
  coordinates: { lat: 51.5072, lng: -0.1276 },
}

function selectDepartureCity(name: string) {
  const combobox = screen.getByRole('combobox')
  fireEvent.change(combobox, { target: { value: name } })
  fireEvent.click(screen.getByRole('option', { name: new RegExp(name) }))
}

function goToStep(target: number) {
  for (let i = 0; i < target; i++) {
    if (i === 0) selectDepartureCity('London')
    if (i === 2)
      fireEvent.change(screen.getByLabelText('Roughly when do you want to go?'), {
        target: { value: '6' },
      })
    fireEvent.click(screen.getByRole('button', { name: /next|reveal my holiday/i }))
  }
}

describe('buildResultsQuery', () => {
  it('includes styles when travel styles are selected', () => {
    const query = buildResultsQuery({
      city: london,
      budget: 1500,
      month: 6,
      nights: 7,
      travelStyles: ['beach', 'city'],
      maxDistance: 10000,
      groupSize: 2,
    })
    const params = new URLSearchParams(query)
    expect(params.get('originId')).toBe('london-uk')
    expect(params.get('budget')).toBe('1500')
    expect(params.get('distance')).toBe('10000')
    expect(params.get('nights')).toBe('7')
    expect(params.get('groupSize')).toBe('2')
    expect(params.get('month')).toBe('6')
    expect(params.get('styles')).toBe('beach,city')
  })

  it('omits styles when no travel styles are selected', () => {
    const query = buildResultsQuery({
      city: london,
      budget: 1500,
      month: 6,
      nights: 7,
      travelStyles: [],
      maxDistance: 10000,
      groupSize: 2,
    })
    const params = new URLSearchParams(query)
    expect(params.has('styles')).toBe(false)
  })
})

describe('DiscoverWizard', () => {
  beforeEach(() => {
    push.mockClear()
  })

  it('renders the first step with progress and a disabled Next button', () => {
    render(<DiscoverWizard />)
    expect(screen.getByText('Step 1 of 5: Departure')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Back' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled()
  })

  it('enables Next once a departure city is selected, then advances to the Budget step', () => {
    render(<DiscoverWizard />)
    selectDepartureCity('London')
    const next = screen.getByRole('button', { name: 'Next' })
    expect(next).toBeEnabled()
    fireEvent.click(next)
    expect(screen.getByText('Step 2 of 5: Budget')).toBeInTheDocument()
  })

  it('lets Back navigate to the previous step and re-disable itself at step 0', () => {
    render(<DiscoverWizard />)
    selectDepartureCity('London')
    fireEvent.click(screen.getByRole('button', { name: 'Next' }))
    expect(screen.getByText('Step 2 of 5: Budget')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Back' }))
    expect(screen.getByText('Step 1 of 5: Departure')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Back' })).toBeDisabled()
  })

  it('does not require a budget change to proceed past the Budget step', () => {
    render(<DiscoverWizard />)
    selectDepartureCity('London')
    fireEvent.click(screen.getByRole('button', { name: 'Next' }))
    fireEvent.click(screen.getByRole('button', { name: 'Next' }))
    expect(screen.getByText('Step 3 of 5: When')).toBeInTheDocument()
  })

  it('requires a month to be chosen before advancing past the When step', () => {
    render(<DiscoverWizard />)
    selectDepartureCity('London')
    fireEvent.click(screen.getByRole('button', { name: 'Next' }))
    fireEvent.click(screen.getByRole('button', { name: 'Next' }))
    expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled()

    fireEvent.change(screen.getByLabelText('Roughly when do you want to go?'), {
      target: { value: '6' },
    })
    const next = screen.getByRole('button', { name: 'Next' })
    expect(next).toBeEnabled()
    fireEvent.click(next)
    expect(screen.getByText('Step 4 of 5: Style')).toBeInTheDocument()
  })

  it('does not require a travel style to proceed to the final step', () => {
    render(<DiscoverWizard />)
    goToStep(3)
    expect(screen.getByText('Step 4 of 5: Style')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Next' }))
    expect(screen.getByText('Step 5 of 5: Distance & group')).toBeInTheDocument()
  })

  it('lets the group-size stepper increase and decrease within bounds', () => {
    render(<DiscoverWizard />)
    goToStep(4)
    expect(screen.getByText('Step 5 of 5: Distance & group')).toBeInTheDocument()

    const increase = screen.getByRole('button', { name: 'Increase group size' })
    const decrease = screen.getByRole('button', { name: 'Decrease group size' })
    expect(screen.getByText('2 travellers')).toBeInTheDocument()

    fireEvent.click(increase)
    expect(screen.getByText('3 travellers')).toBeInTheDocument()

    fireEvent.click(decrease)
    fireEvent.click(decrease)
    expect(screen.getByText('1 traveller')).toBeInTheDocument()
    expect(decrease).toBeDisabled()
  })

  it('shows "Reveal my holiday" as the final step label', () => {
    render(<DiscoverWizard />)
    goToStep(4)
    expect(screen.getByRole('button', { name: 'Reveal my holiday' })).toBeInTheDocument()
  })

  it('selects travel styles on the Style step', () => {
    render(<DiscoverWizard />)
    goToStep(3)
    const beach = screen.getByRole('button', { name: /beach/i })
    expect(beach).toHaveAttribute('aria-pressed', 'false')
    fireEvent.click(beach)
    expect(beach).toHaveAttribute('aria-pressed', 'true')
  })

  it('navigates to /results with the built query string on final submit', () => {
    render(<DiscoverWizard />)
    goToStep(4)
    fireEvent.click(screen.getByRole('button', { name: 'Reveal my holiday' }))

    expect(push).toHaveBeenCalledOnce()
    const [url] = push.mock.calls[0]
    expect(url.startsWith('/results?')).toBe(true)
    const params = new URLSearchParams(url.split('?')[1])
    expect(params.get('originId')).toBe('london-uk')
    expect(params.get('month')).toBe('6')
  })
})
