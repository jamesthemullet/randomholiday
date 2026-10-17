'use client'

import { useEffect } from 'react'
import '@/styles/globals.css'
import styles from './global-error.module.css'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <html lang="en">
      <body>
        <main id="main-content" className={styles.wrapper}>
          <div className={styles.content}>
            <h1 className={styles.heading}>Something went wrong</h1>
            <p className={styles.message}>
              RandomHoliday hit an unexpected error. Please try again.
            </p>
            <button type="button" className={styles.button} onClick={reset}>
              Try again
            </button>
          </div>
        </main>
      </body>
    </html>
  )
}
