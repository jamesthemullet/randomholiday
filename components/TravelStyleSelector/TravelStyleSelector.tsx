import React from 'react'
import type { TravelStyle } from '@/lib/destinations'
import styles from './TravelStyleSelector.module.css'

export interface TravelStyleOption {
  value: TravelStyle
  label: string
  icon: string
}

export const TRAVEL_STYLE_OPTIONS: TravelStyleOption[] = [
  { value: 'beach', label: 'Beach', icon: '🏖️' },
  { value: 'city', label: 'City', icon: '🏙️' },
  { value: 'adventure', label: 'Adventure', icon: '⛰️' },
  { value: 'culture', label: 'Culture', icon: '🏛️' },
]

export interface TravelStyleSelectorProps {
  selected: TravelStyle[]
  onChange: (selected: TravelStyle[]) => void
  label?: string
}

export function toggleTravelStyle(selected: TravelStyle[], style: TravelStyle): TravelStyle[] {
  return selected.includes(style) ? selected.filter((s) => s !== style) : [...selected, style]
}

export function TravelStyleSelector({
  selected,
  onChange,
  label = 'Travel style',
}: TravelStyleSelectorProps) {
  return (
    <div className={styles.wrapper}>
      <span className={styles.label} id="travel-style-label">
        {label}
      </span>
      <div className={styles.grid} role="group" aria-labelledby="travel-style-label">
        {TRAVEL_STYLE_OPTIONS.map((option) => {
          const isSelected = selected.includes(option.value)
          return (
            <button
              key={option.value}
              type="button"
              className={`${styles.option} ${isSelected ? styles.selected : ''}`}
              aria-pressed={isSelected}
              onClick={() => onChange(toggleTravelStyle(selected, option.value))}
            >
              <span className={styles.icon} aria-hidden="true">
                {option.icon}
              </span>
              <span className={styles.optionLabel}>{option.label}</span>
            </button>
          )
        })}
      </div>
      <p className={styles.hint}>Pick one or more — leave blank for any style</p>
    </div>
  )
}
