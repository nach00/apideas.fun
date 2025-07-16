import { useState, useEffect, useMemo, useCallback, useRef } from 'react'

interface Api {
  id: string
  name: string
  category: string
  description: string
  documentationUrl: string
  freeTierInfo?: string
  isLocked: boolean
  isIgnored: boolean
  popularityScore?: number
}

interface UseApiManagementReturn {
  // Data
  apis: Api[]
  filteredApis: Api[]
  categories: string[]
  
  // State
  loading: boolean
  error: string
  selectedApis: string[]
  bulkActionLoading: boolean
  
  // Filters
  searchTerm: string
  categoryFilter: string
  sortBy: string
  
  // Stats
  stats: {
    total: number
    locked: number
    ignored: number
    available: number
  }
  
  // Selection helpers
  isAllSelected: boolean
  isIndeterminate: boolean
  
  // Actions
  setSearchTerm: (term: string) => void
  setCategoryFilter: (category: string) => void
  setSortBy: (sort: string) => void
  handleSelectApi: (apiId: string, checked: boolean) => void
  handleSelectAll: (checked: boolean) => void
  handlePreferenceChange: (apiId: string, preferenceType: string, value: boolean) => Promise<void>
  handleBulkAction: (action: 'lock' | 'ignore' | 'reset', value: boolean) => Promise<void>
  clearSelection: () => void
  clearFilters: () => void
}

export const useApiManagement = (): UseApiManagementReturn => {
  // Core state
  const [apis, setApis] = useState<Api[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  
  // UI state
  const [selectedApis, setSelectedApis] = useState<string[]>([])
  const [bulkActionLoading, setBulkActionLoading] = useState(false)
  
  // Filter state
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [sortBy, setSortBy] = useState('name')

  // Performance optimization: Debounce search to reduce filtering operations
  const searchTimeoutRef = useRef<NodeJS.Timeout>()
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')

  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }
    
    searchTimeoutRef.current = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
    }, 300)

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [searchTerm])

  // Fetch APIs
  useEffect(() => {
    const fetchApis = async () => {
      try {
        setError('')
        const response = await fetch('/api/apis')
        if (response.ok) {
          const data = await response.json()
          setApis(data)
        } else {
          setError('Failed to load APIs. Please try again.')
        }
      } catch (err) {
        console.error('Failed to fetch APIs:', err)
        setError('Something went wrong while loading APIs.')
      } finally {
        setLoading(false)
      }
    }

    fetchApis()
  }, [])

  // Computed values
  const categories = useMemo(() => {
    return Array.from(new Set(apis.map(api => api.category))).sort()
  }, [apis])

  const filteredApis = useMemo(() => {
    let filtered = apis.filter(api => {
      const matchesSearch = 
        api.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        api.category.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        api.description.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
      const matchesCategory = !categoryFilter || api.category === categoryFilter
      return matchesSearch && matchesCategory
    })

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name)
        case 'category':
          return a.category.localeCompare(b.category)
        case 'popularity':
          return (b.popularityScore || 0) - (a.popularityScore || 0)
        default:
          return 0
      }
    })
  }, [apis, debouncedSearchTerm, categoryFilter, sortBy])

  const stats = useMemo(() => {
    const locked = apis.filter(api => api.isLocked).length
    const ignored = apis.filter(api => api.isIgnored).length
    const available = apis.length - ignored
    return { 
      total: apis.length, 
      locked, 
      ignored, 
      available 
    }
  }, [apis])

  const isAllSelected = filteredApis.length > 0 && selectedApis.length === filteredApis.length
  const isIndeterminate = selectedApis.length > 0 && selectedApis.length < filteredApis.length

  // Actions
  const handleSelectApi = useCallback((apiId: string, checked: boolean) => {
    if (checked) {
      setSelectedApis(prev => [...prev, apiId])
    } else {
      setSelectedApis(prev => prev.filter(id => id !== apiId))
    }
  }, [])

  const handleSelectAll = useCallback((checked: boolean) => {
    if (checked) {
      setSelectedApis(filteredApis.map(api => api.id))
    } else {
      setSelectedApis([])
    }
  }, [filteredApis])

  const handlePreferenceChange = useCallback(async (
    apiId: string, 
    preferenceType: string, 
    value: boolean
  ) => {
    try {
      const response = await fetch('/api/apis/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiId, preferenceType, value }),
      })

      if (response.ok) {
        setApis(prev => prev.map(api => 
          api.id === apiId 
            ? { ...api, [preferenceType === 'lock' ? 'isLocked' : 'isIgnored']: value }
            : api
        ))
      } else {
        setError('Failed to update preference. Please try again.')
      }
    } catch (err) {
      console.error('Failed to update preference:', err)
      setError('Something went wrong updating preference.')
    }
  }, [])

  const handleBulkAction = useCallback(async (
    action: 'lock' | 'ignore' | 'reset', 
    value: boolean
  ) => {
    if (selectedApis.length === 0) return

    setBulkActionLoading(true)
    setError('')

    try {
      const promises = selectedApis.map(apiId =>
        fetch('/api/apis/preferences', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            apiId, 
            preferenceType: action === 'reset' ? 'reset' : action, 
            value: action === 'reset' ? false : value 
          }),
        })
      )

      const responses = await Promise.all(promises)
      const allSuccessful = responses.every(response => response.ok)

      if (allSuccessful) {
        setApis(prev => prev.map(api => {
          if (selectedApis.includes(api.id)) {
            if (action === 'reset') {
              return { ...api, isLocked: false, isIgnored: false }
            }
            return { 
              ...api, 
              [action === 'lock' ? 'isLocked' : 'isIgnored']: value,
              [action === 'lock' ? 'isIgnored' : 'isLocked']: false // Reset opposite preference
            }
          }
          return api
        }))
        setSelectedApis([])
      } else {
        setError('Failed to update some preferences. Please try again.')
      }
    } catch (err) {
      console.error('Failed to update bulk preferences:', err)
      setError('Something went wrong updating preferences.')
    } finally {
      setBulkActionLoading(false)
    }
  }, [selectedApis])

  const clearSelection = useCallback(() => {
    setSelectedApis([])
  }, [])

  const clearFilters = useCallback(() => {
    setSearchTerm('')
    setCategoryFilter('')
  }, [])

  return {
    // Data
    apis,
    filteredApis,
    categories,
    
    // State
    loading,
    error,
    selectedApis,
    bulkActionLoading,
    
    // Filters
    searchTerm,
    categoryFilter,
    sortBy,
    
    // Stats
    stats,
    
    // Selection helpers
    isAllSelected,
    isIndeterminate,
    
    // Actions
    setSearchTerm,
    setCategoryFilter,
    setSortBy,
    handleSelectApi,
    handleSelectAll,
    handlePreferenceChange,
    handleBulkAction,
    clearSelection,
    clearFilters
  }
}