import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Badge } from '@/components/Badge'

describe('Badge', () => {
  it('renders children', () => {
    render(<Badge>New</Badge>)
    expect(screen.getByText('New')).toBeInTheDocument()
  })

  it('renders with default variant', () => {
    render(<Badge>Label</Badge>)
    const badge = screen.getByText('Label')
    expect(badge.className).toContain('default')
  })

  it('renders primary variant', () => {
    render(<Badge variant="primary">Primary</Badge>)
    expect(screen.getByText('Primary').className).toContain('primary')
  })

  it('renders secondary variant', () => {
    render(<Badge variant="secondary">Secondary</Badge>)
    expect(screen.getByText('Secondary').className).toContain('secondary')
  })

  it('renders success variant', () => {
    render(<Badge variant="success">Success</Badge>)
    expect(screen.getByText('Success').className).toContain('success')
  })

  it('renders warning variant', () => {
    render(<Badge variant="warning">Warning</Badge>)
    expect(screen.getByText('Warning').className).toContain('warning')
  })

  it('renders danger variant', () => {
    render(<Badge variant="danger">Danger</Badge>)
    expect(screen.getByText('Danger').className).toContain('danger')
  })

  it('applies extra className', () => {
    render(<Badge className="extra">Label</Badge>)
    expect(screen.getByText('Label')).toHaveClass('extra')
  })

  it('renders as a span element', () => {
    render(<Badge>Label</Badge>)
    expect(screen.getByText('Label').tagName).toBe('SPAN')
  })
})
