import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { BudgetSlider, formatBudget } from '@/components/BudgetSlider'

describe('BudgetSlider', () => {
  const defaultProps = {
    value: 1000,
    onChange: vi.fn(),
  }

  it('renders the default label and slider', () => {
    render(<BudgetSlider {...defaultProps} />)
    expect(screen.getByText('Budget per person')).toBeInTheDocument()
    expect(screen.getByRole('slider')).toBeInTheDocument()
  })

  it('renders a custom label and id', () => {
    render(<BudgetSlider {...defaultProps} id="trip-budget" label="Trip budget" />)
    expect(screen.getByText('Trip budget')).toBeInTheDocument()
    expect(screen.getByRole('slider')).toHaveAttribute('id', 'trip-budget')
  })

  it('displays the value formatted as USD currency', () => {
    render(<BudgetSlider {...defaultProps} value={1200} />)
    expect(screen.getByText('$1,200')).toBeInTheDocument()
  })

  it('appends a "+" suffix when the value is at the max', () => {
    render(<BudgetSlider {...defaultProps} value={5000} max={5000} />)
    expect(screen.getByText('$5,000+')).toBeInTheDocument()
  })

  it('uses default min, max, and step of 200, 5000, and 50', () => {
    render(<BudgetSlider {...defaultProps} />)
    const slider = screen.getByRole('slider')
    expect(slider).toHaveAttribute('min', '200')
    expect(slider).toHaveAttribute('max', '5000')
    expect(slider).toHaveAttribute('step', '50')
  })

  it('accepts custom min, max, and step', () => {
    render(<BudgetSlider {...defaultProps} min={0} max={10000} step={100} />)
    const slider = screen.getByRole('slider')
    expect(slider).toHaveAttribute('min', '0')
    expect(slider).toHaveAttribute('max', '10000')
    expect(slider).toHaveAttribute('step', '100')
  })

  it('calls onChange with the numeric value', () => {
    const onChange = vi.fn()
    render(<BudgetSlider {...defaultProps} onChange={onChange} />)
    fireEvent.change(screen.getByRole('slider'), { target: { value: '2500' } })
    expect(onChange).toHaveBeenCalledWith(2500)
  })

  it('renders the hint text', () => {
    render(<BudgetSlider {...defaultProps} />)
    expect(
      screen.getByText('Covers flights, hotel, and daily spending for your whole trip')
    ).toBeInTheDocument()
  })
})

describe('formatBudget', () => {
  it('formats a value below max as plain currency', () => {
    expect(formatBudget(1200, 5000)).toBe('$1,200')
  })

  it('appends a "+" suffix when value equals max', () => {
    expect(formatBudget(5000, 5000)).toBe('$5,000+')
  })

  it('appends a "+" suffix when value exceeds max', () => {
    expect(formatBudget(6000, 5000)).toBe('$6,000+')
  })
})
