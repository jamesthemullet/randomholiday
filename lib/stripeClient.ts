import Stripe from 'stripe'

/**
 * Creates a Stripe client from STRIPE_SECRET_KEY. Returns null when the key
 * isn't configured yet, so callers can fall back to a "not configured"
 * response instead of crashing.
 */
export function getStripeClient(): Stripe | null {
  const apiKey = process.env.STRIPE_SECRET_KEY
  if (!apiKey) return null

  return new Stripe(apiKey)
}
