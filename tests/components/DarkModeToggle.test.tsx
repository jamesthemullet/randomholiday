import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { DarkModeToggle } from '@/components/DarkModeToggle'

function setMatchMedia(matches: boolean) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: (query: string) => ({
      matches,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }),
  })
}

describe('DarkModeToggle', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.removeAttribute('data-theme')
    setMatchMedia(false) // default: prefers light
  })

  afterEach(() => {
    document.documentElement.removeAttribute('data-theme')
  })

  it('renders a toggle button', () => {
    render(<DarkModeToggle />)
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('shows light mode state by default (no localStorage, prefers light)', async () => {
    render(<DarkModeToggle />)
    await waitFor(() => {
      expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'false')
      expect(screen.getByRole('button')).toHaveAttribute('aria-label', 'Switch to dark mode')
    })
  })

  it('reads light mode from localStorage (first OR branch)', async () => {
    localStorage.setItem('theme', 'light')
    render(<DarkModeToggle />)
    await waitFor(() => {
      expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'false')
    })
    expect(document.documentElement).toHaveAttribute('data-theme', 'light')
  })

  it('reads dark mode from localStorage (second OR branch)', async () => {
    localStorage.setItem('theme', 'dark')
    render(<DarkModeToggle />)
    await waitFor(() => {
      expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'true')
      expect(screen.getByRole('button')).toHaveAttribute('aria-label', 'Switch to light mode')
    })
    expect(document.documentElement).toHaveAttribute('data-theme', 'dark')
  })

  it('falls back to matchMedia dark when no localStorage', async () => {
    setMatchMedia(true) // prefers dark
    render(<DarkModeToggle />)
    await waitFor(() => {
      expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'true')
    })
    expect(document.documentElement).toHaveAttribute('data-theme', 'dark')
  })

  it('falls back to matchMedia light when no localStorage', async () => {
    setMatchMedia(false) // prefers light
    render(<DarkModeToggle />)
    await waitFor(() => {
      expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'false')
    })
    expect(document.documentElement).toHaveAttribute('data-theme', 'light')
  })

  it('shows "Dark" text in light mode', async () => {
    render(<DarkModeToggle />)
    await waitFor(() => {
      expect(screen.getByText('Dark')).toBeInTheDocument()
    })
  })

  it('shows "Light" text in dark mode', async () => {
    localStorage.setItem('theme', 'dark')
    render(<DarkModeToggle />)
    await waitFor(() => {
      expect(screen.getByText('Light')).toBeInTheDocument()
    })
  })

  it('toggles from light to dark on click', async () => {
    render(<DarkModeToggle />)
    await waitFor(() => {
      expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'false')
    })

    fireEvent.click(screen.getByRole('button'))

    await waitFor(() => {
      expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'true')
    })
    expect(document.documentElement).toHaveAttribute('data-theme', 'dark')
    expect(localStorage.getItem('theme')).toBe('dark')
  })

  it('toggles from dark to light on click', async () => {
    localStorage.setItem('theme', 'dark')
    render(<DarkModeToggle />)
    await waitFor(() => {
      expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'true')
    })

    fireEvent.click(screen.getByRole('button'))

    await waitFor(() => {
      expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'false')
    })
    expect(document.documentElement).toHaveAttribute('data-theme', 'light')
    expect(localStorage.getItem('theme')).toBe('light')
  })
})
