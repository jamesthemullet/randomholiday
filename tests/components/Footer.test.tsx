import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Footer } from '@/components/Footer'

describe('Footer', () => {
  it('renders a footer element', () => {
    render(<Footer />)
    expect(screen.getByRole('contentinfo')).toBeInTheDocument()
  })

  it('renders copyright text', () => {
    render(<Footer />)
    expect(screen.getByText(/RandomHoliday\. All rights reserved\./)).toBeInTheDocument()
  })

  it('renders year in copyright', () => {
    render(<Footer />)
    const year = new Date().getFullYear().toString()
    expect(screen.getByText(new RegExp(year))).toBeInTheDocument()
  })

  it('renders a Wikipedia attribution link', () => {
    render(<Footer />)
    expect(screen.getByRole('link', { name: 'Wikipedia' })).toHaveAttribute(
      'href',
      'https://www.wikipedia.org/'
    )
  })

  it('does not render a footer navigation with dead links', () => {
    render(<Footer />)
    expect(screen.queryByRole('navigation', { name: 'Footer navigation' })).not.toBeInTheDocument()
  })
})
