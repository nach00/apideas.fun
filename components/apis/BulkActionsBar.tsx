import React from 'react'
import styles from './BulkActionsBar.module.css'

interface BulkActionsBarProps {
  selectedCount: number
  onBulkAction: (action: 'lock' | 'ignore' | 'reset', value: boolean) => void
  onCancel: () => void
  loading: boolean
}

const BulkActionsBar: React.FC<BulkActionsBarProps> = React.memo(({
  selectedCount,
  onBulkAction,
  onCancel,
  loading
}) => {
  if (selectedCount === 0) return null

  return (
    <section className={styles.bulkActionsBar}>
      <div className={styles.bulkActionsContent}>
        <div className={styles.bulkActionsInfo}>
          <svg className={styles.bulkIcon} viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          <span className={styles.bulkCount}>
            {selectedCount} API{selectedCount !== 1 ? 's' : ''} selected
          </span>
        </div>

        <div className={styles.bulkActionsButtons}>
          <button
            onClick={() => onBulkAction('lock', true)}
            disabled={loading}
            className={`${styles.bulkActionBtn} ${styles.bulkActionBtnLock}`}
            title="Set selected APIs to always be included in generation"
          >
            <svg className={styles.bulkActionIcon} viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
            {loading ? 'Processing...' : 'Lock All'}
          </button>

          <button
            onClick={() => onBulkAction('ignore', true)}
            disabled={loading}
            className={`${styles.bulkActionBtn} ${styles.bulkActionBtnIgnore}`}
            title="Set selected APIs to never be included in generation"
          >
            <svg className={styles.bulkActionIcon} viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
            </svg>
            {loading ? 'Processing...' : 'Ignore All'}
          </button>

          <button
            onClick={() => onBulkAction('reset', false)}
            disabled={loading}
            className={`${styles.bulkActionBtn} ${styles.bulkActionBtnReset}`}
            title="Reset selected APIs to default state"
          >
            <svg className={styles.bulkActionIcon} viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
            </svg>
            {loading ? 'Processing...' : 'Reset All'}
          </button>

          <button
            onClick={onCancel}
            className={`${styles.bulkActionBtn} ${styles.bulkActionBtnCancel}`}
            title="Cancel selection"
          >
            <svg className={styles.bulkActionIcon} viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
            Cancel
          </button>
        </div>
      </div>
    </section>
  )
})

BulkActionsBar.displayName = 'BulkActionsBar'

export default BulkActionsBar