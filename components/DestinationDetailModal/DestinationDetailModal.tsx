'use client'

import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import type { Destination } from '@/lib/destinations'
import { calculateBudget } from '@/lib/budgetCalculator'
import { formatGbp } from '@/lib/currency'
import { getDestinationImagePath, getPosterTheme } from '@/lib/destinationImage'
import { getBookingAffiliateUrl, getSkyscannerAffiliateUrl } from '@/lib/affiliateLinks'
import { getMonthOptions } from '@/lib/tripQuery'
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
  /** 1-12. Defaults to the current calendar month when not provided. */
  month?: number
  /** Departure city name, shown under the flights link. */
  originName?: string
  /** Deterministic link back to this exact result, passed through to the Share button. */
  shareUrl?: string
}

type WeatherEstimate =
  | { source: 'live'; tempC: number; description: string }
  | { source: 'static'; avgHighC: number; description: string }

interface WeatherResult {
  /** `${destinationId}:${month}`, used to tell a stale result from the current request. */
  key: string
  status: 'loaded' | 'error'
  data: WeatherEstimate | null
}

const ACTIVITY_THEMES = ['yellow', 'turquoise', 'coral', 'ocean'] as const

export function DestinationDetailModal({
  isOpen,
  onClose,
  destination,
  distanceKm,
  nights,
  groupSize,
  month,
  originName,
  shareUrl,
}: DestinationDetailModalProps) {
  const [imageFailed, setImageFailed] = useState(false)
  const [imageFailedForId, setImageFailedForId] = useState(destination?.id)
  const [weatherResult, setWeatherResult] = useState<WeatherResult | null>(null)

  if (destination?.id !== imageFailedForId) {
    setImageFailedForId(destination?.id)
    setImageFailed(false)
  }

  const travelMonth = month ?? new Date().getMonth() + 1
  const weatherKey = destination ? `${destination.id}:${travelMonth}` : null

  useEffect(() => {
    if (!isOpen || !destination || !weatherKey) return

    const controller = new AbortController()
    const params = new URLSearchParams({
      lat: String(destination.coordinates.lat),
      lng: String(destination.coordinates.lng),
      climate: destination.climate,
      month: String(travelMonth),
    })

    fetch(`/api/weather?${params.toString()}`, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error('weather request failed')
        return response.json() as Promise<WeatherEstimate>
      })
      .then((data) => {
        setWeatherResult({ key: weatherKey, status: 'loaded', data })
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setWeatherResult({ key: weatherKey, status: 'error', data: null })
        }
      })

    return () => controller.abort()
  }, [isOpen, destination, weatherKey, travelMonth])

  if (!destination) return null

  const currentWeather = weatherResult?.key === weatherKey ? weatherResult : null

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

  const travellers = `${groupSize} ${groupSize === 1 ? 'traveller' : 'travellers'}`
  const nightsLabel = `${nights} ${nights === 1 ? 'night' : 'nights'}`
  const monthName = getMonthOptions()[travelMonth - 1].label.toUpperCase()
  const season = destination.bestMonths.includes(travelMonth)
    ? `✓ GREAT IN ${monthName}`
    : `OFF-PEAK IN ${monthName}`
  const flightsNote = [
    originName && `From ${originName}`,
    `est. ${formatGbp(budget.totalFlightCost)}`,
  ]
    .filter(Boolean)
    .join(' · ')
  const hotelsNote = `${nightsLabel} · ${groupSize} ${groupSize === 1 ? 'guest' : 'guests'} · est. ${formatGbp(budget.totalHotelCost)}`

  const media = imageFailed ? (
    <div className={`${styles.poster} ${styles[getPosterTheme(destination.id)]}`}>
      <span className={styles.posterNote}>Photos coming soon</span>
    </div>
  ) : (
    <Image
      src={getDestinationImagePath(destination.id)}
      alt={`${destination.name}, ${destination.country}`}
      fill
      sizes="(min-width: 1024px) 640px, 100vw"
      className={styles.photo}
      onError={() => setImageFailed(true)}
    />
  )

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${destination.name}, ${destination.country}`}
      kicker={season}
      media={media}
      size="lg"
    >
      <div className={styles.columns}>
        <div className={styles.main}>
          <section aria-labelledby="cost-breakdown-heading" className={styles.costCard}>
            <div className={styles.costHeader}>
              <h3 id="cost-breakdown-heading" className={styles.sectionTitle}>
                Cost breakdown
              </h3>
              <span className={styles.tripLine}>
                {travellers} · {nightsLabel}
              </span>
            </div>
            <dl className={styles.costList}>
              <div className={styles.costRow}>
                <dt>Flights ({travellers})</dt>
                <dd>{formatGbp(budget.totalFlightCost)}</dd>
              </div>
              <div className={styles.costRow}>
                <dt>Hotel ({nightsLabel})</dt>
                <dd>{formatGbp(budget.totalHotelCost)}</dd>
              </div>
              <div className={styles.costRow}>
                <dt>Daily spending</dt>
                <dd>{formatGbp(budget.totalDailySpending)}</dd>
              </div>
              <div className={styles.totalRow}>
                <dt>
                  <span className={styles.totalLabel}>Total</span>
                  <span className={styles.perPerson}>
                    {formatGbp(budget.perPersonCost)} per person
                  </span>
                </dt>
                <dd className={styles.totalValue}>{formatGbp(budget.totalCost)}</dd>
              </div>
            </dl>
          </section>

          <p className={styles.description}>{destination.description}</p>

          <section aria-labelledby="weather-heading" className={styles.section}>
            <h3 id="weather-heading" className={styles.sectionTitle}>
              Weather
            </h3>
            {!currentWeather && <p className={styles.weatherStatus}>Loading seasonal weather…</p>}
            {currentWeather?.status === 'error' && (
              <p className={styles.weatherStatus}>Weather estimate unavailable right now.</p>
            )}
            {currentWeather?.status === 'loaded' && currentWeather.data && (
              <p className={styles.weatherSummary}>
                Typically{' '}
                <strong>
                  {Math.round(
                    currentWeather.data.source === 'live'
                      ? currentWeather.data.tempC
                      : currentWeather.data.avgHighC
                  )}
                  °C
                </strong>{' '}
                and {currentWeather.data.description}.
              </p>
            )}
          </section>

          <section aria-labelledby="things-to-do-heading" className={styles.section}>
            <h3 id="things-to-do-heading" className={styles.sectionTitle}>
              Things to do
            </h3>
            <ul className={styles.activities}>
              {destination.activities.map((activity, i) => (
                <li
                  key={activity}
                  className={`${styles.activity} ${styles[ACTIVITY_THEMES[i % ACTIVITY_THEMES.length]]}`}
                >
                  {activity}
                </li>
              ))}
            </ul>
          </section>
        </div>

        <aside className={styles.book} aria-labelledby="ready-heading">
          <h3 id="ready-heading" className={styles.bookTitle}>
            Ready to go?
          </h3>
          <a
            href={skyscannerUrl}
            target="_blank"
            rel="noopener noreferrer sponsored"
            className={styles.bookLink}
          >
            <span className={styles.bookIcon} aria-hidden="true">
              ✈️
            </span>
            <span className={styles.bookText}>
              <span className={styles.bookLabel}>Find flights on Skyscanner</span>{' '}
              <span className={styles.bookNote}>{flightsNote}</span>
            </span>
            <span className={styles.bookArrow} aria-hidden="true">
              →
            </span>
          </a>
          <a
            href={bookingUrl}
            target="_blank"
            rel="noopener noreferrer sponsored"
            className={styles.bookLink}
          >
            <span className={styles.bookIcon} aria-hidden="true">
              🛏️
            </span>
            <span className={styles.bookText}>
              <span className={styles.bookLabel}>Find hotels on Booking.com</span>{' '}
              <span className={styles.bookNote}>{hotelsNote}</span>
            </span>
            <span className={styles.bookArrow} aria-hidden="true">
              →
            </span>
          </a>
          <p className={styles.disclaimer}>
            Prices are estimates. We may earn a commission if you book, at no extra cost to you.
          </p>
          <TripActions
            destinationName={`${destination.name}, ${destination.country}`}
            shareUrl={shareUrl}
            className={styles.tripActions}
          />
        </aside>
      </div>
    </Modal>
  )
}
