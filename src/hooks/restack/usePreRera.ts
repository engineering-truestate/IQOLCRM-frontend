import { useSelector, useDispatch } from 'react-redux'
import { useCallback } from 'react'
import type { RootState, AppDispatch } from '../../store'
import type { PreReraProperty, PreReraPropertyFilters } from '../../store/reducers/restack/preReraTypes'
import {
    fetchPreReraProperties,
    addPreReraProperty,
    updatePreReraProperty,
    deletePreReraProperty,
    getPreReraPropertyById,
    searchPreReraProperties,
    selectProperty,
    clearSelectedProperty,
    setFilters,
    clearFilters,
    clearErrorState,
} from '../../store/actions/restack/preReraActions'

export const usePreRera = () => {
    const dispatch = useDispatch<AppDispatch>()

    // Selectors
    const properties = useSelector((state: RootState) => state.preRera.properties)
    const selectedProperty = useSelector((state: RootState) => state.preRera.selectedProperty)
    const loading = useSelector((state: RootState) => state.preRera.loading)
    const error = useSelector((state: RootState) => state.preRera.error)
    const filters = useSelector((state: RootState) => state.preRera.filters)

    // Action dispatchers
    const fetchProperties = useCallback(
        (filters?: PreReraPropertyFilters) => {
            return dispatch(fetchPreReraProperties(filters))
        },
        [dispatch],
    )

    const addProperty = useCallback(
        (propertyData: Omit<PreReraProperty, 'projectId' | 'createdAt' | 'updatedAt'>) => {
            return dispatch(addPreReraProperty(propertyData))
        },
        [dispatch],
    )

    const updateProperty = useCallback(
        (projectId: string, updates: Partial<PreReraProperty>) => {
            return dispatch(updatePreReraProperty({ projectId, updates }))
        },
        [dispatch],
    )

    const deleteProperty = useCallback(
        (projectId: string) => {
            return dispatch(deletePreReraProperty(projectId))
        },
        [dispatch],
    )

    const getPropertyById = useCallback(
        (projectId: string) => {
            return dispatch(getPreReraPropertyById(projectId))
        },
        [dispatch],
    )

    const searchProperties = useCallback(
        (searchTerm: string) => {
            return dispatch(searchPreReraProperties(searchTerm))
        },
        [dispatch],
    )

    const selectPropertyAction = useCallback(
        (property: PreReraProperty) => {
            dispatch(selectProperty(property))
        },
        [dispatch],
    )

    const clearSelectedPropertyAction = useCallback(() => {
        dispatch(clearSelectedProperty())
    }, [dispatch])

    const setFiltersAction = useCallback(
        (filters: PreReraPropertyFilters) => {
            dispatch(setFilters(filters))
        },
        [dispatch],
    )

    const clearFiltersAction = useCallback(() => {
        dispatch(clearFilters())
    }, [dispatch])

    const clearError = useCallback(() => {
        dispatch(clearErrorState())
    }, [dispatch])

    // Computed values
    const hasProperties = properties.length > 0
    const isLoading = loading
    const hasError = !!error

    // Filter helpers
    const getFilteredProperties = useCallback(
        (customFilters?: PreReraPropertyFilters) => {
            const activeFilters = customFilters || filters
            if (!activeFilters || Object.keys(activeFilters).length === 0) {
                return properties
            }

            return properties.filter((property: PreReraProperty) => {
                // Apply filters
                if (activeFilters.projectType && property.projectType !== activeFilters.projectType) {
                    return false
                }
                if (activeFilters.status && property.status !== activeFilters.status) {
                    return false
                }
                if (activeFilters.developerTier && property.developerTier !== activeFilters.developerTier) {
                    return false
                }
                if (activeFilters.district && property.district !== activeFilters.district) {
                    return false
                }
                if (activeFilters.zone && property.zone !== activeFilters.zone) {
                    return false
                }
                if (activeFilters.micromarket && property.micromarket !== activeFilters.micromarket) {
                    return false
                }
                if (activeFilters.khataType && property.khataType !== activeFilters.khataType) {
                    return false
                }
                if (activeFilters.configurations && !property.configurations.includes(activeFilters.configurations)) {
                    return false
                }
                if (activeFilters.location) {
                    const locationLower = activeFilters.location.toLowerCase()
                    const matchesLocation =
                        property.address.toLowerCase().includes(locationLower) ||
                        property.micromarket.toLowerCase().includes(locationLower) ||
                        property.district.toLowerCase().includes(locationLower)
                    if (!matchesLocation) {
                        return false
                    }
                }

                return true
            })
        },
        [properties, filters],
    )

    // Statistics
    const getPropertyStats = useCallback(() => {
        return {
            total: properties.length,
            active: properties.filter((p: PreReraProperty) => p.status === 'active').length,
            residential: properties.filter((p: PreReraProperty) => p.projectType === 'residential').length,
            commercial: properties.filter((p: PreReraProperty) => p.projectType === 'commercial').length,
            byDeveloperTier: {
                A: properties.filter((p: PreReraProperty) => p.developerTier === 'A').length,
                B: properties.filter((p: PreReraProperty) => p.developerTier === 'B').length,
                C: properties.filter((p: PreReraProperty) => p.developerTier === 'C').length,
            },
        }
    }, [properties])

    return {
        // State
        properties,
        selectedProperty,
        loading: isLoading,
        error,
        filters,

        // Computed
        hasProperties,
        hasError,
        filteredProperties: getFilteredProperties(),
        propertyStats: getPropertyStats(),

        // Actions
        fetchProperties,
        addProperty,
        updateProperty,
        deleteProperty,
        getPropertyById,
        searchProperties,
        selectProperty: selectPropertyAction,
        clearSelectedProperty: clearSelectedPropertyAction,
        setFilters: setFiltersAction,
        clearFilters: clearFiltersAction,
        clearError,

        // Helpers
        getFilteredProperties,
        getPropertyStats,
    }
}

export default usePreRera
