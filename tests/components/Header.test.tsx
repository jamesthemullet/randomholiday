import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Header } from '@/components/Header'

describe('Header', () => {
  it('renders a header element', () => {
    render(<Header />)
    expect(screen.getByRole('banner')).toBeInTheDocument()
  })

  it('renders brand link', () => {
    render(<Header />)
    const brand = screen.getByRole('link', { name: 'RandomHoliday home' })
    expect(brand).toHaveAttribute('href', '/')
    expect(brand).toHaveTextContent('RandomHoliday')
  })

  it('renders main navigation', () => {
    render(<Header />)
    expect(screen.getByRole('navigation', { name: 'Main navigation' })).toBeInTheDocument()
  })

  it('renders Home nav link', () => {
    render(<Header />)
    expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute('href', '/')
  })

  it('renders Discover nav link', () => {
    render(<Header />)
    expect(screen.getByRole('link', { name: 'Discover' })).toHaveAttribute('href', '/discover')
  })

  it('renders nav links in a list', () => {
    render(<Header />)
    const nav = screen.getByRole('navigation', { name: 'Main navigation' })
    expect(nav.querySelector('ul')).toBeInTheDocument()
  })
})
