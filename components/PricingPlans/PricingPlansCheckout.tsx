'use client'

import React, { useState } from 'react'
import { PricingPlans } from './PricingPlans'
import styles from './PricingPlans.module.css'

export function PricingPlansCheckout() {
  const [error, setError] = useState<string | null>(null)

  const handleUpgrade = async () => {
    setError(null)

    try {
      const response = await fetch('/api/checkout', { method: 'POST' })
      const data: { url?: string; error?: string } = await response.json()

      if (!response.ok || !data.url) {
        setError(data.error ?? 'Unable to start checkout. Please try again.')
        return
      }

      window.location.href = data.url
    } catch {
      setError('Unable to start checkout. Please try again.')
    }
  }

  return (
    <>
      <PricingPlans onUpgrade={handleUpgrade} />
      {error && (
        <p role="alert" className={styles.checkoutError}>
          {error}
        </p>
      )}
    </>
  )
}
