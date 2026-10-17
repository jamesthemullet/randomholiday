'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/Button'
import styles from './error.module.css'

export default function Error({
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
    <main id="main-content" className={styles.wrapper}>
      <div className={styles.content}>
        <h1 className={styles.heading}>Something went wrong</h1>
        <p className={styles.message}>
          We hit an unexpected error while loading this page. You can try again, or head back home.
        </p>
        <div className={styles.actions}>
          <Button variant="primary" onClick={reset}>
            Try again
          </Button>
          <Link href="/">
            <Button variant="secondary">Back to home</Button>
          </Link>
        </div>
      </div>
    </main>
  )
}
