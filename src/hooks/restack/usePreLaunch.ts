import { useSelector, useDispatch } from 'react-redux'
import type { RootState, AppDispatch } from '../../store'
import {
    fetchPreLaunchProperties,
    addPreLaunchProperty,
    updatePreLaunchProperty,
    deletePreLaunchProperty,
    selectProperty,
    clearSelectedProperty,
    setFilters,
    clearFilters,
    clearErrorState,
} from '../../store/actions/restack/preLaunchActions'
import type { Property, PropertyFilters } from '../../store/reducers/restack/types'

/**
 * Custom hook for managing pre-launch properties state and actions
 */
export const usePreLaunch = () => {
    const dispatch = useDispatch<AppDispatch>()

    // Select pre-launch state from Redux store
    const { properties, selectedProperty, loading, error, filters } = useSelector((state: RootState) => state.preLaunch)

    // Action creators
    const actions = {
        /**
         * Fetch all pre-launch properties with optional filters
         */
        fetchProperties: (filters?: PropertyFilters) => {
            return dispatch(fetchPreLaunchProperties(filters))
        },

        /**
         * Add a new pre-launch property
         */
        addProperty: (propertyData: Omit<Property, 'projectId' | 'createdAt' | 'lastUpdated'>) => {
            return dispatch(addPreLaunchProperty(propertyData))
        },

        /**
         * Update an existing pre-launch property
         */
        updateProperty: (projectId: string, updates: Partial<Property>) => {
            return dispatch(updatePreLaunchProperty({ projectId, updates }))
        },

        /**
         * Delete a pre-launch property
         */
        deleteProperty: (projectId: string) => {
            return dispatch(deletePreLaunchProperty(projectId))
        },

        /**
         * Select a property for detailed view
         */
        selectProperty: (property: Property) => {
            dispatch(selectProperty(property))
        },

        /**
         * Clear the selected property
         */
        clearSelectedProperty: () => {
            dispatch(clearSelectedProperty())
        },

        /**
         * Set filters for property list
         */
        setFilters: (filters: PropertyFilters) => {
            dispatch(setFilters(filters))
        },

        /**
         * Clear all filters
         */
        clearFilters: () => {
            dispatch(clearFilters())
        },

        /**
         * Clear error state
         */
        clearError: () => {
            dispatch(clearErrorState())
        },
    }

    // Computed values
    const filteredProperties = properties.filter((property) => {
        if (filters.projectType && property.projectType !== filters.projectType) {
            return false
        }
        if (filters.stage && property.stage !== filters.stage) {
            return false
        }
        if (filters.status && property.status !== filters.status) {
            return false
        }
        if (filters.location && !property.address.toLowerCase().includes(filters.location.toLowerCase())) {
            return false
        }
        if (filters.priceRange) {
            const price = property.pricePerSqft
            if (price < filters.priceRange.min || price > filters.priceRange.max) {
                return false
            }
        }
        return true
    })

    const computed = {
        /**
         * Get properties filtered by current filters
         */
        filteredProperties,

        /**
         * Get total count of properties
         */
        totalProperties: properties.length,

        /**
         * Get count of filtered properties
         */
        filteredCount: filteredProperties.length,

        /**
         * Check if any filters are active
         */
        hasActiveFilters: Object.keys(filters).length > 0,

        /**
         * Get unique project types for filter options
         */
        projectTypes: [...new Set(properties.map((p) => p.projectType))],

        /**
         * Get unique stages for filter options
         */
        stages: [...new Set(properties.map((p) => p.stage))],

        /**
         * Get unique statuses for filter options
         */
        statuses: [...new Set(properties.map((p) => p.status))],

        /**
         * Get price range for filter options
         */
        priceRange:
            properties.length > 0
                ? {
                      min: Math.min(...properties.map((p) => p.pricePerSqft)),
                      max: Math.max(...properties.map((p) => p.pricePerSqft)),
                  }
                : { min: 0, max: 0 },
    }

    return {
        // State
        properties,
        selectedProperty,
        loading,
        error,
        filters,

        // Actions
        ...actions,

        // Computed values
        ...computed,
    }
}

export default usePreLaunch
