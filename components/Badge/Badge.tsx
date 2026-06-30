import React from 'react'
import styles from './Badge.module.css'

export type BadgeVariant = 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger'

export interface BadgeProps {
  children: React.ReactNode
  variant?: BadgeVariant
  className?: string
}

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  const classes = [styles.badge, styles[variant]]
  if (className) classes.push(className)

  return <span className={classes.join(' ')}>{children}</span>
}
