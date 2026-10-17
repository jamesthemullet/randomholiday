/**
 * Best-effort client identifier for rate limiting. `x-forwarded-for` is
 * attacker-controlled on requests that don't go through a trusted proxy,
 * but on Vercel it's set by the platform, so this is good enough to key
 * a basic per-client limiter.
 */
export function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get('x-forwarded-for')
  if (forwardedFor) {
    const [first] = forwardedFor.split(',')
    const ip = first?.trim()
    if (ip) return ip
  }

  const realIp = request.headers.get('x-real-ip')
  if (realIp?.trim()) return realIp.trim()

  return 'unknown'
}
