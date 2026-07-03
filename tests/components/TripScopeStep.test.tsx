import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TripScopeStep, formatDistance, clampGroupSize } from '@/components/TripScopeStep'

describe('TripScopeStep', () => {
  const defaultProps = {
    maxDistance: 5000,
    onMaxDistanceChange: vi.fn(),
    groupSize: 2,
    onGroupSizeChange: vi.fn(),
  }

  it('renders the distance slider and group size stepper', () => {
    render(<TripScopeStep {...defaultProps} />)
    expect(screen.getByRole('slider', { name: 'Max travel distance' })).toBeInTheDocument()
    expect(screen.getByRole('group', { name: 'Group size' })).toBeInTheDocument()
  })

  it('displays the formatted distance value', () => {
    render(<TripScopeStep {...defaultProps} maxDistance={5000} />)
    expect(screen.getByText('5,000 km')).toBeInTheDocument()
  })

  it('displays "Anywhere" when distance is at the max limit', () => {
    render(<TripScopeStep {...defaultProps} maxDistance={20000} maxDistanceLimit={20000} />)
    expect(screen.getByText('Anywhere')).toBeInTheDocument()
  })

  it('calls onMaxDistanceChange with the numeric slider value', () => {
    const onMaxDistanceChange = vi.fn()
    render(<TripScopeStep {...defaultProps} onMaxDistanceChange={onMaxDistanceChange} />)
    fireEvent.change(screen.getByRole('slider', { name: 'Max travel distance' }), {
      target: { value: '8000' },
    })
    expect(onMaxDistanceChange).toHaveBeenCalledWith(8000)
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

  it('accepts a custom max distance limit and group size range', () => {
    render(
      <TripScopeStep
        {...defaultProps}
        maxDistanceLimit={10000}
        minGroupSize={2}
        maxGroupSize={6}
        groupSize={2}
      />
    )
    expect(screen.getByRole('slider', { name: 'Max travel distance' })).toHaveAttribute(
      'max',
      '10000'
    )
    expect(screen.getByRole('button', { name: 'Decrease group size' })).toBeDisabled()
  })
})

describe('formatDistance', () => {
  it('formats a value below max with thousands separators and unit', () => {
    expect(formatDistance(5000, 20000)).toBe('5,000 km')
  })

  it('returns "Anywhere" when value equals max', () => {
    expect(formatDistance(20000, 20000)).toBe('Anywhere')
  })

  it('returns "Anywhere" when value exceeds max', () => {
    expect(formatDistance(25000, 20000)).toBe('Anywhere')
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
