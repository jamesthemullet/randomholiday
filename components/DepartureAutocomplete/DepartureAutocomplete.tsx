'use client'

import React, { useMemo, useState } from 'react'
import { searchDepartureCities } from '@/lib/departureCities'
import type { DepartureCity } from '@/lib/departureCities'
import styles from './DepartureAutocomplete.module.css'

export interface DepartureAutocompleteProps {
  label: string
  id: string
  value: string
  onChange: (value: string) => void
  onSelect: (city: DepartureCity) => void
  placeholder?: string
  error?: string
}

export function DepartureAutocomplete({
  label,
  id,
  value,
  onChange,
  onSelect,
  placeholder,
  error,
}: DepartureAutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(-1)

  const matches = useMemo(() => searchDepartureCities(value), [value])
  const listboxId = `${id}-listbox`
  const showListbox = isOpen && matches.length > 0

  const selectCity = (city: DepartureCity) => {
    onChange(city.name)
    onSelect(city)
    setIsOpen(false)
    setHighlightedIndex(-1)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value)
    setIsOpen(true)
    setHighlightedIndex(-1)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setIsOpen(true)
      if (matches.length > 0) {
        setHighlightedIndex((i) => (i + 1) % matches.length)
      }
      return
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault()
      setIsOpen(true)
      if (matches.length > 0) {
        setHighlightedIndex((i) => (i <= 0 ? matches.length - 1 : i - 1))
      }
      return
    }

    if (e.key === 'Enter') {
      if (highlightedIndex >= 0 && highlightedIndex < matches.length) {
        e.preventDefault()
        selectCity(matches[highlightedIndex])
      }
      return
    }

    if (e.key === 'Escape') {
      setIsOpen(false)
      setHighlightedIndex(-1)
    }
  }

  const inputClasses = [styles.input]
  if (error) inputClasses.push(styles.inputError)

  return (
    <div className={styles.wrapper}>
      <label htmlFor={id} className={styles.label}>
        {label}
      </label>
      <div className={styles.comboboxWrapper}>
        <input
          id={id}
          type="text"
          role="combobox"
          autoComplete="off"
          aria-expanded={showListbox}
          aria-controls={listboxId}
          aria-autocomplete="list"
          aria-activedescendant={
            highlightedIndex >= 0 ? `${id}-option-${highlightedIndex}` : undefined
          }
          aria-describedby={error ? `${id}-error` : undefined}
          aria-invalid={error ? true : undefined}
          className={inputClasses.join(' ')}
          value={value}
          placeholder={placeholder}
          onChange={handleChange}
          onFocus={() => setIsOpen(true)}
          onBlur={() => {
            setIsOpen(false)
            setHighlightedIndex(-1)
          }}
          onKeyDown={handleKeyDown}
        />
        {showListbox && (
          <ul
            id={listboxId}
            role="listbox"
            aria-label={label}
            className={styles.listbox}
            onMouseDown={(e) => e.preventDefault()}
          >
            {matches.map((city, index) => (
              <li
                key={city.id}
                id={`${id}-option-${index}`}
                role="option"
                aria-selected={index === highlightedIndex}
                className={
                  index === highlightedIndex
                    ? `${styles.option} ${styles.optionHighlighted}`
                    : styles.option
                }
                onClick={() => selectCity(city)}
              >
                <span className={styles.optionName}>{city.name}</span>
                <span className={styles.optionCountry}>{city.country}</span>
              </li>
            ))}
          </ul>
        )}
        {isOpen && matches.length === 0 && (
          <p className={styles.noResults} role="status">
            No cities found
          </p>
        )}
      </div>
      {error && (
        <p id={`${id}-error`} className={styles.error} role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
