import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TripActions } from '@/components/TripActions'

describe('TripActions', () => {
  afterEach(() => {
    // @ts-expect-error -- cleaning up test-only navigator overrides
    delete navigator.share
  })

  it('renders Save trip and Share buttons', () => {
    render(<TripActions destinationName="Bali, Indonesia" />)
    expect(screen.getByRole('button', { name: 'Save trip' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Share' })).toBeInTheDocument()
  })

  it('applies an additional className when provided', () => {
    const { container } = render(
      <TripActions destinationName="Bali, Indonesia" className="extra" />
    )
    expect(container.firstElementChild).toHaveClass('extra')
  })

  it('shows a Pro upsell message when Save trip is clicked', async () => {
    const user = userEvent.setup()
    render(<TripActions destinationName="Bali, Indonesia" />)

    expect(screen.queryByText(/RandomHoliday Pro/)).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Save trip' }))

    expect(screen.getByText(/RandomHoliday Pro/)).toBeInTheDocument()
    expect(screen.getByText('Pro')).toBeInTheDocument()
  })

  it('uses the native share sheet when available', async () => {
    const user = userEvent.setup()
    const share = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'share', {
      value: share,
      configurable: true,
      writable: true,
    })

    render(<TripActions destinationName="Bali, Indonesia" shareUrl="https://example.com/trip" />)
    await user.click(screen.getByRole('button', { name: 'Share' }))

    expect(share).toHaveBeenCalledWith({
      title: 'Bali, Indonesia — RandomHoliday',
      text: 'Check out my random holiday match: Bali, Indonesia!',
      url: 'https://example.com/trip',
    })
    expect(screen.queryByText('Link copied to clipboard!')).not.toBeInTheDocument()
  })

  it('silently ignores a cancelled native share', async () => {
    const user = userEvent.setup()
    const share = vi.fn().mockRejectedValue(new Error('AbortError'))
    Object.defineProperty(navigator, 'share', {
      value: share,
      configurable: true,
      writable: true,
    })

    render(<TripActions destinationName="Bali, Indonesia" shareUrl="https://example.com/trip" />)
    await user.click(screen.getByRole('button', { name: 'Share' }))

    expect(share).toHaveBeenCalled()
    expect(screen.queryByText('Link copied to clipboard!')).not.toBeInTheDocument()
  })

  it('falls back to copying the link to the clipboard when native share is unsupported', async () => {
    const user = userEvent.setup()
    const writeText = vi.spyOn(navigator.clipboard, 'writeText').mockResolvedValue(undefined)

    render(<TripActions destinationName="Bali, Indonesia" shareUrl="https://example.com/trip" />)
    await user.click(screen.getByRole('button', { name: 'Share' }))

    expect(writeText).toHaveBeenCalledWith('https://example.com/trip')
    expect(await screen.findByText('Link copied to clipboard!')).toBeInTheDocument()
  })

  it('falls back to window.location.href when no shareUrl is provided', async () => {
    const user = userEvent.setup()
    const writeText = vi.spyOn(navigator.clipboard, 'writeText').mockResolvedValue(undefined)

    render(<TripActions destinationName="Bali, Indonesia" />)
    await user.click(screen.getByRole('button', { name: 'Share' }))

    expect(writeText).toHaveBeenCalledWith(window.location.href)
  })

  it('shows an error message when copying to the clipboard fails', async () => {
    const user = userEvent.setup()
    vi.spyOn(navigator.clipboard, 'writeText').mockRejectedValue(new Error('denied'))

    render(<TripActions destinationName="Bali, Indonesia" shareUrl="https://example.com/trip" />)
    await user.click(screen.getByRole('button', { name: 'Share' }))

    expect(
      await screen.findByText('Unable to copy link. Please copy the URL from your browser.')
    ).toBeInTheDocument()
  })
})
