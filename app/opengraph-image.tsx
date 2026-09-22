import { ImageResponse } from 'next/og'

export const alt = 'RandomHoliday — Discover Your Next Adventure'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function Image() {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #06427c 0%, #00c9c8 100%)',
        fontFamily: 'sans-serif',
      }}
    >
      <div
        style={{
          fontSize: 96,
          fontWeight: 800,
          color: '#ffffff',
          letterSpacing: -2,
        }}
      >
        RandomHoliday
      </div>
      <div
        style={{
          marginTop: 24,
          fontSize: 36,
          fontWeight: 600,
          color: '#ffd166',
        }}
      >
        Discover Your Next Adventure
      </div>
    </div>,
    { ...size }
  )
}
