import type { Metadata } from 'next'
import { Hero } from '@/components/Hero'
import { Footer } from '@/components/Footer'

// The hero photo changes daily (UK time); re-render hourly so it flips soon after midnight.
export const revalidate = 3600

export const metadata: Metadata = {
  alternates: {
    canonical: '/',
  },
}

export default function HomePage() {
  return (
    <>
      <main id="main-content">
        <Hero />
      </main>
      <Footer />
    </>
  )
}
