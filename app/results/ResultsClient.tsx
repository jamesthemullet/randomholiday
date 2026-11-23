'use client'

import React, { useCallback, useMemo, useState, useSyncExternalStore } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { pickableDestinations } from '@/lib/catalogue'
import { supportedDepartureCities } from '@/lib/departureCities'
import { getRecommendations } from '@/lib/recommendationEngine'
import { scoreDestination } from '@/lib/scoringEngine'
import type { DestinationScore } from '@/lib/scoringEngine'
import { calculateDistance } from '@/lib/distanceCalculator'
import { calculateBudget } from '@/lib/budgetCalculator'
import { getSeasonalWeatherEstimate } from '@/lib/seasonalWeather'
import { encodeShareableResult } from '@/lib/shareableResult'
import { parseMaxFlightHours, parseTravelStyles } from '@/lib/tripQuery'
import { ResultsReveal } from '@/components/ResultsReveal'
import { ComparisonTable } from '@/components/ComparisonTable'
import type { ComparisonEntry } from '@/components/ComparisonTable'
import { DestinationDetailModal } from '@/components/DestinationDetailModal'
import { AdSlot } from '@/components/AdSlot'
import styles from './results.module.css'

/** How many candidates "Compare" rolls at once. */
const COMPARE_COUNT = 3

const subscribeToNothing = () => () => {}
const getClientSnapshot = () => true
const getServerSnapshot = () => false

/** How many of the most recently shown destinations "Spin again" excludes from the next pick. */
const RECENT_EXCLUSION_LIMIT = 5

export function ResultsClient() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const filterParams = useMemo(() => {
    const originId = searchParams.get('originId')
    const city = supportedDepartureCities.find((c) => c.id === originId)
    const budget = Number(searchParams.get('budget'))
    const maxFlightHours = parseMaxFlightHours(searchParams)
    const nights = Number(searchParams.get('nights'))
    const groupSize = Number(searchParams.get('groupSize'))
    const travelMonth = Number(searchParams.get('month'))
    const travelStyles = parseTravelStyles(searchParams.get('styles'))

    if (!city || !budget || !maxFlightHours || !nights || !groupSize) return null

    return {
      originName: city.name,
      origin: city.coordinates,
      maxBudgetPerPerson: budget,
      maxFlightHours,
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

  // A pinned share link always shows that one destination, so compare mode doesn't apply to it.
  const compareMode = !pinnedDestinationId && searchParams.get('compare') === '1'

  const comparisonEntries = useMemo((): ComparisonEntry[] | null => {
    if (!filterParams || !compareMode || !isClient) return null
    const month = filterParams.travelMonth ?? new Date().getMonth() + 1
    return getRecommendations(pickableDestinations, {
      ...filterParams,
      count: COMPARE_COUNT,
    }).recommendations.map((recommendation) => {
      const entryDistanceKm = calculateDistance(
        filterParams.origin,
        recommendation.destination.coordinates
      )
      const entryPerPersonCost = calculateBudget({
        destination: recommendation.destination,
        distanceKm: entryDistanceKm,
        nights: filterParams.nights,
        groupSize: filterParams.groupSize,
      }).perPersonCost
      const weather = getSeasonalWeatherEstimate(
        recommendation.destination.climate,
        month,
        recommendation.destination.coordinates.lat
      )
      return { recommendation, distanceKm: entryDistanceKm, perPersonCost: entryPerPersonCost, weather }
    })
  }, [filterParams, compareMode, isClient])

  const handleToggleCompare = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString())
    if (compareMode) {
      params.delete('compare')
    } else {
      params.set('compare', '1')
    }
    router.push(`/results?${params.toString()}`)
  }, [searchParams, compareMode, router])

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
      maxFlightHours: filterParams.maxFlightHours,
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
        {!pinnedDestinationId && (
          <button type="button" className={styles.compareToggle} onClick={handleToggleCompare}>
            {compareMode ? '← Back to single pick' : `Compare ${COMPARE_COUNT} destinations`}
          </button>
        )}
        {compareMode ? (
          comparisonEntries === null ? (
            <p className={styles.picking}>Picking your destinations…</p>
          ) : comparisonEntries.length > 0 ? (
            <ComparisonTable entries={comparisonEntries} originName={filterParams.originName} />
          ) : (
            <p className={styles.empty}>
              No destinations matched your search to compare. Try adjusting your budget or flight
              time.
            </p>
          )
        ) : (
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
        )}
        <AdSlot format="banner" className={styles.adSlot} />
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
