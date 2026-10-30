import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { PricingPlansCheckout } from '@/components/PricingPlans'

describe('PricingPlansCheckout', () => {
  const originalLocation = window.location

  beforeEach(() => {
    Object.defineProperty(window, 'location', {
      writable: true,
      configurable: true,
      value: { ...originalLocation, href: '' },
    })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    Object.defineProperty(window, 'location', {
      writable: true,
      configurable: true,
      value: originalLocation,
    })
  })

  it('renders the pricing plans', () => {
    render(<PricingPlansCheckout />)
    expect(screen.getByRole('button', { name: 'Upgrade to Pro' })).toBeInTheDocument()
  })

  it('redirects to the checkout session URL on success', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ url: 'https://checkout.stripe.com/session/abc' }),
      })
    )

    render(<PricingPlansCheckout />)
    fireEvent.click(screen.getByRole('button', { name: 'Upgrade to Pro' }))

    await waitFor(() => expect(window.location.href).toBe('https://checkout.stripe.com/session/abc'))
    expect(fetch).toHaveBeenCalledWith('/api/checkout', { method: 'POST' })
  })

  it('shows the server error message when checkout cannot be created', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        json: () => Promise.resolve({ error: 'Stripe checkout is not configured yet' }),
      })
    )

    render(<PricingPlansCheckout />)
    fireEvent.click(screen.getByRole('button', { name: 'Upgrade to Pro' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Stripe checkout is not configured yet')
    expect(window.location.href).toBe('')
  })

  it('shows a fallback error message when the request itself fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network down')))

    render(<PricingPlansCheckout />)
    fireEvent.click(screen.getByRole('button', { name: 'Upgrade to Pro' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Unable to start checkout. Please try again.')
  })
})
