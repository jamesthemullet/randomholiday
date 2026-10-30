import React from 'react'
import styles from './Footer.module.css'

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <p className={styles.copy}>
          &copy; {new Date().getFullYear()} RandomHoliday. All rights reserved.
        </p>
        <p className={styles.credit}>
          Route data from{' '}
          <a href="https://www.wikipedia.org/" className={styles.link}>
            Wikipedia
          </a>{' '}
          (CC BY-SA) and{' '}
          <a href="https://www.wikidata.org/" className={styles.link}>
            Wikidata
          </a>
          .
        </p>
      </div>
    </footer>
  )
}
