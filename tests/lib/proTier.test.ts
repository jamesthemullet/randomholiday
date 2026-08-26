import { describe, it, expect } from 'vitest'
import { isProUnlocked, getProFeatureLabel } from '@/lib/proTier'

describe('isProUnlocked', () => {
  it('returns false for a free tier status', () => {
    expect(isProUnlocked('free')).toBe(false)
  })

  it('returns true for a pro tier status', () => {
    expect(isProUnlocked('pro')).toBe(true)
  })
})

describe('getProFeatureLabel', () => {
  it('returns a human-readable label for save-trip', () => {
    expect(getProFeatureLabel('save-trip')).toBe('Save your favourite trips')
  })

  it('returns a human-readable label for unlimited-shuffles', () => {
    expect(getProFeatureLabel('unlimited-shuffles')).toBe('Unlimited destination shuffles')
  })

  it('returns a human-readable label for ad-free', () => {
    expect(getProFeatureLabel('ad-free')).toBe('Ad-free browsing')
  })

  it('returns a human-readable label for priority-support', () => {
    expect(getProFeatureLabel('priority-support')).toBe('Priority support')
  })
})
