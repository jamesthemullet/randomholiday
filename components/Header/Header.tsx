import React from 'react'
import Link from 'next/link'
import { DarkModeToggle } from '@/components/DarkModeToggle'
import styles from './Header.module.css'

const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/discover', label: 'Discover' },
] as const

export function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <Link href="/" className={styles.brand} aria-label="RandomHoliday home">
          RandomHoliday
        </Link>
        <div className={styles.actions}>
          <nav className={styles.nav} aria-label="Main navigation">
            <ul className={styles.navList}>
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className={styles.navLink}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <DarkModeToggle />
        </div>
      </div>
    </header>
  )
}
