import type { Metadata } from 'next'
import { PricingPlans } from '@/components/PricingPlans'

export const metadata: Metadata = {
  title: 'Pricing — RandomHoliday',
  description: 'Compare RandomHoliday Free and Pro plans.',
}

export default function PricingPage() {
  return (
    <main id="main-content">
      <PricingPlans />
    </main>
  )
}
