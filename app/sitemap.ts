import type { MetadataRoute } from 'next'
import { pickableDestinations } from '@/lib/catalogue'
import { getAppUrl } from '@/lib/appUrl'

export default function sitemap(): MetadataRoute.Sitemap {
  const appUrl = getAppUrl()

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
