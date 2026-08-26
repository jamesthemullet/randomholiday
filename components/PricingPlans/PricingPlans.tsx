import React from 'react'
import { Badge } from '@/components/Badge'
import { Button } from '@/components/Button'
import { Card } from '@/components/Card'
import { getProFeatureLabel, type ProFeature } from '@/lib/proTier'
import styles from './PricingPlans.module.css'

const PRO_FEATURES: ProFeature[] = [
  'save-trip',
  'unlimited-shuffles',
  'ad-free',
  'priority-support',
]

const FREE_FEATURES = ['Unlimited destination discovery', 'One shuffle per session']

export interface PricingPlansProps {
  onUpgrade?: () => void
}

export function PricingPlans({ onUpgrade }: PricingPlansProps) {
  return (
    <section className={styles.plans} aria-labelledby="pricing-heading">
      <div className={styles.header}>
        <h1 id="pricing-heading" className={styles.heading}>
          Simple, honest pricing
        </h1>
        <p className={styles.subheading}>
          Start for free. Upgrade to Pro whenever you want to save trips, shuffle without limits,
          and browse ad-free.
        </p>
      </div>

      <div className={styles.grid}>
        <Card className={styles.card}>
          <h2 className={styles.planName}>Free</h2>
          <p className={styles.price}>
            <span className={styles.amount}>£0</span>
            <span className={styles.period}>/month</span>
          </p>
          <ul className={styles.featureList}>
            {FREE_FEATURES.map((feature) => (
              <li key={feature} className={styles.featureItem}>
                {feature}
              </li>
            ))}
          </ul>
        </Card>

        <Card className={styles.card} hoverable>
          <div className={styles.planNameRow}>
            <h2 className={styles.planName}>Pro</h2>
            <Badge variant="secondary">Most popular</Badge>
          </div>
          <p className={styles.price}>
            <span className={styles.amount}>£4.99</span>
            <span className={styles.period}>/month</span>
          </p>
          <ul className={styles.featureList}>
            {PRO_FEATURES.map((feature) => (
              <li key={feature} className={styles.featureItem}>
                {getProFeatureLabel(feature)}
              </li>
            ))}
          </ul>
          <Button type="button" variant="primary" onClick={onUpgrade} className={styles.cta}>
            Upgrade to Pro
          </Button>
        </Card>
      </div>
    </section>
  )
}
