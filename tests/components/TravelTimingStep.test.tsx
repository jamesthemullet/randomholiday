import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { TravelTimingStep, getMonthOptions } from '@/components/TravelTimingStep'

describe('getMonthOptions', () => {
  it('returns all 12 months, in order, with 1-indexed values', () => {
    const options = getMonthOptions()
    expect(options).toHaveLength(12)
    expect(options[0]).toEqual({ value: '1', label: 'January' })
    expect(options[11]).toEqual({ value: '12', label: 'December' })
  })
})

describe('TravelTimingStep', () => {
  const defaultProps = {
    month: null,
    onMonthChange: vi.fn(),
    nights: 7,
    onNightsChange: vi.fn(),
  }

  it('renders a month select with no month chosen by default', () => {
    render(<TravelTimingStep {...defaultProps} />)
    expect(screen.getByLabelText('Roughly when do you want to go?')).toHaveValue('')
  })

  it('reflects the selected month', () => {
    render(<TravelTimingStep {...defaultProps} month={6} />)
    expect(screen.getByLabelText('Roughly when do you want to go?')).toHaveValue('6')
  })

  it('calls onMonthChange with a number when a month is picked', () => {
    const onMonthChange = vi.fn()
    render(<TravelTimingStep {...defaultProps} onMonthChange={onMonthChange} />)
    fireEvent.change(screen.getByLabelText('Roughly when do you want to go?'), {
      target: { value: '9' },
    })
    expect(onMonthChange).toHaveBeenCalledWith(9)
  })

  it('renders the trip length slider with the current nights value', () => {
    render(<TravelTimingStep {...defaultProps} nights={10} />)
    expect(screen.getByLabelText('Trip length')).toHaveValue('10')
    expect(screen.getByText('10 nights')).toBeInTheDocument()
  })

  it('uses singular "night" for a one-night trip', () => {
    render(<TravelTimingStep {...defaultProps} nights={1} />)
    expect(screen.getByText('1 night')).toBeInTheDocument()
  })

  it('calls onNightsChange with a number when the slider moves', () => {
    const onNightsChange = vi.fn()
    render(<TravelTimingStep {...defaultProps} onNightsChange={onNightsChange} />)
    fireEvent.change(screen.getByLabelText('Trip length'), { target: { value: '14' } })
    expect(onNightsChange).toHaveBeenCalledWith(14)
  })

  it('respects custom min/max nights bounds', () => {
    render(<TravelTimingStep {...defaultProps} minNights={3} maxNights={30} />)
    const slider = screen.getByLabelText('Trip length')
    expect(slider).toHaveAttribute('min', '3')
    expect(slider).toHaveAttribute('max', '30')
  })
})
