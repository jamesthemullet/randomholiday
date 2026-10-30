import type { Metadata } from 'next'
import { Suspense } from 'react'
import { ResultsClient } from './ResultsClient'

export const metadata: Metadata = {
  title: 'Your Match — RandomHoliday',
  description: 'See your personalised holiday destination match.',
  robots: {
    index: false,
  },
}

export default function ResultsPage() {
  return (
    <Suspense fallback={null}>
      <ResultsClient />
    </Suspense>
  )
}
