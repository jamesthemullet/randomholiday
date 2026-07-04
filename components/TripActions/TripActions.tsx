'use client'

import React, { useState } from 'react'
import { Button } from '@/components/Button'
import { Badge } from '@/components/Badge'
import styles from './TripActions.module.css'

export interface TripActionsProps {
  destinationName: string
  shareUrl?: string
  className?: string
}

export function TripActions({ destinationName, shareUrl, className }: TripActionsProps) {
  const [showUpsell, setShowUpsell] = useState(false)
  const [shareStatus, setShareStatus] = useState<string | null>(null)

  const handleSave = () => {
    setShowUpsell(true)
  }

  const handleShare = async () => {
    const url = shareUrl ?? window.location.href
    setShareStatus(null)

    if (typeof navigator.share === 'function') {
      try {
        await navigator.share({
          title: `${destinationName} — RandomHoliday`,
          text: `Check out my random holiday match: ${destinationName}!`,
          url,
        })
      } catch {
        // user cancelled the native share sheet — no action needed
      }
      return
    }

    try {
      await navigator.clipboard.writeText(url)
      setShareStatus('Link copied to clipboard!')
    } catch {
      setShareStatus('Unable to copy link. Please copy the URL from your browser.')
    }
  }

  const classes = [styles.wrapper, className].filter(Boolean).join(' ')

  return (
    <div className={classes}>
      <div className={styles.buttons}>
        <Button type="button" variant="secondary" onClick={handleSave}>
          Save trip
        </Button>
        <Button type="button" variant="ghost" onClick={handleShare}>
          Share
        </Button>
      </div>

      {showUpsell && (
        <p className={styles.message} role="status">
          <Badge variant="secondary" className={styles.proBadge}>
            Pro
          </Badge>
          Save your favourite trips with RandomHoliday Pro.
        </p>
      )}

      {shareStatus && (
        <p className={styles.message} role="status">
          {shareStatus}
        </p>
      )}
    </div>
  )
}
