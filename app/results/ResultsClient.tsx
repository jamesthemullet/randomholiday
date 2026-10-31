'use client'

import React, { useCallback, useMemo, useState, useSyncExternalStore } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { pickableDestinations } from '@/lib/catalogue'
import { supportedDepartureCities } from '@/lib/departureCities'
import { getRecommendations } from '@/lib/recommendationEngine'
import { scoreDestination } from '@/lib/scoringEngine'
import type { DestinationScore } from '@/lib/scoringEngine'
import { calculateDistance } from '@/lib/distanceCalculator'
import { calculateBudget } from '@/lib/budgetCalculator'
import { encodeShareableResult } from '@/lib/shareableResult'
import { parseTravelStyles } from '@/lib/tripQuery'
import { ResultsReveal } from '@/components/ResultsReveal'
import { DestinationDetailModal } from '@/components/DestinationDetailModal'
import styles from './results.module.css'

const subscribeToNothing = () => () => {}
const getClientSnapshot = () => true
const getServerSnapshot = () => false

/** How many of the most recently shown destinations "Spin again" excludes from the next pick. */
const RECENT_EXCLUSION_LIMIT = 5

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
    const travelStyles = parseTravelStyles(searchParams.get('styles'))

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

  // Tracks the last few destinations actually shown, so "Spin again" doesn't just re-roll back
  // to one of them. Updated during render (not an effect) so the very next shuffle already
  // excludes whatever is on screen right now.
  const [recentlyShown, setRecentlyShown] = useState<{ ids: string[]; lastId: string | null }>({
    ids: [],
    lastId: null,
  })
  if (recommendation && recommendation.destination.id !== recentlyShown.lastId) {
    const destinationId = recommendation.destination.id
    setRecentlyShown({
      ids: [...recentlyShown.ids, destinationId].slice(-RECENT_EXCLUSION_LIMIT),
      lastId: destinationId,
    })
  }

  const handleShuffle = useCallback(() => {
    if (!filterParams) return
    setShuffledPick(
      getRecommendations(pickableDestinations, {
        ...filterParams,
        excludeDestinationIds: recentlyShown.ids,
      }).recommendations[0] ?? null
    )
  }, [filterParams, recentlyShown.ids])

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

  // Pins the exact destination shown so the Share button sends a link that reproduces this
  // result, rather than the page's own URL which re-rolls on a shuffled pick.
  const shareUrl = useMemo(() => {
    if (!filterParams || !recommendation) return undefined
    const originId = searchParams.get('originId')
    if (!originId) return undefined

    const query = encodeShareableResult({
      destinationId: recommendation.destination.id,
      originId,
      maxBudgetPerPerson: filterParams.maxBudgetPerPerson,
      maxDistanceKm: filterParams.maxDistanceKm,
      nights: filterParams.nights,
      groupSize: filterParams.groupSize,
      travelStyles: filterParams.travelStyles,
      travelMonth: filterParams.travelMonth,
    })
    return `/results?${query}`
  }, [filterParams, recommendation, searchParams])

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
          shareUrl={shareUrl}
        />
      </div>
    </main>
  )
}
