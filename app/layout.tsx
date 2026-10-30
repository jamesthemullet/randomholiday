import type { Metadata } from 'next'
import { DM_Sans, Shrikhand, Space_Mono } from 'next/font/google'
import { Header } from '@/components/Header'
import { RouteAnnouncer } from '@/components/RouteAnnouncer'
import '@/styles/globals.css'

const shrikhand = Shrikhand({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-shrikhand',
  display: 'swap',
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-dm-sans',
  display: 'swap',
})

const spaceMono = Space_Mono({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-space-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'),
  title: 'RandomHoliday — Discover Your Next Adventure',
  description:
    'Get surprise holiday destination suggestions based on your budget, travel style, and departure location.',
  openGraph: {
    title: 'RandomHoliday — Discover Your Next Adventure',
    description:
      'Get surprise holiday destination suggestions based on your budget, travel style, and departure location.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'RandomHoliday — Discover Your Next Adventure',
    description:
      'Get surprise holiday destination suggestions based on your budget, travel style, and departure location.',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth" suppressHydrationWarning>
      <body
        className={`${shrikhand.variable} ${dmSans.variable} ${spaceMono.variable}`}
        suppressHydrationWarning
      >
        <a href="#main-content" className="skip-to-main">
          Skip to main content
        </a>
        <RouteAnnouncer />
        <Header />
        {children}
      </body>
    </html>
  )
}
