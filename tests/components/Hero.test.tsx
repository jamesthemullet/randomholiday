import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Hero } from '@/components/Hero'
import { getHeroPhoto } from '@/lib/heroPhoto'

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

  it("renders today's background photo with matching alt text and caption", () => {
    const { label } = getHeroPhoto(new Date())
    render(<Hero />)
    expect(screen.getByRole('img', { name: label })).toBeInTheDocument()
    expect(screen.getByText(label, { selector: 'span' })).toBeInTheDocument()
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
