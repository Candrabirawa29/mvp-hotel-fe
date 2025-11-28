// hooks/useTableFilters.js
import { useState, useCallback, useEffect } from 'react'

export function useTableFilters(
  fetchFunction, // Function to fetch data
  initialFilters = {}, // Initial filter state
  initialPagination = { pageIndex: 0, pageSize: 10 }
) {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  const [pagination, setPagination] = useState(initialPagination)
  const [pageMeta, setPageMeta] = useState({
    current_page: 1,
    last_page: 1,
    total: 0,
    per_page: initialPagination.pageSize,
  })
  const [filters, setFilters] = useState(initialFilters)

  // ✅ Generic fetch function
  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      const apiPage = pagination.pageIndex + 1

      // ✅ Clean filters - remove empty/null values
      const cleanFilters = Object.fromEntries(
        Object.entries(filters).filter(([key, value]) => {
          if (key === 'search') return value !== "" && value !== null
          if (Array.isArray(value)) return value.length > 0
          return value !== null && value !== undefined
        })
      )

      console.log('🔍 Fetching data with:', {
        page: apiPage,
        pageSize: pagination.pageSize,
        rawFilters: filters,
        cleanFilters: cleanFilters
      })

      // ✅ Call the provided fetch function
      const res = await fetchFunction(apiPage, cleanFilters, pagination.pageSize)

      // ✅ Handle different response structures
      const responseData = res.users || res.hotels || res.bedTypes ||res.roomTypes || res.data || []
      const responseMeta = res.meta

      setData(responseData)
      setPageMeta(responseMeta)

      console.log('📊 Data fetched successfully:', {
        totalItems: responseData.length,
        totalFound: responseMeta.total,
        currentPage: responseMeta.current_page,
      })

    } catch (err) {
      console.error("❌ Error fetching data:", err)
      setError(err.message || 'Failed to fetch data')
      setData([])
      setPageMeta({
        current_page: 1,
        last_page: 1,
        total: 0,
        per_page: pagination.pageSize,
      })
    } finally {
      setLoading(false)
    }
  }, [pagination.pageIndex, pagination.pageSize, filters, fetchFunction])

  // ✅ Fetch data when dependencies change
  useEffect(() => {
    fetchData()
  }, [fetchData])

  // ✅ Handle filter changes (from search or filter components)
  const handleFiltersChange = useCallback((newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }))
    // Reset to first page when filters change
    setPagination(prev => ({ ...prev, pageIndex: 0 }))
    setData([]) // Clear data to show loading
  }, [])

  // ✅ Handle complete filter replacement
  const handleFiltersReplace = useCallback((newFilters) => {
    setFilters(newFilters)
    setPagination(prev => ({ ...prev, pageIndex: 0 }))
    setData([])
  }, [])

  // ✅ Handle pagination changes from TanStack Table
  const handlePaginationChange = useCallback((updater) => {
    setPagination(prev => {
      const newPagination = typeof updater === 'function' ? updater(prev) : updater

      // If pageSize changes, reset to first page
      if (newPagination.pageSize !== prev.pageSize) {
        return { ...newPagination, pageIndex: 0 }
      }

      return newPagination
    })
  }, [])

  // ✅ Refresh data (for after delete/update operations)
  const refreshData = useCallback(() => {
    fetchData()
  }, [fetchData])

  // ✅ Reset filters to initial state
  const resetFilters = useCallback(() => {
    setFilters(initialFilters)
    setPagination(initialPagination)
    setData([])
  }, [initialFilters, initialPagination])

  return {
    // Data state
    data,
    loading,
    error,
    
    // Pagination state
    pagination,
    pageMeta,
    
    // Filter state
    filters,
    
    // Handler functions
    handleFiltersChange,
    handleFiltersReplace, 
    handlePaginationChange,
    refreshData,
    resetFilters,
    
    // Utility functions
    fetchData,
  }
}