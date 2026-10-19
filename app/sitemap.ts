import type { MetadataRoute } from 'next'
import { pickableDestinations } from '@/lib/catalogue'

export default function sitemap(): MetadataRoute.Sitemap {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

  const routes = [
    '',
    '/pricing',
    ...pickableDestinations.map((destination) => `/destination/${destination.id}`),
  ]

  return routes.map((route) => ({
    url: `${appUrl}${route}`,
    lastModified: new Date(),
  }))
}
