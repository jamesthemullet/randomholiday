import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Hero } from '@/components/Hero'

describe('Hero', () => {
  it('renders the heading', () => {
    render(<Hero />)
    expect(
      screen.getByRole('heading', { level: 1, name: 'Your next adventure is one click away' })
    ).toBeInTheDocument()
  })

  it('renders the tagline', () => {
    render(<Hero />)
    expect(screen.getByText(/we'll surprise you with the perfect/i)).toBeInTheDocument()
  })

  it('renders a CTA link to /discover', () => {
    render(<Hero />)
    const cta = screen.getByRole('link', { name: 'Find My Holiday' })
    expect(cta).toHaveAttribute('href', '/discover')
  })

  it('renders the animated globe as an accessible image', () => {
    render(<Hero />)
    expect(
      screen.getByRole('img', { name: 'Animated illustration of a spinning globe' })
    ).toBeInTheDocument()
  })

  it('renders the section labelled by the heading', () => {
    render(<Hero />)
    const heading = screen.getByRole('heading', { level: 1 })
    const section = heading.closest('section')
    expect(section).toHaveAttribute('aria-labelledby', 'hero-heading')
    expect(heading).toHaveAttribute('id', 'hero-heading')
  })
})
