import React from 'react'
import { UpgradePrompt } from '@/components/UpgradePrompt'
import { isProUnlocked, type ProFeature, type ProTierStatus } from '@/lib/proTier'

export interface ProGateProps {
  status: ProTierStatus
  feature: ProFeature
  onUpgrade?: () => void
  children: React.ReactNode
}

/**
 * Renders `children` when the current tier unlocks `feature`, otherwise
 * renders an UpgradePrompt in its place.
 */
export function ProGate({ status, feature, onUpgrade, children }: ProGateProps) {
  if (isProUnlocked(status)) {
    return <>{children}</>
  }

  return <UpgradePrompt feature={feature} onUpgrade={onUpgrade} />
}
