import { NextResponse } from 'next/server'
import { getStripeClient } from '@/lib/stripeClient'

export async function POST(): Promise<NextResponse> {
  const stripe = getStripeClient()
  const priceId = process.env.STRIPE_PRO_PRICE_ID
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

  if (!stripe || !priceId) {
    return NextResponse.json({ error: 'Stripe checkout is not configured yet' }, { status: 503 })
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${appUrl}/pricing?checkout=success`,
      cancel_url: `${appUrl}/pricing?checkout=cancelled`,
    })

    if (!session.url) {
      return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 502 })
    }

    return NextResponse.json({ url: session.url })
  } catch {
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 502 })
  }
}
