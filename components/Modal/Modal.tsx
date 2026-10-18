'use client'

import React, { useEffect, useRef, useId } from 'react'
import styles from './Modal.module.css'

const FOCUSABLE_SELECTOR =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

export interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  /** A banner image (or stand-in) shown behind the title, which then overlays it. */
  media?: React.ReactNode
  /** A short label shown just above the title. */
  kicker?: React.ReactNode
  /** "lg" fits a two-column layout. */
  size?: 'md' | 'lg'
}

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  media,
  kicker,
  size = 'md',
}: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)
  const titleId = useId()

  useEffect(() => {
    if (!isOpen) return

    const modal = modalRef.current
    if (!modal) return

    document.body.setAttribute('data-modal-open', 'true')

    const triggerElement = document.activeElement as HTMLElement | null

    const focusable = Array.from(modal.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR))
    const first = focusable[0]
    const last = focusable[focusable.length - 1]
    first?.focus()

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
        return
      }
      if (e.key !== 'Tab') return

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.removeAttribute('data-modal-open')
      document.removeEventListener('keydown', handleKeyDown)
      triggerElement?.focus()
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const closeButton = (
    <button type="button" onClick={onClose} className={styles.close} aria-label="Close dialog">
      <svg
        aria-hidden="true"
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      >
        <path d="M2 2L14 14M14 2L2 14" />
      </svg>
    </button>
  )

  const titleBlock = (
    <div className={styles.titleBlock}>
      {kicker && <span className={styles.kicker}>{kicker}</span>}
      <h2 id={titleId} className={styles.title}>
        {title}
      </h2>
    </div>
  )

  return (
    <div className={styles.root}>
      <div className={styles.backdrop} onClick={onClose} aria-hidden="true" />
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={`${styles.modal} ${size === 'lg' ? styles.lg : ''}`}
      >
        {media ? (
          <div className={styles.banner}>
            {media}
            <div className={styles.scrim} aria-hidden="true" />
            {titleBlock}
            {closeButton}
          </div>
        ) : (
          <div className={styles.header}>
            {titleBlock}
            {closeButton}
          </div>
        )}
        <div className={styles.body}>{children}</div>
      </div>
    </div>
  )
}
