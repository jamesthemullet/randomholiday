// Destination ids that changed when lib/destinations.ts was retired and every destination took
// its generated id from lib/data/destination-facts.json.
const RENAMED_DESTINATIONS = {
  'costa-rica': 'san-jose-cr-costa-rica',
  'dubai-uae': 'dubai-united-arab-emirates',
  'edinburgh-uk': 'edinburgh-united-kingdom',
  'las-vegas-usa': 'las-vegas-united-states',
  maldives: 'male-maldives',
  'marrakech-morocco': 'marrakesh-morocco',
  'new-orleans-usa': 'new-orleans-united-states',
  'new-york-usa': 'new-york-united-states',
  singapore: 'singapore-singapore',
  'trinidad-and-tobago': 'port-of-spain-trinidad-and-tobago',
  'valletta-malta': 'malta-malta',
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  async redirects() {
    // The search form now lives on the homepage; keep old /discover links working.
    return [
      { source: '/discover', destination: '/', permanent: true },
      ...Object.entries(RENAMED_DESTINATIONS).map(([from, to]) => ({
        source: `/destination/${from}`,
        destination: `/destination/${to}`,
        permanent: true,
      })),
    ]
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'Content-Security-Policy-Report-Only',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline'",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: blob:",
              "font-src 'self' data:",
              "connect-src 'self'",
              "frame-ancestors 'self'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join('; '),
          },
        ],
      },
    ]
  },
}

export default nextConfig
