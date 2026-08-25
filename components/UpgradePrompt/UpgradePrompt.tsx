import React from 'react'
import { Badge } from '@/components/Badge'
import { Button } from '@/components/Button'
import { getProFeatureLabel, type ProFeature } from '@/lib/proTier'
import styles from './UpgradePrompt.module.css'

export interface UpgradePromptProps {
  feature: ProFeature
  onUpgrade?: () => void
  className?: string
}

export function UpgradePrompt({ feature, onUpgrade, className }: UpgradePromptProps) {
  const classes = [styles.prompt, className].filter(Boolean).join(' ')

  return (
    <div className={classes} role="status">
      <div className={styles.message}>
        <Badge variant="secondary" className={styles.badge}>
          Pro
        </Badge>
        <span>{getProFeatureLabel(feature)} with RandomHoliday Pro.</span>
      </div>
      {onUpgrade && (
        <Button type="button" variant="secondary" size="sm" onClick={onUpgrade}>
          Upgrade to Pro
        </Button>
      )}
    </div>
  )
}
