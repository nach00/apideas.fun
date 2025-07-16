import React from 'react'
import styles from './ApiSearchControls.module.css'

interface ApiSearchControlsProps {
  searchTerm: string
  onSearchChange: (value: string) => void
  categoryFilter: string
  onCategoryChange: (value: string) => void
  sortBy: string
  onSortChange: (value: string) => void
  categories: string[]
}

const ApiSearchControls: React.FC<ApiSearchControlsProps> = React.memo(({
  searchTerm,
  onSearchChange,
  categoryFilter,
  onCategoryChange,
  sortBy,
  onSortChange,
  categories
}) => {
  return (
    <section className={styles.apisControls}>
      <div className={styles.searchSection}>
        <div className={styles.searchInputGroup}>
          <svg className={styles.searchIcon} viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
          </svg>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Search APIs by name, category, or description..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            aria-label="Search APIs"
            role="searchbox"
          />
          {searchTerm && (
            <button
              className={styles.searchClear}
              onClick={() => onSearchChange('')}
              aria-label="Clear search"
            >
              <svg viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          )}
        </div>
      </div>

      <div className={styles.filterSection}>
        <div className={styles.filterGroup}>
          <label className={styles.filterLabel} htmlFor="category-filter">Category</label>
          <select
            id="category-filter"
            className={styles.filterSelect}
            value={categoryFilter}
            onChange={(e) => onCategoryChange(e.target.value)}
            aria-label="Filter by category"
          >
            <option value="">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>

        <div className={styles.filterGroup}>
          <label className={styles.filterLabel} htmlFor="sort-filter">Sort by</label>
          <select
            id="sort-filter"
            className={styles.filterSelect}
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            aria-label="Sort APIs by"
          >
            <option value="name">Name</option>
            <option value="category">Category</option>
            <option value="popularity">Popularity</option>
          </select>
        </div>

      </div>
    </section>
  )
})

ApiSearchControls.displayName = 'ApiSearchControls'

export default ApiSearchControls