import React from 'react'
import styles from './ApiGuidance.module.css'

const ApiGuidance: React.FC = React.memo(() => {
  return (
    <section className={styles.apisGuidance}>
      <div className={styles.guidanceContent}>
        <h2 className={styles.guidanceTitle}>Preference Guide</h2>
        <div className={styles.guidanceGrid}>
          <div className={styles.guidanceItem}>
            <div className={`${styles.guidanceIcon} ${styles.guidanceIconLock}`}>
              <svg viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
            </div>
            <div className={styles.guidanceInfo}>
              <h3 className={styles.guidanceName}>Lock API</h3>
              <p className={styles.guidanceDesc}>Always include this API in card generation (max 5 locked)</p>
            </div>
          </div>
          
          <div className={styles.guidanceItem}>
            <div className={`${styles.guidanceIcon} ${styles.guidanceIconIgnore}`}>
              <svg viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
              </svg>
            </div>
            <div className={styles.guidanceInfo}>
              <h3 className={styles.guidanceName}>Ignore API</h3>
              <p className={styles.guidanceDesc}>Never include this API in card generation (min 10 available)</p>
            </div>
          </div>
          
          <div className={styles.guidanceItem}>
            <div className={`${styles.guidanceIcon} ${styles.guidanceIconDefault}`}>
              <svg viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
            </div>
            <div className={styles.guidanceInfo}>
              <h3 className={styles.guidanceName}>Default</h3>
              <p className={styles.guidanceDesc}>API may or may not be included based on random selection</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
})

ApiGuidance.displayName = 'ApiGuidance'

export default ApiGuidance