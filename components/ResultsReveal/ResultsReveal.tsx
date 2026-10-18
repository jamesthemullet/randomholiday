'use client'

import React, { useEffect, useState, useSyncExternalStore } from 'react'
import Link from 'next/link'
import type { DestinationScore } from '@/lib/scoringEngine'
import { getDestinationImagePath, getPosterTheme } from '@/lib/destinationImage'
import styles from './ResultsReveal.module.css'

export interface ResultsRevealProps {
  recommendation: DestinationScore | null
  /** True while the destination is still being chosen, so an empty result isn't shown as "no match". */
  isPicking?: boolean
  onShuffle: () => void
  onSelect?: (destinationId: string) => void
  /** Where "Change my answers" links to, typically the homepage planner prefilled with this search. */
  changeSearchHref?: string
  /** Departure city name, shown on the departures board and the postcard. */
  originName?: string
  /** Trip details for the postcard's stats row; each is only shown when provided. */
  distanceKm?: number
  nights?: number
  perPersonCost?: number
}

const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
/** Milliseconds between each flip of the departures board. */
export const FLAP_INTERVAL_MS = 65
/** Flips of pure noise before letters start locking in, left to right. */
const FLAP_WARMUP_TICKS = 12
const PICKING_FLAPS = '??????'
const ACTIVITY_THEMES = ['yellow', 'turquoise', 'coral', 'ocean'] as const

export function getFlapTicks(target: string): number {
  return FLAP_WARMUP_TICKS + 2 + target.length * 2
}

/**
 * The board's text after `tick` flips: letters lock in one by one from the left, and the rest
 * cycle through the alphabet. Deterministic, so the server and client render the same frame.
 */
export function getFlapFrame(target: string, tick: number): string {
  const locked = Math.max(0, Math.floor((tick - FLAP_WARMUP_TICKS) / 2))
  return target
    .split('')
    .map((ch, i) =>
      i < locked || !/[A-Z]/.test(ch) ? ch : GLYPHS[(i * 7 + tick * 11 + ch.charCodeAt(0)) % 26]
    )
    .join('')
}

const reducedMotionQuery = '(prefers-reduced-motion: reduce)'

function subscribeToReducedMotion(onChange: () => void) {
  const mql = window.matchMedia(reducedMotionQuery)
  mql.addEventListener('change', onChange)
  return () => mql.removeEventListener('change', onChange)
}

// Server and hydration render as "motion allowed", then switch after hydrating, so the
// first client frame always matches the server HTML.
function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(
    subscribeToReducedMotion,
    () => window.matchMedia(reducedMotionQuery).matches,
    () => false
  )
}

/** Animates the departures board towards `target`, restarting whenever it changes. */
function useSplitFlap(target: string, skip: boolean): { text: string; settled: boolean } {
  const total = getFlapTicks(target)
  const [flap, setFlap] = useState({ target, tick: 0 })
  // Restart from noise when a new destination arrives (adjusting state during render).
  if (flap.target !== target) setFlap({ target, tick: 0 })

  const settled = skip || flap.tick >= total

  useEffect(() => {
    if (settled) return
    const timer = setInterval(() => {
      setFlap((f) => ({ ...f, tick: f.tick + 1 }))
    }, FLAP_INTERVAL_MS)
    return () => clearInterval(timer)
  }, [settled, target])

  return { text: settled ? target : getFlapFrame(target, flap.tick), settled }
}

function formatUsd(value: number): string {
  return `$${Math.round(value).toLocaleString('en-US')}`
}

