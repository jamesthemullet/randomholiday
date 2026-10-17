import Link from 'next/link'
import { Button } from '@/components/Button'
import styles from './not-found.module.css'

export default function NotFound() {
  return (
    <main id="main-content" className={styles.wrapper}>
      <div className={styles.content}>
        <p className={styles.code}>404</p>
        <h1 className={styles.heading}>This destination doesn&apos;t exist</h1>
        <p className={styles.message}>
          The page you&apos;re looking for has wandered off. Let&apos;s get you back on track.
        </p>
        <Link href="/">
          <Button variant="primary">Back to home</Button>
        </Link>
      </div>
    </main>
  )
}
