'use client'

import { useSearchParams } from 'next/navigation'
import { parseTripQuery } from '@/lib/tripQuery'
import { TripForm } from './TripForm'

/**
 * Reads the "Change my answers" prefill values from the URL on the client, so the homepage
 * itself no longer needs to await `searchParams` and can prerender statically.
 */
export function TripFormFromQuery() {
  const searchParams = useSearchParams()
  return <TripForm initialValues={parseTripQuery(searchParams)} />
}
