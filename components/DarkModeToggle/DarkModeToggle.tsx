'use client'

import React, { useState, useEffect } from 'react'
import styles from './DarkModeToggle.module.css'

export function DarkModeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light')

  useEffect(() => {
    // Reads browser-only APIs (localStorage, matchMedia) unavailable during SSR render,
    // so the theme can only be determined after mount.
    /* eslint-disable react-hooks/set-state-in-effect */
    const stored = localStorage.getItem('theme')
    if (stored === 'light' || stored === 'dark') {
      setTheme(stored)
      document.documentElement.setAttribute('data-theme', stored)
    } else {
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      const initial: 'light' | 'dark' = isDark ? 'dark' : 'light'
      setTheme(initial)
      document.documentElement.setAttribute('data-theme', initial)
    }
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [])

  const toggle = () => {
    const next: 'light' | 'dark' = theme === 'light' ? 'dark' : 'light'
    setTheme(next)
    document.documentElement.setAttribute('data-theme', next)
    localStorage.setItem('theme', next)
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className={styles.toggle}
      aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
      aria-pressed={theme === 'dark'}
    >
      <span className={styles.icon} aria-hidden="true">
        {theme === 'light' ? 'Dark' : 'Light'}
      </span>
    </button>
  )
}
