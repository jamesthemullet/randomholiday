'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { UpgradePrompt } from '@/components/UpgradePrompt'
import styles from './TripActions.module.css'

export interface TripActionsProps {
  destinationName: string
  /** Absolute or site-relative URL to share. Falls back to `window.location.href` when omitted. */
  shareUrl?: string
  className?: string
}

export function TripActions({ destinationName, shareUrl, className }: TripActionsProps) {
  const router = useRouter()
  const [showUpsell, setShowUpsell] = useState(false)
  const [shareStatus, setShareStatus] = useState<string | null>(null)

  const handleSave = () => {
    setShowUpsell(true)
  }

  const handleShare = async () => {
    const url = shareUrl ? new URL(shareUrl, window.location.origin).toString() : window.location.href
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
        <button type="button" className={styles.save} onClick={handleSave}>
          Save trip
        </button>
        <button type="button" className={styles.share} onClick={handleShare}>
          Share
        </button>
      </div>

      {showUpsell && (
        <UpgradePrompt feature="save-trip" onUpgrade={() => router.push('/pricing')} />
      )}

      {shareStatus && (
        <p className={styles.message} role="status">
          {shareStatus}
        </p>
      )}
    </div>
  )
}
