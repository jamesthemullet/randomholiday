import { describe, it, expect, afterEach, vi } from 'vitest'
import { getStripeClient } from '@/lib/stripeClient'

describe('getStripeClient', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('returns null when STRIPE_SECRET_KEY is not configured', () => {
    vi.stubEnv('STRIPE_SECRET_KEY', '')

    expect(getStripeClient()).toBeNull()
  })

  it('returns a Stripe client when STRIPE_SECRET_KEY is configured', () => {
    vi.stubEnv('STRIPE_SECRET_KEY', 'sk_test_123')

    const client = getStripeClient()

    expect(client).not.toBeNull()
    expect(client?.checkout.sessions.create).toBeInstanceOf(Function)
  })
})
