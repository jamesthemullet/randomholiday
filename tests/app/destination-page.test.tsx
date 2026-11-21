import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import DestinationPage, {
  generateMetadata,
  generateStaticParams,
} from '@/app/destination/[slug]/page'
import { pickableDestinations } from '@/lib/catalogue'
import { getFcdoUrl, getSafetyStatus } from '@/lib/travelAdvisory'

const notFound = vi.fn(() => {
  throw new Error('NEXT_NOT_FOUND')
})

vi.mock('next/navigation', () => ({
  notFound: () => notFound(),
}))

vi.mock('@/lib/travelAdvisory', async () => {
  const actual =
    await vi.importActual<typeof import('@/lib/travelAdvisory')>('@/lib/travelAdvisory')
  return {
    ...actual,
    getSafetyStatus: vi.fn(actual.getSafetyStatus),
    getFcdoUrl: vi.fn(actual.getFcdoUrl),
  }
})

const destination = pickableDestinations[0]

describe('generateStaticParams', () => {
  it('returns a slug for every pickable destination', () => {
    const params = generateStaticParams()

    expect(params).toHaveLength(pickableDestinations.length)
    expect(params).toContainEqual({ slug: destination.id })
  })
})

describe('generateMetadata', () => {
  it('builds a title, description and canonical URL for a known destination', async () => {
    const metadata = await generateMetadata({ params: Promise.resolve({ slug: destination.id }) })

    expect(metadata.title).toBe(`${destination.name}, ${destination.country} — RandomHoliday`)
    expect(metadata.description).toBe(destination.description)
    expect(metadata.alternates).toEqual({ canonical: `/destination/${destination.id}` })
  })

  it('returns empty metadata for an unknown slug', async () => {
    const metadata = await generateMetadata({ params: Promise.resolve({ slug: 'nowhere' }) })

    expect(metadata).toEqual({})
  })
})

describe('DestinationPage', () => {
  it('renders the destination name, country and continent', async () => {
    render(await DestinationPage({ params: Promise.resolve({ slug: destination.id }) }))

    expect(
      screen.getByRole('heading', {
        level: 1,
        name: `${destination.name}, ${destination.country}`,
      })
    ).toBeInTheDocument()
    expect(screen.getByText(destination.continent)).toBeInTheDocument()
  })

  it('renders a badge for each travel style', async () => {
    render(await DestinationPage({ params: Promise.resolve({ slug: destination.id }) }))

    destination.travelStyles.forEach((style) => {
      expect(screen.getByText(style)).toBeInTheDocument()
    })
  })

  it('renders every activity', async () => {
    render(await DestinationPage({ params: Promise.resolve({ slug: destination.id }) }))

    destination.activities.forEach((activity) => {
      expect(screen.getByText(activity)).toBeInTheDocument()
    })
  })

  it('renders a JSON-LD TouristDestination script tag', async () => {
    const { container } = render(
      await DestinationPage({ params: Promise.resolve({ slug: destination.id }) })
    )

    const script = container.querySelector('script[type="application/ld+json"]')
    expect(script).not.toBeNull()
    const jsonLd = JSON.parse(script?.innerHTML ?? '{}')
    expect(jsonLd).toMatchObject({
      '@context': 'https://schema.org',
      '@type': 'TouristDestination',
      name: destination.name,
    })
  })

  it('links back to the homepage', async () => {
    render(await DestinationPage({ params: Promise.resolve({ slug: destination.id }) }))

    expect(screen.getByRole('link', { name: /find your own random holiday/i })).toHaveAttribute(
      'href',
      '/'
    )
  })

  it('calls notFound for an unknown slug', async () => {
    await expect(
      DestinationPage({ params: Promise.resolve({ slug: 'nowhere' }) })
    ).rejects.toThrow('NEXT_NOT_FOUND')
    expect(notFound).toHaveBeenCalled()
  })

  it('shows an excluded-from-picks banner with an FCDO link for an excluded destination', async () => {
    vi.mocked(getSafetyStatus).mockReturnValueOnce('exclude')
    vi.mocked(getFcdoUrl).mockReturnValueOnce('https://www.gov.uk/foreign-travel-advice/somewhere')

    render(await DestinationPage({ params: Promise.resolve({ slug: destination.id }) }))

    expect(screen.getByText('Excluded from picks')).toBeInTheDocument()
    expect(
      screen.getByText(/currently excluded from picks due to fcdo travel advice/i)
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Check the latest advice' })).toHaveAttribute(
      'href',
      'https://www.gov.uk/foreign-travel-advice/somewhere'
    )
  })

  it('omits the excluded-from-picks banner for a destination with no exclude override', async () => {
    render(await DestinationPage({ params: Promise.resolve({ slug: destination.id }) }))

    expect(screen.queryByText('Excluded from picks')).not.toBeInTheDocument()
  })
})
