import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Slider } from '@/components/Slider'

describe('Slider', () => {
  const defaultProps = {
    id: 'budget',
    label: 'Budget',
    min: 0,
    max: 1000,
    value: 500,
    onChange: vi.fn(),
  }

  it('renders label and slider', () => {
    render(<Slider {...defaultProps} />)
    expect(screen.getByText('Budget')).toBeInTheDocument()
    expect(screen.getByRole('slider')).toBeInTheDocument()
  })

  it('displays numeric value when no formatValue', () => {
    render(<Slider {...defaultProps} value={300} />)
    expect(screen.getByText('300')).toBeInTheDocument()
  })

  it('displays formatted value when formatValue provided', () => {
    render(<Slider {...defaultProps} value={500} formatValue={(v) => `£${v.toLocaleString()}`} />)
    expect(screen.getByText('£500')).toBeInTheDocument()
  })

  it('sets correct ARIA attributes on slider', () => {
    render(<Slider {...defaultProps} min={100} max={900} value={500} />)
    const slider = screen.getByRole('slider')
    expect(slider).toHaveAttribute('aria-valuemin', '100')
    expect(slider).toHaveAttribute('aria-valuemax', '900')
    expect(slider).toHaveAttribute('aria-valuenow', '500')
    expect(slider).toHaveAttribute('aria-valuetext', '500')
  })

  it('sets aria-valuetext to formatted value', () => {
    render(<Slider {...defaultProps} value={250} formatValue={(v) => `$${v}`} />)
    expect(screen.getByRole('slider')).toHaveAttribute('aria-valuetext', '$250')
  })

  it('calls onChange with numeric value on change', () => {
    const onChange = vi.fn()
    render(<Slider {...defaultProps} onChange={onChange} />)
    fireEvent.change(screen.getByRole('slider'), { target: { value: '750' } })
    expect(onChange).toHaveBeenCalledWith(750)
  })

  it('uses step=1 by default', () => {
    render(<Slider {...defaultProps} />)
    expect(screen.getByRole('slider')).toHaveAttribute('step', '1')
  })

  it('uses custom step when provided', () => {
    render(<Slider {...defaultProps} step={50} />)
    expect(screen.getByRole('slider')).toHaveAttribute('step', '50')
  })

  it('sets min and max on input', () => {
    render(<Slider {...defaultProps} min={10} max={500} />)
    const slider = screen.getByRole('slider')
    expect(slider).toHaveAttribute('min', '10')
    expect(slider).toHaveAttribute('max', '500')
  })
})
