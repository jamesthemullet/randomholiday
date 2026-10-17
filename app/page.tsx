import { Hero } from '@/components/Hero'
import { parseTripQuery } from '@/lib/tripQuery'

interface HomePageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

function toURLSearchParams(params: Record<string, string | string[] | undefined>): URLSearchParams {
  const query = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (typeof value === 'string') query.set(key, value)
  }
  return query
}

export default async function HomePage({ searchParams }: HomePageProps) {
  // Prefills the form when arriving from the results page's "Change search" link.
  const initialValues = parseTripQuery(toURLSearchParams(await searchParams))

  return (
    <main id="main-content">
      <Hero initialValues={initialValues} />
    </main>
  )
}
