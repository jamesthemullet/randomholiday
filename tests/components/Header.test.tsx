import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Header } from '@/components/Header'

const { usePathname } = vi.hoisted(() => ({ usePathname: vi.fn(() => '/') }))

vi.mock('next/navigation', () => ({ usePathname }))

afterEach(() => {
  usePathname.mockReturnValue('/')
})

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

  it('does not render a separate Discover nav link', () => {
    render(<Header />)
    expect(screen.queryByRole('link', { name: 'Discover' })).not.toBeInTheDocument()
  })

  it('renders Pricing nav link', () => {
    render(<Header />)
    expect(screen.getByRole('link', { name: 'Pricing' })).toHaveAttribute('href', '/pricing')
  })

  it('renders nav links in a list', () => {
    render(<Header />)
    const nav = screen.getByRole('navigation', { name: 'Main navigation' })
    expect(nav.querySelector('ul')).toBeInTheDocument()
  })

  it('does not render a dark mode toggle', () => {
    render(<Header />)
    expect(
      screen.queryByRole('button', { name: /switch to (dark|light) mode/i })
    ).not.toBeInTheDocument()
  })

  it('marks the nav link matching the current path with aria-current', () => {
    usePathname.mockReturnValue('/pricing')
    render(<Header />)
    expect(screen.getByRole('link', { name: 'Pricing' })).toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('link', { name: 'Home' })).not.toHaveAttribute('aria-current')
  })

  it('does not mark any nav link as current when the path matches none', () => {
    usePathname.mockReturnValue('/results')
    render(<Header />)
    expect(screen.getByRole('link', { name: 'Home' })).not.toHaveAttribute('aria-current')
    expect(screen.getByRole('link', { name: 'Pricing' })).not.toHaveAttribute('aria-current')
  })
})
