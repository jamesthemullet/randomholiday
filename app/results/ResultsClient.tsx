'use client'

import React, { useCallback, useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { destinations } from '@/lib/destinations'
import type { TravelStyle } from '@/lib/destinations'
import { departureCities } from '@/lib/departureCities'
import { getRecommendations } from '@/lib/recommendationEngine'
import { scoreDestination } from '@/lib/scoringEngine'
import type { DestinationScore } from '@/lib/scoringEngine'
import { calculateDistance } from '@/lib/distanceCalculator'
import { ResultsReveal } from '@/components/ResultsReveal'
import { DestinationDetailModal } from '@/components/DestinationDetailModal'
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

  const pinnedDestinationId = searchParams.get('destination')

  const [recommendation, setRecommendation] = useState<DestinationScore | null>(() => {
    if (!filterParams) return null

    const pinnedDestination = pinnedDestinationId
      ? destinations.find((d) => d.id === pinnedDestinationId)
      : undefined

    if (pinnedDestination) {
      return scoreDestination(pinnedDestination, filterParams)
    }

    return getRecommendations(destinations, filterParams).recommendations[0] ?? null
  })
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)

  const handleShuffle = useCallback(() => {
    if (!filterParams) return
    setRecommendation(getRecommendations(destinations, filterParams).recommendations[0] ?? null)
  }, [filterParams])

  const handleSelect = useCallback(() => {
    setIsDetailModalOpen(true)
  }, [])

  const distanceKm = useMemo(
    () =>
      filterParams && recommendation
        ? calculateDistance(filterParams.origin, recommendation.destination.coordinates)
        : 0,
    [filterParams, recommendation]
  )

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
      <ResultsReveal
        recommendation={recommendation}
        onShuffle={handleShuffle}
        onSelect={handleSelect}
      />
      <DestinationDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        destination={recommendation?.destination ?? null}
        distanceKm={distanceKm}
        nights={filterParams.nights}
        groupSize={filterParams.groupSize}
      />
    </main>
  )
}
