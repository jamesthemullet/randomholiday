'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { DepartureAutocomplete } from '@/components/DepartureAutocomplete'
import { supportedDepartureCities } from '@/lib/departureCities'
import type { DepartureCity } from '@/lib/departureCities'
import { BudgetSlider } from '@/components/BudgetSlider'
import { Slider } from '@/components/Slider'
import { Select } from '@/components/Select'
import { TravelStyleSelector } from '@/components/TravelStyleSelector'
import type { TravelStyle } from '@/lib/destinations'
import { TripScopeStep } from '@/components/TripScopeStep'
import { Button } from '@/components/Button'
import {
  buildResultsQuery,
  getMonthOptions,
  getNextMonth,
  type TripQueryInitialValues,
} from '@/lib/tripQuery'
import styles from './TripForm.module.css'

const DEFAULT_MAX_DISTANCE = 10000
const DEFAULT_GROUP_SIZE = 2

export interface TripFormProps {
  initialValues?: TripQueryInitialValues
}

export function TripForm({ initialValues = {} }: TripFormProps) {
  const router = useRouter()
  const defaultMonth = getNextMonth()

  // London is the only city with route data so far, so it starts chosen.
  const initialCity = initialValues.city ?? supportedDepartureCities[0]
  const [cityQuery, setCityQuery] = useState(initialCity.name)
  const [city, setCity] = useState<DepartureCity | null>(initialCity)
  const [budget, setBudget] = useState(initialValues.budget ?? 1500)
  const [nights, setNights] = useState(initialValues.nights ?? 7)
  const [month, setMonth] = useState(initialValues.month ?? defaultMonth)
  const [travelStyles, setTravelStyles] = useState<TravelStyle[]>(initialValues.travelStyles ?? [])
  const [maxDistance, setMaxDistance] = useState(initialValues.maxDistance ?? DEFAULT_MAX_DISTANCE)
  const [groupSize, setGroupSize] = useState(initialValues.groupSize ?? DEFAULT_GROUP_SIZE)

  // Starts "More options" open when a prefilled search already changed something inside it,
  // so the user can see why their results differ from the defaults.
  const hasCustomOptions =
    (initialValues.month !== undefined && initialValues.month !== defaultMonth) ||
    (initialValues.travelStyles?.length ?? 0) > 0 ||
    (initialValues.maxDistance !== undefined &&
      initialValues.maxDistance !== DEFAULT_MAX_DISTANCE) ||
    (initialValues.groupSize !== undefined && initialValues.groupSize !== DEFAULT_GROUP_SIZE)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!city) return
    const query = buildResultsQuery({
      city,
      budget,
      month,
      nights,
      travelStyles,
      maxDistance,
      groupSize,
    })
    router.push(`/results?${query}`)
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} aria-label="Find your holiday">
      <DepartureAutocomplete
        id="departure-city"
        label="Where are you flying from?"
        value={cityQuery}
        onChange={(value) => {
          setCityQuery(value)
          // Editing the text after choosing a city invalidates that choice.
          if (city && value !== city.name) setCity(null)
        }}
        onSelect={(selected) => {
          setCity(selected)
          setCityQuery(selected.name)
        }}
      />
      <BudgetSlider value={budget} onChange={setBudget} />
      <Slider
        id="trip-length"
        label="Trip length"
        min={1}
        max={21}
        value={nights}
        onChange={setNights}
        formatValue={(v) => `${v} ${v === 1 ? 'night' : 'nights'}`}
      />

      <details className={styles.moreOptions} open={hasCustomOptions}>
        <summary className={styles.summary}>More options</summary>
        <div className={styles.moreOptionsBody}>
          <Select
            id="travel-month"
            label="Roughly when do you want to go?"
            options={getMonthOptions()}
            value={String(month)}
            onChange={(value) => setMonth(Number(value))}
          />
          <TravelStyleSelector selected={travelStyles} onChange={setTravelStyles} />
          <TripScopeStep
            maxDistance={maxDistance}
            onMaxDistanceChange={setMaxDistance}
            groupSize={groupSize}
            onGroupSizeChange={setGroupSize}
          />
        </div>
      </details>

      <Button type="submit" variant="primary" size="lg" disabled={!city}>
        Surprise me
      </Button>
    </form>
  )
}
