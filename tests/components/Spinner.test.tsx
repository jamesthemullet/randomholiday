import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Spinner } from '@/components/Spinner'

describe('Spinner', () => {
  it('renders with default props', () => {
    render(<Spinner />)
    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('renders default loading label', () => {
    render(<Spinner />)
    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('renders custom label', () => {
    render(<Spinner label="Fetching results..." />)
    expect(screen.getByText('Fetching results...')).toBeInTheDocument()
  })

  it('renders sm size', () => {
    render(<Spinner size="sm" />)
    expect(screen.getByRole('status').className).toContain('sm')
  })

  it('renders md size (default)', () => {
    render(<Spinner />)
    expect(screen.getByRole('status').className).toContain('md')
  })

  it('renders lg size', () => {
    render(<Spinner size="lg" />)
    expect(screen.getByRole('status').className).toContain('lg')
  })

  it('renders globe SVG as aria-hidden', () => {
    render(<Spinner />)
    const svg = screen.getByRole('status').querySelector('svg')
    expect(svg).toHaveAttribute('aria-hidden', 'true')
  })

  it('has accessible text via sr-only span', () => {
    render(<Spinner label="Please wait" />)
    const statusEl = screen.getByRole('status')
    expect(statusEl).toHaveTextContent('Please wait')
  })
})
