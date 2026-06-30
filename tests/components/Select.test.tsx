import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Select } from '@/components/Select'

const OPTIONS = [
  { value: 'beach', label: 'Beach' },
  { value: 'city', label: 'City' },
  { value: 'adventure', label: 'Adventure' },
]

describe('Select', () => {
  const defaultProps = {
    id: 'style',
    label: 'Travel style',
    options: OPTIONS,
    value: '',
    onChange: vi.fn(),
  }

  it('renders label and select', () => {
    render(<Select {...defaultProps} />)
    expect(screen.getByLabelText('Travel style')).toBeInTheDocument()
  })

  it('renders all options', () => {
    render(<Select {...defaultProps} />)
    expect(screen.getByRole('option', { name: 'Beach' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'City' })).toBeInTheDocument()
  })

  it('renders placeholder option when provided', () => {
    render(<Select {...defaultProps} placeholder="Choose a style" />)
    expect(screen.getByRole('option', { name: 'Choose a style' })).toBeInTheDocument()
  })

  it('does not render placeholder when not provided', () => {
    render(<Select {...defaultProps} />)
    expect(screen.queryByRole('option', { name: /choose/i })).not.toBeInTheDocument()
  })

  it('renders without error state', () => {
    render(<Select {...defaultProps} />)
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    expect(screen.getByLabelText('Travel style')).not.toHaveAttribute('aria-invalid')
  })

  it('renders error message with ARIA attributes', () => {
    render(<Select {...defaultProps} error="Please select an option" />)
    const errorEl = screen.getByRole('alert')
    expect(errorEl).toHaveTextContent('Please select an option')
    expect(errorEl).toHaveAttribute('id', 'style-error')
    const select = screen.getByLabelText('Travel style')
    expect(select).toHaveAttribute('aria-invalid', 'true')
    expect(select).toHaveAttribute('aria-describedby', 'style-error')
  })

  it('applies selectError class on error', () => {
    render(<Select {...defaultProps} error="Error" />)
    expect(screen.getByLabelText('Travel style').className).toContain('selectError')
  })

  it('is disabled when disabled=true', () => {
    render(<Select {...defaultProps} disabled />)
    expect(screen.getByLabelText('Travel style')).toBeDisabled()
  })

  it('calls onChange with selected value', () => {
    const onChange = vi.fn()
    render(<Select {...defaultProps} onChange={onChange} />)
    fireEvent.change(screen.getByLabelText('Travel style'), {
      target: { value: 'beach' },
    })
    expect(onChange).toHaveBeenCalledWith('beach')
  })

  it('displays selected value', () => {
    render(<Select {...defaultProps} value="city" />)
    expect(screen.getByLabelText('Travel style')).toHaveValue('city')
  })
})
