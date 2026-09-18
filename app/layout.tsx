import type { Metadata } from 'next'
import { Poppins, Inter } from 'next/font/google'
import { Header } from '@/components/Header'
import '@/styles/globals.css'

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-poppins',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'),
  title: 'RandomHoliday — Discover Your Next Adventure',
  description:
    'Get surprise holiday destination suggestions based on your budget, travel style, and departure location.',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'RandomHoliday — Discover Your Next Adventure',
    description:
      'Get surprise holiday destination suggestions based on your budget, travel style, and departure location.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${poppins.variable} ${inter.variable}`} suppressHydrationWarning>
        <a href="#main-content" className="skip-to-main">
          Skip to main content
        </a>
        <Header />
        {children}
      </body>
    </html>
  )
}
