import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TripScopeStep, clampGroupSize } from '@/components/TripScopeStep'

describe('TripScopeStep', () => {
  const defaultProps = {
    maxFlightHours: 5,
    onMaxFlightHoursChange: vi.fn(),
    groupSize: 2,
    onGroupSizeChange: vi.fn(),
  }

  const getFlightTimeSlider = () => screen.getByRole('slider', { name: 'Max flight time' })

  it('renders the flight-time slider and group size stepper', () => {
    render(<TripScopeStep {...defaultProps} />)
    expect(getFlightTimeSlider()).toBeInTheDocument()
    expect(screen.getByRole('group', { name: 'Group size' })).toBeInTheDocument()
  })

  it('displays the chosen flight-time limit', () => {
    render(<TripScopeStep {...defaultProps} maxFlightHours={8} />)
    expect(screen.getByText('Up to 8h')).toBeInTheDocument()
  })

  it('displays "Anywhere" at the longest option', () => {
    render(<TripScopeStep {...defaultProps} maxFlightHours={30} />)
    expect(getFlightTimeSlider()).toHaveAttribute('aria-valuetext', 'Anywhere')
  })

  it('snaps a limit between options to the option it falls under', () => {
    // An older ?distance= link can convert to any number of hours.
    render(<TripScopeStep {...defaultProps} maxFlightHours={6.75} />)
    expect(getFlightTimeSlider()).toHaveAttribute('aria-valuetext', 'Up to 8h')
  })

  it('steps through the fixed options and reports hours', () => {
    const onMaxFlightHoursChange = vi.fn()
    render(<TripScopeStep {...defaultProps} onMaxFlightHoursChange={onMaxFlightHoursChange} />)
    expect(getFlightTimeSlider()).toHaveAttribute('max', '4')
    fireEvent.change(getFlightTimeSlider(), { target: { value: '3' } })
    expect(onMaxFlightHoursChange).toHaveBeenCalledWith(12)
  })

  it('displays the group size count with plural label', () => {
    render(<TripScopeStep {...defaultProps} groupSize={2} />)
    expect(screen.getByText('2 travellers')).toBeInTheDocument()
  })

  it('displays the group size count with singular label', () => {
    render(<TripScopeStep {...defaultProps} groupSize={1} />)
    expect(screen.getByText('1 traveller')).toBeInTheDocument()
  })

  it('increases group size when the increase button is clicked', async () => {
    const user = userEvent.setup()
    const onGroupSizeChange = vi.fn()
    render(<TripScopeStep {...defaultProps} groupSize={2} onGroupSizeChange={onGroupSizeChange} />)
    await user.click(screen.getByRole('button', { name: 'Increase group size' }))
    expect(onGroupSizeChange).toHaveBeenCalledWith(3)
  })

  it('decreases group size when the decrease button is clicked', async () => {
    const user = userEvent.setup()
    const onGroupSizeChange = vi.fn()
    render(<TripScopeStep {...defaultProps} groupSize={2} onGroupSizeChange={onGroupSizeChange} />)
    await user.click(screen.getByRole('button', { name: 'Decrease group size' }))
    expect(onGroupSizeChange).toHaveBeenCalledWith(1)
  })

  it('disables the decrease button at the minimum group size', () => {
    render(<TripScopeStep {...defaultProps} groupSize={1} minGroupSize={1} />)
    expect(screen.getByRole('button', { name: 'Decrease group size' })).toBeDisabled()
  })

  it('disables the increase button at the maximum group size', () => {
    render(<TripScopeStep {...defaultProps} groupSize={10} maxGroupSize={10} />)
    expect(screen.getByRole('button', { name: 'Increase group size' })).toBeDisabled()
  })

  it('accepts a custom group size range', () => {
    render(<TripScopeStep {...defaultProps} minGroupSize={2} maxGroupSize={6} groupSize={2} />)
    expect(screen.getByRole('button', { name: 'Decrease group size' })).toBeDisabled()
  })
})

describe('clampGroupSize', () => {
  it('returns the value unchanged when within range', () => {
    expect(clampGroupSize(5, 1, 10)).toBe(5)
  })

  it('clamps to the minimum when below range', () => {
    expect(clampGroupSize(0, 1, 10)).toBe(1)
  })

  it('clamps to the maximum when above range', () => {
    expect(clampGroupSize(11, 1, 10)).toBe(10)
  })
})
