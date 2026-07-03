import React from 'react'
import { Slider } from '@/components/Slider'
import { Button } from '@/components/Button'
import styles from './TripScopeStep.module.css'

export interface TripScopeStepProps {
  maxDistance: number
  onMaxDistanceChange: (value: number) => void
  groupSize: number
  onGroupSizeChange: (value: number) => void
  maxDistanceLimit?: number
  minGroupSize?: number
  maxGroupSize?: number
}

export function formatDistance(value: number, max: number): string {
  return value >= max ? 'Anywhere' : `${value.toLocaleString('en-US')} km`
}

export function clampGroupSize(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

export function TripScopeStep({
  maxDistance,
  onMaxDistanceChange,
  groupSize,
  onGroupSizeChange,
  maxDistanceLimit = 20000,
  minGroupSize = 1,
  maxGroupSize = 10,
}: TripScopeStepProps) {
  const canDecrease = groupSize > minGroupSize
  const canIncrease = groupSize < maxGroupSize

  return (
    <div className={styles.wrapper}>
      <Slider
        id="max-distance"
        label="Max travel distance"
        min={0}
        max={maxDistanceLimit}
        step={500}
        value={maxDistance}
        onChange={onMaxDistanceChange}
        formatValue={(v) => formatDistance(v, maxDistanceLimit)}
      />
      <div className={styles.groupSize}>
        <span className={styles.label} id="group-size-label">
          Group size
        </span>
        <div className={styles.stepper} role="group" aria-labelledby="group-size-label">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            aria-label="Decrease group size"
            disabled={!canDecrease}
            onClick={() =>
              onGroupSizeChange(clampGroupSize(groupSize - 1, minGroupSize, maxGroupSize))
            }
          >
            −
          </Button>
          <output className={styles.count} aria-live="polite">
            {groupSize} {groupSize === 1 ? 'traveller' : 'travellers'}
          </output>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            aria-label="Increase group size"
            disabled={!canIncrease}
            onClick={() =>
              onGroupSizeChange(clampGroupSize(groupSize + 1, minGroupSize, maxGroupSize))
            }
          >
            +
          </Button>
        </div>
      </div>
    </div>
  )
}
