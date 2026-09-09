'use client'

import React, { useState } from 'react'
import type { Destination } from '@/lib/destinations'
import { calculateBudget } from '@/lib/budgetCalculator'
import { getDestinationImagePath } from '@/lib/destinationImage'
import { getBookingAffiliateUrl, getSkyscannerAffiliateUrl } from '@/lib/affiliateLinks'
import { Modal } from '@/components/Modal'
import { TripActions } from '@/components/TripActions'
import styles from './DestinationDetailModal.module.css'

export interface DestinationDetailModalProps {
  isOpen: boolean
  onClose: () => void
  destination: Destination | null
  distanceKm: number
  nights: number
  groupSize: number
}

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
})

export function DestinationDetailModal({
  isOpen,
  onClose,
  destination,
  distanceKm,
  nights,
  groupSize,
}: DestinationDetailModalProps) {
  const [imageFailed, setImageFailed] = useState(false)
  const [imageFailedForId, setImageFailedForId] = useState(destination?.id)

  if (destination?.id !== imageFailedForId) {
    setImageFailedForId(destination?.id)
    setImageFailed(false)
  }

  if (!destination) return null

  const budget = calculateBudget({ destination, distanceKm, nights, groupSize })
  const bookingUrl = getBookingAffiliateUrl({
    city: destination.name,
    country: destination.country,
    groupSize,
    affiliateId: process.env.NEXT_PUBLIC_BOOKING_AFFILIATE_ID,
  })
  const skyscannerUrl = getSkyscannerAffiliateUrl({
    countryCode: destination.countryCode,
    groupSize,
    affiliateId: process.env.NEXT_PUBLIC_SKYSCANNER_AFFILIATE_ID,
  })

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`${destination.name}, ${destination.country}`}>
      {imageFailed ? (
        <div className={styles.photoPlaceholder} aria-hidden="true">
          <svg
            width="40"
            height="40"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <rect x="3" y="5" width="18" height="14" rx="2" />
            <circle cx="8.5" cy="10" r="1.5" />
            <path d="M21 15l-5-5-9 9" />
          </svg>
          <span className={styles.photoPlaceholderText}>Photos coming soon</span>
        </div>
      ) : (
        <img
          src={getDestinationImagePath(destination.id)}
          alt={`${destination.name}, ${destination.country}`}
          className={styles.photo}
          onError={() => setImageFailed(true)}
        />
      )}

      <p className={styles.description}>{destination.description}</p>

      <section aria-labelledby="cost-breakdown-heading" className={styles.section}>
        <h3 id="cost-breakdown-heading" className={styles.sectionTitle}>
          Cost breakdown
        </h3>
        <dl className={styles.costList}>
          <div className={styles.costRow}>
            <dt>
              Flights ({groupSize} {groupSize === 1 ? 'traveller' : 'travellers'})
            </dt>
            <dd>{currencyFormatter.format(budget.totalFlightCost)}</dd>
          </div>
          <div className={styles.costRow}>
            <dt>Hotel ({nights} nights)</dt>
            <dd>{currencyFormatter.format(budget.totalHotelCost)}</dd>
          </div>
          <div className={styles.costRow}>
            <dt>Daily spending</dt>
            <dd>{currencyFormatter.format(budget.totalDailySpending)}</dd>
          </div>
          <div className={`${styles.costRow} ${styles.totalRow}`}>
            <dt>Total ({currencyFormatter.format(budget.perPersonCost)} per person)</dt>
            <dd>{currencyFormatter.format(budget.totalCost)}</dd>
          </div>
        </dl>
        <div className={styles.affiliateLinks}>
          <a
            href={skyscannerUrl}
            target="_blank"
            rel="noopener noreferrer sponsored"
            className={styles.affiliateLink}
          >
            Find flights on Skyscanner
          </a>
          <a
            href={bookingUrl}
            target="_blank"
            rel="noopener noreferrer sponsored"
            className={styles.affiliateLink}
          >
            Find hotels on Booking.com
          </a>
        </div>
      </section>

      <section aria-labelledby="things-to-do-heading" className={styles.section}>
        <h3 id="things-to-do-heading" className={styles.sectionTitle}>
          Things to do
        </h3>
        <ul className={styles.activities}>
          {destination.activities.map((activity) => (
            <li key={activity}>{activity}</li>
          ))}
        </ul>
      </section>

      <TripActions destinationName={`${destination.name}, ${destination.country}`} />
    </Modal>
  )
}
