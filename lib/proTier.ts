export type ProTierStatus = 'free' | 'pro'

export type ProFeature = 'save-trip' | 'unlimited-shuffles' | 'ad-free' | 'priority-support'

const PRO_FEATURE_LABELS: Record<ProFeature, string> = {
  'save-trip': 'Save your favourite trips',
  'unlimited-shuffles': 'Unlimited destination shuffles',
  'ad-free': 'Ad-free browsing',
  'priority-support': 'Priority support',
}

/**
 * Determines whether Pro-gated features are unlocked for a given tier.
 * All Pro features are unlocked together; there is no per-feature free access yet.
 */
export function isProUnlocked(status: ProTierStatus): boolean {
  return status === 'pro'
}

/** Human-readable label for a Pro feature, used in upgrade prompts. */
export function getProFeatureLabel(feature: ProFeature): string {
  return PRO_FEATURE_LABELS[feature]
}
