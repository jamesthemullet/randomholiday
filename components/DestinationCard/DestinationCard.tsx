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
  const [imageFailed, setImageFailed] = useState(false)
  const { name, country, imageUrl, climate, description, activities } = destination

  const cardClasses = [styles.card]
  if (isFlipped) cardClasses.push(styles.flipped)

  const flip = () => setIsFlipped((f) => !f)

  return (
    <div className={styles.scene} onClick={flip}>
      <div className={cardClasses.join(' ')}>
        <div className={styles.front} aria-hidden={isFlipped}>
          <button
            type="button"
            className={styles.flipTrigger}
            tabIndex={isFlipped ? -1 : 0}
            aria-pressed={isFlipped}
            aria-label={`${name}, ${country}. Click to see details`}
            onClick={(e) => {
              e.stopPropagation()
              flip()
            }}
          >
            Flip card
          </button>
          {imageUrl && !imageFailed && (
            <img
              src={imageUrl}
              alt={`${name}, ${country}`}
              className={styles.image}
              onError={() => setImageFailed(true)}
            />
          )}
          <div className={styles.frontContent}>
            <h3 className={styles.name}>{name}</h3>
            <p className={styles.country}>{country}</p>
            {onSelect && (
              <button
                type="button"
                className={styles.selectBtn}
                tabIndex={isFlipped ? -1 : 0}
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

        <div className={styles.back} aria-hidden={!isFlipped}>
          <button
            type="button"
            className={styles.flipTrigger}
            tabIndex={isFlipped ? 0 : -1}
            aria-pressed={isFlipped}
            aria-label={`${name}, ${country}. Click to see photo`}
            onClick={(e) => {
              e.stopPropagation()
              flip()
            }}
          >
            Flip card
          </button>
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
                tabIndex={isFlipped ? 0 : -1}
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
