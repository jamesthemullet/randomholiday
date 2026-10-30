import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import HomePage from '@/app/page'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}))

describe('HomePage', () => {
  it('renders the hero and the trip search form', () => {
    render(<HomePage />)

    expect(screen.getByRole('heading', { level: 1, name: 'Take me anywhere.' })).toBeInTheDocument()
    expect(screen.getByRole('form', { name: 'Find your holiday' })).toBeInTheDocument()
  })
})
