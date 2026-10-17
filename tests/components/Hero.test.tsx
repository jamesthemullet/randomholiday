import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Hero } from '@/components/Hero'
import { departureCities } from '@/lib/departureCities'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}))

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

  it('renders the trip search form inline instead of linking to another page', () => {
    render(<Hero />)
    expect(screen.getByRole('form', { name: 'Find your holiday' })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Find My Holiday' })).not.toBeInTheDocument()
  })

  it('passes initial values through to the form', () => {
    render(<Hero initialValues={{ city: departureCities[0] }} />)
    expect(screen.getByRole('combobox', { name: 'Where are you flying from?' })).toHaveValue(
      departureCities[0].name
    )
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
