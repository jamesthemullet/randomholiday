import React from 'react'
import { Slider } from '@/components/Slider'
import {
  FLIGHT_TIME_OPTIONS,
  formatFlightTimeLimit,
  nearestFlightTimeOption,
} from '@/lib/flightTime'
import styles from './TripScopeStep.module.css'

export interface TripScopeStepProps {
  maxFlightHours: number
  onMaxFlightHoursChange: (value: number) => void
  groupSize: number
  onGroupSizeChange: (value: number) => void
  minGroupSize?: number
  maxGroupSize?: number
}

export function clampGroupSize(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

export function TripScopeStep({
  maxFlightHours,
  onMaxFlightHoursChange,
  groupSize,
  onGroupSizeChange,
  minGroupSize = 1,
  maxGroupSize = 10,
}: TripScopeStepProps) {
  const canDecrease = groupSize > minGroupSize
  const canIncrease = groupSize < maxGroupSize
  // The slider moves between the fixed options; a limit from an older link snaps to the
  // option it falls under.
  const optionIndex = FLIGHT_TIME_OPTIONS.indexOf(
    nearestFlightTimeOption(maxFlightHours) as (typeof FLIGHT_TIME_OPTIONS)[number]
  )

  return (
    <div className={styles.wrapper}>
      <Slider
        id="max-flight-time"
        label="Max flight time"
        min={0}
        max={FLIGHT_TIME_OPTIONS.length - 1}
        step={1}
        value={optionIndex}
        onChange={(index) => onMaxFlightHoursChange(FLIGHT_TIME_OPTIONS[index])}
        formatValue={(index) => formatFlightTimeLimit(FLIGHT_TIME_OPTIONS[index])}
      />
      <div className={styles.groupSize}>
        <span className={styles.label} id="group-size-label">
          Group size
        </span>
        <div className={styles.stepper} role="group" aria-labelledby="group-size-label">
          <button
            type="button"
            className={styles.stepButton}
            aria-label="Decrease group size"
            disabled={!canDecrease}
            onClick={() =>
              onGroupSizeChange(clampGroupSize(groupSize - 1, minGroupSize, maxGroupSize))
            }
          >
            −
          </button>
          <output className={styles.count} aria-live="polite">
            {groupSize} {groupSize === 1 ? 'traveller' : 'travellers'}
          </output>
          <button
            type="button"
            className={styles.stepButton}
            aria-label="Increase group size"
            disabled={!canIncrease}
            onClick={() =>
              onGroupSizeChange(clampGroupSize(groupSize + 1, minGroupSize, maxGroupSize))
            }
          >
            +
          </button>
        </div>
      </div>
    </div>
  )
}
