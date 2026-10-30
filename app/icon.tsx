import { ImageResponse } from 'next/og'

export const size = { width: 32, height: 32 }
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #06427c 0%, #00c9c8 100%)',
          borderRadius: 6,
          fontFamily: 'sans-serif',
          fontSize: 22,
          fontWeight: 800,
          color: '#ffffff',
        }}
      >
        R
      </div>
    ),
    { ...size }
  )
}
