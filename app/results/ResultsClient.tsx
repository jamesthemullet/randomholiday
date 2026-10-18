'use client'

import React, { useCallback, useMemo, useState, useSyncExternalStore } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { TRAVEL_STYLES } from '@/lib/destinations'
import { pickableDestinations } from '@/lib/catalogue'
import type { TravelStyle } from '@/lib/destinations'
import { supportedDepartureCities } from '@/lib/departureCities'
import { getRecommendations } from '@/lib/recommendationEngine'
import { scoreDestination } from '@/lib/scoringEngine'
import type { DestinationScore } from '@/lib/scoringEngine'
import { calculateDistance } from '@/lib/distanceCalculator'
import { calculateBudget } from '@/lib/budgetCalculator'
import { ResultsReveal } from '@/components/ResultsReveal'
import { DestinationDetailModal } from '@/components/DestinationDetailModal'
import styles from './results.module.css'

const subscribeToNothing = () => () => {}
const getClientSnapshot = () => true
const getServerSnapshot = () => false

export function ResultsClient() {
  const searchParams = useSearchParams()

  const filterParams = useMemo(() => {
    const originId = searchParams.get('originId')
    const city = supportedDepartureCities.find((c) => c.id === originId)
    const budget = Number(searchParams.get('budget'))
    const maxDistanceKm = Number(searchParams.get('distance'))
    const nights = Number(searchParams.get('nights'))
    const groupSize = Number(searchParams.get('groupSize'))
    const travelMonth = Number(searchParams.get('month'))
    const stylesParam = searchParams.get('styles')
    const travelStyles = stylesParam
      ? stylesParam
          .split(',')
          .filter((style): style is TravelStyle => TRAVEL_STYLES.includes(style as TravelStyle))
      : undefined

    if (!city || !budget || !maxDistanceKm || !nights || !groupSize) return null

    return {
      originName: city.name,
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

  // The random pick must only happen in the browser: the server and client would each roll a
  // different destination and fail hydration. This is false while hydrating, then true.
  const isClient = useSyncExternalStore(subscribeToNothing, getClientSnapshot, getServerSnapshot)

  // A pinned destination involves no randomness, so it can render on the server too.
  const pinnedRecommendation = useMemo(() => {
    if (!filterParams || !pinnedDestinationId) return null
    const pinnedDestination = pickableDestinations.find((d) => d.id === pinnedDestinationId)
    return pinnedDestination ? scoreDestination(pinnedDestination, filterParams) : null
  }, [filterParams, pinnedDestinationId])

  const initialPick = useMemo(() => {
    if (!filterParams || pinnedRecommendation || !isClient) return null
    return getRecommendations(pickableDestinations, filterParams).recommendations[0] ?? null
  }, [filterParams, pinnedRecommendation, isClient])

  // undefined until the user shuffles; null means a shuffle found nothing.
  const [shuffledPick, setShuffledPick] = useState<DestinationScore | null | undefined>(undefined)
  const recommendation =
    shuffledPick !== undefined ? shuffledPick : (pinnedRecommendation ?? initialPick)
  const isPicking = shuffledPick === undefined && !pinnedRecommendation && !isClient
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)

  const handleShuffle = useCallback(() => {
    if (!filterParams) return
    setShuffledPick(
      getRecommendations(pickableDestinations, filterParams).recommendations[0] ?? null
    )
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

  const perPersonCost = useMemo(
    () =>
      filterParams && recommendation
        ? calculateBudget({
            destination: recommendation.destination,
            distanceKm,
            nights: filterParams.nights,
            groupSize: filterParams.groupSize,
          }).perPersonCost
        : undefined,
    [filterParams, recommendation, distanceKm]
  )

  if (!filterParams) {
    return (
      <main id="main-content" className={styles.page}>
        <div className={styles.wrapper}>
          <p className={styles.empty}>
            We couldn&apos;t find your trip details. Please start over.
          </p>
          <Link href="/" className={styles.link}>
            Start over
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main id="main-content" className={styles.page}>
      <div className={styles.wrapper}>
        <ResultsReveal
          recommendation={recommendation}
          isPicking={isPicking}
          onShuffle={handleShuffle}
          onSelect={handleSelect}
          changeSearchHref={`/?${searchParams.toString()}`}
          originName={filterParams.originName}
          distanceKm={recommendation ? distanceKm : undefined}
          nights={filterParams.nights}
          perPersonCost={perPersonCost}
        />
        <DestinationDetailModal
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          destination={recommendation?.destination ?? null}
          distanceKm={distanceKm}
          nights={filterParams.nights}
          groupSize={filterParams.groupSize}
          month={filterParams.travelMonth}
          originName={filterParams.originName}
        />
      </div>
    </main>
  )
}
