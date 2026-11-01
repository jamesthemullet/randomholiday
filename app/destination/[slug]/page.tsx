import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Badge } from '@/components/Badge'
import { pickableDestinations } from '@/lib/catalogue'
import { getPosterTheme } from '@/lib/destinationImage'
import { getMonthOptions } from '@/lib/tripQuery'
import { getAppUrl } from '@/lib/appUrl'
import styles from './page.module.css'

interface DestinationPageProps {
  params: Promise<{ slug: string }>
}

function findDestination(slug: string) {
  return pickableDestinations.find((destination) => destination.id === slug)
}

/** Pre-renders every pickable destination at build time. */
export function generateStaticParams() {
  return pickableDestinations.map((destination) => ({ slug: destination.id }))
}

export async function generateMetadata({ params }: DestinationPageProps): Promise<Metadata> {
  const { slug } = await params
  const destination = findDestination(slug)
  if (!destination) return {}

  const title = `${destination.name}, ${destination.country} — RandomHoliday`

  return {
    title,
    description: destination.description,
    alternates: { canonical: `/destination/${destination.id}` },
    openGraph: { title, description: destination.description, type: 'article' },
    twitter: { card: 'summary_large_image', title, description: destination.description },
  }
}

export default async function DestinationPage({ params }: DestinationPageProps) {
  const { slug } = await params
  const destination = findDestination(slug)
  if (!destination) notFound()

  const appUrl = getAppUrl()
  const monthOptions = getMonthOptions()
  const bestMonths = destination.bestMonths.map((month) => monthOptions[month - 1].label)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'TouristDestination',
    name: destination.name,
    description: destination.description,
    url: `${appUrl}/destination/${destination.id}`,
    geo: {
      '@type': 'GeoCoordinates',
      latitude: destination.coordinates.lat,
      longitude: destination.coordinates.lng,
    },
    address: {
      '@type': 'PostalAddress',
      addressCountry: destination.countryCode,
    },
    touristType: destination.travelStyles,
  }

  return (
    <main id="main-content" className={styles.page}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className={styles.wrapper}>
        <div className={`${styles.poster} ${styles[getPosterTheme(destination.id)]}`}>
          <p className={styles.kicker}>{destination.continent}</p>
          <h1 className={styles.heading}>
            {destination.name}, {destination.country}
          </h1>
        </div>

        <div className={styles.badges}>
          {destination.travelStyles.map((style) => (
            <Badge key={style} variant="primary">
              {style}
            </Badge>
          ))}
        </div>

        <p className={styles.description}>{destination.description}</p>

        <section aria-labelledby="activities-heading" className={styles.section}>
          <h2 id="activities-heading" className={styles.sectionTitle}>
            Things to do
          </h2>
          <ul className={styles.list}>
            {destination.activities.map((activity) => (
              <li key={activity}>{activity}</li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="best-time-heading" className={styles.section}>
          <h2 id="best-time-heading" className={styles.sectionTitle}>
            Best time to visit
          </h2>
          <p>{bestMonths.join(', ')}</p>
        </section>

        <Link href="/" className={styles.cta}>
          Find your own random holiday
        </Link>
      </div>
    </main>
  )
}
