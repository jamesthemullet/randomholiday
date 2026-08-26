import { NextResponse } from 'next/server'
import { getStripeClient } from '@/lib/stripeClient'

export async function POST(request: Request): Promise<NextResponse> {
  const stripe = getStripeClient()
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  const signature = request.headers.get('stripe-signature')

  if (!stripe || !webhookSecret) {
    return NextResponse.json({ error: 'Stripe webhooks are not configured yet' }, { status: 503 })
  }

  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 })
  }

  const payload = await request.text()

  let event: ReturnType<typeof stripe.webhooks.constructEvent>
  try {
    event = stripe.webhooks.constructEvent(payload, signature, webhookSecret)
  } catch {
    return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 400 })
  }

  switch (event.type) {
    case 'checkout.session.completed':
    case 'customer.subscription.created':
    case 'customer.subscription.updated':
    case 'customer.subscription.deleted':
      // Pro tier persistence lands with the account/database layer; this
      // scaffold just acknowledges the event for now.
      break
    default:
      break
  }

  return NextResponse.json({ received: true })
}
