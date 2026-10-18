'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { DepartureAutocomplete } from '@/components/DepartureAutocomplete'
import type { DepartureCity } from '@/lib/departureCities'
import { BudgetSlider } from '@/components/BudgetSlider'
import { Slider } from '@/components/Slider'
import { TravelStyleSelector, TRAVEL_STYLE_OPTIONS } from '@/components/TravelStyleSelector'
import type { TravelStyle } from '@/lib/destinations'
import { TripScopeStep } from '@/components/TripScopeStep'
import {
  buildResultsQuery,
  getDefaultTripQuery,
  getMonthOptions,
  type TripQueryInitialValues,
} from '@/lib/tripQuery'
import styles from './TripForm.module.css'

const MORE_OPTIONS_ID = 'trip-form-more-options'

export interface TripFormProps {
  initialValues?: TripQueryInitialValues
}

export function TripForm({ initialValues = {} }: TripFormProps) {
  const router = useRouter()
  const defaults = getDefaultTripQuery()
  const monthOptions = getMonthOptions()

  const initialCity = initialValues.city ?? defaults.city
  const [cityQuery, setCityQuery] = useState(initialCity.name)
  const [city, setCity] = useState<DepartureCity | null>(initialCity)
  const [budget, setBudget] = useState(initialValues.budget ?? defaults.budget)
  const [nights, setNights] = useState(initialValues.nights ?? defaults.nights)
  const [month, setMonth] = useState(initialValues.month ?? defaults.month)
  const [travelStyles, setTravelStyles] = useState<TravelStyle[]>(
    initialValues.travelStyles ?? defaults.travelStyles
  )
  const [maxDistance, setMaxDistance] = useState(initialValues.maxDistance ?? defaults.maxDistance)
  const [groupSize, setGroupSize] = useState(initialValues.groupSize ?? defaults.groupSize)
  // Starts open when arriving from "Change my answers", so the previous choices are on show.
  const [isMoreOpen, setIsMoreOpen] = useState(Object.keys(initialValues).length > 0)

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

  // Shown beside the collapsed "More options" toggle, e.g. "Nov · Beach, City".
  const moreSummary = [
    monthOptions[month - 1].label.slice(0, 3),
    TRAVEL_STYLE_OPTIONS.filter((o) => travelStyles.includes(o.value))
      .map((o) => o.label)
      .join(', '),
  ]
    .filter(Boolean)
    .join(' · ')

  return (
    <form className={styles.form} onSubmit={handleSubmit} aria-label="Find your holiday">
      <div className={styles.strip} aria-hidden="true">
        <span>BOARDING PASS</span>
        <span>DEST: CLASSIFIED</span>
      </div>

      <div className={styles.body}>
        <DepartureAutocomplete
          id="departure-city"
          label="Where are you flying from?"
          placeholder="Start typing a city…"
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

        <div className={styles.moreOptions}>
          <button
            type="button"
            className={styles.moreToggle}
            aria-expanded={isMoreOpen}
            aria-controls={MORE_OPTIONS_ID}
            onClick={() => setIsMoreOpen((open) => !open)}
          >
            <span className={styles.chevron} aria-hidden="true">
              ▸
            </span>
            More options
            {!isMoreOpen && <span className={styles.moreSummary}>{moreSummary}</span>}
          </button>

          {isMoreOpen && (
            <div id={MORE_OPTIONS_ID} className={styles.moreOptionsBody}>
              <div className={styles.field}>
                <span id="travel-month-label" className={styles.fieldLabel}>
                  Roughly when do you want to go?
                </span>
                <div className={styles.months} role="group" aria-labelledby="travel-month-label">
                  {monthOptions.map((option) => {
                    const value = Number(option.value)
                    return (
                      <button
                        key={option.value}
                        type="button"
                        className={styles.month}
                        aria-label={option.label}
                        aria-pressed={month === value}
                        onClick={() => setMonth(value)}
                      >
                        {option.label.slice(0, 3)}
                      </button>
                    )
                  })}
                </div>
              </div>
              <TravelStyleSelector selected={travelStyles} onChange={setTravelStyles} />
              <TripScopeStep
                maxDistance={maxDistance}
                onMaxDistanceChange={setMaxDistance}
                groupSize={groupSize}
                onGroupSizeChange={setGroupSize}
              />
            </div>
          )}
        </div>

        <button type="submit" className={styles.submit} disabled={!city}>
          Surprise me <span aria-hidden="true">✈</span>
        </button>
      </div>
    </form>
  )
}