function Postcard({
  recommendation,
  revealDelayMs,
  onShuffle,
  onSelect,
  changeSearchHref,
  originName,
  distanceKm,
  nights,
  perPersonCost,
}: Omit<ResultsRevealProps, 'recommendation' | 'isPicking'> & {
  recommendation: DestinationScore
  revealDelayMs: number
}) {
  const { destination } = recommendation
  const [imageFailed, setImageFailed] = useState(false)
  const score = Math.round(recommendation.totalScore)

  const stats = [
    originName !== undefined && { label: 'From', value: originName },
    distanceKm !== undefined && {
      label: 'Distance',
      value: `${(Math.round(distanceKm / 10) * 10).toLocaleString('en-US')} km`,
    },
    nights !== undefined && {
      label: 'Trip',
      value: `${nights} ${nights === 1 ? 'night' : 'nights'}`,
    },
    perPersonCost !== undefined && { label: 'Est. pp', value: formatUsd(perPersonCost) },
  ].filter((stat): stat is { label: string; value: string } => Boolean(stat))

  return (
    <article
      className={styles.postcard}
      style={{ '--reveal-delay': `${revealDelayMs}ms` } as React.CSSProperties}
      aria-labelledby="match-name"
    >
      <div className={styles.photo}>
        {imageFailed ? (
          <div className={`${styles.poster} ${styles[getPosterTheme(destination.id)]}`}>
            <span className={styles.posterKicker}>GREETINGS FROM</span>
            <span className={styles.posterName} aria-hidden="true">
              {destination.name}
            </span>
            <span className={styles.posterNote}>Photos coming soon</span>
          </div>
        ) : (
          <img
            src={getDestinationImagePath(destination.id)}
            alt={`${destination.name}, ${destination.country}`}
            className={styles.image}
            // A server-rendered image can fail before hydration attaches onError, so also
            // check once it mounts.
            ref={(img) => {
              if (img?.complete && img.naturalWidth === 0) setImageFailed(true)
            }}
            onError={() => setImageFailed(true)}
          />
        )}
      </div>

      <div className={styles.details}>
        <div className={styles.stamp} aria-hidden="true">
          <span className={styles.stampScore}>{score}%</span>
          <span className={styles.stampLabel}>MATCH</span>
        </div>
        <span className={styles.kicker} aria-hidden="true">
          YOUR MATCH
        </span>
        <h2 id="match-name" className={styles.name}>
          {destination.name}
        </h2>
        <p className={styles.country}>{destination.country}</p>
        <p className={styles.description}>{destination.description}</p>
        {destination.activities.length > 0 && (
          <ul className={styles.activities} aria-label="Things to do">
            {destination.activities.map((activity, i) => (
              <li
                key={activity}
                className={`${styles.activity} ${styles[ACTIVITY_THEMES[i % ACTIVITY_THEMES.length]]}`}
              >
                {activity}
              </li>
            ))}
          </ul>
        )}
        {stats.length > 0 && (
          <dl className={styles.stats}>
            {stats.map((stat) => (
              <div key={stat.label} className={styles.stat}>
                <dt className={styles.statLabel}>{stat.label}</dt>
                <dd className={styles.statValue}>{stat.value}</dd>
              </div>
            ))}
          </dl>
        )}
        <div className={styles.actions}>
          {onSelect && (
            <button
              type="button"
              className={styles.primaryAction}
              onClick={() => onSelect(destination.id)}
            >
              See prices &amp; book <span aria-hidden="true">→</span>
            </button>
          )}
          <button type="button" className={styles.secondaryAction} onClick={onShuffle}>
            <span aria-hidden="true">↻ </span>Spin again
          </button>
          {changeSearchHref && (
            <Link href={changeSearchHref} className={styles.changeLink}>
              Change my answers
            </Link>
          )}
        </div>
      </div>
    </article>
  )
}

export function ResultsReveal({
  recommendation,
  isPicking = false,
  onShuffle,
  onSelect,
  changeSearchHref,
  originName,
  distanceKm,
  nights,
  perPersonCost,
}: ResultsRevealProps) {
  const prefersReducedMotion = usePrefersReducedMotion()
  const target = recommendation ? recommendation.destination.name.toUpperCase() : 'NO MATCH'
  const flap = useSplitFlap(target, prefersReducedMotion || isPicking || !recommendation)

  const boardText = isPicking ? PICKING_FLAPS : flap.text
  const status = isPicking
    ? { text: 'SHUFFLING…', tone: styles.statusShuffling }
    : !recommendation
      ? { text: 'CANCELLED', tone: styles.statusCancelled }
      : flap.settled
        ? { text: 'NOW BOARDING', tone: styles.statusBoarding }
        : { text: 'SHUFFLING…', tone: styles.statusShuffling }
  // The postcard is in the DOM straight away (for screen readers and the live region) but
  // only pops into view once the board has finished flipping.
  const revealDelayMs = prefersReducedMotion ? 0 : getFlapTicks(target) * FLAP_INTERVAL_MS

  return (
    <section className={styles.wrapper} aria-labelledby="results-heading">
      <h1 id="results-heading" className="sr-only">
        Your Match
      </h1>

      <p className="sr-only" role="status" aria-live="polite">
        {recommendation
          ? `New match: ${recommendation.destination.name}, ${recommendation.destination.country} — ${Math.round(recommendation.totalScore)}% match`
          : ''}
      </p>

      <div className={styles.board} aria-hidden="true">
        <div className={styles.boardHeader}>
          <span>DEPARTURES{originName ? ` · FROM ${originName.toUpperCase()}` : ''}</span>
          <span className={status.tone}>{status.text}</span>
        </div>
        <div className={styles.flaps}>
          {boardText.split('').map((ch, i) => (
            <span key={i} className={styles.flap}>
              {ch === ' ' ? ' ' : ch}
            </span>
          ))}
        </div>
      </div>

      {isPicking ? (
        <p className={styles.picking}>Picking your destination…</p>
      ) : !recommendation ? (
        <div className={styles.empty}>
          <h2 className={styles.emptyTitle}>Nowhere fits… yet.</h2>
          <p className={styles.emptyText}>
            No destinations matched your search. Try adjusting your budget or distance.
          </p>
          {changeSearchHref && (
            <Link href={changeSearchHref} className={styles.primaryAction}>
              Change my answers
            </Link>
          )}
        </div>
      ) : (
        <Postcard
          key={recommendation.destination.id}
          recommendation={recommendation}
          revealDelayMs={revealDelayMs}
          onShuffle={onShuffle}
          onSelect={onSelect}
          changeSearchHref={changeSearchHref}
          originName={originName}
          distanceKm={distanceKm}
          nights={nights}
          perPersonCost={perPersonCost}
        />
      )}
    </section>
  )
}
