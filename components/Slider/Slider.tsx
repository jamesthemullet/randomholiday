import React from 'react'
import styles from './Slider.module.css'

export interface SliderProps {
  label: string
  id: string
  min: number
  max: number
  step?: number
  value: number
  onChange: (value: number) => void
  formatValue?: (value: number) => string
  /** Extra content shown just before the value, such as a tier badge. */
  adornment?: React.ReactNode
}

export function Slider({
  label,
  id,
  min,
  max,
  step = 1,
  value,
  onChange,
  formatValue,
  adornment,
}: SliderProps) {
  const displayValue = formatValue ? formatValue(value) : String(value)

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <label htmlFor={id} className={styles.label}>
          {label}
        </label>
        <div className={styles.valueRow}>
          {adornment}
          <output htmlFor={id} className={styles.value}>
            {displayValue}
          </output>
        </div>
      </div>
      <input
        type="range"
        id={id}
        className={styles.slider}
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
        aria-valuetext={displayValue}
      />
    </div>
  )
}
