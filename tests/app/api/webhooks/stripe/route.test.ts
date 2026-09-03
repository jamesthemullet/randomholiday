import { describe, it, expect, afterEach, vi } from 'vitest'
import { POST } from '@/app/api/webhooks/stripe/route'
import { getStripeClient } from '@/lib/stripeClient'

vi.mock('@/lib/stripeClient', () => ({
  getStripeClient: vi.fn(),
}))

const mockedGetStripeClient = vi.mocked(getStripeClient)

const BASE_URL = 'http://localhost/api/webhooks/stripe'

function makeRequest(body: string, headers: Record<string, string> = {}): Request {
  return new Request(BASE_URL, { method: 'POST', body, headers })
}

describe('POST /api/webhooks/stripe', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.clearAllMocks()
  })

  it('returns 503 when Stripe is not configured', async () => {
    mockedGetStripeClient.mockReturnValue(null)

    const response = await POST(makeRequest('{}'))
    const body = await response.json()

    expect(response.status).toBe(503)
    expect(body.error).toMatch(/not configured/)
  })

  it('returns 503 when the webhook secret is missing', async () => {
    vi.stubEnv('STRIPE_WEBHOOK_SECRET', '')
    mockedGetStripeClient.mockReturnValue({
      webhooks: { constructEvent: vi.fn() },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)

    const response = await POST(makeRequest('{}'))

    expect(response.status).toBe(503)
  })

  it('returns 400 when the stripe-signature header is missing', async () => {
    vi.stubEnv('STRIPE_WEBHOOK_SECRET', 'whsec_test')
    mockedGetStripeClient.mockReturnValue({
      webhooks: { constructEvent: vi.fn() },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)

    const response = await POST(makeRequest('{}'))
    const body = await response.json()

    expect(response.status).toBe(400)
    expect(body.error).toMatch(/signature/)
  })

  it('returns 400 when signature verification fails', async () => {
    vi.stubEnv('STRIPE_WEBHOOK_SECRET', 'whsec_test')
    const constructEvent = vi.fn().mockImplementation(() => {
      throw new Error('bad signature')
    })
    mockedGetStripeClient.mockReturnValue({
      webhooks: { constructEvent },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)

    const response = await POST(makeRequest('{}', { 'stripe-signature': 'bad' }))
    const body = await response.json()

    expect(response.status).toBe(400)
    expect(body.error).toMatch(/Invalid webhook signature/)
  })

  it.each([
    'checkout.session.completed',
    'customer.subscription.created',
    'customer.subscription.updated',
    'customer.subscription.deleted',
    'some.other.event',
  ])('acknowledges a valid %s event', async (type) => {
    vi.stubEnv('STRIPE_WEBHOOK_SECRET', 'whsec_test')
    const constructEvent = vi.fn().mockReturnValue({ type })
    mockedGetStripeClient.mockReturnValue({
      webhooks: { constructEvent },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)

    const response = await POST(makeRequest('{}', { 'stripe-signature': 'valid' }))
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body).toEqual({ received: true })
  })
})
