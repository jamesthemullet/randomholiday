import React from 'react'
import styles from './Spinner.module.css'

export type SpinnerSize = 'sm' | 'md' | 'lg'

export interface SpinnerProps {
  size?: SpinnerSize
  label?: string
}

export function Spinner({ size = 'md', label = 'Loading...' }: SpinnerProps) {
  return (
    <div className={[styles.spinner, styles[size]].join(' ')} role="status">
      <svg
        className={styles.globe}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="10" />
        <ellipse cx="12" cy="12" rx="4" ry="10" />
        <line x1="2" y1="12" x2="22" y2="12" />
        <line x1="4.9" y1="6" x2="19.1" y2="6" />
        <line x1="4.9" y1="18" x2="19.1" y2="18" />
      </svg>
      <span className={styles.srOnly}>{label}</span>
    </div>
  )
}
