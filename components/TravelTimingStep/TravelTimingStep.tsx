import React from 'react'
import { Select } from '@/components/Select'
import { Slider } from '@/components/Slider'
import styles from './TravelTimingStep.module.css'

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

export function getMonthOptions(): { value: string; label: string }[] {
  return MONTH_NAMES.map((name, index) => ({ value: String(index + 1), label: name }))
}

export interface TravelTimingStepProps {
  month: number | null
  onMonthChange: (month: number) => void
  nights: number
  onNightsChange: (nights: number) => void
  minNights?: number
  maxNights?: number
}

export function TravelTimingStep({
  month,
  onMonthChange,
  nights,
  onNightsChange,
  minNights = 1,
  maxNights = 21,
}: TravelTimingStepProps) {
  return (
    <div className={styles.wrapper}>
      <Select
        id="travel-month"
        label="Roughly when do you want to go?"
        placeholder="Choose a month"
        options={getMonthOptions()}
        value={month === null ? '' : String(month)}
        onChange={(value) => onMonthChange(Number(value))}
      />
      <Slider
        id="trip-length"
        label="Trip length"
        min={minNights}
        max={maxNights}
        value={nights}
        onChange={onNightsChange}
        formatValue={(v) => `${v} ${v === 1 ? 'night' : 'nights'}`}
      />
    </div>
  )
}
