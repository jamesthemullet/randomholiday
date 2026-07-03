import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { TravelDatesPicker, getDateRangeError, getTripNights } from '@/components/TravelDatesPicker'

describe('TravelDatesPicker', () => {
  const defaultProps = {
    startDate: '',
    endDate: '',
    onStartDateChange: vi.fn(),
    onEndDateChange: vi.fn(),
  }

  it('renders default labels for both date inputs', () => {
    render(<TravelDatesPicker {...defaultProps} />)
    expect(screen.getByLabelText('Departure date')).toBeInTheDocument()
    expect(screen.getByLabelText('Return date')).toBeInTheDocument()
  })

  it('renders custom labels', () => {
    render(<TravelDatesPicker {...defaultProps} startLabel="Leave on" endLabel="Come back on" />)
    expect(screen.getByLabelText('Leave on')).toBeInTheDocument()
    expect(screen.getByLabelText('Come back on')).toBeInTheDocument()
  })

  it('calls onStartDateChange with the new value', () => {
    const onStartDateChange = vi.fn()
    render(<TravelDatesPicker {...defaultProps} onStartDateChange={onStartDateChange} />)
    fireEvent.change(screen.getByLabelText('Departure date'), { target: { value: '2026-08-01' } })
    expect(onStartDateChange).toHaveBeenCalledWith('2026-08-01')
  })

  it('calls onEndDateChange with the new value', () => {
    const onEndDateChange = vi.fn()
    render(<TravelDatesPicker {...defaultProps} onEndDateChange={onEndDateChange} />)
    fireEvent.change(screen.getByLabelText('Return date'), { target: { value: '2026-08-10' } })
    expect(onEndDateChange).toHaveBeenCalledWith('2026-08-10')
  })

  it('applies the minDate to the departure input when no start date is set', () => {
    render(<TravelDatesPicker {...defaultProps} minDate="2026-07-03" />)
    expect(screen.getByLabelText('Departure date')).toHaveAttribute('min', '2026-07-03')
  })

  it('uses the start date as the min for the return date once set', () => {
    render(<TravelDatesPicker {...defaultProps} startDate="2026-08-01" minDate="2026-07-03" />)
    expect(screen.getByLabelText('Return date')).toHaveAttribute('min', '2026-08-01')
  })

  it('shows an error when the return date is before the departure date', () => {
    render(<TravelDatesPicker {...defaultProps} startDate="2026-08-10" endDate="2026-08-01" />)
    expect(screen.getByRole('alert')).toHaveTextContent('Return date must be after departure date')
  })

  it('shows the number of nights when a valid range is selected', () => {
    render(<TravelDatesPicker {...defaultProps} startDate="2026-08-01" endDate="2026-08-08" />)
    expect(screen.getByRole('status')).toHaveTextContent('7 nights trip')
  })

  it('uses singular "night" for a one-night trip', () => {
    render(<TravelDatesPicker {...defaultProps} startDate="2026-08-01" endDate="2026-08-02" />)
    expect(screen.getByRole('status')).toHaveTextContent('1 night trip')
  })

  it('does not show a nights hint when dates are incomplete', () => {
    render(<TravelDatesPicker {...defaultProps} startDate="2026-08-01" />)
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })

  it('does not show a nights hint when the range is invalid', () => {
    render(<TravelDatesPicker {...defaultProps} startDate="2026-08-10" endDate="2026-08-01" />)
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })
})

describe('getDateRangeError', () => {
  it('returns undefined when either date is missing', () => {
    expect(getDateRangeError('', '')).toBeUndefined()
    expect(getDateRangeError('2026-08-01', '')).toBeUndefined()
    expect(getDateRangeError('', '2026-08-01')).toBeUndefined()
  })

  it('returns undefined for a valid range', () => {
    expect(getDateRangeError('2026-08-01', '2026-08-08')).toBeUndefined()
  })

  it('returns an error when the end date is before the start date', () => {
    expect(getDateRangeError('2026-08-10', '2026-08-01')).toBe(
      'Return date must be after departure date'
    )
  })
})

describe('getTripNights', () => {
  it('returns undefined when either date is missing', () => {
    expect(getTripNights('', '')).toBeUndefined()
    expect(getTripNights('2026-08-01', '')).toBeUndefined()
  })

  it('returns undefined when the range is invalid', () => {
    expect(getTripNights('2026-08-10', '2026-08-01')).toBeUndefined()
  })

  it('returns the number of nights between two dates', () => {
    expect(getTripNights('2026-08-01', '2026-08-08')).toBe(7)
  })
})
