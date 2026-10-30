/**
 * Best-effort client identifier for rate limiting. This app runs on Cloudflare
 * Workers, where `cf-connecting-ip` is set by Cloudflare's edge from the real
 * TCP connection and can't be overridden by a client-supplied header, so it's
 * checked first. `x-forwarded-for`/`x-real-ip` are attacker-controlled unless
 * they go through a trusted proxy, but are kept as a fallback for local dev
 * and tests, where no Cloudflare-set header is present.
 */
export function getClientIp(request: Request): string {
  const cfConnectingIp = request.headers.get('cf-connecting-ip')
  if (cfConnectingIp?.trim()) return cfConnectingIp.trim()

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
