import type { Metadata } from 'next'
import { Hero } from '@/components/Hero'
import { Footer } from '@/components/Footer'

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
