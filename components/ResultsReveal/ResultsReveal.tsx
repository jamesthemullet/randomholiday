'use client'

import React from 'react'
import { motion, useReducedMotion, type Variants } from 'framer-motion'
import type { DestinationScore } from '@/lib/scoringEngine'
import { getDestinationImagePath } from '@/lib/destinationImage'
import { DestinationCard } from '@/components/DestinationCard'
import { Badge } from '@/components/Badge'
import { Button } from '@/components/Button'
import styles from './ResultsReveal.module.css'

export interface ResultsRevealProps {
  recommendation: DestinationScore | null
  onShuffle: () => void
  onSelect?: (destinationId: string) => void
}

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
}

export function ResultsReveal({ recommendation, onShuffle, onSelect }: ResultsRevealProps) {
  const prefersReducedMotion = useReducedMotion()

  return (
    <section className={styles.wrapper} aria-labelledby="results-heading">
      <div className={styles.header}>
        <h1 id="results-heading" className={styles.heading}>
          Your Match
        </h1>
        <Button type="button" variant="secondary" onClick={onShuffle}>
          Shuffle
        </Button>
      </div>

      {!recommendation ? (
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
