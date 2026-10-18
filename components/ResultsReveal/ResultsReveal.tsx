'use client'

import React from 'react'
import Link from 'next/link'
import { motion, useReducedMotion, type Variants } from 'framer-motion'
import type { DestinationScore } from '@/lib/scoringEngine'
import { getDestinationImagePath } from '@/lib/destinationImage'
import { DestinationCard } from '@/components/DestinationCard'
import { Badge } from '@/components/Badge'
import { Button } from '@/components/Button'
import { Spinner } from '@/components/Spinner'
import styles from './ResultsReveal.module.css'

export interface ResultsRevealProps {
  recommendation: DestinationScore | null
  /** True while the destination is still being chosen, so an empty result isn't shown as "no match". */
  isPicking?: boolean
  onShuffle: () => void
  onSelect?: (destinationId: string) => void
  /** Where "Change search" links to, typically the homepage form prefilled with this search. */
  changeSearchHref?: string
}

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
}

export function ResultsReveal({
  recommendation,
  isPicking = false,
  onShuffle,
  onSelect,
  changeSearchHref,
}: ResultsRevealProps) {
  const prefersReducedMotion = useReducedMotion()

  return (
    <section className={styles.wrapper} aria-labelledby="results-heading">
      <div className={styles.header}>
        <h1 id="results-heading" className={styles.heading}>
          Your Match
        </h1>
        <div className={styles.actions}>
          {changeSearchHref && (
            <Link href={changeSearchHref} className={styles.changeSearch}>
              Change search
            </Link>
          )}
          <Button type="button" variant="secondary" onClick={onShuffle} disabled={isPicking}>
            Shuffle
          </Button>
        </div>
      </div>

      <p className="sr-only" role="status" aria-live="polite">
        {recommendation
          ? `New match: ${recommendation.destination.name}, ${recommendation.destination.country} — ${Math.round(recommendation.totalScore)}% match`
          : ''}
      </p>

      {isPicking ? (
        <div className={styles.picking}>
          <Spinner size="lg" label="Picking your destination…" />
        </div>
      ) : !recommendation ? (
        <p className={styles.empty}>
          No destinations matched your search. Try adjusting your budget or distance.
        </p>
      ) : (
        <motion.div
          key={recommendation.destination.id}
          className={styles.cardWrapper}
          initial={prefersReducedMotion ? undefined : 'hidden'}
          animate={prefersReducedMotion ? undefined : 'visible'}
          variants={prefersReducedMotion ? undefined : cardVariants}
        >
          <Badge variant="primary" className={styles.matchBadge}>
            {Math.round(recommendation.totalScore)}% match
          </Badge>
          <DestinationCard
            destination={{
              ...recommendation.destination,
              imageUrl: getDestinationImagePath(recommendation.destination.id),
            }}
            onSelect={onSelect ? () => onSelect(recommendation.destination.id) : undefined}
          />
        </motion.div>
      )}
    </section>
  )
}
