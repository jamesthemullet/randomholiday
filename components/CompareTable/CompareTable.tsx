import React from 'react'
import type { Coordinates } from '@/lib/types'
import type { DestinationScore } from '@/lib/scoringEngine'
import { calculateDistance } from '@/lib/distanceCalculator'
import { calculateBudget } from '@/lib/budgetCalculator'
import { getSeasonalWeatherEstimate } from '@/lib/seasonalWeather'
import { flightHoursForDistance, formatFlightTime } from '@/lib/flightTime'
import { formatGbp } from '@/lib/currency'
import styles from './CompareTable.module.css'

export interface CompareTableProps {
  candidates: DestinationScore[]
  /** Departure point, used to work out flight time, distance and flight cost per candidate. */
  origin: Coordinates
  nights: number
  groupSize: number
  /** 1-12. When omitted, no weather row is shown. */
  travelMonth?: number
  /** Called with the chosen destination's id when the user picks one from the table. */
  onChoose: (destinationId: string) => void
  /** Called when the user wants to leave compare mode without choosing. */
  onBack: () => void
}

function candidateStats(
  candidate: DestinationScore,
  origin: Coordinates,
  nights: number,
  groupSize: number,
  travelMonth?: number
) {
  const { destination } = candidate
  const distanceKm = calculateDistance(origin, destination.coordinates)
  const perPersonCost = calculateBudget({ destination, distanceKm, nights, groupSize }).perPersonCost
  const weather =
    travelMonth !== undefined
      ? getSeasonalWeatherEstimate(destination.climate, travelMonth, destination.coordinates.lat)
      : null

  return {
    destination,
    matchScore: Math.round(candidate.totalScore),
    flightTime: formatFlightTime(flightHoursForDistance(distanceKm)),
    distanceKm: Math.round(distanceKm),
    perPersonCost,
    weather,
  }
}

export function CompareTable({
  candidates,
  origin,
  nights,
  groupSize,
  travelMonth,
  onChoose,
  onBack,
}: CompareTableProps) {
  const rows = candidates.map((candidate) =>
    candidateStats(candidate, origin, nights, groupSize, travelMonth)
  )

  return (
    <section className={styles.wrapper} aria-labelledby="compare-heading">
      <div className={styles.header}>
        <h2 id="compare-heading" className={styles.heading}>
          Compare your options
        </h2>
        <button type="button" className={styles.backButton} onClick={onBack}>
          Back to your match
        </button>
      </div>

      {rows.length === 0 ? (
        <p className={styles.empty}>
          Only one destination matched your search, so there&apos;s nothing to compare yet. Try
          widening your budget or flight time.
        </p>
      ) : (
        <div className={styles.tableScroll}>
          <table className={styles.table}>
            <caption className="sr-only">
              Comparing {rows.length} destinations on match, flight time, distance, cost and
              weather
            </caption>
            <thead>
              <tr>
                <th scope="col">
                  <span className="sr-only">Stat</span>
                </th>
                {rows.map((row) => (
                  <th scope="col" key={row.destination.id} className={styles.destinationHeader}>
                    {row.destination.name}
                    <span className={styles.country}>{row.destination.country}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <th scope="row">Match</th>
                {rows.map((row) => (
                  <td key={row.destination.id}>{row.matchScore}%</td>
                ))}
              </tr>
              <tr>
                <th scope="row">Flight time</th>
                {rows.map((row) => (
                  <td key={row.destination.id}>{row.flightTime}</td>
                ))}
              </tr>
              <tr>
                <th scope="row">Distance</th>
                {rows.map((row) => (
                  <td key={row.destination.id}>{row.distanceKm.toLocaleString()} km</td>
                ))}
              </tr>
              <tr>
                <th scope="row">Est. cost pp</th>
                {rows.map((row) => (
                  <td key={row.destination.id}>{formatGbp(row.perPersonCost)}</td>
                ))}
              </tr>
              {rows[0].weather && (
                <tr>
                  <th scope="row">Weather</th>
                  {rows.map((row) => (
                    <td key={row.destination.id}>
                      {row.weather ? `${row.weather.avgHighC}°C, ${row.weather.description}` : ''}
                    </td>
                  ))}
                </tr>
              )}
              <tr>
                <th scope="row">
                  <span className="sr-only">Choose</span>
                </th>
                {rows.map((row) => (
                  <td key={row.destination.id}>
                    <button
                      type="button"
                      className={styles.chooseButton}
                      onClick={() => onChoose(row.destination.id)}
                    >
                      Pick this one
                    </button>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
