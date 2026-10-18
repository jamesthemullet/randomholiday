import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { TripForm } from '@/components/TripForm'
import { departureCities } from '@/lib/departureCities'

const push = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
}))

const london = departureCities.find((c) => c.id === 'london-uk')!

function getCombobox() {
  return screen.getByRole('combobox', { name: 'Where are you flying from?' })
}

function selectDepartureCity(name: string) {
  fireEvent.change(getCombobox(), { target: { value: name } })
  fireEvent.click(screen.getByRole('option', { name: new RegExp(name) }))
}

function getSubmit() {
  return screen.getByRole('button', { name: 'Surprise me' })
}

function getMoreToggle() {
  return screen.getByRole('button', { name: /more options/i })
}

function submittedParams(): URLSearchParams {
  expect(push).toHaveBeenCalledOnce()
  const [url] = push.mock.calls[0]
  expect(url.startsWith('/results?')).toBe(true)
  return new URLSearchParams(url.split('?')[1])
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
    expect(getCombobox()).toHaveValue('London')
    fireEvent.click(getSubmit())
    expect(submittedParams().get('originId')).toBe('london-uk')
  })

  it('re-disables Surprise me when the city text is edited after selecting', () => {
    render(<TripForm />)
    fireEvent.change(getCombobox(), { target: { value: 'Lond' } })
    expect(getSubmit()).toBeDisabled()
    selectDepartureCity('London')
    expect(getSubmit()).toBeEnabled()
  })

  it('does not navigate when submitted without a city', () => {
    render(<TripForm />)
    fireEvent.change(getCombobox(), { target: { value: '' } })
    fireEvent.submit(screen.getByRole('form', { name: 'Find your holiday' }))
    expect(push).not.toHaveBeenCalled()
  })

  it('submits with defaults, using next month as the travel month', () => {
    render(<TripForm />)
    fireEvent.click(getSubmit())

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

  it('keeps More options collapsed by default, summarising the month', () => {
    render(<TripForm />)
    expect(getMoreToggle()).toHaveAttribute('aria-expanded', 'false')
    expect(getMoreToggle()).toHaveTextContent('More optionsNov')
    expect(screen.queryByRole('group', { name: /roughly when/i })).not.toBeInTheDocument()
  })

  it('toggles More options open and closed', () => {
    render(<TripForm />)
    fireEvent.click(getMoreToggle())
    expect(getMoreToggle()).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByRole('group', { name: /roughly when/i })).toBeInTheDocument()
    fireEvent.click(getMoreToggle())
    expect(getMoreToggle()).toHaveAttribute('aria-expanded', 'false')
  })

  it('summarises chosen styles beside the collapsed toggle', () => {
    render(<TripForm />)
    fireEvent.click(getMoreToggle())
    fireEvent.click(screen.getByRole('button', { name: 'City' }))
    fireEvent.click(screen.getByRole('button', { name: 'Beach' }))
    fireEvent.click(getMoreToggle())
    expect(getMoreToggle()).toHaveTextContent('Nov · Beach, City')
  })

  it('includes values chosen under More options', () => {
    render(<TripForm />)
    fireEvent.click(getMoreToggle())
    fireEvent.click(screen.getByRole('button', { name: 'June' }))
    expect(screen.getByRole('button', { name: 'June' })).toHaveAttribute('aria-pressed', 'true')
    fireEvent.change(screen.getByLabelText('Trip length'), { target: { value: '10' } })
    fireEvent.click(screen.getByRole('button', { name: 'Beach' }))
    fireEvent.click(screen.getByRole('button', { name: 'Increase group size' }))
    fireEvent.click(getSubmit())

    const params = submittedParams()
    expect(params.get('month')).toBe('6')
    expect(params.get('nights')).toBe('10')
    expect(params.get('styles')).toBe('beach')
    expect(params.get('groupSize')).toBe('3')
  })

  it('does not submit when toggling styles, months or the group stepper', () => {
    render(<TripForm />)
    fireEvent.click(getMoreToggle())
    fireEvent.click(screen.getByRole('button', { name: 'March' }))
    fireEvent.click(screen.getByRole('button', { name: 'Beach' }))
    fireEvent.click(screen.getByRole('button', { name: 'Increase group size' }))
    expect(push).not.toHaveBeenCalled()
  })

  it('prefills from initial values with More options open, and can submit straight away', () => {
    render(
      <TripForm
        initialValues={{
          city: london,
          budget: 2500,
          nights: 4,
          month: 3,
          maxDistance: 10000,
          groupSize: 2,
        }}
      />
    )
    expect(getCombobox()).toHaveValue('London')
    expect(getMoreToggle()).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByRole('button', { name: 'March' })).toHaveAttribute('aria-pressed', 'true')

    fireEvent.click(getSubmit())
    const params = submittedParams()
    expect(params.get('budget')).toBe('2500')
    expect(params.get('nights')).toBe('4')
  })
})
