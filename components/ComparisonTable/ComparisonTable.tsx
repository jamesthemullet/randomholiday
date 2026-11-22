'use client'

import React from 'react'
import type { DestinationScore } from '@/lib/scoringEngine'
import type { Coordinates } from '@/lib/types'
import { calculateDistance } from '@/lib/distanceCalculator'
import { calculateBudget } from '@/lib/budgetCalculator'
import { flightHoursForDistance, formatFlightTime } from '@/lib/flightTime'
import { getSeasonalWeatherEstimate } from '@/lib/seasonalWeather'
import { getMonthName } from '@/lib/tripQuery'
import { formatGbp } from '@/lib/currency'
import styles from './ComparisonTable.module.css'

export interface ComparisonTableProps {
  /** Destinations to compare side by side, e.g. from `getRecommendations` with `count` > 1. */
  candidates: DestinationScore[]
  /** Departure point, used to recompute each candidate's distance/flight time/cost. */
  origin: Coordinates
  nights: number
  groupSize: number
  /** When provided, adds a weather row estimating this month's typical high for each destination. */
  travelMonth?: number
  onSelect?: (candidate: DestinationScore) => void
  onBack: () => void
}

function distanceKmFor(origin: Coordinates, candidate: DestinationScore): number {
  return calculateDistance(origin, candidate.destination.coordinates)
}

export function ComparisonTable({
  candidates,
  origin,
  nights,
  groupSize,
  travelMonth,
  onSelect,
  onBack,
}: ComparisonTableProps) {
  return (
    <section className={styles.wrapper} aria-labelledby="compare-heading">
      <h2 id="compare-heading" className={styles.heading}>
        Compare {candidates.length} destination{candidates.length === 1 ? '' : 's'}
      </h2>
      {candidates.length === 0 ? (
        <p className={styles.empty}>No destinations matched to compare.</p>
      ) : (
        <div className={styles.scroll}>
          <table className={styles.table}>
            <caption className="sr-only">
              Comparing {candidates.length} destinations on match, cost and flight time
              {travelMonth !== undefined ? ', and weather' : ''}
            </caption>
            <thead>
              <tr>
                <th scope="col" className={styles.cornerCell}>
                  <span className="sr-only">Metric</span>
                </th>
                {candidates.map((candidate) => (
                  <th scope="col" key={candidate.destination.id} className={styles.destCell}>
                    {candidate.destination.name}
                    <span className={styles.country}>{candidate.destination.country}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <th scope="row">Match</th>
                {candidates.map((candidate) => (
                  <td key={candidate.destination.id}>{Math.round(candidate.totalScore)}%</td>
                ))}
              </tr>
              <tr>
                <th scope="row">Est. cost per person</th>
                {candidates.map((candidate) => {
                  const { perPersonCost } = calculateBudget({
                    destination: candidate.destination,
                    distanceKm: distanceKmFor(origin, candidate),
                    nights,
                    groupSize,
                  })
                  return <td key={candidate.destination.id}>{formatGbp(perPersonCost)}</td>
                })}
              </tr>
              <tr>
                <th scope="row">Flight time</th>
                {candidates.map((candidate) => (
                  <td key={candidate.destination.id}>
                    {formatFlightTime(flightHoursForDistance(distanceKmFor(origin, candidate)))}
                  </td>
                ))}
              </tr>
              {travelMonth !== undefined && (
                <tr>
                  <th scope="row">Weather in {getMonthName(travelMonth)}</th>
                  {candidates.map((candidate) => {
                    const weather = getSeasonalWeatherEstimate(
                      candidate.destination.climate,
                      travelMonth,
                      candidate.destination.coordinates.lat
                    )
                    return (
                      <td key={candidate.destination.id}>
                        {weather.avgHighC}°C, {weather.description}
                      </td>
                    )
                  })}
                </tr>
              )}
              {onSelect && (
                <tr>
                  <th scope="row">
                    <span className="sr-only">Actions</span>
                  </th>
                  {candidates.map((candidate) => (
                    <td key={candidate.destination.id}>
                      <button
                        type="button"
                        className={styles.selectButton}
                        onClick={() => onSelect(candidate)}
                      >
                        See prices &amp; book
                      </button>
                    </td>
                  ))}
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
      <button type="button" className={styles.backLink} onClick={onBack}>
        <span aria-hidden="true">← </span>Back to single result
      </button>
    </section>
  )
}
