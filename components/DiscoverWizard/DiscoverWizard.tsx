'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { DepartureAutocomplete } from '@/components/DepartureAutocomplete'
import type { DepartureCity } from '@/lib/departureCities'
import { BudgetSlider } from '@/components/BudgetSlider'
import { TravelDatesPicker, getDateRangeError, getTripNights } from '@/components/TravelDatesPicker'
import { TravelStyleSelector } from '@/components/TravelStyleSelector'
import type { TravelStyle } from '@/lib/destinations'
import { TripScopeStep } from '@/components/TripScopeStep'
import { Button } from '@/components/Button'
import styles from './DiscoverWizard.module.css'

const STEP_LABELS = ['Departure', 'Budget', 'Dates', 'Style', 'Distance & group']

export function buildResultsQuery(params: {
  city: DepartureCity
  budget: number
  startDate: string
  endDate: string
  travelStyles: TravelStyle[]
  maxDistance: number
  groupSize: number
}): string {
  const nights = getTripNights(params.startDate, params.endDate) ?? 1
  const travelMonth = new Date(params.startDate).getMonth() + 1

  const query = new URLSearchParams({
    originId: params.city.id,
    budget: String(params.budget),
    distance: String(params.maxDistance),
    nights: String(nights),
    groupSize: String(params.groupSize),
    month: String(travelMonth),
  })
  if (params.travelStyles.length > 0) {
    query.set('styles', params.travelStyles.join(','))
  }
  return query.toString()
}

export function DiscoverWizard() {
  const router = useRouter()
  const [step, setStep] = useState(0)

  const [cityQuery, setCityQuery] = useState('')
  const [city, setCity] = useState<DepartureCity | null>(null)
  const [budget, setBudget] = useState(1500)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [travelStyles, setTravelStyles] = useState<TravelStyle[]>([])
  const [maxDistance, setMaxDistance] = useState(10000)
  const [groupSize, setGroupSize] = useState(2)

  const dateError = getDateRangeError(startDate, endDate)
  const canProceed = [city !== null, true, Boolean(startDate && endDate && !dateError), true, true][
    step
  ]

  const isLastStep = step === STEP_LABELS.length - 1

  const handleNext = () => {
    if (!canProceed) return
    if (isLastStep) {
      if (!city) return
      const query = buildResultsQuery({
        city,
        budget,
        startDate,
        endDate,
        travelStyles,
        maxDistance,
        groupSize,
      })
      router.push(`/results?${query}`)
      return
    }
    setStep((s) => s + 1)
  }

  const handleBack = () => setStep((s) => Math.max(0, s - 1))

  return (
    <section className={styles.wrapper} aria-labelledby="wizard-heading">
      <h1 id="wizard-heading" className={styles.heading}>
        Plan your surprise trip
      </h1>
      <p className={styles.progress} role="status">
        Step {step + 1} of {STEP_LABELS.length}: {STEP_LABELS[step]}
      </p>

      <div className={styles.stepBody}>
        {step === 0 && (
          <DepartureAutocomplete
            id="departure-city"
            label="Where are you flying from?"
            value={cityQuery}
            onChange={setCityQuery}
            onSelect={(selected) => {
              setCity(selected)
              setCityQuery(selected.name)
            }}
          />
        )}
        {step === 1 && <BudgetSlider value={budget} onChange={setBudget} />}
        {step === 2 && (
          <TravelDatesPicker
            startDate={startDate}
            endDate={endDate}
            onStartDateChange={setStartDate}
            onEndDateChange={setEndDate}
            minDate={new Date().toISOString().slice(0, 10)}
          />
        )}
        {step === 3 && <TravelStyleSelector selected={travelStyles} onChange={setTravelStyles} />}
        {step === 4 && (
          <TripScopeStep
            maxDistance={maxDistance}
            onMaxDistanceChange={setMaxDistance}
            groupSize={groupSize}
            onGroupSizeChange={setGroupSize}
          />
        )}
      </div>

      <div className={styles.actions}>
        <Button type="button" variant="ghost" onClick={handleBack} disabled={step === 0}>
          Back
        </Button>
        <Button type="button" variant="primary" onClick={handleNext} disabled={!canProceed}>
          {isLastStep ? 'Reveal my holiday' : 'Next'}
        </Button>
      </div>
    </section>
  )
}
