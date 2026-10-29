import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Hero } from '@/components/Hero'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}))

describe('Hero', () => {
  it('renders the heading', () => {
    render(<Hero />)
    expect(screen.getByRole('heading', { level: 1, name: 'Take me anywhere.' })).toBeInTheDocument()
  })

  it('renders the tagline', () => {
    render(<Hero />)
    expect(screen.getByText(/we'll surprise you with the perfect/i)).toBeInTheDocument()
  })

  it('renders the background photo with alt text', () => {
    render(<Hero />)
    expect(screen.getByRole('img', { name: 'Santorini, Greece' })).toBeInTheDocument()
  })

  it('renders the trip search form inline', () => {
    render(<Hero />)
    expect(screen.getByRole('form', { name: 'Find your holiday' })).toBeInTheDocument()
  })

  it('renders the section labelled by the heading', () => {
    render(<Hero />)
    const heading = screen.getByRole('heading', { level: 1 })
    const section = heading.closest('section')
    expect(section).toHaveAttribute('aria-labelledby', 'hero-heading')
    expect(heading).toHaveAttribute('id', 'hero-heading')
  })
})
