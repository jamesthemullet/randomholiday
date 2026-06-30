import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Input } from '@/components/Input'

describe('Input', () => {
  it('renders label and input', () => {
    render(<Input id="name" label="Full name" />)
    expect(screen.getByLabelText('Full name')).toBeInTheDocument()
    expect(screen.getByRole('textbox')).toBeInTheDocument()
  })

  it('associates label with input via id', () => {
    render(<Input id="email" label="Email" />)
    const input = screen.getByLabelText('Email')
    expect(input).toHaveAttribute('id', 'email')
  })

  it('renders without error state', () => {
    render(<Input id="test" label="Test" />)
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    expect(screen.getByRole('textbox')).not.toHaveAttribute('aria-invalid')
    expect(screen.getByRole('textbox')).not.toHaveAttribute('aria-describedby')
  })

  it('renders error message with ARIA attributes', () => {
    render(<Input id="test" label="Test" error="Required field" />)
    const errorEl = screen.getByRole('alert')
    expect(errorEl).toHaveTextContent('Required field')
    expect(errorEl).toHaveAttribute('id', 'test-error')
    const input = screen.getByRole('textbox')
    expect(input).toHaveAttribute('aria-invalid', 'true')
    expect(input).toHaveAttribute('aria-describedby', 'test-error')
  })

  it('applies inputError class on error', () => {
    render(<Input id="test" label="Test" error="Error" />)
    expect(screen.getByRole('textbox').className).toContain('inputError')
  })

  it('applies extra className', () => {
    render(<Input id="test" label="Test" className="custom" />)
    expect(screen.getByRole('textbox')).toHaveClass('custom')
  })

  it('calls onChange handler', () => {
    const onChange = vi.fn()
    render(<Input id="test" label="Test" onChange={onChange} />)
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'hello' } })
    expect(onChange).toHaveBeenCalled()
  })

  it('passes through additional props', () => {
    render(<Input id="test" label="Test" placeholder="Enter text" type="email" />)
    const input = screen.getByRole('textbox')
    expect(input).toHaveAttribute('placeholder', 'Enter text')
    expect(input).toHaveAttribute('type', 'email')
  })
})
