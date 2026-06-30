'use client'

import React, { useState } from 'react'
import styles from './DestinationCard.module.css'

export interface Destination {
  name: string
  country: string
  imageUrl?: string
  climate?: string
  description?: string
  activities?: string[]
}

export interface DestinationCardProps {
  destination: Destination
  onSelect?: () => void
}

export function DestinationCard({ destination, onSelect }: DestinationCardProps) {
  const [isFlipped, setIsFlipped] = useState(false)
  const { name, country, imageUrl, climate, description, activities } = destination

  const cardClasses = [styles.card]
  if (isFlipped) cardClasses.push(styles.flipped)

  return (
    <div
      className={styles.scene}
      onClick={() => setIsFlipped((f) => !f)}
      role="button"
      tabIndex={0}
      aria-pressed={isFlipped}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          setIsFlipped((f) => !f)
        }
      }}
      aria-label={`${name}, ${country}. Click to ${isFlipped ? 'see photo' : 'see details'}`}
    >
      <div className={cardClasses.join(' ')}>
        <div className={styles.front} aria-hidden={isFlipped}>
          {imageUrl && <img src={imageUrl} alt={`${name}, ${country}`} className={styles.image} />}
          <div className={styles.frontContent}>
            <h3 className={styles.name}>{name}</h3>
            <p className={styles.country}>{country}</p>
          </div>
        </div>

        <div className={styles.back} aria-hidden={!isFlipped}>
          <div className={styles.backContent}>
            <h3 className={styles.name}>{name}</h3>
            {climate && <p className={styles.climate}>{climate}</p>}
            {description && <p className={styles.description}>{description}</p>}
            {activities && activities.length > 0 && (
              <ul className={styles.activities}>
                {activities.map((activity) => (
                  <li key={activity}>{activity}</li>
                ))}
              </ul>
            )}
            {onSelect && (
              <button
                type="button"
                className={styles.selectBtn}
                onClick={(e) => {
                  e.stopPropagation()
                  onSelect()
                }}
              >
                Select Destination
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
