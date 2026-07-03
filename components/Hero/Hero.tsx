import React from 'react'
import Link from 'next/link'
import styles from './Hero.module.css'

export function Hero() {
  return (
    <section className={styles.hero} aria-labelledby="hero-heading">
      <div className={styles.container}>
        <div className={styles.content}>
          <h1 id="hero-heading" className={styles.heading}>
            Your next adventure is one click away
          </h1>
          <p className={styles.tagline}>
            Tell us your budget, style, and dates — we&apos;ll surprise you with the perfect holiday
            destination.
          </p>
          <Link href="/discover" className={styles.cta}>
            Find My Holiday
          </Link>
        </div>

        <svg
          className={styles.globe}
          viewBox="0 0 200 200"
          role="img"
          aria-label="Animated illustration of a spinning globe"
        >
          <circle
            cx="100"
            cy="100"
            r="90"
            fill="none"
            stroke="var(--color-turquoise)"
            strokeWidth="2"
          />
          <ellipse
            cx="100"
            cy="100"
            rx="36"
            ry="90"
            fill="none"
            stroke="var(--color-turquoise)"
            strokeWidth="2"
          />
          <ellipse
            cx="100"
            cy="100"
            rx="90"
            ry="36"
            fill="none"
            stroke="var(--color-turquoise)"
            strokeWidth="2"
          />
          <line
            x1="10"
            y1="100"
            x2="190"
            y2="100"
            stroke="var(--color-turquoise)"
            strokeWidth="2"
          />
          <line
            x1="18"
            y1="60"
            x2="182"
            y2="60"
            stroke="var(--color-turquoise-light)"
            strokeWidth="1.5"
          />
          <line
            x1="18"
            y1="140"
            x2="182"
            y2="140"
            stroke="var(--color-turquoise-light)"
            strokeWidth="1.5"
          />
          <circle cx="100" cy="100" r="6" fill="var(--color-coral)" />
          <circle cx="140" cy="70" r="4" fill="var(--color-yellow)" />
          <circle cx="65" cy="130" r="4" fill="var(--color-coral)" />
        </svg>
      </div>
    </section>
  )
}
