import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { RouteAnnouncer } from '@/components/RouteAnnouncer'

const { usePathname } = vi.hoisted(() => ({ usePathname: vi.fn(() => '/') }))

vi.mock('next/navigation', () => ({ usePathname }))

beforeEach(() => {
  usePathname.mockReturnValue('/')
  document.title = 'RandomHoliday'
})

afterEach(() => {
  usePathname.mockReturnValue('/')
})

describe('RouteAnnouncer', () => {
  it('renders a polite status live region', () => {
    render(<RouteAnnouncer />)
    expect(screen.getByRole('status')).toHaveAttribute('aria-live', 'polite')
  })

  it('is visually hidden', () => {
    render(<RouteAnnouncer />)
    expect(screen.getByRole('status')).toHaveClass('sr-only')
  })

  it('announces nothing on initial render', () => {
    render(<RouteAnnouncer />)
    expect(screen.getByRole('status')).toHaveTextContent('')
  })

  it('announces the new document title after the pathname changes', async () => {
    const { rerender } = render(<RouteAnnouncer />)

    usePathname.mockReturnValue('/discover')
    document.title = 'Discover — RandomHoliday'
    rerender(<RouteAnnouncer />)

    await waitFor(() =>
      expect(screen.getByRole('status')).toHaveTextContent('Navigated to Discover — RandomHoliday')
    )
  })

  it('falls back to a generic message when the document has no title', async () => {
    const { rerender } = render(<RouteAnnouncer />)

    usePathname.mockReturnValue('/results')
    document.title = ''
    rerender(<RouteAnnouncer />)

    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('Page changed'))
  })

  it('does not re-announce when the pathname stays the same', async () => {
    const { rerender } = render(<RouteAnnouncer />)
    rerender(<RouteAnnouncer />)

    await new Promise((resolve) => setTimeout(resolve, 150))
    expect(screen.getByRole('status')).toHaveTextContent('')
  })
})
