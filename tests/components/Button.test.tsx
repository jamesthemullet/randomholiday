import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Button } from '@/components/Button'

describe('Button', () => {
  it('renders with default props', () => {
    render(<Button>Click me</Button>)
    const btn = screen.getByRole('button', { name: 'Click me' })
    expect(btn).toBeInTheDocument()
    expect(btn).not.toBeDisabled()
    expect(btn).not.toHaveAttribute('aria-busy')
  })

  it('renders primary variant', () => {
    render(<Button variant="primary">Primary</Button>)
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('renders secondary variant', () => {
    render(<Button variant="secondary">Secondary</Button>)
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('renders ghost variant', () => {
    render(<Button variant="ghost">Ghost</Button>)
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('renders danger variant', () => {
    render(<Button variant="danger">Danger</Button>)
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('renders sm size', () => {
    render(<Button size="sm">Small</Button>)
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('renders md size', () => {
    render(<Button size="md">Medium</Button>)
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('renders lg size', () => {
    render(<Button size="lg">Large</Button>)
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('shows spinner and disables when loading', () => {
    render(<Button isLoading>Submit</Button>)
    const btn = screen.getByRole('button')
    expect(btn).toBeDisabled()
    expect(btn).toHaveAttribute('aria-busy', 'true')
    expect(btn.querySelector('[aria-hidden="true"]')).toBeInTheDocument()
  })

  it('hides text visually when loading', () => {
    render(<Button isLoading>Submit</Button>)
    const labelSpan = screen.getByText('Submit').closest('span')
    expect(labelSpan?.className).toContain('visuallyHidden')
  })

  it('does not have aria-busy when not loading', () => {
    render(<Button>Submit</Button>)
    expect(screen.getByRole('button')).not.toHaveAttribute('aria-busy')
  })

  it('has no spinner when not loading', () => {
    render(<Button>Submit</Button>)
    expect(screen.getByRole('button').querySelector('[aria-hidden="true"]')).not.toBeInTheDocument()
  })

  it('is disabled when disabled prop passed', () => {
    render(<Button disabled>Disabled</Button>)
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('is disabled when isLoading (second OR branch)', () => {
    render(<Button isLoading>Loading</Button>)
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('applies extra className', () => {
    render(<Button className="my-class">Label</Button>)
    expect(screen.getByRole('button')).toHaveClass('my-class')
  })

  it('calls onClick when clicked', () => {
    const onClick = vi.fn()
    render(<Button onClick={onClick}>Click</Button>)
    fireEvent.click(screen.getByRole('button'))
    expect(onClick).toHaveBeenCalledOnce()
  })

  it('does not call onClick when disabled', () => {
    const onClick = vi.fn()
    render(
      <Button disabled onClick={onClick}>
        Disabled
      </Button>
    )
    fireEvent.click(screen.getByRole('button'))
    expect(onClick).not.toHaveBeenCalled()
  })

  it('passes through additional props', () => {
    render(
      <Button type="submit" data-testid="btn">
        Label
      </Button>
    )
    const btn = screen.getByTestId('btn')
    expect(btn).toHaveAttribute('type', 'submit')
  })
})
