import React from 'react'
import Image from 'next/image'
import { TripForm } from '@/components/TripForm'
import type { TripQueryInitialValues } from '@/lib/tripQuery'
import styles from './Hero.module.css'

export interface HeroProps {
  initialValues?: TripQueryInitialValues
}

export function Hero({ initialValues }: HeroProps) {
  return (
    <section className={styles.hero} aria-labelledby="hero-heading">
      <Image
        src="/destinations/santorini-greece.jpg"
        alt="Santorini, Greece"
        fill
        preload
        sizes="100vw"
        className={styles.image}
      />
      <div className={styles.scrim} aria-hidden="true" />
      <div className={styles.container}>
        <div className={styles.content}>
          <span className={styles.tag}>NEXT STOP: ???</span>
          <h1 id="hero-heading" className={styles.heading}>
            Take me anywhere.
          </h1>
          <p className={styles.tagline}>
            Tell us where you&apos;re flying from — we&apos;ll surprise you with the perfect holiday
            destination.
          </p>
        </div>
        <div className={styles.formWrapper}>
          <TripForm initialValues={initialValues} />
        </div>
      </div>
      <span className={styles.caption} aria-hidden="true">
        Santorini, Greece
      </span>
    </section>
  )
}
