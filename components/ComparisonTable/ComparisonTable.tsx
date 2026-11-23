import React from 'react'
import Link from 'next/link'
import type { DestinationScore } from '@/lib/scoringEngine'
import type { SeasonalWeatherEstimate } from '@/lib/seasonalWeather'
import { formatGbp } from '@/lib/currency'
import { flightHoursForDistance, formatFlightTime } from '@/lib/flightTime'
import { getFcdoUrl, getSafetyStatus } from '@/lib/travelAdvisory'
import { Badge } from '@/components/Badge'
import styles from './ComparisonTable.module.css'

export interface ComparisonEntry {
  recommendation: DestinationScore
  /** Great-circle distance from the chosen origin, in km. */
  distanceKm: number
  perPersonCost: number
  weather: SeasonalWeatherEstimate
}

export interface ComparisonTableProps {
  entries: ComparisonEntry[]
  /** Departure city name, shown in the table's caption. */
  originName?: string
}

export function ComparisonTable({ entries, originName }: ComparisonTableProps) {
  return (
    <div className={styles.wrapper}>
      <table className={styles.table}>
        <caption className="sr-only">
          Comparing {entries.length} destinations{originName ? ` from ${originName}` : ''}
        </caption>
        <thead>
          <tr>
            <th scope="col">
              <span className="sr-only">Detail</span>
            </th>
            {entries.map(({ recommendation }) => (
              <th scope="col" key={recommendation.destination.id} className={styles.destinationHeader}>
                <Link
                  href={`/destination/${recommendation.destination.id}`}
                  className={styles.destinationLink}
                >
                  {recommendation.destination.name}
                </Link>
                <span className={styles.country}>{recommendation.destination.country}</span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            <th scope="row">Match</th>
            {entries.map(({ recommendation }) => (
              <td key={recommendation.destination.id}>{Math.round(recommendation.totalScore)}%</td>
            ))}
          </tr>
          <tr>
            <th scope="row">Flight time</th>
            {entries.map(({ recommendation, distanceKm }) => (
              <td key={recommendation.destination.id}>
                {formatFlightTime(flightHoursForDistance(distanceKm))}
              </td>
            ))}
          </tr>
          <tr>
            <th scope="row">Est. cost pp</th>
            {entries.map(({ recommendation, perPersonCost }) => (
              <td key={recommendation.destination.id}>{formatGbp(perPersonCost)}</td>
            ))}
          </tr>
          <tr>
            <th scope="row">Weather</th>
            {entries.map(({ recommendation, weather }) => (
              <td key={recommendation.destination.id}>
                {weather.avgHighC}°C, {weather.description}
              </td>
            ))}
          </tr>
          <tr>
            <th scope="row">Travel advisory</th>
            {entries.map(({ recommendation }) => {
              const destinationId = recommendation.destination.id
              const isAdvisoryWarning = getSafetyStatus(destinationId) === 'warn'
              const fcdoUrl = isAdvisoryWarning ? getFcdoUrl(destinationId) : undefined
              return (
                <td key={destinationId}>
                  {fcdoUrl ? (
                    <a href={fcdoUrl} target="_blank" rel="noopener noreferrer">
                      <Badge variant="warning">Check FCDO advice</Badge>
                    </a>
                  ) : (
                    <span className={styles.noAdvisory}>None</span>
                  )}
                </td>
              )
            })}
          </tr>
        </tbody>
      </table>
    </div>
  )
}
