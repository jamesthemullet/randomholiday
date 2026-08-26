import { describe, it, expect, afterEach, vi } from 'vitest'
import { POST } from '@/app/api/checkout/route'
import { getStripeClient } from '@/lib/stripeClient'

vi.mock('@/lib/stripeClient', () => ({
  getStripeClient: vi.fn(),
}))

const mockedGetStripeClient = vi.mocked(getStripeClient)

describe('POST /api/checkout', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.clearAllMocks()
  })

  it('returns 503 when Stripe is not configured', async () => {
    mockedGetStripeClient.mockReturnValue(null)

    const response = await POST()
    const body = await response.json()

    expect(response.status).toBe(503)
    expect(body.error).toMatch(/not configured/)
  })

  it('returns 503 when the Pro price ID is missing', async () => {
    vi.stubEnv('STRIPE_PRO_PRICE_ID', '')
    mockedGetStripeClient.mockReturnValue({
      checkout: { sessions: { create: vi.fn() } },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)

    const response = await POST()

    expect(response.status).toBe(503)
  })

  it('returns the checkout session URL when creation succeeds', async () => {
    vi.stubEnv('STRIPE_PRO_PRICE_ID', 'price_123')
    const create = vi.fn().mockResolvedValue({ url: 'https://checkout.stripe.com/pay/cs_test_123' })
    mockedGetStripeClient.mockReturnValue({
      checkout: { sessions: { create } },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)

    const response = await POST()
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.url).toBe('https://checkout.stripe.com/pay/cs_test_123')
    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        mode: 'subscription',
        line_items: [{ price: 'price_123', quantity: 1 }],
      })
    )
  })

  it('returns 502 when Stripe does not return a session URL', async () => {
    vi.stubEnv('STRIPE_PRO_PRICE_ID', 'price_123')
    mockedGetStripeClient.mockReturnValue({
      checkout: { sessions: { create: vi.fn().mockResolvedValue({ url: null }) } },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)

    const response = await POST()

    expect(response.status).toBe(502)
  })

  it('returns 502 when Stripe throws', async () => {
    vi.stubEnv('STRIPE_PRO_PRICE_ID', 'price_123')
    mockedGetStripeClient.mockReturnValue({
      checkout: { sessions: { create: vi.fn().mockRejectedValue(new Error('stripe down')) } },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)

    const response = await POST()
    const body = await response.json()

    expect(response.status).toBe(502)
    expect(body.error).toMatch(/Failed to create checkout session/)
  })
})
