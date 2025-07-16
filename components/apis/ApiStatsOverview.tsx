import React from 'react'
import styles from './ApiStatsOverview.module.css'

interface ApiStatsOverviewProps {
  total: number
  locked: number
  available: number
  ignored: number
}

const ApiStatsOverview: React.FC<ApiStatsOverviewProps> = React.memo(({
  total,
  locked,
  available,
  ignored
}) => {
  return (
    <div className={styles.statsOverview}>
      <div className={styles.statCard}>
        <div className={`${styles.statIcon} ${styles.statIconTotal}`}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <rect x="3" y="3" width="7" height="7" rx="1"/>
            <rect x="14" y="3" width="7" height="7" rx="1"/>
            <rect x="14" y="14" width="7" height="7" rx="1"/>
            <rect x="3" y="14" width="7" height="7" rx="1"/>
          </svg>
        </div>
        <div className={styles.statInfo}>
          <div className={styles.statValue}>{total}</div>
          <div className={styles.statLabel}>Total APIs</div>
        </div>
      </div>
      
      <div className={styles.statCard}>
        <div className={`${styles.statIcon} ${styles.statIconLocked}`}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
            <circle cx="12" cy="16" r="1"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
        </div>
        <div className={styles.statInfo}>
          <div className={styles.statValue}>{locked}</div>
          <div className={styles.statLabel}>Locked</div>
        </div>
      </div>
      
      <div className={styles.statCard}>
        <div className={`${styles.statIcon} ${styles.statIconAvailable}`}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12,6 12,12 16,14"/>
          </svg>
        </div>
        <div className={styles.statInfo}>
          <div className={styles.statValue}>{available}</div>
          <div className={styles.statLabel}>Available</div>
        </div>
      </div>
      
      <div className={styles.statCard}>
        <div className={`${styles.statIcon} ${styles.statIconIgnored}`}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <circle cx="12" cy="12" r="10"/>
            <path d="M4.93 4.93l14.14 14.14"/>
          </svg>
        </div>
        <div className={styles.statInfo}>
          <div className={styles.statValue}>{ignored}</div>
          <div className={styles.statLabel}>Ignored</div>
        </div>
      </div>
    </div>
  )
})

ApiStatsOverview.displayName = 'ApiStatsOverview'

export default ApiStatsOverview