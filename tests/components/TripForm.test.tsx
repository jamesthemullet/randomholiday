import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { TripForm } from '@/components/TripForm'
import { departureCities } from '@/lib/departureCities'

const push = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
}))

const london = departureCities.find((c) => c.id === 'london-uk')!

function selectDepartureCity(name: string) {
  const combobox = screen.getByRole('combobox', { name: 'Where are you flying from?' })
  fireEvent.change(combobox, { target: { value: name } })
  fireEvent.click(screen.getByRole('option', { name: new RegExp(name) }))
}

function submittedParams(): URLSearchParams {
  expect(push).toHaveBeenCalledOnce()
  const [url] = push.mock.calls[0]
  expect(url.startsWith('/results?')).toBe(true)
  return new URLSearchParams(url.split('?')[1])
}

function getMoreOptions(): HTMLDetailsElement {
  return screen.getByText('More options').closest('details')!
}

describe('TripForm', () => {
  beforeEach(() => {
    push.mockClear()
    // Mid-October, so the default month is November.
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date(2026, 9, 17))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('starts with London chosen, so Surprise me works straight away', () => {
    render(<TripForm />)
    expect(screen.getByRole('combobox', { name: 'Where are you flying from?' })).toHaveValue(
      'London'
    )
    fireEvent.click(screen.getByRole('button', { name: 'Surprise me' }))
    expect(submittedParams().get('originId')).toBe('london-uk')
  })

  it('re-disables Surprise me when the city text is edited after selecting', () => {
    render(<TripForm />)
    fireEvent.change(screen.getByRole('combobox', { name: 'Where are you flying from?' }), {
      target: { value: 'Lond' },
    })
    expect(screen.getByRole('button', { name: 'Surprise me' })).toBeDisabled()
    selectDepartureCity('London')
    expect(screen.getByRole('button', { name: 'Surprise me' })).toBeEnabled()
  })

  it('does not navigate when submitted without a city', () => {
    render(<TripForm />)
    fireEvent.change(screen.getByRole('combobox', { name: 'Where are you flying from?' }), {
      target: { value: '' },
    })
    fireEvent.submit(screen.getByRole('form', { name: 'Find your holiday' }))
    expect(push).not.toHaveBeenCalled()
  })

  it('submits with defaults, using next month as the travel month', () => {
    render(<TripForm />)
    fireEvent.click(screen.getByRole('button', { name: 'Surprise me' }))

    const params = submittedParams()
    expect(params.get('originId')).toBe('london-uk')
    expect(params.get('budget')).toBe('1500')
    expect(params.get('nights')).toBe('7')
    expect(params.get('month')).toBe('11')
    expect(params.get('distance')).toBe('10000')
    expect(params.get('groupSize')).toBe('2')
    expect(params.has('styles')).toBe(false)
  })

  it('submits when the form is submitted directly (e.g. pressing Enter)', () => {
    render(<TripForm />)
    fireEvent.submit(screen.getByRole('form', { name: 'Find your holiday' }))
    expect(submittedParams().get('originId')).toBe('london-uk')
  })

  it('keeps More options collapsed by default', () => {
    render(<TripForm />)
    expect(getMoreOptions()).not.toHaveAttribute('open')
  })

  it('includes values chosen under More options', () => {
    render(<TripForm />)
    fireEvent.change(screen.getByLabelText('Roughly when do you want to go?'), {
      target: { value: '6' },
    })
    fireEvent.change(screen.getByLabelText('Trip length'), { target: { value: '10' } })
    fireEvent.click(screen.getByRole('button', { name: /beach/i }))
    fireEvent.click(screen.getByRole('button', { name: 'Increase group size' }))
    fireEvent.click(screen.getByRole('button', { name: 'Surprise me' }))

    const params = submittedParams()
    expect(params.get('month')).toBe('6')
    expect(params.get('nights')).toBe('10')
    expect(params.get('styles')).toBe('beach')
    expect(params.get('groupSize')).toBe('3')
  })

  it('does not submit when toggling styles or the group stepper', () => {
    render(<TripForm />)
    fireEvent.click(screen.getByRole('button', { name: /beach/i }))
    fireEvent.click(screen.getByRole('button', { name: 'Increase group size' }))
    expect(push).not.toHaveBeenCalled()
  })

  it('prefills from initial values and can submit straight away', () => {
    render(
      <TripForm
        initialValues={{
          city: london,
          budget: 2500,
          nights: 4,
          month: 11,
          maxDistance: 10000,
          groupSize: 2,
        }}
      />
    )
    expect(screen.getByRole('combobox', { name: 'Where are you flying from?' })).toHaveValue(
      'London'
    )
    expect(getMoreOptions()).not.toHaveAttribute('open')

    fireEvent.click(screen.getByRole('button', { name: 'Surprise me' }))
    const params = submittedParams()
    expect(params.get('budget')).toBe('2500')
    expect(params.get('nights')).toBe('4')
  })

  it.each([
    ['a non-default month', { month: 3 }],
    ['travel styles', { travelStyles: ['city' as const] }],
    ['a non-default distance', { maxDistance: 4000 }],
    ['a non-default group size', { groupSize: 5 }],
  ])('opens More options when initial values include %s', (_, initialValues) => {
    render(<TripForm initialValues={initialValues} />)
    expect(getMoreOptions()).toHaveAttribute('open')
  })
})
