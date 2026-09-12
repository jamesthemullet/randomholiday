import type { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

  const routes = ['', '/discover', '/pricing']

  return routes.map((route) => ({
    url: `${appUrl}${route}`,
    lastModified: new Date(),
  }))
}
