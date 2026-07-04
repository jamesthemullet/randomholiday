'use client'

import React, { useCallback, useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { destinations } from '@/lib/destinations'
import type { TravelStyle } from '@/lib/destinations'
import { departureCities } from '@/lib/departureCities'
import { getRecommendations } from '@/lib/recommendationEngine'
import type { DestinationScore } from '@/lib/scoringEngine'
import { ResultsReveal } from '@/components/ResultsReveal'
import styles from './results.module.css'

export function ResultsClient() {
  const searchParams = useSearchParams()

  const filterParams = useMemo(() => {
    const originId = searchParams.get('originId')
    const city = departureCities.find((c) => c.id === originId)
    const budget = Number(searchParams.get('budget'))
    const maxDistanceKm = Number(searchParams.get('distance'))
    const nights = Number(searchParams.get('nights'))
    const groupSize = Number(searchParams.get('groupSize'))
    const travelMonth = Number(searchParams.get('month'))
    const stylesParam = searchParams.get('styles')
    const travelStyles = stylesParam ? (stylesParam.split(',') as TravelStyle[]) : undefined

    if (!city || !budget || !maxDistanceKm || !nights || !groupSize) return null

    return {
      origin: city.coordinates,
      maxBudgetPerPerson: budget,
      maxDistanceKm,
      nights,
      groupSize,
      travelStyles,
      travelMonth: Number.isNaN(travelMonth) ? undefined : travelMonth,
    }
  }, [searchParams])

  const [recommendation, setRecommendation] = useState<DestinationScore | null>(() =>
    filterParams
      ? (getRecommendations(destinations, filterParams).recommendations[0] ?? null)
      : null
  )

  const handleShuffle = useCallback(() => {
    if (!filterParams) return
    setRecommendation(getRecommendations(destinations, filterParams).recommendations[0] ?? null)
  }, [filterParams])

  if (!filterParams) {
    return (
      <main id="main-content" className={styles.wrapper}>
        <p className={styles.empty}>We couldn&apos;t find your trip details. Please start over.</p>
        <Link href="/discover" className={styles.link}>
          Back to Discover
        </Link>
      </main>
    )
  }

  return (
    <main id="main-content" className={styles.wrapper}>
      <ResultsReveal recommendation={recommendation} onShuffle={handleShuffle} />
    </main>
  )
}
