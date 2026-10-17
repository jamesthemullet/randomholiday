import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import NotFound from '@/app/not-found'

describe('NotFound', () => {
  it('renders a 404 heading', () => {
    render(<NotFound />)
    expect(screen.getByRole('heading', { name: /doesn't exist/i })).toBeInTheDocument()
  })

  it('renders a link back to home', () => {
    render(<NotFound />)
    const link = screen.getByRole('link', { name: 'Back to home' })
    expect(link).toHaveAttribute('href', '/')
  })

  it('renders inside a main landmark with id main-content', () => {
    render(<NotFound />)
    expect(screen.getByRole('main')).toHaveAttribute('id', 'main-content')
  })
})
