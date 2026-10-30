import type { Metadata } from 'next'
import { PricingPlansCheckout } from '@/components/PricingPlans'

export const metadata: Metadata = {
  title: 'Pricing — RandomHoliday',
  description: 'Compare RandomHoliday Free and Pro plans.',
  alternates: {
    canonical: '/pricing',
  },
  openGraph: {
    title: 'Pricing — RandomHoliday',
    description: 'Compare RandomHoliday Free and Pro plans.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pricing — RandomHoliday',
    description: 'Compare RandomHoliday Free and Pro plans.',
  },
}

export default function PricingPage() {
  return (
    <main id="main-content">
      <PricingPlansCheckout />
    </main>
  )
}
