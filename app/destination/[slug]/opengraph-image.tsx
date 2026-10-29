import { ImageResponse } from 'next/og'
import { notFound } from 'next/navigation'
import { pickableDestinations } from '@/lib/catalogue'
import { getPosterTheme, type PosterTheme } from '@/lib/destinationImage'

export const alt = 'RandomHoliday destination'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

/** Mirrors the `.poster.<theme>` background/text colors in page.module.css — ImageResponse can't read CSS variables. */
const THEME_COLORS: Record<PosterTheme, { background: string; text: string }> = {
  coral: { background: '#e84848', text: '#ffffff' },
  turquoise: { background: '#007d7d', text: '#ffffff' },
  ocean: { background: '#06427c', text: '#ffffff' },
  yellow: { background: '#e6b84d', text: '#032d54' },
}

interface ImageProps {
  params: Promise<{ slug: string }>
}

export function generateStaticParams() {
  return pickableDestinations.map((destination) => ({ slug: destination.id }))
}

export default async function Image({ params }: ImageProps) {
  const { slug } = await params
  const destination = pickableDestinations.find((d) => d.id === slug)
  if (!destination) notFound()

  const { background, text } = THEME_COLORS[getPosterTheme(destination.id)]

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '80px',
          background,
          fontFamily: 'sans-serif',
        }}
      >
        <div
          style={{
            fontSize: 28,
            letterSpacing: 6,
            textTransform: 'uppercase',
            opacity: 0.85,
            color: text,
            marginBottom: 20,
          }}
        >
          {destination.continent}
        </div>
        <div style={{ fontSize: 72, fontWeight: 800, color: text }}>
          {`${destination.name}, ${destination.country}`}
        </div>
      </div>
    ),
    { ...size }
  )
}
