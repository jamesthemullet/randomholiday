'use client'

import React from 'react'
import { motion, useReducedMotion, type Variants } from 'framer-motion'
import type { DestinationScore } from '@/lib/scoringEngine'
import { DestinationCard } from '@/components/DestinationCard'
import { Badge } from '@/components/Badge'
import { Button } from '@/components/Button'
import styles from './ResultsReveal.module.css'

export interface ResultsRevealProps {
  recommendations: DestinationScore[]
  onShuffle: () => void
  onSelect?: (destinationId: string) => void
}

const containerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } },
}

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
}

export function ResultsReveal({ recommendations, onShuffle, onSelect }: ResultsRevealProps) {
  const prefersReducedMotion = useReducedMotion()
  const revealKey = recommendations.map((r) => r.destination.id).join('|')

  return (
    <section className={styles.wrapper} aria-labelledby="results-heading">
      <div className={styles.header}>
        <h2 id="results-heading" className={styles.heading}>
          {recommendations.length === 1
            ? 'Your Top Match'
            : `Your Top ${recommendations.length} Matches`}
        </h2>
        <Button type="button" variant="secondary" onClick={onShuffle}>
          Shuffle
        </Button>
      </div>

      {recommendations.length === 0 ? (
        <p className={styles.empty}>
          No destinations matched your search. Try adjusting your budget or distance.
        </p>
      ) : (
        <motion.div
          key={revealKey}
          className={styles.grid}
          variants={prefersReducedMotion ? undefined : containerVariants}
          initial={prefersReducedMotion ? undefined : 'hidden'}
          animate={prefersReducedMotion ? undefined : 'visible'}
        >
          {recommendations.map(({ destination, totalScore }) => (
            <motion.div
              key={destination.id}
              className={styles.cardWrapper}
              variants={prefersReducedMotion ? undefined : cardVariants}
            >
              <Badge variant="primary" className={styles.matchBadge}>
                {Math.round(totalScore)}% match
              </Badge>
              <DestinationCard
                destination={destination}
                onSelect={onSelect ? () => onSelect(destination.id) : undefined}
              />
            </motion.div>
          ))}
        </motion.div>
      )}
    </section>
  )
}
