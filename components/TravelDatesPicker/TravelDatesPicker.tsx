import React from 'react'
import { Input } from '@/components/Input'
import styles from './TravelDatesPicker.module.css'

export interface TravelDatesPickerProps {
  startDate: string
  endDate: string
  onStartDateChange: (value: string) => void
  onEndDateChange: (value: string) => void
  startLabel?: string
  endLabel?: string
  minDate?: string
}

export function getDateRangeError(startDate: string, endDate: string): string | undefined {
  if (!startDate || !endDate) return undefined
  if (endDate < startDate) return 'Return date must be after departure date'
  return undefined
}

export function getTripNights(startDate: string, endDate: string): number | undefined {
  if (!startDate || !endDate || endDate < startDate) return undefined
  const start = new Date(startDate)
  const end = new Date(endDate)
  const msPerDay = 1000 * 60 * 60 * 24
  return Math.round((end.getTime() - start.getTime()) / msPerDay)
}

export function TravelDatesPicker({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  startLabel = 'Departure date',
  endLabel = 'Return date',
  minDate,
}: TravelDatesPickerProps) {
  const error = getDateRangeError(startDate, endDate)
  const nights = getTripNights(startDate, endDate)

  return (
    <div className={styles.wrapper}>
      <div className={styles.dateRow}>
        <Input
          id="departure-date"
          label={startLabel}
          type="date"
          value={startDate}
          min={minDate}
          onChange={(e) => onStartDateChange(e.target.value)}
        />
        <Input
          id="return-date"
          label={endLabel}
          type="date"
          value={endDate}
          min={startDate || minDate}
          onChange={(e) => onEndDateChange(e.target.value)}
          error={error}
        />
      </div>
      {nights !== undefined && (
        <p className={styles.hint} role="status">
          {nights} {nights === 1 ? 'night' : 'nights'} trip
        </p>
      )}
    </div>
  )
}
