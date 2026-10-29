import { describe, it, expect, vi } from 'vitest'
import Image, { generateStaticParams } from '@/app/destination/[slug]/opengraph-image'
import { pickableDestinations } from '@/lib/catalogue'
import { getPosterTheme } from '@/lib/destinationImage'

const notFound = vi.fn(() => {
  throw new Error('NEXT_NOT_FOUND')
})

vi.mock('next/navigation', () => ({
  notFound: () => notFound(),
}))

const destination = pickableDestinations[0]

describe('generateStaticParams', () => {
  it('returns a slug for every pickable destination', () => {
    const params = generateStaticParams()

    expect(params).toHaveLength(pickableDestinations.length)
    expect(params).toContainEqual({ slug: destination.id })
  })
})

describe('destination opengraph-image', () => {
  it('renders an image for a known destination', async () => {
    const response = await Image({ params: Promise.resolve({ slug: destination.id }) })

    expect(response).toBeInstanceOf(Response)
    expect(response.headers.get('content-type')).toBe('image/png')
  })

  it('calls notFound for an unknown slug', async () => {
    await expect(Image({ params: Promise.resolve({ slug: 'nowhere' }) })).rejects.toThrow(
      'NEXT_NOT_FOUND'
    )
    expect(notFound).toHaveBeenCalled()
  })

  it('gives every poster theme a distinct, defined color pair', () => {
    const themes = new Set(pickableDestinations.map((d) => getPosterTheme(d.id)))

    themes.forEach((theme) => {
      expect(theme).toMatch(/^(coral|turquoise|ocean|yellow)$/)
    })
  })
})
