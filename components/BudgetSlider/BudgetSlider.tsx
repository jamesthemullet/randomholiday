import React from 'react'
import { Slider } from '@/components/Slider'
import styles from './BudgetSlider.module.css'

export interface BudgetSliderProps {
  id?: string
  label?: string
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  step?: number
}

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
})

export function formatBudget(value: number, max: number): string {
  return value >= max ? `${currencyFormatter.format(value)}+` : currencyFormatter.format(value)
}

export function BudgetSlider({
  id = 'budget',
  label = 'Budget per person',
  value,
  onChange,
  min = 200,
  max = 5000,
  step = 50,
}: BudgetSliderProps) {
  return (
    <div className={styles.wrapper}>
      <Slider
        id={id}
        label={label}
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={onChange}
        formatValue={(v) => formatBudget(v, max)}
      />
      <p className={styles.hint}>Covers flights, hotel, and daily spending for your whole trip</p>
    </div>
  )
}
