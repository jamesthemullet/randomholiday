import React from 'react'
import { isProUnlocked, type ProTierStatus } from '@/lib/proTier'
import styles from './AdSlot.module.css'

export type AdSlotFormat = 'banner' | 'rectangle' | 'leaderboard'

export interface AdSlotProps {
  format: AdSlotFormat
  /** Pro tier status for the current user. Pro unlocks ad-free browsing, so a 'pro' status renders nothing. */
  status?: ProTierStatus
  className?: string
}

/**
 * Reserves space for a Google AdSense unit. Renders a labelled placeholder box
 * rather than a live ad until an AdSense publisher ID and script are wired up;
 * swapping in real ads later won't shift surrounding layout since the size is fixed.
 */
export function AdSlot({ format, status = 'free', className }: AdSlotProps) {
  if (isProUnlocked(status)) {
    return null
  }

  const classes = [styles.slot, styles[format], className].filter(Boolean).join(' ')

  return (
    <div className={classes} role="complementary" aria-label="Advertisement">
      <span className={styles.label}>Advertisement</span>
    </div>
  )
}
