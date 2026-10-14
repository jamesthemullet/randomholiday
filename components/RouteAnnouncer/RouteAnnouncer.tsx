'use client'

import { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'

/**
 * Next.js App Router navigations don't trigger a full page reload, so
 * screen readers never get the "page loaded" announcement they'd get from a
 * native navigation. This renders a visually-hidden live region that
 * announces the new document title whenever the route changes.
 */
export function RouteAnnouncer() {
  const pathname = usePathname()
  const previousPathname = useRef(pathname)
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (previousPathname.current === pathname) {
      return
    }
    previousPathname.current = pathname

    const timeoutId = window.setTimeout(() => {
      setMessage(document.title ? `Navigated to ${document.title}` : 'Page changed')
    }, 100)

    return () => window.clearTimeout(timeoutId)
  }, [pathname])

  return (
    <p className="sr-only" role="status" aria-live="polite">
      {message}
    </p>
  )
}
